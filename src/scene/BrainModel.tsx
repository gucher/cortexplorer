import { useEffect, useMemo, useRef } from "react";
import { useGLTF, Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { STRUCTURE_KEYS, STRUCTURES } from "../data/structures";
import { useBrainStore } from "../state/store";
import { registerObject, unregisterObject } from "./registry";
import { clipPlanes } from "./clipping";
import { brainOnBeforeCompile } from "./brainShader";

const MODEL_URL = "/models/brain.glb";
const EXPLODE_K = 1.4;

// The extracted GLB is already Y-up / Z-front (bbox: x=L/R, y=S/I, z=A/P), so no
// corrective rotation is needed.
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];

// Warm grey-pink fixed-brain tissue base for the "realistic" appearance mode.
const TISSUE = new THREE.Color("#c8a191");
const WHITE = new THREE.Color("#ffffff");

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
  const sliceEnabled = useBrainStore((s) => s.slice.enabled);
  const realistic = useBrainStore((s) => s.realistic);
  const showLabels = useBrainStore((s) => s.showLabels);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    registerObject(keyName, g);
    return () => unregisterObject(keyName, g);
  }, [keyName]);

  // Local centroid (label anchor) + outward explode direction.
  const { centroid, dir } = useMemo(() => {
    geometry.computeBoundingBox();
    const c = geometry.boundingBox!.getCenter(new THREE.Vector3());
    const d =
      c.lengthSq() < 1e-6 ? new THREE.Vector3(0, 1, 0) : c.clone().normalize();
    return { centroid: c, dir: d };
  }, [geometry]);

  if (!visible) return null;

  // Signature interaction: selecting a structure flies the camera in AND ghosts
  // the rest translucent so the focus stands out. Isolate deepens the fade.
  const dimmed = anySelected && !selected;
  const opacity = dimmed ? (isolate ? 0.03 : 0.1) : 1;
  const emissiveIntensity = selected ? 0.4 : hovered ? 0.18 : 0.03;

  const baseColor = realistic
    ? TISSUE.clone().lerp(new THREE.Color(info.color), 0.12)
    : new THREE.Color(info.color);
  if (selected) baseColor.lerp(WHITE, 0.16);

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

  const showGhost = explode > 0.02 && !dimmed;
  const labelVisible = selected || (showLabels && !dimmed);

  return (
    <>
      {/* Explode "trail": a faint shell left at the home position so you can see
          where a part came from as it flies out. */}
      {showGhost && (
        <mesh geometry={geometry} renderOrder={-1} raycast={() => null}>
          <meshBasicMaterial
            color={info.color}
            transparent
            opacity={Math.min(0.14, explode * 0.14)}
            depthWrite={false}
            clippingPlanes={clipPlanes}
          />
        </mesh>
      )}

      <group ref={groupRef} position={offset}>
        <mesh
          geometry={geometry}
          userData={{ structureKey: keyName }}
          onPointerOver={onOver}
          onPointerOut={onOut}
          onClick={onClick}
        >
          <meshPhysicalMaterial
            // Remount when the transparent state flips so the program rebuilds
            // cleanly (avoids a stale opaque/transparent material).
            key={dimmed ? "fade" : "solid"}
            color={baseColor}
            emissive={info.color}
            emissiveIntensity={emissiveIntensity}
            roughness={realistic ? 0.58 : 0.62}
            metalness={0.0}
            // Just a hint of sheen — broad and soft so it doesn't pool into a
            // glossy hot-spot on the lit side; keeps the surface uniform.
            clearcoat={0.12}
            clearcoatRoughness={0.7}
            // Low env so IBL gives gentle specular but doesn't wash the albedo.
            envMapIntensity={0.12}
            // Opaque unless actually fading — transparent self-overlapping gyri
            // don't depth-sort and produce a translucent half-brain at the
            // midline view. Only the focus-fade needs real transparency.
            transparent={dimmed}
            opacity={opacity}
            depthWrite={!dimmed}
            clippingPlanes={clipPlanes}
            side={sliceEnabled ? THREE.DoubleSide : THREE.FrontSide}
            onBeforeCompile={brainOnBeforeCompile}
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
              className={"label3d" + (selected ? " is-selected" : "")}
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
    </>
  );
}

/**
 * The real Z-Anatomy / BodyParts3D brain. Loads the Draco-compressed GLB whose
 * nodes are named by structureKey (see scripts/extract_brain.mjs) and wires each
 * one into selection / focus / isolate / explode / slice.
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
