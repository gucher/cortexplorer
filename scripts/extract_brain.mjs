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
const DRY = process.argv.includes("--dry-run");
const TARGET_SIZE = 3.0; // longest dimension, in scene units

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
  /spinothalamic|spinocerebellar|corticospinal|reticulospinal|vestibulospinal|tectospinal|rubrospinal|_tract|tractus|lemniscus|radiation|olfactory_nerve|optic_(nerve|tract|chiasm)|cranial_nerve|falx|tentorium|dura|arachnoid|pia_mater|cross_section|-path|spinal_cord|filum|denticulate|cauda_|conus_|central_canal|pyramidal_decussation/i;

// Ordered rules — first match wins. Specific before general (e.g. hypothalamus
// before thalamus; commissures before hippocampus).
const RULES = [
  [/hypothalam|mam+ill/i, "hypothalamus"],
  [/thalamus|thalamic|geniculate|pulvinar|epithalam|pineal|habenul/i, "thalamus"],
  [
    /corpus_callosum|callosal|_commissure|commissural|fornix|septum_pellucid|septal/i,
    "corpusCallosum",
  ],
  [/hippocamp/i, "hippocampus"],
  [/amygdal/i, "amygdala"],
  [
    /caudate|putamen|pallid|striatum|accumbens|claustrum|lentiform|substantia_nigra|subthalamic/i,
    "basalGanglia",
  ],
  [/ventricle|choroid_plexus|aqueduct/i, "ventricles"],
  [
    /cerebell|vermis|culmen|declive|lingula_of_cerebellum|folium|uvula|nodulus|flocculus|dentate_nucleus|fastigial|tonsil|pyramis|semilunar|biventral|gracile_lobule|quadrangular|wing_of_central|central_lobule/i,
    "cerebellum",
  ],
  [
    /brain.?stem|midbrain|mesencephal|pons|pontine|medulla|peduncle|colliculus|tectum|tegmentum|red_nucleus|reticular_formation|interpeduncular|substantia_innominata|raphe|\bolive/i,
    "brainstem",
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
  "thalamus",
  "hypothalamus",
  "basalGanglia",
  "corpusCallosum",
  "ventricles",
  "cerebellum",
  "brainstem",
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

// ── Build glTF document ──────────────────────────────────────────────────────
const doc = new Document();
doc.createBuffer();
const buffer = doc.getRoot().listBuffers()[0];
const scene = doc.createScene("brain");

for (const key of KEY_ORDER) {
  const m = merged.get(key);
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
  const node = doc.createNode(key).setMesh(mesh);
  scene.addChild(node);
}

// ── Optimize + Draco compress + write ────────────────────────────────────────
console.log("\nOptimizing (weld + dedup + prune + draco)…");
await doc.transform(
  weld(),
  dedup(),
  prune(),
);

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression])
  .registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });

doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({
  method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
  quantizationVolume: "mesh",
  quantizationBits: { POSITION: 14, NORMAL: 10 },
});
await doc.transform(draco());

await io.write(OUT, doc);
const bytes = readFileSync(OUT).length;
console.log(
  `\n✔ Wrote ${OUT}\n  nodes: ${scene.listChildren().length}  |  size: ${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`,
);
console.log("  node names:", scene.listChildren().map((n) => n.getName()).join(", "));
