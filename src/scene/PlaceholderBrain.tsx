import { useEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { STRUCTURE_KEYS, STRUCTURES } from "../data/structures";
import { PLACEHOLDER_PARTS } from "../data/placeholderParts";
import { useBrainStore } from "../state/store";
import { registerObject, unregisterObject } from "./registry";

const EXPLODE_K = 1.5;

const _v = new THREE.Vector3();

/** Direction a part flies when exploded — outward from the brain center. */
function explodeDir(pos: [number, number, number]): THREE.Vector3 {
  _v.set(pos[0], pos[1], pos[2]);
  if (_v.lengthSq() < 1e-6) _v.set(0, 1, 0);
  return _v.clone().normalize();
}

function StructureGroup({ keyName }: { keyName: string }) {
  const info = STRUCTURES[keyName];
  const parts = PLACEHOLDER_PARTS[keyName] ?? [];
  const groupRef = useRef<THREE.Group>(null);

  const select = useBrainStore((s) => s.select);
  const hover = useBrainStore((s) => s.hover);
  const selected = useBrainStore((s) => s.selectedKey === keyName);
  const hovered = useBrainStore((s) => s.hoveredKey === keyName);
  const visible = useBrainStore((s) => s.visibility[keyName] !== false);
  const isolate = useBrainStore((s) => s.isolate);
  const anySelected = useBrainStore((s) => s.selectedKey !== null);
  const explode = useBrainStore((s) => s.explode);

  // Register/unregister this structure's objects for camera framing.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    registerObject(keyName, g);
    return () => unregisterObject(keyName, g);
  }, [keyName]);

  const dirs = useMemo(() => parts.map((p) => explodeDir(p.position)), [parts]);

  if (!visible) return null;

  const faded = isolate && anySelected && !selected;
  const emissiveIntensity = selected ? 0.6 : hovered ? 0.32 : 0.04;
  const opacity = faded ? 0.06 : 1;

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
    <group ref={groupRef}>
      {parts.map((p, i) => {
        const d = dirs[i];
        const pos: [number, number, number] = [
          p.position[0] + d.x * explode * EXPLODE_K,
          p.position[1] + d.y * explode * EXPLODE_K,
          p.position[2] + d.z * explode * EXPLODE_K,
        ];
        return (
          <mesh
            key={i}
            position={pos}
            scale={p.scale}
            rotation={p.rotation}
            userData={{ structureKey: keyName }}
            onPointerOver={onOver}
            onPointerOut={onOut}
            onClick={onClick}
          >
            {p.shape === "capsule" ? (
              <capsuleGeometry args={[0.5, 1, 8, 24]} />
            ) : (
              <sphereGeometry args={[1, 48, 32]} />
            )}
            <meshStandardMaterial
              color={info.color}
              emissive={selected ? "#ffffff" : info.color}
              emissiveIntensity={emissiveIntensity}
              roughness={0.5}
              metalness={0.0}
              // `transparent` is kept constant so the shader program never
              // recompiles; occlusion is driven by depthWrite instead. (Toggling
              // `transparent` at runtime requires needsUpdate, which r3f's
              // declarative material doesn't set — that left faded parts opaque.)
              transparent
              opacity={opacity}
              depthWrite={!faded}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Milestone-0 stand-in for the real brain. Rendered from primitive parts so the
 * whole interaction loop (hover / select / focus / isolate / explode) is proven
 * before the Z-Anatomy GLB is swapped in. Replaced by <BrainModel> at M1.
 */
export function PlaceholderBrain() {
  return (
    <group>
      {STRUCTURE_KEYS.map((k) => (
        <StructureGroup key={k} keyName={k} />
      ))}
    </group>
  );
}
