# WorldClaw → SuperInstance: adaptation brief

lane worldclaw · 2026-09-23 · for kimi1 (fleet art director), cc Casey
executor: fleet researcher, glm-5.3-flash

---

## 0. What I actually read

| source | how | result |
|---|---|---|
| arXiv 2608.05248 | `arxiv.org/html/2608.05248v1` (v1, only version) | **complete render**: abstract, §1–8, 13 equations, 111 refs. Figure *images* were placeholders — captions yes, pixels no. Anything living only inside Figs 1–8 is unseen to me. |
| arXiv abs page | `arxiv.org/abs/2608.05248` | title, authors, dates, 41,852 KB source |
| GitHub upstream + fork + Hunyuan3D family | github API + READMEs | §2 / `CODE-NOTES.md` |
| fleet sources (quilt-kernel, hwscan, jev-receipts, tidepool, cellular_numba, webgpu-profiler, quarterdeck, gesture-kit) | **NOT READ** | sandbox is scoped to `/tmp/lane-worldclaw` only; I could not open a sibling lane or fleet repo |

That last row is the load-bearing caveat for §3–§5: they are designs against the
interfaces **as stated in THESIS.md**, with field names I am proposing, not transcribing.
Where I write `bind/xf` I mean "whatever quilt-kernel actually calls the transform field";
reconciling is one afternoon of work I could not do from here. §1–§2 are grounded in
things I fetched; §3–§5 are design. Distilled facts: `PAPER-NOTES.md`, `CODE-NOTES.md`.

---

## 1. The paper, for real

**"WorldClaw: Agentic 3D Open-World Generation at Scale"** — Guo, Li, Li, Huang
("alphabetical order by given name"), arXiv 2608.05248v1, submitted 2026-08-05
(**not** 08-07 as THESIS.md has it), cs.AI + cs.CV. **No affiliation line appears
anywhere in the rendered text**; the body self-describes as "this report". The
Tencent/Hunyuan attribution rests on the GitHub org (§2), not on the paper.
`PAPER-NOTES.md` holds the full equation-by-equation extraction; this section carries
only what changes a fleet decision.

### 1.1 Pipeline, and the schema they didn't print

```
q ──F_plan──► P ──F_terrain──► T ──┐
             └──F_region(P,T)──► O ─┴─► S = Compose(T, O)        (Eq.1–2)
```

Eight named agent roles: intent analysis + scene planning (§2.1) → `P` (Eq.3); terrain
planning + asset gen + generation + refinement (§2.2) → `P_terrain` (Eq.4) → `A_terrain`
(Eq.5) → heightfield `H(x)` (Eq.6); regional planning + a regional agent running three
skills + scene refinement (§2.3) → `P_regional` (Eq.7) → `O_r = {(M_i, U_i, T_place^i)}`
(Eq.8). The intent agent is deliberately conservative — it extracts only *explicitly
stated* constraints and "neither introduces new scene content nor completes unspecified
attributes"; invention is the scene planning agent's job, filling a "predefined
scene-specification schema".

**A schema the paper asserts but never prints.** Every schema is a math tuple; no JSON,
no pseudo-code, no prompt text anywhere. That gap forces §3 to derive our import schema
from the equations rather than transcribe theirs.

### 1.2 The one equation that changes our design

The terrain is parametric, not baked (Eq.6):

```
H(x) = Σ_r  m̃_r(x) · [ h_r + Σ_k w_{r,k}·N_{r,k}(x) + Σ_j α_{r,j}·G_{r,j}(x) ]
```

`m̃_r` = normalized **soft** weight maps, chosen over floor-plan representations because
terrain has "curved boundaries and irregular shapes"; `h_r` = base elevation; `N_{r,k}` =
noise at given spatial frequencies; `G_{r,j}` = geomorphic operators — **peak, dune,
terrace, erosion** (taxonomy from Red Blob Games, ref [64]). The same partition also
blends materials (via the soft weights) and scopes asset scattering (via the layout masks):
one semantic partition → geometry + material + population.

Three consequences. **The floor plane can stay live** — ship `θ_terrain` and re-evaluate
H(x) in the kernel rather than megabytes of baked mesh, so a generated world becomes
re-derivable from a receipt chain. **Breeding has a genome** — post-genesis morphology is
exactly mutation of `{h_r, w_rk, α_rj, boundary width, footprint mask}`, the paper's own
parameter vocabulary rather than a new invention. **Soft masks are a blessing and a trap**
— because `m̃_r` is *normalized*, editing one region's footprint renormalizes every other
region's weight at the boundary, so local edits are local only if you re-bake with a halo
wider than the boundary-blending width `θ_terrain` explicitly carries (→ risk R2, §4.3).

### 1.3 How a mesh becomes "editable" — and what that word does not mean here

Per detail region: render terrain with a recorded camera `κ_r=(K_t,E_t)` → an
image-editing model composes a regional concept image (**only a 2D layout prior**) →
SAM3 (text-guided; full image + overlapping sliding window; deduped by semantic label +
spatial overlap) cuts instances → SAM3D lifts each to `(M_i, U_i, T_l2c^i, K_i^o)` →
scale calibration → two-ray correspondence against the terrain mesh → placement.

Two mechanisms worth lifting verbatim. **Scale calibration (Eq.11)** iterates a scale
factor λ about the mesh center until `−ε⁻ ≤ B(Π(K_i^o, λM_i^c)) − b_ref ≤ ε⁺` (`B` =
foreground-bbox-area / image-area), with tolerances **asymmetric on purpose, to more
strongly suppress oversized reconstructions** — oversized props break a world faster than
undersized ones. **Placement (Eq.12–13)** casts the object-center pixel through both
cameras to get `s_i = (Z_t/Z_o)(f_i^o/f̂_i)`, then runs a **joint search over anchor depth
and isotropic scale along the terrain-camera ray while holding the 2D projection fixed**,
terminating when the contact ratio between bottom object voxels and terrain crosses a
threshold, else keeping the highest-contact candidate:

```
T_place^i = [[s_i·R_i, P_t − s_i·R_i·P_o],[0,1]] · T_l2c^i        (Eq.13)
```

That decomposes cleanly into translate/rotate/scale for a BIND payload, with one caveat:
`T_l2c^i` is dropped when already baked into the vertices, so the importer must record
*which* variant it got (`bind/xf-source`, §3.2).

**"Editable" means: per-object instance separation + an explicit placement transform +
PBR maps.** A refined asset *inherits* `T_place^i`, so swapping geometry never requires
re-placement. It does **not** mean quad topology, clean UVs, or per-object node graphs —
none are claimed, and node-graph materials are terrain-only here. If we promise "editable
meshes" to the fleet we must mean the paper's sense, not a modeler's.

### 1.4 The refinement loop, and the three numbers the paper refuses to give

Both loops are render → inspect → edit, driven by an agent connected to Blender "through
an executable interface such as the Model Context Protocol" — terrain refinement is
explicitly "Powered by BlenderMCP". **There is no algorithm box anywhere in the paper.**
Terrain side edits: region terrain params, boundary blending, material texture scales,
asset densities + transforms, and if needed environment lighting + render settings. Scene
side: object refinement **then** terrain refinement, the object side re-running Hunyuan3D
conditioned on the calibrated coarse mesh + object image, with the replacement
**inheriting `T_place^i`**. Both exit on "no substantial issue is detected **or a
predefined iteration budget is reached**". Terrain fixes are **co-deformation restricted
to the local support region** — object repositioned or partially embedded, supporting
terrain locally displaced/flattened/smoothed to its footprint, explicitly to preserve
global landform.

The paper names three control constants and never values one: the Eq.11 tolerances
`ε_i±`, the **contact-ratio threshold**, the **iteration budget**. That is the cheapest
thing an adaptation can extract: **our receipts make all three distributions observable
per world** (§3.4).

### 1.5 Two corrections to the thesis

**There is no asset library.** THESIS.md says "asset library mechanics"; the paper has no
library in the retrieval sense. Terrain prototypes are *generated per run* — an agent
produces a representative image set with GPT-Image-2 and Hunyuan3D image-to-3D lifts it
to a prototype set `O_asset` that is deliberately instance-agnostic — and the only
deduplication in the whole paper is of SAM3's **2D detections**, not 3D assets. So the
fleet has to build the library: persistent, indexed, deduped across worlds, keyed on
geometry hash rather than prompt. Without it, two worlds from similar prompts re-pay full
generation cost for the same rock.

**There is no quantitative evaluation.** §3.2 and §3.3 are literally titled
"Qualitative": no table, no metric (no FID, no CLIP score, no geometric fidelity measure,
no user study), no ablation (the word never appears), no wall-clock, no GPU-hours, no
agent-call count, no cost. The only quantified configuration anywhere is texture
resolution (2048² large / 1024² small), 4× NVIDIA H20, and Blender 5.1.1. What exists is
11 named worlds (4 main-text, 7 in §7 Additional Results — counted from figure captions;
no prompt count is stated) and a figure-8 qualitative comparison against SynCity, Marble
(World Labs), MajutsuCity, WorldGen and GPT-5.6 Sol. So this is a *report*, not a
*result*: a strong systems report with a genuinely novel pipeline composition, but any
fleet claim of the form "WorldClaw achieves X quality" is unsupported by the primary
source. What it does support is a claim about **representation** — phrase it that way.

### 1.6 The gating resource is API entitlement, not VRAM

§5 names three limitation classes. **High dependency on underlying models**: open-source
LLMs "struggled to generate procedural terrain and materials that were both executable";
open-source image models "frequently failed to produce usable semantic layout maps";
hence "requires capable models such as Claude Opus 4.8, GPT-Image-2, and Hunyuan3D".
**Stability risks in code generation**: errors in "scale estimation, numerical parameters,
or node connectivity directly manifest in the resulting 3D scene", and Blender's "complex
node-based workflows" get "reduced to relatively simple approximations". **Efficiency
overhead**: cost grows with object count and refinement iterations, and the pipeline is
"unnecessarily lengthy and inefficient for simpler scenes". In-method defect modes the
loops exist to catch: floating, penetration, unstable support, abrupt regional transitions,
inconsistent landform scales, mismatched texture proportions, unnatural asset
distributions, scale drift from single-view reconstruction — plus, named as the *prior
work* failure, MLLM agents overcorrecting single-object edits from "inadequate spatial
scale awareness".

Read §5 carefully and the constraint falls out: **an H100 with no access to Claude Opus
4.8 + GPT-Image-2 + Hunyuan3D cannot run this pipeline at all, by the authors' own
admission.** That has to be a row in the hardware table (§5 of this brief), not a footnote.

### 1.7 Future work = our present

§6 states two directions and the convergence is not a metaphor, it is near-verbatim.
**Code-native 3D modeling** — already done for terrain appearance: "the agent constructs
terrain materials through executable procedures such as Blender material-node graphs and
shader scripts… explicitly parameterized and readily editable"; next, "replace selected
object-generation stages with executable modeling programs"; and the strongest sentence in
the paper: *"we believe that increasingly complete immersive 3D worlds may eventually be
constructed primarily, or even entirely, through executable code."*
**Production engine integration** — "our current implementation primarily relies on
Blender… but large-scale game-world construction additionally requires runtime systems for
**procedural generation, navigation, physics, and interaction**", naming Unreal Engine.

The paper defers exactly the two layers the fleet already has: code-native executable
artifacts (4quilt) and a runtime engine (the quilt cities, post-genesis). We are not so
much adapting their system as **building the attestation + runtime layers they explicitly
scoped out**. Thesis point 6 survives contact with the primary source — and is
strengthened by it. They also concede (§6) that generative 3D backbones "do not
consistently recover explicit part hierarchies, parametric structures, articulation
definitions, or interaction logic" — precisely the list a BIND/TICK decomposition needs.
The gap they name is the slot we fill.

---

## 2. Code release status, as of 2026-09-23

Every value below is a verbatim GitHub API/README read (full detail + the failures in
`CODE-NOTES.md`). Verdict: **THESIS.md's three claims are all verified — and the situation
is worse than "no code yet."**

**Upstream `Tencent-Hunyuan/Hunyuan3D-WorldClaw`** — standalone, `fork: false`, created
`2026-08-05T11:39:27Z` (≈4 h *before* the arXiv submission at 15:46:38Z), last push
`2026-08-13`, size ≈177 MB, 1314 stars, 86 forks, `has_pages: true` with project page
`tencent-hunyuan.github.io/Hunyuan3D-WorldClaw/`. Root tree is **exactly three entries**:
`.gitignore` (10 bytes), `README.md` (1333 bytes), `assets/`. **No `.py`, no package dir,
no LICENSE file, `"license": null`, `"language": null`.** Only `main`; releases `[]`;
tags `[]`; **exactly three commits**, the first on 2026-08-10 co-authored by
`Cursor <cursoragent@cursor.com>`.

**The README promises nothing.** Its only News line is *"2026.08.07 - We release the
technical report and project page of WorldClaw."* There is no code-release sentence, no
weights mention, no "coming soon", no date. So there is nothing to hold them to — which
is worse for planning than a slipped deadline. (This also resolves the THESIS date
discrepancy: 08-05 is the arXiv submission, 08.07 is the project-page announcement. Both
real, different events.)

**Our fork `SuperInstance/Hunyuan3D-WorldClaw`** — exists, `fork: true`, created
`2026-09-22T18:27:42Z`, i.e. **the day before this research**. Its `/contents/` returns
the same three entries with SHAs identical to upstream: an **unmodified copy**, no code,
no license, zero stars. Nothing has been adapted yet.

**Release precedent, stated honestly.** Hunyuan3D-2 shipped inference code + pretrained
weights **the same day** its repo was created (2025-01-21, per its own README News), so
there is no lag curve to extrapolate a WorldClaw date from. Two things cut against a fast
release here: Hunyuan3D-2 is a *model* repo, whereas WorldClaw is an *agent pipeline*
whose §5 says it depends on Claude Opus 4.8, GPT-Image-2, SAM3 and SAM3D — releasing it
means publishing orchestration code around other vendors' closed APIs, a different and
harder decision. And the 2026 generation of this org's repos is shipping README-only with
no license: **Hunyuan3D-Buffalo1.0 (created 2026-07-31) shows the identical signature**
(`language: null`, `license: null`, `has_pages: true`). WorldClaw has been codeless for
**49 days and counting**.

**And the part that actually gates us: there is no license.** `license: null`, no LICENSE
file in the tree. The rest of the Hunyuan3D family uses `spdx_id: NOASSERTION` (custom,
non-OSI; the file text could not be fetched, so even the commonly-assumed "Tencent Hunyuan
Community License" name is unverified here). With no license attached, the default is
all-rights-reserved — **our fork's existence does not confer a right to build on it.**
Until upstream ships a license, everything in §3–§6 is design work against a thing we are
not yet licensed to use, and the fleet should treat a license landing as a *gate*, not a
formality. (One HTML fetch rendered a garbled "AGPL-3.0" string; it is contradicted by
`license: null` plus the absence of any LICENSE file, and I am not treating it as evidence.)

---

---

## 3. Schema bridge: WorldClaw output → quilt kernel

Design rule first: **import the spec, not only the meshes.** WorldClaw's terrain is an
executable expression (§1.2) and its materials are executable node graphs. Import only
baked geometry and you get a pretty fossil; import `θ_terrain` + the region partition +
the instance transforms and you get a world the fleet can keep metabolizing. Bake for the
renderer, ship the program to the kernel.

### 3.1 Artifact → cell-family map

| WorldClaw artifact | quilt family | why |
|---|---|---|
| region `r` (`R`, the `m̃_r` partition, `φ_r`) | **BIND** (district) | a named place that exists |
| asset instance `(M_i, U_i, T_place^i)` | **BIND** (instance) | an object that exists |
| prototype (`O_asset`) | **BIND** (prototype, fleet-added) | what instances are stamped from; makes the asset library indexable |
| `p_r^spatial` relations, adjacency | **LINK** | relations between existing things |
| contact record from the placement search | **LINK** (`:rests-on`, carries the contact ratio) | support is a relation, and its *quality* is data |
| terrain `H(x)` + per-region material graph | **TICK** (floor) | re-evaluated, not static — the only cell that owns arithmetic |
| weather / atmosphere / environment lighting | **EFFECT** | mutable state the refinement agent already treats as a knob |
| sim behaviours, NPC paths, doors, water | **TICK** | post-genesis; WorldClaw emits none of these (§1.7) |

Note what is *not* on the left: part hierarchies, articulation, interaction logic.
WorldClaw does not produce them (§6 concession). The bridge must not invent BIND fields
that pretend otherwise — `bind/kind :instance` is a leaf.

### 3.2 BIND payload for one placed instance

Field names are **proposals** (§0). `M_i`/`U_i`/`T_place^i` are the paper's own symbols —
those three are load-bearing and map 1:1.

```
{ cell/id        0x…                    ;; fnv1a-64 of canonical path <world>/<region>/<inst>
  cell/family    :bind
  cell/rev       3
  cell/parents   [<district-cell> <prototype-cell>]
  cell/witness   <jev receipt id>       ;; the :instance-placed receipt (§3.4)

  bind/kind      :instance
  bind/asset     {:sha256 "…" :uri "fleet://assets/…"}   ;; M_i + U_i, the PBR set
  bind/proto     0x…                    ;; prototype cell — cross-world asset identity
  bind/region    0x…                    ;; owning district

  bind/xf        {:t [x y z]            ;; translation = P_t  (terrain ray hit)
                 :r [qx qy qz qw]       ;; R_i
                 :s 0.83}               ;; s_i — ISOTROPIC by construction (Eq.12 + depth search)
  bind/xf-source :eq13-full | :eq13-baked ;; was T_l2c^i in the file, or already in the verts?

  bind/bounds    {:aabb [[..] [..]] :sphere [c r]}      ;; fleet-added: culling + collision proxy
  bind/material  {:kind :pbr :albedo "…" :normal "…" :roughness "…" :tex 2048} ;; 2048 lg / 1024 sm
  bind/semantics {:cls "watchtower" :role :defense :tags [...]
                 :source :worldclaw :gen "worldclaw@v1"}
  bind/lod       [{:max-px 0 :mesh "…"} …]              ;; fleet-added; WorldClaw emits none (§5)
  bind/contact   {:ratio 0.62 :pass true :anchor-depth 0.14}  ;; from the placement search
}
```

Three deliberate choices. Keep `:s` scalar — the pipeline constrains it isotropic, so
generalizing the field would silently lose where the constraint came from. Carry the
contact ratio — it is the placement loop's own confidence measure and it is free. Carry
`bind/proto` — so two instances in two different worlds can be recognized as the same
rock, which is what makes the fleet asset library a library instead of a pile.

### 3.3 Region semantics → district cells; the heightfield → floor plane

A WorldClaw region becomes a district cell owning its slice of the parameter bag:

```
district cell (BIND)
  district/role            φ_r   (:harbor :military :residential :wild …)
  district/footprint       m̃_r thresholded to a mask, plus the stored soft weights (→ R2)
  district/terrain-params  {h_r, {w_rk, N_rk}, {α_rj, G_rj}, boundary-blend width}
  district/capacity        C_r^object — categories + densities; the breeder's legal search space
  district/legend          the I_layout colour → semantic class palette
```

The floor is one BIND cell (renderable mesh) plus **one TICK cell per region** holding
that region's contribution; the floor TICK evaluates Eq.6, computing each region's `h_r(x)`
and blending by `m̃_r`. Two products, because the fleet needs both:

- `floor/height-at(x,z)` — a sampler. Instances query it; the flat quilt view stays
  honest without shipping 3D.
- `floor/bake(patch)` — a mesh bake, LOD0, for the free-viewpoint view.

On import we do both: bake the mesh **and** write sampled height into each instance's
`bind/xf.t[1]`, flagging `bind/on-floor-sampler true` so a later re-bake can re-derive it.
That is what makes post-genesis terrain mutation possible without re-running WorldClaw:
mutate a district's `terrain-params`, re-bake that district's patch with a halo, re-sample
affected instances, emit receipts. The paper does the same trick during generation —
"edits restricted to the support region to preserve global landform" — we reuse its own
locality argument one stage later in the lifecycle.

### 3.4 The creation-chain receipt stream

Every planning decision becomes a jev witness. The insight worth keeping: the refinement
loop already emits *structured, checkable predicates* — it just doesn't log them. We log.

```
{ jev/id      fnv1a-64(canonical receipt bytes)
  jev/canary  fnv1a-64("café")               ;; constant — detects truncation/re-encode
  jev/agent   :intent | :scene-plan | :terrain-plan | :terrain-asset
            | :terrain-gen | :terrain-refine | :regional-plan
            | :compose | :place | :refine-object | :refine-terrain
  jev/op      :region-defined | :layout-rendered | :prototype-generated
            | :instance-segmented | :scale-calibrated | :instance-placed
            | :terrain-co-deformed | :asset-regenerated | :contact-resolved | …
  jev/in      [receipt ids consumed]
  jev/out     [cell ids emitted]
  jev/why     digest of the agent's stated rationale (prompt / critique hash)
  jev/tool    :claude-opus | :gpt-image-2 | :sam3 | :sam3d | :hunyuan3d
            | :blender-mcp | :search
  jev/check   {:epsilon [e- e+] :contact-threshold t :budget n :used k}  ;; WHEN a check ran
  jev/t       wall clock
}
```

World id = root receipt; replay = walk receipts in topological order; verify = recompute
each `jev/id` and confirm the canary is present in every record. **Segmented at stage
boundaries** (plan / terrain / region / refine) and per district, each segment sealed by a
chain-checkpoint receipt — so verifying one district's provenance costs one segment, not
the whole world. That segmentation is what keeps §4's 100k-cell case survivable.

The payoff: `jev/check` records the Eq.11 tolerance, the contact-ratio threshold and the
iteration budget **as actually used**, per world, per object. The paper names all three
and values none. After one fleet generation run we hold an empirical distribution where
the paper has a blank — a real contribution that falls out of the attestation layer we
were going to build anyway.

---

## 4. Ecology: the world after genesis

WorldClaw is the creation myth. The quilt is the metabolism. Ownership below is
**exclusive** — one subsystem per layer, no shared writes — because the failure mode we
most want to avoid is two subsystems both believing they own district shape.

```
                ┌────────────────────────────────────────────────────┐
                │  GENESIS  (once · heavy · receipted · offline)     │
                │   q ─► P ─► T ─► O ─► S                            │
                │   Opus 4.8 · GPT-Image-2 · SAM3/SAM3D · Hunyuan3D  │
                │   Blender 5.1.1 + BlenderMCP                       │
                └────────────────────────┬───────────────────────────┘
                                         │  import schema (§3)
                                         ▼
     cells: BIND(district) BIND(instance) BIND(prototype)
            LINK(relation,contact) EFFECT(state) TICK(floor θ_r)
                                         │
┌─────────────────────────── QUILT = METABOLISM ─────────────────────────────────┐
│                                                                                │
│  breeding (BFT-QD)            cellular substrate       thermal telemetry       │
│  owns DISTRICT MORPHOLOGY     owns THE SUBSTRATE       owns WEATHER            │
│  genome = district/terrain-   cellular_numba (cpu)     fleet machine temps ─┐  │
│  params + footprint +         cellular_gpu   (gpu)                          │  │
│  district/capacity            per-tick grid step                             │  │
│      │                            │                     wind/cloud/rain ◄────┘  │
│      │ mutate θ_r                 │                            │                │
│      ▼                            ▼                       showers districts     │
│  [district BIND+TICK] ◄═══ floor plane H(x) ═════════════════┘                  │
│      ▲                    (Eq.6, re-baked per patch with halo)                   │
│      │ fitness = visitation + tidepool memory-writes + structural survival       │
│      │                                                                          │
│  Hebbian mesh            owns ROAD SELECTION                                    │
│  w_e ← w_e + η·traffic_e − λ·decay ; roads = LINK cells above threshold,         │
│  the rest stay dormant proposals. No path-finding pass — the graph *is* the map. │
│      │                                                                          │
│      ▼                                                                          │
│  tidepool                owns MEMORY GEOGRAPHY                                  │
│  memory → (cell, x, z, t). What a district MEANS is where memories sit in it.    │
│  Survives fossilization (§4.3) — memory outlives metabolism.                     │
│                                                                                │
│  every transition above emits a jev receipt ─► witness chain: genesis + evolution │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Breeding owns district morphology.** BFT-QD treats each district's
`terrain-params + footprint + capacity` as a genome and searches for variety under
fitness rather than a single optimum — the right objective for a world whose value is
*interesting places*, not one perfect place. Mutations hit Eq.6's parameters, so every
offspring is still a legal WorldClaw world: the genesis pipeline's own parameter
vocabulary is the breeding vocabulary. Fitness comes from the layers below (visitation,
memory writes, structural survival), so districts drift toward what the fleet actually
visits rather than toward an aesthetic nobody asked for.

**Hebbian mesh owns road selection.** No router, no A*: LINK cells carry a weight, agents
and vessels moving between districts strengthen the edges they use, unused edges decay,
and "road" simply means "LINK above threshold". Roads therefore record behaviour rather
than prescribe it — a district nobody visits loses its roads *before* it loses its
buildings, which hands the forget policy an early, cheap signal. Beneath it the cellular
layers (numba on cpu, the gpu variant on big worlds) are the substrate kernel that makes
per-tick work affordable at all.

**Thermal telemetry owns weather.** Fleet machine temperatures, sampled by hwscan, drive
wind, cloud and precipitation fields over the floor plane. This is the layer that makes
the world *ours* rather than a generated diorama — the weather is literally the load of
the machines running the fleet — and it is the cheapest layer to make legible: a hot
render node becomes a heatwave over the district whose renders it is crunching, which is
a status readout you can see from inside the world.

**Tidepool owns memory geography.** Memories are written with coordinates —
`(cell, x, z, t)` — so retrieval is spatial as well as temporal. This is the layer that
turns a generated world into a *place*: an instance is a BIND cell until someone leaves a
memory next to it, at which point it is a landmark. It also has the strongest claim to
permanence — §4.3 freezes metabolism and never memory.

### 4.3 Load-bearing risks

**R1 — 100k cells cannot all tick.** Uniform per-tick simulation is dead on arrival: the
TICK family is where arithmetic lives, and most cells (a rock, a wall, a fossil) have
nothing to compute. WorldClaw's own answer is selective detail — regional planning picks
`R+ ⊆ R` and defers the rest. Steal it: three residency tiers — **live** (ticks at full
rate: viewport + event horizon), **warm** (ticks at 1/N-th rate), **frozen** (no ticks,
geometry only). The live set is bounded by a per-tier budget (§5), and moving between
tiers is itself a receipted op.

**R2 — the soft mask is globally normalized, so "local" edits are not.** Because `m̃_r` is
normalized across regions (Eq.6), changing one district's footprint renormalizes every
neighbour's weight along the shared boundary; a naive "mutate this district" silently
deforms its neighbours. Mitigation: re-bake per patch with a halo strictly wider than the
boundary-blending width `θ_terrain` carries, treat mask renormalization as an explicit
receipted op rather than a side effect, and — critically — **forbid the breeder from
editing footprints at all in v1**, only parameters *inside* a fixed footprint. That
costs some search space and buys correctness; I would take it. (Flagged for kimi1.)

**R3 — LINK graph explosion.** 100k instances at even a modest average degree gives
hundreds of thousands of edges; a Hebbian sweep over that is a GPU kernel, not a Python
loop, and must be batched on the cellular substrate's cadence rather than run per-move.

**R4 — receipt chain growth.** 100k cells ⇒ ~100k+ genesis receipts before a single
evolution event. Unsegmented, verification is O(world) and provenance lookups dominate.
Segment at stage boundaries + per district (§3.4), checkpoint each segment, always append
and never re-emit.

**R5 — asset-library dedup is a precondition, not an optimization.** Without cross-world
prototype identity (`bind/proto`), N worlds cost N× the generation of the same rock, and
BFT-QD's archive fills with near-duplicates it cannot recognize as such. Geometry-hash
keys, not prompt keys.

**R6 — QD archive growth is unbounded by construction.** Quality-Diversity archives only
grow. Cap per district, evict by fitness-and-novelty percentile, receipt the eviction —
otherwise the breeder becomes the largest consumer in the fleet.

### 4.4 The FORGET policy for dead districts

**Deadness predicate** — a district is dead when, over a window W, *all* of: no TICK
state change attributable to it; no agent/vessel presence; no tidepool memory writes; no
Hebbian traffic above threshold on any of its links; no breeder fitness improvement.

**Then fossilize. Never delete.** Deleting breaks the world's own creation chain, and the
creation chain is the thing this lane exists to produce.

- BIND cells → baked to a single immutable low-LOD mesh, removed from the tick scheduler.
- TICK + EFFECT cells → archived cold, with the district's receipt-segment tail.
- Provenance → a tombstone LINK plus a `:district-fossilized` receipt; the chain stays
  unbroken.
- Resurrection → re-import from the fossil + replay of that district's segment. Cheap,
  because of segmentation.
- **Never forgotten:** tidepool memories keep their coordinates — the place still means
  something even frozen. Genesis receipts are never dropped.

Budget discipline: live-cell budget L per world is set by tier (§5); the fossil tier is
unbounded in count and zero in per-tick cost. Dead districts stop costing compute and
start costing only storage — the correct exchange rate for a fleet whose product is
provenance.

And note the built-in tension, because it will not resolve itself: Hebbian decay and QD
novelty search *want* to prune; tidepool *wants* to keep everything. The forget policy is
the arbitration, and the arbitration is: **memory is immortal, metabolism is not.**
Memory costs bytes, metabolism costs ticks. Never let a subsystem that pays in bytes
impose its costs on a subsystem that pays in ticks.

---

## 5. Hardware tiering

Tier thresholds are **my proposals**, not hwscan output — I could not read hwscan (§0).
The GPU classes are the proposals; the T-API row is grounded in §5 of the paper.

| tier | hwscan signature (proposed) | runs | WorldClaw role | live cells | profiled by |
|---|---|---|---|---|---|
| **T0** | no discrete GPU / integrated, ≤2 GB | browser quilt city, flat + 2.5D | none — downloads fossil + receipts | ≤2 k, rest fossil | **webgpu-profiler** |
| **T1** | entry discrete 4–8 GB (1650/3050-class, M-series base) | WebGPU quilt city | none | ~5–8 k | **webgpu-profiler** |
| **T2** | 12–24 GB prosumer (3070–4080-class, M-Pro/Max) | quilt city full 3D **+ local WorldClaw, one region at a time** | regional/detail regeneration; global plan `P` fetched from a cached genesis | ~20 k | webgpu-profiler on the viewer half; **receipt-carried timings** on the generation half |
| **T3** | 40–80 GB datacenter (H20/A100/H100, typically 4×) | full WorldClaw | the paper's own config is 4× H20 | ~100 k+ | receipt-carried timings only |
| **T-API** | any of the above | — | **no Claude Opus 4.8 + GPT-Image-2 + Hunyuan3D + Blender 5.1.1 ⇒ no WorldClaw at all** (paper §5) | — | — |
| **T-LIC** | any of the above | — | **upstream has `license: null` and no LICENSE file (§2)** — until one lands, *no* tier may legally run WorldClaw, whatever its GPU | — | — |

Two things in that table worth saying out loud.

**webgpu-profiler instruments exactly the tiers that render through a browser.** T0/T1
fully, and the *viewer half* of T2. It cannot see inside a Blender render or a Hunyuan3D
reconstruction — that work never touches WebGPU. So the fleet's telemetry contract has to
be **receipt-carried**: the WorldClaw wrapper writes stage timings, tool identities and
iteration counts into `jev` receipts, using the *same field names* webgpu-profiler emits
on the render side. One schema, two profilers, one timeline. Let them drift and we lose
the ability to answer "was this world slow to make or slow to look at" — the only
question that matters when someone asks why a district took four hours.

**The same sim at two fidelities is a data-layout requirement, not a rendering one.** T3
generates; T0 renders fossils of what T3 generated. That only works if the BIND payload
is LOD-honest at import — hence `bind/lod` in §3.2, which WorldClaw does *not* emit (the
paper's output is high-fidelity, full stop) and which the fleet must derive. The fossil
tier is not a lesser product; it is the correct rendering of a high-fidelity world on a
low-fidelity machine, and the receipt chain proves the two are the same world.

---

## 6. What we build that the paper deferred

1. **Attestation.** The paper emits no provenance; every decision is an agent call whose
   rationale evaporates on completion. `jev` receipts over the pipeline (§3.4) is a
   contribution the paper's own architecture makes trivial — and did not take.
2. **The runtime.** §6 asks for "runtime systems for procedural generation, navigation,
   physics, and interaction". The quilt cities are that runtime, post-genesis. Their
   future-work section is our milestone list.
3. **The persistent asset library.** §1.5 — they generate per run, no index, no dedup.
   Cross-world prototype identity (`bind/proto`) is ours to build and is the precondition
   for R6's archive discipline.
4. **Post-genesis evolution.** Nothing in WorldClaw changes after `S = Compose(T,O)`;
   everything in §4 happens after that line. Their world is a photograph; ours is an
   organism that happens to have a birth certificate.
5. **The three unvalued constants.** ε tolerances, contact threshold, iteration budget —
   measured per world via `jev/check` (§3.4). Cheap, real, and nobody else has it.

All five are conditional on the §2 gate: code + a license landing upstream.

---

## 7. Honest unknowns

- **No license, no code** — upstream is README + assets with `license: null` (§2). Until a
  license lands, we are designing against a thing we are not yet licensed to use.
- **No affiliation in the paper text** — the Tencent/Hunyuan attribution rests on the
  GitHub org and its project page, not the document. Commit emails add a whu.edu.cn
  address, consistent with a Tencent–WHU collaboration; that is inference, not a statement.
- **No quantitative evaluation exists** — fleet claims of WorldClaw *quality* are
  unsupported; claims about *representation* are supported. Phrase accordingly.
- **No schema was printed.** §3 is my derivation from Eq.3–13; when real code lands the
  field names will not match mine, but the *mapping* should survive.
- **Figure content unseen** — figures were placeholders in the HTML render. If Figs 1–3
  carry schema detail absent from the body text, I missed it. Flagged, not guessed at.
- **Fleet sources unread** (§0): §3–§5 field names are proposals against the interfaces
  described in THESIS.md. Reconcile before implementation.
- **Terrain resolution, world extent, iteration budgets, ε values, contact threshold:**
  named by the paper, never valued. All `jev/check`-measurable once we run it.
- **Family license *text* unread** — the Hunyuan3D family's `NOASSERTION` licenses were
  not fetchable, so even "Tencent Hunyuan Community License" is unverified here.
- **Hunyuan3D-2mini unresolved** — API endpoints 500'd and it is absent from the org
  search; excluded from the §2 table rather than guessed at.

---

## 8. Source log

- `arxiv.org/html/2608.05248v1` — full paper, 3 independent passes (planning/schema;
  terrain/detail/refinement; eval/limitations/future-work). v1 only; no v2/v3 exist.
- `arxiv.org/abs/2608.05248` — title, author-ordering note, dates, 41,852 KB source.
- GitHub upstream + fork + Hunyuan3D family — §2 / `CODE-NOTES.md`.
- `THESIS.md` — the six-point thesis under test, and my only description of the fleet
  interfaces (quilt kernel, jev, hwscan, tidepool, breeding, Hebbian mesh, thermal
  telemetry, webgpu-profiler, quarterdeck, gesture-kit).
- Not read, therefore not claimed: fleet source code; the PDF binary; figure images; any
  project page (none exists, §2).
