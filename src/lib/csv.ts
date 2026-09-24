export type CoordOrder = "PNEZD" | "PENZD";

export type ParsedShot = {
  uid: string;
  rowIndex: number;
  point: string;
  northing: number;
  easting: number;
  elevation: number;
  description: string;
  issues: string[];
};

export type ParseResult = {
  shots: ParsedShot[];
  order: CoordOrder;
  delimiter: string;
  hadHeader: boolean;
  fileName: string;
  raw: string;
  skipped: number;
};

function splitCsvLine(line: string, delim: string): string[] {
  if (delim === " ") {
    return line.trim().split(/\s+/);
  }
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          q = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      q = true;
    } else if (ch === delim) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function detectDelim(sample: string[]): string {
  const counts: Record<string, number> = { ",": 0, "\t": 0, ";": 0, "|": 0 };
  for (const line of sample) {
    counts[","] += (line.match(/,/g) || []).length;
    counts["\t"] += (line.match(/\t/g) || []).length;
    counts[";"] += (line.match(/;/g) || []).length;
    counts["|"] += (line.match(/\|/g) || []).length;
  }
  const best = (Object.entries(counts) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= sample.length) return best[0];
  return " ";
}

const HEADER_ALIASES: Record<string, string> = {
  p: "point",
  pt: "point",
  point: "point",
  "point number": "point",
  "point no": "point",
  "pt#": "point",
  pn: "point",
  n: "northing",
  north: "northing",
  northing: "northing",
  y: "northing",
  lat: "northing",
  latitude: "northing",
  e: "easting",
  east: "easting",
  easting: "easting",
  x: "easting",
  lon: "easting",
  lng: "easting",
  long: "easting",
  longitude: "easting",
  z: "elevation",
  elev: "elevation",
  elevation: "elevation",
  el: "elevation",
  h: "elevation",
  d: "description",
  desc: "description",
  description: "description",
  code: "description",
  "feature code": "description",
  feature: "description",
  "alpha code": "description",
  fd: "description",
  "feature definition": "description",
  notes: "description",
  remark: "description",
};

function normalizeHeader(h: string): string | null {
  const k = h.trim().toLowerCase().replace(/[_./]+/g, " ").replace(/\s+/g, " ");
  return HEADER_ALIASES[k] ?? null;
}

function isNumericToken(s: string): boolean {
  if (!s) return false;
  return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(s.replace(/,/g, ""));
}

function toNum(s: string): number | null {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function looksLikeHeader(cells: string[]): boolean {
  const mapped = cells.map(normalizeHeader).filter(Boolean);
  if (mapped.length >= 2) return true;
  const joined = cells.join(" ").toUpperCase();
  if (/NORTH|EAST|ELEV|DESC|POINT|PNEZD|PENZD|LAT|LON/.test(joined) && cells.some((c) => /[A-Za-z]/.test(c))) {
    return true;
  }
  return false;
}

function detectOrder(n: number, e: number): CoordOrder {
  if (n > 2_400_000 && e < 2_400_000) return "PENZD";
  if (e > 2_400_000 && n < 2_400_000) return "PNEZD";
  // InGCS US-ft eastings sit near the 787,401.57 ft false easting.
  // TopoDOT / MicroStation writes X,Y = easting, northing.
  const eastBand = (v: number) => v > 520_000 && v < 1_050_000;
  const northBand = (v: number) => v > 20_000 && v < 520_000;
  if (eastBand(n) && northBand(e)) return "PENZD";
  if (northBand(n) && eastBand(e)) return "PNEZD";
  return "PNEZD";
}

function findCoordTriple(cells: string[]): { point: string; ni: number; ei: number; zi: number; di: number } | null {
  const nums: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (toNum(cells[i]) != null && isNumericToken(cells[i])) nums.push(i);
  }
  if (nums.length < 2) return null;
  let start = 0;
  if (nums[0] === 0 && nums.length >= 4) {
    const p = toNum(cells[0]) ?? 0;
    const n1 = toNum(cells[nums[1]]) ?? 0;
    if (Number.isInteger(p) && Math.abs(p) < 1_000_000 && Math.abs(n1) > 1000 && Math.abs(p - n1) > 50) {
      start = 1;
    }
  }
  const triple = nums.slice(start);
  if (triple.length < 2) return null;
  const ni = triple[0];
  const ei = triple[1];
  const zi = triple[2] ?? -1;
  const di = (zi >= 0 ? zi + 1 : ei + 1);
  const point = start === 1 || (nums[0] === 0 && start === 1) ? cells[0] : cells[0] && !isNumericToken(cells[0]) ? cells[0] : "";
  return { point, ni, ei, zi, di };
}

export function parseSurveyCsv(
  raw: string,
  fileName = "fieldbook.csv",
  orderHint?: CoordOrder,
): ParseResult {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const nonempty = lines.map((l, i) => ({ l: l.trim(), i })).filter((x) => x.l && !x.l.startsWith("#"));

  if (nonempty.length === 0) {
    return {
      shots: [],
      order: orderHint ?? "PNEZD",
      delimiter: ",",
      hadHeader: false,
      fileName,
      raw,
      skipped: 0,
    };
  }

  let start = 0;
  let forced: CoordOrder | null = orderHint ?? null;
  const first = nonempty[0].l.toUpperCase().replace(/[^A-Z]/g, "");
  if (first === "PNEZD" || first === "PNEZDS" || first === "PENZD" || first === "PENZDS") {
    if (!orderHint) forced = first.startsWith("PEN") ? "PENZD" : "PNEZD";
    start = 1;
  }

  const sample = nonempty.slice(start, start + 12).map((x) => x.l);
  const delim = detectDelim(sample);

  let hadHeader = false;
  let col = { point: 0, northing: 1, easting: 2, elevation: 3, description: 4 };
  let named = false;

  const firstCells = splitCsvLine(nonempty[start]?.l ?? "", delim);
  if (firstCells.length >= 3 && looksLikeHeader(firstCells)) {
    hadHeader = true;
    named = true;
    const idx: Partial<typeof col> = {};
    firstCells.forEach((c, i) => {
      const m = normalizeHeader(c);
      if (m === "point") idx.point = i;
      if (m === "northing") idx.northing = i;
      if (m === "easting") idx.easting = i;
      if (m === "elevation") idx.elevation = i;
      if (m === "description") idx.description = i;
    });
    col = {
      point: idx.point ?? 0,
      northing: idx.northing ?? 1,
      easting: idx.easting ?? 2,
      elevation: idx.elevation ?? 3,
      description: idx.description ?? Math.max(firstCells.length - 1, 4),
    };
    start += 1;
    if (!orderHint && idx.northing != null && idx.easting != null && idx.easting < idx.northing) {
      forced = "PENZD";
    }
    if (idx.northing != null && idx.easting != null) {
      forced = forced ?? "PNEZD";
      if (idx.easting < idx.northing) {
        col = { ...col, northing: idx.northing, easting: idx.easting };
      }
    }
  }

  const shots: ParsedShot[] = [];
  let skipped = 0;
  const nSamples: number[] = [];
  const eSamples: number[] = [];

  for (const { l, i } of nonempty.slice(start)) {
    const cells = splitCsvLine(l, delim);
    if (cells.length < 3) {
      skipped += 1;
      continue;
    }

    let point = "";
    let nRaw = "";
    let eRaw = "";
    let zRaw = "";
    let description = "";

    if (named) {
      point = cells[col.point] ?? "";
      nRaw = cells[col.northing] ?? "";
      eRaw = cells[col.easting] ?? "";
      zRaw = cells[col.elevation] ?? "";
      description = cells.slice(col.description).join(" ").trim();
      if (col.description === col.elevation) description = cells.slice(col.elevation + 1).join(" ").trim();
    } else {
      const hit = findCoordTriple(cells);
      if (!hit) {
        skipped += 1;
        continue;
      }
      point = hit.point || cells[0];
      nRaw = cells[hit.ni] ?? "";
      eRaw = cells[hit.ei] ?? "";
      zRaw = hit.zi >= 0 ? (cells[hit.zi] ?? "") : "";
      description = cells.slice(Math.max(hit.di, 0)).join(" ").trim();
      if (isNumericToken(point) && (point === nRaw || point === eRaw)) point = "";
    }

    const issues: string[] = [];
    const n = toNum(nRaw);
    const e = toNum(eRaw);
    const z = toNum(zRaw);
    if (n == null || e == null) {
      skipped += 1;
      continue;
    }
    if (z == null) issues.push("Missing elevation");
    nSamples.push(n);
    eSamples.push(e);
    shots.push({
      uid: `r${i}-${point || shots.length}`,
      rowIndex: i + 1,
      point: point || String(shots.length + 1),
      northing: n,
      easting: e,
      elevation: z ?? 0,
      description,
      issues,
    });
  }

  let order: CoordOrder = forced ?? "PNEZD";
  if (!forced && nSamples.length) {
    const votes = { PNEZD: 0, PENZD: 0 };
    for (let k = 0; k < nSamples.length; k++) {
      votes[detectOrder(nSamples[k], eSamples[k])] += 1;
    }
    if (votes.PENZD > votes.PNEZD) order = "PENZD";
  }

  if (order === "PENZD" && !hadHeader) {
    for (const s of shots) {
      const n = s.northing;
      s.northing = s.easting;
      s.easting = n;
    }
  }

  return { shots, order, delimiter: delim, hadHeader, fileName, raw, skipped };
}

export function csvEscape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}
