import { buildChains, chainVertices, type UserLine, type Vertex } from "./chains";
import { joinPolylines, offsetLine, splitPolyline, type Nez } from "./cogo";
import type { LabeledShot } from "./label";

function asNez(v: Vertex): Nez {
  return { n: v.n, e: v.e, z: v.z };
}

function fromNez(p: Nez, uid?: string): Vertex {
  return { n: p.n, e: p.e, z: p.z ?? 0, uid };
}

function similar(a: Vertex[], b: Vertex[]): boolean {
  if (a.length < 2 || b.length < 2) return false;
  const a0 = a[0];
  const a1 = a[a.length - 1];
  const b0 = b[0];
  const b1 = b[b.length - 1];
  const d00 = Math.hypot(a0.n - b0.n, a0.e - b0.e);
  const d11 = Math.hypot(a1.n - b1.n, a1.e - b1.e);
  const d01 = Math.hypot(a0.n - b1.n, a0.e - b1.e);
  const d10 = Math.hypot(a1.n - b0.n, a1.e - b0.e);
  return (d00 < 0.2 && d11 < 0.2) || (d01 < 0.2 && d10 < 0.2);
}

export function extractAllLines(
  shots: LabeledShot[],
  remaps: Record<string, string>,
  existing: UserLine[],
  idBase = "x",
): UserLine[] {
  const chains = buildChains(shots, remaps);
  const extra: UserLine[] = [];
  let seq = existing.length + 1;
  for (const c of chains) {
    const verts = chainVertices(c).map((v) => ({ n: v.n, e: v.e, z: v.z }));
    if (verts.length < 2) continue;
    if (existing.some((l) => l.code === c.code && similar(l.pts, verts))) continue;
    if (extra.some((l) => l.code === c.code && similar(l.pts, verts))) continue;
    extra.push({
      id: `${idBase}${seq++}`,
      code: c.code,
      pts: verts,
      closed: c.closed,
      source: "extract",
    });
  }
  return extra;
}

export function joinUserLines(a: UserLine, b: UserLine, id: string): UserLine {
  const pts = joinPolylines(a.pts.map(asNez), b.pts.map(asNez)).map((p) => fromNez(p));
  return {
    id,
    code: a.code || b.code,
    pts,
    closed: false,
    source: "extract",
  };
}

export function splitUserLine(line: UserLine, index: number, idA: string, idB: string): UserLine[] | null {
  const parts = splitPolyline(line.pts.map(asNez), index);
  if (!parts) return null;
  return [
    { id: idA, code: line.code, pts: parts[0].map((p) => fromNez(p)), closed: false, source: "extract" },
    { id: idB, code: line.code, pts: parts[1].map((p) => fromNez(p)), closed: false, source: "extract" },
  ];
}

export function offsetUserLine(line: UserLine, dist: number, id: string): UserLine {
  return {
    id,
    code: line.code,
    pts: offsetLine(line.pts.map(asNez), dist).map((p) => fromNez(p)),
    closed: line.closed,
    source: "extract",
  };
}

export function extractChainById(
  shots: LabeledShot[],
  remaps: Record<string, string>,
  chainId: string,
  existing: UserLine[],
  id: string,
): UserLine | null {
  const chains = buildChains(shots, remaps);
  const c = chains.find((x) => x.id === chainId);
  if (!c) return null;
  const verts = chainVertices(c).map((v) => ({ n: v.n, e: v.e, z: v.z }));
  if (verts.length < 2) return null;
  if (existing.some((l) => l.code === c.code && similar(l.pts, verts))) return null;
  return { id, code: c.code, pts: verts, closed: c.closed, source: "extract" };
}
