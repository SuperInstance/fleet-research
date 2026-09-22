# The four repos, unified — and how to work across them

*A shorter companion to the three deep dives. Read this first if you are an
agent; read the others when you need the detail.*

## The layer above all four

**The Echogram.** The name is not invented here — it is already in the
fleet's vocabulary, and it already means exactly this. `quilt/docs/specs/0001-fascia-layer.md:210`
defines **the Echogram Pattern**: cheap soundings taken continuously, stacked
in time, until *"when you stack 100 boats' echograms in time, you see a shape
that no single boat can see."* An echogram is a time-indexed record of depth.
That is the layer above these four repos and above the rest of the fleet too:

> **Time-indexed evidence is the fleet's native signal. Audio, 4D space,
> speech, and reward are four dialects of it.**

Every one of the four takes a continuous signal and produces a *verifiable,
time-indexed artifact* — and the artifact, not the signal, is what the fleet
keeps:

| Dialect | Repo → fleet name | Signal in | Receipt out |
|---|---|---|---|
| **4D** | StarBench → `tidetable` | sound moving through space and time | a scored rotation set over that motion |
| **speech** | F5-TTS → `foghorn` | text | audio attributed to a speaker, at a tick |
| **audio** | encodec → `shanty` | audio | a discrete token stream, hash-able |
| **reward** | UniRL → `purser` | the receipts themselves | a scalar that changes a policy |

Note the direction of the last one. The other three produce receipts; the
purser *consumes* them and pays out. That closes the loop, and it is why the
four belong in one lane: **`shanty` and `foghorn` make the signal, `tidetable`
makes reasoning over the signal measurable, `purser` makes the measurement
change behaviour.** Three dormant repos wake up as the input leg of a loop
whose output leg is a reward.

What makes this one layer rather than four metaphors is that all four sit on
the same three primitives the fleet already has: **a cell** (the unit),
**a hash** (the address, FNV-1a-64 over UTF-8 *bytes*), and **a tick**
(the temporal index). Change the dialect and only the payload changes.

## Agent onboarding — working across these repos

### Read in this order

1. **`PROGRESS.md` in this directory.** Every number below it was produced by
   a command in this lane, and it records four places the brief was wrong.
   Trust it over your prior.
2. **`kev-substrate-competition/harness/witness.py`** (92 lines). The receipt
   is the fleet's atom. If you do not know the 7 required keys you cannot
   write a cell, and anything you write without a chain is a withdrawal.
3. **`kev-substrate-competition/harness/hashutil.py`** (53 lines). The bytes
   law. Short, and it will save you an afternoon.
4. **`starbench-evolution.md`** here — the flagship.
5. Then whichever deep dive matches the repo you are about to touch.

### Vocabulary

| Term | What it actually means | Trap |
|---|---|---|
| **cell** | One link in a receipt chain. `witness.py:6-28`. | Not a spreadsheet cell. `quilt-kernel.py` cells are a *different* cell — 8 primitives. |
| **withdrawal** | A number with no verifiable chain. Scored as **`'Z'`**, not zero. | `gates.py` spells this **"F5"**. Collides with the F5-TTS fork name — see [RENAME.md](RENAME.md). |
| **σ (sigma)** | Two unrelated things. Twist: σ = 0.24·**s**, s = mean nearest-neighbour spacing — *a distance*. duke-lab: σ = a per-round critic distance — *a number*. | Quoting twist σ as "0.24 seconds" is wrong and it will be noticed. |
| **s** | Mean nearest-neighbour spacing of the point cloud. The twist instrument's unit of length. | Not seconds, not samples. |
| **the canary** | `fnv1a64("café Δ 日本語") == 0x24a555471370b18d`. Gate #0: if this fails, *every later verdict is void*. | Canonical string form is 16 hex digits. The docs' 17-digit spelling is the same integer. **Compare numerically, never as strings.** |
| **bytes law** | Hash UTF-8 **bytes**, not code points. An `ord()`-per-codepoint loop gives `0x77ff2029b867f2b5` and fails the pin. | The single most common interop bug in the fleet. |
| **AA / ACR** | Average Accuracy / **All-Correct Rate**. ACR only credits an item if *every* rotation is right. | ACR is an integrity metric wearing a benchmark's clothes. It is why a chain scores honestly. |
| **shear / re-twist / flat** | Honest / lie / costume. `flatness ≥ 0.75` → flat; `re_twist_rate ≥ 0.75` → re-twist; else shear. | flat ≠ "no opinion". flat = *absence of strain where strain should be*. |
| **QD archive** | Quality-Diversity archive, MAP-Elites. Coverage = distinct-opcodes/8. | Coverage is a *diversity* score, not a quality score. |
| **8 primitives** | The quilt kernel's `Zin, Zout, Jepa, DoubleEntry, Vibe, Gc, Murmur, Graph`. | The brief said 6 opcodes. **8 is what ships.** |

### Paradigm map — what kind of thing each repo is

- **`tidetable`** is an *instrument* (register word: measures). Stateless
  about content, strict about process. It never decides truth; it reports
  whether a claim survived rotation.
- **`foghorn`** is an *instrument* (speaks). Deterministic given a seed; its
  output is only as trustworthy as the chain you attach to it.
- **`shanty`** is an *artifact codec*. Pure function: PCM → tokens → PCM.
  Determinism is the whole point — a token stream that does not round-trip
  byte-exactly is useless as a payload.
- **`purser`** is the only one that *changes state* (it moves a policy). It is
  also the only one that must never be trusted with an unverified number,
  because it is the one that pays.

**Consequence for agents:** instruments are safe to call freely. The purser
is not. Never hand `purser` a metric that did not come out of a chain, because
`score_and_attach` will refuse it — and if you pre-compute rewards to get
around that, it raises. The refusal is the design working.

### The three things to check before you claim anything

1. **Is it chained?** No chain → it is a withdrawal. Do not report it as a
   number.
2. **Is the gate passable?** An unreachable gate produces an all-identical
   reward group → `group_std = 0` → zero gradient. It will not fail loudly.
   It will silently teach nothing. Check the honest floor first
   (σ wall: reachable is ~0.0720, not 0.055).
3. **Did you hash bytes?** If the canary fails, stop. Nothing after it counts.
