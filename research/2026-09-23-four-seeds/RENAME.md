# RENAME.md — the four seeds, renamed for the fleet

Fleet naming register (measured against the live org, 2026-09-23):

| Register word | Repos in org matching name | Reads as |
|---|---|---|
| `vessel` | 26 | a thing that carries work |
| `tide` | 6 | a thing that moves on a schedule |
| `harbor` | 2 | a place things dock |
| `instrument` | 2 | a thing that measures |

Every name below was checked for collision with
`gh api repos/SuperInstance/<name>` → 404 (free) on 2026-09-23.

## The table

| Upstream fork | Fleet name | Register | Why this name |
|---|---|---|---|
| `InternLM/StarBench` | **`tidetable`** | tide | A tide table is a *time-indexed prediction you are required to reason against* — you do not guess when the water moves, you read the table and then you are accountable to it. That is exactly what a spatio-temporal benchmark is. Alternates: `leadline` (the weighted line that measures the depth of the water column under you — temporal depth sounding), `echogram`. |
| `Tencent-Hunyuan/UniRL` | **`purser`** | vessel-officer | The purser is the officer who *pays out against receipts*. UniRL's whole job in this fleet is to convert witness receipts into reward. No receipts, no pay. Alternates: `logbook`, `scale`. |
| `SWivid/F5-TTS` | **`foghorn`** | instrument | The vessel's voice across water when visibility is zero — heard, attributed, and impossible to fake at distance. Flow-matching TTS is precisely this: the fleet speaking in its own voice. **Alternates: `canticle`, `plainsong-voice`** (sibling to the live `SuperInstance/plainsong`). |
| `ZhikangNiu/encodec-pytorch` | **`shanty`** | artifact | A shanty is a song compressed to its load-bearing skeleton so a crew can carry work in rhythm — high information per byte, built to be reproduced exactly by people who were not there when it was made. A neural audio codec is the same thing: audio reduced to a token stream any node can rebuild. Alternates: `bottle-voice` (message in a bottle — sunset-ecosystem already has a `bottles/` dir). |

## The collision that forces the F5 rename

This is not a taste call. **`F5` is already a term of art in this fleet, and it
means *withdrawal*.**

`kev-substrate-competition/harness/gates.py`:

```python
# line 6
Broken chain = withdrawal (F5), not a low score.
# line 28-29
GateFailure(1, "empty witness log; a metric without a chain "
               "is a withdrawal (F5)")
```

`witness.py:26` calls the same idea "F5 doctrine: metrics without a verifiable
chain are withdrawals."

So the fleet currently has a *receipt-chain failure code* spelled `F5`, and a
fork named `F5-TTS` that would emit exactly the audio payloads those gates
score. Any agent grepping the fleet for `F5` gets both. Worse: a voice stack
named F5 that fails to produce a chain would read, in fleet logs, as
"F5 → withdrawal" — the model's name and the verdict for missing evidence are
the same token.

Renaming to `foghorn` removes the ambiguity and puts the repo in the
`instrument` register, where the fleet's other measuring/sounding devices
already live.

## Suggested descriptions (for the rename PR)

| Name | `description` |
|---|---|
| `tidetable` | Time-aware evaluation instrument: agents reason over hash-chained event streams, twist spectra, and music-evolution trajectories. Fleet-native StarBench. |
| `purser` | Reward layer that pays out against receipts. Consumes witness coherence, gate pass/fail, σ readings, and QD-archive coverage. Unified RL adapter. |
| `foghorn` | Flow-matching TTS instrument. Every utterance leaves as a receipted cell. |
| `shanty` | Neural audio codec. Audio as a hash-able discrete token stream — the EFFECT payload of a voice cell. |

## Register discipline note

Two of the four land as `instrument`/`artifact` rather than `vessel`. That is
deliberate: **forks are not vessels.** A vessel carries work and has a charter;
these four are *organs* that other vessels call. The `instrument` register is
underused (2 repos) and is the correct home for reusable capability rather
than for autonomous work. Recommend the fleet adopt `instrument` as the
default register for upstream forks being rebuilt as libraries, reserving
`vessel` for things with their own charter and their own loop.
