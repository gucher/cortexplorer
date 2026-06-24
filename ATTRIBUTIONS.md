# Attributions & License Ledger

This project is built on openly-licensed, **ShareAlike** assets. This ledger is
kept current regardless of whether the project ships publicly. Copies of the
full license texts live in [`public/licenses/`](public/licenses/).

---

## Anatomical model

### Z-Anatomy

- **Z-Anatomy — The libre 3D atlas of anatomy.**
- © Gauthier Kervyn / Z-Anatomy contributors.
- Licensed **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**.
- Project: <https://www.z-anatomy.com/>
- Source repository: <https://github.com/LluisV/Z-Anatomy> (branch `PC-Version`)
- File(s) used: `Resources/Models/FBX/NervousSystem100.fbx` — the brain /
  nervous-system model, structures named per Terminologia Anatomica.
- Z-Anatomy models are themselves derived from **BodyParts3D** (below).

### BodyParts3D

- **BodyParts3D**, © **The Database Center for Life Science (DBCLS)**, Japan.
  Original by Kousaku Okubo et al.
- Licensed **[CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/)**.
- Source: <https://lifesciencedb.jp/bp3d/> · data archive:
  <https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html>
- The underlying segmented meshes that Z-Anatomy is built from. If individual
  `FJ####.obj` parts are used directly, they are sourced from the
  `isa_BP3D_4.0_obj` bundle and named via `isa_parts_list_e.txt` (FMA → name).

### Anatomical naming

- Structure names follow **Terminologia Anatomica (TA)**.

> **ShareAlike obligation.** Both assets are ShareAlike. Any redistributed
> derivative of these meshes (including the compressed `brain.glb` in this repo)
> must itself be licensed CC BY-SA 4.0, with attribution to the sources above.

---

## Software

| Library              | Role                          | Version (see `package.json`) |
| -------------------- | ----------------------------- | ---------------------------- |
| three.js             | WebGL renderer / scene graph  | ^0.184                       |
| @react-three/fiber   | React renderer for three.js   | ^9.6                         |
| @react-three/drei    | r3f helpers (controls, loaders) | ^10.7                      |
| zustand              | State management              | ^5.0                         |
| React / React DOM    | UI                            | ^19.2                        |
| Vite                 | Build tool / dev server       | ^8.1                         |
| Draco                | Mesh geometry compression     | (via gltf tooling)           |

---

## Design / experience references

Documented for honesty; these informed the UX and content model but are **not**
code or asset sources.

- **[BrainFacts.org 3D Brain](https://www.brainfacts.org/3d-brain)** (Society
  for Neuroscience; model by BioDigital Human) — interaction/UX baseline. We do
  **not** use or clone the BioDigital asset.
- **[Allen Brain Atlas](https://atlas.brain-map.org/)** — ontology / hierarchy
  inspiration.
- **G2C 3D Brain** (DNA Learning Center) — structure-description content model.
- **[Harvard Whole Brain Atlas](https://www.med.harvard.edu/aanlib/)** —
  cross-section / pathology reference.
- **[Open Source Brain](https://www.opensourcebrain.org/)** — noted as distinct
  prior art (computational neuroscience platform), not a code/asset source.

## Content note

Structure descriptions in `src/data/structures.ts` are **original summaries**
written for this project. If any text is later adapted from a source, it will be
cited inline at that entry.
