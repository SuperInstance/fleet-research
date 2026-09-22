# StarBench → `tidetable`: the evolution thesis

*Source: `InternLM/StarBench` → `SuperInstance/StarBench`. Fork verified
byte-identical to parent (`compare` → `status: identical, ahead_by 0`). Fleet
name: **`tidetable`** — see [RENAME.md](RENAME.md).*

**Paper:** *STAR-Bench: Probing Deep Spatio-Temporal Reasoning as Audio 4D
Intelligence*, arXiv:2510.24693. Liu & Niu et al. (equal contribution),
Beihang / Shanghai AI Laboratory / SJTU / CUHK. Code licence **MIT** (the
`LICENSE` file; the README's Apache-2.0 badge contradicts it and the file
wins). **Data is CC BY-NC 4.0 and lives on HuggingFace, not in the repo** —
so evolving the harness is unencumbered, and the plan below never reuses
their audio anyway.

---

## 1. What it probes

First, the framing check: **the "audio 4D intelligence" gloss is upstream's
own, not ours.** README line 59: *"We formalize **audio 4D intelligence** that
is defined as reasoning over sound dynamics in time and 3D space, and
introduce a **STAR-Bench** to measure it."* Repo description on GitHub says
the same. 4D = 3 spatial dimensions + time, over **audio**. Not video, not
graph, not text. The only correction worth making is that "4D" is not exotic —
it is binaural/ambisonic audio plus clip ordering.

Two settings, 2,353 items (counts computed from the real HF
`meta_info/*.json`, not the paper's prose):

| Split | Items | What it asks |
|---|---|---|
| Foundational Acoustic Perception | 951 | 6 attributes (pitch, loudness, duration, azimuth, elevation, distance) × {Absolute Range, Relative Sensitivity} |
| Holistic Temporal | 900 | Reorder 3 scrambled clips: `Object Spatial Motion` 269, `In-Situ State Evolution` 215, `Daily Scene Scripts` 180, `Tool & Appliance Operation` 204, `Event-Triggered Consequences` 32 |
| Holistic Spatial | 502 | `Single-Source Static Localization` 283, `Multi-Source Spatial Relation` 113, `Dynamic Trajectory Tracking` 106 |

Under `--robust-eval` (default on) that is **7,986 inference runs**.

### The headline result

Read off `assets/results.png` (there is no machine-readable leaderboard):

| | Perception MA | Temporal OA | Spatial OA | **MA %** |
|---|---|---|---|---|
| Random guess | 25.33 | 14.29 | 33.33 | **24.32** |
| Human | 75.60 | 88.00 | 73.72 | **79.11** |
| Gemini 2.5 Pro (best of 19) | 46.64 | 58.52 | 43.62 | **49.59** |
| MiDashengLM (best open) | 33.24 | 16.30 | 44.29 | 31.28 |

The best model reaches ~63% of human. Open models sit **near random on
temporal reasoning** (16.30 vs 14.29 random). The paper's flagship claim:
where prior benchmarks lose only a little under caption-only answering
(MMAU −5.9%, MMAR −9.0%), STAR-Bench loses **−31.5% temporal, −35.2%
spatial** — evidence that it measures **linguistically hard-to-describe
cues**. You cannot launder the answer through text.

### What the harness actually gives us — and what it does not

The **entire harness is 156 KB** (`ALMEval_code/`). Three reusable layers:

1. **Task spec** — JSON items + `build_prompt` assembling a typed message
   (`prompts: [{type: text|audio, value}, ...]`).
2. **A durable, resumable, sharded inference log** (`run.py`) — per-rank
   `tmp_results_rank_{RANK}.jsonl` with `os.fsync` every ≤10 records, done
   sentinels, resume by `unique_id`, and `merge_one_dataset` **raises on any
   duplicate id**. `evaluate()` then asserts exact row counts, so a partial
   run *cannot* be scored. This is receipt-log discipline, already written.
3. **Rotation-based scorers** — AA (Average Accuracy) and **ACR (All-Correct
   Rate**: an item only scores if *every* rotation is right).

The single most valuable class in the repo is
`TemporalReasoningDataset._perm_by_roundrobin`: a **deterministic permutation
keyed by `(rotate_id, subtask, id)` whose ground truth is *derived* from the
permutation rather than stored in the JSON**. Answer leakage from the data
file is structurally impossible.

What it does **not** have: an agent loop. `models/base.py` is the whole
contract — one `generate_inner(msgs)`, single turn, no tools, no memory, no
reasoning-trace capture (grepping the tree for `agent|tool_call|trace|cot`
returns three hits, all `traceback`). **Everything scored is benchmark-style;
there is no process-style scoring in the code.** The paper's error taxonomy
and capability hierarchy are analysis the authors did by hand, outside the
repo. If we want process evaluation, we build it. That is the gap our
evolution fills, and it is a real gap rather than a duplicated effort.

Two upstream bugs to fix before any port: `starbench.py:481` assigns
`raw_saptial_audio_dir` (typo) and line 484 reads the correctly-spelled name
→ `NameError`; `sr_ch` is broken as shipped. And `datasets/__init__.py:37`
defines a `spatial_all` group over aliases that do not exist in the registry.

---

## 2. The evolution thesis

> **The fleet's temporal assets are already spatio-temporal reasoning probes.
> They are simply not wired to anything that scores them.**

Upstream probes whether a model can hear how a sound moves through space and
time. Every load-bearing object in this fleet is *exactly* that kind of
object — a signal extended in time whose shape carries the truth:

| Upstream probe | Fleet asset with the same shape |
|---|---|
| 3 clips, scrambled; recover the true order | A hash-chained receipt log, scrambled; recover the true order |
| Two windows: same or different? | Two twist readings: shear or re-twist? |
| A continuous process evolving in place | A duke-lab run evolving across `runArgument` rounds |
| Absolute perception range (is σ in this bin?) | Is this σ reading inside the honest band? |

The reason this is not a loose analogy is the **`ACR` metric**. "All-Correct
Rate" — an item counts only if *every* rotation of it is answered correctly —
is the same epistemic demand as a hash chain: the whole thing verifies or
none of it does. Upstream built a robustness metric that happens to be an
integrity metric. We have integrity objects that happen to need a robustness
metric. **`tidetable` is the adapter.**

And the deeper fit: upstream's founding observation is that the valuable cues
are the ones that *cannot be put into words* (−31.5% under caption-only). The
fleet's founding observation is that numbers which cannot be re-derived from
a chain are withdrawals. **Both are the same refusal — a refusal to accept a
summary as a substitute for the signal.** A benchmark built on that shared
refusal is not a borrowed benchmark. It is ours.

## 3. StarBench-Fleet: the three flagship tasks

### Task A — `receipt-order`: the chain as a temporal signal

**Cast:** present N witness cells in scrambled order. Ask which ordering the
`prev_hash` chain implies. Options = permutations; the correct answer is
*derived* from the real chain, exactly as `_perm_by_roundrobin` derives it.

```
prompts: [{type: "text",  value: cell_0.state_json},
          {type: "text",  value: cell_1.state_json}, ... ]   // scrambled
options: ["cell-3 -> cell-0 -> cell-1 -> cell-2", ...]
answer:  derived by recomputing fnv1a64(cell_id+state_json+answers_json+prev_hash)
```

**Reuse almost verbatim:** `MCQBaseDataset` (load/build/evaluate/metrics),
`_perm_by_roundrobin`, `run.py::process_dataset` + `merge_one_dataset` in
full, `models/base.py` + the `models.yaml` alias→class registry, and
`parse_multi_choice_response`. **Rewrite:** only the audio plumbing —
`_build_audio_prompts`, `merge_pydub`, `binaural2single`. Swap "audio path"
for a fleet handle: a `cell_id`, a `prev_hash`, a `[t0,t1)` slice of
`witness.jsonl`.

**Scoring detail that makes it fleet-native:** an unchained cell is not a
wrong answer, it is **`'Z'`** — `parse_multi_choice_response` already returns
`'Z'` when nothing matches, and upstream's `'Z'` is the perfect encoding for
"unverifiable." *Numbers without chains are withdrawals* becomes a literal
score branch.

**Why it is the flagship task:** ACR over a receipt chain is precisely
witness coherence. `run.py`'s hard error on duplicate `unique_id` and
`evaluate()`'s exact-count assertion mean a partially-verified chain cannot
be reported as verified. The harness's own durability rules *are* the
doctrine.

### Task B — `twist-spectrum`: the twist instrument as an honest spectrum

Upstream's perception half already carries the right epistemic split —
**Absolute Range** (is this azimuth in 0–90°?) vs **Relative Sensitivity**
(are these two clips the same or different?; the dataset has 229 dual-audio
items). Map it directly:

- **Absolute:** bin a twist reading into σ bands. `range_azimuth`'s option
  schema (`"Front-Right (0-90)"`) is a binned-options template to copy for
  σ bands.
- **Relative:** two windows, one class each — **shear** (honest: twists,
  holds, recovers), **re-twist** (lie: re-establishes orientation under
  re-measurement, orientation drift without new load), **flat** (costume: no
  strain where strain should be). Thresholds are `flatness ≥ 0.75` → flat,
  `re_twist_rate ≥ 0.75` → re-twist, else shear.
- **Reuse `PerceptionDataset.evaluate()`** — macro-average over
  sub-categories — unchanged, with shear/re-twist/flat as the sub-categories.

**Precision the fleet must carry:** the instrument law is
`TwistField(points, {sigmaScale: 0.24, gridScale: 0.6})` where **σ = 0.24·s
and grid = 0.6·s, and `s` is the mean nearest-neighbour spacing** — a
*distance*, not a duration. Twist regime is 0.15°–6° in 0.25° steps. Agents
quoting "sigma = 0.24 seconds" are misquoting the fleet's own instrument.

### Task C — `round-trajectory`: duke-lab's evolution as a trajectory

 duke-lab's `runArgument` produces 8 rounds of a generator/critic argument
over a 16-feature ruler; σ shrinks along a golden-section grid; every round
is booked to a JEV receipt chain (`jev-receipts.js` — "Port 3 of the JEV
cross-language plan"). This is upstream's `In-Situ State Evolution` (215
items: "state evolves continuously in place") with **rounds substituted for
clips**:

- "Order these four takes by round."
- "Which round did this σ trajectory come from?"
- "Is take A earlier than take B?"

`tr_cap` (inject the global caption) becomes **`rd_cfg`**: give the agent the
run config, then ask whether it can still hear the difference. Upstream's
caption-ablation is a *confound control*, and duke-lab's determinism claim —
same seed, same argument, **byte for byte** — makes the strongest version
possible: if the agent cannot order the rounds, either the critic is not
learning or the agent is not listening, and the blind test tells us which.

### The task that must NOT be built as an MCQ

**The σ wall.** 0.0720 (honest K=32 descent, K=64 fresh-seed audit, reachable)
versus the shipped `convergence: 0.055` gate (min round σ = 0.0556, min EMA =
0.0739, `reachable=NO`) is a **calibrated continuous** quantity. Forcing it
into `options` bins destroys exactly the precision that makes it meaningful,
and upstream ships **no numeric-tolerance scorer** — only AA/ACR string
matching. Two honest options: add a `NumericWithinToleranceScorer` as a new
`_calculate_metrics` variant, or evaluate it as a *relative* judgement
("is the 0.055 gate reachable?") which the dual-item `sensitivity_*` shape
does handle. Building it as a plain MCQ would be the fleet laundering its own
hardest-won number into a multiple-choice quiz.

## 4. What it sets running — ranked

Casey's framing was "sets many older projects running in useful ways for
emergent applications." Ranked by **value × readiness**:

| # | Repo | State today | What `tidetable` does for it |
|---|---|---|---|
| 1 | **kev-substrate-competition** | live, harness done | Its witness log becomes a *benchmark*, not just a ledger. Chains that already exist become scored items for free — the highest value at the lowest cost in the whole fleet. |
| 2 | **duke-lab** | live, browser instrument | Gains an external reasoner. The blind test ("can you tell the later round?") stops being a human-only ritual and becomes a scored task; `runArgument` rounds become a temporal dataset. |
| 3 | **candor** | live, v0 | Gains a *second* consumer for twist spectra. candor reads transcripts; `tidetable` would score an agent reading candor's output — the instrument measuring the measurer. |
| 4 | **quilt / quilt-studio** | live | The 8-primitive kernel and canon evolution become discrete-temporal items (`Daily Scene Scripts` 180 / `Event-Triggered Consequences` 32 are nearly literal descriptions of opcode→next-opcode transitions). |
| 5 | **encodec → `shanty`** | **DORMANT** — last push 2024-08-15 | **This is the one that wakes up.** Once fleets must *reason over* audio, someone has to *produce* it. A `shanty`-encoded utterance is a temporal signal `tidetable` can scramble and ask an agent to reorder. `shanty` is the generator `tidetable` needs; without `tidetable` it had no consumer at all. |
| 6 | **F5-TTS → `foghorn`** | **DORMANT** — fleet fork has zero commits | Same: becomes the *voice* whose output `tidetable` scores. Also gets the first real entry in a fleet-wide listening test — the thing a TTS model needs and has never had here. |
| 7 | **sunset-ecosystem voice bridge** | **DORMANT** — all three engines are mocks | `VoiceTile.audio_hash` is the literal string `"mock"`. It becomes the *harness host*: rooms generate utterances → `shanty` encodes → `foghorn` synthesizes → `tidetable` scores the reasoning over them. Three dormant repos, one live loop. |

**Items 5–7 are the payoff.** Three repos that have been sitting still are
connected into a single loop by one benchmark harness: the bridge speaks,
the codec tokens it, the benchmark makes an agent reason over the result.
That is "sets older projects running in useful ways" — not as a metaphor but
as a dependency graph that finally has all its edges.

## 5. Rebuild: what to keep, cut, and rename

**Keep, byte-identical** (the fleet's upstream-doctrine): the 156 KB harness
core — `MCQBaseDataset`, `TemporalReasoningDataset._perm_by_roundrobin`,
`run.py`, `models/base.py`, `models/__init__.py`, `models.yaml`,
`parse_multi_choice_response`, `datasets/__init__.py` registry.

**Cut:** all audio plumbing; `assets/` (11 MB of README illustrations, unused
by the harness); and above all the **git history** — the 76 MB is a packfile
carrying 72.63 MiB of *deleted* demo audio under `static/audios/` from early
commits. HEAD is ~21 MB and the code is 156 KB.
`git filter-repo --path static/audios --invert-paths` on the fork, *before*
any real work (zero divergent commits, so nothing is lost), lands it at
~10.4 MB. The 2.75 GB of real data stays on HuggingFace and is irrelevant —
we generate our own signals.

**Fix on arrival:** the `raw_saptial_audio_dir` `NameError`; the dead
`spatial_all` group; the README's Apache-2.0 badge (file says MIT); the
README's model-config path (`/models/model.yaml` → `models/models.yaml`).

**Add, because upstream has none of it:** a numeric-tolerance scorer, a
reasoning-trace capture hook on `BaseModel.__call__`, and a `'Z'`-as-withdrawal
semantics documented in the scorer rather than left implicit.

**Name it `tidetable`.** A tide table is a time-indexed prediction you are
required to reason against — you do not guess when the water moves, you read
the table and then you are accountable to it. That is what a spatio-temporal
benchmark is, and it puts the fleet's flagship in the `tide` register where
its 6 siblings already are.
