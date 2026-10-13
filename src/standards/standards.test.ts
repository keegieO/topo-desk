import assert from "node:assert/strict";
import { test } from "node:test";
import { CAT_LEVEL, CODE_LEVEL, fishbeckLayer, fishbeckLevel } from "../lib/fishbeck.ts";
import {
  DEFAULT_PACK_ID,
  GENERIC_PACK_ID,
  displayStyle,
  draftLabel,
  getPack,
  layerName,
  listPacks,
  packIdForJob,
  packIdForState,
  packWarning,
  rawPack,
  usesGenericFallback,
} from "./loader.ts";
import { STATE_REGISTRY } from "./registry.ts";
import { drainageCsv, drainageTables, parseAttrs, signInventory, utilityLabel } from "./drainage.ts";
import { SECTION_IDS } from "./schema.ts";
import { symbolSvg } from "./symbols.ts";

test("every pack validates and has a source for every table row", () => {
  for (const pack of listPacks()) {
    const ids = new Set(pack.sources.map((s) => s.id));
    const rows = [...pack.levels, ...pack.features, ...pack.symbols, ...pack.lineStyles, ...pack.deliverables, ...pack.crs];
    for (const r of rows) assert.ok(ids.has(r.sourceId), `${pack.id}: unknown sourceId ${r.sourceId}`);
    if (pack.legal) assert.ok(ids.has(pack.legal.sourceId), `${pack.id}: legal sourceId`);
    for (const k of Object.keys(pack.status)) assert.ok((SECTION_IDS as readonly string[]).includes(k));
  }
});

test("first 10 states are registered and all 51 jurisdictions are listed", () => {
  assert.equal(STATE_REGISTRY.length, 51);
  const withPacks = STATE_REGISTRY.filter((s) => s.packId);
  assert.deepEqual(withPacks.map((s) => s.usps).sort(), ["FL", "IL", "IN", "KY", "MI", "OH", "PA", "TN", "TX", "WI"]);
  for (const s of withPacks) assert.ok(rawPack(s.packId!), `pack ${s.packId} exists`);
});

test("Indiana pack resolves every code exactly like the original INDOT level map", () => {
  const pack = getPack(DEFAULT_PACK_ID);
  const codes = [...Object.keys(CODE_LEVEL), "EP1", "EP12", "RC3", "PPOL7", "ZZZ", "", "unknown"];
  for (const code of codes) {
    assert.equal(layerName(pack, code), fishbeckLayer(code), `layer for ${code}`);
    for (const cat of [...Object.keys(CAT_LEVEL), "NotACategory"]) {
      assert.equal(layerName(pack, code, cat), fishbeckLayer(code, cat), `layer for ${code}/${cat}`);
      assert.equal(displayStyle(pack, code, cat).color, fishbeckLevel(code, cat).color.toLowerCase(), `color for ${code}/${cat}`);
      assert.equal(displayStyle(pack, code, cat).weight, fishbeckLevel(code, cat).weight, `weight for ${code}/${cat}`);
    }
  }
});

test("unsourced state packs fall back to the generic pack and say so", () => {
  for (const usps of ["OH", "KY", "IL", "MI", "TN", "PA", "WI", "TX", "FL"]) {
    const id = packIdForState(usps);
    assert.ok(usesGenericFallback(id), `${usps} uses generic fallback`);
    assert.equal(getPack(id).features.length, getPack(GENERIC_PACK_ID).features.length);
    assert.match(packWarning(id) ?? "", /generic/i);
    assert.ok(rawPack(id)!.sources.every((s) => s.url?.startsWith("https://")), `${usps} sources are official URLs`);
  }
  assert.equal(packIdForState("WY"), GENERIC_PACK_ID);
  assert.equal(packIdForJob(undefined), DEFAULT_PACK_ID);
  assert.equal(packIdForJob({ standards: { state: "TX" } }), "us-tx-txdot");
});

test("generic pack uses APWA colors for utility layers", () => {
  const g = getPack(GENERIC_PACK_ID);
  const rgb = (n: string) => g.levels.find((l) => l.name === n)?.rgb;
  assert.deepEqual(rgb("V-UTIL-ELEC"), [255, 0, 0]);
  assert.deepEqual(rgb("V-UTIL-WATR"), [0, 0, 255]);
  assert.deepEqual(rgb("V-UTIL-SSWR"), [0, 128, 0]);
  assert.equal(layerName(g, "EP"), "V-ROAD-EDGE");
});

test("draft label fills PS details and state name", () => {
  const label = draftLabel(getPack("us-oh-odot"), { standards: { state: "OH", psName: "Jane Doe", psLicense: "S-1234" } });
  assert.match(label, /Jane Doe, Ohio PS S-1234/);
  assert.match(label, /NOT A CERTIFIED DOCUMENT/);
});

test("parseAttrs reads KEY=VALUE and KEY:VALUE tokens", () => {
  assert.deepEqual(parseAttrs('INL TYPE=inlet RIM:812.40 inv_out=806.2 TEXT="SPEED 45"'), {
    type: "inlet",
    rim: "812.40",
    inv_out: "806.2",
    text: "SPEED 45",
  });
});

test("drainage table computes pipe length and slope, and flags uphill pipes", () => {
  const pts = [
    { id: "100", code: "INL", n: 1000, e: 1000, desc: "INL RIM=812.40 INV_OUT=806.20 TO=101 SIZE=15 MATERIAL=RCP" },
    { id: "101", code: "SMH", n: 1000, e: 1100, desc: "SMH RIM=811.00 INV_IN=805.20 INV_OUT=805.00 TO=102" },
    { id: "102", code: "SMH", n: 1000, e: 1150, desc: "SMH RIM=810.00 INV_IN=806.00" },
  ];
  const t = drainageTables(pts, (c) => c === "INL" || c === "SMH");
  assert.equal(t.pipes.length, 2);
  assert.equal(t.pipes[0].length, 100);
  assert.equal(t.pipes[0].slope, 0.01);
  assert.equal(t.structures[0].depth, 6.2);
  assert.ok(t.flags.some((f) => f.severity === "error" && /uphill/.test(f.message)), "101→102 flows uphill");
  assert.match(drainageCsv(t), /Flags for PS review/);
});

test("sign inventory flags signs without MUTCD codes", () => {
  const s = signInventory(
    [
      { id: "5", code: "PSGN", n: 1, e: 2, desc: "PSGN MUTCD=r1-1 POST=single" },
      { id: "6", code: "PSGN", n: 3, e: 4, desc: "PSGN" },
    ],
    (c) => c === "PSGN",
  );
  assert.equal(s.rows[0].mutcd, "R1-1");
  assert.equal(s.flags.length, 1);
});

test("utility label shows ASCE 38 quality level", () => {
  assert.equal(utilityLabel("water", { size: "12", material: "pvc", owner: "City", ql: "b" }), '12" PVC WATER (CITY) QL-B');
});

test("symbols render for every category", () => {
  assert.match(symbolSvg("manhole", "#00ff00"), /#00ff00/);
  assert.match(symbolSvg(undefined, "#fff"), /<svg/);
});

test("feature importer reads an INDOT-style survey sheet", async () => {
  const { importFeatureTable } = await import("./importers.ts");
  const csv = [
    "Feature Definition Name,Feature Definition Path,Feature Definition Description,Attribute Type,Zone,Alpha Code",
    "S_RDWY_Asphalt-approach,Roadway,Asphalt-approach,Break Line,0,AA",
    "S_SURF_Aerial Boundary,Surface,Aerial Mapping Model Boundary,Do Not Include,0,AB",
    "S_TOPO_Aerial Obscured,Topo,Aerial Obscured Area,Void,0,AO",
    "S_DR_Inlet,Drainage,Inlet,Spot,0,INL",
    "dup,Roadway,dup,Break Line,0,AA",
  ].join("\n");
  const { features, skipped } = importFeatureTable(csv, "indot-survey-codes");
  assert.equal(features.length, 4);
  assert.deepEqual(features[0], { code: "AA", name: "S_RDWY_Asphalt-approach", kind: "breakline", level: "S_RDWY_Asphalt-approach", terrain: "breakline", category: "roadway", sourceId: "indot-survey-codes" });
  assert.equal(features[2].terrain, "void");
  assert.equal(features[3].category, "drainage");
  assert.equal(skipped.length, 1);
});

test("level importer reads RGB, hex and indexed colors", async () => {
  const { importLevelTable } = await import("./importers.ts");
  const csv = "Name,Color,Weight,Style,Description\nS_RDWY_EP,\"0,255,0\",2,0,Edge\nS_DR_Pipe,#3ad4ff,1,2,Pipe\nS_X,4,0,0,Indexed\nS_Y,99,0,0,Missing";
  const { levels, skipped } = importLevelTable(csv, "src", { 4: [255, 0, 0] });
  assert.deepEqual(levels.map((l) => l.rgb), [[0, 255, 0], [58, 212, 255], [255, 0, 0], [128, 128, 128]]);
  assert.equal(levels[0].nativeWeight, 2);
  assert.equal(skipped.length, 1);
});

test("standards QA flags missing required attributes and missing PS", async () => {
  const { standardsQa, descriptionKeysCsv } = await import("./qa.ts");
  const pack = getPack(GENERIC_PACK_ID);
  const shots = [
    { point: "10", northing: 0, easting: 0, elevation: 800, description: "INL INV_OUT=795 TO=11 SIZE=15 MATERIAL=RCP TYPE=inlet" },
    { point: "11", northing: 0, easting: 50, elevation: 799, description: "SMH TYPE=manhole INV_IN=796" },
    { point: "12", northing: 5, easting: 5, elevation: 801, description: "PSGN" },
  ];
  const issues = standardsQa(pack, shots, { state: "OH" });
  assert.ok(issues.some((i) => /No PS/.test(i.title)));
  assert.ok(issues.some((i) => /SMH point missing invert out/i.test(i.title)));
  assert.ok(issues.some((i) => i.title === "Drainage" && /uphill/.test(i.detail)), "795 → 796 runs uphill");
  assert.ok(issues.some((i) => /PSGN point missing mutcd/i.test(i.title)));
  const keys = descriptionKeysCsv(pack);
  assert.match(keys.split("\r\n")[0], /^Code,Layer/);
  assert.match(keys, /^INL\*,V-STRM-STRC,INLET,/m);
});
