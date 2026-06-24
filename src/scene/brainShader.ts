// Subsurface-scattering fake for the brain material.
//
// Injected into MeshPhysicalMaterial via onBeforeCompile: a Fresnel-weighted
// term adds a warm "light bleeding through thin tissue" glow at grazing angles.
// Combined with the material's clearcoat (wet CSF sheen) and an IBL environment,
// this reads as real, slightly translucent tissue rather than plastic.

import * as THREE from "three";

// Shared uniforms so every brain material samples the same subsurface look and
// can be tuned globally at runtime.
export const subsurface = {
  color: { value: new THREE.Color("#ff5236") },
  // Keep it to the silhouette edge only (high power) and subtle, so it reads as
  // translucent rim rather than washing the whole surface pale.
  intensity: { value: 0.22 },
  power: { value: 4.0 },
};

export function brainOnBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.uniforms.uSubColor = subsurface.color;
  shader.uniforms.uSubIntensity = subsurface.intensity;
  shader.uniforms.uSubPower = subsurface.power;

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
uniform vec3 uSubColor;
uniform float uSubIntensity;
uniform float uSubPower;`,
    )
    // `normal` (shading normal) and `vViewPosition` are both ready by here.
    .replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
{
  float _fres = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), uSubPower);
  totalEmissiveRadiance += uSubColor * _fres * uSubIntensity;
}`,
    );
}
