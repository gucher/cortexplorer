import { Suspense, useEffect, useMemo, useRef } from "react";
import { useGLTF, Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { STRUCTURES, NERVE_KEYS, isNerveKey } from "../data/structures";
import { useBrainStore } from "../state/store";
import { registerObject, unregisterObject } from "./registry";
import { clipPlanes } from "./clipping";

const NERVES_URL = "/models/nerves.glb";
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];
const WHITE = new THREE.Color("#ffffff");

function NerveMesh({
  keyName,
  geometry,
}: {
  keyName: string;
  geometry: THREE.BufferGeometry;
}) {
  const info = STRUCTURES[keyName];
  const groupRef = useRef<THREE.Group>(null);

  const select = useBrainStore((s) => s.select);
  const hover = useBrainStore((s) => s.hover);
  const selected = useBrainStore((s) => s.selectedKey === keyName);
  const hovered = useBrainStore((s) => s.hoveredKey === keyName);
  const visible = useBrainStore((s) => s.visibility[keyName] !== false);
  const anySelected = useBrainStore((s) => s.selectedKey !== null);
  const showLabels = useBrainStore((s) => s.showLabels);
  const sliceEnabled = useBrainStore((s) => s.slice.enabled);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    registerObject(keyName, g);
    return () => unregisterObject(keyName, g);
  }, [keyName]);

  const centroid = useMemo(() => {
    geometry.computeBoundingBox();
    return geometry.boundingBox!.getCenter(new THREE.Vector3());
  }, [geometry]);

  if (!visible) return null;

  const dimmed = anySelected && !selected;
  const opacity = dimmed ? 0.12 : 1;
  const emissiveIntensity = selected ? 0.55 : hovered ? 0.3 : 0.18;
  const color = selected
    ? new THREE.Color(info.color).lerp(WHITE, 0.15)
    : new THREE.Color(info.color);
  const labelVisible = selected || (showLabels && !dimmed);

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        userData={{ structureKey: keyName }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          hover(keyName);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          hover(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          select(keyName);
        }}
      >
        <meshStandardMaterial
          key={dimmed ? "fade" : "solid"}
          color={color}
          emissive={info.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.45}
          metalness={0.0}
          transparent={dimmed}
          opacity={opacity}
          depthWrite={!dimmed}
          clippingPlanes={clipPlanes}
          side={sliceEnabled ? THREE.DoubleSide : THREE.FrontSide}
        />
      </mesh>

      {labelVisible && (
        <Html
          position={[centroid.x, centroid.y, centroid.z]}
          center
          occlude={showLabels && !selected}
          zIndexRange={[40, 0]}
          wrapperClass="label3d-wrap"
        >
          <button
            className={"label3d label3d--nerve" + (selected ? " is-selected" : "")}
            onClick={(e) => {
              e.stopPropagation();
              select(keyName);
            }}
          >
            <span className="label3d__dot" style={{ background: info.color }} />
            <span className="label3d__name">{info.name}</span>
          </button>
        </Html>
      )}
    </group>
  );
}

function NervesContent() {
  const gltf = useGLTF(NERVES_URL, true) as unknown as {
    nodes: Record<string, THREE.Object3D>;
  };

  const entries = useMemo(() => {
    const out: { key: string; geometry: THREE.BufferGeometry }[] = [];
    for (const key of NERVE_KEYS) {
      const node = gltf.nodes[key] as THREE.Mesh | undefined;
      if (node?.geometry) out.push({ key, geometry: node.geometry });
    }
    return out;
  }, [gltf.nodes]);

  // If a nerve was selected before this layer finished loading, frame it now.
  useEffect(() => {
    const { selectedKey, refocus } = useBrainStore.getState();
    if (isNerveKey(selectedKey)) refocus();
  }, []);

  return (
    <group rotation={MODEL_ROTATION}>
      {entries.map((e) => (
        <NerveMesh key={e.key} keyName={e.key} geometry={e.geometry} />
      ))}
    </group>
  );
}

/** Cranial-nerve overlay — only mounts (and loads nerves.glb) when toggled on. */
export function NervesLayer() {
  const showNerves = useBrainStore((s) => s.showNerves);
  if (!showNerves) return null;
  return (
    <Suspense fallback={null}>
      <NervesContent />
    </Suspense>
  );
}
