import { parseSurveyCsv, type CoordOrder, type ParsedShot } from "./csv.ts";
import { carlsonDmsToDeg, reduceShot } from "./cogo.ts";

export type ObservationKind = "occupy" | "backsight" | "sideshot" | "traverse" | "store" | "gps" | "note";

export type Observation = {
  id: string;
  kind: ObservationKind;
  point: string;
  occupied?: string;
  backsight?: string;
  n?: number;
  e?: number;
  z?: number;
  ha?: number;
  va?: number;
  sd?: number;
  hi?: number;
  ht?: number;
  azimuth?: number;
  description: string;
  raw: string;
};

export type FieldbookFormat = "rw5" | "fbk" | "gsi" | "jxl" | "csv";

export type FieldbookParse = {
  format: FieldbookFormat;
  shots: ParsedShot[];
  observations: Observation[];
  survey: {
    crew?: string;
    instrument?: string;
    occupied?: string;
    backsight?: string;
    date?: string;
    notes?: string;
    hi?: string;
    ht?: string;
    books?: { name: string; points: number }[];
    observations?: Observation[];
  };
  skipped: number;
  order: CoordOrder;
  warnings: string[];
};

export function detectFieldbookFormat(raw: string, fileName = ""): FieldbookFormat {
  const name = fileName.toLowerCase();
  if (/\.rw5$/i.test(name) || /\.raw$/i.test(name)) return "rw5";
  if (/\.fbk$/i.test(name)) return "fbk";
  if (/\.gsi$/i.test(name)) return "gsi";
  if (/\.jxl$/i.test(name) || /<\s*jobxml/i.test(raw)) return "jxl";
  const head = raw.slice(0, 2500);
  if (/<\s*jobxml/i.test(head)) return "jxl";
  if (/^\*/m.test(head) && /\b(11|81|82|83)\d{2}/.test(head)) return "gsi";
  if (/^(JB|MO|OC|BK|SS|SP|TR|LS),/im.test(head)) return "rw5";
  if (/^!/m.test(head) && /\b(ST|BK|F1)\b/i.test(head)) return "fbk";
  if (/^\s*ST\s+\S+/im.test(head) && /^\s*(BK|F1)\s+/im.test(head)) return "fbk";
  return "csv";
}

function uid(prefix: string, i: number, pt: string): string {
  return `${prefix}${i}-${pt || i}`;
}

function num(s: string | undefined): number | null {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseRw5Tags(line: string): Record<string, string> {
  const parts = line.split(",");
  const rec = (parts[0] || "").trim().toUpperCase();
  const out: Record<string, string> = { rec };
  for (const part of parts.slice(1)) {
    const s = part.trim();
    if (!s) continue;
    if (s.startsWith("--")) {
      out.DESC = s.slice(2).trim();
      continue;
    }
    const two = s.match(/^([A-Z]{2})(.*)$/i);
    if (two && !/^[NE]$/i.test(two[1])) {
      out[two[1].toUpperCase()] = two[2].trim();
      continue;
    }
    const one = s.match(/^([NE])\s*(.*)$/i);
    if (one) {
      out[one[1].toUpperCase()] = one[2].trim();
      continue;
    }
    if (!out.VAL) out.VAL = s;
  }
  return out;
}

function parsePackedAngle(raw: string | undefined): number | null {
  const v = num(raw);
  if (v == null) return null;
  const abs = Math.abs(v);
  const frac = abs - Math.floor(abs);
  if (frac > 0 && (frac >= 0.6 || /[.]/.test(String(raw ?? "")) && (frac * 100) % 1 > 0.0001 || frac * 100 >= 60)) {
    return carlsonDmsToDeg(v);
  }
  if (frac > 0 && frac < 0.6) return carlsonDmsToDeg(v);
  return v;
}

function parseRw5(raw: string, fileName: string): FieldbookParse {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const observations: Observation[] = [];
  const warnings: string[] = [];
  const store = new Map<string, { n: number; e: number; z: number; desc: string }>();
  let occupied = "";
  let occN = 0;
  let occE = 0;
  let occZ = 0;
  let haveOcc = false;
  let backsight = "";
  let bsAz = 0;
  let hi = 0;
  let ht = 0;
  let angleRight = true;
  let jobName = "";
  let seq = 0;

  const pushObs = (o: Omit<Observation, "id">) => {
    observations.push({ ...o, id: `o${seq++}` });
  };

  const putStore = (pt: string, n: number, e: number, z: number, desc: string) => {
    store.set(pt, { n, e, z, desc });
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("--") && !t.includes(",")) continue;
    const f = parseRw5Tags(t);
    const rec = f.rec;
    if (rec === "JB") {
      jobName = f.NM || f.DESC || jobName;
    } else if (rec === "MO") {
      if (f.AD != null) angleRight = f.AD === "1" || f.AD === "1.0";
    } else if (rec === "SP" || rec === "GPS" || rec === "GS") {
      const pt = f.PN || f.OP || "";
      const n = num(f.N);
      const e = num(f.E);
      const z = num(f.EL) ?? 0;
      if (pt && n != null && e != null) {
        putStore(pt, n, e, z, f.DESC || "");
        pushObs({ kind: rec === "SP" ? "store" : "gps", point: pt, n, e, z, description: f.DESC || "", raw: t });
      }
    } else if (rec === "OC") {
      occupied = f.OP || f.PN || occupied;
      const n = num(f.N);
      const e = num(f.E);
      const z = num(f.EL);
      if (n != null && e != null) {
        occN = n;
        occE = e;
        occZ = z ?? 0;
        haveOcc = true;
        putStore(occupied, occN, occE, occZ, f.DESC || "OCC");
      } else if (occupied && store.has(occupied)) {
        const s = store.get(occupied)!;
        occN = s.n;
        occE = s.e;
        occZ = s.z;
        haveOcc = true;
      }
      pushObs({
        kind: "occupy",
        point: occupied,
        n: haveOcc ? occN : undefined,
        e: haveOcc ? occE : undefined,
        z: haveOcc ? occZ : undefined,
        hi,
        description: f.DESC || "",
        raw: t,
      });
    } else if (rec === "BK") {
      backsight = f.BP || f.PN || backsight;
      const bs = parsePackedAngle(f.BS);
      if (bs != null) bsAz = bs;
      else if (backsight && store.has(backsight) && haveOcc) {
        const s = store.get(backsight)!;
        bsAz = (Math.atan2(s.e - occE, s.n - occN) * 180) / Math.PI;
        if (bsAz < 0) bsAz += 360;
      }
      pushObs({
        kind: "backsight",
        point: backsight,
        occupied,
        backsight,
        azimuth: bsAz,
        description: f.DESC || "",
        raw: t,
      });
    } else if (rec === "LS") {
      if (f.HI != null) hi = num(f.HI) ?? hi;
      if (f.HR != null) ht = num(f.HR) ?? ht;
    } else if (rec === "SS" || rec === "TR" || rec === "F1" || rec === "SD") {
      const pt = f.FP || f.PN || "";
      const ha = parsePackedAngle(f.AR ?? f.AZ ?? f.HA);
      const va = parsePackedAngle(f.ZE ?? f.VA ?? f.ZD);
      const sd = num(f.SD ?? f.HD);
      const desc = f.DESC || "";
      if (f.HR != null) ht = num(f.HR) ?? ht;
      if (f.HI != null) hi = num(f.HI) ?? hi;
      if (pt && ha != null && va != null && sd != null && haveOcc) {
        const red = reduceShot({
          occN,
          occE,
          occZ,
          hi,
          ht,
          haDeg: ha,
          zenithDeg: va,
          sd,
          bsAzimuthDeg: bsAz,
          angleRight,
        });
        putStore(pt, red.n, red.e, red.z, desc);
        pushObs({
          kind: rec === "TR" ? "traverse" : "sideshot",
          point: pt,
          occupied,
          n: red.n,
          e: red.e,
          z: red.z,
          ha,
          va,
          sd,
          hi,
          ht,
          azimuth: red.az,
          description: desc,
          raw: t,
        });
        if (rec === "TR") {
          occupied = pt;
          occN = red.n;
          occE = red.e;
          occZ = red.z;
        }
      } else {
        warnings.push(`Could not reduce ${rec} ${pt || t.slice(0, 24)}`);
      }
    }
  }

  const shots: ParsedShot[] = [];
  let i = 0;
  for (const [point, s] of store) {
    shots.push({
      uid: uid("rw", i++, point),
      rowIndex: i,
      point,
      northing: s.n,
      easting: s.e,
      elevation: s.z,
      description: s.desc || "SHOT",
      issues: [],
    });
  }

  return {
    format: "rw5",
    shots,
    observations,
    survey: {
      occupied,
      backsight,
      hi: hi ? String(hi) : "",
      ht: ht ? String(ht) : "",
      notes: jobName,
      observations,
      books: [{ name: fileName, points: shots.length }],
    },
    skipped: warnings.length,
    order: "PNEZD",
    warnings,
  };
}

function parseFbk(raw: string, fileName: string): FieldbookParse {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const store = new Map<string, { n: number; e: number; z: number; desc: string }>();
  const observations: Observation[] = [];
  const warnings: string[] = [];
  let occupied = "";
  let occN = 0;
  let occE = 0;
  let occZ = 0;
  let haveOcc = false;
  let backsight = "";
  let bsAz = 0;
  let hi = 0;
  let ht = 5;
  let seq = 0;
  const pushObs = (o: Omit<Observation, "id">) => observations.push({ ...o, id: `o${seq++}` });

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("!") || t.startsWith("*") || t.startsWith("#")) {
      if (t.toUpperCase().startsWith("NOTE")) {
        pushObs({ kind: "note", point: "", description: t, raw: t });
      }
      continue;
    }
    const cells = t.split(/[,\s]+/).filter(Boolean);
    const rec = (cells[0] || "").toUpperCase();
    if (rec === "UNITS" || rec === "NOTE") continue;
    if (rec === "ST" || rec === "OC") {
      const pt = cells[1] || "";
      const n = num(cells[2]);
      const e = num(cells[3]);
      const z = num(cells[4]) ?? 0;
      occupied = pt;
      if (n != null && e != null) {
        occN = n;
        occE = e;
        occZ = z;
        haveOcc = true;
        store.set(pt, { n, e, z, desc: cells.slice(5).join(" ") || "OCC" });
      } else if (store.has(pt)) {
        const s = store.get(pt)!;
        occN = s.n;
        occE = s.e;
        occZ = s.z;
        haveOcc = true;
      }
      pushObs({ kind: "occupy", point: pt, n: occN, e: occE, z: occZ, description: "", raw: t });
    } else if (rec === "BK") {
      backsight = cells[1] || "";
      const az = parsePackedAngle(cells[2]);
      if (az != null) bsAz = az;
      else if (store.has(backsight) && haveOcc) {
        const s = store.get(backsight)!;
        bsAz = (Math.atan2(s.e - occE, s.n - occN) * 180) / Math.PI;
        if (bsAz < 0) bsAz += 360;
      }
      pushObs({ kind: "backsight", point: backsight, occupied, azimuth: bsAz, description: "", raw: t });
    } else if (rec === "HI") {
      hi = num(cells[1]) ?? hi;
    } else if (rec === "HT" || rec === "HR") {
      ht = num(cells[1]) ?? ht;
    } else if (rec === "F1" || rec === "SS" || rec === "TR") {
      const pt = cells[1] || "";
      const ha = parsePackedAngle(cells[2]);
      const va = parsePackedAngle(cells[3]);
      const sd = num(cells[4]);
      const desc = cells.slice(5).join(" ");
      if (pt && ha != null && va != null && sd != null && haveOcc) {
        const red = reduceShot({
          occN,
          occE,
          occZ,
          hi,
          ht,
          haDeg: ha,
          zenithDeg: va,
          sd,
          bsAzimuthDeg: bsAz,
          angleRight: true,
        });
        store.set(pt, { n: red.n, e: red.e, z: red.z, desc });
        pushObs({
          kind: rec === "TR" ? "traverse" : "sideshot",
          point: pt,
          occupied,
          n: red.n,
          e: red.e,
          z: red.z,
          ha,
          va,
          sd,
          description: desc,
          raw: t,
        });
      } else warnings.push(`Could not reduce ${t.slice(0, 40)}`);
    } else {
      const n = num(cells[1]);
      const e = num(cells[2]);
      const z = num(cells[3]);
      if (cells[0] && n != null && e != null && Math.abs(n) > 10 && Math.abs(e) > 10) {
        const pt = cells[0];
        const desc = cells.slice(4).join(" ");
        store.set(pt, { n, e, z: z ?? 0, desc });
        pushObs({ kind: "store", point: pt, n, e, z: z ?? 0, description: desc, raw: t });
      }
    }
  }

  const shots: ParsedShot[] = [];
  let i = 0;
  for (const [point, s] of store) {
    shots.push({
      uid: uid("fb", i++, point),
      rowIndex: i,
      point,
      northing: s.n,
      easting: s.e,
      elevation: s.z,
      description: s.desc || "SHOT",
      issues: [],
    });
  }
  return {
    format: "fbk",
    shots,
    observations,
    survey: {
      occupied,
      backsight,
      hi: hi ? String(hi) : "",
      ht: ht ? String(ht) : "",
      observations,
      books: [{ name: fileName, points: shots.length }],
    },
    skipped: warnings.length,
    order: "PNEZD",
    warnings,
  };
}

function parseGsiWord(word: string): { wi: string; value: string } | null {
  const m = word.match(/^(\d{2})(\d{3})([+-])(.+)$/);
  if (!m) return null;
  return { wi: m[1], value: m[3] === "-" ? `-${m[4].trim()}` : m[4].trim() };
}

function parseGsi(raw: string, fileName: string): FieldbookParse {
  const shots: ParsedShot[] = [];
  const observations: Observation[] = [];
  const warnings: string[] = [];
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  let i = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("!")) continue;
    const words = t.split(/\s+/).filter(Boolean);
    const fields: Record<string, string> = {};
    for (const w of words) {
      const p = parseGsiWord(w.replace(/^\*/, ""));
      if (p) fields[p.wi] = p.value;
    }
    const pt = (fields["11"] || "").replace(/^0+/, "") || String(i + 1);
    const e = num(fields["81"]);
    const n = num(fields["82"]);
    const z = num(fields["83"]);
    const desc = (fields["71"] || fields["41"] || "").replace(/^0+/, "");
    if (n != null && e != null) {
      shots.push({
        uid: uid("gs", i, pt),
        rowIndex: i + 1,
        point: pt,
        northing: n,
        easting: e,
        elevation: z ?? 0,
        description: desc || "SHOT",
        issues: [],
      });
      observations.push({
        id: `o${i}`,
        kind: "store",
        point: pt,
        n,
        e,
        z: z ?? 0,
        description: desc,
        raw: t,
      });
      i += 1;
    } else if (t) warnings.push(`GSI line skipped: ${t.slice(0, 40)}`);
  }
  return {
    format: "gsi",
    shots,
    observations,
    survey: { observations, books: [{ name: fileName, points: shots.length }] },
    skipped: warnings.length,
    order: "PNEZD",
    warnings,
  };
}

function xmlText(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function parseJxl(raw: string, fileName: string): FieldbookParse {
  const shots: ParsedShot[] = [];
  const observations: Observation[] = [];
  const warnings: string[] = [];
  const blocks = raw.split(/<(?:PointRecord|CoordinateRecord|Point)\b/i).slice(1);
  let i = 0;
  for (const b of blocks) {
    const point = xmlText(b, "PointNumber") || xmlText(b, "Name") || xmlText(b, "ID") || String(i + 1);
    const n = num(xmlText(b, "North") || xmlText(b, "Northing") || xmlText(b, "Y"));
    const e = num(xmlText(b, "East") || xmlText(b, "Easting") || xmlText(b, "X"));
    const z = num(xmlText(b, "Elevation") || xmlText(b, "Z") || xmlText(b, "Height"));
    const desc = xmlText(b, "Code") || xmlText(b, "FeatureCode") || xmlText(b, "Description");
    if (n != null && e != null) {
      shots.push({
        uid: uid("jx", i, point),
        rowIndex: i + 1,
        point,
        northing: n,
        easting: e,
        elevation: z ?? 0,
        description: desc || "SHOT",
        issues: [],
      });
      observations.push({
        id: `o${i}`,
        kind: "store",
        point,
        n,
        e,
        z: z ?? 0,
        description: desc,
        raw: "",
      });
      i += 1;
    }
  }
  if (!shots.length) warnings.push("No PointRecord / CoordinateRecord nodes in JobXML.");
  return {
    format: "jxl",
    shots,
    observations,
    survey: { observations, books: [{ name: fileName, points: shots.length }] },
    skipped: warnings.length,
    order: "PNEZD",
    warnings,
  };
}

export function parseFieldbook(raw: string, fileName = "fieldbook.csv", orderHint?: CoordOrder): FieldbookParse {
  const format = detectFieldbookFormat(raw, fileName);
  if (format === "rw5") return parseRw5(raw, fileName);
  if (format === "fbk") return parseFbk(raw, fileName);
  if (format === "gsi") return parseGsi(raw, fileName);
  if (format === "jxl") return parseJxl(raw, fileName);
  const csv = parseSurveyCsv(raw, fileName, orderHint);
  return {
    format: "csv",
    shots: csv.shots,
    observations: [],
    survey: { books: [{ name: fileName, points: csv.shots.length }] },
    skipped: csv.skipped,
    order: csv.order,
    warnings: [],
  };
}

export function shotsToPnezd(shots: ParsedShot[]): string {
  const rows = ["P,N,E,Z,D"];
  for (const s of shots) {
    const d = (s.description || "").replace(/"/g, '""');
    rows.push(`${s.point},${s.northing.toFixed(4)},${s.easting.toFixed(4)},${s.elevation.toFixed(3)},${d}`);
  }
  return rows.join("\n") + "\n";
}
