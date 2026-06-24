// Inspect a Z-Anatomy FBX in Node: dump mesh names, triangle counts, and the
// top-level hierarchy so we can locate the brain subtree and its naming.
//
//   node --max-old-space-size=4096 scripts/inspect_fbx.mjs scripts/.cache/NervousSystem100.fbx
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// Minimal DOM stubs so FBXLoader's texture path doesn't crash headless.
globalThis.self = globalThis;
if (!globalThis.document) {
  const el = () => ({
    style: {},
    setAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    getContext() {
      return null;
    },
  });
  globalThis.document = { createElementNS: el, createElement: el };
}

const file = process.argv[2];
const buf = readFileSync(file);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new FBXLoader();
const root = loader.parse(ab, "");

const BRAIN_RE =
  /(cerebr|cortex|lobe|gyrus|cerebell|thalam|hippocamp|amygdal|brain.?stem|\bpons\b|medulla|midbrain|mesencephal|diencephal|ventricl|callos|caudate|putamen|pallid|fornix|insula|hypothalam|forebrain|hemisphere|encephal|limbic|cingul|fimbria|septum|claustrum|accumbens|striat|tegment|tectum|colliculus|pineal|pituitar|hypophys|mammillary|olfactory|fourth ventricle|choroid)/i;

let meshCount = 0;
let triTotal = 0;
const meshNames = [];
root.traverse((o) => {
  if (o.isMesh) {
    meshCount++;
    const g = o.geometry;
    const tri = g.index
      ? g.index.count / 3
      : (g.attributes.position?.count || 0) / 3;
    triTotal += tri;
    meshNames.push({ name: o.name, tris: Math.round(tri) });
  }
});

console.log("=== TOTALS ===");
console.log("meshes:", meshCount, "| triangles:", Math.round(triTotal));

console.log("\n=== TOP-LEVEL CHILDREN ===");
for (const c of root.children) {
  let kids = 0;
  c.traverse((o) => {
    if (o.isMesh) kids++;
  });
  console.log(`  ${c.type.padEnd(8)} "${c.name}"  (meshes under: ${kids})`);
}

const brain = meshNames.filter((m) => BRAIN_RE.test(m.name));
const nonBrain = meshNames.filter((m) => !BRAIN_RE.test(m.name));
console.log(
  `\n=== BRAIN-MATCH MESHES: ${brain.length} (non-matching: ${nonBrain.length}) ===`,
);
for (const m of brain.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${String(m.tris).padStart(7)}t  ${m.name}`);
}

console.log("\n=== SAMPLE NON-BRAIN NAMES (first 30) ===");
for (const m of nonBrain.slice(0, 30)) console.log(`  ${m.name}`);
