// extract_brain.mjs — Node-only Z-Anatomy → node-named, Draco-compressed GLB.
//
// No Blender required. Parses NervousSystem100.fbx with three's FBXLoader,
// keeps only brain meshes under the Central nervous system group, merges the
// per-gyrus / per-side meshes into our selectable structureKeys, normalizes the
// model (center + scale), then writes one Node per structureKey to a GLB and
// Draco-compresses it via gltf-transform.
//
//   node --max-old-space-size=4096 scripts/extract_brain.mjs [--dry-run]
//
// License: derivative of Z-Anatomy (CC BY-SA 4.0) / BodyParts3D (CC BY-SA 2.1
// JP). See ATTRIBUTIONS.md. Any redistribution of brain.glb is ShareAlike.

import * as THREE from "three";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { weld, dedup, prune, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FBX = resolve(ROOT, "scripts/.cache/NervousSystem100.fbx");
const OUT = resolve(ROOT, "public/models/brain.glb");
const NERVES_OUT = resolve(ROOT, "public/models/nerves.glb");
const DRY = process.argv.includes("--dry-run");
const TARGET_SIZE = 3.0; // longest dimension, in scene units
// Cranial nerves are trimmed below this Y (just under the brainstem) so the
// model carries no hidden geometry below the brain (matches the render clip).
const NERVE_FLOOR = 1.28;

// ── DOM stubs so FBXLoader's texture path is a no-op headless ────────────────
globalThis.self = globalThis;
if (!globalThis.document) {
  const el = () => ({
    style: {},
    setAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    getContext: () => null,
  });
  globalThis.document = { createElementNS: el, createElement: el };
}

// ── Classification ───────────────────────────────────────────────────────────
// Long-range tracts, cranial nerves, meninges, spinal cord, helpers: dropped.
const DROP =
  /spinothalamic|spinocerebellar|corticospinal|reticulospinal|vestibulospinal|tectospinal|rubrospinal|_tract|tractus|lemniscus|radiation|olfactory_nerve|optic_nerve|cranial_nerve|falx|tentorium|dura|arachnoid|pia_mater|cross_section|-path|spinal_cord|filum|denticulate|cauda_|conus_|central_canal|pyramidal_decussation/i;

// Ordered rules — first match wins. Specific before general (e.g. hypothalamus
// before thalamus; commissures before hippocampus).
const RULES = [
  // ── Diencephalon (specific deep structures first) ──
  [/mam+ill/i, "mammillaryBody"],
  [/hypothalam/i, "hypothalamus"],
  [/optic_chiasm/i, "opticChiasm"],
  [/pineal|epithalam|habenul/i, "pinealGland"],
  [/thalamus|thalamic|geniculate|pulvinar/i, "thalamus"],
  // ── Limbic white matter ──
  [/fornix/i, "fornix"],
  [
    /corpus_callosum|callosal|_commissure|commissural|septum_pellucid|septal/i,
    "corpusCallosum",
  ],
  [/hippocamp/i, "hippocampus"],
  [/amygdal/i, "amygdala"],
  // ── Basal ganglia (split into its named nuclei) ──
  [/caudate|accumbens/i, "caudateNucleus"],
  [/putamen|lentiform|striatum|claustrum/i, "putamen"],
  [/pallid/i, "globusPallidus"],
  [/ventricle|choroid_plexus|aqueduct/i, "ventricles"],
  // ── Cerebellum ──
  [
    /cerebell|vermis|culmen|declive|lingula_of_cerebellum|folium|uvula|nodulus|flocculus|dentate_nucleus|fastigial|tonsil|pyramis|semilunar|biventral|gracile_lobule|quadrangular|wing_of_central|central_lobule/i,
    "cerebellum",
  ],
  // ── Brainstem (split into its three segments) ──
  [/\bpons\b|pons[lr]|pontine/i, "pons"],
  [/medulla|\bolive/i, "medullaOblongata"],
  [
    /midbrain|mesencephal|peduncle|colliculus|tectum|tegmentum|red_nucleus|substantia_nigra|subthalamic|reticular_formation|interpeduncular|substantia_innominata|raphe/i,
    "midbrain",
  ],
  [/insula|circular_sulcus_of_insula/i, "insula"],
  [/cingul|paraterminal|subcallosal|indusium/i, "cingulate"],
  [
    /temporal|fusiform|parahippocampal|heschl|occipitotemporal|temporal_pole/i,
    "temporalLobe",
  ],
  [/occipital|lingual|cuneus|calcarine/i, "occipitalLobe"],
  [/parietal|postcentral|supramarginal|angular_gyrus|precuneus|paracentral/i, "parietalLobe"],
  [
    /frontal|frontopolar|precentral|orbital|gyrus_rectus|rectus|opercul|triangular_part|olfactory_(sulcus|bulb|trigone)|anterior_perforated/i,
    "frontalLobe",
  ],
];

function classify(name) {
  if (DROP.test(name)) return null;
  for (const [re, key] of RULES) if (re.test(name)) return key;
  return null;
}

// ── Cranial nerves (separate nerves.glb layer, lazy-loaded in the app) ───────
// Matched across the whole model (they live in the peripheral group). Body
// nerves (plantar, median, …) match nothing and are ignored.
const NERVE_RULES = [
  [/olfactory_nerve/i, "olfactoryNerve"],
  [/optic_nerve/i, "opticNerve"],
  [/oculomotor/i, "oculomotorNerve"],
  [/trochlear/i, "trochlearNerve"],
  [/trigeminal/i, "trigeminalNerve"],
  [/abducens/i, "abducensNerve"],
  [/facial_nerve/i, "facialNerve"],
  [/vestibulocochlear|cochlear_nerve|vestibular_nerve/i, "vestibulocochlearNerve"],
  [/glossopharyngeal/i, "glossopharyngealNerve"],
  [/vagus_nerve/i, "vagusNerve"],
  [/accessory_nerve/i, "accessoryNerve"],
  [/hypoglossal/i, "hypoglossalNerve"],
];
const NERVE_ORDER = NERVE_RULES.map(([, k]) => k);

function classifyNerve(name) {
  for (const [re, key] of NERVE_RULES) if (re.test(name)) return key;
  return null;
}

// ── Parse FBX ────────────────────────────────────────────────────────────────
console.log("Parsing", FBX, "…");
const buf = readFileSync(FBX);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const fbxRoot = new FBXLoader().parse(ab, "");

const cns = fbxRoot.getObjectByName("Central_nervous_systemg") || fbxRoot;

// Collect contributing meshes per key.
const byKey = new Map(); // key -> THREE.Mesh[]
const unmatched = []; // {name, tris}
let keptTris = 0;

cns.updateWorldMatrix(true, true);
cns.traverse((o) => {
  if (!o.isMesh || !o.geometry) return;
  const g = o.geometry;
  const tris = g.index
    ? g.index.count / 3
    : (g.attributes.position?.count || 0) / 3;
  if (tris < 30) return; // label markers (*j) and degenerate helpers
  const key = classify(o.name);
  if (!key) {
    unmatched.push({ name: o.name, tris: Math.round(tris) });
    return;
  }
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(o);
  keptTris += tris;
});

// ── Report ───────────────────────────────────────────────────────────────────
const KEY_ORDER = [
  "frontalLobe",
  "parietalLobe",
  "temporalLobe",
  "occipitalLobe",
  "insula",
  "cingulate",
  "hippocampus",
  "amygdala",
  "fornix",
  "thalamus",
  "hypothalamus",
  "mammillaryBody",
  "pinealGland",
  "opticChiasm",
  "caudateNucleus",
  "putamen",
  "globusPallidus",
  "corpusCallosum",
  "ventricles",
  "midbrain",
  "pons",
  "medullaOblongata",
  "cerebellum",
];

console.log("\n=== GROUPING REPORT ===");
let total = 0;
for (const key of KEY_ORDER) {
  const meshes = byKey.get(key) || [];
  let t = 0;
  for (const m of meshes) {
    const g = m.geometry;
    t += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  }
  total += t;
  console.log(
    `  ${key.padEnd(15)} ${String(meshes.length).padStart(3)} meshes  ${String(
      Math.round(t),
    ).padStart(8)} tris`,
  );
}
for (const key of byKey.keys())
  if (!KEY_ORDER.includes(key)) console.log("  !! UNLISTED KEY:", key);
console.log(`  ${"TOTAL".padEnd(15)} ${String(byKey.size).padStart(3)} keys    ${String(Math.round(total)).padStart(8)} tris`);

unmatched.sort((a, b) => b.tris - a.tris);
const showAll = process.argv.includes("--all");
const list = showAll ? unmatched : unmatched.slice(0, 30);
console.log(`\n=== DROPPED / UNMATCHED CNS MESHES (${unmatched.length})${showAll ? "" : " — top 30 by tris"} ===`);
for (const m of list) console.log(`  ${String(m.tris).padStart(7)}t  ${m.name}`);

if (DRY) {
  console.log("\n[dry-run] no GLB written.");
  process.exit(0);
}

// ── Build merged geometry per key (baked to world space) ─────────────────────
function bakedPosNor(mesh) {
  let g = mesh.geometry.clone();
  g.applyMatrix4(mesh.matrixWorld);
  if (g.index) g = g.toNonIndexed();
  if (!g.attributes.normal) g.computeVertexNormals();
  return { pos: g.attributes.position.array, nor: g.attributes.normal.array };
}

const merged = new Map(); // key -> { pos: Float32Array, nor: Float32Array }
const bbox = new THREE.Box3();
const _v = new THREE.Vector3();

for (const key of KEY_ORDER) {
  const meshes = byKey.get(key);
  if (!meshes || !meshes.length) continue;
  const posChunks = [];
  const norChunks = [];
  for (const m of meshes) {
    const { pos, nor } = bakedPosNor(m);
    posChunks.push(pos);
    norChunks.push(nor);
    for (let i = 0; i < pos.length; i += 3) {
      _v.set(pos[i], pos[i + 1], pos[i + 2]);
      bbox.expandByPoint(_v);
    }
  }
  const concat = (chunks) => {
    const len = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Float32Array(len);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  };
  merged.set(key, { pos: concat(posChunks), nor: concat(norChunks) });
}

// Normalize: center at origin, uniform-scale longest axis to TARGET_SIZE.
const center = bbox.getCenter(new THREE.Vector3());
const size = bbox.getSize(new THREE.Vector3());
const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z);
console.log(
  `\nModel bbox size = [${size.x.toFixed(1)}, ${size.y.toFixed(1)}, ${size.z.toFixed(
    1,
  )}]  → scale ${scale.toFixed(5)}`,
);
for (const { pos } of merged.values()) {
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (pos[i] - center.x) * scale;
    pos[i + 1] = (pos[i + 1] - center.y) * scale;
    pos[i + 2] = (pos[i + 2] - center.z) * scale;
  }
}

function concat(chunks) {
  const len = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Float32Array(len);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

// ── Build doc → weld/dedup/prune → Draco → file ──────────────────────────────
async function writeGLB(io, mergedMap, keyOrder, outPath, sceneName) {
  const doc = new Document();
  doc.createBuffer();
  const buffer = doc.getRoot().listBuffers()[0];
  const scene = doc.createScene(sceneName);
  for (const key of keyOrder) {
    const m = mergedMap.get(key);
    if (!m) continue;
    const position = doc
      .createAccessor(key + "_POSITION")
      .setType("VEC3")
      .setArray(m.pos)
      .setBuffer(buffer);
    const normal = doc
      .createAccessor(key + "_NORMAL")
      .setType("VEC3")
      .setArray(m.nor)
      .setBuffer(buffer);
    const prim = doc
      .createPrimitive()
      .setAttribute("POSITION", position)
      .setAttribute("NORMAL", normal);
    const mesh = doc.createMesh(key).addPrimitive(prim);
    scene.addChild(doc.createNode(key).setMesh(mesh));
  }
  await doc.transform(weld(), dedup(), prune());
  doc
    .createExtension(KHRDracoMeshCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
      quantizationVolume: "mesh",
      quantizationBits: { POSITION: 14, NORMAL: 10 },
    });
  await doc.transform(draco());
  await io.write(outPath, doc);
  const mb = (readFileSync(outPath).length / 1024 / 1024).toFixed(2);
  console.log(
    `✔ Wrote ${outPath}\n  nodes: ${scene.listChildren().length}  |  size: ${mb} MB`,
  );
  console.log("  node names:", scene.listChildren().map((n) => n.getName()).join(", "));
}

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression])
  .registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });

console.log("\nWriting brain.glb…");
await writeGLB(io, merged, KEY_ORDER, OUT, "brain");

// ── Cranial nerves → nerves.glb (same center/scale, so it aligns) ────────────
const nerveByKey = new Map();
fbxRoot.traverse((o) => {
  if (!o.isMesh || !o.geometry) return;
  const g = o.geometry;
  const tris = g.index ? g.index.count / 3 : (g.attributes.position?.count || 0) / 3;
  if (tris < 30) return;
  const key = classifyNerve(o.name);
  if (!key) return;
  if (!nerveByKey.has(key)) nerveByKey.set(key, []);
  nerveByKey.get(key).push(o);
});

const nervesMerged = new Map();
for (const key of NERVE_ORDER) {
  const meshes = nerveByKey.get(key);
  if (!meshes || !meshes.length) continue;
  const posChunks = [];
  const norChunks = [];
  for (const m of meshes) {
    const { pos, nor } = bakedPosNor(m);
    posChunks.push(pos);
    norChunks.push(nor);
  }
  const pos = concat(posChunks);
  const nor = concat(norChunks);
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (pos[i] - center.x) * scale;
    pos[i + 1] = (pos[i + 1] - center.y) * scale;
    pos[i + 2] = (pos[i + 2] - center.z) * scale;
  }
  // Drop triangles entirely below the floor — the trimmed nerve carries no
  // hidden geometry far below the brain, so there's nothing to click there.
  const tp = [];
  const tn = [];
  for (let i = 0; i < pos.length; i += 9) {
    if (Math.max(pos[i + 1], pos[i + 4], pos[i + 7]) < -NERVE_FLOOR) continue;
    for (let j = 0; j < 9; j++) {
      tp.push(pos[i + j]);
      tn.push(nor[i + j]);
    }
  }
  nervesMerged.set(key, {
    pos: new Float32Array(tp),
    nor: new Float32Array(tn),
  });
}

console.log("\nWriting nerves.glb…");
await writeGLB(io, nervesMerged, NERVE_ORDER, NERVES_OUT, "nerves");
