# Constraint Theory Cluster — Research Report

Generated: 2026-05-09  
Source: 10 repos in SuperInstance org  

---

### constraint-theory-core
- **What:** Production Rust crate that maps any 2D vector to the nearest Pythagorean rational point (e.g., (3/5, 4/5)) where a²+b²=c² holds in exact integers, not floats. Published on crates.io.
- **Unique insight:** Finite lattice of exact rational points on the unit circle, indexed by KD-tree with O(log N) lookup. Snap once → deterministic, platform-independent, exact. Replaces float approximation with integer guarantees.
- **Status:** Complete — v2.2.0, 184 tests, CI on Linux/macOS/Windows, fuzzing. Zero dependencies, `#![forbid(unsafe_code)]` on public API.
- **Proven:** Exact snapping, KD-tree spatial index, SIMD batch (AVX2, 8× f32), holonomy verification, sheaf cohomology (H⁰/H¹ in O(1)), Ricci flow, Laman rigidity (O(V²)), quantization (4 modes), hidden dimensions. Benchmarked: ~100ns snap, ~74ns/op SIMD batch, ~2.8ms manifold build.
- **Cross-references:** constraint-theory-math (proofs), constraint-theory-python (bindings), constraint-theory-web (demos), holonomy-consensus, flux-lucid, fleet-coordinate, constraint-theory-research (papers).
- **Gaps:** 2D only (Pythagorean triples are inherently 2D). ~1000 discrete states at density 200 (~0.36° angular resolution). Quantization noise is inherent — users must check returned `noise` value. SIMD path may differ from scalar (don't use SIMD for consensus-critical code).

---

### constraint-theory-math
- **What:** Mathematical proofs, conjectures, and errata underpinning the constraint theory ecosystem. Sheaf cohomology, Heyting-valued logic, GL(9) holonomy, Galois connections.
- **Unique insight:** The "honest ledger" — every claim is labeled proven/conjectured/debunked. Three core theorems: (1) INT8 is sound on [-127, 127], (2) XOR flip is a bijective order isomorphism (Coq-verified), (3) dim H⁰ = 9 on trees (global consistency needs exactly 9 parameters). Six Galois connections recognized across the system.
- **Status:** Partial — 3 theorems proven, 3 conjectures open, 1 debunked claim documented. Errata publicly maintained.
- **Proven:** INT8 soundness (§3.1), XOR isomorphism (Coq proof in `proofs/XOR-ISOMORPHISM.v`), dim H⁰ = 9 (Markdown proof), Bloom filters form Heyting algebra (§4), 6 Galois connections recognized (§6).
- **Cross-references:** constraint-theory-core (implementation), flux-lucid (9-channel vectors), holonomy-consensus, intent-directed-compilation (AVX-512), negative-knowledge, eisenstein (hex arithmetic), fleet-coordinate, polyformalism-a2a-python.
- **Gaps:** Consistency-Holonomy Correspondence (conjectured, not proven). Galois Unification Principle (conjectured). Intent-Holonomy Duality (only one direction proven). Several errata: 24-bit norm bound overflows (fixed: i32 correct), D₆ orbit count was 11 should be 13, Laman redundancy 1.5× is asymptotic only, temporal snap is not a Galois connection.

---

### constraint-theory-ecosystem
- **What:** Engineering record — 54 GPU experiments, 47 language ports, 60M differential test inputs, CUDA benchmarks, Coq proofs, and negative results. The "evaluating for production" repo.
- **Unique insight:** Complete execution pipeline: GUARD DSL → FLUX-C Bytecode (43-opcode ISA, always terminates) → GPU/ARM/FPGA → Coq proofs (15 theorems). INT8 achieves 62.2B checks/sec on RTX 4050 with zero precision loss; FP16 achieves ~50B checks/sec but 76% mismatches. The negative results are documented with equal rigor.
- **Status:** Complete — comprehensive benchmark suite, cross-language ports, formal verification.
- **Proven:** 62.2B INT8 checks/sec (zero loss), CUDA Graphs 9500B c/s, temporal 22.8B c/s, cross-sensor 14.8B c/s, streaming 4669B c/s. 30 English proofs, 15 Coq theorems, 60M differential tests (zero mismatches). FP16 unsafe past norm 2048, tensor cores barely help, bank padding counterproductive on Ada, adaptive ordering no benefit.
- **Cross-references:** constraint-theory-core, eisenstein (reference impl), flux-lucid, holonomy-consensus, fleet-coordinate, eisenstein-do178c, eisenstein-wasm, eisenstein-c, arm-neon-eisenstein-bench, pythagorean48-codes, polyformalism-a2a-python/js.
- **Gaps:** FP16 is a dead end (documented). Tensor cores don't help. No FPGA implementation yet (mentioned in pipeline but not delivered). Ports are individual repos — no unified test harness across all 47 languages.

---

### constraint-theory-llvm
- **What:** LLVM backend for constraint theory — CDCL → LLVM IR → AVX-512 with direct x86-64 emission. Also includes analog compute opcodes (spline-boundary mode for PLATO rooms).
- **Unique insight:** Bypasses LLVM for direct x86-64 emission (`emitter_x86.rs`). Includes analog compute primitives: ANALOG_SPLINE (Bézier boundary), ANALOG_WATER_LEVEL (least-squares surface), ANALOG_STORY_POLE (cumulative delta), ANALOG_SECTOR (proportional division). Spline-boundary mode claims 98% storage reduction for large rooms.
- **Status:** Partial — has SPEC.md, source files, benches, examples, tests. README is minimal (3 lines). The analog compute section describes a 5-phase R&D pipeline with phases 1-2 complete, 3-5 pending.
- **Proven:** Digital simulation passing, benchmarks measured (ANALOG_SPLINE ~2.5µs, SECTOR ~0.2µs, C² continuous). CDCL → LLVM IR pipeline exists.
- **Cross-references:** flux-lucid (depends on this crate), constraint-theory-core, holonomy-consensus.
- **Gaps:** README is skeletal — no usage examples, no architecture overview in README. Physical prototype (3D-printed) not built. JC1 edge deployment not done. Fleet messages directory exists but content unknown. JIT module exists (`jit.rs`) but unclear if functional.

---

### holonomy-consensus
- **What:** Zero Holonomy Consensus (ZHC) — distributed consensus without voting or message exchange. Uses geometric projection on Laman-rigid constraint graphs.
- **Unique insight:** Replaces ballot-box consensus with map-based consensus. If the constraint graph is Laman-rigid (E = 2V − 3), parallel transport around any holonomy-free loop returns identity. All honest agents converge to same state independently — 0 messages, no rounds, no quorum. Byzantine faults create non-zero holonomy residuals detectable by every honest agent.
- **Status:** Partial — 30+ tests passing, but no published crate. Active development. Core algorithm works, real-world deployment unclear.
- **Proven:** ZHC convergence on rigid graphs, holonomy detection (parallel transport), Byzantine fault isolation via bisection (O(log N) cycle checks). Laman rigidity check O(V²) one-time. No FLP bypass claimed — only geometric consistency.
- **Cross-references:** fleet-coordinate (built on ZHC), constraint-theory-core (184 tests), constraint-theory-math (proofs), pythagorean48-codes.
- **Gaps:** No benchmarks comparing to Raft/PBFT on real workloads. No actual distributed deployment demonstrated. FLP impossibility still holds for async crash-fault — ZHC doesn't solve that. No crate published. "30+ tests" is vague.

---

### flux-lucid
- **What:** Meta-crate tying the constraint-theory ecosystem together. 9-channel intent vectors, beam tolerance (stakes → precision), mixed-precision SoA batch execution, divergence-aware tolerance, XOR dual-path verification. Published on crates.io (v0.1.6).
- **Unique insight:** Maps stakes (physical criticality) to bit width via beam deflection math: steel→DUAL(64-bit), fiberglass→INT32, oak→INT16, rubber→INT8. SoA layout groups constraints by precision for cache-friendly AVX-512. Divergence-aware tolerance creates a feedback loop: observe drift → tighten tolerance → verify → decay.
- **Status:** Partial — v0.1.6, core features tested (precision mapping, SoA batch, divergence tolerance). Fleet consensus and JIT are scaffolding. Published on crates.io.
- **Proven:** Beam tolerance classification, SoA batch execution, divergence-aware tolerance (6 test scenarios), XOR dual-path verification, draft checking, alignment checking.
- **Cross-references:** constraint-theory-llvm (CDCL→LLVM→AVX-512), holonomy-consensus (GL(9) consensus), constraint-theory-core, eisenstein ecosystem.
- **Gaps:** Fleet consensus and JIT are scaffolding ("waiting on runtime integration layer"). `x86-64-emitter` feature requires hardware. No benchmarks published. Navigation/head-direction modules mentioned but not detailed.

---

### eisenstein-do178c
- **What:** DO-178C certification evidence for Eisenstein integer arithmetic (ℤ[ω]). 81 Coq theorems, ~24/31 Level A objectives, zero axioms, full traceability.
- **Unique insight:** The eisenstein library (600 LOC, zero unsafe, zero float, no deps) is uniquely certifiable. Four Coq proof files cover: ring axioms, norm properties, 60° rotation, determinism, INT8 soundness, differential zero properties, and XOR Galois structure. Zero axioms = no unverified assumptions.
- **Status:** Partial — 77% of Level A objectives covered (~24/31). Growing. Gap is MCDC (Modified Condition/Decision Coverage) which requires instrumented binary.
- **Proven:** 42 theorems in `eisenstein-safety.v` (ring axioms, norm multiplicativity, determinism, overflow bounds, hex disk coverage). 12 theorems in `int8-soundness.v` (INT8 bounds for |a|,|b| ≤ 4). 15 theorems in `differential-zero.v` (extraction identity, canonicalization, IEEE 754 comparison). 12 Qed + 3 admitted in `galois-xor.v` (XOR algebra, Galois homomorphism).
- **Cross-references:** eisenstein (core crate), constraint-theory-core, constraint-theory-math (INT8 soundness proof), intent-directed-compilation (AVX-512).
- **Gaps:** A-10 (MCDC) not covered — needs qualified C compiler integration. 3 admitted proofs in galois-xor.v (non-safety-critical but incomplete). No A-5 (integration testing) mentioned. No tool qualification evidence. Growing toward full Level A.

---

### intent-directed-compilation
- **What:** Semantic criticality ("stakes") drives instruction-level precision for constraint checking. The core AVX-512 technique: low-stakes → INT8 (64 per register), high-stakes → INT32/DUAL (16 per register).
- **Unique insight:** 3.17× measured speedup on AMD Ryzen AI 9 HX 370 (5-run mean, rdtsc). INT8 raw is 4.58× (exceeds 4.0× theoretical — cache effects). Zero mismatches across 100M differential tests. Break-even at 8 reuses, 12× steady-state at 10K reuses.
- **Status:** Complete — paper, benchmarks, proofs, adversarial testing. Found real bugs: INT8 overflow wrapping (4.9% mismatch, fixed), dual-path subtraction overflow (fixed with XOR, 6% faster).
- **Proven:** INT8 soundness (cast is identity on [-127, 127]), XOR dual-path (sign-bit XOR = adding 2³¹, bijective order isomorphism), dim H⁰ = 9, 3.17× speedup measured, 0/100M mismatches.
- **Cross-references:** constraint-theory-math (INT8 proof), flux-lucid (implements this technique), constraint-theory-ecosystem (GPU benchmarks), negative-knowledge.
- **Gaps:** Benchmarks are x86-only (AMD Ryzen). ARM NEON fallback mentioned but not benchmarked. No real deployment in production system. Theoretical 4.0× exceeded by cache effects — the model doesn't fully explain the 4.58× result.

---

### negative-knowledge
- **What:** Cross-domain principle: knowing where violations are NOT is the primary computational resource. Highest-rated claim (4.8/5, 92% confidence) from cross-model adversarial testing.
- **Unique insight:** Bloom filters aren't Boolean — they're Heyting-valued. Excluded middle fails: a value can be neither "definitely safe" nor "definitely unsafe". The definitive answer is always negative. Six physical domains share this pattern: immune system, brain (predictive coding), evolution, robotics, cell signaling, compiler optimization (dead code elimination).
- **Status:** Complete — paper, evidence, adversarial testing. This is a conceptual/research repo, not code.
- **Proven:** Bloom pre-filtering gives 67% "definitely safe" with zero false confirms. INT8 soundness proves absence of precision loss. Sheaf cohomology: global consistency H⁰ ≠ ∅ ≡ vanishing obstruction H¹ = 0. Cross-model rating 4.8/5 across Seed-2.0-mini, Gemma-4-26B, Hermes-405B.
- **Cross-references:** constraint-theory-math (Heyting algebra), intent-directed-compilation (INT8 soundness), constraint-theory-ecosystem (Bloom pre-filtering), sheaf-constraint-synthesis (unified view).
- **Gaps:** No implementation code — purely conceptual. Cross-domain claims (immune system, brain, evolution) are argued by analogy, not formally proven. The "primary computational resource" framing is a strong claim that needs more empirical backing beyond Bloom filters and INT8.

---

### sheaf-constraint-synthesis
- **What:** Unified synthesis document connecting constraint theory, fleet architecture, and negative knowledge. Generated by Claude Code (Sonnet 4). The "big picture" repo.
- **Unique insight:** Three-layer architecture: Semantic (9-channel IntentVector) → Trust+Intent (GL(9) gauge theory, holonomy transport) → Topological (sheaf cohomology, H⁰ computation). Intent flows from semantic meaning down to AVX-512 machine code.
- **Status:** Complete — single SYNTHESIS.md document. No code. Serves as the reading guide for the entire ecosystem.
- **Proven:** All proven results from constituent repos are aggregated here: INT8 soundness, XOR isomorphism, dim H⁰ = 9, 3.17× speedup, 0/100M mismatches, negative knowledge principle.
- **Cross-references:** intent-directed-compilation, negative-knowledge, constraint-theory-math, multi-model-adversarial-testing, flux-lucid, polyformalism-a2a-python, polyformalism-a2a-js.
- **Gaps:** No original content — everything is synthesized from other repos. Conjectures are listed but not advanced. No new proofs or experiments. The three-layer architecture is a framework, not a theorem.

---

## Dependency Map

```
                    constraint-theory-ecosystem (umbrella, 54 GPU experiments)
                               │
              ┌────────────────┼────────────────────┐
              │                │                    │
    constraint-theory-math    │          negative-knowledge (concept)
     (proofs, errata)         │                    │
              │               │                    │
              ▼               ▼                    ▼
    constraint-theory-core ◄─┐    sheaf-constraint-synthesis
     (184 tests, crates.io)  │       (unified doc)
              │               │
              ▼               │
        flux-lucid ◄─────────┤ (meta-crate, crates.io)
         │     │              │
         │     └──► constraint-theory-llvm (CDCL→LLVM→AVX-512)
         │
         └──► holonomy-consensus (ZHC, 0-message consensus)
                    │
                    ▼
              fleet-coordinate (spatial coordination)

    eisenstein-do178c (81 Coq theorems, DO-178C evidence)
    intent-directed-compilation (AVX-512 technique, 3.17× speedup)
```

## Cross-Cutting Themes

1. **Exact arithmetic over float** — Every repo is built on the premise that float is a rubber ruler; integers are gauge blocks.
2. **Negative knowledge** — Proving absence (Bloom pre-filter, INT8 soundness, cohomology vanishing) is the primary computational strategy.
3. **9 dimensions** — dim H⁰ = 9 on trees. 9-channel intent vectors. GL(9) holonomy. This number is proven, not arbitrary.
4. **Honest errata** — Every repo documents what doesn't work. constraint-theory-math has a public ERRATA.md. constraint-theory-ecosystem documents failed approaches with equal rigor.
5. **Physical metaphors** — Beam tolerance, gauge blocks, tolerance stacks. The math maps to physical engineering.
6. **Zero-axiom proofs** — Coq proofs use no axioms. The eisenstein-do178c repo targets DO-178C Level A certification.

## Maturity Assessment

| Repo | Maturity | Ships Code? | Tests |
|------|----------|-------------|-------|
| constraint-theory-core | **Production** | ✅ crates.io v2.2.0 | 184 |
| constraint-theory-math | Research | ❌ Proofs only | N/A |
| constraint-theory-ecosystem | **Production** | ✅ CUDA/ports | 60M diff tests |
| constraint-theory-llvm | Alpha | ⚠️ Partial | Has test dir |
| holonomy-consensus | Alpha | ❌ Not published | 30+ |
| flux-lucid | Beta | ✅ crates.io v0.1.6 | Multiple modules |
| eisenstein-do178c | Certification | ❌ Proofs only | 81 Coq theorems |
| intent-directed-compilation | Research | ⚠️ Benchmarks only | 100M diff tests |
| negative-knowledge | Concept | ❌ Paper only | N/A |
| sheaf-constraint-synthesis | Documentation | ❌ Doc only | N/A |
