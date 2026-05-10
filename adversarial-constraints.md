# Adversarial Robustness of Constraint Systems

## Executive Summary

Constraint satisfaction and optimization systems are vulnerable to adversarial manipulation: an attacker who can influence the constraints, objective function, or solver parameters can cause the system to produce incorrect, suboptimal, or dangerous results. Research on adversarial attacks against optimization solvers is nascent but growing, driven by safety-critical applications in power grids, autonomous systems, and finance.

## Our Connection

Our multi-model adversarial testing approach (testing constraint systems against different models to find disagreements) is essentially an adversarial robustness evaluation. We probe the system with edge cases and measure where it fails. This research area formalizes and extends that approach.

## State of the Art

### Bilevel Adversarial Problems in Power Grids (Dec 2025)
- **Sparse Neural Approximations for Bilevel Adversarial Problems** (Cho et al., Dec 2025): Adversarial worst-case load shedding (AWLS) problem formulated as a bilevel program. Upper level simulates attacker (chooses which lines to cut), lower level simulates defender (minimizes damage).
- Key insight: critical infrastructure optimization is ALREADY an adversarial game. The "constraints" reflect physical limits that an attacker tries to push past.
- Sparse neural approximations speed up the bilevel solver — neural network approximates the inner optimization.

### Constraint Poisoning
- Theoretical work on adversarial manipulation of constraint satisfaction:
  - Adding subtle perturbations to constraint coefficients can flip satisfiability (SAT → UNSAT or vice versa)
  - An attacker who can inject even a small number of constraints can control the solver's output
  - Defense: robust constraint formulations that are insensitive to small perturbations

### Solver Manipulation
- Most production solvers (Gurobi, CPLEX, OR-Tools) are NOT designed to be adversarially robust
- An attacker who can influence the order of constraints, variable bounds, or objective coefficients can change the solution
- Floating-point arithmetic creates exploitable edge cases (a constraint is "just barely" satisfied)
- No existing solver provides adversarial robustness guarantees

### Adversarial Robustness in Combinatorial Optimization
- Learning-based solvers (neural combinatorial optimization) inherit adversarial vulnerabilities from neural networks
- Input perturbations that are imperceptible to humans can completely change the solver's output
- Defense approaches: randomized smoothing, adversarial training, robust certification
- Traditional (exact) solvers are more robust but not immune — they can be manipulated through problem formulation

## What We Should Adopt

1. **Adversarial constraint testing**: Systematically test our constraint engine with adversarial constraint sets:
   - Constraints that are barely satisfiable (stress boundary conditions)
   - Conflicting constraints (test UNSAT detection)
   - Scale-adversarial constraints (change solution dramatically with tiny coefficient changes)

2. **Robustness metrics**: Define and measure:
   - Solution sensitivity: how much does the solution change when constraints are perturbed by ε?
   - Satisfiability gap: what's the minimum perturbation that flips SAT/UNSAT?
   - Solver stability: does the solver produce the same solution given equivalent (but reordered) constraint formulations?

3. **Multi-model adversarial testing** (already doing this): Compare solver outputs across different models. Disagreements indicate adversarial vulnerability.

4. **Defensive constraint formulation**: Add robustness constraints that make the solution insensitive to small perturbations. "Robust optimization" formulation: find solution that satisfies constraints even if coefficients are perturbed by up to δ.

## Concrete Experiment

**Phase 1**: Build adversarial constraint generator
- Generate constraint sets designed to expose solver weaknesses
- Categories: near-UNSAT, near-degenerate, scale-adversarial, ordering-adversarial
- Automated: generate, solve, compare against reference solver

**Phase 2**: Measure robustness
- For each constraint type, measure solution sensitivity to coefficient perturbation
- Identify which constraint types are most vulnerable
- Map vulnerability landscape: which parts of constraint space are adversarially dangerous?

**Phase 3**: Implement defenses
- Robust formulation: add perturbation bounds to constraint definitions
- Solution certification: verify that solutions remain feasible under perturbation
- Adversarial training: expose the solver to adversarial constraints during development

## Tripartite Fit

**Constraint Theory**: Adversarial robustness is a NEW type of constraint: the solution must be robust to perturbation. This adds a meta-level to constraint satisfaction — constraints about constraints.

**Formal Verification**: Prove robustness: "For any perturbation of constraints within bounds δ, the solution remains within ε of the original." This is a formal guarantee, not just empirical testing.

**Production Systems**: In production, constraints come from external sources (sensors, user input, APIs). These sources can be noisy, corrupted, or adversarial. Robust constraint handling is a production necessity, not an academic exercise.

## Wild Speculation

What if we could prove that our constraint engine is adversarially robust? A Coq theorem: "For any constraint problem C, and any adversarial perturbation p within bounds δ, the solver's output satisfies a robustness property R." This would be a world-first: formally verified adversarial robustness for a constraint solver.

Even wilder: an adversarial constraint engine that treats every input as potentially hostile. It doesn't just solve the given constraints — it solves the constraints AND checks for adversarial patterns. "This constraint set looks adversarial because the coefficients are suspiciously close to a known attack pattern." The solver has an immune system.
