import { projectOffset, SR67_SITE } from "./geo";

export const SAMPLE_NAME = "2501384_SR67_Topo_PNEZD.csv";

const N0 = SR67_SITE.originN;
const E0 = SR67_SITE.originE;
const MAIN_AZ = SR67_SITE.azimuthDeg;
const CROSS_AZ = MAIN_AZ + 90;

const EP = 12;
const ES = 18;
const DL = 28;
const WF = 34;
const R = 25;
const BREAK = EP + R;

function zAt(along: number, offset: number): number {
  return 953.55 + along * 0.00115 - Math.abs(offset) * 0.012;
}

function world(along: number, offset: number, az = MAIN_AZ): { n: number; e: number; z: number } {
  const p = projectOffset(N0, E0, along, offset, az);
  return { n: p.n, e: p.e, z: zAt(az === MAIN_AZ ? along : 0, offset) + (az === CROSS_AZ ? along * 0.0004 : 0) };
}

const used: { n: number; e: number }[] = [];

function add(
  rows: string[],
  pt: { n: number },
  along: number,
  offset: number,
  desc: string,
  az = MAIN_AZ,
): void {
  const w = world(along, offset, az);
  let n = w.n;
  let e = w.e;
  let guard = 0;
  while (used.some((u) => Math.hypot(u.n - n, u.e - e) <= 0.05) && guard < 8) {
    e += 0.08;
    n += 0.03;
    guard += 1;
  }
  used.push({ n, e });
  rows.push(`${pt.n},${n.toFixed(4)},${e.toFixed(4)},${w.z.toFixed(2)},${desc}`);
  pt.n += 1;
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  if (step === 0) return out;
  const dir = from < to ? 1 : -1;
  const s = Math.abs(step);
  for (let a = from; dir > 0 ? a <= to + 1e-6 : a >= to - 1e-6; a += dir * s) out.push(a);
  if (Math.abs(out[out.length - 1] - to) > 1e-6) out.push(to);
  return out;
}

function stringCode(
  rows: string[],
  pt: { n: number },
  code: string,
  alongs: number[],
  offset: number,
  az = MAIN_AZ,
  inject?: (along: number, index: number) => void,
): void {
  alongs.forEach((a, i) => {
    inject?.(a, i);
    let d = code;
    if (i === 0) d = `${code} ST`;
    else if (i === alongs.length - 1) d = `${code} END`;
    add(rows, pt, a, offset, d, az);
  });
}

function arcLocal(
  ca: number,
  co: number,
  a0: number,
  a1: number,
  radius: number,
  steps: number,
): { along: number; offset: number }[] {
  const out: { along: number; offset: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = a0 + (a1 - a0) * t;
    out.push({
      along: ca + radius * Math.cos(ang),
      offset: co + radius * Math.sin(ang),
    });
  }
  return out;
}

export function buildSampleCsv(): string {
  used.length = 0;
  used.push(
    { n: 148033.373, e: 775346.96 },
    { n: 148445.965, e: 775616.368 },
    { n: 149022.663, e: 775871.019 },
    { n: 149345.208, e: 776301.976 },
    { n: 149688.531, e: 776500.759 },
  );
  const rows: string[] = [
    "# 2501384 SR 67 Topographic Survey",
    "# Delaware County InGCS NAD83(2011)  —  S.R. 67 at C.R. 400 S",
    "PNEZD",
    "600,148033.3730,775346.9600,950.28,PRE",
    "601,148445.9650,775616.3680,953.42,PRE",
    "602,149022.6630,775871.0190,955.14,PRE",
    "603,149345.2080,776301.9760,954.32,PRE",
    "604,149688.5310,776500.7590,954.43,PRE",
  ];
  const pt = { n: 1000 };

  const south = range(-1100, -BREAK, 50);
  const north = range(BREAK, 1100, 50);
  const through = range(-1100, 1100, 50);
  const west = range(-650, -BREAK, 40);
  const east = range(BREAK, 650, 40);
  const crossThrough = range(-650, 650, 40);

  stringCode(rows, pt, "RC", through, 0);

  stringCode(rows, pt, "EP", south, -EP, MAIN_AZ, (a, i) => {
    if (i === 8) add(rows, pt, a, -EP - 6, "PHYD");
  });
  stringCode(rows, pt, "EP", north, -EP);
  stringCode(rows, pt, "EP", south, EP, MAIN_AZ, (a, i) => {
    if (i === 6) add(rows, pt, a + 4, EP + 8, "PSGN");
  });
  stringCode(rows, pt, "EP", north, EP);

  stringCode(rows, pt, "ES", south, -ES);
  stringCode(rows, pt, "ES", north, -ES);
  stringCode(rows, pt, "ES", south, ES);
  stringCode(rows, pt, "ES", north, ES);

  stringCode(rows, pt, "DL", through, -DL);
  stringCode(rows, pt, "DL", through, DL);
  stringCode(rows, pt, "WF", through, -WF);
  stringCode(rows, pt, "WF", through, WF);

  stringCode(rows, pt, "LL", south, -6);
  stringCode(rows, pt, "LL", north, -6);
  stringCode(rows, pt, "LL", south, 6);
  stringCode(rows, pt, "LL", north, 6);

  stringCode(rows, pt, "RC", crossThrough, 0, CROSS_AZ);
  stringCode(rows, pt, "EP", west, -EP, CROSS_AZ);
  stringCode(rows, pt, "EP", east, -EP, CROSS_AZ);
  stringCode(rows, pt, "EP", west, EP, CROSS_AZ);
  stringCode(rows, pt, "EP", east, EP, CROSS_AZ);
  stringCode(rows, pt, "ES", west, -ES, CROSS_AZ);
  stringCode(rows, pt, "ES", east, -ES, CROSS_AZ);
  stringCode(rows, pt, "ES", west, ES, CROSS_AZ);
  stringCode(rows, pt, "ES", east, ES, CROSS_AZ);
  stringCode(rows, pt, "DL", crossThrough, -DL, CROSS_AZ);
  stringCode(rows, pt, "DL", crossThrough, DL, CROSS_AZ);

  const returns: { ca: number; co: number; a0: number; a1: number }[] = [
    { ca: BREAK, co: BREAK, a0: -Math.PI / 2, a1: -Math.PI },
    { ca: BREAK, co: -BREAK, a0: Math.PI / 2, a1: Math.PI },
    { ca: -BREAK, co: BREAK, a0: -Math.PI / 2, a1: 0 },
    { ca: -BREAK, co: -BREAK, a0: Math.PI / 2, a1: 0 },
  ];
  for (const r of returns) {
    const pts = arcLocal(r.ca, r.co, r.a0, r.a1, R, 8);
    pts.forEach((p, i) => {
      let d = "CT";
      if (i === 0) d = "CT ST";
      else if (i === pts.length - 1) d = "CT END";
      add(rows, pt, p.along, p.offset, d);
    });
  }

  const drives = [
    { a: -420, side: -1 },
    { a: -180, side: 1 },
    { a: 260, side: -1 },
    { a: 540, side: 1 },
  ];
  for (const d of drives) {
    const offs = [EP * d.side, 28 * d.side, 48 * d.side, 72 * d.side];
    offs.forEach((o, i) => {
      let desc = "DP";
      if (i === 0) desc = "DP ST";
      else if (i === offs.length - 1) desc = "DP END";
      add(rows, pt, d.a, o, desc);
    });
  }

  stringCode(rows, pt, "RB", range(-820, -120, 20), ES + 2);

  for (const side of [range(-1000, -80, 40), range(80, 1000, 40)]) {
    side.forEach((a, i) => {
      const wobble = Math.sin(a / 90) * 8 + Math.cos(a / 140) * 4;
      let d = "WL";
      if (i === 0) d = "WL ST";
      else if (i === side.length - 1) d = "WL END";
      add(rows, pt, a, -78 + wobble, d);
    });
  }

  stringCode(rows, pt, "FF", range(-1100, -80, 50), 70);
  stringCode(rows, pt, "FF", range(80, 1100, 50), 70);
  stringCode(rows, pt, "BR", range(-1100, 1100, 80), -62);
  stringCode(rows, pt, "BR", range(-1100, 1100, 80), 88);

  for (const a of range(-1000, 1000, 160)) {
    add(rows, pt, a, -42, "PPOL");
    if (a % 320 === 0) add(rows, pt, a + 6, -46, "PGUY");
  }
  const ovAlong = range(-1000, 1000, 160);
  ovAlong.forEach((a, i) => {
    let d = "OV";
    if (i === 0) d = "OV ST";
    else if (i === ovAlong.length - 1) d = "OV END";
    add(rows, pt, a, -42, d);
  });

  for (const a of [-720, -240, 120, 480, 860]) add(rows, pt, a, ES + 4, "PMBX");
  for (const a of [-640, -40, 40, 620]) add(rows, pt, a, a < 0 ? -ES : ES, "PSGN");
  add(rows, pt, -36, ES, "PSND");
  add(rows, pt, 310, -ES - 8, "PHYD");
  add(rows, pt, -110, 36, "PELM");
  add(rows, pt, 210, -50, "PTER");
  add(rows, pt, 430, -50, "PFOM");
  add(rows, pt, -520, 58, "PGSO");
  add(rows, pt, 70, 22, "PCCT");
  add(rows, pt, -60, -20, "PDEL");
  add(rows, pt, 90, 20, "PDEL");
  add(rows, pt, -800, -58, "PTFP");
  add(rows, pt, -760, -58, "PPST");
  add(rows, pt, 150, 44, "PCON");
  add(rows, pt, -150, -44, "PCON");
  add(rows, pt, -1000, 40, "PBMK");

  for (const a of [-980, -560, 340, 780]) {
    add(rows, pt, a, -70, "PTDS");
    add(rows, pt, a + 22, -82, "PTDS");
  }
  add(rows, pt, 400, -96, "PTDS");
  add(rows, pt, 520, -90, "PTDS");

  for (const a of [-200, 200]) {
    add(rows, pt, a, 34, "RP ST");
    add(rows, pt, a + 14, 38, "RP");
    add(rows, pt, a + 28, 34, "RP END");
  }

  add(rows, pt, 18, -8, "PCBD");
  add(rows, pt, -18, 8, "PCRB");
  add(rows, pt, 10, 10, "PCST");

  for (const a of [-900, -400, 400, 900]) {
    add(rows, pt, a, 0, "PELV");
    add(rows, pt, a, -8, "PELV");
    add(rows, pt, a, 8, "PELV");
  }

  add(rows, pt, 40, 6, "X");
  add(rows, pt, -30, -6, "X");

  return rows.join("\n") + "\n";
}

export const SAMPLE_CSV = buildSampleCsv();
