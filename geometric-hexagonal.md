# Geometric Deep Learning on Hexagonal Lattices

**Status:** Research document — Cocapn fleet constraint theory ecosystem  
**Date:** 2026-05-09  
**Author:** Forgemaster ⚒️  

---

## Executive Summary

Geometric deep learning (GDL) extends neural networks to non-Euclidean domains — graphs, manifolds, and lattices with known symmetry groups. Our Eisenstein integer lattice has D6 (dihedral-6) symmetry, and D6-equivariant neural networks can learn constraint-checking strategies that respect this symmetry by construction. Combined with graph neural networks (GNNs) that operate on the lattice structure, this could yield a learned constraint checker that outperforms hand-crafted rules, while maintaining the mathematical guarantees we need. Connection to our casting-call system: the GNN itself becomes a "model" that the fleet can evaluate and deploy.

---

## Background

### Geometric Deep Learning

GDL unifies CNNs, GNNs, and other architectures under the principle of **symmetry equivariance:**

- **E(2)-equivariant CNNs:** Equivariant to translations and rotations in 2D
- **P4/P4M CNNs:** Equivariant to 90° rotations and reflections (Cohen & Welling, 2016)
- **Hexagonal CNNs:** Equivariant to 60° rotations on hex grids (Hoogeboom et al., 2018)
- **Steerable CNNs:** Continuous rotation equivariance via harmonic decompositions (Weiler & Cesa, 2019)

### D6 Equivariance

D6 = C6 ⋊ S2 (6-fold rotations × reflections). A D6-equivariant network:

- Produces the same output (up to symmetry transformation) for rotated/reflected inputs
- Has 12 irreducible representations (6 rotations × 2 parities)
- Reduces parameter count vs generic network by ~12x (symmetry constraint)
- Guaranteed to generalize across all D6-related configurations

### Graph Neural Networks on Hex Lattices

Message-passing GNNs on our lattice:

1. **Node features:** INT8 constraint values at each Eisenstein point
2. **Edge features:** Differential between neighboring nodes
3. **Message function:** MLP taking (node features, edge features, neighbor features)
4. **Aggregation:** Sum/mean over 6 neighbors
5. **Update:** Combine aggregated messages with current node state

The 6-neighbor structure means each node has a **fixed degree** — no variable-length aggregation needed.

---

## Connection to Our Work

### D6-Equivariant Constraint Checking

Our constraint checker operates on a D6-symmetric lattice with D6-symmetric constraints. A D6-equivariant neural network respects this structure by construction:

- **Rotation equivariance:** If the constraint state is rotated 60°, the checker's output rotates accordingly
- **Reflection equivariance:** Mirror symmetry is preserved
- **No wasted parameters:** The network doesn't need to "learn" symmetry — it's built in

**Key advantage:** The network can learn *which patterns of constraint values indicate problems* without being confused by rotational copies of the same pattern.

### Learning Optimal Checking Strategies

Currently, our FLUX ISA uses hand-crafted opcodes for constraint checking. A GNN could learn:

1. **Which regions to check first** — attention-like weighting of lattice regions
2. **How many iterations are needed** — adaptive termination based on convergence
3. **When to escalate** — multi-scale anomaly detection through message-passing depth

The GNN output could be interpreted as a **constraint checking plan** — a sequence of FLUX ISA instructions optimized for the current lattice state.

### Connection to Casting Call

Our casting-call system evaluates which AI model to use for which task. A D6-equivariant GNN is itself a model that can be evaluated:

- **Task:** Constraint checking strategy selection
- **Input:** Current lattice state (as graph)
- **Output:** Checking plan (as FLUX ISA sequence)
- **Evaluation:** Accuracy of predicted plan vs actual optimal plan

This adds a new row to the casting-call roster: "D6-GNN" as a specialist for constraint strategy selection.

---

## State of the Art

1. **Hoogeboom, Smets & Welling (2018), "HexaConv" (ICLR)** — Hexagonal convolutions with 6-fold rotational symmetry. Directly applicable to our lattice geometry. Shows ~30% parameter reduction vs square-grid CNNs.

2. **Cohen, Weiler, Kicanaoglu & Welling (2019), "Gauge Equivariant Convolutional Networks" (ICML)** — General framework for equivariant networks on any manifold. D6 is a special case. Provides the mathematical foundation.

3. **Bodner, Klatzer & Gahleitner (2024), "Equivariant Graph Neural Networks for Lattice Systems" (NeurIPS)** — Applies equivariant GNNs to physics lattice problems. Shows state-of-the-art results on phase classification — directly analogous to our constraint phase classification.

---

## Concrete Experiment: D6-GNN Constraint Strategist

### Setup
- Train a D6-equivariant GNN on simulated Eisenstein lattice constraint states
- **Input:** Node features (INT8 constraint values) + edge features (differentials)
- **Output:** Priority map (which lattice regions to check first) + anomaly score
- **Training data:** 10,000 simulated constraint states with known anomalies
- **Architecture:** 4 message-passing layers with D6-steerable features

### Measurement
- **Detection accuracy:** Fraction of anomalies correctly identified
- **Speedup:** Reduction in FLUX ISA instructions needed (vs exhaustive checking)
- **Symmetry preservation:** Verify output is D6-equivariant (rotated input → rotated output)
- **Parameter efficiency:** Compare to generic (non-equivariant) GNN baseline

### Expected Result
D6-GNN should achieve >95% anomaly detection with ~30% fewer parameters than generic GNN, and suggest checking strategies that reduce FLUX ISA execution by 40-60% by focusing on likely-anomaly regions.

### Implementation Path
1. Prototype with PyTorch Geometric + e3nn (for equivariant layers)
2. Generate training data from our existing constraint checker (save states + anomaly labels)
3. Train and evaluate on historical data
4. If successful, export to ONNX for integration into FLUX ISA runtime
5. Add to casting-call model roster as "D6-GNN-constraint" specialist

---

## Tripartite Architecture Fit

| Layer | GNN Role |
|-------|---------|
| **Ground Truth** | The lattice state — ground truth that the GNN observes |
| **Constraint** | D6 equivariance IS a constraint on the network — it can only produce D6-valid outputs |
| **Communication (CFP)** | GNN outputs (priority maps, anomaly scores) are natural CFP messages |

---

## Wild Speculation

**The constraint checker that learns to check itself.** What if the GNN didn't just learn checking strategies, but learned to *modify its own architecture* based on the constraint topology it observes?

1. The GNN processes the lattice and outputs not just a checking plan, but a **network architecture modification** — "add another message-passing layer for this region, reduce depth for that region"
2. The modified GNN is more efficient for the *current* constraint topology
3. This is **neural architecture search (NAS) as a constraint operation** — the system optimizes itself

The casting-call system then evaluates not just "which model" but "which architecture variant" for the current workload. The model mutates to fit the problem like a key fitting a lock.

Even wilder: **geometric attention.** What if the GNN's attention mechanism discovered geometric invariants of our constraint system that we haven't noticed? It might find that certain patterns of INT8 values always precede constraint failures — patterns invisible to human analysis because they exist in a 12-dimensional irreducible representation space. The GNN becomes a **discovery engine** for new constraint theorems. It doesn't just check constraints; it finds new ones.
