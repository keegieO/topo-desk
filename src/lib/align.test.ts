import assert from "node:assert/strict";
import { test } from "node:test";
import { projectAlignment, staOffCsv } from "./align.ts";
import { stationOffset } from "./cogo.ts";
import type { LabeledShot } from "./label.ts";

function shot(point: string, n: number, e: number, z = 100): LabeledShot {
  return {
    uid: point,
    rowIndex: 0,
    point,
    northing: n,
    easting: e,
    elevation: z,
    description: "EP",
    issues: [],
    codeToken: "EP",
    remainder: "",
    matchId: null,
  };
}

test("longer centerline outranks a short edge", () => {
  const shots = [shot("1", 0, 0), shot("2", 500, 10)];
  const align = projectAlignment(shots, [
    { code: "EP", pts: [{ n: 0, e: 0, z: 0 }, { n: 40, e: 0, z: 0 }] },
    { code: "RC", pts: [{ n: 0, e: 0, z: 0 }, { n: 400, e: 0, z: 0 }] },
  ]);
  assert.equal(align?.name, "RC");
  const so = stationOffset(align!.pts, { n: 100, e: 12, z: 0 });
  assert.ok(so);
  assert.ok(Math.abs(so.station - 100) < 0.01);
  assert.ok(Math.abs(so.offset - 12) < 0.01);
});

test("fitted baseline when no ranked string exists", () => {
  const shots = [shot("1", 0, 0), shot("2", 0, 100), shot("3", 10, 50)];
  const align = projectAlignment(shots, []);
  assert.equal(align?.name, "BASE");
  assert.equal(align?.pts.length, 2);
  const csv = staOffCsv(shots, align);
  assert.match(csv, /^Point,Northing/);
  assert.match(csv, /1\+00\.00|0\+00\.00/);
});
