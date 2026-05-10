# Runtime Verification and Temporal Logic in Production

## Executive Summary

Runtime verification (RV) is the discipline of checking system properties against live execution traces using formal specifications (typically temporal logic). The field is maturing rapidly from academic tooling to production-grade monitors, with new approaches in automata-less monitoring, stochastic LTL, and full-stack hierarchical verification. Our Ground Truth agent's temporal anomaly detection aligns directly with this trajectory.

## Our Connection

**Ground Truth agent** performs temporal anomaly detection — monitoring live system behavior against expected temporal patterns. This IS runtime verification: checking temporal properties against execution traces. The question is whether we formalize this with temporal logic (making it provably correct) or keep it as statistical anomaly detection (making it practically useful).

## State of the Art

### Automata-less Monitoring (2025)
- **Automata-less Monitoring via Trace-Checking** (Brunello et al., Nov 2025): Ditches the traditional approach of building automata from LTL formulas. Instead, directly checks whether the current trace satisfies a formula using a trace-checking algorithm.
- Key advantage: simpler implementation, potentially lower overhead, easier to compose.
- Extended with early failure detection using ML + trace checking (Aug 2025): ML predicts likely violations before they fully manifest, trace-checking confirms.

### Hierarchical Full-Stack Verification
- **Formally and Empirically Verified Methodologies for Scalable Hierarchical Full-Stack Systems** (Oct 2025): Uses Communicating Sequential Processes (CSP) and Linear Temporal Logic (LTL) to verify layered system architectures. PBFD/PDFD models software as layered directed graphs with unified state machines.
- Directly relevant: our fleet architecture IS a layered system (agent → constraint engine → GPU → hardware).

### iCFTL — Diagnosing Specification Violations
- **Diagnosing Violations of State-based Specifications in iCFTL** (Stratan et al., Sep 2025): When a temporal property is violated, this tool explains *why* — pinpointing the exact state transitions that caused the violation.
- This is what Ground Truth needs: not just "anomaly detected" but "anomaly caused by constraint violation at step N due to variable X exceeding bound Y."

### Stochastic LTL Runtime Verification
- **Runtime Verification for LTL in Stochastic Systems** (Esparza & Fischer, Aug 2025): Handles the real-world case where systems have probabilistic behavior. Instead of binary satisfy/violate, computes the probability that an LTL property holds given the observed trace.
- Critical insight: GPU execution is inherently stochastic (scheduling jitter, cache behavior). Deterministic temporal properties will false-positive constantly. Stochastic RV handles this gracefully.

### Autonomous Driving Applications
- **Towards Safe Autonomous Driving: Real-Time Runtime Verification** (2025): Demonstrates RV with <5% overhead in real-time safety-critical systems. Uses hardware-accelerated monitors for sub-millisecond property checking.

## What We Should Adopt

1. **Stochastic LTL for Ground Truth**: Instead of binary anomaly detection, compute P(property holds | observed trace). This handles GPU scheduling jitter gracefully and produces calibrated confidence scores.

2. **Automata-less monitoring**: Simpler to implement than building monitor automata. The trace-checking approach maps well to our constraint engine: each constraint IS a trace property.

3. **Hierarchical CSP+LTL**: Model our fleet as CSP processes with LTL properties. Each layer (agent → engine → GPU) has its own temporal properties, verified compositionally.

4. **Diagnostic explanations**: When Ground Truth detects an anomaly, generate a causal explanation trace. Not just "constraint violated" but the full diagnostic chain.

## Concrete Experiment

**Phase 1**: Formalize Ground Truth's anomaly detection as temporal logic
- Identify the temporal properties Ground Truth currently checks (implicitly)
- Express them in LTL or MTL (Metric Temporal Logic for timed properties)
- Example: `□(constraint_submit → ◇≤30s result_received)` — "every submission gets a result within 30 seconds"

**Phase 2**: Build a stochastic runtime monitor
- Implement trace-checking against the LTL properties
- Add stochastic quantification: compute P(property holds) not just binary
- Benchmark overhead: target <2% CPU on production workloads

**Phase 3**: Causal explanation generation
- When property violation probability exceeds threshold, trace back through the execution to identify the causal chain
- Generate human-readable explanation: "Constraint batch #47 violated timeliness property because GPU memory allocation took 28s (expected ≤5s)"

## Tripartite Fit

**Constraint Theory**: Temporal properties ARE constraints over traces. The constraint engine can verify temporal properties at runtime the same way it verifies spatial (data) constraints. Temporal constraints are just constraints in the time domain.

**Formal Verification**: Prove the runtime monitor itself is correct — it detects all violations (completeness) and only real violations (soundness). Coq theorem: "Monitor M detects all violations of property φ with probability ≥ 1-ε."

**Production Systems**: Runtime verification must have negligible overhead. The stochastic approach helps: we don't need to check every single trace step, we can sample and bound the confidence.

## Wild Speculation

What if the constraint engine IS the runtime verifier? Every constraint check is simultaneously a temporal property check. The solver doesn't just find solutions — it monitors the solution process for temporal violations. This unifies computation and verification into a single pass. Zero overhead because the verification is the computation.

Even wilder: self-healing temporal logic. When a temporal violation is detected, the system automatically relaxes the temporal constraint to a weaker property that IS satisfied, while flagging the degradation. The system gracefully degrades rather than crashing. This is "temporal constraint relaxation" — a new concept at the intersection of runtime verification and constraint satisfaction.
