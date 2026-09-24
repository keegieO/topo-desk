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

export function generateLidarCloud(count = 14000): LidarPt[] {
  const out: LidarPt[] = [];
  const half = Math.floor(count * 0.72);
  for (let i = 0; i < half; i++) {
    const along = -1200 + hash(i) * 2400;
    const lane = hash(i + 3);
    let offset: number;
    let cls: LidarClass;
    let zOff = 0;
    if (lane < 0.5) {
      offset = (hash(i + 7) - 0.5) * 44;
      cls = "ground";
      zOff = 0;
    } else if (lane < 0.72) {
      offset = 50 + hash(i + 11) * 70;
      if (hash(i + 13) < 0.5) offset *= -1;
      cls = "veg";
      zOff = 2 + hash(i + 17) * 16;
    } else if (lane < 0.82) {
      offset = (hash(i + 19) < 0.5 ? -1 : 1) * (85 + hash(i + 23) * 35);
      cls = "building";
      zOff = 8 + hash(i + 29) * 12;
    } else if (lane < 0.94) {
      offset = -42 + (hash(i + 31) - 0.5) * 5;
      cls = "wire";
      zOff = 18 + hash(i + 37) * 6;
    } else {
      offset = (hash(i + 41) - 0.5) * 140;
      cls = "noise";
      zOff = hash(i + 43) * 28;
    }
    const p = projectOffset(N0, E0, along, offset, MAIN_AZ);
    out.push({ n: p.n, e: p.e, z: roadZ(along, offset) + zOff, cls });
  }
  for (let i = half; i < count; i++) {
    const along = -700 + hash(i) * 1400;
    const lane = hash(i + 5);
    let offset: number;
    let cls: LidarClass;
    let zOff = 0;
    if (lane < 0.55) {
      offset = (hash(i + 9) - 0.5) * 40;
      cls = "ground";
    } else if (lane < 0.78) {
      offset = 48 + hash(i + 15) * 50;
      if (hash(i + 21) < 0.5) offset *= -1;
      cls = "veg";
      zOff = 2 + hash(i + 27) * 14;
    } else if (lane < 0.88) {
      offset = (hash(i + 33) < 0.5 ? -1 : 1) * (80 + hash(i + 39) * 30);
      cls = "building";
      zOff = 7 + hash(i + 45) * 10;
    } else {
      offset = (hash(i + 51) - 0.5) * 100;
      cls = "noise";
      zOff = hash(i + 57) * 20;
    }
    const p = projectOffset(N0, E0, along, offset, CROSS_AZ);
    out.push({ n: p.n, e: p.e, z: roadZ(0, offset) + along * 0.0004 + zOff, cls });
  }
  return out;
}

let cached: LidarPt[] | null = null;
let grid: Map<string, LidarPt[]> | null = null;
let gridFor: LidarPt[] | null = null;
const CELL = 25;

function cellKey(n: number, e: number): string {
  return `${Math.floor(n / CELL)}:${Math.floor(e / CELL)}`;
}

function ensureGrid(cloud: LidarPt[]) {
  if (grid && gridFor === cloud) return;
  grid = new Map();
  gridFor = cloud;
  for (const p of cloud) {
    const k = cellKey(p.n, p.e);
    const arr = grid.get(k);
    if (arr) arr.push(p);
    else grid.set(k, [p]);
  }
}

export function lidarCloud(): LidarPt[] {
  if (!cached) cached = generateLidarCloud();
  return cached;
}

export function displayCloud(userPts: LidarPt[], originN: number, originE: number): LidarPt[] {
  if (userPts.length) return userPts;
  if (Math.hypot(originN - N0, originE - E0) < 40_000) return lidarCloud();
  return [];
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
