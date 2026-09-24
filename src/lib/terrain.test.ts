import assert from "node:assert/strict";
import { test } from "node:test";
import { buildContours, constrainEdges, delaunay, type TinPt } from "./tin.ts";

test("delaunay of a square yields two triangles", () => {
  const pts: TinPt[] = [
    { n: 0, e: 0, z: 0 },
    { n: 0, e: 10, z: 0 },
    { n: 10, e: 10, z: 10 },
    { n: 10, e: 0, z: 10 },
  ];
  const tris = delaunay(pts);
  assert.equal(tris.length, 2);
});

test("contours cross a sloping square", () => {
  const pts: TinPt[] = [
    { n: 0, e: 0, z: 0 },
    { n: 0, e: 10, z: 0 },
    { n: 10, e: 10, z: 10 },
    { n: 10, e: 0, z: 10 },
  ];
  const tris = delaunay(pts);
  const c = buildContours(pts, tris, 5);
  assert.ok(c.length >= 1);
  assert.ok(c.every((r) => r.pts.length >= 2));
});

test("constraint keeps the breakline as an edge", () => {
  const pts: TinPt[] = [
    { n: 0, e: 0, z: 0 },
    { n: 0, e: 10, z: 0 },
    { n: 10, e: 10, z: 0 },
    { n: 10, e: 0, z: 0 },
  ];
  const tris = constrainEdges(pts, delaunay(pts), [[0, 2]]);
  const has = tris.some((t) => {
    const s = new Set([t.a, t.b, t.c]);
    return s.has(0) && s.has(2);
  });
  assert.equal(has, true);
});
