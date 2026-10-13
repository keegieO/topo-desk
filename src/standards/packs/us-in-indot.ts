/**
 * Indiana (INDOT) pack.
 *
 * Built from the level tables the app already uses (src/lib/fishbeck.ts) so
 * Indiana exports stay byte-identical. Those tables were authored in this repo
 * from INDOT/Fishbeck ORD level names; their colors are on-screen display
 * colors, not the INDOTWise DGNLIB colors. Levels and features are therefore
 * marked "partial" until imported from the INDOTWise 5.2 workspace.
 */
import { CAT_LEVEL, CODE_LEVEL, FALLBACK, type FbLevel } from "../../lib/fishbeck.ts";
import { dashToPattern, hexToRgb, type FeatureCategory, type PackInput, type SymbolCategory } from "../schema.ts";
import { DEFAULT_DRAFT_LABEL, PIPE_ATTRS, SIGN_ATTRS, UTILITY_ATTRS } from "./shared.ts";

const SRC = "topo-desk-indot-levels";

/** Codes the app treats as single points. */
const POINT_SYMBOL: Record<string, SymbolCategory> = {
  PPOL: "pole",
  PGUY: "guy",
  PHYD: "hydrant",
  PTDS: "tree-deciduous",
  PELV: "spot",
  PBMK: "benchmark",
  PRE: "monument",
  PMON: "monument",
  TRAV: "control-point",
  CHE: "benchmark",
  PSGN: "sign",
  PSND: "sign",
  PMBX: "mailbox",
  PDEL: "post",
  PCCT: "spot",
  A: "spot",
  X: "spot",
};

function categoryFor(code: string, level: string): FeatureCategory {
  if (code === "PSGN" || code === "PSND" || code === "PDEL" || level.startsWith("S_TRAF_")) return "signage";
  if (level.startsWith("S_DR_") || level.startsWith("E_DR_")) return "drainage";
  if (level.startsWith("S_UTIL_")) return "utilities";
  if (level.startsWith("S_CTRL_") || level.startsWith("Survey_")) return "control";
  if (level.startsWith("S_RW_") || level.startsWith("S_PROP_")) return "property";
  if (level.startsWith("S_RDWY_")) return "roadway";
  if (code === "PTDS" || code === "WL") return "vegetation";
  if (level.startsWith("S_SURF_") || level.startsWith("S_TOPO_")) return "terrain";
  return "misc";
}

function attrsFor(cat: FeatureCategory, code: string) {
  if (cat === "signage" && (code === "PSGN" || code === "PSND")) return SIGN_ATTRS;
  if (cat === "utilities") return UTILITY_ATTRS;
  if (cat === "drainage") return ["DR", "CMP", "CPP", "PVC"].includes(code) ? PIPE_ATTRS : undefined;
  return undefined;
}

const allLevels = new Map<string, FbLevel>();
for (const lv of [...Object.values(CODE_LEVEL), ...Object.values(CAT_LEVEL), FALLBACK]) {
  if (!allLevels.has(lv.level)) allLevels.set(lv.level, lv);
}

export const INDIANA_PACK: PackInput = {
  id: "us-in-indot",
  kind: "state-dot",
  state: "IN",
  name: "Indiana · INDOT",
  agency: "Indiana Department of Transportation",
  version: "INDOTWise 5.2 target · levels from topo-desk built-in map",
  software: { primary: "ORD", versions: ["OpenRoads Designer 2024 Update 2 (24.00.02.25)"] },
  sources: [
    {
      id: SRC,
      title: "topo-desk built-in INDOT / Fishbeck ORD level map (src/lib/fishbeck.ts)",
      file: "src/lib/fishbeck.ts",
      retrieved: "2026-10-13",
      note: "Level names follow INDOT ORD survey levels. Colors and weights are on-screen display values, not INDOTWise DGNLIB values. Verify against the INDOTWise 5.2 workspace.",
    },
    {
      id: "indot-cad-support",
      title: "INDOT CAD Support — current software versions",
      url: "https://secure.in.gov/indot/doing-business-with-indot/other-business/cad-support/current-versions",
      retrieved: "2026-10-09",
    },
    {
      id: "indot-dm-23-18",
      title: "INDOT Design Memo 23-18 — Survey Requirements (rev. 2024-03-12)",
      url: "https://secure.in.gov/dot/div/contracts/standards/memos/2023/DM%2023-18%20Survey%20Requirements.pdf",
      retrieved: "2026-10-09",
    },
    {
      id: "indot-dm-17-22",
      title: "INDOT Design Memo 17-22 — Survey deliverables (baseline, archived)",
      url: "https://secure.in.gov/dot/div/contracts/standards/memos/2017/17-22%20ta%20Survey%20SS4%20deliverables.pdf",
      retrieved: "2026-10-09",
    },
    {
      id: "ingcs-handbook",
      title: "Indiana Geospatial Coordinate System (InGCS) Handbook v1.05",
      url: "https://secure.in.gov/indot/files/InGCS_HandbookUserGuide_20160901.pdf",
      retrieved: "2026-10-09",
    },
    {
      id: "in-865-iac",
      title: "865 IAC 1-7-2 and 1-7-4 (seal; electronic seal)",
      url: "https://regulations.justia.com/states/indiana/title-865/article-1/rule-7/section-2",
      retrieved: "2026-10-11",
      note: "Justia mirror current through June 2025; verify at iar.iga.in.gov.",
    },
  ],
  status: {
    units: "complete",
    crs: "complete",
    colors: "needs-source",
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
  crs: [
    {
      id: "ingcs",
      name: "Indiana Geospatial Coordinate System (92 county zones), NAD83(2011)",
      kind: "county-ldp",
      ref: "src/lib/ingcs.ts",
      units: "us_ft",
      note: "INDOT requires InGCS for design surveys; monuments also shown in State Plane (DM 23-18).",
      sourceId: "ingcs-handbook",
    },
    { id: "in-sp-east", name: "Indiana State Plane East (NAD83)", kind: "spcs83", ref: "src/lib/geo.ts sp-east", units: "us_ft", sourceId: "indot-dm-23-18" },
    { id: "in-sp-west", name: "Indiana State Plane West (NAD83)", kind: "spcs83", ref: "src/lib/geo.ts sp-west", units: "us_ft", sourceId: "indot-dm-23-18" },
  ],
  lineStyles: [...new Set([...allLevels.values()].map((l) => l.dash).filter(Boolean) as string[])].map((dash, i) => ({
    name: `in-dash-${i + 1}`,
    nativeName: `in-dash-${i + 1}`,
    pattern: dashToPattern(dash),
    description: `Display dash "${dash}" (native INDOT line-style names not yet imported)`,
    approximate: true,
    sourceId: SRC,
  })),
  levels: [...allLevels.values()].map((lv) => ({
    name: lv.level,
    rgb: hexToRgb(lv.color),
    weight: lv.weight,
    lineStyle: lv.dash,
    sourceId: SRC,
  })),
  symbols: Object.entries(POINT_SYMBOL).map(([code, category]) => ({ name: `IN-${code}`, category, sourceId: SRC })),
  features: Object.entries(CODE_LEVEL).map(([code, lv]) => {
    const category = categoryFor(code, lv.level);
    const isPoint = code in POINT_SYMBOL;
    return {
      code,
      name: lv.level,
      kind: isPoint ? (category === "terrain" ? ("spot" as const) : ("point" as const)) : ("line" as const),
      level: lv.level,
      symbol: isPoint ? `IN-${code}` : undefined,
      lineStyle: lv.dash,
      rgb: hexToRgb(lv.color),
      weight: lv.weight,
      terrain: isPoint ? (category === "terrain" ? ("include" as const) : ("exclude" as const)) : ("breakline" as const),
      attributes: attrsFor(category, code),
      category,
      sourceId: SRC,
    };
  }),
  categoryLevels: Object.fromEntries(Object.entries(CAT_LEVEL).map(([cat, lv]) => [cat, lv.level])),
  fallbackLevel: FALLBACK.level,
  categoryStyles: Object.fromEntries(Object.entries(CAT_LEVEL).map(([cat, lv]) => [cat, { rgb: hexToRgb(lv.color), weight: lv.weight, dash: lv.dash }])),
  fallbackStyle: { rgb: hexToRgb(FALLBACK.color), weight: FALLBACK.weight, dash: FALLBACK.dash },
  linkingCodes: [
    { code: "ST", meaning: "Start feature" },
    { code: "START", meaning: "Start feature" },
    { code: "END", meaning: "End feature" },
    { code: "CLS", meaning: "Close figure" },
    { code: "CLOSE", meaning: "Close figure" },
    { code: "PC", meaning: "Point of curve" },
    { code: "PT", meaning: "Point of tangent" },
    { code: "OC", meaning: "Continue / overlap" },
    { code: "J", meaning: "Join to nearest same code" },
    { code: "JOIN", meaning: "Join to nearest same code" },
    { code: "JPT", meaning: "Join to point" },
    { code: "RECT", meaning: "Rectangle" },
  ],
  deliverables: [
    { id: "seed-dgn", title: "2D and 3D seed DGNs with geo-coordination", required: true, fileType: "DGN", note: "Created in ORD from the INDOT seed.", sourceId: "indot-dm-17-22" },
    { id: "fieldbook-dgn", title: "Survey Fieldbook DGN (topo, control, terrain)", required: true, fileType: "DGN", auto: "csv-ord", note: "Built in ORD by importing the labeled field book CSV and LandXML terrain.", sourceId: "indot-dm-23-18" },
    { id: "alignment-dgn", title: "Survey Alignment DGN", required: true, fileType: "DGN", auto: "landxml", sourceId: "indot-dm-23-18" },
    { id: "survey-book", title: "Survey Book (.docx), incl. 865 IAC Surveyor's Report", required: true, fileType: "DOCX", note: "Surveyor's Report is written by the PS.", sourceId: "indot-dm-17-22" },
    { id: "lcrs-plat", title: "LCRS Plat DGN + recorded, sealed LCRS PDF", required: false, fileType: "DGN/PDF", note: "When a Location Control Route Survey is in scope; sealed by the PS.", sourceId: "indot-dm-23-18" },
    { id: "control-list", title: "Control and benchmark listing (InGCS + State Plane)", required: true, auto: "control-csv", sourceId: "indot-dm-23-18" },
    { id: "photos", title: "Digital photographs", required: false, sourceId: "indot-dm-23-18" },
    { id: "point-cloud", title: "LiDAR / point-cloud files (when collected)", required: false, sourceId: "indot-dm-23-18" },
    { id: "section-corners", title: "Section-corner references from county surveyors", required: false, sourceId: "indot-dm-23-18" },
    { id: "qa", title: "QA report for PS review", required: true, auto: "qa-report", note: "GeoLine package item.", sourceId: SRC },
    { id: "drainage-table", title: "Drainage structure and pipe table", required: false, auto: "drainage-table", note: "GeoLine package item.", sourceId: SRC },
    { id: "sign-inventory", title: "Sign inventory", required: false, auto: "sign-inventory", note: "GeoLine package item.", sourceId: SRC },
  ],
  legal: {
    board: "Indiana State Board of Registration for Professional Surveyors",
    boardUrl: "https://www.in.gov/pla/professions/surveyors-home/",
    ruleCitation: "IC 25-21.5-1-7 (practice of surveying); 865 IAC 1-7-2 and 1-7-4 (seal, electronic seal, 'Not a Certified Document')",
    draftLabel: DEFAULT_DRAFT_LABEL,
    sealRules: "Seal only on work by the registrant or regularly employed, directly supervised subordinates. Unsealed electronic transmittals marked 'Not a Certified Document' or 'Pro Forma Survey'.",
    verified: false,
    verifiedNote: "Written guidance requested from the Board on outside drafting under the client PS's direction.",
    sourceId: "in-865-iac",
  },
  todo: [
    "Import the full INDOT survey code list (INDOT-Survey-Codes.xlsx, 318 survey features) through the feature importer.",
    "Export INDOTWise 5.2 level table (Level Manager → Export) for real colors, weights and line-style names.",
    "Record INDOT cell names for signs, drainage structures and utilities from the INDOT cell library.",
  ],
};

