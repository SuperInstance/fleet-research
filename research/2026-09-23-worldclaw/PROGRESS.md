# PROGRESS — lane: worldclaw

Started 2026-09-23 ~02:37, finished ~03:15. Executor: fleet researcher (glm-5.3-flash).
Sandbox note: WebFetch + curl are permission-blocked; all fetching went through
`mcp__web_reader__webReader`. Local FS is scoped to this lane only — no sibling lanes or
fleet sources could be read. Recorded up front so the deliverable could be honest about it.

## Checklist — ALL DONE
- [x] Read TASK.md + THESIS.md
- [x] 1. FULL-PAPER DESCENT — 3 agents read arxiv.org/html/2608.05248v1 IN FULL,
      independently, with agreeing accounts. -> PAPER-NOTES.md
- [x] 2. CODE-RELEASE VERIFICATION — upstream + SuperInstance fork + Hunyuan3D family
      + licenses via GitHub API. -> CODE-NOTES.md
- [x] 3. SCHEMA BRIDGE — deliverable §3 (family map, BIND payload, district/floor mapping,
      receipt stream with jev/check)
- [x] 4. ECOLOGY — deliverable §4 (ascii diagram, 4 ownership paragraphs, R1–R6, FORGET policy)
- [x] 5. HARDWARE TIERING — deliverable §5 (T0–T3 + T-API + T-LIC rows, webgpu-profiler scope)
- [x] 6. WORLDCLAW-ADAPTATION.md — 612 lines

## Deliverable length — DEVIATION, flagged
612 lines against a ~350–450 guide. I stopped trimming deliberately rather than gut §1:
task items 1/3/4 each demand substantive content, and the exhaustive paper extraction is
already factored out into PAPER-NOTES.md. **Cheapest path to ~450 if kimi1 wants it: move
§1 out to PAPER-NOTES.md and leave a 20-line summary — the design sections (§3–§5) do not
depend on losing it.** Say the word and I'll do that pass.

## Corrections to THESIS.md found during verification
1. Dates: THESIS says "paper 2026-08-07". arXiv says **submitted 2026-08-05 15:46:38 UTC**
   (v1, 41,852 KB, no v2/v3). 08.07 is the *project page* date per the repo README News.
   Both real; different events.
2. "Tencent-Hunyuan": **no affiliation line anywhere in the paper text.** Attribution rests
   on the GitHub org + tencent-hunyuan.github.io project page. Commit emails add a
   whu.edu.cn address (consistent with Tencent–WHU) — inference, not a statement.
3. "Asset library mechanics": **no retrieval-style library exists.** Prototypes are
   generated per run; the only dedup in the paper is of SAM3's 2D detections. The
   persistent cross-world library is OUR layer.
4. Implicit quality claims: **the paper has no quantitative evaluation at all** — §3.2/§3.3
   are literally titled "Qualitative". No metric, table, ablation, or runtime number.
5. Hunyuan3D-2 is arXiv:**2501.12202** (Jan 2025), not a 2601.xxxx guess.
6. **"NO license file yet" is verified and is the binding constraint** — upstream
   `license: null`, no LICENSE in tree, fork byte-identical and created 2026-09-22.

## Key verified facts (details in the two NOTES files)
- Repo root tree = exactly 3 entries: `.gitignore` (10 B), `README.md` (1333 B), `assets/`.
  3 commits total, first 2026-08-10 co-authored by Cursor. Only `main`, no releases/tags.
- README promises **no code release and gives no date.** News line covers paper + page only.
- Hunyuan3D-2 released code+weights the SAME DAY its repo was created (2025-01-21) ⇒ no
  lag curve to extrapolate. 2026 org repos (WorldClaw, Buffalo1.0) ship README-only +
  no license — the day-one-release precedent does not transfer.
- Height field Eq.6 is PARAMETRIC over a globally-normalized soft mask partition ⇒ the
  quilt floor plane can stay live, and local edits are NOT local at boundaries (risk R2).
- Refinement exits on contact-ratio OR iteration budget; ε_i± / contact threshold / budget
  are named and never valued ⇒ `jev/check` can measure all three empirically.

## Open design decisions for kimi1
- **R2:** forbid the breeder from editing district FOOTPRINTS in v1 (parameters inside a
  fixed footprint only). Costs search space, buys correctness. Needs a ruling.
- Telemetry contract: generation-side timings carried in receipts with the SAME field
  names webgpu-profiler emits — otherwise "slow to make" and "slow to look at" diverge.
- `bind/proto` (geometry hash, not prompt hash) as the cross-world asset identity key.
- Live/warm/frozen residency tiers with a per-tier live-cell budget (R1).

## Artifacts
- `WORLDCLAW-ADAPTATION.md` — the brief (612 lines)
- `PAPER-NOTES.md` — full paper extraction with evidence discipline + NOT-IN-PAPER list
- `CODE-NOTES.md` — repo/fork/family verification, verbatim JSON, could-not-verify list
- `PROGRESS.md` — this file
