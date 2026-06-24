import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useBrainStore, type ViewPreset } from "../state/store";
import { getAllBounds, getBounds, type Bounds } from "./registry";

// Camera-position directions for each named view. +x = anatomical left.
// Tiny offsets on the polar views avoid up-vector gimbal flips.
const VIEW_DIRS: Record<ViewPreset, THREE.Vector3> = {
  reset: new THREE.Vector3(0.5, 0.42, 1).normalize(),
  front: new THREE.Vector3(0, 0.1, 1).normalize(),
  back: new THREE.Vector3(0, 0.1, -1).normalize(),
  top: new THREE.Vector3(0, 1, 0.0001).normalize(),
  bottom: new THREE.Vector3(0, -1, 0.0001).normalize(),
  left: new THREE.Vector3(1, 0.12, 0.0001).normalize(),
  right: new THREE.Vector3(-1, 0.12, 0.0001).normalize(),
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Anim {
  active: boolean;
  t: number;
  dur: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
}

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const focus = useBrainStore((s) => s.focus);

  const didInit = useRef(false);
  const anim = useRef<Anim>({
    active: false,
    t: 0,
    dur: 0.9,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  });

  /** Compute camera destination that frames `bounds` from direction `dir`. */
  const frame = (
    bounds: Bounds,
    dir: THREE.Vector3,
    margin: number,
    minRadius: number,
  ) => {
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const r = Math.max(bounds.radius, minRadius);
    const dist = (r / Math.sin(halfFov)) * margin;
    const toTarget = bounds.center.clone();
    const toPos = toTarget.clone().add(dir.clone().multiplyScalar(dist));
    return { toPos, toTarget };
  };

  const startMove = (
    toPos: THREE.Vector3,
    toTarget: THREE.Vector3,
    snap: boolean,
  ) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const a = anim.current;
    a.fromPos.copy(camera.position);
    a.fromTarget.copy(controls.target);
    a.toPos.copy(toPos);
    a.toTarget.copy(toTarget);
    a.t = 0;
    a.dur = snap || prefersReducedMotion() ? 0.0001 : 0.9;
    a.active = true;
    controls.enabled = false;
  };

  // React to focus requests (structure selection or view presets).
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (focus.kind === "structure" && focus.key) {
      const bounds = getBounds(focus.key);
      if (!bounds) return;
      // Keep the current viewing direction; just reposition + reframe.
      let dir = camera.position.clone().sub(controls.target);
      if (dir.lengthSq() < 1e-6) dir.copy(VIEW_DIRS.reset);
      dir.normalize();
      const { toPos, toTarget } = frame(bounds, dir, 1.8, 0.4);
      startMove(toPos, toTarget, false);
    } else {
      const bounds = getAllBounds();
      if (!bounds) return;
      const view = focus.view ?? "reset";
      const { toPos, toTarget } = frame(bounds, VIEW_DIRS[view], 2.3, 0.001);
      startMove(toPos, toTarget, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.nonce]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // One-time initial fit once the model has registered its meshes.
    if (!didInit.current) {
      const bounds = getAllBounds();
      if (bounds) {
        const { toPos, toTarget } = frame(bounds, VIEW_DIRS.reset, 2.3, 0.001);
        camera.position.copy(toPos);
        controls.target.copy(toTarget);
        controls.update();
        didInit.current = true;
      }
      return;
    }

    const a = anim.current;
    if (!a.active) return;

    a.t = Math.min(1, a.t + delta / a.dur);
    const k = easeInOutCubic(a.t);
    camera.position.lerpVectors(a.fromPos, a.toPos, k);
    controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
    controls.update();

    if (a.t >= 1) {
      a.active = false;
      controls.enabled = true;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      minDistance={0.5}
      maxDistance={14}
      enablePan
    />
  );
}
