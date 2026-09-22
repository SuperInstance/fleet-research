# MOTH Recon — moth.so API surface discovery (2026-09-23 ~03:45 CST)

Casey exported MOTH_API_KEY (format `moth_` + 22 alnum, 27 chars) for fleet
use: "accessing their tools and api... creatively and technically utilize it."
Key recovered from shell history into /root/.openclaw/secrets/moth_api_key.env
(mode 600; never persisted to any repo, log, or doc).

## What MOTH is (confirmed from moth.so landing page)
"Autonomous AI vulnerability hunting for critical open source."
Self-reported benchmark composite: **moth-v2 78.2%** vs Claude Opus 4.7
65.2% / GPT-5.4 59.9% (weighted: category accuracy, flag precision,
vulnerability recall, false-alarm suppression; externally validated samples).
Published findings — all C/C++/Rust attack surface:
- curl: bit-shift UB in share_setopt — FIXED (upstream issue 21224)
- ffmpeg: missing size check in sctp — FIXED; integer underflow in rtpenc — confirmed
- monero: incomplete wipe in multisig — confirmed
- turborepo: symlink escape in cache_archive — confirmed
"+ dozens more pending."

## Recon performed (all read-only; no key in URLs; nothing mutated)
1. Web search: ambiguous namespace (stfade/moth MCP debugger, mnemon MOTH
   instrumentation, mothcloud.com, moth.ai parked). None match the key format.
2. Endpoint matrix: ~40 host/path/auth-style combinations probed with
   Bearer / X-Api-Key / X-Moth-Key headers. Resolving hosts: moth.ai +
   www.moth.ai (catch-all parked lander, 200 on every path), moth.so (real
   site, strict 404 on every non-/ path), moth.so subdomains (api/docs/app/
   platform/bench) — none resolve.
3. robots.txt + sitemap.xml: empty. llms.txt: 404.
4. Homepage hrefs: only upstream CVE/commit links (curl/ffmpeg/monero/
   turborepo) — no docs/console links at all.
5. archive.org: zero snapshots (site is new). crt.sh: no subdomains visible.
6. Method probe (GET/POST/OPTIONS on 7 plausible API paths): all 404.

## State
Landing page only; API endpoint NOT discoverable from public surface.
Hypotheses: (a) API host disclosed privately (onboarding email/Discord);
(b) invite-gated console; (c) endpoint on unrelated domain (worker/
gateway hostname not certificate-linked).

## Fleet strategic read (why this matters once the door opens)
- MOTH's validated targets are C/C++/Rust — the SuperInstance org is
  Rust-heavy at its foundations (constraint-theory-core, FLUX OS C11,
  engine ports). An autonomous hunter aimed at OUR repos, findings
  receipted as quilt cells (genesis → EFFECT(findings) → attested verdicts),
  closes the loop: security findings as first-class witness-chain citizens.
- Magnet framing applies: we don't fork MOTH; we (1) consume its API as an
  instrument, (2) build the receipt adapter, (3) offer the attestation
  pattern back upstream as an optional layer.
- Honesty discipline: their 78.2% self-reported score must be re-derived
  on OUR corpora before any fleet reliance (cheap-descent lesson: numbers
  without chains are withdrawals).

## Next
- Need from Casey: the docs URL / onboarding email / Discord where the key
  was issued (API base + endpoint shapes).
- Then: probe /me or account endpoint, map job lifecycle (submit target →
  hunt → findings), build moth-quilt adapter lane, receipt a first real
  audit of one fleet Rust repo as the proof cell.
