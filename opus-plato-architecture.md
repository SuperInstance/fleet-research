Excellent research document. Here's the architecture.

---

## The PLATO Answer: Shared Common Over HTTP

`★ Insight ─────────────────────────────────────`
The original PLATO engineers didn't invent a coordination protocol. They used what they had: shared memory with ownership conventions. The 2026 equivalent is: **PLATO server IS the shared memory. HTTP IS the bus. Ownership IS the protocol.**
`─────────────────────────────────────────────────`

### The Architecture in One Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                 PLATO Server (147.224.38.131:8847)                │
│                     "The Shared Common"                          │
│                                                                  │
│  Room: /fleet/state/forgemaster   ← Forgemaster writes, all read │
│  Room: /fleet/state/oracle1       ← Oracle1 writes, all read     │
│  Room: /fleet/state/jetsonclaw1   ← JetsonClaw1 writes, all read │
│  Room: /fleet/merged              ← ANY node writes merged view  │
│                                                                  │
│  Each "state tile" = serialized ConstraintState delta            │
└──────────────┬───────────────┬───────────────┬───────────────────┘
               │               │               │
          GET/POST         GET/POST         GET/POST
          (polling)        (polling)        (polling)
               │               │               │
┌──────────────┴──┐  ┌────────┴────────┐  ┌──┴──────────────────┐
│   Forgemaster   │  │    Oracle1      │  │    JetsonClaw1      │
│   WSL2 x86-64   │  │  ARM64 Oracle   │  │   Jetson edge       │
│   RTX 4050      │  │  Cloud          │  │                     │
│                 │  │                 │  │                     │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────────┐ │
│ │ constraint  │ │  │ │ constraint  │ │  │ │ constraint-crdt │ │
│ │ -crdt       │ │  │ │ -crdt       │ │  │ │ (Bloom only,    │ │
│ │ (full)      │ │  │ │ (full)      │ │  │ │  12KB state)    │ │
│ ├─────────────┤ │  │ ├─────────────┤ │  │ └─────────────────┘ │
│ │ constraint  │ │  │ │ TTL engine  │ │  │                     │
│ │ -theory-llvm│ │  │ │ (expiry as  │ │  │  Sensors → tiles    │
│ │ (AVX-512    │ │  │ │  emergence) │ │  │  Edge inference     │
│ │  compile)   │ │  │ └─────────────┘ │  │                     │
│ ├─────────────┤ │  │                 │  └─────────────────────┘
│ │ CUDA Bloom  │ │  │  TTL expiry →   │
│ │ merge (3    │ │  │  constraint      │
│ │ SASS instr) │ │  │  tiles           │
│ └─────────────┘ │  └─────────────────┘
└─────────────────┘
```

### What Code to Write: 3 Things

**Thing 1: The Gossip Loop (one Rust binary, ~200 lines)**

This is the only new code. A single async loop per node:

```rust
// fleet-gossip/src/main.rs — runs on every node
use constraint_crdt::{ConstraintState, Merge};
use std::time::Duration;

struct FleetNode {
    id: &'static str,                    // "forgemaster" | "oracle1" | "jetsonclaw1"
    plato_url: &'static str,             // "http://147.224.38.131:8847"
    local_state: ConstraintState,         // My private common
    peers: &'static [&'static str],       // Other node IDs
    tick_interval: Duration,              // The PLATO timestep
}

impl FleetNode {
    /// The entire protocol. This is it.
    async fn tick(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // 1. WRITE my state to my room (single-writer principle)
        let delta = self.local_state.delta_since_last_sync();
        let tile = serde_json::to_vec(&delta)?;
        reqwest::Client::new()
            .post(format!("{}/submit", self.plato_url))
            .json(&SubmitRequest {
                room_id: format!("fleet/state/{}", self.id),
                domain: "fleet-state".into(),
                question: format!("state-{}", chrono::Utc::now().timestamp()),
                answer: base64::encode(&tile),
                tags: vec!["state-delta".into()],
            })
            .send().await?;

        // 2. READ peer states (atomic read — just HTTP GET)
        for peer in self.peers {
            let resp: Vec<Tile> = reqwest::get(
                format!("{}/room/fleet/state/{}/tiles?limit=1", self.plato_url, peer)
            ).await?.json().await?;

            if let Some(latest) = resp.first() {
                let peer_delta: ConstraintState = 
                    serde_json::from_slice(&base64::decode(&latest.answer)?)?;
                // 3. MERGE (semilattice join — commutative, idempotent)
                self.local_state.merge(peer_delta);
            }
        }
        Ok(())
    }
}

#[tokio::main]
async fn main() {
    let mut node = FleetNode {
        id: "forgemaster",
        plato_url: "http://147.224.38.131:8847",
        local_state: ConstraintState::default(),
        peers: &["oracle1", "jetsonclaw1"],
        tick_interval: Duration::from_secs(30),  // PLATO timestep
    };

    loop {
        node.tick().await.unwrap_or_else(|e| eprintln!("tick failed: {}", e));
        tokio::time::sleep(node.tick_interval).await;
    }
}
```

That's the distributed system. No message queue. No service discovery. No consensus. The CRDT merge is the consensus.

`★ Insight ─────────────────────────────────────`
This is literally the PLATO IV shared common pattern:
- `POST /submit` = writing to `NSTATE(MY_ID * 10 + k)`
- `GET /room/.../tiles` = reading `NSTATE(OTHER_ID * 10 + k)`
- `merge()` = the `MAX` operation that makes it a semilattice
- The 30-second tick = the game timestep in Empire (1973)

PLATO's engineers would recognize this code instantly.
`─────────────────────────────────────────────────`

**Thing 2: State Hash Short-Circuit (add to constraint-crdt, ~30 lines)**

The flag-based coordination from PLATO: don't transfer state if nothing changed.

```rust
// Add to constraint-crdt/src/lib.rs
impl ConstraintState {
    /// 8-byte hash for flag-based coordination.
    /// PLATO used a single 60-bit flag word. We use 64 bits.
    pub fn state_hash(&self) -> u64 {
        // Hash the Bloom filter — it's already a compressed summary
        let mut h = 0u64;
        for word in &self.bloom.bits {
            h ^= word.wrapping_mul(0x517cc1b727220a95); // FNV-style
        }
        h
    }
}
```

Then the gossip loop becomes:

```rust
// Before fetching full state, check the hash
let peer_hash: u64 = reqwest::get(
    format!("{}/room/fleet/hash/{}", self.plato_url, peer)
).await?.json().await?;

if peer_hash != self.last_seen_hash[peer] {
    // Hashes differ — fetch and merge
    // ... (same as above)
    self.last_seen_hash.insert(peer, peer_hash);
}
// Hashes match — skip. PLATO flag-based coordination.
```

**Thing 3: Per-Node Specialization (config, not code)**

Each node runs the same binary but with different features enabled:

| Node | `tick_interval` | Extra work during tick | Why |
|------|----------------|----------------------|-----|
| Forgemaster | 30s | CUDA Bloom merge (3 SASS instr), AVX-512 constraint compile | Has the GPU + fast CPU |
| Oracle1 | 60s | TTL expiry scan → emit "expired" tiles as emergence signals | Always-on, owns TTL logic |
| JetsonClaw1 | 120s | Bloom-only state (12KB), sensor → tile pipeline | Edge device, bandwidth-limited |

```toml
# fleet-gossip.toml (per node)
[node]
id = "forgemaster"
plato_url = "http://147.224.38.131:8847"
tick_interval_secs = 30
peers = ["oracle1", "jetsonclaw1"]

[features]
cuda_bloom_merge = true    # Only on Forgemaster
ttl_expiry_scan = false
bloom_only_mode = false

[constraints]
max_state_size_bytes = 65536  # 64KB cap on state tiles
max_delta_age_secs = 300      # Discard deltas older than 5 min
```

### What Runs Where

```
Forgemaster (WSL2):
  └─ fleet-gossip (tick=30s)
     ├─ constraint-crdt (full: Bloom + Sketch + Decay + Geometric)
     ├─ constraint-theory-llvm (AVX-512 constraint compilation)
     └─ CUDA kernel: bloom_merge<<<1,256>>>(dst, src)  // 3 instructions

Oracle1 (ARM64):
  └─ fleet-gossip (tick=60s)
     ├─ constraint-crdt (full)
     └─ TTL engine: scan expired constraints → POST emergence tiles

JetsonClaw1 (Jetson):
  └─ fleet-gossip (tick=120s)
     ├─ constraint-crdt (Bloom only, 12KB)
     └─ Sensor pipeline: readings → constraint tiles

PLATO Server (147.224.38.131:8847):
  └─ plato-engine (already running)
     └─ No changes needed. It's just storage.
```

### What Talks to What

```
Forgemaster ──HTTP POST──→ PLATO /fleet/state/forgemaster
Forgemaster ←─HTTP GET───  PLATO /fleet/state/oracle1
Forgemaster ←─HTTP GET───  PLATO /fleet/state/jetsonclaw1

Oracle1     ──HTTP POST──→ PLATO /fleet/state/oracle1
Oracle1     ←─HTTP GET───  PLATO /fleet/state/forgemaster
Oracle1     ←─HTTP GET───  PLATO /fleet/state/jetsonclaw1

JetsonClaw1 ──HTTP POST──→ PLATO /fleet/state/jetsonclaw1
JetsonClaw1 ←─HTTP GET───  PLATO /fleet/state/forgemaster
JetsonClaw1 ←─HTTP GET───  PLATO /fleet/state/oracle1
```

Star topology. PLATO is the hub. Every node talks ONLY to PLATO. Nodes never talk to each other directly. This is exactly how CDC KRONOS worked — the PPs (nodes) talked to central memory (PLATO), never to each other.

### Why This Is Enough

The CRDT properties guarantee correctness:

| Property | Guarantee | Mechanism |
|----------|-----------|-----------|
| **Commutativity** | Order of merges doesn't matter | `merge(A, B) == merge(B, A)` — Bloom OR is commutative |
| **Idempotence** | Double-merge is harmless | `merge(A, A) == A` — OR with self is identity |
| **Convergence** | All nodes reach same state | Semilattice has a unique least upper bound |
| **Partition tolerance** | Node goes offline? Fine. | It merges when it comes back. Delta accumulates. |
| **No coordination** | No locks, no leader | Single-writer + atomic reads = no conflicts possible |

If JetsonClaw1 goes offline for an hour, it misses ticks. When it comes back, it reads the latest state tiles, merges, and converges. The Bloom OR absorbs everything it missed. This is exactly what happened when a PLATO terminal went down — the student reconnected and their shared common was still there.

### What PLATO's Engineers Would Have Done

Exactly this. They would have:
1. Used what they had (HTTP, not gRPC)
2. Put shared state in one place (PLATO server, not distributed)
3. Given each node ownership of its writes (single-writer)
4. Polled on a timer (timestep, not event-driven)
5. Used the simplest merge that's correct (bitwise OR)

The total new code is ~250 lines of Rust. One binary. One config file per node. No new infrastructure. The PLATO server you already have IS the infrastructure.

`★ Insight ─────────────────────────────────────`
The 1960s insight that survives: **the simplest correct distributed system is a shared bulletin board with ownership conventions**. PLATO's shared common was a bulletin board. Your PLATO tile server is a bulletin board. CRDTs prove the bulletin board pattern is mathematically correct. Everything else — Paxos, Raft, service meshes — is optimization for scale you don't have and may never need.
`─────────────────────────────────────────────────`
