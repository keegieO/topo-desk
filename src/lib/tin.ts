export type TinPt = { n: number; e: number; z: number };
export type Triangle = { a: number; b: number; c: number };
export type ContourRing = { z: number; index: boolean; pts: { n: number; e: number }[] };

function circumcircle(pts: TinPt[], a: number, b: number, c: number): { n: number; e: number; r2: number } | null {
  const ax = pts[a].e;
  const ay = pts[a].n;
  const bx = pts[b].e;
  const by = pts[b].n;
  const cx = pts[c].e;
  const cy = pts[c].n;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-18) return null;
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const e = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const n = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const r2 = (ax - e) ** 2 + (ay - n) ** 2;
  return { n, e, r2 };
}

export function delaunay(pts: TinPt[]): Triangle[] {
  if (pts.length < 3) return [];
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
  const d = Math.max(maxN - minN, maxE - minE, 1) * 20;
  const superPts: TinPt[] = [
    { n: minN - d, e: minE - d, z: 0 },
    { n: minN - d, e: maxE + d * 2, z: 0 },
    { n: maxN + d * 2, e: minE - d, z: 0 },
  ];
  const all = pts.concat(superPts);
  const s0 = pts.length;
  const s1 = pts.length + 1;
  const s2 = pts.length + 2;
  let tris: Triangle[] = [{ a: s0, b: s1, c: s2 }];

  for (let i = 0; i < pts.length; i++) {
    const bad: number[] = [];
    for (let t = 0; t < tris.length; t++) {
      const tri = tris[t];
      const cc = circumcircle(all, tri.a, tri.b, tri.c);
      if (!cc) continue;
      const dx = pts[i].e - cc.e;
      const dy = pts[i].n - cc.n;
      if (dx * dx + dy * dy <= cc.r2 + 1e-9) bad.push(t);
    }
    const edges: [number, number][] = [];
    const pushEdge = (u: number, v: number) => {
      for (let k = 0; k < edges.length; k++) {
        if ((edges[k][0] === v && edges[k][1] === u) || (edges[k][0] === u && edges[k][1] === v)) {
          edges.splice(k, 1);
          return;
        }
      }
      edges.push([u, v]);
    };
    for (const t of bad) {
      const tri = tris[t];
      pushEdge(tri.a, tri.b);
      pushEdge(tri.b, tri.c);
      pushEdge(tri.c, tri.a);
    }
    const keep = tris.filter((_, idx) => !bad.includes(idx));
    for (const [u, v] of edges) keep.push({ a: u, b: v, c: i });
    tris = keep;
  }

  return tris.filter((t) => t.a < pts.length && t.b < pts.length && t.c < pts.length);
}

function orient(pts: TinPt[], i: number, j: number, k: number): number {
  const a = pts[i];
  const b = pts[j];
  const c = pts[k];
  return (b.e - a.e) * (c.n - a.n) - (b.n - a.n) * (c.e - a.e);
}

function crosses(pts: TinPt[], a: number, b: number, c: number, d: number): boolean {
  if (a === c || a === d || b === c || b === d) return false;
  return orient(pts, a, b, c) * orient(pts, a, b, d) < 0 && orient(pts, c, d, a) * orient(pts, c, d, b) < 0;
}

/** Force breakline segments to be triangle edges so the surface cannot cut across them. */
export function constrainEdges(pts: TinPt[], tris: Triangle[], edges: [number, number][]): Triangle[] {
  const mesh = tris.map((t) => ({ a: t.a, b: t.b, c: t.c }));
  const key = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);

  const index = () => {
    const em = new Map<string, number[]>();
    const add = (a: number, b: number, i: number) => {
      const k = key(a, b);
      const list = em.get(k);
      if (list) list.push(i);
      else em.set(k, [i]);
    };
    for (let i = 0; i < mesh.length; i++) {
      const t = mesh[i];
      add(t.a, t.b, i);
      add(t.b, t.c, i);
      add(t.c, t.a, i);
    }
    return em;
  };

  let em = index();

  const flip = (u: number, v: number) => {
    const ids = em.get(key(u, v));
    if (!ids || ids.length !== 2) return false;
    const t0 = mesh[ids[0]];
    const t1 = mesh[ids[1]];
    const p = t0.a !== u && t0.a !== v ? t0.a : t0.b !== u && t0.b !== v ? t0.b : t0.c;
    const q = t1.a !== u && t1.a !== v ? t1.a : t1.b !== u && t1.b !== v ? t1.b : t1.c;
    if (orient(pts, p, q, u) * orient(pts, p, q, v) >= 0) return false;
    mesh[ids[0]] = { a: p, b: q, c: u };
    mesh[ids[1]] = { a: p, b: q, c: v };
    em = index();
    return true;
  };

  for (const [ia, ib] of edges) {
    if (ia === ib || em.has(key(ia, ib))) continue;
    const boxN0 = Math.min(pts[ia].n, pts[ib].n) - 1;
    const boxN1 = Math.max(pts[ia].n, pts[ib].n) + 1;
    const boxE0 = Math.min(pts[ia].e, pts[ib].e) - 1;
    const boxE1 = Math.max(pts[ia].e, pts[ib].e) + 1;
    let guard = 0;
    while (!em.has(key(ia, ib)) && guard++ < 48) {
      let flipped = false;
      for (const [k, ids] of em) {
        if (ids.length !== 2) continue;
        const cut = k.indexOf(":");
        const u = Number(k.slice(0, cut));
        const v = Number(k.slice(cut + 1));
        const ue = pts[u].e;
        const un = pts[u].n;
        const ve = pts[v].e;
        const vn = pts[v].n;
        if (Math.max(ue, ve) < boxE0 || Math.min(ue, ve) > boxE1 || Math.max(un, vn) < boxN0 || Math.min(un, vn) > boxN1) continue;
        if (!crosses(pts, ia, ib, u, v)) continue;
        if (flip(u, v)) {
          flipped = true;
          break;
        }
      }
      if (!flipped) break;
    }
  }
  return mesh;
}

function interp(a: TinPt, b: TinPt, z: number): { n: number; e: number } | null {
  const dz = b.z - a.z;
  if (Math.abs(dz) < 1e-12) return null;
  const t = (z - a.z) / dz;
  if (t < -1e-9 || t > 1 + 1e-9) return null;
  const u = Math.max(0, Math.min(1, t));
  return { n: a.n + u * (b.n - a.n), e: a.e + u * (b.e - a.e) };
}

export function buildContours(pts: TinPt[], tris: Triangle[], interval: number): ContourRing[] {
  if (!pts.length || !tris.length || interval <= 0) return [];
  let zmin = Infinity;
  let zmax = -Infinity;
  for (const p of pts) {
    if (p.z < zmin) zmin = p.z;
    if (p.z > zmax) zmax = p.z;
  }
  const start = Math.ceil((zmin + 1e-6) / interval) * interval;
  const out: ContourRing[] = [];
  for (let z = start; z <= zmax + 1e-6; z += interval) {
    const index = Math.abs(z / (interval * 5) - Math.round(z / (interval * 5))) < 1e-6;
    for (const t of tris) {
      const A = pts[t.a];
      const B = pts[t.b];
      const C = pts[t.c];
      const hits: { n: number; e: number }[] = [];
      const ab = interp(A, B, z);
      const bc = interp(B, C, z);
      const ca = interp(C, A, z);
      if (ab) hits.push(ab);
      if (bc) hits.push(bc);
      if (ca) hits.push(ca);
      if (hits.length === 2) out.push({ z, index, pts: [hits[0], hits[1]] });
    }
  }
  return stitch(out);
}

function pkey(p: { n: number; e: number }): string {
  return `${p.e.toFixed(2)}:${p.n.toFixed(2)}`;
}

function stitch(segs: ContourRing[]): ContourRing[] {
  const groups = new Map<string, ContourRing[]>();
  for (const s of segs) {
    if (s.pts.length < 2) continue;
    const k = `${s.z.toFixed(2)}:${s.index ? 1 : 0}`;
    const list = groups.get(k) ?? [];
    list.push(s);
    groups.set(k, list);
  }
  const rings: ContourRing[] = [];
  for (const list of groups.values()) {
    const unused = list.map((s) => ({ a: s.pts[0], b: s.pts[s.pts.length - 1], used: false }));
    const z = list[0].z;
    const index = list[0].index;
    const at = new Map<string, number[]>();
    unused.forEach((s, i) => {
      for (const p of [s.a, s.b]) {
        const k = pkey(p);
        const ids = at.get(k) ?? [];
        ids.push(i);
        at.set(k, ids);
      }
    });
    const take = (end: { n: number; e: number }): { n: number; e: number } | null => {
      const ids = at.get(pkey(end)) ?? [];
      for (const id of ids) {
        if (unused[id].used) continue;
        const s = unused[id];
        unused[id].used = true;
        if (pkey(s.a) === pkey(end)) return s.b;
        if (pkey(s.b) === pkey(end)) return s.a;
        unused[id].used = false;
      }
      return null;
    };
    for (let i = 0; i < unused.length; i++) {
      if (unused[i].used) continue;
      unused[i].used = true;
      const pts = [unused[i].a, unused[i].b];
      let nxt = take(pts[pts.length - 1]);
      let guard = 0;
      while (nxt && guard++ < 8000) {
        pts.push(nxt);
        nxt = take(pts[pts.length - 1]);
      }
      nxt = take(pts[0]);
      guard = 0;
      while (nxt && guard++ < 8000) {
        pts.unshift(nxt);
        nxt = take(pts[0]);
      }
      rings.push({ z, index, pts });
    }
  }
  return rings;
}

export function sampleElevation(pts: TinPt[], tris: Triangle[], n: number, e: number): number | null {
  for (const t of tris) {
    const A = pts[t.a];
    const B = pts[t.b];
    const C = pts[t.c];
    const den = (B.e - A.e) * (C.n - A.n) - (C.e - A.e) * (B.n - A.n);
    if (Math.abs(den) < 1e-9) continue;
    const w1 = ((e - A.e) * (C.n - A.n) - (C.e - A.e) * (n - A.n)) / den;
    const w2 = ((B.e - A.e) * (n - A.n) - (e - A.e) * (B.n - A.n)) / den;
    const w0 = 1 - w1 - w2;
    if (w0 >= -1e-3 && w1 >= -1e-3 && w2 >= -1e-3) return w0 * A.z + w1 * B.z + w2 * C.z;
  }
  return null;
}
