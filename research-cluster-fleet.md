# SuperInstance Fleet & Ecosystem Research Report
*Generated: 2026-05-09 by Forgemaster subagent*

---

## Summary

45 repos researched across 6 clusters: **Fleet Infrastructure**, **Constraint Theory (CPU/GPU)**, **Eisenstein Ecosystem**, **Polyformalism/Cognitive**, **PLATO Platform**, and **Casting/Adversarial**. All repos are extremely fresh (last push 2026-05-07 to 2026-05-09), confirming active development. Most are 0–2 stars, small teams, moving fast.

---

## Cluster 1: Fleet Infrastructure (Communication & Coordination)

### 1. fleet-bridge
- **What:** Sign-pattern broadcast and bridge coupling for fleet federation — the "1-bit miracle." Broadcasts only the sign (±1) of each agent's mean state to synchronize fleets.
- **Unique Insight:** After 10× perturbation, alignment restores in 8 steps. Pruning 8→4 agents yields 9% correlation *gain*. Phase transition from 0→0.912 correlation is all-or-nothing.
- **Status:** Working Rust crate with API. Published results from May 8-9 experiments.
- **Proven:** 1-bit channel produces measurable cross-fleet correlation. Same-question agents show 1.05× stronger correlation.
- **Cross-references:** Works with fleet-manifold (manifold geometry), fleet-memory (distributed patterns).
- **Gaps:** No real fleet integration yet — experiments are simulation-only.

### 2. fleet-constraint-kernel
- **What:** GPU fleet constraint evaluator using sonar beamformer architecture. Evaluates N devices × M constraints in parallel via delay-and-sum pattern.
- **Unique Insight:** Repurposes underwater sonar beamforming for constraint checking — N hydrophones → N devices, M beams → M constraints. 13M evals/sec on RTX 4050.
- **Status:** Working CUDA kernel, compiles on CUDA 11.5+.
- **Proven:** 8 devices × 23 constraints parallel evaluation.
- **Cross-references:** fleet-proto-rs (types), constraint-gpu-kernels (kernel library), eisenstein-cuda (math).
- **Gaps:** No real device fleet connected. Test harness only.

### 3. fleet-gateway
- **What:** Single HTTP API gateway for the entire fleet. Routes `/api/{agent}/{path}` to the right agent. Service discovery, load balancing, auth, rate limiting.
- **Status:** **Mature.** Working Python server, stdlib-only, tests, CLI. Most production-ready fleet infra.
- **Proven:** Service discovery from fleet.yaml, dynamic registration, bearer token auth, round-robin LB.
- **Cross-references:** Core routing layer for all fleet agents.
- **Gaps:** No HTTPS/TLS mentioned. No circuit breaker pattern.

### 4. fleet-health-monitor
- **What:** Fleet health monitoring. **42MB repo** — appears to be a workspace dump rather than a clean library.
- **Unique Insight:** Minimal README suggests it's operational but not well-documented.
- **Status:** Large repo (41,880 KB), likely contains historical data/logs.
- **Cross-references:** fleet-gateway (health aggregation endpoint).
- **Gaps:** Needs cleanup and documentation. Unclear what's code vs data.

### 5. fleet-murmur
- **What:** CCC's agent workspace — logs, bottles, fleet coordination data. Not a library but one agent's home directory committed for transparency.
- **Status:** ~42MB workspace dump. Active (updated today).
- **Cross-references:** fleet-murmur-worker (the actual worker that runs here).
- **Gaps:** Not a reusable artifact — transparency artifact only.

### 6. fleet-murmur-worker
- **What:** TypeScript worker running 5 thinking strategies (Connect, Contradict, Explore, Question, Synthesize) with quality-gated PLATO submission.
- **Unique Insight:** "Reverse-actualization truck" — automated insight generation pipeline. Quality gate filters before PLATO commit.
- **Status:** Working, has CI badge, builds and runs.
- **Proven:** 5 strategies producing filtered insights to PLATO.
- **Cross-references:** PLATO (submission target), fleet-murmur (workspace).
- **Gaps:** No metrics on quality gate effectiveness. No strategy weight tuning.

### 7. fleet-resonance
- **What:** "The Luthier's Hammer for AI Systems." Injects perturbations into LLMs, records resonance signatures, builds contrast images. TAP → RING → CONTRAST.
- **Unique Insight:** Luthier metaphor — tap an instrument, listen to the ring. Four probe types: prompt variation, seed variation, attention mask, token mask. Produces frequency maps, impedance maps, perfusion maps, anisotropy maps.
- **Status:** Rust crate with CLI. Large repo (355KB). Active development.
- **Proven:** CLI can probe models and build ASCII resonance images.
- **Cross-references:** casting-call (which model to probe), fleet-manifold (manifold geometry from signatures).
- **Gaps:** No actual LLM API integration shown in README — appears to use signatures, not live probing.

### 8. fleet-simulators
- **What:** 4 zero-dep browser simulators: Constraint Playground, FLUX VM, Fleet Topology, Safe Arm.
- **Unique Insight:** Embodies the perturbation-resonance model interactively. Shake variables, watch resonance. Safe Arm simulator shows how Eisenstein constraints prevent real harm.
- **Status:** Working HTML files, zero dependencies.
- **Cross-references:** constraint-demo (another browser demo), constraint-studio (visualization).
- **Gaps:** Simulators are educational/demonstration — not connected to live fleet.

### 9. fleet-proto-rs (fleet-proto)
- **What:** Shared Rust types for the fleet: PLATO client, I2I messages, constraint types, device types. One crate, every Rust fleet repo depends on it.
- **Status:** **Core dependency.** Published, importable. 28KB.
- **Proven:** I2I message round-trip, constraint result with temporal fingerprint.
- **Cross-references:** Used by fleet-constraint-kernel, fleet-memory, fleet-manifold, etc.
- **Gaps:** No versioned releases mentioned. No serde JSON schema validation.

### 10. fleet-integration
- **What:** 4 integration scenarios proving multiple repos compose into working systems.
- **Unique Insight:** The "prove it works" repo. Scenarios: Time-Secure Fleet (spoof detection in 500ms), Fold-Compress GPU (40320 states → 7 generators), Discovery Pipeline (insight → FLUX tile → PLATO → fleet verify), Eisenstein vs Pythagorean (48 vs 402 directions).
- **Status:** Working Python tests, run via `pytest`.
- **Proven:** All 4 scenarios have test cases.
- **Cross-references:** Composes physics-clock, fleet-raid5, temporal-flux, fold-compression, snap-lut, insight-cfp-bridge.
- **Gaps:** References several repos NOT in this research set (physics-clock, fleet-raid5, temporal-flux, fold-compression, snap-lut, insight-cfp-bridge). These are missing dependencies.

### 11. fleet-memory
- **What:** Content-addressable distributed memory for fleets. Store patterns across agents, retrieve by cosine similarity, recover from agent failures.
- **Unique Insight:** Holographic memory — any single agent's contribution contains enough structure to reconstruct the whole. 8.3× lossless compression. Perfect recovery from agent erasures. Shannon entropy tracking per agent.
- **Status:** Working Rust crate, zero dependencies, `cargo add fleet-memory`.
- **Proven:** Cosine similarity retrieval, partial cue matching, corruption recovery.
- **Cross-references:** fleet-manifold (manifold geometry), fleet-bridge (sign patterns).
- **Gaps:** Not connected to real PLATO rooms yet. No persistence layer.

### 12. fleet-manifold
- **What:** Constraint manifold geometry for fleet state analysis. Measures curvature, compression, and agent identity on the constraint manifold.
- **Unique Insight:** 162 GPU experiments proved the manifold is fundamentally curved. 33× compression (24 intrinsic vs 800 ambient dims). 99.4% agent identity decoding via nearest-centroid.
- **Status:** Working Rust crate, zero external deps, hand-rolled PCA.
- **Proven:** Curvature ratio 44.7% larger, 99.4% identity accuracy.
- **Cross-references:** fleet-memory (distributed patterns), fleet-resonance (signatures).
- **Gaps:** Geodesic distance is "placeholder for true geodesic." No Riemannian metric yet.

### 13. fleet-workshop
- **What:** Oracle1 + JetsonClaw1 workshop for ideas before they become repos. 10 proposed ideas with effort estimates.
- **Unique Insight:** The fleet's ideation layer. Ideas include flux-bridge (HAV ↔ FLUX-ese vocabulary), cocapn-dashboard (fleet TUI), muscle-memory (reflex compiler), vessel-handshake (discovery protocol). "The Complete FLUX Stack" synergy concept: Paper → Vocabulary → Bytecode → Native → GPU.
- **Status:** All 10 ideas at 💡 Proposed stage. None greenlit yet.
- **Cross-references:** References flux-isa, HAV vocabulary, snap-lut, temporal-flux.
- **Gaps:** None of the 10 ideas have been started. Pure planning artifact.

---

## Cluster 2: Constraint Theory — Communication Protocol

### 14. constraint-flow-protocol (CFP)
- **What:** Share understanding between AI agents at FLUX bytecode level. Models compile understanding into FLUX bytecode constraints, exchange via PLATO tiles, verify through re-execution. Zero semantic drift.
- **Unique Insight:** Bytecode is ~33× denser than natural language for constraints. Exact, compressible, verifiable. Includes FluxVM with 30 opcodes.
- **Status:** v0.1. Core encode/decode/manifold working. Full constraint flow over PLATO operational.
- **Proven:** Working Python library (1,102 lines).
- **Cross-references:** PLATO (persistence), FLUX ISA (30 opcodes), fleet-murmur-worker (generates insights).
- **Gaps:** SAE integration planned but not started. Attribution graph tracking not implemented. CFP-SPEC.md is a placeholder.

---

## Cluster 3: Polyformalism / Cognitive Framework

### 15. polyformalism-a2a-python
- **What:** 9-channel polyglot agent-to-agent communication in Python.
- **Unique Insight:** (README truncated at 100 lines, details limited.)
- **Status:** Active (updated today), 155KB repo.
- **Cross-references:** polyformalism-a2a-js (JS port of same).

### 16. polyformalism-a2a-js
- **What:** JavaScript port of the 9-channel polyglot A2A protocol.
- **Status:** Active, 19KB.
- **Cross-references:** polyformalism-a2a-python (Python original).

### 17. polyformalism-thinking
- **What:** The 7-type taxonomy for creative cognition. Cognitive framework for how polyformalism works.
- **Status:** Active, 6.4MB repo (large — may include data/models).
- **Cross-references:** linguistic-polyformalism-shell, polyformalism-turbo-shell.

### 18. polyformalism-languages
- **What:** Linguistic analysis component of the polyformalism framework.
- **Status:** Active, 225KB.
- **Cross-references:** linguistic-polyformalism-shell (operationalizes these analyses).

### 19. polyformalism-turbo-shell
- **What:** DMN/ECN creative cognition engine. Default Mode Network ↔ Executive Control Network switching for creative problem-solving.
- **Status:** Active, 26KB.
- **Cross-references:** linguistic-polyformalism-shell, polyformalism-thinking.

### 20. linguistic-polyformalism-shell
- **What:** Cross-linguistic thinking shell — Sapir-Whorf applied to creative cognition via MCP server. 14 languages across 7 families.
- **Unique Insight:** Operationalizes Sapir-Whorf: thinking in Ancient Greek = categories/telos; Classical Chinese = relationships/patterns; Navajo = shapes/motions. 7 discovery types: Translation, Constraint injection, Vacillation, Analogy, Inversion, Hybridization, Obliviscence.
- **Status:** Working MCP server. 14 languages, 7 families.
- **Proven:** Can be integrated with Claude Code and OpenClaw as MCP tool.
- **Cross-references:** polyformalism-turbo-shell (cognition engine), casting-call (model selection per language).
- **Gaps:** No metrics on whether cross-linguistic thinking actually produces better insights. Academic speculation applied practically.

---

## Cluster 4: Casting Call / Model Knowledge

### 21. casting-call
- **What:** The fleet's crew manifest — which model plays which role. Detailed post-mortems from real sessions. 685 lines of evaluation data.
- **Unique Insight:** Nautical metaphor throughout. Model ratings: GLM-5.1 = flagship command, DeepSeek v4-flash = cheap hands (30% washout), Seed-2.0-mini = straight stitching, Hermes-70B = honest destroyer. $0.25/bug found via adversarial testing.
- **Status:** **Most mature knowledge artifact.** Continuously updated with session post-mortems.
- **Proven:** Real production data from May 3-9, 2026. z.ai API channel instability documented.
- **Cross-references:** casting-call-gpu (GPU math), casting-call-mcp (MCP server).
- **Gaps:** No automated benchmarking — all manual observation.

### 22. casting-call-gpu
- **What:** GPU-native engine for anchor-point signature matrices, voice spline interpolation, and model clustering. The mathematical engine behind casting-call theory.
- **Status:** Working Python with CUDA/PyTorch/CPU fallback.
- **Proven:** Signature distance matrix computation, clustering, interpolation.
- **Cross-references:** casting-call (theory), casting-call-mcp (agent-facing API).
- **Gaps:** Requires GPU for meaningful performance. No benchmark comparisons yet.

### 23. casting-call-mcp
- **What:** MCP server that agents query to choose the right model for the right task. Returns recommended model, temperature, prompt prefix.
- **Unique Insight:** Agents can programmatically consult the crew manifest. Trust-weighted rankings account for contributor trust scores.
- **Status:** Working MCP server, integrates with Claude Code and OpenClaw.
- **Proven:** `cast_model` tool returns model recommendation with confidence score.
- **Cross-references:** casting-call (data source), casting-call-gpu (math).
- **Gaps:** Historical data file must be manually maintained. No automated feedback loop from task outcomes.

---

## Cluster 5: Adversarial & Security

### 24. multi-model-adversarial-testing
- **What:** 4 AI models in adversarial roles reviewing constraint checker code. Found 2 real bugs.
- **Unique Insight:** $0.50 total cost, $0.25/bug. Seed-2.0-mini found compiler issues, Hermes-405B found DO-178C violations, Qwen3-235B found INT8 overflow (4.9% mismatch), Qwen3.5-397B found systems-level thinking. No single model found everything.
- **Status:** Complete experience report with paper and raw outputs.
- **Proven:** Two confirmed bugs with fixes.
- **Cross-references:** constraint-bench-suite (the code being tested), casting-call (model selection).
- **Gaps:** One-time study, not an automated pipeline.

### 25. paper-zero-crypto-fleet-security
- **What:** Research paper: "Zero-Crypto Fleet Security via Physics-Based Temporal Authentication." Constraint evaluation timing IS the attestation.
- **Unique Insight:** 1000-device fleet secured by 34,000 bits of physics-derived entropy. No keys, no certificates, no PKI. Compromised firmware detected in <500ms via 3σ timing deviation.
- **Status:** Draft. Preparing for IEEE S&P or USENIX Security submission.
- **Proven:** Simulated results. Honest device pass rate 99.97%.
- **Cross-references:** physics-clock, fleet-raid5, fleet-constraint-kernel, temporal-flux (all referenced but not in this research set).
- **Gaps:** **Not proven on real hardware.** Simulation only. Missing referenced repos (physics-clock, fleet-raid5, temporal-flux).

---

## Cluster 6: PLATO Platform

### 26. plato-sdk
- **What:** Developer SDK for PLATO tile-based knowledge store. Python + TypeScript/JavaScript. Rooms contain tiles. Tiles are the unit of knowledge.
- **Status:** **Production-ready.** Published to pip and npm. 2 stars.
- **Proven:** Working client with rooms, tiles, search, submit. Python and JS APIs.
- **Cross-references:** plato-studio (dashboard), plato-agent-connect (onboarding), plato-runtime (compute).
- **Gaps:** No auth/API key support mentioned. Server at hardcoded IP.

### 27. plato-studio
- **What:** Studio-quality web dashboard for PLATO. Zero deps, single HTML file. Dark theme, room sidebar, search, tile submission, auto-refresh.
- **Status:** **Complete.** Working, polished UI.
- **Proven:** Full feature set: search, new tiles, keyboard shortcuts, responsive, skeleton loading, toast notifications.
- **Cross-references:** plato-sdk (backend), plato-agent-connect (onboarding).
- **Gaps:** No real-time collaboration features. Single-user oriented.

### 28. plato-runtime
- **What:** Self-discovering, self-optimizing compute runtime. Discovers hardware, profiles it, schedules work. Uses spare cycles to improve itself.
- **Unique Insight:** Idle Harvester — when user is idle >30s, ramps up background tasks (self-profiling, kernel precompilation, optimization sweeps, PLATO tile processing). Smooth transition between active (20% resources) and idle (80%).
- **Status:** Working Rust binary with CLI commands: discover, profile, benchmark, optimize, monitor, idle-harvest.
- **Proven:** CPU + GPU discovery, constraint check profiling, AVX-512 detection.
- **Cross-references:** fleet-constraint-kernel (GPU scheduling), cuda-constraint-engine (kernel management).
- **Gaps:** No actual fleet scheduling yet — single-node only.

### 29. plato-agent-connect
- **What:** One-command CLI to join the PLATO fleet. `npx @superinstance/plato-agent-connect`. Zero-install.
- **Status:** Working, published to npm. Has CI auto-publish.
- **Proven:** Connect, welcome, show tiles, contribute, status check.
- **Cross-references:** plato-sdk (API), PLATO room server.
- **Gaps:** No auth. Anyone can submit to any room.

### 30. plato-vessel-rapid-prototype
- **What:** Rapid prototyping vessel template. (README truncated, limited detail.)
- **Status:** Active, 10KB.
- **Cross-references:** Other PLATO vessels (educational, technician).

### 31. plato-vessel-educational
- **What:** Student + instructor agent for PLATO-enabled IoT classrooms. 30 ESP32s become 30 teaching assistants. Agent handles firmware, students handle physical design.
- **Unique Insight:** Flips embedded education — student designs circuits, agent writes firmware and teaches concepts. Room per student, automatic difficulty adaptation. Every interaction becomes a PLATO tile.
- **Status:** Well-designed architecture. Concept proven.
- **Cross-references:** plato-vessel-core (firmware), plato-sdk.
- **Gaps:** Requires plato-vessel-core firmware (referenced but not in this set). No classroom deployment yet.

### 32. plato-vessel-technician
- **What:** Technician vessel — maintenance/diagnostic agent for PLATO-connected devices.
- **Status:** Active, 17KB.
- **Cross-references:** plato-vessel-educational, plato-vessel-rapid-prototype.

---

## Cluster 7: Constraint Theory — Math & Visualization

### 33. constraint-demo
- **What:** Browser demo: Physics Clock, Reality Parity, Fold Compression, Snap LUT. Zero dependencies.
- **Unique Insight:** Shows N! states compress to N-1, Eisenstein snaps 7× tighter than Pythagorean (402 vs 48 points, same BRAM).
- **Status:** Complete, single HTML file.
- **Cross-references:** constraint-studio (full visualization suite).
- **Gaps:** Demo only, not a tool.

### 34. constraint-studio
- **What:** Full visualization studio: hex grid view, timeline view, drift analysis (The Narrows), benchmark dashboard. Zero deps, single HTML file.
- **Unique Insight:** The Narrows — 4 precision formats as boats in a channel. INT32 and FP64 survive; BF16 sinks at iteration 8, FP32 at 28, FP16 at 3. Interactive with keyboard shortcuts, PNG export.
- **Status:** **Complete and polished.** Linear.app quality dark theme.
- **Cross-references:** drift-analyzer (the tool behind the Narrows), constraint-bench-suite (benchmark data).
- **Gaps:** No live data connection — benchmark numbers are static/imported.

### 35. constraint-bench-suite
- **What:** Real-silicon benchmarks for Eisenstein constraint checking across CPU and GPU. Tested on AMD Ryzen AI 9 HX 370 + RTX 4050.
- **Unique Insight:** **FP64 is the fastest precision on AMD Zen 5** for Eisenstein norms. "Precision is free" — all precisions cluster at 4.7-5.0 Gops/s. GPU tensor cores: 47.2B constraints/s. BF16 collapses at ~8 iterations. Linear scaling to 4 cores (97% efficiency).
- **Status:** **Most thorough benchmark suite.** C code with auto-detecting Makefile.
- **Proven:** Measured on real silicon with reproducible methodology.
- **Cross-references:** constraint-gpu-kernels (GPU library), cuda-constraint-engine (GPU engine), drift-analyzer.
- **Gaps:** AMD-only CPU data. No Intel benchmark comparison.

### 36. drift-analyzer
- **What:** Precision drift analyzer — "The boat sinks at iteration 28." Measures exactly when each precision format fails under cumulative operations.
- **Unique Insight:** Seven boats enter a narrow channel. FP64 walks through dry. FP32 hits rocks at iteration 28, sinks at 200. BF16 sinks at ~50. INT32 = exact arithmetic, walks through dry.
- **Status:** Working Rust crate + binary. `cargo run -- --narrows`.
- **Proven:** CLI produces the Narrows table. Library API available.
- **Cross-references:** constraint-bench-suite, constraint-gpu-kernels (drift simulation kernels).
- **Gaps:** Narrows scenario is one specific workload — rotation. Different operations may sink differently.

---

## Cluster 8: Constraint Theory — GPU Engines

### 37. cuda-constraint-engine
- **What:** Developer-facing CUDA library for massive batch constraint checking. Multi-precision, Eisenstein support, CUDA graphs (18× launch speedup), zero-dep Python wrapper.
- **Unique Insight:** Memory pool pre-allocation, CUDA graph replay, hot-swap bounds via cudaMemcpyAsync. Thread-safe multi-stream.
- **Status:** **Production-quality CUDA library.** C + Python API, shared library build.
- **Proven:** RTX 4050 benchmarks included. ce_create/ce_check/ce_destroy API.
- **Cross-references:** constraint-gpu-kernels (lower-level kernels), fleet-constraint-kernel (fleet evaluator).
- **Gaps:** Windows-only? No Linux build instructions. Requires sm_86+.

### 38. constraint-gpu-kernels
- **What:** 341 billion constraints/second. Differential-zero guaranteed. Production CUDA kernels for Eisenstein operations.
- **Unique Insight:** SOA layout for memory coalescing. INT8/INT16 promote internally for safety. FP32 first violation at iteration ~2,936. FP64 holds until ~69,211.
- **Status:** **High-performance kernel library.** C headers, Makefile, test suite.
- **Proven:** Differential tests with 10M elements, zero mismatches.
- **Cross-references:** cuda-constraint-engine (uses these kernels), constraint-bench-suite (benchmarks them).
- **Gaps:** RTX 4050-specific optimizations. Portability unclear.

---

## Cluster 9: Eisenstein Ecosystem

### 39. eisenstein-c
- **What:** C port of Eisenstein integer arithmetic. ~1KB `.text`. No runtime, no heap, no OS. Just stdint.h and 600 lines.
- **Unique Insight:** For environments Rust doesn't target: ARM Cortex-M4, bootloaders, kernels, safety-critical certification.
- **Status:** Complete. 18 tests pass. Single translation unit.
- **Cross-references:** eisenstein (Rust crate, not in this set), arm-neon-eisenstein-bench.
- **Gaps:** No ARM-specific optimizations — generic C.

### 40. eisenstein-fuzz
- **What:** Property-based fuzzing for Eisenstein integers. 6 fuzz targets, 13 property tests. Millions of inputs, zero properties broken.
- **Unique Insight:** Proves the zero-drift claim under pressure. Targets: rotation identity, norm non-negativity, ring axioms, D₆ closure, conjugate involution, disk coverage.
- **Status:** **Rigorous verification.** 300K+ property checks, coverage-guided fuzzing.
- **Proven:** No counterexamples found across all targets.
- **Cross-references:** eisenstein (core crate), eisenstein-bench.
- **Gaps:** Requires nightly Rust + cargo-fuzz for full fuzzing.

### 41. eisenstein-bench
- **What:** CLI benchmark suite. "The proof runs on your hardware, not ours." Compare E12 vs float drift, disk iteration, snap, norm throughput.
- **Unique Insight:** E12 rotation: zero drift. Float rotation: 2×10⁻¹⁵ after 10K steps. Disk iteration: 3M points in 5.5ms.
- **Status:** Working, installable via `cargo install`.
- **Cross-references:** eisenstein (core), eisenstein-fuzz (verification), eisenstein-c (C port).
- **Gaps:** Single-machine benchmarks only.

### 42. eisenstein-ai-landing
- **What:** Landing page for Eisenstein integer project. Minimal HTML.
- **Status:** Static page.
- **Cross-references:** All Eisenstein repos.

### 43. hexgrid-gen
- **What:** Code generator for hex grid lookup tables. Outputs Rust, C, Python, JS, JSON.
- **Unique Insight:** Precompute at compile time, zero runtime cost. Same exact coordinates as runtime crate.
- **Status:** Working CLI with 5 output languages.
- **Cross-references:** eisenstein-c, eisenstein (Rust), arm-neon-eisenstein-bench.
- **Gaps:** No WASM output option.

### 44. arm-neon-eisenstein-bench
- **What:** ARM NEON benchmarks for Eisenstein norms. 4 norms in 5 NEON instructions.
- **Unique Insight:** 3.3× throughput over scalar on Cortex-A72. Theoretical max 4×. Zero drift, zero unsafe.
- **Status:** Working, requires aarch64 or ARMv8.
- **Cross-references:** eisenstein-c (C port for ARM), constraint-bench-suite (x86 comparison).
- **Gaps:** Cortex-A72 only — no Apple Silicon or Snapdragon benchmarks.

### 45. openarm
- **What:** Open-source 7DOF humanoid arm for physical AI. $6,500 for bimanual system. From enactic.ai (forked into SuperInstance).
- **Status:** **External project.** Not fleet-original. 129MB repo with full CAD, ROS2, Isaac Lab integration.
- **Cross-references:** Fleet's physical robotics target.
- **Gaps:** Unclear integration depth with fleet constraint system.

---

## Analysis: Maturity Rankings

### Tier 1 — Production-Ready
1. **plato-sdk** — Published to pip/npm, working API, used daily
2. **plato-studio** — Complete, polished, zero-dep dashboard
3. **fleet-gateway** — Full-featured API gateway with tests
4. **constraint-studio** — Beautiful, complete visualization
5. **casting-call** — Continuously updated knowledge base
6. **constraint-bench-suite** — Thorough real-silicon benchmarks
7. **eisenstein-c** — Minimal, complete, tested C library
8. **eisenstein-fuzz** — Rigorous verification suite
9. **cuda-constraint-engine** — Production CUDA library with C + Python API
10. **constraint-gpu-kernels** — 341B constraints/s with differential-zero tests

### Tier 2 — Working but Needs Integration
11. **fleet-proto-rs** — Core types, needs versioned releases
12. **fleet-bridge** — Fascinating 1-bit results, needs real fleet connection
13. **fleet-memory** — Clean API, needs PLATO persistence
14. **fleet-manifold** — Strong math, needs true geodesic distance
15. **drift-analyzer** — Solid CLI, needs more workload types
16. **fleet-murmur-worker** — Working pipeline, needs quality metrics
17. **plato-runtime** — Impressive self-discovery, needs multi-node
18. **constraint-flow-protocol** — v0.1 working, needs spec completion
19. **casting-call-mcp** — Working MCP server, needs feedback loop
20. **plato-agent-connect** — Working CLI, needs auth

### Tier 3 — Ideas / Experiments / Demos
21. **fleet-resonance** — Brilliant concept, needs live LLM integration
22. **fleet-integration** — Proves composition, references missing repos
23. **fleet-workshop** — All ideas at "proposed" stage
24. **paper-zero-crypto-fleet-security** — Draft paper, simulation only
25. **linguistic-polyformalism-shell** — Fascinating Sapir-Whorf MCP, no effectiveness metrics
26. **multi-model-adversarial-testing** — Complete report, one-time study
27. **fleet-simulators** — Educational demos
28. **constraint-demo** — Minimal browser demo

---

## Analysis: Best Unique Ideas (Incomplete but Brilliant)

1. **fleet-bridge (1-bit miracle)** — Phase transition at 0→0.912 correlation from single-bit broadcast. This is a genuine discovery about information density in coupled systems.
2. **fleet-resonance (Luthier's Hammer)** — TAP/RING/CONTRAST for LLM structural analysis. The impedance map concept (dead spots that absorb perturbation) is novel.
3. **linguistic-polyformalism-shell** — Operationalizing Sapir-Whorf as an MCP tool. 14 languages as cognitive constraint systems. The "Obliviscence" type (forget unhelpful constraints) is elegant.
4. **plato-runtime (Idle Harvester)** — Self-discovering runtime that uses spare cycles for self-improvement. The smooth 20%↔80% resource transition is clever.
5. **fleet-memory (holographic)** — Any single agent's fragment contains enough structure for reconstruction. The 8.3× lossless compression from attractor dynamics.
6. **paper-zero-crypto** — 34,000 bits of physics-derived entropy with no PKI. The claim that "the physics IS the certificate" is bold and potentially revolutionary.
7. **CFP (bytecode-level understanding)** — 33× denser than natural language, zero semantic drift, verifiable by re-execution. Models share understanding as executable constraints.

---

## Analysis: Gaps & Missing Integrations

### Missing Repos Referenced but Not in This Set
- **physics-clock** — Referenced by fleet-integration, paper-zero-crypto, constraint-demo
- **fleet-raid5** — Referenced by fleet-integration, paper-zero-crypto
- **temporal-flux** — Referenced by fleet-integration, paper-zero-crypto, fleet-proto-rs
- **fold-compression** — Referenced by fleet-integration
- **snap-lut / snap-lut-eisenstein** — Referenced by fleet-integration, fleet-proto-rs
- **insight-cfp-bridge** — Referenced by fleet-integration
- **eisenstein (Rust core crate)** — Referenced by all Eisenstein repos
- **plato-vessel-core** — Referenced by plato-vessel-educational
- **flux-isa** — Referenced by CFP, fleet-simulators, fleet-proto-rs
- **cocapn-schemas** — Referenced by fleet-proto-rs, fleet-constraint-kernel

### Duplicate / Overlapping Functionality
1. **cuda-constraint-engine vs constraint-gpu-kernels vs fleet-constraint-kernel** — Three separate GPU constraint engines. cuda-constraint-engine is developer-facing, constraint-gpu-kernels is low-level kernels, fleet-constraint-kernel is fleet-specific. Should be consolidated under one roof.
2. **constraint-demo vs constraint-studio vs fleet-simulators** — Three HTML visualization repos. constraint-studio is the most complete; the others could be merged in.
3. **polyformalism-a2a-python vs polyformalism-a2a-js** — Same protocol, two languages. Expected, not really duplication.
4. **drift-analyzer vs constraint-bench-suite's drift component** — Both measure precision drift. Different scopes (Rust CLI vs C bench suite) but overlapping.

### Critical Integration Gaps
1. **PLATO ↔ Fleet agents** — plato-sdk exists, fleet-gateway exists, but no repo shows them composing in production
2. **CFP ↔ PLATO** — CFP claims to encode/decode via PLATO tiles, but no end-to-end demo with real agents
3. **fleet-resonance ↔ casting-call** — Resonance signatures should feed back into casting-call's model selection, but no pipeline exists
4. **plato-runtime ↔ any fleet repo** — Runtime discovers hardware but nothing schedules fleet work through it
5. **openarm ↔ constraint system** — The arm exists, the constraints exist, but no repo connects them

---

## The Nuggets (Brilliant Ideas in Unfinished Repos)

1. **"Same-question agents show 1.05× stronger correlation"** (fleet-bridge) — Implies agents working on the same problem develop correlated internal states, detectable through 1-bit communication. This is emergent alignment.

2. **"Pruning creates — 8→4 agents yields 9% correlation gain"** (fleet-bridge) — Fewer agents can outperform more, suggesting information-theoretic optimality at specific fleet sizes.

3. **"FP64 is the fastest precision on Zen 5"** (constraint-bench-suite) — Contradicts the assumption that lower precision = faster. The dependency chain is the bottleneck, not the ALU.

4. **"BF16 destroys the signal within 8 iterations"** (constraint-gpu-kernels) — Not just imprecise, but catastrophically cancels. This has implications for anyone using BF16 in iterative systems.

5. **"Disk count is always exactly 3R² + 3R + 1"** (eisenstein-fuzz) — This closed-form formula for hex disk enumeration is a structural invariant that survives fuzzing. Math that works.

6. **"The physics IS the certificate"** (paper-zero-crypto) — If this works on real hardware, it eliminates the entire PKI stack for fleet security.

7. **"Obliviscence — forget constraints that aren't helping"** (linguistic-polyformalism-shell) — A 7th cognitive operation that actively discards unproductive constraints. Meta-cognitive pruning.

8. **"Idle Harvester smoothly transitions 20%↔80% resources over 5 seconds"** (plato-runtime) — Self-optimizing runtime that harvests wasted cycles without the user noticing.

9. **"No single model found everything"** (multi-model-adversarial-testing) — $0.25/bug but requires 4 diverse models. The diversity IS the value, not any individual model.

10. **"Bytecode is 33× denser than natural language for constraints"** (CFP) — If models can actually share compiled understanding, this eliminates the "telephone game" problem in multi-agent systems.
