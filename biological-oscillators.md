# Biological Oscillators and Temporal Synchronization

## Executive Summary

Biological systems synchronize vast numbers of oscillators with minimal communication: ~10¹³ cells in the human body maintain circadian coherence through chemical signaling; fireflies flash in unison via line-of-sight; cardiac pacemaker cells synchronize via gap junctions. The mathematical framework is the **Kuramoto model** — a system of coupled phase oscillators that achieve global synchronization when coupling strength exceeds a critical threshold. This maps directly to our temporal-based alignment architecture, where the "physics-as-clock" paradigm and idle harvester timing are forms of oscillator synchronization.

## Our Connection

Our system has three temporal synchronization challenges that map to biological oscillators:

1. **Physics-as-clock**: Our constraint engine uses physical timing (frame boundaries, physics ticks) as a synchronization signal — exactly like circadian oscillators using light/dark cycles as a Zeitgeber (time-giver)
2. **Idle harvester**: The idle harvester fires at regular intervals to check for work — like a pacemaker cell that fires autonomously and entrains other cells
3. **3-agent rooms**: The tripartite architecture (Ground Truth, Constraint, Communication) must maintain temporal coherence — like three coupled oscillators seeking phase-lock

The Kuramoto model gives us the math: `dθᵢ/dt = ωᵢ + (K/N) Σ sin(θⱼ - θᵢ)` where K is coupling strength and N is the number of oscillators. When K > Kc (critical coupling), the system spontaneously synchronizes.

## State of the Art

### 1. The Kuramoto Model and Critical Coupling
The fundamental result: for N oscillators with natural frequencies drawn from distribution g(ω), there exists a critical coupling Kc = 2/(π·g(0)). Below Kc, oscillators drift incoherently. Above Kc, partial synchronization emerges. Well above Kc, full synchronization occurs.

**For our system**: The "coupling" between rooms is the constraint propagation messages. If the message rate exceeds a threshold (analogous to Kc), the rooms will synchronize their processing states.

### 2. Circadian Computing (Biological Clock-Inspired Algorithms)
Circadian rhythms are implemented by transcription-translation feedback loops (TTFLs):
- PER/CRY proteins accumulate → inhibit their own transcription → degradation → restart
- This creates ~24-hour oscillations at the single-cell level
- SCN (suprachiasmatic nucleus) cells synchronize via VIP (vasoactive intestinal peptide) signaling
- The SCN acts as a "master clock" that entrains peripheral clocks

**Computational insight**: Each cell is a simple oscillator (a few genes). Synchronization emerges from minimal coupling (one neurotransmitter). This is the biological version of "3-agent room synchronization via a single message channel."

### 3. Kuramoto on Networks (Topology Matters)
When oscillators are arranged on a network (not all-to-all coupling), the topology determines synchronization:
- **Scale-free networks**: Synchronize more easily (hubs create strong coupling paths)
- **Regular lattices**: Harder to synchronize (long paths)
- **Small-world networks**: Optimal balance — short paths + local clustering

**For our fleet**: The Cocapn fleet is a small-world network (hubs like Oracle1, specialists like Forgemaster). This topology is naturally conducive to synchronization.

### 4. Chimera States (Coexistence of Sync and Async)
Kuramoto-like systems can exhibit "chimera states" — some oscillators synchronize while others remain incoherent. Discovered by Kuramoto & Battogokh (2002), experimentally observed in coupled chemical oscillators (2012) and mechanical metronomes (2013).

**Relevance**: A fleet of agents might naturally form chimera states — some agents synchronized on a task while others explore independently. This is actually desirable: sync for coordination, async for exploration.

### 5. Phase Response Curves (PRCs) for Agent Timing
In neuroscience, the Phase Response Curve describes how an oscillator's phase shifts when it receives a pulse at a given phase. PRCs are:
- **Type I (weak coupling)**: Pulses only advance the phase → gradual synchronization
- **Type II (strong coupling)**: Pulses can advance or delay → faster but potentially unstable synchronization

**Agent analogy**: An agent's "PRC" describes how its processing timing shifts when it receives a message. The message timing (early/late in its processing cycle) determines whether it speeds up or slows down.

## Concrete Experiment to Try

### "Kuramoto Fleet Synchronization"
Implement Kuramoto-style synchronization for the fleet:

1. **Model each agent as a phase oscillator**: θᵢ(t) = processing phase (0 to 2π)
   - Phase 0: Idle/ready
   - Phase π/2: Processing
   - Phase π: Waiting for response
   - Phase 3π/2: Syncing/checkpointing

2. **Coupling via CFP messages**: When agent i sends a CFP to agent j, the message carries a phase timestamp. Agent j adjusts its phase: `θⱼ += K · sin(θᵢ - θⱼ)`

3. **Measure**: Does the fleet naturally synchronize processing phases? Do chimera states emerge? What coupling strength K is needed for 3-agent rooms to phase-lock?

4. **Idle harvester as Zeitgeber**: The idle harvester fires at fixed intervals — like a light/dark cycle. Does this entrain the agents? How long does entrainment take?

## Tripartite Architecture Fit

| Room | Oscillator Role | Biological Analog |
|------|----------------|-------------------|
| Ground Truth | Master oscillator (fixed frequency) | SCN master clock |
| Constraint | Coupled oscillator (adapts to GT) | Peripheral tissue clock |
| Communication | Phase detector (measures alignment) | Retinal light detector |

The synchronization flow:
1. **Ground Truth** ticks at fixed frequency (physics clock) → provides Zeitgeber
2. **Constraint** adjusts its processing phase to align with GT → entrainment
3. **Communication** reports phase alignment → feedback signal
4. System reaches phase-lock when all three rooms are synchronized

## Wild Speculation

1. **Temporal constraint satisfaction**: Instead of checking constraints spatially (which variables violate), check them temporally (at what phase do violations occur). A constraint that's violated at a specific phase might be trivially fixable by phase-shifting the processing.

2. **Epilepsy as constraint cascade**: Epileptic seizures are pathological synchronization — too many neurons phase-lock at once. In a fleet, "seizure" would be all agents synchronizing on the same task, ignoring everything else. Anti-seizure mechanisms (inhibition, refractory periods) could prevent fleet-wide cascade failures.

3. **Jet lag for agents**: When an agent's context changes (new task, compaction, restart), it experiences "jet lag" — its internal phase is misaligned with the fleet. Recovery time follows the same dynamics as circadian jet lag (roughly 1 day per timezone crossed → 1 processing cycle per phase offset).

4. **Oscillatory computation**: Some computations are naturally periodic (monitoring, harvesting, polling). Representing these as oscillators rather than loops would allow Kuramoto-style synchronization to emerge naturally. The "computation" IS the synchronization.

5. **Quantum-like superposition via desynchronization**: When agents are desynchronized (chimera state), they effectively explore multiple possibilities simultaneously — a classical analog of quantum superposition. Synchronization collapses this to a single solution — a classical analog of wavefunction collapse.

## Implementation Sketch

```python
"""
Kuramoto Fleet Synchronization Model
Maps fleet agents to coupled phase oscillators
"""

import math
import random
from dataclasses import dataclass, field
from typing import List, Dict, Tuple

@dataclass
class AgentOscillator:
    """An agent modeled as a Kuramoto phase oscillator"""
    agent_id: str
    natural_freq: float       # ω: intrinsic processing speed (rad/s)
    phase: float              # θ: current processing phase [0, 2π)
    phase_history: List[float] = field(default_factory=list)
    
    def phase_label(self) -> str:
        """Human-readable phase state"""
        p = self.phase % (2 * math.pi)
        if p < math.pi / 4:     return "IDLE"
        elif p < 3*math.pi/4:   return "PROCESSING"
        elif p < 5*math.pi/4:   return "WAITING"
        elif p < 7*math.pi/4:   return "SYNCING"
        else:                    return "IDLE"

class KuramotoFleet:
    """
    Fleet synchronization via Kuramoto model.
    
    Each agent is a phase oscillator. Messages between agents
    create coupling that drives synchronization.
    """
    
    def __init__(self, coupling_strength: float = 1.0):
        self.agents: Dict[str, AgentOscillator] = {}
        self.K = coupling_strength  # Global coupling strength
        self.dt = 0.01             # Time step
        self.time = 0.0
        self.order_history: List[Tuple[float, float]] = []
    
    def add_agent(self, agent_id: str, natural_freq: float, initial_phase: float = None):
        """Register an agent as an oscillator"""
        phase = initial_phase if initial_phase is not None else random.uniform(0, 2*math.pi)
        self.agents[agent_id] = AgentOscillator(
            agent_id=agent_id,
            natural_freq=natural_freq,
            phase=phase
        )
    
    def order_parameter(self) -> Tuple[float, float]:
        """
        Kuramoto order parameter r·e^(iψ) = (1/N) Σ e^(iθⱼ)
        r ∈ [0,1]: coherence (0=desynchronized, 1=perfect sync)
        ψ: mean phase
        """
        N = len(self.agents)
        if N == 0:
            return (0.0, 0.0)
        
        real = sum(math.cos(a.phase) for a in self.agents.values()) / N
        imag = sum(math.sin(a.phase) for a in self.agents.values()) / N
        
        r = math.sqrt(real**2 + imag**2)
        psi = math.atan2(imag, real)
        return (r, psi)
    
    def step(self):
        """Advance one time step using Kuramoto dynamics"""
        N = len(self.agents)
        if N == 0:
            return
        
        r, psi = self.order_parameter()
        self.order_history.append((self.time, r))
        
        # Update each agent's phase
        new_phases = {}
        for agent in self.agents.values():
            # Kuramoto equation: dθ/dt = ω + (K/N)·Σ sin(θⱼ - θᵢ)
            # In mean-field form: dθ/dt = ω + K·r·sin(ψ - θ)
            coupling = self.K * r * math.sin(psi - agent.phase)
            
            new_phase = agent.phase + (agent.natural_freq + coupling) * self.dt
            new_phases[agent.agent_id] = new_phase % (2 * math.pi)
        
        for agent_id, phase in new_phases.items():
            self.agents[agent_id].phase = phase
            self.agents[agent_id].phase_history.append(phase)
        
        self.time += self.dt
    
    def simulate(self, duration: float) -> List[Dict]:
        """Run simulation and return snapshots"""
        snapshots = []
        steps = int(duration / self.dt)
        
        for _ in range(steps):
            self.step()
            if _ % 100 == 0:  # Sample every 100 steps
                r, psi = self.order_parameter()
                snapshot = {
                    "time": self.time,
                    "order_r": r,
                    "mean_phase": psi,
                    "phases": {
                        a.agent_id: a.phase_label()
                        for a in self.agents.values()
                    }
                }
                snapshots.append(snapshot)
        
        return snapshots
    
    def critical_coupling(self) -> float:
        """
        Estimate Kc (critical coupling for synchronization).
        For uniform distribution on [ω_min, ω_max]:
        Kc ≈ 2 / (π · g(0)) where g(0) = 1 / (ω_max - ω_min)
        """
        freqs = [a.natural_freq for a in self.agents.values()]
        spread = max(freqs) - min(freqs)
        if spread == 0:
            return 0.0  # Already identical
        g0 = 1.0 / spread  # Density at center of uniform distribution
        return 2.0 / (math.pi * g0)


class TripartiteSync:
    """
    Specialized synchronization for the tripartite room architecture.
    Three rooms = three coupled oscillators.
    """
    
    def __init__(
        self,
        gt_freq: float = 1.0,      # Ground Truth tick rate
        constraint_freq: float = 0.8, # Constraint processing rate
        comm_freq: float = 1.2,       # Communication polling rate
        coupling: float = 2.0,
    ):
        self.fleet = KuramotoFleet(coupling_strength=coupling)
        self.fleet.add_agent("ground_truth", gt_freq, 0.0)
        self.fleet.add_agent("constraint", constraint_freq, random.uniform(0, 2*math.pi))
        self.fleet.add_agent("communication", comm_freq, random.uniform(0, 2*math.pi))
    
    def sync_analysis(self, duration: float = 10.0) -> Dict:
        """Run synchronization analysis for tripartite room"""
        snapshots = self.fleet.simulate(duration)
        
        # Time to synchronization (r > 0.9)
        sync_time = None
        for s in snapshots:
            if s["order_r"] > 0.9:
                sync_time = s["time"]
                break
        
        final_r = snapshots[-1]["order_r"] if snapshots else 0.0
        
        return {
            "sync_time": sync_time,
            "final_coherence": final_r,
            "critical_coupling": self.fleet.critical_coupling(),
            "actual_coupling": self.fleet.K,
            "is_synchronized": final_r > 0.8,
            "final_phases": snapshots[-1]["phases"] if snapshots else {},
        }


# === Example: 3-Agent Room Synchronization ===
if __name__ == "__main__":
    # Model the tripartite architecture as Kuramoto oscillators
    tripartite = TripartiteSync(
        gt_freq=1.0,          # Ground Truth: 1 Hz (physics clock)
        constraint_freq=0.7,   # Constraint: slightly slower (heavier processing)
        comm_freq=1.3,         # Communication: faster (lighter polling)
        coupling=3.0,          # Strong coupling (frequent messages)
    )
    
    result = tripartite.sync_analysis(duration=20.0)
    
    print("=== Tripartite Room Synchronization ===")
    print(f"Critical coupling Kc: {result['critical_coupling']:.3f}")
    print(f"Actual coupling K:    {result['actual_coupling']:.3f}")
    print(f"Time to sync (r>0.9): {result['sync_time']:.2f}s" if result['sync_time'] else "Did not synchronize")
    print(f"Final coherence r:    {result['final_coherence']:.3f}")
    print(f"Phase states:         {result['final_phases']}")
    
    # Also test a 9-agent fleet (full Cocapn fleet)
    fleet = KuramotoFleet(coupling_strength=1.5)
    fleet.add_agent("oracle1", 1.0)
    fleet.add_agent("forgemaster", 0.8)
    fleet.add_agent("captain", 0.9)
    fleet.add_agent("navigator", 1.1)
    fleet.add_agent("quartermaster", 0.7)
    fleet.add_agent("chief", 1.2)
    fleet.add_agent("safety", 0.95)
    fleet.add_agent("scribe", 1.05)
    fleet.add_agent("lookout", 0.85)
    
    snapshots = fleet.simulate(duration=30.0)
    print(f"\n=== 9-Agent Fleet Sync ===")
    print(f"Final coherence: {snapshots[-1]['order_r']:.3f}")
    print(f"Kc: {fleet.critical_coupling():.3f}")
```

## Key References

- Kuramoto, Y. (1975). "Self-entrainment of a population of coupled non-linear oscillators." *International Symposium on Mathematical Problems in Theoretical Physics*, 420-422.
- Strogatz, S.H. (2000). "From Kuramoto to Crawford: exploring the onset of synchronization in populations of coupled oscillators." *Physica D*, 143(1-4), 1-20.
- Abrams, D.M. & Strogatz, S.H. (2004). "Chimera states for coupled oscillators." *Physical Review Letters*, 93(17), 174102.
- Winfree, A.T. (2001). *The Geometry of Biological Time*. Springer.
- Glass, L. & Mackey, M.C. (1988). *From Clocks to Chaos: The Rhythms of Life*. Princeton University Press.
