# UniRL → `purser`: the fleet's reward layer

*Source: `Tencent-Hunyuan/UniRL` → `SuperInstance/UniRL` (forked 2026-09-22,
41,848 KB, HEAD `694daaaf`). Fleet name: **`purser`** — see [RENAME.md](RENAME.md).*

## What it actually is

"Unified multimodal RL" means **one RL loop, many modalities** — not one
multimodal model. Verbatim from the README: *"UniRL applies one RL
post-training loop — generate samples, score them, compute advantages, update
the policy, and sync weights back to rollout workers — across multimodal model
families."* The unification is the loop plus a pluggable component contract.
Scope, all verified ✅ in the model table: SD3/3.5, Qwen-Image, FLUX.2-Klein,
Z-Image; WAN 2.1/2.2, HunyuanVideo 1.0/1.5, LTX-Video-2; Qwen-VL; **Qwen3
(pure text)**; **Qwen3-Omni Thinker (text/image/audio/video → text)**;
HunyuanImage3, Bagel, SenseNova-U1.5.

Algorithms shipped (`unirl/algorithms/`): GRPO, PPO, GSPO, DPPO, FlowGRPO,
DiffusionNFT, DanceGRPO, MixGRPO, plus team proposals FlowDPPO / DRPO / CPPO
and DiffusionOPD. **There is no single companion paper** — the README's own
citation is `@misc{unirl_github}`, so the repo is the artifact. Three
satellite papers are claimed (DRPO, FlowDPPO, CPPO) but I could not resolve
the arXiv IDs from this environment; no headline numbers appear anywhere in
the repo, and `benchmarks/README.md` defines protocols (GenEval2 800 prompts,
AIME24/25, MATH500, GPQA) while publishing no results. The only concrete
artefact is an HF org shipping official GenEval2 LoRA adapters.

## The reward plug-point — one method

This is the part the fleet cares about, and it is small.

```python
# unirl/reward/base.py:50
class RewardBackend(ABC):
    input_kind = "image"     # "image" | "video" | "text"
    @abstractmethod
    def compute_rewards(self, request: RewardRequest) -> RewardResponse: ...
    @abstractmethod
    def is_available(self) -> bool: ...

# unirl/reward/local/base.py:77 — what a local scorer actually writes
@abstractmethod
def _compute_model_rewards(self, request: RewardRequest) -> List[float]: ...
```

`RewardRequest` carries `generated` (keys `image|video|text|audio`),
`conditioning`, **`metadata: List[Optional[Dict]]`**, **`sample_ids`**,
**`group_ids`**, `audio_sample_rate`. Metadata round-trips from the dataset
all the way to the scorer — verified through
`unirl/data/data_source.py:118-203` and `types/sample.py:504` — which means a
fleet scorer can be handed a `conv_id` and a `cell_id` and go look the
receipt up itself.

**The zero-model template already ships.** `unirl/reward/local/mc_exact_match.py:87`
sets `self.model = "mc_exact_match"` and scores by pure regex against
`metadata["answer"]`, returning `1.0`/`0.0`. **A fleet reward function is
~40 lines, no GPU, no neural model.** That is the whole ask.

**Registration needs zero edits to UniRL.** Everything is Hydra
`_target_`-driven; the trainer wires components *by dotpath, not by import*.
The repo's own `lint/check_recipe_targets.py` guard only scans recipes
committed *inside* UniRL — a fleet-owned recipe in a fleet-owned package is
unconstrained. Recommended shape: a fleet package
`superinstance-unirl-rewards/` with `WitnessCoherenceReward(LocalRewardBackend)`
and friends, imported by dotpath, upstream left byte-identical.

## Our six signals, scored

Advantages are GRPO-normalised: `Part.compute_advantages` at
`unirl/types/sample.py:267` computes `(r − group_mean)/(group_std + 1e-8)`,
scoped `group` or `global`. Hold that thought through (b).

| Fleet signal | Expressible? | Notes |
|---|---|---|
| (a) Witness coherence over the hash chain | **Yes** | Pure CPU. `fnv1a64` over the JSONL; key by `sample_ids`/`metadata`. `ReplayReport.coherence` already emits the scalar. |
| (b) Gate pass/fail (σ wall) | **Yes — and self-annihilating** | See below. |
| (c) Twist reading (shear / re-twist / flat) | **Yes** | `component_rewards: Dict[str, List[float]]` carries all three as separate logged channels while summing to one scalar. |
| (d) QD-archive / opcode coverage | **Yes** | `distinct_opcodes / 8` → [0,1]. FNV-1a-64 and the canary stay inside the adapter; UniRL never sees them. |
| (e) duke-lab round outcomes | **Mismatch** | See below. |
| (f) Unchained numbers | **Yes** | Negative scalar is fine; the fail-fast only rejects non-finite/missing. |

### (b) — a fiction gate produces no gradient, not a wrong gradient

This is the best result in the lane. Set the gate at `0.055` when the honest
K=32 floor is `0.0720` and *every* rollout fails. Reward group is
all-identical → `group_std = 0` → `advantage = 0/1e-8 ≈ 0` for the whole
group. The group contributes **no gradient** rather than a poisoned one. An
unreadable gate doesn't teach the policy to cheat; it teaches it nothing, and
signals its own illegibility by producing a flat advantage distribution.
**A gate you cannot pass and a gate you always pass are both invisible to
GRPO. Only a gate in the passable range trains.** That is a design rule for
`purser`, and it is derived from our own σ-wall finding.

### (e) — where the time-indexed signal doesn't fit

`score_and_attach` **refuses precomputed rewards** — it raises if the frontier
`Part` already carries `rewards`, because actor-side scoring is the only
writer, and it runs synchronously at the rollout barrier. A duke-lab round
that resolves *after* the rollout therefore cannot be back-propagated into an
already-scored sample. Blocking the barrier until resolution destroys
asynchronous throughput.

The fix that keeps the signal time-indexed: **score the prediction, not the
outcome.** At rollout time, emit a Brier/log-score against the fleet's current
expectation for that round rather than waiting for the round to close. The
temporal index lives at the policy, where it is trainable.

### (f) — the receipt-as-reward thesis

"Numbers without chains are withdrawals" is a *negative* reward, and it is the
load-bearing one. Concretely: `r = 0.0` for any metric that arrives without a
verifiable `prev_hash` chain, `r = coherence` for chained metrics, and a bonus
proportional to `prediction.calibration` where the cell carried an `R2.2`
receipted belief. The purser does not pay for results; **the purser pays for
results that can be re-derived.** A brilliant unchained number earns less than
a mediocre chained one — which is the fleet's entire epistemics, expressed as
a scalar.

## What breaks, honestly

1. **`RemoteRewardSpec.input_kind` rejects text.** `unirl/reward/remote.py:581`
   runs `require(self.input_kind in {"image","video"})` — the out-of-the-box
   HTTP reward-panel client cannot consume text rollouts from an evidence
   store. Only three local scorers are `input_kind="text"`. Fix: the
   `llm_judge.py` pattern — a *local* text scorer that does its own
   `requests.post` to the evidence service, retrying and scoring `0.0` on
   failure. ~40 lines, no upstream change.
2. **No GPUs, no training.** The reward hook lives inside a loop that needs a
   policy model, an sglang/vLLM rollout engine, FSDP, and ≥2 GPUs — the AR
   reference recipe is written for 32. If the fleet only wants to *score*
   candidate trajectories offline, UniRL is the wrong tool; `unirl-reward-service/`
   alone, or a plain function, is right-sized.
3. **Install weight.** Python `>=3.12,<3.14`, Linux x86_64, NVIDIA only,
   CUDA 13. `vllm` → torch 2.13.0+cu130, `sglang` → torch 2.11.0+cu130 —
   **mutually incompatible pins; one engine extra per venv, never
   `--all-extras`.** glibc ≥ 2.34. The sglang path compiles a CUDA extension.
   Not a laptop dependency, and not a PLATO 350M-tier dependency.

**Why 41 MB:** measured `du -sh` → 61 MB working tree + 27 MB `.git`;
GitHub's own field says 41,848 KB. Breakdown: `datasets/` 31 MB across only
42 files (prompt/manifest JSONL, no media), `assets/` 20 MB of architecture
PNGs, `unirl/` 6.8 MB of Python. **No checkpoints are committed** — weights
fetch from HF at runtime. So the 41 MB is documentation and prompts, not
model data, and there is nothing to trim.

## Cross-links

- **WorldClaw lane** — same upstream family (Tencent-Hunyuan). UniRL's
  weight-sync layer (`weight_sync/full/{nccl,ipc,checkpoint,ckpt_engine_ipc}`)
  and its `AsyncRolloutTrainerMixin` are the pieces a WorldClaw-style
  agent-claw loop would share; if that lane stands up a trainer, it should
  reuse `purser`'s reward backends rather than growing a second scorer.
- **σ verification already exists here.** `unirl/rollout/engine/sigma_verify.py`
  is a fail-closed round-trip verifier asserting the worker *actually used* the
  σ schedule the engine pinned — *"silent agreement on σ is not safe — GRPO
  log-prob ratio drifts away from 1.0."* That is the same reflex as our σ wall,
  arrived at independently, upstream. Two repos, one instinct: **a σ you did
  not verify is a σ you did not set.** Worth quoting in both lanes.
- **Audio.** UniRL ships `clap.py`, `imagebind.py`, `t2av_composite.py` reward
  scorers and `RewardRequest.audio_sample_rate`. Once `shanty` emits tokens and
  `foghorn` emits audio, an audio-modality reward is a supported path — though
  all three current scorers declare `input_kind="video"`, so the voice stack
  would add its own text/audio scorer rather than reuse them.
