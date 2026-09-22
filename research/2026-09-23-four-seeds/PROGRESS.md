# PROGRESS — research/2026-09-23-four-seeds/

Lane: the four seeds (F5-TTS, encodec-pytorch, StarBench, UniRL), all forked
into SuperInstance on 2026-09-22. Casey's ask: deep-research all four, rebuild
them for our systems under fleet names, and write onboarding documentation
aimed at **agents**, not humans. StarBench is the flagship (~40% of budget).

## Status

| # | Deliverable | Lines | State |
|---|---|---|---|
| 1 | `starbench-evolution.md` (flagship) | ~200 | drafted |
| 2 | `voice-stack.md` | ~120 | drafted |
| 3 | `unirl-adaptation.md` | ~100 | drafted |
| 4 | `four-repos-unified.md` (abstraction + agent onboarding) | ~80 | drafted |
| 5 | `RENAME.md` (fleet register + collision checks) | — | done |

Branch `four-seeds-research` → PR to `SuperInstance/fleet-research` main.

## Verification log

Every load-bearing number below was produced by a command run in this lane,
not copied from a prompt. Raw sources cloned shallow into `../src/`.

### Bytes law (the canary)

```
$ node -e '<fnv1a over UTF-8 bytes>'
canary input : "café Δ 日本語"
utf8 bytes   : 18
fnv1a-64     : 0x24a555471370b18d
claimed      : 0x024a555471370b18d
```

**Resolved.** The canary is *numeric*, and `format(h,"016x")` never emits a
leading zero, so the canonical string spelling is `0x24a555471370b18d` (16 hex
digits) while the docs pin `0x024a555471370b18d` (17 hex digits). Both are the
same integer. `kev-substrate-competition/harness/hashutil.py:9-12` already
flags this ("Gotcha (scout K #6)"); `duke-lab/jev-receipts.js` still carries
the 17-digit spelling in its header comment. Comparisons must be numeric.

Corroborated independently:

```
$ node -e '...ord-per-codepoint loop...'
0x77ff2029b867f2b5   // FAILS the pin — the classic bytes-law trap
```

UTF-8 bytes, not code points. This is the single most important
interop fact any agent touching fleet hashes must know.

### Kernel primitive count (correction to the lane brief)

The brief said "quilt kernel: 6 opcodes". Measured:

```
$ grep -n '^class ' quilt/quilt-kernel.py
22:class Zin:        32:class Zout:       42:class Jepa:
64:class DoubleEntry:82:class Vibe:       97:class Gc:
112:class Murmur:    128:class Graph:     138:class Kernel
```

**8 primitives** (`Zin, Zout, Jepa, DoubleEntry, Vibe, Gc, Murmur, Graph`) +
1 `Kernel` that advances the cell — quilt-kernel.py:8 says "ties all 8
primitives into one process". Six is not what ships. (Substrate-foundation, a
different repo, claims 11 opcodes; FLUX-ISA claims 256.) Downstream documents
should say **8 primitives** for the quilt kernel.

### The twist instrument

`candor/candor.mjs:44` — `TwistField(points, {sigmaScale=0.24, gridScale=0.6})`,
law vendored verbatim from `quilt-studio @8a19d1e
packages/quilt-floor/src/twistfield.mjs`.

- **σ = 0.24·s** and **grid = 0.6·s**, where `s` = mean nearest-neighbour
  spacing. **s is a distance, not seconds.** The brief's "sigma=0.24s,
  grid=0.6s" reads as a time constant; it is a spatial constant expressed in
  units of the material's own spacing. Agents quoting this as "0.24 seconds"
  are wrong.
- Twist regime: `REGIME = {from: 0.15, to: 6, step: 0.25}` degrees.
- Signatures: `flatness >= 0.75` → **flat** (costume);
  `re_twist_rate >= 0.75` → **re-twist** (lie); else **shear** (honest).
  `FLAT_SCALE = 2.0`.
- Honest error shears/holds/recovers. A lie re-twists on re-measurement
  (orientation drift without new load). A costume reads flat — absence of
  strain where strain should be.

### σ wall (duke-lab)

`duke-lab/docs/SIGMA_WALL_NAMING.md`, `duke-lab/tests/sigma-wall.test.js`:

- Honest run: K=32 descent + K=64 fresh-seed audit lands duke/purist at
  **0.0720**. Reachable.
- The shipped `convergence: 0.055` EMA gate is **not** reachable. From the
  14-round series in SIGMA_WALL_NAMING.md:57-59:
  `min round σ=0.0556, min EMA=0.0739, gate=0.055, reachable=NO`.
  α=0.35 EMA floors at ~0.074. The tests knew (test line 99 asserts
  `minEma > 0.055`).
- Cheap K=8 descent reads 0.06–0.10; K=32 audits read 0.088–0.139.
  K=8 flatters by roughly 0.02–0.05 σ.

### Witness chain (the receipt)

`kev-substrate-competition/harness/witness.py:6-28` — JSONL, one object per
line. Required keys: `conv_id, cell_id, tick, state_json, answers_json,
prev_hash, cell_hash`. Optional: `metrics{}`, `prediction{}`.

- `state_json` / `answers_json` are **verbatim serialized strings**, not
  objects — replaying serialization is where interop dies (hashutil.py:50-51).
- `cell_hash = hash16(cell_id + state_json + answers_json + prev_hash)`.
- Genesis `prev_hash = "0x" + "0"*16`.
- "F5 doctrine: metrics without a verifiable chain are withdrawals."

**Naming collision, discovered not assumed:** in the fleet's own gates,
`F5` is already a *term of art meaning withdrawal* —
`gates.py:6` "Broken chain = withdrawal (F5)", `gates.py:29` "a metric without
a chain is a withdrawal (F5)". The TTS fork is named **F5-TTS**. Keeping that
name would put a receipt-chain failure code in the same namespace as a voice
model. See RENAME.md.

### Gates

`gates.py:23-37` — Gate #0 canary (hash function agrees with substrate on the
pinned vector; on failure *every later verdict is void*), Gate #1 replay
(witness log verifies end to end). A broken chain is a withdrawal, not a low
score. `ReplayReport.coherence` is the witness-coherence scalar.

### PLATO signal chain (hardware routing)

`AI-Writings/essays/supplements/MODEL-ECOLOGY-SUPPLEMENT.md:89-93`, verified
verbatim: sensors → **deadband** (−90%) → **350M nano** (−90%) → **LoRA
adapter** (−90%) → **fleet coordination** (−90%) → **cloud**. 1M sensor
readings/hour → 100,000 → 10,000 → 1,000 → 100 events/hour = **0.4%** of raw
data reaches the cloud. Tiers: 350M = insects (ESP32/RPi, <10ms, <1W, sensor
layer); 1.2B = birds (mobile generalists, no GPU); 70B+ = cloud (keystone).
"The cloud feeds the fleet. The fleet feeds the LoRA. The LoRA feeds the nano.
The nano feeds the deadband."

### Naming register + collisions

```
$ gh api 'search/repositories?q=org:SuperInstance+vessel+in:name' --jq .total_count
vessel 26 · tide 6 · harbor 2 · instrument 2
```

All proposed renames checked `404` against `repos/SuperInstance/<name>`:
`foghorn`, `foghorn-tts`, `shanty`, `canticle`, `tidetable`, `tide-table`,
`leadline`, `purser`, `echogram`, `plainsong-voice`, `bottle-voice`,
`tidewall`. All free as of 2026-09-23. `SuperInstance/plainsong` exists and is
live: "Plain-text music notation that compiles to MIDI."

### Chain round-trip (executed, not cited)

```
$ node -e '<fnv1a64 over UTF-8 bytes; hash16(cell_id+state_json+answers_json+prev_hash)>'
cell-0  prev 0x0000000000000000  hash 0xbdae84ef4af41855
cell-1  prev 0xbdae84ef4af41855  hash 0xb5e7ef57f598e075
cell-2  prev 0xb5e7ef57f598e075  hash 0x68e0c5eb244fdd44
tampered state_json -> recomputes 0x293667cecb58adfc  BREAKS: true
```

Genesis `prev_hash` is `0x0000000000000000` as pinned. A one-character change
to `state_json` re-derives a different `cell_hash` and the chain breaks — the
replay gate (`gates.py` Gate #1) would reject the log as a withdrawal, not
score it low.

### Voice stack integration surface

`sunset-ecosystem/voice/soniqo_bridge.py`:
- `VoiceTile(tile_id, room_id, speaker, transcript, audio_hash, duration_ms,
  confidence, timestamp, metadata)` — **`audio_hash` defaults to the literal
  string `"mock"`** (line 147). No real audio is ever hashed today.
- `SoniqoBridge` plugs three engines: `soniqo.ASR()`, `soniqo.TTS()`,
  `soniqo.VAD()`. With the SDK absent, all three fall back to `_MockASR /
  _MockTTS / _MockVAD`. `_MockTTS.synthesize` returns `bytes(32000)` — 16000
  Hz × 2 bytes × 1 s. **The bridge's implied PCM convention is 16 kHz mono
  16-bit.** F5-TTS natively outputs 24 kHz; a resample is mandatory.
- `sunset-ecosystem/docs/ARCHITECTURE-v2.md:66`: "Every voice interaction is
  captured as a VoiceTile with transcript, audio hash, and metadata. Voice is
  not an add-on; it's a core tile type."
- Known gap, `audit/test_refactor_plan.md:206`:
  `perception/audio_capture.py ↔ voice/soniqo_bridge.py — No end-to-end audio
  pipeline test`.

### Voice stack (measured, incl. two downloaded checkpoints)

`shanty` (encodec-pytorch) — Meta EnCodec vendored flat (verbatim Meta
copyright headers); the fork's own contribution is the training harness.

```
$ git ls-files | grep -E '\.(pth|pt|ckpt|th|bin|safetensors)$'
(no output)   ← NO WEIGHTS IN GIT
```

| | Meta `encodec_24khz-d7cc33bc.th` | community `zkniu/encodec-pytorch` |
|---|---|---|
| bytes | 93,171,529 | 93,226,649 |
| tensors | 252 | 288 |
| needs | `causal=True, norm='weight_norm'` | `causal=False, norm='time_group_norm'` |

Both load `strict=True` → all keys matched. **Not interchangeable**, and the
shipped `config/config.yaml` (`causal: True, weight_norm`) matches Meta's,
not the author's released artifact — the config is stale.

Token economics, verified by instantiating and running the model:
`hop_length 320` → `frame_rate 75` @24 kHz; `bits_per_codebook 10` →
`0.75 kbps/quantizer` → **tokens/sec = 75 × n_q**:
1.5 kbps → 150 · 6 kbps → 600 · 24 kbps → 2400.
A 10 s utterance at 6 kbps is **6,000 tokens / 12 KB**.
Serialization hashed 3× identical (in-process): token stream is
deterministic. Cross-device (CPU↔CUDA) bit-exactness **not** verified.

Two bugs: `model.py:341,360` `torch.load` without `map_location='cpu'` →
crashes any CPU-only host; `encodec_model_bw()` dead path → `TypeError`.

`foghorn` (F5-TTS): 24,000 Hz, 100 mel, hop 256 → **93.75 frames/s**. DiT
22×1024 = **336M**; `F5TTS_Small` 768/18/12. RTF 0.1467 @32 NFE → 0.0394 @16
NFE (Triton) → 0.0239 @8 NFE. LibriSpeech-PC test-clean WER 1.83 / SIM 0.673.
Trained on Emilia 95 k h / 49.6 k speakers. **Code MIT, checkpoints
CC-BY-NC-4.0** — the latter is a hard commercial-use blocker, flagged in
voice-stack.md.

**Sample-rate mismatch, measured not assumed:** the bridge's
`_MockTTS.synthesize` returns `bytes(32000)` = 16 kHz × 2 B × 1 s, while F5
outputs 24 kHz. A resample is mandatory or `duration_ms` is wrong by 1.5×.

## Corrections to the lane brief

1. Quilt kernel has **8 primitives**, not 6 opcodes.
2. Twist **σ/grid are multiples of the spatial spacing s**, not seconds.
3. The canary's 17-hex-digit spelling is a doc artifact; canonical string form
   is 16 digits. Numeric comparison only.
4. **F5 already means "withdrawal"** in fleet gates — direct collision with
   the F5-TTS fork name.
5. StarBench's "audio 4D intelligence" gloss is **upstream's own, and is
   correct** — README line 59. Not a fleet invention.
6. **"10% reconstruction loss reduction" is not in the EnCodec paper** (every
   percentage enumerated; no match), and **"90× compression" is DAC's number,
   not EnCodec's**. The paper's real claims: LM entropy coding buys up to 40%
   further compression (3 kbps → 1.9 kbps); the loss balancer is the named
   contribution; SOTA at 1.5/3/6/12 kbps @24 kHz.
7. **encodec-pytorch ships no weights in git** — zero weight files tracked.
   Both Meta's and the community checkpoint load, but they are not
   interchangeable (252 vs 288 tensors, different norm config).
8. StarBench's 76 MB is **git history**, not data: 72.63 MiB of *deleted*
   demo audio under `static/audios/`. HEAD is ~21 MB and the harness is
   156 KB.
9. StarBench is **not** an agent benchmark — `models/base.py` is one
   `generate_inner(msgs)`, no tools, no trace capture. "Repurposing its agent
   loop" is not available; the reusable layers are the task spec, the
   fsync'd sharded inference log, and the AA/ACR rotation scorers.
