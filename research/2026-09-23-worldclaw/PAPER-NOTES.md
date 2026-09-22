# PAPER-NOTES — arXiv 2608.05248 (WorldClaw), verified 2026-09-23

Source actually read: https://arxiv.org/html/2608.05248v1 (v1, only version) — COMPLETE render,
not truncated. Abstract, §1–8, 13 numbered equations, 111 refs. Figure IMAGES were placeholders
(captions rendered, pixels did not) → anything living only inside Figures 1/2/3 is UNSEEN.
PDF not fetched (41,852 KB per abs page).

## Identity
- "WorldClaw: Agentic 3D Open-World Generation at Scale"
- Authors: Chunchao Guo, Jinpeng Li, Yang Li, Zilong Huang — "listed in alphabetical order
  by given name" (abs page comment field).
- Submitted Wed 5 Aug 2026. HTML footer dated 25 Aug 2026. cs.AI + cs.CV.
- **NO affiliation line anywhere in the rendered text.** "Tencent Hunyuan3D team" is NOT
  verifiable from the paper body; the paper *cites* Hunyuan3D 2.1/2.5 + HunyuanWorld 1.0 as
  tools it CONSUMES. (Org attribution rests on the GitHub repo org — see CODE-NOTES.)
- Body self-describes as "this report".

## Pipeline (§2, Eq. 1–2)
P = F_plan(q); T = F_terrain(P); O = F_region(P,T); S = Compose(T,O)

| Stage | § | in → out |
|---|---|---|
| Intent analysis agent | 2.1 | q → explicit constraints only; "neither introduces new scene content nor completes unspecified attributes" |
| Scene planning agent | 2.1 | → P, fills missing fields per a "predefined scene-specification schema" |
| Terrain planning agent | 2.2.1 | P → P_terrain (+optional concept image I_concept); tool-augmented (search tool) |
| Terrain asset gen agent | 2.2.2 | P_terrain → A_terrain |
| Terrain gen + refinement agents | 2.2.3 | → H(x), scattering, render-refined terrain |
| Regional planning agent | 2.3.1 | P,T → P_regional, selects R+ ⊆ R |
| Regional agent (3 skills) | 2.3.2 | region composition → object generation → object placement |
| Scene refinement agent | 2.3.3 | task queue: object refinement THEN terrain refinement |

## Schemas (math tuples ONLY — no JSON, no pseudo-code, no prompt text anywhere in paper)
- Eq.3  P = (R, C_terrain, C_object); global theme/style/material prefs/atmosphere retained
        as *shared attributes of the corresponding fields*.
- Eq.4  P_terrain = (p_layout, p_asset, p_material, θ_terrain)
        p_layout   = region categories, relative positions, adjacency, approx coverage
        p_asset    = terrain-asset categories, regional affinities, target densities
        p_material = surface types, visual styles, texture requirements
        θ_terrain  = world scale, per-region base elevations, noise freqs+amplitudes,
                     geomorphic operators + weights, boundary-blending widths   [NUMERIC]
        Paper: "We define a standardized schema ... explicit interface" — schema never printed.
- Eq.5  A_terrain = (I_layout, I_asset, O_asset, M_terrain)  [layout map, prototype images,
        3D prototypes, surface materials]
- Eq.7  P_regional = {(r, φ_r, C_r^object, p_r^spatial, p_r^appearance) | r ∈ R+}
        φ_r = functional role
- Eq.8  O_r = {(M_i, U_i, T_place^i)}  per region  [mesh, appearance, placement transform]

## Height field — THE LOAD-BEARING EQUATION (Eq. 6)
H(x) = Σ_r  m̃_r(x) · [ h_r + Σ_k w_{r,k} N_{r,k}(x) + Σ_j α_{r,j} G_{r,j}(x) ]
  m̃_r  = normalized SOFT region weight maps (after boundary smoothing) — curved/irregular
         boundaries, explicitly chosen over indoor floor-plan reprs
  h_r  = region base elevation
  N_rk = noise components at given spatial frequencies
  G_rj = geomorphic operators: peak, dune, terrace, erosion  (taxonomy cited to
         Red Blob Games "Making maps with noise functions", ref [64])
  Same m̃_r also blends MATERIALS. => geometry + material + scattering all derive from ONE
  semantic partition. PARAMETRIC, not baked. Grid resolution / world extent / bit depth: NOT GIVEN.

## Editable-mesh reconstruction (§2.3.2) — a reconstruction NETWORK, not Blender-native
I_layout (GPT-Image-2, colors=terrain categories) → terrain render with recorded camera
κ_r=(K_t,E_t) → I_r^comp = G_image(I_r^terrain, P_r, I_concept)  [2D layout PRIOR only]
→ SAM3 (text-guided; full image + overlapping sliding window; dedup by semantic label +
  spatial overlap) → per-instance crop I_i, mask S_i, affine A_i, K̂_i = A_i·K_t (Eq.10)
→ SAM3D → (M_i, U_i, T_l2c^i, K_i^o)
→ scale calibration (Eq.11): iterate λ about mesh center until −ε⁻ ≤ B(Π(K_i^o, λM_i^c)) − b_ref ≤ ε⁺;
  B = fg-bbox-area/img-area; ASYMMETRIC tolerances suppress OVERSIZED reconstructions harder.
→ two-ray correspondence: object-center pixel ∩ camera mesh → (P_o,Z_o); same pixel
  inverse-mapped through A_i⁻¹, cast from terrain camera, nearest positive hit on M_t → (P_t,Z_t)
→ Eq.12  s_i = (Z_t/Z_o)(f_i^o / f̂_i)   [square pixels, locally uniform perspective]
→ Eq.13  T_place^i = [[s_iR_i, P_t − s_iR_iP_o],[0,1]] · T_l2c^i   (T_l2c dropped if baked)
→ joint search over anchor depth + isotropic scale along the terrain-camera ray while holding
  2D projection fixed; STOP when contact ratio of bottom object voxels vs terrain ≥ threshold,
  else keep highest-contact candidate.
"Editable" MEANS: per-object instance separation + explicit T_place^i (so a refined asset
swaps in WITHOUT re-placement) + PBR maps (2048² large objects, 1024² small).
NOT claimed: quad topology, UV conventions, per-object node-graph materials (those are TERRAIN only).

## Render-guided refinement (§2.2.3, §2.3.3)
- Terrain refinement "Powered by BlenderMCP" (ahujasid/blender-mcp); agent connects to Blender
  "through an executable interface such as the Model Context Protocol (MCP)".
- Re-renders from "predefined viewpoints" / "diagnostic viewpoints" (NO camera policy given).
- Editable variables: region terrain params, boundary blending, material texture scales,
  asset densities + transforms, and if needed environment lighting + render settings.
- Terrain side does LOCAL object–terrain CO-DEFORMATION inside the support region only
  (object repositioned/partially embedded; terrain displaced/flattened/smoothed to footprint)
  to preserve global landform. Stop = checks pass OR "predefined iteration budget" [NOT VALUED].
- Object refinement: pose / mesh quality / scale vs semantic+regional context; weak SAM3D
  outputs re-run through Hunyuan3D conditioned on (scale-calibrated coarse mesh + object image);
  refined asset INHERITS T_place^i.
- NO algorithm box exists in the paper. No iteration counts. No budget numbers.

## Substrate (§3.1) — READ DIRECTLY
- Agent model: **Claude Opus 4.8**
- Skills wrapping: **GPT-Image-2** (I_layout + I_asset), **SAM3** (text-guided),
  **SAM3D**, **Hunyuan3D** (image-to-3D prototypes; mesh/appearance re-gen during refinement)
- All terrain/object/refinement/rendering in **Blender 5.1.1** on **4× NVIDIA H20**
- Materials: generative texture synthesis (albedo/normal/roughness) OR procedural =
  "programmatically assembles Blender material nodes … tileable and parameter-adjustable";
  §6: "Blender material-node graphs and shader scripts … explicitly parameterized and
  readily editable".

## EVAL: THERE IS NONE (§3.2, §3.3 both literally titled "Qualitative")
- No tables. No metrics (no FID/KID/CLIP/geometric metric). No ablations. No user study.
  No runtime numbers, no call counts, no token counts, no cost, no world-extent numbers.
- §3 has exactly 3 subsections: 3.1 Implementation Details, 3.2 Qualitative Results,
  3.3 Qualitative Comparison. The word "ablation" never appears. The 13 numbered equations
  render as HTML tables — math, not data tables.
- **Only v1 exists** (no v2/v3). Submitted 2026-08-05 15:46:38 UTC, 41,852 KB source.

### Scenes shown (11 named, counted from figure captions — paper never states a prompt count)
Main text Figs 4–7: (1) tropical pirate stronghold/island; (2) canyon w/ tribal settlements;
(3) desert battlefield; (4) snow mountain valley "in the style of Command & Conquer: Red Alert".
§7 Additional Results Figs 9–15: medieval village; snow riverside village; desert camp
surrounded by dragons; island w/ Japanese-style towns; volcanic demon lair; gemstone mining
site; mountain valley w/ Hobbit-style villages.
Per case: global view + regional views + walk views + **instance / depth / normal renderings**
(presented as the demo of the explicit representation, not as a metric).

### Baselines (§3.3) — qualitative only
SynCity [18], Marble (World Labs) [87], MajutsuCity [30], WorldGen [80], GPT-5.6 Sol [61]
(described as an OpenAI coding agent). Fig. 8: 4 immersive walk views each, on a shared
medieval-village theme with wording adapted to each method's input format. No scores.

### Only quantified config anywhere
PBR texture 2048² (large objects) / 1024² (small); 4× NVIDIA H20; Blender 5.1.1.
Numerical values of ε_i± (Eq.11), contact-ratio threshold, and iteration budgets: referenced,
never given.

## Named defect modes (§2 — failures the refinement loops are built to catch)
- Placement/contact: floating, excessive penetration, unstable support; "slight floating
  caused by mesh discretization and single-view depth errors"; scale deviations from
  single-view reconstruction.
- Terrain: "abrupt regional transitions, inconsistent landform scales, mismatched texture
  proportions, unnatural asset distributions, or local rendering artifacts".
- Objects: "inconsistent object scales or poses, insufficient local geometry or appearance quality".
- Prior-method failure named in §1: MLLM agents overcorrect on single-object position edits
  owing to "inadequate spatial scale awareness".
- Bounded-not-eliminated agent loops: both loops exit on "a predefined iteration budget".

## Future work (inside §6 Conclusion; no separate section) — near-verbatim
**Code-native 3D modeling** (refs: LL3M, Articraft, 3DCodeBench, P3D-Bench):
"...we have already explored this direction for terrain appearance generation, where the agent
constructs terrain materials through executable procedures such as Blender material-node graphs
and shader scripts. These code-driven materials achieve encouraging visual results while
remaining explicitly parameterized and readily editable..." / "Future work may extend this
strategy to replace selected object-generation stages with executable modeling programs..." /
"executable representations can explicitly encode object composition, material logic, adjustable
parameters, and motion constraints" / **STRONGEST CLAIM IN THE PAPER:**
"we believe that increasingly complete immersive 3D worlds may eventually be constructed
primarily, or even entirely, through executable code."

**Production engine integration** (refs: SimWorlds, SimWorld Studio; names Unreal Engine):
"Our current implementation primarily relies on Blender... but large-scale game-world
construction additionally requires runtime systems for procedural generation, navigation,
physics, and interaction." / "Integrating the planning and code-generation capabilities of
WorldClaw with procedural generation, level editing, shader authoring, physical simulation,
and runtime interaction systems in such engines could improve the efficiency, scalability,
and practical applicability of large-scale 3D world generation."
Also concedes §6: generative 3D backbones "do not consistently recover explicit part
hierarchies, parametric structures, articulation definitions, or interaction logic."

## LICENSE / CODE / PROJECT PAGE (from paper text)
**NOT FOUND.** No project page URL, no code-release promise, no dataset release, no license
statement, no GitHub link (only third-party ref [1] = github.com/ahujasid/blender-mcp).
abs page Comments field carries no license.

## Limitations (§5) — the honest core
- Open-source LLMs "often struggled to generate procedural terrain and materials that were
  both executable"; open-source image models "frequently failed to produce usable semantic
  layout maps" => REQUIRES closed models (Claude Opus 4.8, GPT-Image-2, Hunyuan3D).
- LLM code-gen instability in Blender: "APIs and complex node-based workflows remain
  challenging"; node graphs get "reduced to relatively simple approximations".
- Heavy latency and cost (asserted, not quantified).

## Stated future work (Conclusion §6) — the convergence hook
1. Code-native 3D modeling: part hierarchies, parametric structure, articulation,
   interaction logic as code.
2. Production engine integration: runtime procedural generation, navigation, physics,
   interaction.

## NOT IN THE PAPER (each verified absent, not merely unread)
- Any concrete JSON schema / prompt text / algorithm box.
- Terrain grid resolution, world extent in numbers, heightmap bit depth.
- Iteration budgets (named, never valued). Camera selection policy for diagnostics.
- Asset record schema, index/retrieval, dedup (asset dedup is for SAM3 2D detections only),
  disk layout. Assets are GENERATED PER RUN, not retrieved from a curated library.
- Material record schema / parameter dictionary / shader examples.
- Output file format (.blend/.glb/.usd), scene-hierarchy convention, packaging.
- Any determinism/seed/reproducibility statement.
- Any quantitative result of ANY kind.
- Author affiliation; project page; code link (only ref [1]'s blender-mcp GitHub URL).
