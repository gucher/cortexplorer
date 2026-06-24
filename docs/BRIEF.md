# Brain Project — Kickoff Brief (north-star doc)

> This is the original project brief, kept in-repo as the north star. The
> "Honest scope" and "Milestone 1" sections define what "done" means for v1.

## 1. What we're building

An interactive, web-based 3D human brain explorer. Orbit / flip the brain, click
any structure to select it, focus the camera on it (fly-to + isolate/fade the
rest), read a clean info panel (description, functions, connected structures),
slice it along any axis, hide/show parts, and explode/reassemble the pieces. A
structure tree + search lets you navigate by name.

Experience baseline: the **BrainFacts.org 3D Brain**. Match its interaction
model and beat it on UX — cleaner, crisper, faster, more modern. We do **not**
need to match its photoreal tissue.

The critical difference from prior prototypes: we are **NOT** procedurally
generating the brain. We load a real, pre-segmented, openly-licensed anatomical
mesh. The realism comes from the asset, not from code.

## 2. Honest scope & fidelity targets

- **Interaction / UX target:** 90–100/100 vs BrainFacts. Fully achievable; aim
  to exceed.
- **Visual realism target:** ~70–80/100 vs BrainFacts. The free asset
  (Z-Anatomy) is anatomically accurate and clean but reads like a polished
  medical illustration, not BioDigital's wet, vascularized,
  subsurface-scattering tissue. Good PBR + baked AO + a cheap fake-subsurface
  rim closes most of the gap. The final ~20% (true photoreal tissue) is
  licensed-asset / texture-artist territory and is **out of scope for v1**.
- BrainFacts is powered by **BioDigital Human**, a commercial licensed model. We
  are not cloning that asset; we are building a comparable experience on an open
  asset.

Do not over-promise photorealism in code comments or the UI.

## 3. Tech stack

Vite + React + TypeScript · three + @react-three/fiber + @react-three/drei ·
GLTF + Draco · zustand · lightweight CSS · static SPA (deploy to Vercel /
Netlify / Cloudflare Pages, no backend).

## 4. The asset: Z-Anatomy

Z-Anatomy is an open-source 3D atlas derived from **BodyParts3D** (DBCLS, Japan),
segmented into hundreds of individually-named structures, labeled per
Terminologia Anatomica, licensed **CC BY-SA 4.0**.

- Project site: <https://www.z-anatomy.com/>
- GitHub: <https://github.com/LluisV/Z-Anatomy>
- Distributed as `.blend` and FBX.

Asset job: obtain the model, isolate ONLY brain-relevant structures, export to
glTF/GLB with Draco compression, preserving each structure as a separately-named
node so the app can select by name.

**LICENSE — non-negotiable** even for a private project: attribute Z-Anatomy
(CC BY-SA 4.0) and BodyParts3D (CC BY-SA 2.1 Japan); note ShareAlike. See
[`ATTRIBUTIONS.md`](../ATTRIBUTIONS.md).

## 6. Build plan / milestones

- **M0 — Shell first.** Interactive canvas with a PLACEHOLDER supporting orbit,
  click-to-select, fly-to-focus, info panel, structure list. Prove the loop.
- **M1 — Real brain in** (make-or-break; see §7). Run the asset pipeline, swap
  the placeholder for the real named, separable brain.
- **M2 — Selection polish** (framing, isolate-and-fade, leader-line labels, tree
  sync).
- **M3 — Content** wired to real node names; connected-structure jumps.
- **M4 — Tools** (cross-section slice, hide/show, explode/reassemble, search).
- **M5 — Polish + deploy** (PBR, baked AO, fake-subsurface rim, mobile fallback,
  loading states, final deploy).

Work milestone by milestone. Commit at each. Don't skip ahead to materials
before selection works.

## 7. Milestone 1 — Definition of Done

- App runs locally (`npm run dev`) and the real brain renders.
- Brain is composed of separately-selectable, correctly-named structures (not
  one fused blob).
- Hover highlights; click selects and shows the name in the info panel.
- Orbit/zoom/pan smooth; Reset + Top/Bottom/Front/Side presets exist.
- Loads in reasonable time (Draco; target GLB under ~15 MB, ideally less).
- `ATTRIBUTIONS.md` exists and is filled in.

That's the bar. Materials/slicing/explode can be rough at this point — selection
of the real, named mesh is what proves the concept.

## 8. Content data seed

Mapped into `src/data/structures.ts`, keyed by stable `structureKey`. Real mesh
node names (Terminologia Anatomica) map onto these keys via a
`nodeName -> structureKey` alias map built once the model is extracted.

## 10. Design language

Clean, crisp, modern, fast — cleaner than BrainFacts. Dark, neutral studio
background; restrained UI chrome; characterful-but-quiet type; smooth, eased
camera moves. One memorable signature interaction (fly-to-focus with the rest of
the brain fading translucent). Let the brain be the hero. Respect reduced-motion,
keyboard focus, and mobile.

## 12. Honest risks

- **Asset extraction is the fiddly part** — the highest-risk step. Pulling ONLY
  the brain cleanly out of a full model (correct names, no stray meshes, sane
  origins/scale) may take a few passes.
- **GLB size** — decimate where safe, Draco-compress, merge structures never
  selected individually.
- **Node naming** — Z-Anatomy names are Latin/TA. Build the alias map early.
- **Mobile** — plan a reduced-quality path.
- Flag blockers early rather than faking around them.

---

### Environment notes (this build)

- No Blender or Homebrew available locally → the asset pipeline is **Node-only**
  (FBX2glTF / obj2gltf + gltf-transform + Draco), not Blender/Python.
- Network access to GitHub, npm, and the BodyParts3D archive is available.
