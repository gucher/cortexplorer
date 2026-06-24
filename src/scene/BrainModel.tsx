import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { STRUCTURE_KEYS, STRUCTURES } from "../data/structures";
import { useBrainStore } from "../state/store";
import { registerObject, unregisterObject } from "./registry";

const MODEL_URL = "/models/brain.glb";
const EXPLODE_K = 1.4;

// The extracted GLB is already Y-up / Z-front (bbox: x=L/R, y=S/I, z=A/P), so no
// corrective rotation is needed.
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];

const _c = new THREE.Vector3();

function StructureMesh({
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
  const isolate = useBrainStore((s) => s.isolate);
  const anySelected = useBrainStore((s) => s.selectedKey !== null);
  const explode = useBrainStore((s) => s.explode);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    registerObject(keyName, g);
    return () => unregisterObject(keyName, g);
  }, [keyName]);

  // Outward explode direction = from brain center (origin) to this structure.
  const dir = useMemo(() => {
    geometry.computeBoundingBox();
    geometry.boundingBox!.getCenter(_c);
    if (_c.lengthSq() < 1e-6) return new THREE.Vector3(0, 1, 0);
    return _c.clone().normalize();
  }, [geometry]);

  if (!visible) return null;

  const faded = isolate && anySelected && !selected;
  const emissiveIntensity = selected ? 0.55 : hovered ? 0.3 : 0.05;
  const opacity = faded ? 0.06 : 1;
  const offset: [number, number, number] = [
    dir.x * explode * EXPLODE_K,
    dir.y * explode * EXPLODE_K,
    dir.z * explode * EXPLODE_K,
  ];

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(keyName);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(null);
    document.body.style.cursor = "auto";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(keyName);
  };

  return (
    <group ref={groupRef} position={offset}>
      <mesh
        geometry={geometry}
        userData={{ structureKey: keyName }}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={info.color}
          emissive={selected ? "#ffffff" : info.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.62}
          metalness={0.0}
          // transparent kept constant; occlusion via depthWrite (see PlaceholderBrain).
          transparent
          opacity={opacity}
          depthWrite={!faded}
        />
      </mesh>
    </group>
  );
}

/**
 * The real Z-Anatomy / BodyParts3D brain. Loads the Draco-compressed GLB whose
 * nodes are named by structureKey (see scripts/extract_brain.mjs) and wires each
 * one into the same selection / focus / isolate / explode machinery as the
 * placeholder.
 */
export function BrainModel() {
  const gltf = useGLTF(MODEL_URL, true) as unknown as {
    nodes: Record<string, THREE.Object3D>;
  };

  const entries = useMemo(() => {
    const out: { key: string; geometry: THREE.BufferGeometry }[] = [];
    for (const key of STRUCTURE_KEYS) {
      const node = gltf.nodes[key] as THREE.Mesh | undefined;
      if (node?.geometry) out.push({ key, geometry: node.geometry });
    }
    return out;
  }, [gltf.nodes]);

  return (
    <group rotation={MODEL_ROTATION}>
      {entries.map((e) => (
        <StructureMesh key={e.key} keyName={e.key} geometry={e.geometry} />
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_URL, true);
