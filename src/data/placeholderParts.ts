// Placeholder anatomy (Milestone 0).
//
// Each structureKey maps to one or more primitive "parts" positioned to roughly
// suggest brain anatomy. This exists ONLY to prove the interaction loop (orbit /
// hover / select / focus / isolate / explode) before the real Z-Anatomy mesh is
// swapped in at Milestone 1. It is intentionally NOT trying to look like real
// tissue — the realism comes from the asset, not from code.
//
// Coordinate convention (units ~ "brain is ~3 long"):
//   +x = anatomical left, +y = up (superior), +z = front (anterior)

export type PartShape = "sphere" | "capsule";

export interface PlaceholderPart {
  position: [number, number, number];
  scale: [number, number, number];
  shape?: PartShape;
  rotation?: [number, number, number];
}

export const PLACEHOLDER_PARTS: Record<string, PlaceholderPart[]> = {
  // ── Cerebral cortex (outer shell, bilateral) ───────────────────────────────
  frontalLobe: [
    { position: [0.52, 0.34, 0.92], scale: [0.62, 0.72, 0.78] },
    { position: [-0.52, 0.34, 0.92], scale: [0.62, 0.72, 0.78] },
  ],
  parietalLobe: [
    { position: [0.52, 0.66, -0.04], scale: [0.6, 0.6, 0.72] },
    { position: [-0.52, 0.66, -0.04], scale: [0.6, 0.6, 0.72] },
  ],
  occipitalLobe: [
    { position: [0.46, 0.26, -0.96], scale: [0.56, 0.6, 0.62] },
    { position: [-0.46, 0.26, -0.96], scale: [0.56, 0.6, 0.62] },
  ],
  temporalLobe: [
    { position: [0.86, -0.22, 0.28], scale: [0.46, 0.46, 0.82] },
    { position: [-0.86, -0.22, 0.28], scale: [0.46, 0.46, 0.82] },
  ],

  // ── Hindbrain ──────────────────────────────────────────────────────────────
  cerebellum: [
    { position: [0.38, -0.52, -0.86], scale: [0.5, 0.46, 0.5] },
    { position: [-0.38, -0.52, -0.86], scale: [0.5, 0.46, 0.5] },
  ],

  // ── Brainstem (midline stalk) ───────────────────────────────────────────────
  brainstem: [
    {
      position: [0, -0.78, -0.2],
      scale: [0.16, 0.34, 0.16],
      shape: "capsule",
      rotation: [0.35, 0, 0],
    },
  ],

  // ── Diencephalon (deep, paired) ─────────────────────────────────────────────
  thalamus: [
    { position: [0.19, 0.06, -0.02], scale: [0.2, 0.2, 0.3] },
    { position: [-0.19, 0.06, -0.02], scale: [0.2, 0.2, 0.3] },
  ],
  hypothalamus: [
    { position: [0, -0.2, 0.08], scale: [0.18, 0.12, 0.2] },
  ],

  // ── Limbic system (deep temporal, paired) ───────────────────────────────────
  hippocampus: [
    { position: [0.5, -0.22, -0.08], scale: [0.18, 0.18, 0.52], rotation: [0, 0.4, 0] },
    { position: [-0.5, -0.22, -0.08], scale: [0.18, 0.18, 0.52], rotation: [0, -0.4, 0] },
  ],
  amygdala: [
    { position: [0.5, -0.26, 0.26], scale: [0.18, 0.18, 0.18] },
    { position: [-0.5, -0.26, 0.26], scale: [0.18, 0.18, 0.18] },
  ],

  // ── Basal ganglia (deep, paired) ────────────────────────────────────────────
  basalGanglia: [
    { position: [0.36, 0.08, 0.2], scale: [0.22, 0.26, 0.34] },
    { position: [-0.36, 0.08, 0.2], scale: [0.22, 0.26, 0.34] },
  ],

  // ── Commissural fibers (midline arc) ────────────────────────────────────────
  corpusCallosum: [
    { position: [0, 0.28, 0], scale: [0.14, 0.26, 0.92] },
  ],

  // ── Ventricular system (deep, paired) ───────────────────────────────────────
  ventricles: [
    { position: [0.2, 0.16, -0.12], scale: [0.15, 0.32, 0.42] },
    { position: [-0.2, 0.16, -0.12], scale: [0.15, 0.32, 0.42] },
  ],
};
