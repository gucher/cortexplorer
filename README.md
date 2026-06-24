# Cortex — Interactive Brain Atlas

An interactive, web-based 3D explorer of the human brain. Orbit and flip the
brain, click any structure to select it, fly the camera in and isolate it, read
a clean info panel, slice it along any axis, hide/show parts, and explode the
brain into its pieces. A searchable structure tree lets you navigate by name.

The experience baseline is the [BrainFacts.org 3D Brain](https://www.brainfacts.org/3d-brain);
the goal is to match its interaction model and beat it on UX — cleaner, crisper,
faster, more modern.

> **Honest scope.** The realism comes from the *asset*, not from procedural code.
> We load a real, pre-segmented, openly-licensed anatomical mesh
> ([Z-Anatomy](https://www.z-anatomy.com/) / [BodyParts3D](https://lifesciencedb.jp/bp3d/)).
> Interaction/UX target: match or exceed BrainFacts. Visual-realism target:
> ~70–80% of BrainFacts — the free asset reads like a polished medical
> illustration, not BioDigital's wet, subsurface-scattering tissue. True
> photoreal tissue is out of scope for v1. See [`docs/BRIEF.md`](docs/BRIEF.md).

## Tech stack

- **Vite + React + TypeScript**
- **three.js** + **@react-three/fiber** + **@react-three/drei**
- **zustand** for app state
- GLB + Draco-compressed mesh, loaded client-side
- Single static SPA — no backend

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  data/        structures.ts (ontology + content), placeholderParts.ts
  state/       store.ts (zustand: selection, isolate, explode, slice, focus)
  scene/       BrainCanvas, CameraRig (fly-to-focus), registry, brain model
  ui/          StructureTree, InfoPanel, Toolbar, Credits/About
scripts/       asset pipeline (Z-Anatomy / BodyParts3D → node-named GLB)
public/
  models/      brain.glb (the compressed, node-named brain)
  licenses/    copies of the CC BY-SA license texts + source notices
```

## Milestones

- [x] **M0 — Interaction shell.** Full loop on a placeholder: orbit, hover,
      click-select (3D + tree), fly-to-focus, info panel, isolate, explode,
      view presets, search, visibility.
- [x] **M1 — Real brain in.** Real Z-Anatomy brain (15 named, separable
      structures) via the Node-only asset pipeline. 1.1 MB Draco GLB.
- [x] **M2 — Selection polish.** Eased fly-to-focus + signature focus-and-fade
      (rest of the brain ghosts translucent), emissive highlight, tree↔3D sync.
      _(leader-line labels still to come)_
- [x] **M3 — Content** wired to the real node names; connected-structure chips
      jump selection.
- [x] **M4 — Tools.** Cross-section slice (clip plane, X/Y/Z, position, flip),
      hide/show, explode/reassemble, search.
- [~] **M5 — Polish + deploy.** Studio lighting + tuned PBR done; production
      build verified. _(baked AO, fake-subsurface rim, mobile layout, and the
      live deploy still to come.)_

## Attribution

This project is built on ShareAlike anatomical assets. Credit and license
details are in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and surfaced in-app via the
footer **About** dialog. Any redistributed derivative of the mesh must carry the
same CC BY-SA license.
