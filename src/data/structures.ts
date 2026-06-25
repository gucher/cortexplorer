// Structure ontology + content.
//
// Each entry is keyed by a stable `structureKey` that matches a named node in
// public/models/brain.glb (see scripts/extract_brain.mjs). Descriptions are
// original summaries written for this project. See ATTRIBUTIONS.md before
// adapting text from any external source.

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
  // ── Cerebral cortex ─────────────────────────────────────────────────────────
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
    related: ["frontalLobe", "occipitalLobe", "hippocampus", "amygdala"],
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
    related: ["parietalLobe", "temporalLobe", "thalamus", "opticChiasm"],
  },
  insula: {
    key: "insula",
    name: "Insula",
    system: "Cerebral cortex",
    color: "#c98f5b",
    desc: "Cortex folded deep inside the lateral sulcus, hidden under the frontal, parietal, and temporal opercula — a hub for interoception and the felt sense of the body's internal state.",
    functions: [
      "Interoception (body-state awareness)",
      "Taste processing",
      "Emotional & risk evaluation",
      "Pain & visceral sensation",
    ],
    related: ["frontalLobe", "temporalLobe", "amygdala"],
  },

  // ── Limbic system ───────────────────────────────────────────────────────────
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
    related: ["temporalLobe", "amygdala", "fornix"],
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
  cingulate: {
    key: "cingulate",
    name: "Cingulate gyrus",
    system: "Limbic system",
    color: "#c95b9f",
    desc: "An arching ridge of cortex wrapped just above the corpus callosum — a junction of the limbic system that links emotion to attention, motivation, and decision-making.",
    functions: [
      "Emotion regulation",
      "Conflict & error monitoring",
      "Attention & motivation",
      "Autonomic control",
    ],
    related: ["corpusCallosum", "hippocampus", "frontalLobe"],
  },
  fornix: {
    key: "fornix",
    name: "Fornix",
    system: "Limbic system",
    color: "#aab0d6",
    desc: "A C-shaped band of white matter arching beneath the corpus callosum — the hippocampus's main output cable, carrying memory signals to the mammillary bodies and hypothalamus.",
    functions: [
      "Hippocampal output pathway",
      "Memory circuit (Papez)",
      "Links hippocampus → hypothalamus",
    ],
    related: ["hippocampus", "mammillaryBody", "corpusCallosum"],
  },

  // ── Diencephalon ────────────────────────────────────────────────────────────
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
    related: ["frontalLobe", "parietalLobe", "occipitalLobe", "midbrain"],
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
    related: ["thalamus", "amygdala", "mammillaryBody", "pinealGland"],
  },
  mammillaryBody: {
    key: "mammillaryBody",
    name: "Mammillary body",
    system: "Diencephalon",
    color: "#d98fb8",
    desc: "Two small round bumps on the underside of the hypothalamus — a relay station in the memory circuit, receiving the fornix from the hippocampus.",
    functions: [
      "Recollective memory relay",
      "Node of the Papez circuit",
      "Links fornix → thalamus",
    ],
    related: ["hypothalamus", "fornix", "thalamus"],
  },
  pinealGland: {
    key: "pinealGland",
    name: "Pineal gland",
    system: "Diencephalon",
    color: "#e6b259",
    desc: "A tiny midline endocrine gland behind the thalamus — secretes melatonin, tuning the body's sleep–wake clock to the day–night cycle.",
    functions: [
      "Melatonin secretion",
      "Circadian / seasonal timing",
      "Sleep regulation",
    ],
    related: ["thalamus", "hypothalamus"],
  },
  opticChiasm: {
    key: "opticChiasm",
    name: "Optic chiasm",
    system: "Diencephalon",
    color: "#d9c95f",
    desc: "The X-shaped crossing just below the hypothalamus where the two optic nerves meet — fibers from the inner half of each retina cross to the opposite side so each hemisphere sees the opposite visual field.",
    functions: [
      "Crossing of optic nerve fibers",
      "Routes vision to opposite hemisphere",
      "Gateway to the visual pathway",
    ],
    related: ["occipitalLobe", "thalamus", "hypothalamus"],
  },

  // ── Basal ganglia ───────────────────────────────────────────────────────────
  caudateNucleus: {
    key: "caudateNucleus",
    name: "Caudate nucleus",
    system: "Basal ganglia",
    color: "#8a7fd9",
    desc: "A long C-shaped nucleus that curves alongside the lateral ventricle — part of the striatum, gating voluntary movement and tying action to reward and learning.",
    functions: [
      "Action selection",
      "Goal-directed behavior",
      "Procedural learning",
      "Reward processing",
    ],
    related: ["putamen", "globusPallidus", "thalamus", "frontalLobe"],
  },
  putamen: {
    key: "putamen",
    name: "Putamen",
    system: "Basal ganglia",
    color: "#b27fd6",
    desc: "The outer shell of the lentiform nucleus — with the caudate it forms the striatum, smoothing and scaling voluntary movement and building motor habits.",
    functions: [
      "Movement regulation",
      "Motor habit learning",
      "Limb & trunk coordination",
    ],
    related: ["caudateNucleus", "globusPallidus", "thalamus"],
  },
  globusPallidus: {
    key: "globusPallidus",
    name: "Globus pallidus",
    system: "Basal ganglia",
    color: "#6f8fd9",
    desc: "The pale inner nucleus of the basal ganglia — their main output, continuously inhibiting the thalamus to keep unwanted movements in check.",
    functions: [
      "Primary basal-ganglia output",
      "Inhibitory movement gating",
      "Posture & muscle tone",
    ],
    related: ["putamen", "caudateNucleus", "thalamus"],
  },

  // ── Commissural fibers ──────────────────────────────────────────────────────
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
    related: ["frontalLobe", "parietalLobe", "fornix", "cingulate"],
  },

  // ── Ventricular system ──────────────────────────────────────────────────────
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
    related: ["thalamus", "corpusCallosum", "midbrain"],
  },

  // ── Brainstem ───────────────────────────────────────────────────────────────
  midbrain: {
    key: "midbrain",
    name: "Midbrain",
    system: "Brainstem",
    color: "#cbb85f",
    desc: "The topmost segment of the brainstem — its colliculi run vision and hearing reflexes, while the substantia nigra supplies the dopamine that smooths movement.",
    functions: [
      "Visual & auditory reflexes (colliculi)",
      "Eye movement control",
      "Dopamine production (substantia nigra)",
      "Relay between forebrain & hindbrain",
    ],
    related: ["thalamus", "pons", "cerebellum"],
  },
  pons: {
    key: "pons",
    name: "Pons",
    system: "Brainstem",
    color: "#cf9a5f",
    desc: "The bulging 'bridge' of the brainstem — a relay between the cerebrum and cerebellum that also helps drive breathing, sleep, and facial sensation.",
    functions: [
      "Cerebrum ↔ cerebellum relay",
      "Breathing rhythm",
      "Sleep & arousal",
      "Facial sensation & movement",
    ],
    related: ["midbrain", "medullaOblongata", "cerebellum"],
  },
  medullaOblongata: {
    key: "medullaOblongata",
    name: "Medulla oblongata",
    system: "Brainstem",
    color: "#b8964f",
    desc: "The lowest segment of the brainstem, merging into the spinal cord — runs the autonomic reflexes you can't live without.",
    functions: [
      "Heart rate & blood pressure",
      "Breathing control",
      "Swallowing, coughing, vomiting reflexes",
      "Relay to the spinal cord",
    ],
    related: ["pons", "cerebellum"],
  },

  // ── Hindbrain ───────────────────────────────────────────────────────────────
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
    related: ["pons", "midbrain", "thalamus"],
  },
};

/** Display order for grouping in the structure tree. */
export const SYSTEM_ORDER: string[] = [
  "Cerebral cortex",
  "Limbic system",
  "Diencephalon",
  "Basal ganglia",
  "Commissural fibers",
  "Ventricular system",
  "Brainstem",
  "Hindbrain",
];

export const STRUCTURE_KEYS = Object.keys(STRUCTURES);
