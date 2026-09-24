import { delaunay, buildContours, constrainEdges, sampleElevation, type TinPt, type Triangle, type ContourRing } from "./tin";
import { resolveFeature, type LabeledShot } from "./label";
import { buildChains, chainVertices, type UserLine, type Vertex } from "./chains";
import { rootCode } from "./fieldcode";

export type { TinPt, Triangle, ContourRing };
export { delaunay, buildContours, sampleElevation };

const POINT_ONLY = new Set(["Point"]);
const SKIP_CAT = new Set(["Signs", "Signals", "Utilities", "Vegetation"]);
const SKIP_ROOT = new Set(["DR", "CMP", "CPP", "RCP", "PVC", "HD", "FES"]);
const BREAK = new Set(["EP", "ES", "EG", "RC", "CL", "DL", "FL", "WF", "DI", "TB", "TS", "RP", "CT", "CB", "SW", "BR", "LL"]);

export type TerrainModel = {
  pts: TinPt[];
  tris: Triangle[];
  contours: ContourRing[];
  zmin: number;
  zmax: number;
  note: string;
};

export function groundPoints(shots: LabeledShot[], remaps: Record<string, string>, extra: Vertex[] = []): TinPt[] {
  const out: TinPt[] = [];
  const seen = new Set<string>();
  const push = (n: number, e: number, z: number) => {
    const k = `${n.toFixed(3)}:${e.toFixed(3)}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ n, e, z });
  };
  for (const s of shots) {
    const f = resolveFeature(s, remaps);
    const alpha = s.codeToken.toUpperCase();
    if (f?.attr && POINT_ONLY.has(f.attr) && f.cat !== "Survey Control") continue;
    if (f && SKIP_CAT.has(f.cat)) continue;
    if (alpha.startsWith("P") && alpha.length >= 3 && f?.attr === "Point") continue;
    if (SKIP_ROOT.has(rootCode(alpha))) continue;
    if (!Number.isFinite(s.northing) || !Number.isFinite(s.easting) || !Number.isFinite(s.elevation)) continue;
    push(s.northing, s.easting, s.elevation);
  }
  for (const v of extra) push(v.n, v.e, v.z);
  return out;
}

export function terrainFromBook(
  shots: LabeledShot[],
  remaps: Record<string, string>,
  userLines: UserLine[],
  interval: number,
): TerrainModel {
  const hard: TinPt[] = [];
  const edges: [number, number][] = [];
  const index = new Map<string, number>();
  const addPt = (p: TinPt) => {
    const k = `${p.n.toFixed(2)}:${p.e.toFixed(2)}`;
    const hit = index.get(k);
    if (hit != null) return hit;
    const i = hard.length;
    hard.push(p);
    index.set(k, i);
    return i;
  };
  let tol = 0.08;
  const strings: TinPt[][] = [];
  const take = (code: string, verts: Vertex[]) => {
    if (!BREAK.has(rootCode(code)) || verts.length < 2) return;
    strings.push(verts.map((v) => ({ n: v.n, e: v.e, z: v.z })));
  };
  for (const chain of buildChains(shots, remaps)) take(chain.code, chainVertices(chain));
  for (const line of userLines) take(line.code, line.pts);
  const lay = (useTol: number, gap: number) => {
    hard.length = 0;
    edges.length = 0;
    index.clear();
    for (const s of strings) {
      const held = holdString(s, useTol, gap);
      let prev = -1;
      for (const p of held) {
        const i = addPt(p);
        if (prev >= 0 && prev !== i) edges.push([prev, i]);
        prev = i;
      }
    }
  };
  lay(tol, 25);
  if (hard.length > 1200) {
    tol = 0.35;
    lay(tol, 55);
  }
  const spots = groundPoints(shots, remaps);
  const room = Math.max(300, 1400 - hard.length);
  const cell = spotCell(hard.length ? hard : spots, room);
  for (const p of gridSpots(spots, hard, cell)) addPt(p);
  const pts = hard;
  const raw = delaunay(pts);
  const bridged = edges.length > 0 && edges.length <= 160 && pts.length <= 1400 ? constrainEdges(pts, raw, edges) : raw;
  const tris = dropLongEdges(pts, bridged);
  const contours = buildContours(pts, tris, interval);
  let zmin = Infinity;
  let zmax = -Infinity;
  for (const p of pts) {
    if (p.z < zmin) zmin = p.z;
    if (p.z > zmax) zmax = p.z;
  }
  if (!pts.length) {
    zmin = 0;
    zmax = 0;
  }
  return {
    pts,
    tris,
    contours,
    zmin,
    zmax,
    note: `breaklines held · ±${tol.toFixed(2)} ft · spots ${Math.round(cell)} ft`,
  };
}

function distToSeg(p: TinPt, a: TinPt, b: TinPt): number {
  const abn = b.n - a.n;
  const abe = b.e - a.e;
  const abz = b.z - a.z;
  const len2 = abn * abn + abe * abe + abz * abz;
  if (len2 < 1e-8) return Math.hypot(p.n - a.n, p.e - a.e, p.z - a.z);
  let t = ((p.n - a.n) * abn + (p.e - a.e) * abe + (p.z - a.z) * abz) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.n - (a.n + t * abn), p.e - (a.e + t * abe), p.z - (a.z + t * abz));
}

function decimate(pts: TinPt[], tol: number): TinPt[] {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const pair = stack.pop();
    if (!pair) break;
    const [i, j] = pair;
    let maxD = 0;
    let maxI = -1;
    for (let k = i + 1; k < j; k++) {
      const d = distToSeg(pts[k], pts[i], pts[j]);
      if (d > maxD) {
        maxD = d;
        maxI = k;
      }
    }
    if (maxI >= 0 && maxD > tol) {
      keep[maxI] = 1;
      stack.push([i, maxI], [maxI, j]);
    }
  }
  const out: TinPt[] = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

function holdString(pts: TinPt[], tol: number, maxGap: number): TinPt[] {
  if (pts.length < 2) return pts.slice();
  const thin = decimate(pts, tol);
  const keep = new Set(thin.map((p) => `${p.n.toFixed(3)}:${p.e.toFixed(3)}`));
  const out: TinPt[] = [pts[0]];
  let last = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const key = `${pts[i].n.toFixed(3)}:${pts[i].e.toFixed(3)}`;
    const d = Math.hypot(pts[i].n - last.n, pts[i].e - last.e);
    if (keep.has(key) || d >= maxGap || i === pts.length - 1) {
      out.push(pts[i]);
      last = pts[i];
    }
  }
  return out;
}

function spotCell(pts: TinPt[], room: number): number {
  if (pts.length <= room) return 12;
  let minN = Infinity;
  let maxN = -Infinity;
  let minE = Infinity;
  let maxE = -Infinity;
  for (const p of pts) {
    if (p.n < minN) minN = p.n;
    if (p.n > maxN) maxN = p.n;
    if (p.e < minE) minE = p.e;
    if (p.e > maxE) maxE = p.e;
  }
  const area = Math.max(maxN - minN, 1) * Math.max(maxE - minE, 1);
  return Math.max(12, Math.sqrt(area / room));
}

function dropLongEdges(pts: TinPt[], tris: Triangle[]): Triangle[] {
  if (tris.length < 2) return tris;
  const longest = (t: Triangle) => {
    const a = pts[t.a];
    const b = pts[t.b];
    const c = pts[t.c];
    return Math.max(Math.hypot(a.n - b.n, a.e - b.e), Math.hypot(b.n - c.n, b.e - c.e), Math.hypot(c.n - a.n, c.e - a.e));
  };
  const lens = tris.map(longest).sort((a, b) => a - b);
  const mid = lens[Math.floor(lens.length / 2)] || 100;
  const maxEdge = Math.min(250, Math.max(60, mid * 2.5));
  return tris.filter((t) => longest(t) <= maxEdge);
}

function gridSpots(spots: TinPt[], hard: TinPt[], cell: number): TinPt[] {
  const near = new Set<string>();
  const bin = Math.max(8, cell);
  for (const p of hard) near.add(`${Math.round(p.e / bin)}:${Math.round(p.n / bin)}`);
  const grid = new Map<string, TinPt>();
  for (const p of spots) {
    const hx = Math.round(p.e / bin);
    const hy = Math.round(p.n / bin);
    if (near.has(`${hx}:${hy}`)) continue;
    const k = `${Math.floor(p.e / cell)}:${Math.floor(p.n / cell)}`;
    const cur = grid.get(k);
    if (!cur) grid.set(k, p);
  }
  return [...grid.values()];
}
