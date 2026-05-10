# Operational Modes: Jazz as Fleet Orchestration Framework

## The T-Minus Framework

A birth in military terms is measured as T-minus 30 seconds. Every event is simulated and a time-to-event is the basis of orientation.

**The rule:** When an expected event happens at T-minus-zero, there is no reason to continue orienting to it. **Only when T-minus reaches zero and the expected event DOESN'T happen** is there reason to get the intelligent people in the room involved.

This is the Ground Truth agent's entire job: maintain T-minus countdowns for every expected event. When events arrive on time — silence. When they don't — escalate.

### Implication for Constraint Checking
A constraint is an expected event. "Value will be between lo and hi." When it is — silence. When it isn't — that's a T-minus-zero violation. That's when the system wakes up.

The folding order IS a T-minus countdown:
- Stage 0: Raw timing (T-minus variable)
- Stage 1: Cycle-normalized (T-minus calibrated)
- Stage 2: Throughput-parameterized (T-minus expected)
- Stage 3: Thermal-normalized (T-minus adjusted)
- Stage 4: Utilization fingerprint (T-minus compared)
- Stage 5: Binary decision (T-minus-zero check — did the event happen or not?)

---

## Three Modes of Operation

### Mode 1: Duke Ellington — Orchestrated Precision

**Sound:** Composed soundscapes, each member has their part, perfection-minus-mistakes.

**When to use:** Certification, formal verification, production releases, DO-178C evidence, Coq proofs, exhaustive testing.

**Fleet equivalent:**
- 81 Coq theorems
- Exhaustive INT8 verification (8.4M combinations)
- DO-178C evidence packages
- The CUDA constraint engine API surface
- Production constraint checking with guaranteed zero mismatches

**Characteristics:**
- Every part is written
- Rehearsal is mandatory
- Mistakes are failures
- The audience expects the score
- Time investment: HIGH per output
- Risk tolerance: ZERO

**Seed-pro's critique applied:** Duke mode is essential but expensive. The mistake was living in Duke mode for 11 months on CUDA verification after discovering FP64 is free. Duke mode should be reserved for things that MATTER — the four tools, the certification path, the security boundary.

---

### Mode 2: Count Basie — Emergent Groove

**Sound:** Players drift in and out, might not know the songs, pick up the head after a few times, head off in improvisation. Something-is-brewing-here, let-it-happen.

**When to use:** Research exploration, prototyping, hackathons, frontier discovery, "spin it up and see what comes back."

**Fleet equivalent:**
- The 18 research topics (quantum tensor networks, Tonnetz, protein folding, etc.)
- The biological/musical/crystallographic springboards
- "What if constraint checking IS a renormalization group flow?"
- The tonnetz-constraints experiment (constraint solving as music)
- 3 agents spinning in parallel, see what sticks

**Characteristics:**
- No written parts
- Players find each other in real time
- Mistakes are directions
- The audience expects surprise
- Time investment: LOW per exploration
- Risk tolerance: HIGH
- Yield rate: ~10% (most explorations go nowhere, but the 10% that hit are GOLD)

**The Basie finding that mattered:** BF16 signal collapse wasn't found in Duke mode. It was found in Basie mode — running experiments, seeing weird numbers, following the thread. The $12B insight came from "something is brewing here."

---

### Mode 3: Miles Davis — Poly-Mind-Flow

**Sound:** Unexpected as possible, constrained to the room and moment. Players know each other like brothers. They mix and match combos. People listen to each other. Songs are the court. The evening is the art.

**When to use:** Strategic synthesis, reverse-actualization, multi-model analysis, fleet coordination, "the intelligent people in the room" moment.

**Fleet equivalent:**
- The DeepInfra 4-model reverse-actualization (Seed-pro + Hermes + Qwen + Seed-code breathing together)
- The tripartite room when all three agents are actively communicating
- Fleet-wide coordination when Oracle1 + Forgemaster + other agents are in flow
- The moment when Ground Truth says "T-minus-zero violation" and Constraint and Communication both respond

**Characteristics:**
- No leader, just the palette
- Players listen more than they play
- The room constrains, not the chart
- Silence is as important as sound
- Time investment: MODERATE per session
- Output: SYNTHESIS, not artifacts
- The output is the conversation itself

**What Miles mode produces:** Not code, not papers, not repos. **Judgment.** The Seed-pro's "fix the three blockers, ship four tools, delete everything else" IS a Miles-mode output. It came from 4 models listening to each other and finding the groove.

---

## Room Composition: Who's In the Room

It's not just HOW you play — it's WHO is playing.

### Duke's Room: Rehearsed Experts
Everyone studied the score. They come prepared to argue their position perfectly.

- **Seed-code technical audit** — verified VNNI offset encoding step by step, computed the contraction constant k=1/√3, proved the Tonnetz group homomorphism. Knew the math cold.
- **Coq verification** — 81 theorems from deep domain expertise
- **Hermes-3-405B** challenged claims with rigorous follow-up questions

**Value:** Catches what improvisers miss. Precision. Rigor. No handwaving survives.

### Basie's Room: Fresh Outsiders
People drift in who don't even know the topic. They pick up the head after hearing it twice.

- **Hermes-405B red-team** — never saw our codebase, asked "is this benchmarketing?" — the question insiders can't ask because they're too close
- **A quantum physicist** walking into a constraint session and saying "your folding order IS a renormalization group flow"
- **A musician** looking at the hex lattice and saying "that's a Tonnetz"
- **Qwen3-235B VC** — doesn't care about the math, asks "what do you SELL and to WHOM?" — the business question no engineer asks

**Value:** Sees what experts are blind to. Fresh framing. The outsider's question that reframes everything.

### The Fleet Principle
Every PLATO room should be able to call in BOTH kinds of players:
- Tripartite agents (Ground Truth, Constraint, Communication) = Duke players (they live here, they know the songs)
- Communication agent can pull in any model on DeepInfra = Basie players (fresh ears, no domain knowledge, outsider perspective)

### When to Call Which Room
- **Expected event, normal operation** → Duke players (they rehearsed this)
- **T-zero violation, Duke players stumped** → Call Basie players (fresh ears on unexpected problem)
- **Basie player finds something weird** → Miles mode (everyone breathes together)
- **Certification deadline** → Duke only (no improvisation during audit)
- **"Why aren't people using this?"** → Basie (the answer is always something insiders can't see)

---

## The Meta-Insight: Time is Finite

> Time is your one real finite thing you have between now and a deadline.

Duke mode is expensive. Basie mode is cheap. Miles mode is precious.

The fleet's operating principle should be:

1. **Default to Basie mode** — cheap exploration, high throughput, 90% goes nowhere
2. **When Basie finds something, switch to Miles mode** — get the right models/agents in the room, synthesize judgment
3. **When Miles produces a verdict, execute in Duke mode** — but ONLY for the things that matter
4. **The T-minus framework governs mode switches** — expected events are Basie, T-zero violations are Miles, certification deadlines are Duke

### The Anti-Pattern
The anti-pattern is living in Duke mode (like we did for 11 months on CUDA). Duke mode feels productive because you're making things perfect. But perfection is only valuable for the 4 repos that actually matter. The other 48 repos should have stayed in Basie mode forever — prototypes, not products.

---

## Implementation in PLATO

### Room Modes
Each PLATO room has a mode dial:

```
[Basie ⟷ Miles ⟷ Duke]

Basie: High throughput, low ceremony, "spin it up"
Miles: Multi-agent synthesis, poly-mind-flow, "breathe together"  
Duke: Formal verification, certification, "get it right"
```

### Mode Triggers
- **T-minus countdown normal** → Basie mode (keep exploring)
- **T-minus-zero violation** → Miles mode (get intelligence in the room)
- **Certification deadline** → Duke mode (execute precisely)
- **Basie finds gold** → Miles mode (synthesize what it means)
- **Miles produces verdict** → Duke mode (execute on the verdict)

### Agent Behavior by Mode
- **Ground Truth in Basie**: passive monitoring, logging, no alerts
- **Ground Truth in Miles**: active synthesis, connecting dots, flagging patterns
- **Ground Truth in Duke**: rigorous verification, temporal attestation, certification evidence
- **Constraint in Basie**: cheap checks, fast paths, "good enough"
- **Constraint in Miles**: adaptive precision, listening to other agents' needs
- **Constraint in Duke**: exhaustive verification, zero tolerance, formal proofs
- **Communication in Basie**: minimal, logs only, "heads down"
- **Communication in Miles**: flowing, bidirectional, "breathe together"
- **Communication in Duke**: formal reports, audit trails, certification artifacts

---

## The Reverse-Actualization Verdict (Miles Mode Output)

From our DeepInfra session, the Miles-mode synthesis:

**Stop Duke-moding things that don't matter.** The four tools are:
1. eisenstein-c (constraint checking core)
2. folding-order (Ground Truth's algorithm)
3. tonnetz-constraints (the isomorphism that connects math to art)
4. plato-runtime (the thing that ties it all together)

Everything else is Basie fodder — keep exploring, keep spinning agents, but don't polish. Ship rough, learn fast, Miles-mode the synthesis, Duke-mode only the cert path.

**The T-minus-zero events that matter:**
1. Does the constraint check return correct results? (Yes — 8.4M verified)
2. Does the folding order detect anomalies? (Yes — 0 false positives, catches 10x)
3. Does the Tonnetz mapping work? (Yes — proven group homomorphism)
4. Does plato-runtime discover hardware? (Yes — Ryzen + RTX 4050 profiled)

Everything else is expected events. Silence is appropriate. Move on.

---

*"Don't play what's there, play what's not there." — Miles Davis*
*"It's not the note you play that's the wrong note — it's the note you play afterwards that makes it right or wrong." — Miles Davis*
*"The most important thing I look for in a musician is whether he knows how to listen." — Duke Ellington*
*"Every day we make music, and every day we make it better." — Count Basie*
