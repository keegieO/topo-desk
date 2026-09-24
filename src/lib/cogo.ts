/** Conventional COGO: inverse, area, offset, station/offset, observation reduction, compass rule. */

export type Nez = { n: number; e: number; z?: number };

export function azimuthDeg(n0: number, e0: number, n1: number, e1: number): number {
  let az = (Math.atan2(e1 - e0, n1 - n0) * 180) / Math.PI;
  if (az < 0) az += 360;
  return az;
}

export function dmsParts(deg: number): { d: number; m: number; s: number; sign: number } {
  const sign = deg < 0 ? -1 : 1;
  let x = Math.abs(deg) + 1e-12;
  const d = Math.floor(x);
  x = (x - d) * 60;
  const m = Math.floor(x);
  const s = (x - m) * 60;
  return { d, m, s: s < 0 ? 0 : s, sign };
}

export function formatDms(deg: number, prec = 1): string {
  const { d, m, s, sign } = dmsParts(deg);
  const ss = s.toFixed(prec).padStart(prec ? 4 : 2, "0");
  return `${sign < 0 ? "-" : ""}${d}°${String(m).padStart(2, "0")}'${ss}"`;
}

export function bearingText(az: number): string {
  const a = ((az % 360) + 360) % 360;
  if (a < 1e-4 || a > 360 - 1e-4) return "Due North";
  if (Math.abs(a - 90) < 1e-4) return "Due East";
  if (Math.abs(a - 180) < 1e-4) return "Due South";
  if (Math.abs(a - 270) < 1e-4) return "Due West";
  if (a < 90) return `N ${formatDms(a)} E`;
  if (a < 180) return `S ${formatDms(180 - a)} E`;
  if (a < 270) return `S ${formatDms(a - 180)} W`;
  return `N ${formatDms(360 - a)} W`;
}

/** Carlson / TDS packed DMS: 35.15205 = 35°15'20.5" */
export function carlsonDmsToDeg(v: number): number {
  const sign = v < 0 ? -1 : 1;
  const x = Math.abs(v);
  const d = Math.floor(x + 1e-12);
  const m = Math.floor((x - d) * 100 + 1e-12);
  const s = ((x - d) * 100 - m) * 100;
  return sign * (d + m / 60 + s / 3600);
}

export function degToCarlsonDms(deg: number): number {
  const { d, m, s, sign } = dmsParts(deg);
  return sign * (d + m / 100 + s / 10000);
}

export type InverseResult = {
  dist: number;
  horiz: number;
  dN: number;
  dE: number;
  dZ: number;
  az: number;
  bearing: string;
  gradePct: number | null;
};

export function inverse(a: Nez, b: Nez): InverseResult {
  const dN = b.n - a.n;
  const dE = b.e - a.e;
  const dZ = (b.z ?? 0) - (a.z ?? 0);
  const horiz = Math.hypot(dN, dE);
  const dist = Math.hypot(horiz, dZ);
  const az = azimuthDeg(a.n, a.e, b.n, b.e);
  return {
    dist,
    horiz,
    dN,
    dE,
    dZ,
    az,
    bearing: bearingText(az),
    gradePct: horiz > 1e-6 ? (dZ / horiz) * 100 : null,
  };
}

export function polygonArea(pts: Nez[]): { area: number; perimeter: number } {
  if (pts.length < 3) return { area: 0, perimeter: 0 };
  let a = 0;
  let p = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    a += pts[i].e * pts[j].n - pts[j].e * pts[i].n;
    p += Math.hypot(pts[j].n - pts[i].n, pts[j].e - pts[i].e);
  }
  return { area: Math.abs(a) / 2, perimeter: p };
}

/** Positive dist offsets to the right of the directed polyline (surveyor's right). */
export function offsetLine(pts: Nez[], dist: number): Nez[] {
  if (pts.length < 2) return pts.map((p) => ({ ...p }));
  const out: Nez[] = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[i === 0 ? 0 : i - 1];
    const next = pts[i === pts.length - 1 ? i : i + 1];
    const dN = next.n - prev.n;
    const dE = next.e - prev.e;
    const len = Math.hypot(dN, dE) || 1;
    const rn = -dE / len;
    const re = dN / len;
    out.push({ n: pts[i].n + rn * dist, e: pts[i].e + re * dist, z: pts[i].z });
  }
  return out;
}

export type StaOff = {
  station: number;
  offset: number;
  z: number;
  on: boolean;
  index: number;
};

export function projectToSeg(
  a: Nez,
  b: Nez,
  p: Nez,
): { t: number; n: number; e: number; dist: number } {
  const dN = b.n - a.n;
  const dE = b.e - a.e;
  const len2 = dN * dN + dE * dE;
  const t = len2 < 1e-18 ? 0 : ((p.n - a.n) * dN + (p.e - a.e) * dE) / len2;
  const n = a.n + t * dN;
  const e = a.e + t * dE;
  return { t, n, e, dist: Math.hypot(p.n - n, p.e - e) };
}

export function stationOffset(line: Nez[], pt: Nez): StaOff | null {
  if (line.length < 2) return null;
  let bestDist = Infinity;
  let best: StaOff | null = null;
  let sta = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const seg = Math.hypot(b.n - a.n, b.e - a.e) || 1e-12;
    const pr = projectToSeg(a, b, pt);
    const tc = Math.max(0, Math.min(1, pr.t));
    const cn = a.n + tc * (b.n - a.n);
    const ce = a.e + tc * (b.e - a.e);
    const dist = Math.hypot(pt.n - cn, pt.e - ce);
    const rn = -(b.e - a.e) / seg;
    const re = (b.n - a.n) / seg;
    const offset = (pt.n - cn) * rn + (pt.e - ce) * re;
    if (dist < bestDist) {
      bestDist = dist;
      best = {
        station: sta + tc * seg,
        offset,
        z: pt.z ?? 0,
        on: pr.t >= -0.02 && pr.t <= 1.02,
        index: i - 1,
      };
    }
    sta += seg;
  }
  return best;
}

export function formatStation(ft: number): string {
  const sign = ft < 0 ? "-" : "";
  const a = Math.abs(ft);
  const hun = Math.floor(a / 100);
  const rem = a - hun * 100;
  return `${sign}${hun}+${rem.toFixed(2).padStart(5, "0")}`;
}

export function polylineLength(pts: Nez[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
  return d;
}

export type ReduceOpts = {
  occN: number;
  occE: number;
  occZ: number;
  hi: number;
  ht: number;
  haDeg: number;
  zenithDeg: number;
  sd: number;
  bsAzimuthDeg: number;
  angleRight: boolean;
};

export function reduceShot(opts: ReduceOpts): { n: number; e: number; z: number; az: number; hd: number } {
  const az = opts.angleRight ? (opts.bsAzimuthDeg + opts.haDeg) % 360 : opts.haDeg;
  const zRad = (opts.zenithDeg * Math.PI) / 180;
  const azRad = (az * Math.PI) / 180;
  const hd = opts.sd * Math.sin(zRad);
  const dZ = opts.sd * Math.cos(zRad) + opts.hi - opts.ht;
  return {
    n: opts.occN + hd * Math.cos(azRad),
    e: opts.occE + hd * Math.sin(azRad),
    z: opts.occZ + dZ,
    az: (az + 360) % 360,
    hd,
  };
}

export function compassRule(
  pts: Nez[],
  close: Nez,
): { pts: Nez[]; misN: number; misE: number; perimeter: number; ratio: number | null } {
  if (pts.length < 2) return { pts: pts.map((p) => ({ ...p })), misN: 0, misE: 0, perimeter: 0, ratio: null };
  const last = pts[pts.length - 1];
  const misN = close.n - last.n;
  const misE = close.e - last.e;
  const sides: number[] = [];
  let peri = 0;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
    sides.push(s);
    peri += s;
  }
  if (peri < 1e-9) return { pts: pts.map((p) => ({ ...p })), misN, misE, perimeter: peri, ratio: null };
  const out = [{ ...pts[0] }];
  let accN = 0;
  let accE = 0;
  for (let i = 1; i < pts.length; i++) {
    accN += (sides[i - 1] / peri) * misN;
    accE += (sides[i - 1] / peri) * misE;
    out.push({
      n: pts[i].n + accN,
      e: pts[i].e + accE,
      z: pts[i].z,
    });
  }
  const linear = Math.hypot(misN, misE);
  return { pts: out, misN, misE, perimeter: peri, ratio: linear > 1e-9 ? peri / linear : null };
}

export function intersectBearings(p1: Nez, az1: number, p2: Nez, az2: number): Nez | null {
  const r1 = (az1 * Math.PI) / 180;
  const r2 = (az2 * Math.PI) / 180;
  const dN1 = Math.cos(r1);
  const dE1 = Math.sin(r1);
  const dN2 = Math.cos(r2);
  const dE2 = Math.sin(r2);
  const den = dN1 * dE2 - dE1 * dN2;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((p2.n - p1.n) * dE2 - (p2.e - p1.e) * dN2) / den;
  return { n: p1.n + t * dN1, e: p1.e + t * dE1, z: p1.z };
}

export function nearestVertexIndex(pts: Nez[], n: number, e: number, maxFt = 8): number {
  let best = -1;
  let d = maxFt;
  for (let i = 0; i < pts.length; i++) {
    const dist = Math.hypot(pts[i].n - n, pts[i].e - e);
    if (dist < d) {
      d = dist;
      best = i;
    }
  }
  return best;
}

export function insertOnSegment(pts: Nez[], n: number, e: number, z: number, maxFt = 6): Nez[] | null {
  let bestI = -1;
  let bestD = maxFt;
  let best: Nez | null = null;
  for (let i = 1; i < pts.length; i++) {
    const pr = projectToSeg(pts[i - 1], pts[i], { n, e, z });
    if (pr.t <= 0.02 || pr.t >= 0.98) continue;
    const cn = pts[i - 1].n + pr.t * (pts[i].n - pts[i - 1].n);
    const ce = pts[i - 1].e + pr.t * (pts[i].e - pts[i - 1].e);
    const dist = Math.hypot(n - cn, e - ce);
    if (dist < bestD) {
      bestD = dist;
      bestI = i;
      const za = pts[i - 1].z ?? z;
      const zb = pts[i].z ?? z;
      best = { n: cn, e: ce, z: za + pr.t * (zb - za) };
    }
  }
  if (bestI < 0 || !best) return null;
  return [...pts.slice(0, bestI), best, ...pts.slice(bestI)];
}

export function joinPolylines(a: Nez[], b: Nez[]): Nez[] {
  if (!a.length) return b.map((p) => ({ ...p }));
  if (!b.length) return a.map((p) => ({ ...p }));
  const a0 = a[0];
  const a1 = a[a.length - 1];
  const b0 = b[0];
  const b1 = b[b.length - 1];
  const d = [
    { k: "a1b0" as const, v: Math.hypot(a1.n - b0.n, a1.e - b0.e) },
    { k: "a1b1" as const, v: Math.hypot(a1.n - b1.n, a1.e - b1.e) },
    { k: "a0b0" as const, v: Math.hypot(a0.n - b0.n, a0.e - b0.e) },
    { k: "a0b1" as const, v: Math.hypot(a0.n - b1.n, a0.e - b1.e) },
  ].sort((x, y) => x.v - y.v)[0];
  const A = a.map((p) => ({ ...p }));
  const B = b.map((p) => ({ ...p }));
  if (d.k === "a1b0") return [...A, ...B.slice(d.v < 0.05 ? 1 : 0)];
  if (d.k === "a1b1") return [...A, ...B.reverse().slice(d.v < 0.05 ? 1 : 0)];
  if (d.k === "a0b0") return [...A.reverse(), ...B.slice(d.v < 0.05 ? 1 : 0)];
  return [...A.reverse(), ...B.reverse().slice(d.v < 0.05 ? 1 : 0)];
}

export function splitPolyline(pts: Nez[], index: number): [Nez[], Nez[]] | null {
  if (index <= 0 || index >= pts.length - 1) return null;
  const left = pts.slice(0, index + 1).map((p) => ({ ...p }));
  const right = pts.slice(index).map((p) => ({ ...p }));
  if (left.length < 2 || right.length < 2) return null;
  return [left, right];
}

export type CogoKind = "inverse" | "area" | "staoff" | "offset" | "join";

export type CogoResult =
  | { kind: "inverse"; a: Nez; b: Nez; inv: InverseResult }
  | { kind: "area"; area: number; perimeter: number; acres: number }
  | { kind: "staoff"; station: number; offset: number; z: number; label: string }
  | { kind: "offset"; dist: number }
  | { kind: "join"; code: string };
