// Shared cross-section clip plane.
//
// We keep exactly ONE plane in the materials' `clippingPlanes` at all times (so
// the shader program never recompiles from a changing plane count) and simply
// push the plane out of the way when slicing is disabled.

import * as THREE from "three";
import type { Axis } from "../state/store";

export const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 1e6);
export const clipPlanes = [clipPlane];

// Half the model's largest extent (model is centered, longest axis ~3 units).
const HALF_EXTENT = 1.7;

const AXES: Record<Axis, [number, number, number]> = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};

/**
 * Update the shared plane. When disabled, the plane is pushed far away so it
 * clips nothing (keeping a stable 1-plane material program).
 */
export function updateClipPlane(
  enabled: boolean,
  axis: Axis,
  position: number,
  flip: boolean,
): void {
  if (!enabled) {
    clipPlane.normal.set(1, 0, 0);
    clipPlane.constant = 1e6;
    return;
  }
  const s = flip ? -1 : 1;
  const [nx, ny, nz] = AXES[axis];
  clipPlane.normal.set(nx * s, ny * s, nz * s);
  // Cut at world coordinate c = position * HALF_EXTENT along the axis.
  const c = position * HALF_EXTENT;
  clipPlane.constant = -s * c;
}
