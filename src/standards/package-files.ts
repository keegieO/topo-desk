/**
 * Package files driven by the job's standards pack: STANDARDS.txt (pack,
 * sources, status, deliverables checklist, draft label, import steps) and
 * the drainage / sign tables when the field book has those features.
 */
import { DEFAULT_PACK_ID, draftLabel, featureFor, packWarning, rawPack, type JobStandards } from "./loader.ts";
import { drainageCsv, drainageTables, signCsv, signInventory, type AttrPoint } from "./drainage.ts";
import type { StandardsPack } from "./schema.ts";

export type PackageShot = { point: string; northing: number; easting: number; elevation: number; description: string; codeToken?: string };

const DRAINAGE_STRUCTURE = /^(INL|INLET|CB|SMH|MH|STMH|HW|EW|FES|JB)$/;

function toAttrPoints(shots: PackageShot[]): AttrPoint[] {
  return shots.map((s) => ({
    id: s.point,
    code: (s.codeToken || s.description.trim().split(/\s+/)[0] || "").toUpperCase(),
    n: s.northing,
    e: s.easting,
    z: s.elevation,
    desc: s.description,
  }));
}

export function isDrainageStructure(pack: StandardsPack, code: string): boolean {
  const f = featureFor(pack, code);
  if (f) return f.category === "drainage" && (f.kind === "point" || f.attributes?.some((a) => a.key === "inv_out") === true);
  return DRAINAGE_STRUCTURE.test(code.toUpperCase());
}

export function isSign(pack: StandardsPack, code: string): boolean {
  const f = featureFor(pack, code);
  if (f) return f.category === "signage" && f.kind === "point";
  return /^(SGN|SIGN|PSGN|PSND)$/.test(code.toUpperCase());
}

function importSteps(pack: StandardsPack): string[] {
  if (pack.software.primary === "Civil3D") {
    return [
      "Civil 3D:",
      "  1. Start from the agency or client .dwt template.",
      "  2. Import the PNEZD point file with the agency description key set active.",
      "  3. Import the LandXML surface (Insert > LandXML).",
      "  4. Attach or insert the DXF for linework; layers already use the pack's layer names.",
    ];
  }
  return [
    `${pack.software.primary === "ORD" ? "OpenRoads Designer" : "MicroStation"}${pack.software.versions?.length ? ` (${pack.software.versions.join(", ")})` : ""}:`,
    "  1. Create the file from the agency seed with the agency workspace/workset active.",
    "  2. Survey > Import the labeled field book CSV into a field book so the agency feature definitions build the linework.",
    "  3. Import the LandXML terrain (Terrain > From File) and any alignment.",
    "  4. Reference the DXF only to compare; the native survey objects come from steps 2–3.",
  ];
}

export function standardsFiles(opts: {
  pack: StandardsPack;
  standards?: JobStandards;
  shots: PackageShot[];
  produced: Set<string>;
}): { name: string; text: string }[] {
  const { pack } = opts;
  const own = rawPack(pack.id) ?? pack;
  const files: { name: string; text: string }[] = [];
  const pts = toAttrPoints(opts.shots);

  const drain = drainageTables(pts, (c) => isDrainageStructure(pack, c));
  if (drain.structures.length) {
    files.push({ name: "drainage_structures.csv", text: drainageCsv(drain) });
    opts.produced.add("drainage-table");
  }
  const signs = signInventory(pts, (c) => isSign(pack, c));
  if (signs.rows.length) {
    files.push({ name: "sign_inventory.csv", text: signCsv(signs) });
    opts.produced.add("sign-inventory");
  }

  const label = draftLabel(pack, { standards: opts.standards });
  const warn = packWarning(pack.id);
  const lines: string[] = [
    label,
    "",
    `Standards pack   ${pack.name}  (${pack.id})`,
    `Agency           ${pack.agency}`,
    `Version          ${pack.version}`,
    `Software         ${pack.software.primary}${pack.software.note ? ` — ${pack.software.note}` : ""}`,
    pack.extends && own.features.length === 0 ? `Inherits         ${pack.extends} (agency tables not imported yet)` : "",
    warn ? `NOTE             ${warn}` : "",
    "",
    "Display colors in GeoLine are an approximation. Layer, level and cell names in the",
    "exports are what the agency workspace or client template uses to draw the real symbology.",
    "",
    "DELIVERABLES",
    ...pack.deliverables.map((d) => {
      const done = d.auto && opts.produced.has(d.auto);
      const mark = done ? "[x]" : "[ ]";
      return `  ${mark} ${d.required ? "REQUIRED " : "optional "}${d.title}${d.note ? ` — ${d.note}` : ""}`;
    }),
    "",
    "SECTION STATUS",
    ...Object.entries(own.status).map(([k, v]) => `  ${k.padEnd(14)} ${v}`),
    "",
    "IMPORT STEPS",
    ...importSteps(pack),
    "",
    "SOURCES",
    ...own.sources.map((s) => `  - ${s.title}${s.version ? ` (${s.version})` : ""}${s.url ? `  ${s.url}` : ""}${s.file ? `  [${s.file}]` : ""}  retrieved ${s.retrieved}`),
  ];
  if (own.todo.length) lines.push("", "STILL TO IMPORT", ...own.todo.map((t) => `  - ${t}`));
  if (drain.flags.length || signs.flags.length) {
    lines.push("", "FLAGS FOR PS REVIEW (drainage / signs)", ...[...drain.flags, ...signs.flags].map((f) => `  ${f.severity.toUpperCase()}  ${f.message}`));
  }
  files.unshift({ name: "STANDARDS.txt", text: lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\r\n") + "\r\n" });
  return files;
}

export function isDefaultPack(pack: StandardsPack): boolean {
  return pack.id === DEFAULT_PACK_ID;
}
