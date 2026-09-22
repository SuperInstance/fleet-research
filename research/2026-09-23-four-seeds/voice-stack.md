# The voice stack: `foghorn` + `shanty`

*Sources: `SWivid/F5-TTS` → `SuperInstance/F5-TTS`, and
`ZhikangNiu/encodec-pytorch` → `SuperInstance/encodec-pytorch`. Fleet names
**`foghorn`** (synthesis) and **`shanty`** (codec) — see [RENAME.md](RENAME.md).
F5-TTS: arXiv:2410.06885, ICLR 2025. Codec: Défossez, Copet, Synnaeve & Adi,
*High Fidelity Neural Audio Compression*, arXiv:2210.13438, TMLR 2023.*

## The one design decision that matters

**Provenance attaches at the codec layer, not the synthesis layer.**

F5-TTS emits a float waveform and nothing hashable — `infer_process` returns
`(wav, sr, spec)`. Worse, its output is *not reproducible*, for five
independent reasons all visible in `infer/utils_infer.py`:

1. a `ThreadPoolExecutor` in `infer_batch_process` (non-deterministic
   reduction order under concurrency);
2. **dtype is device-dependent by design** — float16 on CUDA, float32 on CPU,
   so a GPU node and a CPU node will never agree on bytes;
3. four free sampler knobs (`nfe_step=32`, `ode_method="euler"`,
   `cfg_strength=2.0`, `sway_sampling_coef=-1.0`) that silently change output;
4. `attn_backend: torch | flash_attn` is a config field, and flash-attention
   is not bit-identical to the SDPA path;
5. if `ref_text` is omitted, **Whisper large-v3-turbo writes it** — an ASR
   result feeding the duration predictor.

Chaining a hash over that waveform chains over a value we cannot re-derive.
**Chain the codec tokens instead.** The discrete code stream *is* bit-stable —
verified by encoding the same clip three times under two different
checkpoints and hashing the serialized tokens (identical across runs). And
crucially, this is the *same* lesson the fleet already learned in the hash
law: you hash the **bytes you can reproduce**, never the summary.
`foghorn` therefore enters the receipt as *attested metadata* — model SHA,
`nfe_step`, `cfg_strength`, `sway_sampling_coef`, dtype, `attn_backend`,
`ref_text` — which preserves auditability without claiming byte-identity over
an artifact we cannot reproduce. `shanty`'s token stream is the *payload*.

```
        ┌─ UNTRUSTED ─────────────┐   ┌─ RECEIPT BOUNDARY ─┐
text ──▶│  foghorn (F5-TTS)       │──▶│ shanty encode      │──▶ uint16 tokens
        │  waveform, not stable   │   │ (EnCodec)          │    + scale  ──▶ cell_hash
        └─────────────────────────┘   └────────────────────┘
                                            ▲
                       this is where the chain starts
```

## The two halves, spec'd

### `shanty` — the codec (encodec-pytorch)

Meta's EnCodec **vendored flat** — `model.py`, `modules/seanet.py`,
`quantization/core_vq.py`, `compress.py` all carry verbatim `# Copyright (c)
Meta Platforms` headers. What the fork's author actually wrote is the
training harness. Architecture: `SEANetEncoder` → 128-d latent → RVQ cascade
of `n_q` `VectorQuantization` layers, **1024×128 EMA codebooks, 10
bits/codebook**, `hop_length 320` → **frame rate 75/s at 24 kHz**.

**⚠ There are no weights in git.** `git ls-files | grep -E '\.(pth|pt|th)$'`
returns nothing. Two upstream sources work, and both were downloaded and
loaded with `load_state_dict(strict=True)` → all keys matched:

| Checkpoint | Size | Tensors | Config needed |
|---|---|---|---|
| Meta `encodec_24khz-d7cc33bc.th` | 93,171,529 B | 252 | `causal=True, norm='weight_norm'` |
| community `zkniu/encodec-pytorch` | 93,226,649 B | 288 | `causal=False, norm='time_group_norm'` |

**They are not interchangeable** (252 vs 288 tensors, different norm
modules), and the repo's own `config/config.yaml` ships
`causal: True, norm: 'weight_norm'` — which matches *Meta's* checkpoint, not
the one the author released. The config is stale relative to the artifact.
Also: the community model is non-causal, so a chunk's tokens depend on the
whole input; **use Meta's, which is causal and streamable.**

**Token economics — the number the whole design hangs on.**
`tokens/sec = frame_rate × n_q = 75 × n_q`, where `bw_per_quantizer =
10 bits × 75 / 1000 = 0.75 kbps`:

| Target | n_q | **tokens/sec** | 10 s utterance |
|---|---|---|---|
| 1.5 kbps | 2 | **150** | 1,500 tokens / 3 KB |
| 6 kbps | 8 | **600** | 6,000 tokens / **12 KB** |
| 24 kbps | 32 | **2400** | 24,000 tokens / 48 KB |

**Recommended canonical serialization:** `uint16` little-endian, `[T, Q]`
time-major row-major — it matches `compress.py`'s own iteration order, and
1024 codebook entries fit in 16 bits. When `normalize=True`, **prepend the
4-byte big-endian fp32 scale** (`struct.pack('!f', ...)`, as `compress.py:66`
does), or the same audio at different gain hashes differently. 10 s of speech
at 6 kbps hashes 12 KB — trivial against FNV-1a-64.

**Two fixes required before this is a codec at all:**

- **`model.py:341` and `model.py:360` lack `map_location='cpu'`.** Confirmed
  crash on any CPU-only host: `Attempting to deserialize object on a CUDA
  device`. Two characters, currently fatal.
- `encodec_model_bw()` is a dead path — it sets `target_bandwidths` to a bare
  float and `_get_model` indexes it with `[-1]` → `TypeError`. Do not call.

**Two misattributions to stop repeating.** I enumerated every percentage in
the EnCodec paper: **"10% reconstruction loss reduction" does not appear in
it at all**, and **"90× compression" is DAC's headline number**
(`descript-audio-codec`), not EnCodec's. The paper's real claims: an LM
entropy-coder compresses the representation **up to 40% further**
(3 kbps → 1.9 kbps), the **loss balancer** is the named contribution, and the
model reaches SOTA at 1.5/3/6/12 kbps (24 kHz) and 6/12/24 (48 kHz stereo).
All of those describe *Meta's* weights, trained on 17k+ hours — the community
checkpoint is LibriTTS-960h speech only and its author says plainly it is
"not good enough."

**Honest verdict on the repo:** as a *training* harness it is dead — dormant
17 months, AMP broken ("Couldn't work, so don't use amp"), stale config, a
dataset CSV of 28,538 hardcoded `/mnt/lustre/sjtu/` paths. As an *inference
codec* it works and round-trips, but it is **redundant with
`facebookresearch/encodec`**, which is the same code maintained. Recommendation:
**standardize on Meta's token space** (MusicGen/AudioCraft and the VALL-E-style
LMs all speak the 1024-entry codebook) and vendor this fork only if we want a
small patchable codec core with no package machinery. Nothing strategically
unique is lost by not adopting it as the canonical implementation — its only
distinct asset is a *worse* checkpoint.

### `foghorn` — the synthesis (F5-TTS)

E2-TTS recast as continuous-time flow matching over mel-spectrograms:
a DiT conditioned on (filled reference mel + its transcript) and the target
text, a character-ratio duration projector instead of an aligner, then the
probability-flow ODE integrated with Euler for `nfe_step` steps plus
classifier-free guidance and sway sampling. **"F5" is wordplay on "Fakes
Fluent and Faithful"** — it is not a parameter count and not five stages.

| Spec | Value |
|---|---|
| Backbone | DiT, 22 layers × 1024 dim, **336M** (`F5TTS_v1_Base`) |
| Variant | `F5TTS_Small` = 768 dim / 18 layers / 12 heads |
| Sample rate | **24,000 Hz** — 100 mel bins, hop 256, win/fft 1024 |
| Frame rate | **93.75/s** ≈ 10.67 ms per frame |
| Max context | 8192 frames ≈ **87.4 s** |
| Reference | clipped to **12 s**, MD5-keyed cache; transcript is **load-bearing** (sets the length ratio) |
| Languages | en / zh / ja / ko (v1 base, 2025-03-12) |
| Trained on | Emilia, **95 k hours / 49.6 k speakers** |
| Quality | LibriSpeech-PC test-clean **WER 1.83**, SIM 0.673; Seed-TTS WER 1.43, SIM 0.657 |
| Speed | RTF **0.1467** @32 NFE → **0.0394** @16 NFE (Triton), **0.0239** @8 NFE — ~25× real time on one L20 |
| Licence | **code MIT; pretrained checkpoints CC-BY-NC-4.0** |

**That last line is a hard doctrinal conflict, not a footnote.** Byte-identical
custody of a CC-BY-NC artifact does not make it commercially usable. If any
fleet revenue ever touches audio these weights produced, `foghorn` is blocked
until we train or substitute a permissively-licensed voice. Flag it now,
while the fork has zero commits and switching is free.

**Rebuild — keep / cut.**

**Keep (MIT, bounded):** `model/backbones/dit.py`, `model/cfm.py`,
`model/modules.py`; `configs/F5TTS_v1_Base.yaml` + `F5TTS_Small.yaml`; and
`infer/utils_infer.py` **minus** the Whisper fallback and **minus** the
thread pool. First-party `runtime/triton_trtllm/` is the intended serving
path and is worth keeping (16 NFE is the sweet spot).

**Cut:** `infer_gradio.py` / `infer_cli.py` / `cli.py` (presentation);
`train/` and `train/finetune/` entirely — the doctrine is *inference*
byte-identity, and training is out of scope; **`src/third_party/BigVGAN`**
(the only git submodule — pin `vocos` instead, it is the default and avoids a
mixed float32 path); the `mmdit`/`unett` backbones; `SHARED.md` community
checkpoints; the pydub ref-clipping and MD5 cache.

**No ONNX ships here** — `F5-TTS-ONNX` (DakeQQ) is an external fork, and that
is where a real CPU story lives. On CPU the code forces float32, so expect an
order of magnitude worse than the 0.0394 GPU RTF.

## The integration: `sunset-ecosystem` is where this lands

`voice/soniqo_bridge.py` is the socket, and it is **a stub**. `SoniqoBridge`
plugs three engines — `soniqo.ASR()`, `soniqo.TTS()`, `soniqo.VAD()` — and
with the SDK absent all three fall back to `_MockASR / _MockTTS / _MockVAD`.
`_MockTTS.synthesize` returns `bytes(32000)`.

Two precise facts fall out of that stub:

- **`VoiceTile.audio_hash` defaults to the literal string `"mock"`** (line
  147). No audio has ever been hashed in this fleet. The field is already
  there waiting for a real chain.
- **The bridge's implied PCM convention is 16 kHz mono 16-bit** —
  `bytes(32000)` = 16000 Hz × 2 bytes × 1 s. **F5-TTS natively outputs
  24 kHz.** A resample is mandatory or every duration field is wrong by 1.5×.

`ARCHITECTURE-v2.md:66` already declares the doctrine we are implementing:
*"Every voice interaction is captured as a VoiceTile with transcript, audio
hash, and metadata. Voice is not an add-on; it's a core tile type."* And the
fleet's own audit already names the gap: `audit/test_refactor_plan.md:206` —
`perception/audio_capture.py ↔ voice/soniqo_bridge.py — No end-to-end audio
pipeline test.`

**The fill is mechanical:**

| Bridge socket | Becomes | Payload |
|---|---|---|
| `_MockTTS` → | `foghorn` | waveform (24 kHz, untrusted) |
| *(new)* | `shanty` encode | **uint16 `[T,Q]` tokens + scale = the EFFECT payload** |
| `VoiceTile.audio_hash` | `hash16(tokens)` | first real value in the field |
| `VoiceTile.duration_ms` | `T / 75 × 1000` | derived from the token count, not measured |

"Q-verifiable" resolves to: **verifiable by witness replay** — the only
verification machinery the fleet has. Concretely, a voice cell carries the
same seven required keys as any other (`conv_id, cell_id, tick, state_json,
answers_json, prev_hash, cell_hash`) with `answers_json` holding the codec
tokens, and `tidetable` can then scramble a room's voice cells and ask an
agent to re-derive the order. Executed check, 3 cells, genesis
`0x0000000000000000`, tampering one `state_json` re-derives a different
`cell_hash` and Gate #1 rejects the log as a withdrawal — see PROGRESS.md.

## Hardware tiers (hwscan / PLATO chain)

The PLATO signal chain (verified in
`AI-Writings/essays/supplements/MODEL-ECOLOGY-SUPPLEMENT.md:89-93`) routes
sensors → deadband (−90%) → 350M nano (−90%) → LoRA (−90%) → fleet → cloud.
**The voice stack slots into it cleanly, and the 24 kHz→16 kHz mismatch is
also a tier mismatch:**

| Tier | Hardware | Voice role |
|---|---|---|
| 350M "insects" | ESP32 / RPi, <10 ms, <1 W | **VAD + deadband only.** Decide *whether to speak*. No synthesis. |
| 1.2B "birds" | laptop / tablet, no GPU | `shanty` **decode** (600 tok/s of CPU work) and `shanty` encode for capture. The 12 KB/10 s token payload is small enough to sync over the mesh. |
| GPU node | single L20-class | `foghorn` 336M @16 NFE, RTF ≈ 0.039 — **~25× real time**, so one node carries a whole room's voice. |
| Cloud | — | Batch re-encode, cross-room reasoning over token streams, LoRA updates flowing back down. |

`hwscan`'s own contract — *"I can compute X at Y joules/op with Z ms latency"*
— is the right query: ask it for the tier, then pick `shanty`-only or
`shanty`+`foghorn`. Voice is the first capability in the fleet whose cost
difference between tiers is a hard yes/no rather than a latency tax, because
336M params does not fit where 350M nano models live.

## What to do in what order

1. Fix `map_location='cpu'` in `model.py` (two characters; unblocks CPU).
2. Vendor `shanty` as an inference-only codec, Meta weights, determinism
   forced (`use_deterministic_algorithms(True)`, TF32 off, fp32, pinned
   torch). **Cross-device bit-exactness is unverified** — a matmul reassociation
   or TF32 flip would silently break a chain, so run the CPU↔CUDA differential
   before trusting it in a receipt.
3. Point `SoniqoBridge._tts_engine` at `foghorn` + resample 24k→16k; put
   `hash16(tokens)` in `VoiceTile.audio_hash`.
4. Add the first real end-to-end voice test the audit says is missing.
5. Decide the CC-BY-NC question *before* `foghorn` ships anywhere.
