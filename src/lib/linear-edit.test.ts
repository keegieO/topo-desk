import assert from "node:assert/strict";
import { test } from "node:test";
import { extractAllLines, joinUserLines, offsetUserLine, splitUserLine } from "./linear-edit.ts";
import type { LabeledShot } from "./label.ts";

function shot(point: string, n: number, e: number, z: number, description: string, uid: string): LabeledShot {
  const parts = description.split(/\s+/);
  return {
    uid,
    rowIndex: Number(point),
    point,
    northing: n,
    easting: e,
    elevation: z,
    description,
    issues: [],
    codeToken: parts[0],
    remainder: parts.slice(1).join(" "),
    matchId: null,
  };
}

test("extract all promotes ST/END strings", () => {
  const shots = [
    shot("1", 0, 0, 1, "EP ST", "a"),
    shot("2", 10, 0, 1, "EP", "b"),
    shot("3", 20, 0, 1, "EP END", "c"),
  ];
  const lines = extractAllLines(shots, {}, [], "t");
  assert.equal(lines.length, 1);
  assert.equal(lines[0].code, "EP");
  assert.equal(lines[0].pts.length, 3);
});

test("extract all skips a line already extracted", () => {
  const shots = [
    shot("1", 0, 0, 1, "EP ST", "a"),
    shot("2", 10, 0, 1, "EP END", "b"),
  ];
  const first = extractAllLines(shots, {}, [], "t");
  const second = extractAllLines(shots, {}, first, "u");
  assert.equal(second.length, 0);
});

test("join / split / offset extract lines", () => {
  const a = { id: "a", code: "EP", pts: [{ n: 0, e: 0, z: 0 }, { n: 10, e: 0, z: 0 }], closed: false, source: "extract" as const };
  const b = { id: "b", code: "EP", pts: [{ n: 10, e: 0, z: 0 }, { n: 20, e: 0, z: 0 }], closed: false, source: "extract" as const };
  const j = joinUserLines(a, b, "j");
  assert.equal(j.pts.length, 3);
  const sp = splitUserLine(j, 1, "l", "r");
  assert.ok(sp);
  assert.equal(sp[0].pts.length, 2);
  const off = offsetUserLine(a, 2, "o");
  assert.ok(Math.abs(off.pts[0].n + 2) < 1e-6);
});
