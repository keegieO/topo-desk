import assert from "node:assert/strict";
import { test } from "node:test";
import {
  azimuthDeg,
  bearingText,
  carlsonDmsToDeg,
  compassRule,
  formatStation,
  inverse,
  offsetLine,
  polygonArea,
  reduceShot,
  stationOffset,
  joinPolylines,
  splitPolyline,
} from "./cogo.ts";

test("azimuth north and east", () => {
  assert.equal(Math.round(azimuthDeg(0, 0, 10, 0)), 0);
  assert.equal(Math.round(azimuthDeg(0, 0, 0, 10)), 90);
});

test("bearing text quadrants", () => {
  assert.equal(bearingText(0), "Due North");
  assert.match(bearingText(35), /N .+ E/);
});

test("carlson packed DMS", () => {
  const deg = carlsonDmsToDeg(35.15205);
  assert.ok(Math.abs(deg - (35 + 15 / 60 + 20.5 / 3600)) < 1e-6);
});

test("inverse 3-4-5", () => {
  const inv = inverse({ n: 0, e: 0, z: 0 }, { n: 3, e: 4, z: 0 });
  assert.equal(inv.horiz, 5);
  assert.ok(Math.abs(inv.az - 53.1301) < 0.01);
});

test("polygon area 10x10", () => {
  const { area, perimeter } = polygonArea([
    { n: 0, e: 0 },
    { n: 10, e: 0 },
    { n: 10, e: 10 },
    { n: 0, e: 10 },
  ]);
  assert.equal(area, 100);
  assert.equal(perimeter, 40);
});

test("offset right 2 ft", () => {
  const off = offsetLine(
    [
      { n: 0, e: 0 },
      { n: 10, e: 0 },
    ],
    2,
  );
  assert.ok(Math.abs(off[0].n) < 1e-6);
  assert.ok(Math.abs(off[0].e - 2) < 1e-6);
});

test("station/offset on a northing line", () => {
  const so = stationOffset(
    [
      { n: 0, e: 0 },
      { n: 100, e: 0 },
    ],
    { n: 40, e: 5 },
  );
  assert.ok(so);
  assert.ok(Math.abs(so.station - 40) < 1e-6);
  assert.ok(Math.abs(so.offset - 5) < 1e-6);
});

test("format station", () => {
  assert.equal(formatStation(123.4), "1+23.40");
});

test("reduce zenith 90 azimuth 90", () => {
  const r = reduceShot({
    occN: 1000,
    occE: 2000,
    occZ: 100,
    hi: 5,
    ht: 5,
    haDeg: 90,
    zenithDeg: 90,
    sd: 100,
    bsAzimuthDeg: 0,
    angleRight: false,
  });
  assert.ok(Math.abs(r.n - 1000) < 1e-6);
  assert.ok(Math.abs(r.e - 2100) < 1e-6);
  assert.ok(Math.abs(r.z - 100) < 1e-6);
});

test("compass rule closes a loop", () => {
  const pts = [
    { n: 0, e: 0 },
    { n: 100, e: 0 },
    { n: 100.2, e: 100 },
    { n: 0.1, e: 100.1 },
    { n: 0.2, e: 0.15 },
  ];
  const adj = compassRule(pts, { n: 0, e: 0 });
  const last = adj.pts[adj.pts.length - 1];
  assert.ok(Math.abs(last.n) < 1e-6);
  assert.ok(Math.abs(last.e) < 1e-6);
  assert.ok(adj.ratio && adj.ratio > 50);
});

test("join and split polylines", () => {
  const joined = joinPolylines(
    [
      { n: 0, e: 0 },
      { n: 10, e: 0 },
    ],
    [
      { n: 10, e: 0 },
      { n: 20, e: 0 },
    ],
  );
  assert.equal(joined.length, 3);
  const split = splitPolyline(joined, 1);
  assert.ok(split);
  assert.equal(split[0].length, 2);
  assert.equal(split[1].length, 2);
});
