import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { PlaceholderBrain } from "./PlaceholderBrain";
import { useBrainStore } from "../state/store";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#7d8aa6", "#0c0f15", 0.55]} />
      <ambientLight intensity={0.18} />
      {/* Key */}
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#fff4e8" />
      {/* Fill */}
      <directionalLight position={[-5, 1, 2]} intensity={0.5} color="#9fb4ff" />
      {/* Rim / back — gives the signature edge glow */}
      <directionalLight position={[-2, 3, -6]} intensity={1.6} color="#cfe0ff" />
    </>
  );
}

export function BrainCanvas() {
  const select = useBrainStore((s) => s.select);

  return (
    <Canvas
      className="brain-canvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 45, near: 0.05, far: 100, position: [2.4, 1.7, 3.6] }}
      onPointerMissed={() => select(null)}
    >
      <Suspense fallback={null}>
        <Lights />
        <PlaceholderBrain />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
