import { projectOffset, toLocal, SR67_SITE, corridorAzimuth } from "./geo";

export type LidarClass = "ground" | "veg" | "building" | "wire" | "noise";

export type LidarPt = {
  n: number;
  e: number;
  z: number;
  cls: LidarClass;
};

export const LIDAR_STYLE: Record<LidarClass, { color: string; label: string; asprs: string }> = {
  ground: { color: "#c4a574", label: "Ground", asprs: "2" },
  veg: { color: "#3d8c4a", label: "Vegetation", asprs: "3–5" },
  building: { color: "#c45c32", label: "Building / roof", asprs: "6" },
  wire: { color: "#3ad4ff", label: "Wire / pole", asprs: "14–16" },
  noise: { color: "#8a8a8a", label: "Noise / overlap", asprs: "7" },
};

function hash(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const N0 = SR67_SITE.originN;
const E0 = SR67_SITE.originE;
const MAIN_AZ = SR67_SITE.azimuthDeg;
const CROSS_AZ = MAIN_AZ + 90;

function roadZ(along: number, offset: number): number {
  const pavement = Math.min(Math.abs(offset), 18);
  return 953.55 + along * 0.00115 - pavement * 0.012 - Math.max(0, Math.abs(offset) - 18) * 0.04;
}

/**
 * Synthetic point cloud generation is DISABLED.
 *
 * Fake geometry must never appear over a real project. This function is kept as
 * a stub so any stale import doesn't break the build, but it always returns an
 * empty array and logs a warning. The LAS/LAZ parser (`las.ts`) and the
 * LidarClass / LidarPt types above are unaffected.
 */
export function generateLidarCloud(_count?: number): LidarPt[] {
  if (typeof console !== "undefined") {
    console.warn("[lidar] generateLidarCloud() is disabled — synthetic point clouds are not allowed on real projects.");
  }
  return [];
}

export function lidarCloud(): LidarPt[] {
  return [];
}

export function displayCloud(userPts: LidarPt[], _originN?: number, _originE?: number): LidarPt[] {
  return userPts;
}

const CELL = 20; // grid cell size in survey feet

let grid: Map<string, LidarPt[]> | null = null;
let gridCloud: LidarPt[] | null = null;

function ensureGrid(pts: LidarPt[]): void {
  if (grid && gridCloud === pts) return;
  grid = new Map();
  gridCloud = pts;
  for (const p of pts) {
    const key = `${Math.floor(p.n / CELL)}:${Math.floor(p.e / CELL)}`;
    let bucket = grid.get(key);
    if (!bucket) { bucket = []; grid.set(key, bucket); }
    bucket.push(p);
  }
}

export function snapLidar(
  n: number,
  e: number,
  maxDist = 14,
  z?: number,
  cloud?: LidarPt[],
  prefer?: LidarClass,
): LidarPt | null {
  const pts = cloud ?? lidarCloud();
  if (!pts.length) return null;
  ensureGrid(pts);
  const cn = Math.floor(n / CELL);
  const ce = Math.floor(e / CELL);
  let best: LidarPt | null = null;
  let bestD = maxDist;
  let ground: LidarPt | null = null;
  let groundD = maxDist;
  for (let dn = -1; dn <= 1; dn++) {
    for (let de = -1; de <= 1; de++) {
      const bucket = grid!.get(`${cn + dn}:${ce + de}`);
      if (!bucket) continue;
      for (const p of bucket) {
        const dxy = Math.hypot(p.n - n, p.e - e);
        const dz = z == null ? 0 : Math.abs(p.z - z) * 0.35;
        const d = dxy + dz;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
        if (p.cls === (prefer ?? "ground") && d < groundD) {
          groundD = d;
          ground = p;
        }
      }
    }
  }
  if (prefer && ground) return ground;
  if (ground && groundD <= maxDist * 0.7) return ground;
  return best;
}

export function sectionHits(
  sta: number,
  halfWidth = 8,
  az = MAIN_AZ,
  origin = { n: N0, e: E0 },
  cloud?: LidarPt[],
): { offset: number; z: number; cls: LidarClass; n: number; e: number }[] {
  const pts = cloud ?? lidarCloud();
  const out: { offset: number; z: number; cls: LidarClass; n: number; e: number }[] = [];
  for (const p of pts) {
    const loc = toLocal(p.n, p.e, origin.n, origin.e, az);
    if (Math.abs(loc.along - sta) <= halfWidth) {
      out.push({ offset: loc.offset, z: p.z, cls: p.cls, n: p.n, e: p.e });
    }
  }
  return out;
}

export function lidarCounts(cloud: LidarPt[]): Record<LidarClass, number> {
  const c: Record<LidarClass, number> = { ground: 0, veg: 0, building: 0, wire: 0, noise: 0 };
  for (const p of cloud) c[p.cls] += 1;
  return c;
}

export function cloudCentroid(cloud: LidarPt[]): { n: number; e: number; z: number } {
  if (!cloud.length) return { n: N0, e: E0, z: 953.55 };
  let n = 0;
  let e = 0;
  let z = 0;
  for (const p of cloud) {
    n += p.n;
    e += p.e;
    z += p.z;
  }
  const c = cloud.length;
  return { n: n / c, e: e / c, z: z / c };
}

export { corridorAzimuth };

export const LIDAR_AZ = MAIN_AZ;
export const LIDAR_ORIGIN = { n: N0, e: E0, z: 953.55 };
