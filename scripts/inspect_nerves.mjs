// One-off: list cranial-nerve meshes in the FBX (across all groups) so we can
// plan the Phase 2 "Cranial nerves" layer.
//   node --max-old-space-size=4096 scripts/inspect_nerves.mjs scripts/.cache/NervousSystem100.fbx
import { readFileSync } from "node:fs";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

globalThis.self = globalThis;
if (!globalThis.document) {
  const el = () => ({ style: {}, setAttribute() {}, addEventListener() {}, getContext: () => null });
  globalThis.document = { createElementNS: el, createElement: el };
}

const buf = readFileSync(process.argv[2]);
const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");

const NERVE =
  /olfactory_nerve|optic_nerve|oculomotor|trochlear|trigeminal|abducens|facial_nerve|vestibulocochlear|cochlear_nerve|vestibular_nerve|glossopharyngeal|vagus_nerve|accessory_nerve|hypoglossal|cranial_nerve|\bnerve_\(|nerve\b/i;
const NUCLEUS = /nucleus/i;

const hits = [];
root.traverse((o) => {
  if (!o.isMesh || !o.geometry) return;
  if (!NERVE.test(o.name) || NUCLEUS.test(o.name)) return;
  const g = o.geometry;
  const tris = g.index ? g.index.count / 3 : (g.attributes.position?.count || 0) / 3;
  if (tris < 30) return;
  // which top-level group?
  let p = o, grp = "?";
  while (p.parent) { if (p.parent === root) { grp = p.name; break; } p = p.parent; }
  hits.push({ name: o.name, tris: Math.round(tris), grp });
});

hits.sort((a, b) => b.tris - a.tris);
console.log(`=== CRANIAL-NERVE MESHES: ${hits.length} ===`);
let total = 0;
for (const h of hits) { total += h.tris; console.log(`  ${String(h.tris).padStart(7)}t  [${h.grp}]  ${h.name}`); }
console.log(`  TOTAL ${total} tris`);
