/**
 * GeoLine Solutions — Three.js 3D Terrain Viewport
 *
 * Renders a Delaunay TIN surface, major/minor contour lines, and a point cloud
 * from a TerrainModel (or raw TinPt / Triangle data).
 *
 * Controls:
 *   Mouse drag (left)  — orbit
 *   Mouse drag (right) — pan
 *   Scroll wheel       — zoom
 *   Double-click       — reset camera
 *
 * The component is self-contained: it manages its own Three.js lifecycle
 * (renderer, camera, controls) inside a `useEffect` and tears down on unmount.
 * No external Three.js orbit-controls package required — custom orbit is
 * implemented inline to avoid a separate npm dep.
 */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { TerrainModel } from "@/lib/terrain";
import type { TinPt, Triangle, ContourRing } from "@/lib/tin";

// ─── Types ──────────────────────────────────────────────────────────────────

export type View3DProps = {
  model: TerrainModel | null;
  /** Show TIN wireframe mesh (default true) */
  showMesh?: boolean;
  /** Show shaded TIN surface (default true) */
  showSurface?: boolean;
  /** Show contour lines (default true) */
  showContours?: boolean;
  /** Show survey point cloud (default true) */
  showPoints?: boolean;
  /** Vertical exaggeration factor (default 1.0) */
  exaggeration?: number;
  className?: string;
};

// ─── Colour helpers ──────────────────────────────────────────────────────────

function elevColor(z: number, zmin: number, zmax: number): THREE.Color {
  const t = zmax > zmin ? (z - zmin) / (zmax - zmin) : 0.5;
  // Deep blue → cyan → green → yellow → red
  if (t < 0.25) {
    return new THREE.Color().setHSL(0.6 - t * 0.4, 0.9, 0.4);
  } else if (t < 0.5) {
    const tt = (t - 0.25) / 0.25;
    return new THREE.Color().setHSL(0.36 - tt * 0.16, 0.8, 0.45);
  } else if (t < 0.75) {
    const tt = (t - 0.5) / 0.25;
    return new THREE.Color().setHSL(0.2 - tt * 0.08, 0.85, 0.5);
  } else {
    const tt = (t - 0.75) / 0.25;
    return new THREE.Color().setHSL(0.12 - tt * 0.12, 0.9, 0.55);
  }
}

// ─── Orbit controls (inline) ─────────────────────────────────────────────────

class SimpleOrbit {
  private theta = 0.6; // azimuth (rad)
  private phi = 0.9;   // polar   (rad)
  private radius = 1;
  private target = new THREE.Vector3();
  private dragging: "orbit" | "pan" | null = null;
  private lastX = 0;
  private lastY = 0;
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;
    this.radius = camera.position.length();
    this.attach();
  }

  private onDown = (e: MouseEvent) => {
    if (e.button === 0) this.dragging = "orbit";
    if (e.button === 2) this.dragging = "pan";
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };
  private onMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (this.dragging === "orbit") {
      this.theta -= dx * 0.005;
      this.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.phi - dy * 0.005));
    } else {
      // Pan in camera's local XY plane
      const scale = this.radius * 0.001;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      this.camera.getWorldDirection(right);
      right.crossVectors(right, this.camera.up).normalize();
      up.copy(this.camera.up).normalize();
      this.target.addScaledVector(right, -dx * scale);
      this.target.addScaledVector(up, dy * scale);
    }
    this.update();
  };
  private onUp = () => { this.dragging = null; };
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.radius = Math.max(1, this.radius * (1 + e.deltaY * 0.001));
    this.update();
  };
  private onDblClick = () => { this.reset(); };
  private onContext = (e: Event) => e.preventDefault();

  attach() {
    this.canvas.addEventListener("mousedown", this.onDown);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseup", this.onUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.canvas.addEventListener("dblclick", this.onDblClick);
    this.canvas.addEventListener("contextmenu", this.onContext);
  }

  dispose() {
    this.canvas.removeEventListener("mousedown", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("dblclick", this.onDblClick);
    this.canvas.removeEventListener("contextmenu", this.onContext);
  }

  fitTo(pts: TinPt[]) {
    if (!pts.length) return;
    let minN = Infinity, maxN = -Infinity, minE = Infinity, maxE = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of pts) {
      if (p.n < minN) minN = p.n; if (p.n > maxN) maxN = p.n;
      if (p.e < minE) minE = p.e; if (p.e > maxE) maxE = p.e;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    this.target.set((minE + maxE) / 2, (minN + maxN) / 2, (minZ + maxZ) / 2);
    const span = Math.max(maxN - minN, maxE - minE, (maxZ - minZ) * 3, 1);
    this.radius = span * 1.5;
    this.theta = 0.8;
    this.phi = 0.7;
    this.update();
  }

  reset() {
    this.theta = 0.8;
    this.phi = 0.7;
    this.update();
  }

  update() {
    const x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    const z = this.radius * Math.cos(this.phi);
    const y = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.position.set(
      this.target.x + x,
      this.target.y + y,
      this.target.z + z,
    );
    this.camera.lookAt(this.target);
  }
}

// ─── Scene builder ───────────────────────────────────────────────────────────

function buildScene(
  model: TerrainModel,
  opts: { showMesh: boolean; showSurface: boolean; showContours: boolean; showPoints: boolean; exag: number },
): { group: THREE.Group; centroid: THREE.Vector3 } {
  const group = new THREE.Group();
  const { pts, tris, contours, zmin, zmax } = model;
  const exag = opts.exag;

  // Centroid for coordinate normalisation (avoids float precision loss at large coordinates)
  let sumN = 0, sumE = 0, sumZ = 0;
  for (const p of pts) { sumN += p.n; sumE += p.e; sumZ += p.z; }
  const n0 = pts.length ? sumN / pts.length : 0;
  const e0 = pts.length ? sumE / pts.length : 0;
  const z0 = pts.length ? sumZ / pts.length : 0;
  const centroid = new THREE.Vector3(e0, n0, z0 * exag);

  // Map pts to local coords: x=E, y=N, z=elevation (with exaggeration)
  const local = pts.map((p) => new THREE.Vector3(p.e - e0, p.n - n0, (p.z - z0) * exag));

  // ── TIN surface ──────────────────────────────────────────────────────────
  if ((opts.showSurface || opts.showMesh) && tris.length > 0) {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (const [i, v] of local.entries()) {
      positions.push(v.x, v.y, v.z);
      const c = elevColor(pts[i].z, zmin, zmax);
      colors.push(c.r, c.g, c.b);
    }
    const nVerts = positions.length / 3;
    for (const t of tris) {
      // Guard against out-of-bound indices from constrained triangulation
      if (t.a < nVerts && t.b < nVerts && t.c < nVerts) {
        indices.push(t.a, t.b, t.c);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    if (indices.length) geo.setIndex(indices);
    geo.computeVertexNormals();

    if (opts.showSurface) {
      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        shininess: 30,
        specular: new THREE.Color(0x222222),
      });
      group.add(new THREE.Mesh(geo, mat));
    }

    if (opts.showMesh) {
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00000044,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      group.add(new THREE.Mesh(geo.clone(), wireMat));
    }
  }

  // ── Contour lines ────────────────────────────────────────────────────────
  if (opts.showContours && contours.length > 0) {
    for (const ring of contours) {
      if (ring.pts.length < 2) continue;
      const pts3: THREE.Vector3[] = ring.pts.map(
        (p) => new THREE.Vector3(p.e - e0, p.n - n0, (ring.z - z0) * exag + 0.05),
      );
      const geo = new THREE.BufferGeometry().setFromPoints(pts3);
      const color = ring.index ? 0xffd700 : 0xffcc4488;
      const width = ring.index ? 1.5 : 0.8;
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: !ring.index,
        opacity: ring.index ? 1 : 0.55,
        linewidth: width,
      });
      group.add(new THREE.Line(geo, mat));
    }
  }

  // ── Point cloud ───────────────────────────────────────────────────────────
  if (opts.showPoints && pts.length > 0) {
    const positions: number[] = [];
    const colors: number[] = [];
    // Downsample to 10k points max for performance
    const step = Math.max(1, Math.floor(pts.length / 10000));
    for (let i = 0; i < pts.length; i += step) {
      const v = local[i];
      positions.push(v.x, v.y, v.z + 0.1);
      const c = elevColor(pts[i].z, zmin, zmax);
      colors.push(c.r, c.g, c.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, sizeAttenuation: true });
    group.add(new THREE.Points(geo, mat));
  }

  return { group, centroid };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function View3D({
  model,
  showMesh = true,
  showSurface = true,
  showContours = true,
  showPoints = true,
  exaggeration = 1,
  className = "",
}: View3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth  || 800;
    const h = el.clientHeight || 500;

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setClearColor(0x1a1d23);
    el.appendChild(renderer.domElement);

    // ── Camera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 1e7);
    camera.up.set(0, 0, 1);
    camera.position.set(100, -100, 100);
    camera.lookAt(0, 0, 0);

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.1);
    sun.position.set(0.6, -0.4, 1).normalize();
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
    fill.position.set(-0.5, 0.5, 0.5).normalize();
    scene.add(fill);

    // ── Axes helper ───────────────────────────────────────────────────────
    scene.add(new THREE.AxesHelper(5));

    // ── Terrain group ─────────────────────────────────────────────────────
    let orbit: SimpleOrbit | null = null;
    if (model && model.pts.length > 0) {
      const { group } = buildScene(model, {
        showMesh,
        showSurface,
        showContours,
        showPoints,
        exag: exaggeration,
      });
      scene.add(group);
      orbit = new SimpleOrbit(camera, renderer.domElement);
      orbit.fitTo(model.pts);
      setInfo(`${model.pts.length.toLocaleString()} pts · ${model.tris.length.toLocaleString()} tris · Δz ${(model.zmax - model.zmin).toFixed(1)} ft`);
    } else {
      orbit = new SimpleOrbit(camera, renderer.domElement);
      setInfo("No terrain data loaded");
    }

    // ── Resize observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    // ── Render loop ───────────────────────────────────────────────────────
    let animId = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      orbit?.dispose();
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, showMesh, showSurface, showContours, showPoints, exaggeration]);

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-[#1a1d23] ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* HUD overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none select-none">
        <span className="text-[10px] text-white/40 font-mono bg-black/30 px-1.5 py-0.5 rounded">
          {info}
        </span>
        <span className="text-[10px] text-white/30 font-mono bg-black/30 px-1.5 py-0.5 rounded">
          drag to orbit · right-drag pan · scroll zoom · dblclick reset
        </span>
      </div>

      {/* Empty state */}
      {!model || model.pts.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 pointer-events-none">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
              d="M3 7l9-4 9 4M3 7l9 4 9-4M3 7v10l9 4 9-4V7" />
          </svg>
          <p className="text-sm">Load a field book to build terrain</p>
        </div>
      ) : null}
    </div>
  );
}

// ─── Toolbar wrapper ──────────────────────────────────────────────────────────
// A convenience component that pairs the viewport with toggle controls.

export type View3DToolbarProps = View3DProps & {
  onClose?: () => void;
};

export function View3DToolbar({ onClose, ...props }: View3DToolbarProps) {
  const [mesh, setMesh] = useState(props.showMesh ?? true);
  const [surface, setSurface] = useState(props.showSurface ?? true);
  const [contours, setContours] = useState(props.showContours ?? true);
  const [points, setPoints] = useState(props.showPoints ?? true);
  const [exag, setExag] = useState(props.exaggeration ?? 1);

  const Toggle = ({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) => (
    <button
      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
        on ? "bg-sky-600/80 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
      }`}
      onClick={() => set(!on)}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#1a1d23]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/8 flex-shrink-0 flex-wrap">
        <span className="text-[11px] font-semibold text-sky-400 mr-1">3D Terrain</span>
        <Toggle label="Surface" on={surface} set={setSurface} />
        <Toggle label="Mesh"    on={mesh}    set={setMesh} />
        <Toggle label="Contours" on={contours} set={setContours} />
        <Toggle label="Points"  on={points}  set={setPoints} />
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[10px] text-white/30">VE</span>
          <input
            type="range" min={0.5} max={10} step={0.5} value={exag}
            onChange={(e) => setExag(Number(e.target.value))}
            className="w-20 accent-sky-500"
          />
          <span className="text-[10px] text-white/50 w-6">{exag}×</span>
        </div>
        {onClose && (
          <button
            className="ml-auto text-white/30 hover:text-white/70 text-xs px-1"
            onClick={onClose}
            aria-label="Close 3D view"
          >✕</button>
        )}
      </div>

      {/* Viewport */}
      <div className="flex-1 min-h-0">
        <View3D
          {...props}
          showMesh={mesh}
          showSurface={surface}
          showContours={contours}
          showPoints={points}
          exaggeration={exag}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
