# Self-Healing Distributed Systems

## Executive Summary

Self-healing systems automatically detect, diagnose, and recover from faults without human intervention. The concept (autonomic computing, IBM 2001) is experiencing a renaissance through microservices, edge computing, and AI-driven operations. New frameworks like AdaptiFlow provide decentralized event-driven autonomy for cloud microservices, while infrastructure-as-code approaches enable self-healing edge networks. Our Ground Truth agent's anomaly detection + self-correcting runtime fits directly into this landscape.

## Our Connection

**Ground Truth agent** detects temporal anomalies in our fleet's execution. The natural next step is automated response: when anomalies are detected, the system self-corrects. This is the detection → diagnosis → repair cycle at the heart of self-healing systems.

## State of the Art

### AdaptiFlow: Event-Driven Autonomy for Cloud Microservices (Dec 2025)
- **Authors**: Zemtsop Ndadji, Bliudze, Quinton
- Decentralized self-adaptive framework for microservices
- Key insight: centralized control models are ill-suited to microservice architectures (too many services, too dynamic)
- Uses autonomous computing principles (MAPE-K loop: Monitor, Analyze, Plan, Execute, Knowledge)
- Event-driven: each service reacts to events independently, no central coordinator

### Self-Healing Edge Networks
- **LoRa + Infrastructure-as-Code** (Carson et al., Aug 2025): Edge devices self-heal using LoRa communication to coordinate recovery when primary connectivity fails
- Key insight: self-healing needs a *fallback communication channel* — if the network is broken, you need another way to send repair commands
- Hardware-in-Loop framework for satellite self-healing networks (Sambrama et al., Jun 2025): LEO satellite constellations with automated fault recovery

### Cyber-Physical Resilience
- **Resilience assessment under coordinated attacks** (Jun 2025): Dynamic game-theoretic framework for assessing and improving resilience of cyber-physical systems under adversarial conditions
- Treats fault recovery as a game between attacker and defender
- Relevant: our constraint engine could be viewed as a cyber-physical system (software controlling GPU hardware)

### Kubernetes-Native Self-Healing
- Kubernetes provides basic self-healing: pod restart, horizontal scaling, rollback
- Advanced: operators that monitor custom resources and take corrective action
- Chaos engineering (Litmus, Chaos Mesh): deliberately inject faults to test self-healing capabilities
- Automated repair: some systems use AI to predict failures and pre-emptively migrate workloads

## What We Should Adopt

1. **MAPE-K loop for Ground Truth**: Extend from pure monitoring (M) to full MAPE-K:
   - **Monitor**: Ground Truth (already exists)
   - **Analyze**: Root cause analysis of anomalies
   - **Plan**: Determine corrective action (restart service, relax constraint, switch GPU, etc.)
   - **Execute**: Automated remediation
   - **Knowledge**: Maintain model of normal system behavior, updated by each incident

2. **Decentralized recovery**: Each agent in the fleet handles its own recovery. No central recovery coordinator — agents self-heal independently using local information.

3. **Fallback communication**: When an agent is in a degraded state, it needs a fallback channel to signal for help. In our case: if the constraint engine crashes, the agent needs a way to report the crash without using the constraint engine.

4. **Chaos engineering for constraint engine**: Deliberately inject faults (GPU memory exhaustion, timeout, malformed constraints) and verify that the system recovers correctly.

## Concrete Experiment

**Phase 1**: Extend Ground Truth with analysis capability
- When anomaly detected, trace back to root cause
- Categorize: hardware fault, software bug, load spike, configuration error
- Build decision tree: given anomaly type X, corrective action is Y

**Phase 2**: Implement automated remediation
- Simple actions first: restart crashed service, retry failed constraint batch, reduce batch size
- More complex: migrate work from failing GPU to healthy one, degrade gracefully
- Safety bounds: never take more than N automated actions in T minutes without human approval

**Phase 3**: Chaos testing
- Inject faults systematically: kill constraint engine mid-solve, exhaust GPU memory, add network latency
- Measure recovery time and correctness
- Iterate until recovery is reliable and fast (<30s for common faults)

## Tripartite Fit

**Constraint Theory**: Self-healing IS constraint satisfaction — the system must satisfy the constraint "service is operational" despite perturbations. Each fault creates new constraints (reduced capacity, increased latency), and the system must find a new feasible solution.

**Formal Verification**: Prove that the self-healing system converges: given any fault within a specified class, the system eventually returns to a healthy state. This is a temporal logic property: `□(fault → ◇healthy)`.

**Production Systems**: Self-healing is a production imperative. Manual intervention doesn't scale. But automated remediation can make things worse if it's wrong. The constraint: self-healing actions must be provably safe (won't cause more damage than the original fault).

## Wild Speculation

What if the constraint engine self-heals by reformulating the problem? When a GPU fails and half the compute capacity disappears, the engine doesn't just retry — it reformulates the constraint problem to work within the reduced resource envelope. "Self-healing through constraint relaxation": the system finds the best solution achievable with available resources, rather than waiting for full capacity.

Even wilder: a self-healing system that uses its own anomaly detection to improve. Each fault is a training signal. The system builds an internal model of "what breaks and how to fix it" that gets better over time. After 1000 incidents, it has a personalized repair manual that no human could write — because no human has seen 1000 production incidents in this specific system configuration. The system becomes more robust than its designers could have made it.
