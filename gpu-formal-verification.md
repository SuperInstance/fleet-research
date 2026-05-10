# Formal Verification of GPU Kernels

## Executive Summary

Formal verification of GPU programs has long been considered extremely hard due to the massive parallelism, non-deterministic scheduling, and complex memory models. A breakthrough paper from Stanford/NVIDIA (ProofWright, Nov 2025) demonstrates agentic formal verification of CUDA kernels, verifying 74% of LLM-generated kernels for memory safety, thread safety, and semantic correctness. This is directly relevant to our CUDA constraint engine with its 81 Coq theorems.

## Our Connection

**eisenstein-do178c** contains 81 Coq theorems verifying constraint satisfaction properties. Our CUDA constraint engine runs on GPU hardware. The gap between "Coq theorems about constraint properties" and "proven-correct CUDA execution" is exactly what this research addresses.

## State of the Art

### ProofWright: Agentic Formal Verification of CUDA (Nov 2025)
- **Authors**: Chatterjee, Zagieboylo, Damani, Hari, Kozyrakis (Stanford + NVIDIA)
- **What it does**: Automatically verifies LLM-generated CUDA kernels for:
  - Memory safety (no out-of-bounds access)
  - Thread safety (no data races)
  - Semantic correctness (output matches specification)
- **Results**: 74% of kernels on KernelBench L1 verified, with "modest overhead"
- **Key innovation**: Uses LLMs to generate verification conditions, then feeds them to formal verifiers. The LLM writes the proof sketch, the verifier checks it.
- **Uncovers subtle bugs** missed by conventional testing (limited input coverage, reward hacking)

### Traditional Approaches
- **GPUVerify** (2014-2022): Microsoft Research tool for verifying GPU kernels. Uses boogie-based intermediate representation. Works but requires manual annotations and doesn't scale to complex kernels.
- **Verifying parallel programs in Coq/Isabelle**: Possible but labor-intensive. Each parallel composition requires explicit reasoning about interleavings.
- **Separation logic for GPU**: Iris-based approaches can reason about shared-memory GPU programs but require significant proof effort.

### The Memory Model Challenge
- GPU memory models (especially NVIDIA's) are not fully formally specified
- Race conditions are non-deterministic by design
- warp-level primitives (shuffle, reduce) have subtle ordering requirements
- The formal specification of the memory model IS a prerequisite for any verification

## What We Should Adopt

1. **ProofWright-style agentic verification**: Use our coding agents (z.ai, kimi) to generate verification conditions for our CUDA constraint kernels. Don't prove by hand — let agents write proof sketches.

2. **Memory safety first, semantic correctness second**: Follow ProofWright's layered approach. First prove memory safety (no crashes), then thread safety (no races), then semantic correctness (results match spec). Each layer is incrementally harder.

3. **LLM+verifier pipeline**: Our 81 Coq theorems can be extended by having agents generate new theorem statements for CUDA-specific properties, then verifying them.

4. **Property-based testing as bridge**: Before full formal verification, use property-based testing (QuickCheck-style) on CUDA kernels. Generate random constraint problems, verify the GPU solution matches the CPU reference.

## Concrete Experiment

**Phase 1**: Catalog our CUDA kernels
- Identify all GPU code paths in the constraint engine
- Classify by verification difficulty (element-wise → reduction → complex)
- Map existing Coq theorems to GPU properties

**Phase 2**: Memory safety verification
- Annotate CUDA kernels with memory safety specifications
- Use ProofWright or GPUVerify to verify no out-of-bounds, no data races
- Target: 100% memory safety for production kernels

**Phase 3**: Semantic verification
- For each Coq theorem, define a GPU-level specification
- Generate verification conditions using agents
- Attempt automated proof: solver_output == expected_output given constraints
- Target: prove semantic equivalence between CPU (Coq-verified) and GPU implementations

## Tripartite Fit

**Constraint Theory**: The constraint engine's CUDA kernels implement constraint satisfaction algorithms. Formal verification proves these implementations are correct. The Coq theorems verify the algorithm; GPU verification verifies the implementation.

**Formal Verification**: This is the direct application — proving GPU programs correct. Our 81 Coq theorems are the foundation; GPU verification extends them to the execution layer.

**Production Systems**: Verified kernels don't crash in production. Memory safety means no segfaults, thread safety means no silent corruption, semantic correctness means correct results. This is production-grade reliability.

## Wild Speculation

What if we could prove that our constraint engine's GPU execution is *end-to-end* correct? From Coq theorem through CUDA compilation to hardware execution. A single proof chain covering:
1. Algorithm correctness (Coq)
2. Implementation correctness (CUDA verification)
3. Compilation correctness (compiler verification — incredibly hard)
4. Hardware correctness (assuming trusted hardware base)

Steps 1-2 are feasible today. Step 3 is an open research problem. Step 4 requires trusting the hardware (or using formally verified hardware like SeL4's approach).

Even wilder: what if the constraint engine generates CUDA kernels on-the-fly (JIT compilation) and verifies them before execution? Each generated kernel comes with a machine-checked proof of correctness. "Compile-time verification" becomes "runtime verification" — but at formal verification strength, not just testing.
