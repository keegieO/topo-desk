import assert from "node:assert/strict";
import { test } from "node:test";
import { detectFieldbookFormat, parseFieldbook } from "./fieldbook.ts";

const RW5 = `JB,NMTESTJOB
MO,AD0,UN1
SP,PN1,N 1000.0000,E 2000.0000,EL100.000,--PRE
OC,OP1
BK,OP1,BP2,BS0.0000
LS,HI5.000,HR5.000
SS,OP1,FP10,AR90.0000,ZE90.0000,SD100.0000,--EP ST
`;

test("detects RW5", () => {
  assert.equal(detectFieldbookFormat(RW5, "job.rw5"), "rw5");
  assert.equal(detectFieldbookFormat("P,N,E,Z,D\n1,1,2,3,EP", "a.csv"), "csv");
});

test("reduces RW5 sideshot to coordinates", () => {
  const book = parseFieldbook(RW5, "job.rw5");
  assert.equal(book.format, "rw5");
  const ep = book.shots.find((s) => s.point === "10");
  assert.ok(ep);
  assert.ok(Math.abs(ep.northing - 1000) < 0.02);
  assert.ok(Math.abs(ep.easting - 2100) < 0.02);
  assert.ok(Math.abs(ep.elevation - 100) < 0.02);
  assert.match(ep.description, /EP/);
  const pre = book.shots.find((s) => s.point === "1");
  assert.ok(pre);
});

test("parses FBK occupy and store", () => {
  const raw = `! InRoads fieldbook
ST 1 1000 2000 100
BK 2 0.0000
F1 10 90.0000 90.0000 50.0000 EP ST
`;
  const book = parseFieldbook(raw, "job.fbk");
  assert.equal(book.format, "fbk");
  const occ = book.shots.find((s) => s.point === "1");
  assert.ok(occ);
  assert.equal(occ.northing, 1000);
});

test("parses JobXML point records", () => {
  const xml = `<?xml version="1.0"?><JobXML>
<PointRecord><PointNumber>7</PointNumber><Grid><North>10</North><East>20</East><Elevation>5</Elevation></Grid><Code>PRE</Code></PointRecord>
</JobXML>`;
  const book = parseFieldbook(xml, "job.jxl");
  assert.equal(book.format, "jxl");
  assert.equal(book.shots.length, 1);
  assert.equal(book.shots[0].point, "7");
  assert.equal(book.shots[0].northing, 10);
  assert.equal(book.shots[0].description, "PRE");
});
