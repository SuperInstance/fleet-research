# QUARTERDECK — killer-app frontend spec

**Lane:** QUARTERDECK · **Date:** 2026-09-23 · **Status:** research + design, no app rebuild
**Scope:** adapt `SuperInstance/coding-3d` into the SuperInstance ecosystem's front end.
**Evidence:** every number below was read off a fetched document or computed by me. Companion
ledger: `PROGRESS.md` (full citations + confidence labels). Runnable checks: `audit/`.

| Confidence marks | meaning |
|---|---|
| *(none)* | verified — I read the file/metadata myself or a subagent transcribed it from a full render |
| `PARTIAL` | repo/file confirmed real; details quoted word-for-word from a truncated render only |
| `UNVERIFIED` | could not confirm; do not build on it |

---

## 0. Two findings that gate everything else

**BLOCKER — the fork has no license.** Neither `thekiller-dev/coding-3d` nor
`SuperInstance/coding-3d` contains a LICENSE file (API `license: null`; absent from the complete
recursive tree, `"truncated": false`; absent from the repo page's Resources list). The fork is a
byte-identical snapshot: **0 commits ahead / 0 behind**, same head SHA `7951c73`, same
`pushed_at` `2026-09-19T06:42:39Z`. As it stands the fleet has no grant to use, modify, or
redistribute this code. **This must go to Casey before a single file is copied.** Options:
(a) ask `thekiller-dev` to add MIT; (b) treat the repo as reference-only and rebuild the shell
from scratch — cheap, since §1 shows the shell is ~1,100 LOC of mostly hardcoded copy;
(c) confirm the upstream "Coding Pro 3D" course materials impose no further terms.

**The repo is half-migrated, and its own DECISIONS.md overstates what landed.** `package.json`
declares `"@designcodeio/threeui": "^0.3.2"`, but **zero source files import it.** DECISIONS.md
describes a "landing v2" that adopted threeui, `LandscapeScene` and `TempleNightScene`; only the
2.4 MB `public/landscape.html` landed, there is no `TempleNightScene` component, and
`Characters.tsx` lazy-loads the bespoke `./HeroScene`. **Treat DECISIONS.md as a record of intent,
not of state.** Practical upside: uninstalling threeui sheds **54.7 MB unpacked / 726 files / two
aliased three.js copies** with no source change, and dissolves the `sRGBEncoding` risk entirely.

---

## 1. ASSET AUDIT

### 1.1 Provenance
`SuperInstance/coding-3d` = public fork of `thekiller-dev/coding-3d` (itself original, `fork:
false`, 1 star). Upstream: description "Repository test sur AI-Factory", homepage
`coding-3d.vercel.app`, **3 commits**, all by one author (`thekiller-dev
<eltonhounnou2@gmail.com>`), all on 2026-09-19: `5de4235` "Initial commit" 02:24:53Z →
`de6aab0` "add more interactions" 06:17:47Z → `7951c73` "solved errors" 06:42:39Z.
Fork created 2026-09-22T18:10:52Z, 0 stars. `package.json` name is
`formation-coding-pro-3d`, `"private": true`, v0.0.0.

### 1.2 Component inventory (17 components + `ui/Button.tsx`)
Line counts are GitHub's own `N lines (M loc) · X KB` blob headers, not a recount.

| file | lines | `three` | state | verdict for QUARTERDECK |
|---|---|---|---|---|
| `Paper3D.tsx` | 208 (192) | yes | `useRef`,`useEffect` | **KEEP, remap hard** → receipt card (§3d) |
| `Portfolio.tsx` | 156 (146) | – | `useState('Tous')` | **KEEP**, swap fake projects for real repos |
| `Offer.tsx` | 140 (135) | – | accordion | **GUT** — pricing/enroll → "run it yourself" |
| `HeroScene.tsx` | 149 (133) | **yes** | `useRef`,`useEffect` | **KEEP — highest-value asset** (§3b) |
| `Worlds.tsx` | 102 (94) | – | `useState`+`setInterval` 5 s | **KEEP**, lazy-load pattern; **cut auto-advance** |
| `Footer.tsx` | 87 (84) | – | – | **KEEP** → colophon (licenses, provenance) |
| `Hero.tsx` | 78 (75) | – | – | **KEEP** → tidepool masthead |
| `Program.tsx` | 73 (71) | – | – | **KEEP** → sector roster |
| `SocialProof.tsx` | 73 (67) | – | – | **GUT** — fictional testimonials → honest numbers |
| `Navbar.tsx` | 72 (69) | – | mobile menu | **KEEP** → omnibar |
| `Method.tsx` | 59 (57) | – | – | **KEEP** → doctrine strip (§3e) |
| `Problem.tsx` | 54 (52) | – | – | **KEEP** → "dashboards lie" |
| `ErrorBoundary.tsx` | 51 (47) | – | class | **KEEP as-is** — but nothing imports it; mount point unknown |
| `Characters.tsx` | 46 (45) | – | `Suspense`+`lazy` | **KEEP** → agents as vessels |
| `Reveal.tsx` | 40 (36) | – | IntersectionObserver | **KEEP as-is** |
| `ui/Button.tsx` | 24 (21) | – | – | **KEEP as-is** |
| `SectionHeading.tsx` | 18 (18) | – | – | **KEEP as-is** |
| `App.tsx` | 47 (45) | – | – | **REORDER** — 12 sections, no `ErrorBoundary` import |

Also `main.tsx` 18 (15), `index.css` 273 (253). `src/lib/`, `src/hooks/`, `src/three/`,
`src/data/`, `src/App.css` **do not exist** — all 3D logic is inline in two files, so there is no
layer to refactor out; extracting a `three/` module is new work, not a rescue.

**`HeroScene.tsx` is the thing we actually came for.** `COLS = 110`, `ROWS = 55`, `SEP = 0.16` →
**110 × 55 = 6050 points**, which independently reproduces the repo's own "6050 particles,
1 draw call" claim. One `WebGLRenderer` (antialias, alpha, `pixelRatio` ≤ 1.75), one
`PerspectiveCamera(60, …, 0.1, 100)` at `(0, 2.4, 9)`, one `BufferGeometry` with `position` +
`color`, one `PointsMaterial` (size 0.045, vertexColors, opacity 0.85, `AdditiveBlending`,
depthWrite false), one `Points`. **No lights, no meshes.** Full teardown (`dispose()` +
`cancelAnimationFrame`), off-screen + hidden-tab pause, `prefers-reduced-motion` → static frame.
This is production-shaped WebGL hygiene in 149 lines, and it is already the "ocean of memories"
primitive.

**`Paper3D.tsx`** renders a **1024×640** `<canvas>` via a module-scope `drawCertificate(ctx,w,h)`
into a `CanvasTexture` on `PlaneGeometry(3.6, 2.25)`, plus an `AdditiveBlending` glow `Sprite`.
Comment: `// Certificat 3D custom (la source Pro threeui 3d-paper n'est pas distribuée)` — the
upstream `3d-paper` source is licence-gated, so the receipt card must extend this custom path.
One suspected defect: a `resize` listener with no visible removal.

### 1.3 threeui — license verified, and irrelevant once uninstalled
`@designcodeio/threeui`: **MIT**, confirmed twice (registry `"license": "MIT"` on every version,
and LICENSE header `MIT License / Copyright (c) 2026 Meng To`). Versions `0.3.0 / 1.0.0 / 1.1.0 /
1.2.0`; latest `1.2.0`, published 2026-09-01. Repo `MengTo/threeui`, homepage `threeui.com`, no
`author` field, `maintainers: mengto`. `1.2.0` = `fileCount 726`, `unpackedSize 54,726,125` B
(≈54.7 MB / 52.2 MiB). **No `dist/`** — build output is `lib-dist/`, which `main`/`module`/
`exports` all point at, so the build IS shipped and offline vendoring needs no compile step.
`peerDependencies`: `three >=0.149 <1`, and `react` / `react-dom` each `>=18 <20`. **Plus** regular
deps `three128: npm:three@0.128.0` and `three165: npm:three@0.165.0` — up to **three three.js
copies** in one install. README carves out bundled fonts as **OFL-1.1** and threeui.com-hosted catalog
previews as **not redistributed** (`ASSET-LICENSES.md`, `FONT-LICENSES.md`,
`THIRD_PARTY_NOTICES.md`).

**`sRGBEncoding` risk — located and then eliminated.** The risk is real but it is not ours. The
fork's own three-importing files (`HeroScene.tsx`, `Paper3D.tsx`) use **no encoding or
color-management API at all**. I verified `sRGBEncoding` is **absent** from three.js r187dev
`src/constants.js` (only `NoColorSpace`, `SRGBColorSpace='srgb'`,
`LinearSRGBColorSpace='srgb-linear'`, `LinearTransfer`, `SRGBTransfer` remain), so against a
modern peer three the legacy constant is a hard break, not a warning. But it would only be
reached through threeui's own bundled `three@0.165.0` / `landscape.html`. The fork pins
`three: ^0.171.0` (= r171 exactly, caret on `0.x`); I did **not** verify r171's constants and make
no claim about it. **Conclusion: drop threeui + `landscape.html` and the risk is gone.** The
repo's PROGRESS.md documents the warning and names a fallback ("repli possible sur SylvaHero"),
confirming it bit them too.

### 1.4 Fork hygiene
- **3 commits, one day, one author. No secrets.** Complete recursive tree has no `.env`,
  `.env.local`, `.npmrc`, credentials, `node_modules/`, or `dist/`. No `TODO`/`FIXME` anywhere.
- **One blob:** `public/landscape.html` = **2,428,244 B**. Also `favicon.svg` 9,522 B,
  `icons.svg` 5,031 B, `package-lock.json` 83,360 B. Repo `size: 1461` KB is *smaller* than that
  single file because GitHub reports packed size — do not sum them.
- **`.gitignore` gap:** stock Vite content covers `*.local` but **not a plain `.env`**. Nothing is
  committed there today, but the first commit on the renamed repo must add `.env` + `.env.*`.
- **The page phones home today, before we add a backend:** `SocialProof.tsx` hardcodes avatar
  URLs on **`i.pravatar.cc`** (for fictional people), and `index.html` preconnects to
  **`fonts.googleapis.com`** (Space Grotesk / DM Sans / Space Mono). Local-first requires cutting
  both. `index.html` could not be retrieved verbatim through any route — flagged, not guessed.

### 1.5 Build viability — one real bug
**Tailwind version conflict.** `src/index.css` opens `@import 'tailwindcss'` and defines tokens
in an `@theme` block (`--color-ink`, `--color-violet #6d5cff`, `--color-mint #12b886`,
`--color-panel #ffffff`, `--font-display 'Space Grotesk'`) — **Tailwind v4 syntax**. But
`package.json` pins `tailwindcss: ^3.4.17` with a v3-style `tailwind.config.js` (empty
`theme.extend`) and `postcss.config.js` (`tailwindcss` + `autoprefixer`). Mutually exclusive; the
`@theme` block is ignored or breaking, and its light palette contradicts the dark `#090b18`
system. `index.css` is the outlier — fix it in P0 before any styling work.
`vite.config.ts` is the stock 4-liner (`plugins:[react()]`) — **no code-splitting config**; the
laziness is React-level only. `tailwind.config.js` carries `// 0 valeur en dur dans composants`,
which `Method.tsx` itself violates with an inline `borderImage` gradient of hardcoded hex.
`build = tsc -b && vite build`, `lint = oxlint .` (`.oxlintrc.json`: plugins `react`,
`typescript`, `oxc`, `react/rules-of-hooks: error`).

---

## 2. ADAPTATION MAP

Data-source ground truth, all fetched 2026-09-23. `SuperInstance` is a **user account**
(Casey Digennaro, `user_id 193104091`, Sitka AK), self-described as a **"4,357-repository fleet
of AI agents that build, write, and run themselves."** Its repositories tab is stale/paged (32
generic repos); direct fetches are ground truth.

| coding-3d | QUARTERDECK role | data source (verified) |
|---|---|---|
| `Hero.tsx` 78 | tidepool masthead | tidepool `GET /api/recall` |
| `HeroScene.tsx` 149 | the particle ocean | tidepool recall results → per-point amplitude |
| `Problem.tsx` 54 | "dashboards lie — numbers without chains are withdrawals" | jev-receipts `GET /api/ledger` / chain length |
| `Program.tsx` 73 | sector roster | `.well-known/agent-cards/*.json` (6 cards) |
| `Portfolio.tsx` 156 | real repos, real receipts | fleet-dashboard + repo metadata |
| `Worlds.tsx` 102 | sector tabs = the worlds | `spatial-registry` ("four worlds, thirty-three rooms") `PARTIAL` |
| `Characters.tsx` 46 | the agents as vessels | `.well-known/agent-cards/`: **breeder, compiler, grid, metronome, nexus, thermal** |
| `Paper3D.tsx` 208 | flippable live receipt | vendored `jev-receipts` UMD, in-browser `verify()` |
| `Method.tsx` 59 | doctrine strip sense→decide→act | SSE `THERMAL`/`MUTATION` → `FLUX_GATE`/`PARENT_SELECT` → `BEAT`/`AGENT_SPAWN` |
| `Offer.tsx` 140 | "run it yourself" | clone & serve; **no form, no mailto** |
| `SocialProof.tsx` 73 | honest numbers only | real test counts (§4) |
| `Navbar.tsx` 72 | omnibar | fleet-twin MCP `twin_query` |
| `Footer.tsx` 87 | colophon | licenses + provenance + canary |

**Verified interfaces:**
- **SSEStreamDashboard** — `sunset-ecosystem/fleet/sse_stream_dashboard.py` (14,194 B).
  `__all__ = ["SSEStreamDashboard","StreamEvent","EventType","DashboardConfig",
  "serve_dashboard_ui","DashboardServer"]`. **9 event types:** `BEAT`, `PARENT_SELECT`,
  `MUTATION`, `FLUX_GATE`, `THERMAL`, `FLEET_STATUS`, `AGENT_SPAWN`, `ERROR`, `INFO`.
  Event JSON keys exactly `type`/`timestamp`/`node_id`/`payload`. **All frames are unnamed
  `data: {json}\n\n` — no SSE `event:` field**, so `addEventListener(<type>)` cannot work and the
  adapter must `JSON.parse(e.data).type`. Heartbeat `{"type":"HEARTBEAT"}`.
  `DashboardConfig`: host `0.0.0.0`, **port `8849`**, `max_queue_size 1000`,
  `heartbeat_interval_sec 15.0`, `history_buffer_size 100`, `enable_backpressure True`.
  Endpoints `/`, `/dashboard`, **`/events`**. Wiring: `wire_to_fleet_conductor`,
  `wire_to_breeder`. Methods `publish`, `recent_events`, `recent_by_type`, `get_metrics`.
  **Python stdlib only** → zero-install.
- **fleet-twin MCP** — `mcp/server.mjs` (7,840 B). Tools **`twin_query(text, topK?,
  type_filter?, source_filter?)`**, **`twin_ingest(id, text, metadata?)`**, **`twin_stats()`**.
  stdio default; `--http` → streamable HTTP on `PORT` (default 8787). Env `FLEET_TWIN_URL`
  (default `https://fleet-twin.casey-digennaro.workers.dev`), `INGEST_TOKEN`, `TWIN_SOURCE`.
  Worker: `POST /query` `{text, topK(5, max 20), type, source}`, `POST /ingest`
  `{docs:[{id,text,metadata}]}` + bearer, `GET /stats`. **Record `{id, text, metadata}`.**
  No MCP SDK dep, Node ≥ 18. `local/query-local.sh` exists → a local path is already provided.
- **tidepool** — "The fleet's vector context ocean." Cloudflare Worker + Vectorize + D1; indexes
  `tidepool-native` (**16 dims**) and `tidepool-semantic` (**768 dims**, BGE at write time).
  Routes `GET /health`, `POST /api/remember`, `GET /api/recall?q=&kind=&author=&repo=`,
  `GET /api/recall/similar?id=|?vec=`, `GET /api/ledger`. Record
  `{kind, author, title, body, native(16), repo, run}`; `kind` ∈ `lesson|audit|design|playtest|
  pattern|tile|musician|session`. **JEV gate:** `TIDEPOOL_JEV=on|1|mock|http` (off by default) →
  per-item `{decision:'surface'|'suppress'|'abstain', confidence, reasons}`,
  **`σ = √(c_emb · c_jev)`**, floor `TIDEPOOL_JEV_FLOOR` (default `0.5`). Rate limit 45/min/IP
  keyed by `fnv1a(ip)`. MIT, `npm test` = **18 checks**.
- **jev-receipts** — `index.js` (7.4 KB). Entries **`{hash, parent, body}`**,
  `body = JSON.stringify({kind, payload})`, **prev-hash field is `parent`**, genesis
  `parent = "0".repeat(64)` (64 zeros — wider than the 16 hex chars a 64-bit hash emits; likely a
  sha256-era leftover). Hash = **FNV-1a 64 applied TWICE over `(parent + body)`** — not sha256,
  not blake3. Exported UMD `root.JevReceipts = {fnv1a, hex, ReceiptChain, JevCell, bookArgument}`
  → **vendors into the deck with no build step**, and `ReceiptChain.verify()` already exists.
  `JevCell(name,{window=8, floor=0.08, chain}).observe(t, value)` alarms on
  `|value − mean| > floor`, booking `jev.alarm` / `jev.reading`.
- **quilt JS kernel** — repo real; `"main":"index.js"`, `"type":"module"`, root `/bytes-law.md`.
  README: "The kernel is **not a JS interpreter**. It is a **cell runtime**."
  `bytes-law.md`: "**The bytes are the law. The kernel is the court. The fleet is the people.**"
  **Kernel source never read — cell addressing and function names `UNVERIFIED`.** Cross-repo
  corroboration: `quilt-foundation`'s five opcodes are **`BIND, LINK, EFFECT, VIEW, TICK`** (from
  webgpu-profiler's README). Flagship `quilt` is "a spreadsheet where **every cell is a live,
  addressable capability**. The grid is the runtime."
- **webgpu-profiler** — in-browser WebGPU. `GPUProfiler.startFrame()/endFrame()`,
  `MemoryTracker.trackBuffer/trackTexture`, `trackShader(id, entry, µs)`,
  `BenchmarkSuite(device, adapter).runAll()` (6 passes: dispatch, bandwidth, register pressure,
  texture sampling, atomics, sparse writes). p50/p95/p99 percentiles. **Its own honest-capability
  matrix:** FPS real, GPU memory estimated (default 4 GB assumption), **power/temperature/clock
  not measurable from a browser**. npm name is **`browser-gpu-profiler`** (`webgpu-profiler` on
  npm is an unrelated author's package — trap). MIT. **97 TS tests (5 skipped), 119 pytest.**
- `PARTIAL` sources: **hwscan** ("Hardware scanner — real hardware detection for the fleet…
  emits a **machine tier** classification" — tier names/JSON shape unread), **gesture-kit**
  ("Path primitives for the fleet UI — stroke gesture recognizers, $P point-cloud recognizers"),
  **deckboss** ("DeckBoss — The Agent Edge OS"), **spatial-registry** ("four worlds, thirty-three
  rooms, cross-world pathfinding"), **fleet-dashboard** ("Live fleet status board", has a live
  deployment). **`signal-viewer`: 9 fetch attempts, every one a proxy -500, never a 200 or 404 →
  treat as NOT FOUND.**
- **`UNVERIFIED` and must not be assumed:** `SDALoop` (TASK names it; no repo I read contains
  that string), **Ollama/local-first** (nothing read mentions it; tidepool's embeddings are
  computed on Cloudflare), **"sectors"** (no file read uses the word), **PLATO/deadband/funnel/
  currents/layers inside tidepool** (absent from everything I read of it).

---

## 3. THE FIVE MOVES

**(a) Every operator action is a receipted cell.** Vendor `jev-receipts` as-is — it is already
UMD (`root.JevReceipts`), so `import './vendor/jev-receipts.js'` needs no bundler config. A cell
runs → `chain.book(kind, payload)` → the receipt appears in the Q phosphor pane; export writes
`witness.jsonl` (one JSON object per line, `hash`/`parent`/`body`). Use the existing dotted
`kind` convention and **propose** `operator.cell.run`, `operator.cell.export`,
`operator.chain.verify` — following the repo's `jev.alarm` / `duke.argument` shape; these three
names are new, not found in the repo. Reserve `JevCell` for live gauges: its
`{window=8, floor=0.08}` alarm is exactly a "is this number sane?" check on a cell's output.
Blocked on the quilt kernel's real interface — see §4 P2.

**(b) The hero IS the tidepool.** Keep `HeroScene.tsx` untouched as the renderer; change only
what drives amplitude. Two honest hooks, both from verified fields: per-point amplitude from the
**JEV gate score `σ = √(c_emb · c_jev)`** of a recent `/api/recall` batch (surfaced memories
breathe high, suppressed ones lie flat), and per-point hue from `kind`
(`lesson|audit|design|playtest|pattern|tile|musician|session` → 8 hues, and we already have 3
accents `#6366f1/#8b5cf6/#22d3ee`). All the hygiene is already written: 6050 points, 1 draw call,
DPR ≤ 1.75, off-screen + hidden-tab pause, `prefers-reduced-motion` static frame. **Challenge to
kimi1:** tidepool contains no "currents," "layers," or PLATO anything — the deadband/funnel
grammar lives in `constraint-theory-core` ("Eisenstein lattices, deadband funnels, Laman
rigidity, metronome consensus, holonomy verification. 83 tests, zero deps"). So either read the
grammar across two repos (fine, say so) or re-label the layers as the JEV decisions
`surface/suppress/abstain`, which *are* in tidepool. Do not caption the hero with PLATO.

**(c) Sector tabs = the worlds, lazy-loaded.** `Worlds.tsx` already gives the pattern: module
array + `useState(0)` + `React.lazy`/`Suspense` (via `Characters.tsx`'s precedent). **Cut the
5-second auto-advance** — an ops deck must not rotate away from what an operator is reading.
Ground the world list in `spatial-registry`'s "**four worlds, thirty-three rooms**,
cross-world pathfinding" rather than inventing a taxonomy, and render each room with
`room-render` ("the rendering engine for each room"). Both are `PARTIAL` (listed, READMEs
unread) — confirm before wiring, but do not invent a competing world model when the fleet has one.

**(d) The flippable receipt.** Extend `Paper3D.tsx`'s `drawCertificate` to render the *chain*:
front face = the receipt (kind, payload, hash, timestamp), back face = the last N links with
`parent → hash`. Flip reuses the existing pointer-tilt path; the back face is a live
`ReceiptChain.verify()` re-walk with a per-link ✓/✗, rendered into the same 1024×640 canvas.
Fix the `resize`-listener leak while in there. **Honesty requirement, non-negotiable given this
fleet's own doctrine:** double FNV-1a-64 is **tamper-evidence, not cryptographic proof.** At
64 bits the birthday bound is ~2³² before a collision is expected, and anyone can recompute a
whole chain. The card must say "checksum chain — detects accidental corruption and naive
tampering" and not "cryptographically verifiable." Also resolve the canary: the repo pins
`fnv1a("café Δ 日本語") === 0x024a555471370b18d`, which is **17 hex digits** and cannot be a
64-bit value. `audit/hash-canary.mjs` prints both single- and double-round results for that
string and for TASK's `"café"` so this can be settled against the repo. **Do not hardcode a
canary constant until it is.**

**(e) The doctrine strip.** `Method.tsx`'s three-step layout becomes sense → decide → act,
lit by real SSE traffic rather than prose. Map to the verified enum: **sense** = `THERMAL` +
`MUTATION`, **decide** = `FLUX_GATE` + `PARENT_SELECT`, **act** = `BEAT` + `AGENT_SPAWN`.
TASK's "SDALoop" is `UNVERIFIED` — use the mapping above and label it as ours. Two integration
facts drive the work: frames are unnamed (`JSON.parse(e.data).type`, never
`addEventListener`), and the server is Python `http.server` on **8849** with **no CORS headers**,
so the browser cannot read it cross-origin. P1 therefore needs either a CORS patch upstream or a
same-origin proxy — and the `/dashboard` HTML (`sse_dashboard_ui.html`, 17,151 B) is worth
reading first, since it may already solve this.

---

## 4. BACKEND REBUILD PLAN

**P0 — static shell, renamed, honest.** Resolve the LICENSE blocker first. Then: rename package
`formation-coding-pro-3d` → the chosen name; `npm rm @designcodeio/threeui`; delete
`public/landscape.html` (2.4 MB); resolve the Tailwind v3/v4 conflict; add `.env` + `.env.*` to
`.gitignore`; replace **all** French copy — the repo's own comments admit it is fake
(`// 3 projets fictifs`, `// Avis élèves (fictifs…)`); delete `SocialProof.tsx`'s pravatar URLs;
self-host the three fonts; rewrite `README.md` (stock Vite boilerplate today), DECISIONS.md and
PROGRESS.md into fleet voice; rewrite `index.html` (`lang="fr"` → `lang="en"`, new title/meta).
*Verify:* `tsc -b && vite build` passes; `oxlint .` clean; zero outbound requests on load
(network idle, no pravatar/fonts); bundle under a stated byte budget; `public/` has no file >100 KB.

**P1 — live event deck.** SSE adapter (`EventSource` → parse `type` → store by `node_id`),
omnibar backed by `twin_query`, doctrine strip lit by real events, tidepool hero hooks. Solve
CORS (proxy or upstream patch). Local-first: `--http` mode + `local/query-local.sh` already give
a no-cloud path; **`FLEET_TWIN_URL` defaults to a Cloudflare worker, so local mode is an explicit
opt-in, not the default.** Ollama is `UNVERIFIED` — nothing in the fleet read mentions it, and
tidepool computes BGE embeddings at write time on Cloudflare, so a local embedding path is new
work, not a configuration. *Verify:* own test counts (an event-round-trip fixture replaying
recorded SSE frames against the adapter), `oxlint .` clean, and the honest-numbers strip shows
**our** counts, not aspirational ones.

**P2 — receipt-native ops + WebGPU dogfooding.** Quilt cells in the pane, `witness.jsonl` export
and sync, receipt card live on the real chain, `browser-gpu-profiler` measuring the deck itself.
Dogfooding is where the honest-numbers strip stops being a claim: FPS/p95 from `GPUProfiler`,
adapter info from `requestAdapterInfo()`, and **publish the profiler's own capability caveats
alongside** (memory estimated, power/temperature/clock unavailable) — reporting a number you
cannot measure would violate the doctrine. *Verify:* build + lint clean; `chain.verify()` green on
a 10,000-entry chain with a timing budget; WebGPU path tested on a machine without WebGPU and must
degrade, not blank.

---

## 5. EDGES

- **Breeding observatory.** `wire_to_breeder` already emits `BEAT
  {action:"breed_cycle_start", n_winners}` and `PARENT_SELECT {winners,
  action:"breed_cycle_end"}`. The hero is one shader constant away from showing a breed cycle
  live — `n_winners` driving wave height. That makes the deck a window into selection pressure
  as it happens, which no static page can claim.
- **Onboarding instrument.** A new dev's first task: steer a real agent in a real room, with every
  action receipted. The receipt chain becomes their onboarding log — provable work from day one.
  Needs no new backend; it is a view over P1 plus a run-scoped `witness.jsonl`.
- **Hardware installer demo floor.** hwscan emits a **machine tier** (`PARTIAL` — tier names
  unread), so a demo can be: run hwscan → show tier → suggest a fleet role. Genuinely useful for
  installers, and it makes the deck the thing that *classifies the machine you are holding*.
  Must read hwscan's actual tier list before shipping a claim about specific hardware.
- **Robotics.** `gesture-kit`'s "$P point-cloud recognizers" driving vessel steering is the most
  interesting edge and the least verified — no exported names captured. `deckboss` ("The Agent
  Edge OS") is the likeliest home for a runtime that would consume those paths; TASK calls it
  "deckboss's spatial sibling" and nothing I read confirms that. Keep as a research spike.
- **"signal-viewer layers" → re-point.** `signal-viewer` is `NOT FOUND` (9 proxy -500s). The
  instrument-grammar idea survives on verified ground: `constraint-theory-core`'s deadband
  funnels. Use that instead, or re-confirm the repo exists.
- **Receipt as collectible proof-of-work.** The most culturally interesting edge and the one most
  in tension with the doctrine. A 64-bit checksum chain is not scarcity and not a signature; if
  receipts become collectibles, say so as a *social* convention, not a cryptographic one. The
  honest framing is "a log you can prove you kept," not "a token."

---

## 6. NAME + DOCS

**Eight nautical short words checked across GitHub and npm; every one contested.** `quarterdeck`
(GitHub **Organization** `id 3441883` + npm `quarterdeck` 0.2.8 "Web3 domain names"),
`quarterdeck-fleet` (npm 0.0.1 — explicitly a **"placeholder"** "fleet management SDK"), `tidegate`
(GitHub **User** `id 8923471`, created 2014; npm free), `quarterboard`, `tidebook`, `helmboard`
(GitHub **Organization**; npm "Kubernetes dashboard for helm releases"), `wardroom`, `decklog`.
`helmboard` also embeds "Helm," guaranteeing a search fight. **Conclusion: the short-word
nautical namespace is exhausted. Stop brainstorming candidates.** The constraint is narrower than
it looks, because **GitHub collision is already solved by owner placement** — a repo name is only
unique *within its owner* (and `SuperInstance` is a user account, not an org), so
`SuperInstance/decklog` is unambiguous despite `github.com/decklog`
existing — and **npm collision is solved by scoping**, which the fleet already uses
(`@superinstance/live-canon` appears in the flagship list).

| candidate | npm | rationale |
|---|---|---|
| `@superinstance/quarterdeck` | scoped, fine | **kimi1's name, kept.** The collision is an unscoped-npm problem we do not have. Zero cost to the concept. |
| `@superinstance/decklog` | scoped, fine | a deck log is the ship's official operations record — receipt-native by definition. Cleanest namespace of the eight checked. |
| `@superinstance/tidegate` | **unscoped also free** | tidepool + the verified `FLUX_GATE` event type. Only candidate where the unscoped name is actually available. |

**Recommendation: keep `quarterdeck`** under the `SuperInstance` repo and the `@superinstance`
scope. The name is right; the registry collision is not a problem we actually have. Only reach for
`decklog` if an unscoped npm publish is ever a real requirement.

**Docs outline.**
- **README.md** — fleet voice, not course voice. Open with what the deck *is* (the live 3D
  operations deck for the fleet), then "run it yourself": clone, serve, and what you will and will
  not see without a backend. A short **honesty** section stating what is live, what is static, and
  what is estimated — mirroring webgpu-profiler's capability matrix, which is the best precedent
  in the fleet. No testimonial-shaped claims anywhere.
- **FOR-OPERATORS.md** — for the four audiences named in the brief, but written as *tasks*, not
  personas: installers (hwscan → tier → role), operators (read the doctrine strip, export a
  witness), developers (add a cell, book a receipt), robotics (steer a vessel). Each with the
  command they actually run. Say plainly which features require which backend up.
- **RECEIPTS.md** — the chain contract: entry `{hash, parent, body}`, `body =
  JSON.stringify({kind, payload})`, genesis `parent` = 64 zeros, **double FNV-1a-64**, and the
  `kind` registry. State the tamper-evidence-not-crypto limit in the first paragraph, and the
  in-browser verifier's exact guarantee. Include the canary **only once it is settled** — the
  repo's published constant is currently 17 hex digits and cannot be right.

---

## Appendix — what was and was not verifiable here

`gh`, `git`, `npm`, `node`, and all shell execution are approval-gated in this sandbox, as are
WebFetch/WebSearch; the filesystem is scoped to this workspace. All evidence came through the
`web_reader` MCP tool (raw.githubusercontent.com, github.com blob/tree pages, registry.npmjs.org,
npmjs.com, data.jsdelivr.com). Consequences, stated plainly: the fnv1a-64 canary could not be
computed (`audit/hash-canary.mjs` and `audit/hash-canary.sh` are provided for whoever can run
them); `index.html` could not be retrieved verbatim; the `wardroom` and `signal-viewer` fetches
never returned a clean 200 or 404; and quilt-backend's kernel source was never read. Every
`PARTIAL`/`UNVERIFIED` mark above is a place a later lane should spend ten minutes before
building. No number in this document was assumed.
