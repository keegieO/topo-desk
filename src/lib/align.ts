import { formatStation, stationOffset, type Nez } from "./cogo.ts";
import type { LabeledShot } from "./label";

const RANK: Record<string, number> = {
  CL: 6,
  RC: 5,
  EP: 4,
  EOP: 4,
  ES: 3,
  EOS: 3,
  DL: 2,
  FL: 2,
};

export type Alignment = {
  name: string;
  pts: Nez[];
};

/** Survey alignment: INDOT centerline / edge string, else a fitted baseline. */
export function projectAlignment(
  shots: LabeledShot[],
  chains: { code: string; pts: Nez[] }[],
): Alignment | null {
  let best: { score: number; pts: Nez[]; code: string } | null = null;
  for (const chain of chains) {
    const pts = chain.pts;
    if (pts.length < 2) continue;
    const rank = RANK[chain.code.toUpperCase()] ?? 0;
    if (!rank) continue;
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
    }
    const score = rank * 1_000_000 + len;
    if (!best || score > best.score) best = { score, pts, code: chain.code.toUpperCase() };
  }
  if (best) return { name: best.code, pts: best.pts };
  return fitBaseline(shots);
}

function fitBaseline(shots: LabeledShot[]): Alignment | null {
  if (shots.length < 2) return null;
  let n = 0;
  let e = 0;
  for (const s of shots) {
    n += s.northing;
    e += s.easting;
  }
  n /= shots.length;
  e /= shots.length;
  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (const s of shots) {
    const dx = s.easting - e;
    const dy = s.northing - n;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }
  const theta = 0.5 * Math.atan2(2 * xy, xx - yy);
  const de = Math.cos(theta);
  const dn = Math.sin(theta);
  let min = Infinity;
  let max = -Infinity;
  let z0 = shots[0].elevation;
  let z1 = shots[0].elevation;
  for (const s of shots) {
    const t = (s.easting - e) * de + (s.northing - n) * dn;
    if (t < min) {
      min = t;
      z0 = s.elevation;
    }
    if (t > max) {
      max = t;
      z1 = s.elevation;
    }
  }
  if (!(max - min > 1)) return null;
  return {
    name: "BASE",
    pts: [
      { e: e + de * min, n: n + dn * min, z: z0 },
      { e: e + de * max, n: n + dn * max, z: z1 },
    ],
  };
}

export function staOffCsv(shots: LabeledShot[], align: Alignment | null): string {
  const rows = ["Point,Northing,Easting,Elevation,Code,Station,Offset"];
  for (const s of shots) {
    const so = align ? stationOffset(align.pts, { n: s.northing, e: s.easting, z: s.elevation }) : null;
    rows.push(
      [
        s.point,
        s.northing.toFixed(4),
        s.easting.toFixed(4),
        s.elevation.toFixed(4),
        s.codeToken,
        so ? formatStation(so.station) : "",
        so ? so.offset.toFixed(3) : "",
      ].join(","),
    );
  }
  return rows.join("\r\n") + "\r\n";
}

export function formatOffset(ft: number): string {
  const side = ft < -0.005 ? "L" : ft > 0.005 ? "R" : "";
  return `${Math.abs(ft).toFixed(2)}${side ? " " + side : ""}`;
}
