/**
 * Importers that turn an agency's published tables into pack sections.
 * Binary workspace files (DGNLIB, CEL, RSC, DWT) are not parsed here: export
 * them to CSV first (MicroStation Level Manager → Export, Civil 3D description
 * key set → CSV) and feed the CSV in.
 */
import type { FeatureCategory, PackFeature, PackLevel } from "./schema.ts";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === "," || c === "\t") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

function headerIndex(head: string[], names: string[]): number {
  const h = head.map((x) => x.trim().toLowerCase());
  for (const n of names) {
    const i = h.indexOf(n.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

const ATTR_TYPE: Record<string, { kind: PackFeature["kind"]; terrain: PackFeature["terrain"] }> = {
  "break line": { kind: "breakline", terrain: "breakline" },
  "spot and break": { kind: "breakline", terrain: "breakline" },
  spot: { kind: "spot", terrain: "include" },
  void: { kind: "void", terrain: "void" },
  boundary: { kind: "boundary", terrain: "boundary" },
  "do not include": { kind: "point", terrain: "exclude" },
};

const PATH_CATEGORY: [RegExp, FeatureCategory][] = [
  [/drain|storm|culvert|pipe/i, "drainage"],
  [/util|electric|gas|water|sewer|comm|telephone/i, "utilities"],
  [/traffic|sign|signal|striping|marking/i, "signage"],
  [/control|monument|bench|traverse/i, "control"],
  [/right of way|^rw|property|parcel|fence/i, "property"],
  [/bridge|structure|wall|building/i, "structures"],
  [/tree|woods|vegetation|shrub/i, "vegetation"],
  [/road|pavement|curb|shoulder|drive|sidewalk/i, "roadway"],
  [/topo|surface|terrain|ground/i, "terrain"],
];

export function categoryFromText(...texts: (string | undefined)[]): FeatureCategory {
  const t = texts.filter(Boolean).join(" ");
  for (const [re, cat] of PATH_CATEGORY) if (re.test(t)) return cat;
  return "misc";
}

export type FeatureImport = { features: PackFeature[]; skipped: string[] };

/**
 * Feature table with headers such as INDOT's survey sheet:
 * "Feature Definition Name", "Feature Definition Path", "Feature Definition Description",
 * "Attribute Type", "Alpha Code". Header names are matched case-insensitively;
 * pass `columns` to map other layouts.
 */
export function importFeatureTable(
  text: string,
  sourceId: string,
  columns: Partial<Record<"code" | "name" | "path" | "description" | "attrType" | "level", string[]>> = {},
): FeatureImport {
  const rows = parseCsv(text);
  if (rows.length < 2) return { features: [], skipped: ["no data rows"] };
  const head = rows[0];
  const col = {
    code: headerIndex(head, columns.code ?? ["Alpha Code", "Code", "Field Code", "Raw Description"]),
    name: headerIndex(head, columns.name ?? ["Feature Definition Name", "Name", "Feature", "Description Key"]),
    path: headerIndex(head, columns.path ?? ["Feature Definition Path", "Path", "Category"]),
    description: headerIndex(head, columns.description ?? ["Feature Definition Description", "Description"]),
    attrType: headerIndex(head, columns.attrType ?? ["Attribute Type", "DTM Attribute", "Terrain"]),
    level: headerIndex(head, columns.level ?? ["Level", "Layer"]),
  };
  if (col.code < 0 || col.name < 0) return { features: [], skipped: ["need a code column and a name column"] };
  const seen = new Set<string>();
  const features: PackFeature[] = [];
  const skipped: string[] = [];
  for (const r of rows.slice(1)) {
    const code = (r[col.code] ?? "").trim().toUpperCase();
    const name = (r[col.name] ?? "").trim();
    if (!code || !name) {
      skipped.push(`row without code or name: ${r.join(",").slice(0, 60)}`);
      continue;
    }
    if (seen.has(code)) {
      skipped.push(`duplicate code ${code}`);
      continue;
    }
    seen.add(code);
    const at = ATTR_TYPE[(r[col.attrType] ?? "").trim().toLowerCase()] ?? { kind: "line" as const, terrain: "exclude" as const };
    features.push({
      code,
      name,
      kind: at.kind,
      level: col.level >= 0 && r[col.level]?.trim() ? r[col.level].trim() : name,
      terrain: at.terrain,
      category: categoryFromText(r[col.path], name, r[col.description]),
      sourceId,
    });
  }
  return { features, skipped };
}

/**
 * Level / layer table, e.g. a MicroStation Level Manager export or a Civil 3D
 * layer list: Name, Color, Weight, Style, Description. Color may be "r,g,b",
 * "#rrggbb", or an index looked up in `colorTable`.
 */
export function importLevelTable(text: string, sourceId: string, colorTable: Record<number, [number, number, number]> = {}): { levels: PackLevel[]; skipped: string[] } {
  const rows = parseCsv(text);
  if (rows.length < 2) return { levels: [], skipped: ["no data rows"] };
  const head = rows[0];
  const iName = headerIndex(head, ["Name", "Level", "Layer", "Level Name", "Layer Name"]);
  const iColor = headerIndex(head, ["Color", "Colour", "Element Color", "RGB"]);
  const iWeight = headerIndex(head, ["Weight", "Line Weight", "Lineweight", "Element Weight"]);
  const iStyle = headerIndex(head, ["Style", "Line Style", "Linetype", "Element Style"]);
  const iDesc = headerIndex(head, ["Description", "Desc"]);
  if (iName < 0) return { levels: [], skipped: ["need a Name column"] };
  const levels: PackLevel[] = [];
  const skipped: string[] = [];
  for (const r of rows.slice(1)) {
    const name = (r[iName] ?? "").trim();
    if (!name) continue;
    const raw = iColor >= 0 ? (r[iColor] ?? "").trim() : "";
    let rgb: [number, number, number] | undefined;
    const triple = raw.match(/^\(?\s*(\d{1,3})\s*[,; ]\s*(\d{1,3})\s*[,; ]\s*(\d{1,3})\s*\)?$/);
    if (triple) rgb = [+triple[1], +triple[2], +triple[3]];
    else if (/^#?[0-9a-f]{6}$/i.test(raw)) {
      const h = raw.replace("#", "");
      rgb = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    } else if (/^\d+$/.test(raw) && colorTable[+raw]) rgb = colorTable[+raw];
    if (!rgb) {
      skipped.push(`${name}: color "${raw}" not understood (add a color table)`);
      rgb = [128, 128, 128];
    }
    const nativeWeight = iWeight >= 0 ? Number(r[iWeight]) : NaN;
    levels.push({
      name,
      description: iDesc >= 0 ? r[iDesc]?.trim() || undefined : undefined,
      rgb,
      weight: Number.isFinite(nativeWeight) ? Math.max(0.8, Math.min(4, 1 + nativeWeight * 0.35)) : 1.4,
      nativeWeight: Number.isFinite(nativeWeight) ? nativeWeight : undefined,
      lineStyle: iStyle >= 0 ? r[iStyle]?.trim() || undefined : undefined,
      sourceId,
    });
  }
  return { levels, skipped };
}
