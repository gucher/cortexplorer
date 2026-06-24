// Object registry: maps structureKey -> the live three.js objects that make up
// that structure. Both the placeholder brain (M0) and the real GLB model (M1+)
// register their meshes here, so camera framing, focus, and bounds queries work
// identically regardless of which is mounted.

import * as THREE from "three";

const registry = new Map<string, Set<THREE.Object3D>>();

export interface Bounds {
  center: THREE.Vector3;
  radius: number;
}

export function registerObject(key: string, obj: THREE.Object3D): void {
  let set = registry.get(key);
  if (!set) {
    set = new Set();
    registry.set(key, set);
  }
  set.add(obj);
}

export function unregisterObject(key: string, obj: THREE.Object3D): void {
  registry.get(key)?.delete(obj);
}

const _box = new THREE.Box3();
const _sphere = new THREE.Sphere();
const _objBox = new THREE.Box3();

function boundsFromBox(box: THREE.Box3): Bounds | null {
  if (box.isEmpty()) return null;
  box.getBoundingSphere(_sphere);
  return { center: _sphere.center.clone(), radius: _sphere.radius };
}

/** World-space bounds of every object registered under `key`. */
export function getBounds(key: string): Bounds | null {
  const set = registry.get(key);
  if (!set || set.size === 0) return null;
  _box.makeEmpty();
  for (const obj of set) {
    obj.updateWorldMatrix(true, true);
    _objBox.setFromObject(obj);
    if (!_objBox.isEmpty()) _box.union(_objBox);
  }
  return boundsFromBox(_box);
}

/** World-space bounds of the entire registered model. */
export function getAllBounds(): Bounds | null {
  _box.makeEmpty();
  for (const set of registry.values()) {
    for (const obj of set) {
      obj.updateWorldMatrix(true, true);
      _objBox.setFromObject(obj);
      if (!_objBox.isEmpty()) _box.union(_objBox);
    }
  }
  return boundsFromBox(_box);
}
