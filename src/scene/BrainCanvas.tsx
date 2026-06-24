import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { BrainModel } from "./BrainModel";
import { useBrainStore } from "../state/store";
import { updateClipPlane } from "./clipping";

function ClippingController() {
  const enabled = useBrainStore((s) => s.slice.enabled);
  const axis = useBrainStore((s) => s.slice.axis);
  const position = useBrainStore((s) => s.slice.position);
  const flip = useBrainStore((s) => s.slice.flip);
  useEffect(() => {
    updateClipPlane(enabled, axis, position, flip);
  }, [enabled, axis, position, flip]);
  return null;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#8c97b5", "#0a0d13", 0.5]} />
      <ambientLight intensity={0.15} />
      {/* Key */}
      <directionalLight position={[4, 6, 5]} intensity={1.9} color="#fff4e8" />
      {/* Cool fill */}
      <directionalLight position={[-5, 1, 2]} intensity={0.55} color="#9fb4ff" />
      {/* Rim / back — the signature edge glow */}
      <directionalLight position={[-3, 2, -6]} intensity={1.8} color="#cfe0ff" />
    </>
  );
}

export function BrainCanvas() {
  const select = useBrainStore((s) => s.select);

  return (
    <Canvas
      className="brain-canvas"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        // Keep the drawing buffer so the canvas can be screenshotted/exported
        // reliably (and so captures aren't blank on idle frames).
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ fov: 45, near: 0.05, far: 100, position: [2.4, 1.7, 3.6] }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      onPointerMissed={() => select(null)}
    >
      <Suspense fallback={null}>
        <Lights />
        <BrainModel />
        <CameraRig />
        <ClippingController />
      </Suspense>
    </Canvas>
  );
}
