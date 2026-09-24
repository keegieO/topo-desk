import { dist2d } from "./geo";
import type { LabeledShot } from "./label";
import type { Vertex } from "./chains";

export function nearestShot(
  n: number,
  e: number,
  shots: LabeledShot[],
  maxFt = 8,
): LabeledShot | null {
  let best: LabeledShot | null = null;
  let bestD = maxFt;
  for (const s of shots) {
    const d = dist2d({ northing: n, easting: e }, s);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function snapVertex(
  n: number,
  e: number,
  z: number,
  shots: LabeledShot[],
  maxFt = 8,
): Vertex {
  const hit = nearestShot(n, e, shots, maxFt);
  if (!hit) return { n, e, z };
  return { n: hit.northing, e: hit.easting, z: hit.elevation, uid: hit.uid };
}

export function nearestElevation(n: number, e: number, shots: LabeledShot[], fallback = 0): number {
  const hit = nearestShot(n, e, shots, 1e9);
  return hit ? hit.elevation : fallback;
}
