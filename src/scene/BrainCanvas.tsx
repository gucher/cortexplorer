import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraRig } from "./CameraRig";
import { BrainModel } from "./BrainModel";
import { NervesLayer } from "./NervesModel";
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

// Neutral studio IBL baked from three's RoomEnvironment — gives the materials
// soft specular sheen + image-based fill without any external HDR fetch.
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Lights() {
  return (
    <>
      {/* Symmetric key + mirrored fill so neither hemisphere is brighter/shinier
          than the other — the surface reads as one uniform material. */}
      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 5, 4]} intensity={0.7} color="#fff3ea" />
      <directionalLight position={[-5, 5, 4]} intensity={0.7} color="#eef2ff" />
      {/* Centered back rim */}
      <directionalLight position={[0, 3, -6]} intensity={0.55} color="#cfe0ff" />
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
        // Neutral (Khronos PBR) tone mapping compresses highlights while keeping
        // hue/saturation — ACES Filmic was washing the tissue colours toward white.
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ fov: 45, near: 0.05, far: 100, position: [2.4, 1.7, 3.6] }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      onPointerMissed={() => select(null)}
    >
      <Suspense fallback={null}>
        <StudioEnvironment />
        <Lights />
        <BrainModel />
        <NervesLayer />
        <CameraRig />
        <ClippingController />
      </Suspense>
    </Canvas>
  );
}
