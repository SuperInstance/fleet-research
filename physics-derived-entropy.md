# Physics-Derived Entropy and PUF Alternatives

## Executive Summary

Physical Unclonable Functions (PUFs) exploit manufacturing variations to create unique, unclonable device fingerprints. The field is undergoing a renaissance with quantum PUFs, optoelectronic PUFs, and noise-driven approaches pushing beyond traditional silicon delay-chain designs. Our 34,000 bits of physics-derived entropy from paper-zero-crypto positions us squarely in this landscape.

## Our Connection

**paper-zero-crypto** extracts ~34,000 bits of physics-derived entropy — likely from timing variations, thermal noise, or execution non-determinism in computational hardware. This is conceptually identical to what PUFs do: extract unique entropy from physical processes that cannot be cloned.

## State of the Art

### Quantum PUFs (2025)
- **Non-unitary Quantum PUFs** (Vali et al., Nov 2025): Models PUFs under open quantum dynamics, exploiting decoherence as an entropy source rather than fighting it. Key insight: environmental coupling creates unique quantum fingerprints.
- Theoretical work shows quantum PUFs can achieve information-theoretic security bounds impossible with classical PUFs.

### Optoelectronic PUFs
- **Low-symmetry integrated photonics** (Tarik et al., Jul 2025): Uses deliberately asymmetric photonic structures to create high-entropy, nonlinear optical transformations. Instead of fighting manufacturing variation, they *amplify* it through chaotic photonic structures.
- Expressive computation AND unique fingerprinting in the same substrate.

### Noise-Driven PUFs for Industrial Control
- **Adapting Noise-Driven PUF and AI for Secure WBG ICS** (Oct 2025): Uses high-frequency switching noise in wide-bandgap semiconductors (SiC/GaN) as PUF entropy source. Demonstrates that noisy environments (traditionally a problem) can be turned into a security feature.
- AI-assisted error correction for reliable key extraction from noisy entropy.

### Soft-Data TRNG/PUF Unification
- **Unified Strong PUF Architecture** (Cazzola et al., 2025): Combines True Random Number Generation with PUF functionality using sponge-function constructions over soft (analog) data. Single entropy source serves both authentication AND random number generation.

### DRAM/Latency-Based PUFs
- DRAM decay-rate PUFs: reading DRAM cells after partial refresh yields unique bit patterns per module.
- SRAM power-up state PUFs remain the most deployed (used in ESP32, some ARM TrustZone implementations).
- GPU execution timing fingerprints: emerging work shows CUDA core scheduling jitter creates unique per-GPU execution traces.

## What We Should Adopt

1. **Sponge-function entropy extraction**: Use our 34K bits as the absorbing input to a sponge construction (Keccak/SHA-3), extracting both authentication tokens and random keys from the same physics-derived source.

2. **Statistical testing pipeline**: Run NIST SP 800-90B / 800-22 tests on our entropy pool to quantify min-entropy and justify security claims.

3. **Multi-source entropy composition**: Combine our physics-derived entropy with DRAM decay and GPU timing fingerprints for a layered approach. If one source is compromised, others maintain security.

4. **Adversarial modeling**: Test our entropy against ML-based PUF modeling attacks (the #1 attack vector for PUFs). If an attacker collects 1000 challenge-response pairs, can they clone our fingerprint?

## Concrete Experiment

**Phase 1 (Week 1)**: Characterize our 34K-bit entropy pool
- Run NIST SP 800-22 battery on the raw bits
- Calculate min-entropy using NIST SP 800-90B estimators
- Measure reproducibility: across reboots, temperature changes, voltage fluctuations

**Phase 2 (Week 2)**: Build a PUF-like authentication protocol
- Hash-based commitment: use physics entropy as a commitment seed
- Challenge-response: derive challenges from the entropy pool, verify responses
- Test against ML modeling attacks (random forest, LSTM)

**Phase 3 (Week 3)**: Multi-source composition
- Add DRAM decay entropy as second source
- Add GPU kernel execution timing as third source
- Measure improvement in min-entropy and adversarial resistance

## Tripartite Fit

**Constraint Theory**: Entropy quality IS a constraint — we need ≥X bits of min-entropy per extraction. The constraint engine can verify this at compile time.

**Formal Verification**: Prove that the entropy extraction function satisfies information-theoretic bounds. Coq theorem: "For any physical source with min-entropy H, the extraction function produces output with min-entropy ≥ H - ε."

**Production Systems**: Paper-zero-crypto needs to work across hardware variants. Runtime verification ensures entropy quality doesn't degrade in production (e.g., if a GPU overheats and timing becomes deterministic).

## Wild Speculation

What if our constraint engine could *prove* that a given physical system produces unique fingerprints? Not just measure it empirically, but derive it from the physics. A "formal verification of uniqueness" — proving that two GPUs of the same model must have distinguishable execution fingerprints. This would be a new kind of proof: physical uniqueness derived from semiconductor physics + verification theory.

Even wilder: what if the constraint satisfaction process itself generates entropy? Each solving run produces a slightly different trace due to GPU scheduling, and that trace IS the fingerprint. The computation and the authentication are the same event.
