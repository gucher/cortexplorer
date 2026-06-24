// Structure ontology + content.
//
// Each entry is keyed by a stable `structureKey`. Mesh node names (placeholder
// today, real Z-Anatomy / BodyParts3D Terminologia Anatomica names tomorrow)
// are mapped onto these keys via `src/data/nodeAliases.ts`, so the content and
// UI layers never have to know the raw mesh names.
//
// Descriptions are original summaries written for this project. See
// ATTRIBUTIONS.md before adapting text from any external source.

export interface StructureInfo {
  key: string;
  name: string;
  system: string;
  /** Base tint used for the mesh and UI swatches. */
  color: string;
  desc: string;
  functions: string[];
  /** Other structureKeys this one is functionally/anatomically linked to. */
  related: string[];
}

export const STRUCTURES: Record<string, StructureInfo> = {
  frontalLobe: {
    key: "frontalLobe",
    name: "Frontal lobe",
    system: "Cerebral cortex",
    color: "#d2705f",
    desc: "The front third of the cerebrum — voluntary movement, planning, and the executive control that holds a goal in mind.",
    functions: [
      "Voluntary motor control",
      "Planning & decision-making",
      "Speech production (Broca's area)",
      "Impulse control & personality",
    ],
    related: ["parietalLobe", "temporalLobe", "thalamus", "cerebellum"],
  },
  parietalLobe: {
    key: "parietalLobe",
    name: "Parietal lobe",
    system: "Cerebral cortex",
    color: "#d8a55c",
    desc: "Behind the frontal lobe. Integrates touch, temperature, and body position into a single spatial sense.",
    functions: [
      "Touch & temperature",
      "Spatial awareness",
      "Body-map integration",
      "Attention to objects in space",
    ],
    related: ["frontalLobe", "occipitalLobe", "temporalLobe", "thalamus"],
  },
  temporalLobe: {
    key: "temporalLobe",
    name: "Temporal lobe",
    system: "Cerebral cortex",
    color: "#5bbf86",
    desc: "By the temples. Handles hearing and language, and holds the hippocampus and amygdala on its inner face.",
    functions: [
      "Hearing",
      "Language comprehension (Wernicke's)",
      "Memory (hippocampus)",
      "Emotion (amygdala)",
    ],
    related: ["frontalLobe", "occipitalLobe", "hippocampus", "amygdala", "thalamus"],
  },
  occipitalLobe: {
    key: "occipitalLobe",
    name: "Occipital lobe",
    system: "Cerebral cortex",
    color: "#5b91d8",
    desc: "The rearmost lobe — the brain's dedicated visual processor: edges, motion, color, depth.",
    functions: [
      "Primary visual processing",
      "Edge & motion detection",
      "Color processing",
      "Depth & spatial vision",
    ],
    related: ["parietalLobe", "temporalLobe", "thalamus"],
  },
  cerebellum: {
    key: "cerebellum",
    name: "Cerebellum",
    system: "Hindbrain",
    color: "#a96fd0",
    desc: "The densely folded 'little brain' at the back. More neurons than the rest of the brain combined; makes movement smooth, timed, and accurate.",
    functions: [
      "Coordination of movement",
      "Balance & posture",
      "Motor learning",
      "Timing & precision",
    ],
    related: ["brainstem", "thalamus"],
  },
  brainstem: {
    key: "brainstem",
    name: "Brainstem",
    system: "Brainstem",
    color: "#cbb85f",
    desc: "Midbrain, pons, and medulla — the stalk linking brain to spinal cord. Runs the autonomic functions you can't live without.",
    functions: [
      "Breathing & heart rate",
      "Sleep & arousal",
      "Cranial-nerve control",
      "Relay to spinal cord",
    ],
    related: ["cerebellum", "thalamus", "hypothalamus"],
  },
  thalamus: {
    key: "thalamus",
    name: "Thalamus",
    system: "Diencephalon",
    color: "#e0894b",
    desc: "A paired mass at the center — the grand relay. Nearly every sensory signal except smell passes through on its way to the cortex.",
    functions: [
      "Sensory relay to cortex",
      "Consciousness & arousal",
      "Motor signal relay",
      "Attention filtering",
    ],
    related: ["frontalLobe", "parietalLobe", "temporalLobe", "occipitalLobe", "brainstem"],
  },
  hypothalamus: {
    key: "hypothalamus",
    name: "Hypothalamus",
    system: "Diencephalon",
    color: "#dd6fa4",
    desc: "A pea-sized control hub beneath the thalamus — the bridge between nervous system and hormones, keeping the body in balance.",
    functions: [
      "Hormone regulation (via pituitary)",
      "Temperature & hunger control",
      "Circadian rhythm",
      "Fight-or-flight coordination",
    ],
    related: ["thalamus", "amygdala", "brainstem"],
  },
  hippocampus: {
    key: "hippocampus",
    name: "Hippocampus",
    system: "Limbic system",
    color: "#48c0bf",
    desc: "A seahorse-shaped structure on the inner temporal lobe — central to forming new long-term memories.",
    functions: [
      "Memory formation",
      "Spatial navigation",
      "Consolidation of experience",
    ],
    related: ["temporalLobe", "amygdala"],
  },
  amygdala: {
    key: "amygdala",
    name: "Amygdala",
    system: "Limbic system",
    color: "#e0574b",
    desc: "An almond-shaped cluster anterior to the hippocampus — assigns emotional salience, especially fear.",
    functions: [
      "Fear & threat response",
      "Emotional salience",
      "Emotional memory tagging",
    ],
    related: ["temporalLobe", "hippocampus", "hypothalamus"],
  },
  basalGanglia: {
    key: "basalGanglia",
    name: "Basal ganglia",
    system: "Basal ganglia",
    color: "#8a7fd9",
    desc: "Deep gray-matter nuclei wrapped around the thalamus — they gate and smooth voluntary movement and help form habits.",
    functions: [
      "Action selection & gating",
      "Movement smoothing",
      "Habit & procedural learning",
      "Reward processing",
    ],
    related: ["thalamus", "frontalLobe", "cerebellum"],
  },
  corpusCallosum: {
    key: "corpusCallosum",
    name: "Corpus callosum",
    system: "Commissural fibers",
    color: "#9fb0c9",
    desc: "The thick band of ~200 million fibers arching across the midline — the main bridge that lets the two hemispheres talk.",
    functions: [
      "Interhemispheric communication",
      "Coordinating bilateral movement",
      "Integrating left/right perception",
    ],
    related: ["frontalLobe", "parietalLobe", "thalamus"],
  },
  ventricles: {
    key: "ventricles",
    name: "Ventricles",
    system: "Ventricular system",
    color: "#4ba9e0",
    desc: "A connected set of cavities deep in the brain, filled with cerebrospinal fluid that cushions, nourishes, and clears waste.",
    functions: [
      "Cerebrospinal fluid production",
      "Cushioning & buoyancy",
      "Nutrient & waste transport",
    ],
    related: ["thalamus", "corpusCallosum"],
  },
};

/** Display order for grouping in the structure tree. */
export const SYSTEM_ORDER: string[] = [
  "Cerebral cortex",
  "Limbic system",
  "Diencephalon",
  "Basal ganglia",
  "Commissural fibers",
  "Hindbrain",
  "Brainstem",
  "Ventricular system",
];

export const STRUCTURE_KEYS = Object.keys(STRUCTURES);
