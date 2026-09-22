# CODE-NOTES — Hunyuan3D-WorldClaw release status, verified 2026-09-23

All facts below were fetched 2026-09-23 via `mcp__web_reader__webReader` against
api.github.com + raw.githubusercontent.com. Verbatim JSON values are quoted. Items the
agent could NOT fetch are listed at the end and are not asserted anywhere.

## A. Upstream: Tencent-Hunyuan/Hunyuan3D-WorldClaw

Repo JSON (verbatim): `"description": "Agentic 3D Open-world Generation at Scale"`,
`"created_at": "2026-08-05T11:39:27Z"`, `"updated_at": "2026-09-22T18:27:33Z"`,
`"pushed_at": "2026-08-13T05:47:55Z"`, `"size": 180845` (≈177 MB — assets-heavy),
`"default_branch": "main"`, `"fork": false`, `"license": null`, `"language": null`,
`"open_issues_count": 5`, `"stargazers_count": 1314`, `"forks_count": 86`,
`"homepage": "https://tencent-hunyuan.github.io/Hunyuan3D-WorldClaw/"`, `"has_pages": true`,
`"allow_forking": true`.

**Root tree = exactly 3 entries, no code:**

| name | type | size |
|---|---|---|
| `.gitignore` | file | 10 bytes |
| `README.md` | file | 1333 bytes |
| `assets` | dir | — |

**No LICENSE file. No .py. No package dir.** Branches: only `main`. Releases: `[]`.
Tags: `[]`. **Exactly 3 commits** (list terminates at a root commit, `"parents": []`):

1. `bf7b10f7` — "Initial commit: WorldClaw paper README and assets" — co-authored-by
   **Cursor <cursoragent@cursor.com>** — author `LongHZ140516` — **2026-08-10T13:25:15Z**
2. `d9901019` — "Update README.md" — `Yang Li <83260553+rabbityl@users.noreply.github.com>`
   (login `rabbityl`) — 2026-08-10T13:54:34Z
3. `427e5f95` — "Update README.md" — `Season-sweet Orange <lijp57@whu.edu.cn>` (login
   `Lijp411`) — 2026-08-13T05:47:55Z (= `pushed_at`, = HEAD)

**README (complete, 1333 bytes).** Sections: title, three badges (arXiv / Project Page /
Hugging Face), teaser image, `## News`, `## Method`, `## Citation`
(`journal={arXiv preprint arXiv:2608.05248}, year={2026}`).
News contains exactly one line: `**2026.08.07** - We release the technical report and
project page of WorldClaw.`
- **There is NO code-release promise sentence.** No weights/ckpt mention, no "coming
  soon", no date-of-release text. So "no code release yet" is correct, but there is
  **no promise and no date to hold them to.**
- Project page: https://tencent-hunyuan.github.io/Hunyuan3D-WorldClaw/

### Timing detail that resolves the THESIS date discrepancy
- repo created **2026-08-05T11:39:27Z** — ~4 hours *before* the arXiv submission
  (2026-08-05T15:46:38Z).
- first README/assets commit **2026-08-10**.
- README News says the *technical report and project page* were released **2026.08.07**.
  ⇒ THESIS.md's "paper 2026-08-07" is the project-page date; arXiv says 08-05. Both are
  real, they are different events.

### Affiliation evidence (the paper text states none)
- The repo lives in the **Tencent-Hunyuan** GitHub org and serves a
  `tencent-hunyuan.github.io` project page with `has_pages: true`. That is the strongest
  affiliation signal available.
- Commit author emails include a **whu.edu.cn** address (`lijp57@whu.edu.cn`, login
  `Lijp411` — matching paper author Jinpeng Li ⇒ Wuhan University) and `rabbityl`
  (Yang Li, a known Hunyuan author). Consistent with a Tencent–WHU collaboration, but
  **the paper itself never states an affiliation.**

### Unverified / contradicted
- One HTML fetch returned a garbled sidebar containing "AGPL-3.0 license". **Contradicted
  by two independent API facts** (`"license": null`; no LICENSE file in the root tree;
  GitHub license detection is root-based). Treated as a reader artifact — **not a claim.**

## B. SuperInstance fork — VERIFIED

`SuperInstance/Hunyuan3D-WorldClaw` exists (id `1382138790`):
`"created_at": "2026-09-22T18:27:42Z"` (**one day before this research**),
`"pushed_at": "2026-08-13T05:47:55Z"` (= upstream's last push), `"size": 180845`
(byte-identical to upstream), `"fork": true`, `"license": null`, `"language": null`,
`"has_issues": false`, stars 0.

Its `/contents/` returns the **same 3 entries with SHAs identical to upstream**
(`.gitignore e43b0f98…`, `README.md adb7a3cb…`, `assets fd88c79d…`) ⇒ an **unmodified
copy**: README + assets only, no code, no license. SuperInstance is the most recent fork
in the upstream forks list (86 forks; page 1 only was read). `owner.type` was not
captured (org vs user unconfirmed).

## C. Release-lag table (dates verbatim from the org search JSON, total_count: 11)

| repo | created_at | code at creation | when substantial code appeared | license (API) |
|---|---|---|---|---|
| Hunyuan3D-1 | 2024-10-31T09:04:57Z | not commit-verified | Python now; pushed 2025-11-19 | Other/NOASSERTION |
| Hunyuan3D-2 | 2025-01-21T05:21:35Z | README-only likely | **immediate** — README News: "Jan 21, 2025: Release inference code and pretrained models of Hunyuan3D 2.0" (same day); "Open-Source Plan" checklist: Inference Code ✅ Checkpoints ✅ Tech Report ✅ ComfyUI ✅ Finetuning ✅ TensorRT ❌ | Other/NOASSERTION |
| Hunyuan3D-2.1 | 2025-06-13T15:45:50Z | not commit-verified | Python now; pushed 2025-10-17 | Other/NOASSERTION |
| Hunyuan3D-2mini | **UNRESOLVED** — repo + search endpoints 500'd; absent from org search | — | — | — |
| Hunyuan3D-Omni | 2025-09-25T13:13:53Z | not commit-verified | Python now; pushed 2025-10-17 | Other/NOASSERTION |
| **Hunyuan3D-WorldClaw** | 2026-08-05T11:39:27Z | **README + assets only** (`language: null`, `license: null`) | **NOT YET — 49 days and counting** (created 08-05, last push 08-13) | **null — no license file** |

Other org repos (same search): Hunyuan3D-Part (2025-09-25, Python), HunyuanWorld-1.0
(2025-07-18, Python), HY-WorldPlay (2025-12-10, Python), HunyuanWorld-Voyager
(2025-08-27, Python), HunyuanWorld-Mirror (2025-10-16, Python).
**Hunyuan3D-Buffalo1.0 (created 2026-07-31T07:06:53Z) shows the identical WorldClaw
pattern: `language: null`, `license: null`, has_pages: true, pushed 2026-08-10** ⇒
WorldClaw is not a one-off; **2026-era paper repos are shipping README-only with no
license**, which breaks the "Hunyuan always releases day-one" assumption drawn from
Hunyuan3D-2.

**arXiv correction:** Hunyuan3D-2's README cites **arXiv:2501.12202** (Hunyuan3D 2.0 =
Jan 2025), plus Hunyuan3D 2.5 → `2506.16504`, Hunyuan3D 1.0 → `2411.02293`.

### The precedent, stated honestly
Hunyuan3D-2 shipped inference code + weights on the **same day** as repo creation — so
there is *no lag precedent* to extrapolate a WorldClaw date from. Two structural
differences cut against a fast WorldClaw release:
1. Hunyuan3D-2 is a **model** repo (weights + inference). WorldClaw is an **agent
   pipeline** whose §5 says it depends on Claude Opus 4.8, GPT-Image-2, SAM3, SAM3D and
   Hunyuan3D — releasing it means releasing *orchestration code around other people's
   closed APIs*, which is a different and harder release decision.
2. The 2026 repos (WorldClaw, Buffalo1.0) are shipping README-only with **no license
   file**, unlike the 2024–2025 generation.

## D. License precedent

Hunyuan3D-2, 2.1 and Omni all return
`"license": {"key": "other", "name": "Other", "spdx_id": "NOASSERTION", "url": null}`
— a custom, non-OSI-detected license file. **The license file text could not be read**
(`/license` endpoints 500'd), so the name "Tencent Hunyuan Community License" is
**unconfirmed**; only `spdx_id: NOASSERTION` is verified. WorldClaw and Buffalo1.0 have
`"license": null` — **no license file at all**.

## E. COULD NOT VERIFY
1. `/license` endpoint for WorldClaw (reader 500'd ~10 attempts over 20 min) — moot given
   `license: null` + no LICENSE file in tree.
2. Contents of `assets/` (file names/sizes) — 500s; only the dir sha prefix `fd88c79d`.
3. **Hunyuan3D-2mini** — repo endpoint, cachebust variant, HTML page and `search?q=repo:`
   all 500'd; absent from the org search (total_count 11, no 2mini). One early partial
   fetch suggested it exists (id 1005671904) but it could not be re-read. Unresolved.
4. License *file text* for 2/2.1/Omni — the community-license name is unverified.
5. Direct `repos/.../Hunyuan3D-1` fetch (data came from org search only).
6. Commit-level archaeology for 2 / 2.1 / Omni (first code-commit dates).
7. README release statements for 2.1 / Omni.
8. `SuperInstance` `owner.type` (org vs user).
9. Full 86-fork list (page 1 only, ~30 entries).
10. Full README.md / assets dir SHAs (prefixes only).
