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
      {/* Balanced, even illumination so the brain reads as one unified surface
          rather than a hot glossy side + a dark matte side. */}
      <ambientLight intensity={0.3} />
      {/* Soft key */}
      <directionalLight position={[4, 6, 5]} intensity={0.95} color="#fff1e6" />
      {/* Fill close to key to even out the two hemispheres */}
      <directionalLight position={[-5, 1, 2]} intensity={0.8} color="#aebfe0" />
      {/* Gentle rim */}
      <directionalLight position={[-3, 2, -6]} intensity={0.85} color="#cfe0ff" />
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
