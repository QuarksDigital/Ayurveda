"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import * as THREE from "three";

/*
 * Two-tone hard-gelatin capsule, proportioned like a real size-0 capsule (~2.9 : 1).
 * Local +Y is the long axis; the visible seam (cap rim) sits at y = 0.
 *
 * Driven by `progress` (0 → 1) from the hero ScrollTrigger:
 *   0.00–0.16  cap and body slide apart along the axis
 *   0.02–0.48  as soon as the halves part, pellets gather at the centre and spread into the lens
 *   0.12–0.26  focus pulls onto the near pellets; the capsule behind blurs
 *   0.28–0.45  empty shells drift out of frame (the hero fades to white over 0.40–0.50)
 */

const R = 1; // body outer radius
const WALL = 0.03;
const CAP_R = R + WALL + 0.012; // cap slips over the body
const CAP_STRAIGHT = 1.9; // cap: rim at y=0 → dome starts at y=1.9 → tip at 2.9
const BODY_STRAIGHT = 1.9; // body tip at -2.9
const BODY_INTO_CAP = 0.5; // body rim hidden 0.5 inside the cap
const CAMERA_Z = 11;
const FOV = 32;

const OPEN_END = 0.16; // halves fully apart
const EMIT_START = 0.02; // pellets start leaving as the halves begin to part
const EMIT_SPAN = 0.22; // pellets leave over this window, nearest-the-opening first
const DRAIN = 0.04; // inside the shell → out of the opening
const FLY = 0.2; // opening → lens
const BLUR_START = 0.12; // capsule starts to defocus as the first pellets get close
const BLUR_FULL = 0.26;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Closed lathe profile with real wall thickness: outer skin → rim lip → inner skin. */
function shellGeometry(outer: number, straight: number, rimY: number) {
  const inner = outer - WALL;
  const steps = 40;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(1e-4, Math.sin(a) * outer), straight + Math.cos(a) * outer));
  }
  pts.push(new THREE.Vector2(outer, rimY + 0.004));
  pts.push(new THREE.Vector2(outer - 0.004, rimY));
  pts.push(new THREE.Vector2(inner + 0.004, rimY));
  pts.push(new THREE.Vector2(inner, rimY + 0.004));
  for (let i = steps; i >= 0; i--) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(1e-4, Math.sin(a) * inner), straight + Math.cos(a) * inner));
  }
  const geo = new THREE.LatheGeometry(pts, 128);
  geo.computeVertexNormals();
  return geo;
}

/** Slightly irregular pellet - real beads are never perfect spheres. */
function pelletGeometry() {
  // indexed sphere → smooth normals after displacement (an icosahedron here shades faceted)
  const geo = new THREE.SphereGeometry(1, 28, 20);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = 1 + 0.03 * Math.sin(v.x * 5.1 + v.y * 2.3) * Math.cos(v.z * 4.7 - v.y * 1.9);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Random packing of pellets of varying size inside one half. */
function packHalf(
  rand: () => number,
  { radius, yMin, yMax, domeY, target }: { radius: number; yMin: number; yMax: number; domeY: number; target: number }
) {
  const rMin = 0.082, rMax = 0.112;
  const cell = rMax * 2;
  const grid = new Map<string, number[]>();
  const pts: number[] = []; // x, y, z, r
  const inside = (x: number, y: number, z: number, r: number) => {
    const lim = radius - r;
    const rr = x * x + z * z;
    if (y - r < yMin || y > yMax) return false;
    if (y <= domeY) return rr <= lim * lim;
    const dy = y - domeY;
    return rr + dy * dy <= lim * lim;
  };
  for (let attempt = 0; attempt < target * 120 && pts.length / 4 < target; attempt++) {
    const r = rMin + rand() * (rMax - rMin);
    const x = (rand() * 2 - 1) * radius;
    const z = (rand() * 2 - 1) * radius;
    const y = yMin + rand() * (yMax - yMin);
    if (!inside(x, y, z, r)) continue;
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell), gz = Math.floor(z / cell);
    let ok = true;
    for (let dx = -1; dx <= 1 && ok; dx++)
      for (let dy = -1; dy <= 1 && ok; dy++)
        for (let dz = -1; dz <= 1 && ok; dz++) {
          for (const idx of grid.get(`${gx + dx}|${gy + dy}|${gz + dz}`) ?? []) {
            const ex = pts[idx] - x, ey = pts[idx + 1] - y, ez = pts[idx + 2] - z;
            const min = (pts[idx + 3] + r) * 0.98;
            if (ex * ex + ey * ey + ez * ez < min * min) { ok = false; break; }
          }
        }
    if (!ok) continue;
    const k = `${gx}|${gy}|${gz}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(pts.length);
    pts.push(x, y, z, r);
  }
  return pts;
}

function makeBackdrop() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  // Opaque so the glass cap's transmission pass refracts it.
  const grad = g.createRadialGradient(512, 470, 0, 512, 512, 560);
  grad.addColorStop(0, "#22262f");
  grad.addColorStop(0.5, "#121419");
  grad.addColorStop(1, "#060709");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 1024);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface SceneProps {
  progress: React.RefObject<number>;
  onPillClick: () => void;
}

function Capsule({ progress, onPillClick }: SceneProps) {
  const tumble = useRef<THREE.Group>(null!);
  const pill = useRef<THREE.Group>(null!);
  const cap = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const beads = useRef<THREE.InstancedMesh>(null!);
  const beadMat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const [hovered, setHovered] = useState(false);
  const { size, viewport } = useThree();

  const capGeo = useMemo(() => shellGeometry(CAP_R, CAP_STRAIGHT, 0), []);
  const bodyGeo = useMemo(() => shellGeometry(R, BODY_STRAIGHT, -BODY_INTO_CAP), []);
  const pelletGeo = useMemo(() => pelletGeometry(), []);
  const backdrop = useMemo(() => makeBackdrop(), []);

  const data = useMemo(() => {
    const rand = mulberry32(11);
    // Cap pellets fill the cap to its rim (those inside the body's end are hidden by it while closed);
    // body pellets fill the body (pill-space, body points down).
    const capPts = packHalf(rand, { radius: CAP_R - WALL - 0.01, yMin: 0.02, yMax: CAP_STRAIGHT + CAP_R, domeY: CAP_STRAIGHT, target: 1100 });
    const bodyRaw = packHalf(rand, { radius: R - WALL - 0.01, yMin: -BODY_INTO_CAP, yMax: BODY_STRAIGHT + R, domeY: BODY_STRAIGHT, target: 1100 });
    for (let i = 1; i < bodyRaw.length; i += 4) bodyRaw[i] = -bodyRaw[i]; // flip into the body half
    const all = [...capPts, ...bodyRaw];
    const count = all.length / 4;
    const capCount = capPts.length / 4;

    const start = new Float32Array(count * 3);
    const radius = new Float32Array(count);
    const side = new Float32Array(count);
    const order: { i: number; d: number }[] = [];
    for (let i = 0; i < count; i++) {
      start.set([all[i * 4], all[i * 4 + 1], all[i * 4 + 2]], i * 3);
      radius[i] = all[i * 4 + 3];
      side[i] = i < capCount ? 1 : -1;
      // distance to its half's opening (cap opens at y=0, body at y=+BODY_INTO_CAP)
      const y = all[i * 4 + 1];
      order.push({ i, d: (side[i] > 0 ? y : BODY_INTO_CAP - y) + rand() * 0.25 });
    }
    order.sort((a, b) => a.d - b.d);
    const delay = new Float32Array(count);
    order.forEach(({ i }, rank) => (delay[i] = EMIT_START + (rank / count) * EMIT_SPAN));

    const depth = new Float32Array(count);
    const ndc = new Float32Array(count * 2);
    const arc = new Float32Array(count * 3);
    const finalR = new Float32Array(count);
    const axis = new Float32Array(count * 3);
    const quat0 = new Float32Array(count * 4);
    const stretch = new Float32Array(count * 3);
    const color = new THREE.Color();
    const colors = new Float32Array(count * 3);
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      depth[i] = Math.pow(rand(), 0.55);
      ndc[i * 2] = rand() * 2.3 - 1.15;
      ndc[i * 2 + 1] = rand() * 2.3 - 1.15;
      const a = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      arc.set([a.x * 0.9, a.y * 0.9, a.z * 0.9], i * 3);
      const ax = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      axis.set([ax.x, ax.y, ax.z], i * 3);
      q.setFromEuler(e.set(rand() * 6.28, rand() * 6.28, rand() * 6.28));
      quat0.set([q.x, q.y, q.z, q.w], i * 4);
      stretch.set([0.94 + rand() * 0.1, 0.92 + rand() * 0.1, 0.95 + rand() * 0.08], i * 3);
      finalR[i] = 0.1 + rand() * 0.32;
      // ivory → warm cream, like coated pellets
      color.setHSL(0.11 + rand() * 0.03, 0.25 + rand() * 0.2, 0.86 + rand() * 0.08);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    return { count, start, radius, side, delay, depth, ndc, arc, finalR, axis, quat0, stretch, colors };
  }, []);

  // world-space landing spots spread across the view frustum
  const targets = useMemo(() => {
    const t = new Float32Array(data.count * 3);
    const aspect = size.width / size.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    for (let i = 0; i < data.count; i++) {
      const dist = THREE.MathUtils.lerp(8, 0.6, data.depth[i]);
      const halfH = dist * tan;
      t[i * 3] = data.ndc[i * 2] * halfH * aspect;
      t[i * 3 + 1] = data.ndc[i * 2 + 1] * halfH;
      t[i * 3 + 2] = CAMERA_Z - dist;
    }
    return t;
  }, [data, size.width, size.height]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      inv: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      q0: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      ax: new THREE.Vector3(),
      s: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
    }),
    []
  );

  // Must match the `side` variant in globals.css: landscape ≥768px puts the text left and the capsule right;
  // below that the text sits on top and the capsule below it. Both glide to centre as it opens.
  const wide = size.width >= 768 && size.width / size.height >= 1.2;
  const baseScale = wide
    ? Math.min(1, viewport.width / 10, viewport.height / 7.8)
    : Math.min(1, viewport.width / 5.6, viewport.height / 9.5);
  const baseX = wide ? viewport.width * 0.2 : 0;
  const baseY = wide ? 0 : -viewport.height * 0.14;

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const open = smoothstep(0, OPEN_END, p);
    const idle = 1 - open;
    const t = state.clock.elapsedTime;

    // continuous tumble around X, slowing (not stopping) once open
    // spin around the vertical axis: cap stays on top, swinging left ↔ right
    tumble.current.rotation.y += dt * (0.6 * idle + 0.12);
    tumble.current.position.x = baseX * idle;
    tumble.current.position.y = baseY * idle + Math.sin(t * 0.8) * 0.1 * idle;
    tumble.current.rotation.x = THREE.MathUtils.lerp(tumble.current.rotation.x, 0.12 - state.pointer.y * 0.15 * idle, 0.05);
    const targetScale = baseScale * (hovered && p < 0.02 ? 1.03 : 1);
    tumble.current.scale.setScalar(THREE.MathUtils.lerp(tumble.current.scale.x, targetScale, 0.12));

    const sep = open * 1.5;
    const drift = smoothstep(0.28, 0.45, p) * 9;
    cap.current.position.y = sep + drift;
    body.current.position.y = -(sep + drift);

    pill.current.updateWorldMatrix(true, false);
    tmp.inv.copy(pill.current.matrixWorld).invert();
    const worldScale = pill.current.matrixWorld.getMaxScaleOnAxis();
    const { start, radius, side, delay, arc, finalR, axis, quat0, stretch, count } = data;

    for (let i = 0; i < count; i++) {
      const halfY = side[i] * (sep + drift);
      const sx = start[i * 3], sy = start[i * 3 + 1] + halfY, sz = start[i * 3 + 2];
      const d = delay[i];
      const drain = clamp01((p - d) / DRAIN); // slide to the opening
      const fly = clamp01((p - d - DRAIN) / FLY); // out of the centre into the lens
      const r0 = radius[i];

      if (fly <= 0) {
        // inside the shell, moving toward the centre of the gap (pill-space origin)
        const k = drain * drain;
        tmp.p.set(sx * (1 - k), sy * (1 - k), sz * (1 - k));
        tmp.s.set(r0 * stretch[i * 3], r0 * stretch[i * 3 + 1], r0 * stretch[i * 3 + 2]);
      } else {
        tmp.tgt.set(targets[i * 3], targets[i * 3 + 1], targets[i * 3 + 2]).applyMatrix4(tmp.inv);
        const k = fly * fly;
        const bend = Math.sin(Math.PI * fly) * (1 - fly * 0.5);
        tmp.p.set(
          tmp.tgt.x * k + arc[i * 3] * bend,
          tmp.tgt.y * k + arc[i * 3 + 1] * bend,
          tmp.tgt.z * k + arc[i * 3 + 2] * bend
        );
        const r = THREE.MathUtils.lerp(r0, finalR[i] / worldScale, fly * fly * fly);
        tmp.s.set(r * stretch[i * 3], r * stretch[i * 3 + 1], r * stretch[i * 3 + 2]);
      }

      tmp.q0.set(quat0[i * 4], quat0[i * 4 + 1], quat0[i * 4 + 2], quat0[i * 4 + 3]);
      tmp.ax.set(axis[i * 3], axis[i * 3 + 1], axis[i * 3 + 2]);
      tmp.spin.setFromAxisAngle(tmp.ax, fly * 7);
      tmp.q.multiplyQuaternions(tmp.spin, tmp.q0);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      beads.current.setMatrixAt(i, tmp.m);
    }
    beads.current.instanceMatrix.needsUpdate = true;
    beadMat.current.emissiveIntensity = smoothstep(0.2, 0.48, p) * 0.6;
  });

  return (
    <>
      <mesh position={[0, 0, -8]} scale={[60, 60, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={backdrop} toneMapped={false} />
      </mesh>

      <group ref={tumble} scale={baseScale}>
        <group rotation={[0, 0, -0.78]}>
          <group
            ref={pill}
            onClick={(e) => {
              e.stopPropagation();
              onPillClick();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = "pointer";
              document.documentElement.dataset.cursor = "hover"; // custom cursor grows
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "";
              delete document.documentElement.dataset.cursor;
            }}
          >
            <group ref={cap}>
              <mesh geometry={capGeo} renderOrder={2}>
                <meshPhysicalMaterial
                  color="#ffffff"
                  transmission={1}
                  roughness={0.07}
                  thickness={0.08}
                  ior={1.47}
                  clearcoat={1}
                  clearcoatRoughness={0.04}
                  specularIntensity={1}
                  envMapIntensity={1.4}
                  side={THREE.FrontSide}
                />
              </mesh>
            </group>
            <group ref={body}>
              <mesh geometry={bodyGeo} rotation={[Math.PI, 0, 0]}>
                <meshPhysicalMaterial
                  color="#1740d6"
                  metalness={0.35}
                  roughness={0.2}
                  clearcoat={1}
                  clearcoatRoughness={0.03}
                  envMapIntensity={1.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
            <instancedMesh ref={beads} args={[pelletGeo, undefined, data.count]} frustumCulled={false}>
              <instancedBufferAttribute attach="instanceColor" args={[data.colors, 3]} />
              <meshPhysicalMaterial
                ref={beadMat}
                roughness={0.62}
                sheen={0.6}
                sheenRoughness={0.6}
                sheenColor="#fff7e8"
                emissive="#ffffff"
                emissiveIntensity={0}
              />
            </instancedMesh>
          </group>
        </group>
      </group>
    </>
  );
}

/** Calls `onReady` once a few frames have rendered (shaders compiled, environment baked). */
function FirstFrames({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (++frames.current === 3) onReady();
  });
  return null;
}

/**
 * Depth of field: as the pellets reach the lens, focus pulls from the capsule (~CAMERA_Z away)
 * onto the near pellets, so the capsule behind softens. Off until the burst, so the idle
 * capsule renders without the post-processing pass.
 */
function PelletFocus({ progress }: { progress: React.RefObject<number> }) {
  const dof = useRef<DepthOfFieldEffect>(null);
  const [on, setOn] = useState(false);
  useFrame(() => {
    const p = progress.current ?? 0;
    const k = smoothstep(BLUR_START, BLUR_FULL, p);
    if ((k > 0) !== on) setOn(k > 0);
    if (!dof.current) return;
    dof.current.cocMaterial.focusDistance = THREE.MathUtils.lerp(CAMERA_Z, 1.6, k);
    dof.current.cocMaterial.focusRange = THREE.MathUtils.lerp(6, 1.8, k);
    dof.current.bokehScale = k * 7;
  });
  return (
    <EffectComposer enabled={on} multisampling={4}>
      <DepthOfField ref={dof} focusDistance={CAMERA_Z} focusRange={6} bokehScale={0} resolutionScale={0.5} />
    </EffectComposer>
  );
}

export default function PillScene({ progress, onPillClick, active, onReady }: SceneProps & { active: boolean; onReady: () => void }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.05 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 5]} intensity={1.8} />
      <directionalLight position={[-5, -3, 2]} intensity={0.4} color="#c9d6ff" />
      <Capsule progress={progress} onPillClick={onPillClick} />
      <FirstFrames onReady={onReady} />
      <PelletFocus progress={progress} />
      <Environment resolution={512} frames={1}>
        {/* soft studio: large top softbox, two strip lights, faint rim */}
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={3} position={[-7, 0.5, 2]} rotation-y={Math.PI / 2} scale={[10, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[7, 0, 1]} rotation-y={-Math.PI / 2} scale={[10, 0.8, 1]} color="#dfe8ff" />
        <Lightformer form="circle" intensity={0.5} position={[0, 0, 9]} scale={6} />
        <Lightformer form="rect" intensity={1.2} position={[0, -1, -8]} scale={[16, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
