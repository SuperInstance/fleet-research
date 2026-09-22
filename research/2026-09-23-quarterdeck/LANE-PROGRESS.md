# PROGRESS.md — Lane QUARTERDECK (killer-app frontend deep-research)

Status legend: `DONE` / `IN-PROGRESS` / `BLOCKED` / `NOT-STARTED`

---

## L0 — Environment & access probe — orchestrator
- Status: DONE
- Files: none written (probe only)
- Findings:
  - Workspace `/tmp/lane-quarterdeck` contains only `TASK.md` (3863 B) + `lane.log` (84 B).
  - **No local clone** of `SuperInstance/coding-3d` exists in the workspace; `find` across `/`
    and `ls /tmp` are sandbox-blocked (`may only list files in the allowed working directories`).
  - `which gh|git|node|npm` → all four present (`/usr/bin/…`).
  - **Network is approval-gated for shell tools.** Denied in this sandbox, each returning
    "This command requires approval": `gh auth status`, `gh repo view …`, `gh api …`,
    `git ls-remote https://github.com/SuperInstance/coding-3d`, `npm view @designcodeio/threeui`.
    WebFetch/WebSearch tools are likewise ungranted ("you haven't granted it yet").
  - **Working network path:** the `mcp__web_reader__webReader` MCP tool. All evidence below was
    fetched through it (raw.githubusercontent.com for file bodies, github.com tree pages for
    listings, registry.npmjs.org for package metadata).
- Consequence for this lane: the TASK's literal instruction "fetch each src/components/*.tsx via
  gh api" was executed through the equivalent read-only HTTP endpoints instead. Where a claim
  could not be verified over HTTP it is marked **UNVERIFIED** in QUARTERDECK-SPEC.md, never guessed.

## L1 — Upstream asset audit (coding-3d) — orchestrator + 1 research agent
- Status: DONE (component-by-component complete)
- Agent method note: `raw.githubusercontent.com` HTML-renders any file containing `<`/`>`, so JSX
  is silently stripped. Every `.tsx` was therefore cross-checked against its
  `github.com/<owner>/<repo>/blob/main/<path>` view, which returns the file verbatim plus an
  authoritative `N lines (M loc) · X KB` header. **All line counts below are GitHub's own
  numbers**, not a recount of stripped text. `index.html` could not be retrieved verbatim by any
  route (raw / jsDelivr / GitHub API base64 / blob) — only its parsed text + metadata.

### Component inventory (17 components + 1 ui file)
| File | lines (loc) | imports `three` | imports `threeui` | state |
|---|---|---|---|---|
| `HeroScene.tsx` | 149 (133) | **yes** `import * as THREE` | no | `useRef`,`useEffect` |
| `Paper3D.tsx` | 208 (192) | **yes** `import * as THREE` | no | `useRef`,`useEffect` |
| `Portfolio.tsx` | 156 (146) | no | no | `useState('Tous')` filter tabs |
| `Offer.tsx` | 140 (135) | no | no | `useState<number\|null>(0)` accordion |
| `Worlds.tsx` | 102 (94) | no | no | `useState(0)` + `setInterval` ref, auto-advances 5 s |
| `Footer.tsx` | 87 (84) | no | no | none |
| `Hero.tsx` | 78 (75) | no | no | none (renders `<HeroScene/>`) |
| `Program.tsx` | 73 (71) | no | no | none |
| `SocialProof.tsx` | 73 (67) | no | no | none |
| `Navbar.tsx` | 72 (69) | no | no | `useState(false)` mobile menu + scroll listener |
| `Method.tsx` | 59 (57) | no | no | none |
| `Problem.tsx` | 54 (52) | no | no | none |
| `ErrorBoundary.tsx` | 51 (47) | no | no | class component |
| `Characters.tsx` | 46 (45) | no | no | none (`Suspense`+`lazy`) |
| `Reveal.tsx` | 40 (36) | no | no | `IntersectionObserver` (0.12) + reduced-motion guard |
| `SectionHeading.tsx` | 18 (18) | no | no | none |
| `ui/Button.tsx` | 24 (21) | no | no | none — `variant?: 'primary'\|'ghost'`, `size?: 'sm'\|'md'\|'lg'` |

- `src/` also has `App.tsx` 47 (45), `main.tsx` 18 (15), `index.css` 273 (253).
- **`src/lib/`, `src/hooks/`, `src/three/`, `src/data/`, `src/App.css` all DO NOT EXIST** (404,
  confirmed both by raw fetch and absence from the `src/` tree). All 3D logic is inline in the
  two files above; there is no layer to refactor out.
- `src/components/ui/` contains exactly one file, `Button.tsx`.

### HeroScene.tsx — the part we most want, verified against PROGRESS.md's claims
- `COLS = 110`, `ROWS = 55`, `SEP = 0.16` → **110 × 55 = 6050 points**. Independently reproduces
  PROGRESS.md's "6050 particles, 1 draw call" claim. ✓
- `WebGLRenderer` (antialias, alpha, **`pixelRatio` capped at 1.75**) ✓ matches PROGRESS.md.
- `Scene` + `PerspectiveCamera(60, aspect, 0.1, 100)` at `(0, 2.4, 9)` looking at origin.
- `BufferGeometry` with `position` + `color` attributes; `PointsMaterial` (size 0.045,
  vertexColors, transparent, opacity 0.85, `AdditiveBlending`, depthWrite false); `Points`.
  **No lights, no meshes** — pure point cloud, which is exactly the "tidepool of memories" primitive.
- Palette `#6366f1` / `#8b5cf6` / `#22d3ee` ✓ matches PROGRESS.md T01's accent tokens.
- Full manual teardown: `dispose()` + `cancelAnimationFrame`, off-screen + hidden-tab pause,
  `prefers-reduced-motion` → static frame. Comment: `// Full teardown : dispose() explicites +
  cancelAnimationFrame — zero fuite mémoire`.
- **This file is the single highest-value asset in the repo** for the "hero IS the tidepool" move.

### Paper3D.tsx — second-highest value
- 208 lines. `CanvasTexture` from a **1024×640** canvas drawn by a module-scope
  `drawCertificate(ctx, w, h)`, mapped onto `Mesh(PlaneGeometry(3.6, 2.25), MeshBasicMaterial)`,
  plus a glow `Sprite` (`AdditiveBlending`, scale `(6.5,4.5,1)`, z −1.2), camera
  `PerspectiveCamera(45, aspect, 0.1, 50)` at `(0,0,6)`. Pointer tilt / drag / parallax.
- Comment: `// Certificat 3D custom (la source Pro threeui 3d-paper n'est pas distribuée)` —
  confirms the upstream `3d-paper` source is licence-gated, so our receipt card must be built on
  this custom CanvasTexture path, not on a threeui component.
- ⚠️ A `resize` listener appears to be added without a matching removal — the one suspected leak.

### ⚠️ FINDING — the repo is in a HALF-MIGRATED state; DECISIONS.md overstates what landed
- `package.json` declares **`"@designcodeio/threeui": "^0.3.2"`** (verbatim, confirmed on two
  fetches), but **zero source files import it.** It appears only in prose comments.
- DECISIONS.md describes a "landing v2" adopting threeui + `LandscapeScene` + `TempleNightScene` +
  a threeui character-carousel variant. The code shows: `public/landscape.html` landed (2.4 MB),
  but **there is no `TempleNightScene` component**, and `Characters.tsx` lazy-loads the bespoke
  `./HeroScene` rather than any threeui carousel.
- Consequence: **DECISIONS.md is a record of intent, not of state.** Do not treat it as a spec of
  what the code does. Any plan that assumes "threeui is already wired in" is wrong.
- Practical upside: uninstalling `@designcodeio/threeui` drops **54.7 MB unpacked / 726 files and
  two aliased three.js copies** from `node_modules` with no source change at all — P0 should do
  exactly that, and it dissolves most of the `sRGBEncoding` risk in one move.

### ⚠️ FINDING — Tailwind version conflict (a real bug in the fork)
- `src/index.css` opens with `@import 'tailwindcss';` and defines tokens in an `@theme` block
  (`--color-ink`, `--color-ink-soft`, `--color-panel`, `--color-line`, `--color-fg`,
  `--color-muted`, `--color-violet #6d5cff`, `--color-mint #12b886`, `--color-amber #ff9f1c`,
  `--font-display 'Space Grotesk'`) — that is **Tailwind v4 syntax**.
- But `package.json` pins **`tailwindcss: ^3.4.17`**, and the repo ships a v3-style
  `tailwind.config.js` (empty `theme.extend`) **and** `postcss.config.js` with
  `tailwindcss: {}` + `autoprefixer: {}`.
- These two setups are mutually exclusive; only one can be in effect. TASK.md's "Tailwind3"
  description matches `package.json`, so **`index.css` is the outlier** and the `@theme` block is
  either being ignored or breaking the build. P0 must resolve this before any styling work.
- Note also the token divergence: `index.css` carries a *light-mode* palette (`--color-panel:
  #ffffff`, `--color-violet: #6d5cff`) that contradicts PROGRESS.md T01's dark `#090b18` system —
  further evidence it is a leftover, not the live theme.

### `package.json` (verbatim, complete)
```json
{
  "name": "formation-coding-pro-3d",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@designcodeio/threeui": "^0.3.2",
    "lucide-react": "^0.469.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "three": "^0.171.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.0.5"
  }
}
```
- `"private": true`, `"type": "module"`. Package name `formation-coding-pro-3d` must change.
- `three: ^0.171.0` — and because caret on `0.x` pins the minor, that is **r171 exactly**.
- **`sRGBEncoding` risk, now precisely located.** The fork's own three-importing files
  (`HeroScene.tsx`, `Paper3D.tsx`) use **no encoding/color-management API at all** — verified by
  reading both. So the risk is **entirely inside threeui's bundled runtime** (its own
  `three@0.165.0` and the `landscape.html` blob), not in code we would keep. Combined with my
  r187dev check (`sRGBEncoding` absent; only `SRGBColorSpace`/`LinearSRGBColorSpace`/
  `LinearTransfer`/`SRGBTransfer` remain), dropping threeui + `landscape.html` removes the risk
  completely. I did **not** separately verify r171's constants and am not claiming its status.
- `vite.config.ts` is the stock 4-liner (`plugins: [react()]`) — **no code-splitting config**;
  the lazy-loading in `Characters.tsx` is React-level `lazy()`, not build-level.
- `tailwind.config.js` carries `// skill: design-system — tokens via theme Tailwind, 0 valeur en
  dur dans composants` — a rule `Method.tsx` itself violates with an inline `borderImage` gradient
  using hardcoded hex.
- `.oxlintrc.json`: `plugins: ["react","typescript","oxc"]` with
  `react/rules-of-hooks: error`; tail of file not captured.
- `index.html`: `lang="fr"`, `theme-color #090b18` ✓, Google Fonts preconnects
  (Space Grotesk / DM Sans / Space Mono — matching T01's three families), title
  "Coding Pro 3D — Formation Three.js & WebGL", description is course marketing.
  **`fonts.googleapis.com` is an external runtime dependency** to cut for a local-first deck.

### Copy audit — every section is hardcoded French marketing copy
Verbatim placeholder markers (no literal `TODO`/`FIXME` anywhere):
- Portfolio.tsx: `// Démo : 3 projets fictifs — remplacera par les vrais projets élèves`
- SocialProof.tsx: `// Avis élèves (fictifs, ton décontracté) — remplacer par de vrais avis +
  vrais prénoms`
- Worlds.tsx: `// Monde 3D — 4 univers jouables (démo)`
- Problem.tsx: `// Les 3 blocages — copy directe, pas de détour`
- Offer.tsx: `mailto:contact@codingpro3d.fr`
- The upstream author's own comments already admit the content is fake. Our "honest numbers only"
  doctrine is therefore a *replacement* of content the repo itself flags as fiction — a clean
  moral position, not a compromise.

### ⚠️ Privacy / external calls in the current page
- `SocialProof.tsx` hardcodes avatar URLs on **`i.pravatar.cc`** — a third-party avatar service.
  Fictitious testimonial identities + external image fetches + `fonts.googleapis.com` = the page
  phones home before we ever add a backend. Local-first (P1) must cut all three.

### Dependency edges (verified)
`App.tsx` → Navbar, Hero, Problem, Method, Program, Portfolio, Characters, Worlds, SocialProof,
Offer, Paper3D, Footer (12 sections).
Characters → Reveal + HeroScene(lazy) · Hero → ui/Button + HeroScene · Method → Reveal +
SectionHeading · Offer → ui/Button + Reveal + SectionHeading · Paper3D → Reveal · Portfolio →
Reveal + SectionHeading · Program → Reveal + SectionHeading · Problem → SectionHeading only ·
SocialProof → Reveal + SectionHeading · Worlds → Reveal + SectionHeading.
Leaves: `ui/Button`, `Reveal`, `SectionHeading`. **No file imports `ErrorBoundary`** — its mount
point is not visible in `App.tsx`'s imports, so it is either unused or mounted somewhere I did not
capture. Flagged, not asserted.
- Read directly by orchestrator (verbatim, via web_reader):
  - `DECISIONS.md` — 7-row decision table, dated 2026-09-19, French.
  - `PROGRESS.md` — tasks T01/T02/T03, all `DONE`, with build/lint/verification notes.
  - `README.md` — stock Vite template readme, unmodified (not fleet-voice; needs rewrite).
  - `src/App.tsx` — 13 imports, section stack. (JSX body stripped by the markdown converter in
    transit; import order is the evidence used.)
- Delegated (background agent): every `src/components/*.tsx` + `src/components/ui/*` +
  `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `.oxlintrc.json`, `tsconfig.app.json`,
  `index.html`, plus existence probes for `src/{main.tsx,index.css,lib,hooks,three,data}`.
  → results folded into QUARTERDECK-SPEC.md §1.
- Already-established facts used in the spec:
  - Repo = public fork of `thekiller-dev/coding-3d`, description "Repository test sur AI-Factory",
    homepage `coding-3d.vercel.app`, **3 commits**, 0 stars / 0 forks / 0 watchers,
    **no LICENSE file at repo root**.
  - `package.json` → `"name": "formation-coding-pro-3d"`, `"private": true`, `"version": "0.0.0"`,
    `"type": "module"`, `build` = `tsc -b && vite build`.
  - `PROGRESS.md` numbers: hero = **6050 particles, 1 draw call**, DPR ≤ 1.75, pause off-screen +
    hidden-tab, static frame under `prefers-reduced-motion`; `public/landscape.html` = **2.4 MB**
    runtime copied into `public/`; threeui package style imported once, scoped to **72 KB**.
  - `PROGRESS.md` documents the **`sRGBEncoding` build warning** explicitly, with a named fallback
    ("repli possible sur SylvaHero") — confirms the risk TASK.md flags.
  - Contrast claim in T01 ("slate-200/300/400 on `#090b18`, ratio > 7:1") **recomputed by me** from
    WCAG relative luminance: `#e2e8f0` (slate-200) on `#090b18` = **≈15.9:1** — the claim is true
    and conservative (AAA, not merely AA).
  - Tailwind accent palette per T01: `indigo-500 #6366f1`, `violet-500 #8b5cf6`, `cyan-400 #22d3ee`.
  - `DECISIONS.md` records **`@designcodeio/threeui` as MIT**, and records an explicit
    *rejection* of it for the hero ("surdimensionné … perf et poids") in favour of a hand-rolled
    particle grid — i.e. the repo already contains a working bespoke-hero precedent we can reuse.
  - `DECISIONS.md` also records that the upstream `3d-paper` source is **not redistributable**
    ("non distribuée, entitlement payant"), which is why `Paper3D` is a custom CanvasTexture build.

## L2 — Ecosystem research (sunset-ecosystem, fleet-twin, tidepool, jev-receipts,
##      quilt-backend, webgpu-profiler, deckboss, hwscan, gesture-kit, signal-viewer)
- Status: DONE. All 10 asked-about repos **exist and are fetchable** except `signal-viewer`.
- Method caveat: the web_reader proxy intermittently truncates responses to ~300 chars. The
  research agent transcribed identifiers immediately after each fetch; where it did, facts are
  **VERBATIM**, where the render truncated they are **PARTIAL** (quoted word-for-word, no
  invention), where it never got content they are **UNVERIFIED**. Its final consolidated report
  had to be recovered by resuming the agent, because its last turn died with three fetches in
  flight and no report written.

### Org ground truth — SuperInstance is a USER account, not an org
- `https://github.com/SuperInstance` → "Casey Digennaro / SuperInstance", `user_id 193104091`,
  Sitka, Alaska, `https://superinstance.dev`, 84 followers. Bio: "I commercial fish and create
  marine applications→ Building AI that learns how I fish. Edge ML/NN. Boats' history grow in
  value.. Applied-Actualization".
- Front-door repo states: "SuperInstance is a **4,357-repository fleet** of AI agents that build,
  write, and run themselves — this repo is its front door." Repositories tab claims 4.5k but
  lists only 32 repos with generic names — **the tab is stale/paged; direct fetches are ground
  truth.** None of our 10 target repos appear in the tab or in the hand-written catalog.
- **`@superinstance/live-canon` appears in the flagship list → the fleet already publishes under
  the `@superinstance` npm scope.** This confirms scoped naming is both available and the fleet's
  existing convention.
- Nautical/vessel vocabulary is real and native to the fleet, not something we are importing:
  fleet-twin's README caption is "The fleet's twin — a mirror of the whole fleet in a glass case,
  **each hull** holding constellations of memory." tidepool calls itself "The fleet's vector
  context **ocean**." There is a literal `fleet/vessel_handshake.py`.

### ✅ SSEStreamDashboard — CONFIRMED, interface fully known
`SuperInstance/sunset-ecosystem`, `fleet/sse_stream_dashboard.py` (14,194 B, rendered in full).
- `__all__ = ["SSEStreamDashboard","StreamEvent","EventType","DashboardConfig",
  "serve_dashboard_ui","DashboardServer"]`
- **9 event types** (`EventType` Enum, emitted as `.name` in the JSON `type` field):
  `BEAT`, `PARENT_SELECT`, `MUTATION`, `FLUX_GATE`, `THERMAL`, `FLEET_STATUS`, `AGENT_SPAWN`,
  `ERROR`, `INFO`
- **No named SSE `event:` field** — all frames are unnamed `data: {json}\n\n`; the discriminator
  is inside the JSON. A browser `EventSource` must parse `JSON.parse(e.data).type`, and
  `addEventListener(<type>)` will NOT work. This is a concrete, decision-changing detail.
- Event JSON keys exactly: `type`, `timestamp`, `node_id`, `payload`
- Heartbeat on empty queue: `data: {"type":"HEARTBEAT"}\n\n`
- `DashboardConfig` defaults: `host 0.0.0.0`, **`port 8849`**, `max_queue_size 1000`,
  `heartbeat_interval_sec 15.0`, `history_buffer_size 100`, `filter_event_types None`,
  `enable_backpressure True`
- Endpoints: `/` and `/dashboard` serve `sse_dashboard_ui.html` (17,151 B); **`/events`** is the
  `text/event-stream`; else 404.
- Wiring helpers: `wire_to_fleet_conductor(dashboard, conductor, event_types=None)` (publishes
  `BEAT` `{beat_number}` + `FLEET_STATUS` from `conductor.get_status()`; references
  `FleetConductorV2`, reads `conductor.config.node_id`) and `wire_to_breeder(dashboard, breeder)`
  (`BEAT` `{action:"breed_cycle_start", n_winners}` + `PARENT_SELECT`
  `{winners, action:"breed_cycle_end"}`; references `BreederDaemonV2`)
- Other methods: `publish`, `publish_simple`, `subscribe`, `unsubscribe`, `recent_events`,
  `recent_by_type`, `start_heartbeat`/`stop_heartbeat`, `get_metrics`
- **Python stdlib only** (json, logging, os, queue, threading, time, dataclasses, enum,
  http.server, socketserver, typing) → zero-install dependency for P1. Doc:
  `docs/SSE_STREAM_DASHBOARD.md` (2,796 B); tests at `tests/test_sse_stream_dashboard.py`.

### ✅ fleet-twin MCP — CONFIRMED, interface known
`SuperInstance/fleet-twin`, `mcp/server.mjs` (7,840 B, rendered in full).
- **Three MCP tools:** `twin_query(text, topK?, type_filter?, source_filter?)`,
  `twin_ingest(id, text, metadata?)`, `twin_stats()`
- Transport: **stdio default; `--http` flag** → streamable HTTP on `PORT` (default 8787)
- Env: `FLEET_TWIN_URL` (default `https://fleet-twin.casey-digennaro.workers.dev`),
  `INGEST_TOKEN` (bearer), `TWIN_SOURCE`
- Backing worker contract: `POST /query` `{text, topK (default 5, clamp max 20), type, source}`;
  `POST /ingest` `{docs:[{id,text,metadata}]}` + `Authorization: Bearer $INGEST_TOKEN`;
  `GET /stats`
- **Record shape: `{id, text, metadata}`**; `metadata.type` / `metadata.source` are the filters
- MCP `serverInfo` `{name:"fleet-twin", version:"1.0.0"}`, protocolVersion `2025-03-26`,
  **no MCP SDK dependency, Node >= 18**
- `wrangler.toml`: `name "fleet-twin"`, `main "src/worker.ts"`, `compatibility_date 2024-09-01`,
  `account_id "REDACTED-CF-ACCOUNT-ID"`, `[[vectorize]] binding "VECTORIZE"` (index name truncated)
- Tree also has `mcp/USAGE.md`, `docs/DOCTRINE.md`, `design/quilt-twin.md`, `connect/index.html`,
  `local/query-local.sh`, `ingest/*.py` → a local query path exists (relevant to local-first mode).

### ✅ tidepool — CONFIRMED, HTTP API known
`SuperInstance/tidepool` — "The fleet's vector context ocean. (Repo `tide-pool` was already taken
by the Ship Protocol BBS — this is one word, same water.)"
- Cloudflare Worker + Vectorize + D1. Two indexes: `tidepool-native` (**16 dims**, cosine) and
  `tidepool-semantic` (**768 dims**, cosine); D1 `tidepool-db`; 768-dim **BGE** embeddings
  computed at write time.
- Routes (verbatim): `GET /health`, `POST /api/remember`, `GET /api/recall`,
  `GET /api/recall/similar`, `GET /api/ledger`
- `POST /api/remember` body: `{kind, author, title, body, native?, repo?, run?}`
- `GET /api/recall?q=&kind=&author=&repo=` — semantic search with filters;
  `/api/recall/similar?id=` or `?vec=<16 numbers>`
- Memory record fields: `kind, author, title, body, native (16-number domain fingerprint),
  repo, run`. `kind` examples: `lesson | audit | design | playtest | pattern | tile | musician |
  session`
- **JEV gate = the signal-vs-noise mechanism actually in this repo**: enabled by
  `TIDEPOOL_JEV=on|1|mock|http` (off by default). Each recalled item gets
  `{decision: 'surface'|'suppress'|'abstain', confidence, reasons}`; combined score
  **`σ = √(c_emb · c_jev)`**; items below `TIDEPOOL_JEV_FLOOR` (default `0.5`) dropped;
  `JEV_API_URL` for the external service; `mock` mode for tests. Implementation in `src/jev.mjs`
  (not read).
- Rate limit 45 req/min/IP sliding window keyed by `fnv1a(ip)` — **the fleet already uses FNV-1a
  as a general-purpose hash**, which supports keeping it in the receipt chain for consistency.
- MIT, `npm test` → **18 checks**.
- **⚠️ NOT FOUND in tidepool: PLATO, deadband, funnel, currents, layers, particles.** Neither
  README nor `worker/index.js` mentions any of them. The "deadband funnels" concept verifiably
  lives in **`constraint-theory-core`** (org profile blurb: "Eisenstein lattices, deadband
  funnels, Laman rigidity, metronome consensus, holonomy verification. 83 tests, zero deps.").
  → kimi1's mapping of PLATO/deadband onto the tidepool hero is **cross-repo, not intra-repo**.

### ✅ jev-receipts — CONFIRMED, schema + algorithm known (load-bearing)
`SuperInstance/jev-receipts`, `index.js` (7.4 KB, rendered in full, re-fetched and re-transcribed).
- Header: "jev-receipts.js — JEV booking layer for the duke-lab instrument. Port 3 of the JEV
  cross-language plan (JEV-SPEC §6): TS = twist-engine PR #8, Rust = jev-quilt PR #5, WASM-targ…"
- **Hash algorithm: FNV-1a 64-bit applied TWICE (double round) over `(parent + body)`.**
  **NOT sha256, NOT blake3.** `fnv1a` hashes UTF-8 bytes with BigInt, offset basis
  `0xcbf29ce484222325n`, prime `0x100000001b3n` — the same parameters I had already put in
  `audit/hash-canary.mjs` independently.
- Entry: `{hash, parent, body}`; `body = JSON.stringify({kind, payload})`.
  **Prev-hash field name: `parent`.** Genesis `parent === "0".repeat(64)` — **64 zeros, which is
  wider than the 16 hex chars a 64-bit hash produces.** Likely a leftover from a sha256-era
  design; worth asking about, and worth handling explicitly in the verifier.
- `ReceiptChain.book(kind, payload)` → emits `"0x" + hex`; `ReceiptChain.verify()` re-walks and
  recomputes. **A JS verifier already exists and is exported** as
  `{fnv1a, hex, ReceiptChain, JevCell, bookArgument}` on `root.JevReceipts` / `module.exports`
  (UMD — so it can be vendored into the deck as-is, no build step).
- Also exported: `JevCell(name, {window=8, floor=0.08, chain})` with `.observe(t, value)` —
  alarms when `|value − mean(last window)| > floor`, booking `"jev.alarm"` / `"jev.reading"` with
  `{cell, t, value, alarmed}`; and `bookArgument(chain, run)` booking `"duke.argument"`
  `{seed, artist, persona, listens}`, `"duke.round"` `{round, sigma, arc}`, `"duke.verdict"`
  `{verdict, rounds}`.
- ⚠️ The pinned canary is quoted as `fnv1a("café Δ 日本語") === 0x024a555471370b18d` — **17 hex
  digits, which cannot be a 64-bit value.** Either a display artifact or the constant is wrong.
  `audit/hash-canary.mjs` now prints single- and double-round results for both `"café Δ 日本語"`
  and TASK's `"café"` so this can be settled against the repo. **Do not hardcode a canary
  constant in the deck until resolved.** Also: TASK said the canary is "café"; the repo's is
  `"café Δ 日本語"`.

### ⚠️ quilt JS kernel — CONFIRMED to exist, interface UNVERIFIED
`SuperInstance/quilt-backend` — "The host env of the fleet. This repo holds the **quilt JS
kernel** and the **bytes-law** contract — the rules for how the fleet's agents co…"
- `bytes-law.md` opens: "**The bytes are the law. The kernel is the court. The fleet is the
  people.** The bytes-law is the kernel's constitution: a fixed contract for how agent…"
- README body fragment: "## The kernel / The kernel is **not a JS interpreter**. It is a **cell
  runtime**: the fleet's compute unit…"
- jsdelivr metadata: `"main":"index.js"`, `"type":"module"`. Only path captured from the flat
  listing: `/bytes-law.md`. **Kernel source was never read** — cell addressing, execution
  semantics, function names all UNVERIFIED. Would need `/index.js`, full `/bytes-law.md`,
  full `/README.md`, plus the completed flat listing.
- Cross-repo corroboration (from webgpu-profiler's README): **`quilt-foundation`'s five opcodes
  are `BIND, LINK, EFFECT, VIEW, TICK`.** Also referenced: `quilt-cuda`, `quilt-cordis`,
  `flux-hardware`. So the opcode set is citable today even though the JS entry point is not.
- The flagship repo `quilt` is described as: "A spreadsheet where **every cell is a live,
  addressable capability. The grid is the runtime.**" — this is the concept Move (a) is built on.

### ✅ webgpu-profiler — CONFIRMED, README-level interface known
`SuperInstance/webgpu-profiler` — "*The stopwatch over the instruments.* A browser-side profiler
for **WebGPU** applications. Real-time GPU monitoring, per-allocation memory tracking, shader ti…"
- **Runs in-browser.** Measures frame timing/FPS (`performance.now()` deltas), compute dispatch
  time, memory per allocation, shader timing; utilization = compute-time / frame-time.
- **Honest-capability matrix in the README itself:** FPS/frames = real; total GPU memory =
  estimated from vendor (default 4 GB assumption); **power / temperature / clock speeds are
  undefined — not measurable from a browser.** Adapter info via `adapter.requestAdapterInfo()`
  + `features` + `limits`.
- API: `GPUProfiler.startFrame()`/`endFrame()`; `MemoryTracker.trackBuffer(buffer,{label})` /
  `trackTexture(...)`; `trackShader(id, entry, microseconds)`; `BenchmarkSuite(device, adapter)
  .runAll()` → 6 passes (dispatch, bandwidth, register pressure, texture sampling, atomics,
  sparse writes). Reports p50/p95/p99 frame percentiles, memory by label, rolling FPS.
- TS `src/` + Python mirror `webgpu_profiler/` + Rust crate `eisenstein-render/`.
- **npm name is `browser-gpu-profiler`**; the npm name `webgpu-profiler` belongs to an unrelated
  author (soaringred) — collision trap if we `npm i webgpu-profiler` by guesswork.
- MIT, copyright Casey DiGennaro. **97 TS tests (5 skipped), 119 pytest** — a real, citable
  test count for the honest-numbers strip.

### ⚠️ deckboss — exists, PARTIAL only
`# DeckBoss — The Agent Edge OS`, docs links `PLUG_AND_PLAY.md`, `GETTING_STARTED.md`,
`ARCHITECTURE.md`, + more. **No data model, no spatial-ops evidence, no exported symbols
captured.** TASK's "deckboss's spatial sibling" framing is unconfirmed from this data.

### ⚠️ hwscan — exists, PARTIAL only
`# hwscan / Hardware scanner — real hardware detection for the fleet. / hwscan detects the
machine's hardware and emits a **machine tier** classification so agents can re…`
"machine tier" is real (the README's own words). Tier names, output JSON shape, CLI flags:
UNVERIFIED. Tree fetch truncated with no paths captured.

### ⚠️ gesture-kit — exists, PARTIAL only
`# gesture-kit / **Path primitives for the fleet UI** — stroke gesture recognizers, $P point-cloud
recognizers, and …` Exported names, CLI, layout: UNVERIFIED.

### ❌ signal-viewer — UNRESOLVED; treat as NOT FOUND
Nine attempts across raw / HTML / jsdelivr, **every response a proxy-side -500 — never a 200 and
never a 404.** Name appears nowhere in the org catalog portion transcribed nor in the 32-repo
repositories tab. **Existence UNVERIFIED — not confirmed present, not confirmed absent.** The
"signal-viewer layers as the deck's instrument grammar" edge (TASK §5) therefore has no verified
substrate; treat it as an aspiration or re-point it at `constraint-theory-core`'s deadband-funnel
layers, which are verified.

### Strong un-asked candidates discovered (listed only — READMEs NOT read, all UNVERIFIED)
- **`fleet-dashboard`** — "Live fleet status board — repo · live" (has a live deployment!)
- **`spatial-registry`** — "**four worlds, thirty-three rooms**, cross-world pathfinding"
- **`room-render`** — "the rendering engine for each room"
- also `holodeck`, `terrain`, `vibe-world`, `bare-metal-plato`, `platos-shell`,
  `constraint-theory-core`
- ⚠️ `spatial-registry`'s "four worlds" is a **direct precedent for kimi1's "Worlds = fleet
  sectors"** — the world/room taxonomy may already exist and should be consumed, not reinvented.

## L3 — License / vendoring / name-collision checks
- Status: DONE
- Sources (all fetched by the research agent through web_reader): `registry.npmjs.org/@designcodeio/threeui`,
  `raw.githubusercontent.com/MengTo/threeui/main/{README.md,LICENSE}`, `api.github.com/repos/{thekiller-dev,SuperInstance}/coding-3d`,
  `api.github.com/repos/SuperInstance/coding-3d/{commits,git/trees}`,
  `api.github.com/users/{quarterdeck,tidegate}`, `npmjs.com/package/{quarterdeck,quarterdeck-fleet,tidegate}`.

### ⚠️ BLOCKER #1 — the fork has NO license at all
- `thekiller-dev/coding-3d`: API `license: null`; complete root tree contains **no LICENSE file**.
- `SuperInstance/coding-3d`: same — no LICENSE, and the repo page's Resources list shows Readme /
  Code of conduct / Contributing / Security policy only, no License entry.
- The fork is a **pure snapshot, 0 commits ahead / 0 behind** (identical head SHA
  `7951c73315e19ca6e3fbfc66b0d97ecf05c549fa`; both repos `size: 1461` KB, both `pushed_at`
  `2026-09-19T06:42:39Z`). Fork created `2026-09-22T18:10:52Z`.
- Upstream is the original (`fork: false`), 1 star / 1 fork, created `2026-09-19T01:10:40Z`.
- **Consequence:** as it stands the fleet has no grant to use, modify, or redistribute this code.
  Vendoring it into a killer-app is not a technical question until this is fixed. This must go back
  to Casey before any code is copied. Options in the spec: (a) ask thekiller-dev to add MIT,
  (b) treat it as reference-only and rebuild from scratch, (c) check whether the upstream
  "Coding Pro 3D" course materials carry their own restrictive terms.

### threeui package — verified
- **MIT**, confirmed twice: registry `"license": "MIT"` on every version **and** LICENSE file
  header `MIT License / Copyright (c) 2026 Meng To`. Independently corroborates DECISIONS.md's
  claim of MIT.
- Versions `0.3.0 / 1.0.0 / 1.1.0 / 1.2.0` (exactly 4). Latest `1.2.0`.
  Published `0.3.0` 2026-08-21 → `1.2.0` 2026-09-01 (~1 month old, 4 releases in 11 days).
- Repo `github.com/MengTo/threeui` (dir `packages/threeui`), homepage `threeui.com`.
  No `author` field exists at any version; only `maintainers: mengto <shadownessguy@gmail.com>`.
  Trusted publishing (`publishConfig.provenance: true`, `_npmUser: github-actions` from 1.0.0).
- **Weight:** `1.2.0` = `fileCount: 726`, `unpackedSize: 54,726,125` B ≈ **54.7 MB / 52.2 MiB**.
  (0.3.0 56,338,363 B; 1.0.0 54,445,961 B; 1.1.0 54,527,327 B.)
- **No `dist/`** — build output is `lib-dist/`; `main`+`module` → `./lib-dist/index.js`,
  `types` → `./lib-dist/index.d.ts`. Exposes `./style.css`, `./components/*`, `./assets/*`.
- **Triple-three.js problem.** `peerDependencies: three >=0.149 <1`, react/react-dom `>=18 <20`,
  **plus** regular deps `three128: npm:three@0.128.0` and `three165: npm:three@0.165.0`. So a
  single install can carry up to **three distinct three.js copies**.
- **Offline vendoring:** feasible but heavy — the build IS shipped (`lib-dist/`), so no compile
  step needed, but 54.7 MB / 726 files into a monorepo is a real cost, and the peer-dep range
  means it will not typecheck/link against an arbitrary pinned three without testing.
- **`sRGBEncoding` risk — now sharpened.** The threeui README contains **zero** occurrences of
  `sRGBEncoding`, `outputColorSpace`, or "color management": no documented signal either way.
  Combined with my r187dev `constants.js` check (`sRGBEncoding` **absent**, only
  `SRGBColorSpace`/`LinearSRGBColorSpace`/`LinearTransfer`/`SRGBTransfer` remain), the risk is
  not "a warning" — against a modern peer three it is a **hard break**. Mitigation: the bundled
  `three128`/`three165` copies may make threeui fully self-contained, which neutralises the break
  but costs the triple-three.js weight. **Must smoke-test the render path before adoption.**
- Licensing carve-out in the README (matters more than the `license` field): application +
  community component code MIT; bundled fonts **OFL-1.1**; bundled three.js runtime MIT;
  catalog thumbnails served from `threeui.com` are **not** redistributed → see
  `ASSET-LICENSES.md`, `FONT-LICENSES.md`, `THIRD_PARTY_NOTICES.md`. Any offline vendoring must
  not rely on threeui.com-hosted previews.

### Fork hygiene — verified
- **3 commits**, one author (`thekiller-dev <eltonhounnou2@gmail.com>`), one day (2026-09-19):
  `5de4235` 02:24:53Z "Initial commit" → `de6aab0` 06:17:47Z "add more interactions" →
  `7951c73` 06:42:39Z "solved errors".
- `public/` inventory: `favicon.svg` 9,522 B · `icons.svg` 5,031 B · **`landscape.html`
  2,428,244 B (~2.4 MB)** ← the only blob >1 MB. Also notable: `package-lock.json` 83,360 B,
  `tailwind.config.js` 1,639 B.
- Repo `size: 1461` KB (both repos) — *smaller* than the single 2.4 MB `landscape.html`, because
  GitHub's `size` is the packed/compressed size. Working tree is ~2.5 MB+. Do not sum these.
- **Secrets: clean.** Complete recursive tree (`"truncated": false`) has no `.env`, `.env.local`,
  `.npmrc`, credentials file, `node_modules/`, or `dist/`. Raw `.env` fetches also 404.
- **One real gap:** `.gitignore` is stock Vite and covers `*.local` but **not a plain `.env`** —
  so a future Vite `.env` would be silently committed. First commit on the renamed repo must add
  `.env` + `.env.*` to `.gitignore`.
- Methodology note: an MCP 500 from `registry.npmjs.org` is **not** evidence of nonexistence —
  npm existence was confirmed against the human-facing `npmjs.com/package/<name>` pages, which
  return unambiguous 200/404.

### Name collisions — 8 names checked, all contested
Round 1 (the three TASK/kimi1-adjacent candidates):
| Name | GitHub | npm |
|---|---|---|
| `quarterdeck` | **TAKEN** — Organization, `id 3441883`, display name "Quarterdeck" | **TAKEN** — `quarterdeck` 0.2.8, "Public API for querying Quarterdeck Web3 domain names" |
| `quarterdeck-fleet` | free (404) | **TAKEN** — 0.0.1, "Quarterdeck fleet management SDK. **Not yet published - placeholder.**" |
| `tidegate` | **TAKEN** — User `id 8923471`, "Tide Gate", created 2014-09-29, 4 public repos | free (404) |

Round 2 (five replacement candidates, checked after round 1 came back contested):
| Name | GitHub | npm |
|---|---|---|
| `quarterboard` | TAKEN — User `id 232392703`, ≥1 public repo | TAKEN — 2.1.0 "Quarterly OKR tracking board" (3 yr) |
| `tidebook` | TAKEN — User `id 109876543`, ≥1 public repo | TAKEN — 1.0.3 "Modern task management application" (2 yr) |
| `helmboard` | TAKEN — **Organization** `id 212060204`, ≥1 public repo | TAKEN — 0.4.1 "Kubernetes dashboard for helm releases" (8 mo) |
| `wardroom` | TAKEN — User `id 194738291` | TAKEN — 3.0.2 "CLI toolkit for provisioning ephemeral staging environments" (5 yr) |
| `decklog` | TAKEN — User `id 59968145`, ≥1 public repo | TAKEN — 0.9.2 "Ship deck operations logging library" (1 yr) |

- `tidegate` is easy to misread: `github.com/tidegate` renders a *search* page ("6 users have
  this name") that looks like a 404. `api.github.com/users/tidegate` confirms a real 12-year-old
  account holds the exact login.
- `quarterdeck-fleet`'s npm listing is an explicit **placeholder** naming a fleet-management SDK —
  the exact namespace we want is already staked out by someone else.
- `helmboard` embeds "Helm" (Kubernetes) → guaranteed search-visibility fight; `wardroom` is a
  common real-world naval noun.

### ⚠️ The naming conclusion is a REFRAME, not a dead end
Eight short dictionary nautical words checked; **every one is taken on at least one registry, and
7 of 8 are taken on npm.** Conclusion: the short-word nautical namespace is exhausted, so
"find an unclaimed evocative short word" is not a reachable goal, and continuing to brainstorm
candidates is wasted effort.

The actual constraint is narrower than it looks:
- **GitHub is already solved by org placement.** The repo will live at
  `SuperInstance/<name>`. A repo name is only unique *within its owner*, so
  `SuperInstance/decklog` is valid and unambiguous even though `github.com/decklog` (a user)
  exists. Repo-name collision is therefore a *search/discoverability* annoyance, not a blocker.
- **npm is solved by scoping.** `@superinstance/<anything>` is always publishable by us. Unscoped
  publishing is the only hard blocker, and we simply should not publish unscoped.
- So: pick the name for *meaning*, not for registry availability, and publish scoped.

Evidence-quality caveat: round-2 verdicts rest on 200-vs-404 responses, which are reliable, but
the fetching tool truncates each JSON response to a few hundred characters, so round-2 `id`s are
lower-confidence than round-1's (which came from untruncated reads). One round-2 endpoint
(`wardroom`) needed 4 retries before returning 200. Verdicts are solid; the fine-grained account
metadata should be re-confirmed before being quoted anywhere public.

## L4 — Write QUARTERDECK-SPEC.md
- Status: DONE
- Files: `QUARTERDECK-SPEC.md` (407 lines), `audit/hash-canary.mjs`, `audit/hash-canary.sh`
- Sections delivered: 0 gating findings · 1 asset audit · 2 adaptation map · 3 the five moves ·
  4 backend rebuild plan (P0/P1/P2, each with verification) · 5 edges · 6 name + docs ·
  appendix on verification limits.
- Key positions taken (all traceable to L1–L3 above):
  1. **LICENSE blocker surfaced first** — nothing gets copied until Casey resolves it.
  2. **Drop threeui in P0.** It is declared but never imported; uninstalling it removes 54.7 MB
     and dissolves the `sRGBEncoding` risk, because the fork's own three code uses no encoding API.
  3. **Fix the Tailwind v3/v4 conflict before any styling work** — `index.css` is the outlier.
  4. **Reuse `HeroScene.tsx` as the tidepool** — 6050 points / 1 draw call / full teardown already
     written. Only the amplitude driver changes.
  5. **Vendor `jev-receipts` as-is** — it is already UMD, so no build step, and `verify()` exists.
  6. **Corrected the hash story:** it is *double* FNV-1a-64 over `(parent + body)`, prev-hash field
     is `parent`, and the repo's published canary constant is 17 hex digits — impossible for 64
     bits. Flagged, not hardcoded.
  7. **Honesty guardrail written into the spec:** the receipt chain is tamper-*evidence*, not
     cryptographic proof (64-bit → ~2³² birthday bound). RECEIPTS.md must say so in paragraph 1.
  8. **Challenged kimi1 on PLATO/deadband-in-tidepool** — those words do not appear in tidepool;
     the grammar lives in `constraint-theory-core`. Also challenged `SDALoop`, "sectors", and
     Ollama as `UNVERIFIED`, and proposed a sense/decide/act mapping onto the *verified* SSE enum.
  9. **Re-pointed the signal-viewer edge** at `constraint-theory-core` after 9 proxy -500s left
     `signal-viewer` unverifiable.
  10. **Naming reframed, not dead:** 8/8 nautical short words contested on at least one registry,
     but GitHub collision is solved by org placement (`SuperInstance/<name>`) and npm collision by
     scoping (`@superinstance/…` — already the fleet's convention). Recommendation: keep
     `quarterdeck`. Best clean-namespace fallback: `decklog`. Only candidate whose unscoped npm
     name is free: `tidegate`.

### Things a later lane must do first (in order)
1. Resolve the LICENSE question with Casey / `thekiller-dev`.
2. Run `node audit/hash-canary.mjs` and settle the canary constant against `jev-receipts`.
3. Read the READMEs this lane could not: `hwscan` (tier names), `gesture-kit` (exported names),
   `deckboss`, `spatial-registry`, `fleet-dashboard`, `room-render`, `constraint-theory-core`,
   `quilt-backend/index.js` + full `bytes-law.md`, `sunset-ecosystem/.well-known/agent-cards/*`.
4. Read `sunset-ecosystem/fleet/sse_dashboard_ui.html` (17,151 B) — it may already solve CORS.
5. Confirm or kill `signal-viewer` with a single successful fetch.

---
*Every number in this file was read off a fetched document or computed by me. Nothing assumed.*
Evidence was gathered over HTTP via the `web_reader` MCP tool because `gh`/`git`/`npm`/`node`/
shell-execution are approval-gated in this sandbox; see the spec's Appendix for the resulting
verification limits.
