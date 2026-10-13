/**
 * Generic pack: National CAD Standard–style layer names plus the APWA uniform
 * utility color code. Used for private clients that don't follow a DOT, and as
 * the fallback for states whose DOT pack isn't sourced yet.
 */
import { CAT_LEVEL, CIVIL_LAYER, CODE_LEVEL, FALLBACK, type FbLevel } from "../../lib/fishbeck.ts";
import { dashToPattern, hexToRgb, type FeatureCategory, type PackInput } from "../schema.ts";
import { DEFAULT_DRAFT_LABEL, DRAINAGE_STRUCTURE_ATTRS, PIPE_ATTRS, SIGN_ATTRS, UTILITY_ATTRS } from "./shared.ts";

const NCS = "topo-desk-ncs-style";
const APWA = "apwa-uniform-color-code";

/** APWA uniform color code for marking underground facilities. */
export const APWA_COLORS = {
  electric: [255, 0, 0],
  gas: [255, 255, 0],
  communications: [255, 165, 0],
  water: [0, 0, 255],
  reclaimed: [128, 0, 128],
  sewer: [0, 128, 0],
} as const satisfies Record<string, [number, number, number]>;

const UTILITY_LEVELS: { name: string; description: string; rgb: [number, number, number] }[] = [
  { name: "V-UTIL-ELEC", description: "Electric (APWA red)", rgb: [...APWA_COLORS.electric] },
  { name: "V-UTIL-GAS", description: "Gas, oil, steam (APWA yellow)", rgb: [...APWA_COLORS.gas] },
  { name: "V-UTIL-COMM", description: "Communications, CATV, fiber (APWA orange)", rgb: [...APWA_COLORS.communications] },
  { name: "V-UTIL-WATR", description: "Potable water (APWA blue)", rgb: [...APWA_COLORS.water] },
  { name: "V-UTIL-RECL", description: "Reclaimed water, irrigation (APWA purple)", rgb: [...APWA_COLORS.reclaimed] },
  { name: "V-UTIL-SSWR", description: "Sanitary sewer (APWA green)", rgb: [...APWA_COLORS.sewer] },
  { name: "V-STRM-PIPE", description: "Storm drain pipe (APWA green)", rgb: [...APWA_COLORS.sewer] },
  { name: "V-STRM-STRC", description: "Storm structures: inlets, manholes, headwalls (APWA green)", rgb: [...APWA_COLORS.sewer] },
];

function civilName(lv: FbLevel): string {
  return lv.civil ?? lv.level;
}

function categoryFor(name: string): FeatureCategory {
  if (name.includes("SGN") || name.includes("TRAF")) return "signage";
  if (name.includes("UTIL")) return "utilities";
  if (name.includes("BRDN") || name.includes("STRM")) return "drainage";
  if (name.includes("CTRL")) return "control";
  if (name.includes("PROP")) return "property";
  if (name.includes("TREE")) return "vegetation";
  if (name.includes("ROAD")) return "roadway";
  return "terrain";
}

const levelMap = new Map<string, { rgb: [number, number, number]; weight: number; dash?: string; description?: string; sourceId: string }>();
for (const lv of [...Object.values(CODE_LEVEL), ...Object.values(CAT_LEVEL), FALLBACK]) {
  const name = civilName(lv);
  if (!levelMap.has(name)) levelMap.set(name, { rgb: hexToRgb(lv.color), weight: lv.weight, dash: lv.dash, sourceId: NCS });
}
for (const name of Object.values(CIVIL_LAYER)) {
  if (!levelMap.has(name)) levelMap.set(name, { rgb: [200, 200, 200], weight: 1, sourceId: NCS });
}
for (const u of UTILITY_LEVELS) levelMap.set(u.name, { rgb: u.rgb, weight: 1.8, description: u.description, sourceId: APWA });

const POINTS = new Set(["PPOL", "PGUY", "PHYD", "PTDS", "PELV", "PBMK", "PRE", "PMON", "TRAV", "CHE", "PSGN", "PSND", "PMBX", "PDEL", "PCCT", "A", "X"]);

export const GENERIC_PACK: PackInput = {
  id: "generic-ncs-apwa",
  kind: "generic",
  name: "Generic · NCS layers + APWA utility colors",
  agency: "No DOT (private-client default)",
  version: "1",
  software: { primary: "Civil3D", note: "Layer names work in Civil 3D, MicroStation and Carlson." },
  sources: [
    {
      id: NCS,
      title: "topo-desk built-in NCS-style survey layer names (src/lib/fishbeck.ts civil names)",
      file: "src/lib/fishbeck.ts",
      retrieved: "2026-10-13",
      note: "Follows the U.S. National CAD Standard V- (survey) discipline prefix pattern. Not checked line-by-line against NCS v6.",
    },
    {
      id: APWA,
      title: "APWA Uniform Color Code for temporary marking of underground facilities",
      retrieved: "2026-10-13",
      note: "Red electric; yellow gas/oil/steam; orange communications; blue potable water; purple reclaimed water; green sewer and drain. Confirm against the current APWA / Common Ground Alliance publication.",
    },
  ],
  status: {
    units: "partial",
    crs: "partial",
    colors: "partial",
    lineStyles: "partial",
    textStyles: "needs-source",
    levels: "partial",
    symbols: "partial",
    features: "partial",
    linkingCodes: "partial",
    deliverables: "partial",
    sheets: "needs-source",
    legal: "partial",
  },
  units: { horizontal: "us_ft", vertical: "us_ft" },
  crs: [],
  lineStyles: [...new Set([...levelMap.values()].map((l) => l.dash).filter(Boolean) as string[])].map((dash, i) => ({
    name: `gen-dash-${i + 1}`,
    nativeName: "DASHED",
    pattern: dashToPattern(dash),
    approximate: true,
    sourceId: NCS,
  })),
  levels: [...levelMap.entries()].map(([name, l]) => ({
    name,
    description: l.description,
    rgb: l.rgb,
    weight: l.weight,
    lineStyle: l.dash,
    sourceId: l.sourceId,
  })),
  symbols: [
    { name: "GEN-SIGN", category: "sign", nativeBlock: "SIGN", sourceId: NCS },
    { name: "GEN-INLET", category: "inlet", nativeBlock: "INLET", sourceId: NCS },
    { name: "GEN-MANHOLE", category: "manhole", nativeBlock: "MH", sourceId: NCS },
    { name: "GEN-POLE", category: "pole", nativeBlock: "POLE", sourceId: NCS },
    { name: "GEN-HYDRANT", category: "hydrant", nativeBlock: "HYD", sourceId: NCS },
    { name: "GEN-VALVE", category: "valve", nativeBlock: "VALVE", sourceId: NCS },
    { name: "GEN-TREE", category: "tree-deciduous", nativeBlock: "TREE", sourceId: NCS },
    { name: "GEN-MON", category: "monument", nativeBlock: "MON", sourceId: NCS },
    { name: "GEN-BM", category: "benchmark", nativeBlock: "BM", sourceId: NCS },
    { name: "GEN-CP", category: "control-point", nativeBlock: "CP", sourceId: NCS },
    { name: "GEN-SPOT", category: "spot", nativeBlock: "SPOT", sourceId: NCS },
  ],
  features: [
    ...Object.entries(CODE_LEVEL).map(([code, lv]) => {
      const level = civilName(lv);
      const category = categoryFor(level);
      const point = POINTS.has(code);
      return {
        code,
        name: level,
        kind: point ? (category === "terrain" ? ("spot" as const) : ("point" as const)) : ("line" as const),
        level,
        lineStyle: lv.dash,
        terrain: point ? (category === "terrain" ? ("include" as const) : ("exclude" as const)) : ("breakline" as const),
        attributes:
          category === "utilities" ? UTILITY_ATTRS : category === "signage" && point && level.includes("SGN") ? SIGN_ATTRS : ["DR", "CMP", "CPP", "PVC"].includes(code) ? PIPE_ATTRS : undefined,
        category,
        sourceId: NCS,
      };
    }),
    { code: "INL", name: "Storm inlet", kind: "point", level: "V-STRM-STRC", symbol: "GEN-INLET", terrain: "exclude", attributes: DRAINAGE_STRUCTURE_ATTRS, labelTemplate: "{type} RIM {rim} INV {inv_out}", category: "drainage", sourceId: NCS },
    { code: "SMH", name: "Storm manhole", kind: "point", level: "V-STRM-STRC", symbol: "GEN-MANHOLE", terrain: "exclude", attributes: DRAINAGE_STRUCTURE_ATTRS, labelTemplate: "MH RIM {rim} INV {inv_out}", category: "drainage", sourceId: NCS },
  ],
  categoryLevels: Object.fromEntries(Object.entries(CAT_LEVEL).map(([cat, lv]) => [cat, civilName(lv)])),
  fallbackLevel: civilName(FALLBACK),
  linkingCodes: [
    { code: "ST", meaning: "Start feature" },
    { code: "END", meaning: "End feature" },
    { code: "CLS", meaning: "Close figure" },
    { code: "PC", meaning: "Point of curve" },
    { code: "PT", meaning: "Point of tangent" },
    { code: "J", meaning: "Join to nearest same code" },
  ],
  deliverables: [
    { id: "dxf", title: "Drawing (DXF) on client or NCS layers", required: true, auto: "dxf", sourceId: NCS },
    { id: "points", title: "Coded point file (PNEZD)", required: true, auto: "csv-ord", sourceId: NCS },
    { id: "surface", title: "Existing surface (LandXML)", required: true, auto: "landxml", sourceId: NCS },
    { id: "control", title: "Control listing (client-supplied values)", required: true, auto: "control-csv", sourceId: NCS },
    { id: "qa", title: "QA report for PS review", required: true, auto: "qa-report", sourceId: NCS },
    { id: "drainage-table", title: "Drainage structure and pipe table", required: false, auto: "drainage-table", sourceId: NCS },
    { id: "sign-inventory", title: "Sign inventory", required: false, auto: "sign-inventory", sourceId: NCS },
  ],
  legal: {
    board: "The surveying board of the state where the project is located",
    draftLabel: DEFAULT_DRAFT_LABEL,
    verified: false,
    sourceId: NCS,
  },
  todo: ["Load the client's own code list, layer list and description keys to make a client pack."],
};
