"use client";
import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Group, LineSegments, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";

const vertexShader = `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSeparation;
  uniform float uBloom;
  uniform float uPixelRatio;
  uniform float uForm;
  varying float vAlpha;
  varying float vWarmth;
  void main() {
    float t = aSeed.x * 6.283185;
    float band = aSeed.y * 6.283185;
    float wave = sin(t * 3.0 + band * 2.0 + uTime * .14);
    float radius = 1.52 + .19 * wave + aSeed.z * .12;
    float knot = t + .32 * sin(band * 3.0 + uTime * .06);
    vec3 sphere = vec3(cos(knot) * sin(band), cos(band), sin(knot) * sin(band)) * radius;
    float pulseForm = clamp(uForm, 0.0, 1.0) * (1.0 - clamp(uForm - 1.0, 0.0, 1.0));
    float bloomForm = clamp(uForm - 1.0, 0.0, 1.0);
    sphere *= 1.0 + pulseForm * .22 * sin(band * 5.0 + uTime * .45);
    sphere.xy *= 1.0 + bloomForm * .30 * cos(t * 5.0 + band);
    sphere.z *= 1.0 - bloomForm * .35;
    // Woven fibers bend into a toroidal opening as the two worlds converge.
    float ring = 1.33 + .48 * cos(band);
    vec3 torus = vec3(ring * cos(t), ring * sin(t), .48 * sin(band));
    vec3 p = mix(sphere, torus, uBloom);
    float side = step(.5, aSeed.z) * 2.0 - 1.0;
    p *= mix(1.0, .42, uSeparation);
    p.x += side * uSeparation * 2.15;
    p.y += sin(t * 5.0 + uTime * .25) * .016 * (1.0 + uEnergy);
    p *= 1.0 + uEnergy * .035;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((1.5 + aSeed.z * 2.0) * uPixelRatio * (4.0 / -mv.z), .9, 5.0);
    vAlpha = (.25 + .65 * pow(abs(sin(band * 2.0 + t)), 3.0)) * (.75 + uEnergy * .25);
    vWarmth = aSeed.z;
  }
`;
const fragmentShader = `
  uniform float uOpacity;
  varying float vAlpha;
  varying float vWarmth;
  void main() {
    float d = length(gl_PointCoord - .5);
    float alpha = (1.0 - smoothstep(.05, .5, d)) * vAlpha * uOpacity;
    vec3 color = mix(vec3(.78, .40, .18), vec3(1., .86, .63), vWarmth);
    gl_FragColor = vec4(color, alpha);
  }
`;
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (a: number, b: number, p: number) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };

export default function LightScene({ progress, energy }: { progress: RefObject<number>; energy: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const container = host.current;
    const experience = container.closest<HTMLElement>(".experience");
    let renderer: WebGLRenderer;
    try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); } catch { return; }
    container.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(42, innerWidth / innerHeight, .1, 100);
    camera.position.z = 6.5;
    const geometry = new BufferGeometry();
    const count = innerWidth < 768 ? 8500 : 24000;
    const seeds = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    // Deterministic fibers, with no frame-by-frame geometry allocations.
    let randomSeed = 1907;
    const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = (i % 240) / 240;
      seeds[i * 3 + 1] = Math.floor(i / 240) / Math.ceil(count / 240) + (random() - .5) * .003;
      seeds[i * 3 + 2] = random();
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 3));
    const uniforms = { uTime: { value: 0 }, uEnergy: { value: 0 }, uSeparation: { value: 0 }, uBloom: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uForm: { value: 0 } };
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
    const particles = new Points(geometry, material);
    particles.frustumCulled = false;
    const sculpture = new Group();
    sculpture.add(particles);
    const fiberCount = innerWidth < 768 ? 26 : 52;
    const fiberSteps = 240;
    const fiberSeeds = new Float32Array(fiberCount * fiberSteps * 6);
    for (let band = 0; band < fiberCount; band++) {
      for (let step = 0; step < fiberSteps; step++) {
        const offset = (band * fiberSteps + step) * 6;
        fiberSeeds.set([step / fiberSteps, band / fiberCount, .42 + band / fiberCount * .16,
          (step + 1) / fiberSteps, band / fiberCount, .42 + band / fiberCount * .16], offset);
      }
    }
    const fiberGeometry = new BufferGeometry();
    fiberGeometry.setAttribute("position", new BufferAttribute(new Float32Array(fiberSeeds.length), 3));
    fiberGeometry.setAttribute("aSeed", new BufferAttribute(fiberSeeds, 3));
    const fiberMaterial = new ShaderMaterial({ vertexShader, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending,
      fragmentShader: `uniform float uOpacity; varying float vAlpha; varying float vWarmth;
        void main() { gl_FragColor = vec4(mix(vec3(.65,.28,.10),vec3(1.,.82,.56),vWarmth), vAlpha * uOpacity * .43); }`,
    });
    const fibers = new LineSegments(fiberGeometry, fiberMaterial);
    fibers.frustumCulled = false;
    sculpture.add(fibers);
    scene.add(sculpture);
    let mobile = innerWidth < 768;
    let lastTime = 0;
    let lost = false;
    const resize = () => {
      mobile = innerWidth < 768;
      const dpr = Math.min(devicePixelRatio, mobile ? 1 : 1.5);
      renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      uniforms.uPixelRatio.value = dpr;
    };
    const render = (time: number) => {
      if (document.hidden || lost || (mobile && time - lastTime < 1 / 30)) return;
      lastTime = time;
      // Lenis already interpolates the narrative clock. A second easing layer
      // drifts behind HTML, especially when the mobile renderer skips ticks.
      const p = progress.current;
      const inner = smooth(.8, 1.16, p) * (1 - smooth(1.94, 2.12, p));
      const distance = smooth(2.82, 3.12, p) * (1 - smooth(4.02, 4.35, p));
      const finale = smooth(6.35, 6.6, p) * (1 - smooth(6.64, 6.76, p));
      const travel = smooth(1.58, 1.98, p) * (1 - smooth(2, 2.12, p));
      uniforms.uTime.value = time;
      const wasVisible = uniforms.uOpacity.value > 0;
      const visibility = Math.min(1, inner + distance * .75 + finale);
      uniforms.uOpacity.value = visibility < .001 ? 0 : visibility;
      if (!wasVisible && uniforms.uOpacity.value === 0) return;
      uniforms.uEnergy.value = energy.current;
      const bond = smooth(3.45, 3.8, p);
      uniforms.uForm.value = smooth(1.25, 1.65, p) * 1.8;
      uniforms.uSeparation.value = distance * (1 - bond);
      uniforms.uBloom.value = Math.max(finale, distance * bond * .55);
      const x = mobile ? 0 : 1.55 * inner;
      sculpture.position.set(x, mobile ? -.58 * inner - .03 * distance : .05 + .4 * inner - .35 * distance, 0);
      sculpture.rotation.set(.18 + inner * .2, p * .65 * (1 - distance) + Math.sin(time * .07) * .08, -.25 * (1 - distance) + finale * .5);
      const scale = (mobile ? .37 - distance * .04 : 1 - inner * .16) * (1 - distance * bond * .38);
      sculpture.scale.setScalar(scale * (1 + travel * 2.8 + finale * .36));
      camera.position.z = 6.5 - travel * 2.4;
      renderer.render(scene, camera);
    };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; container.style.display = "none"; experience?.removeAttribute("data-webgl"); };
    resize();
    experience?.setAttribute("data-webgl", "true");
    gsap.ticker.add(render);
    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      experience?.removeAttribute("data-webgl");
      geometry.dispose(); material.dispose(); fiberGeometry.dispose(); fiberMaterial.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [energy, progress]);
  return <div className="light-canvas" ref={host} aria-hidden="true" />;
}
