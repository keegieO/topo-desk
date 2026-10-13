/**
 * Standards packs: one data file per state DOT (or client firm, or the generic
 * default) that holds the codes, levels/layers, colors, weights, line styles,
 * symbols, coordinate systems, deliverables and legal draft wording a job must
 * follow. The app reads the job's pack; nothing state-specific is hard-coded.
 *
 * Rule: every table in a pack must point at a `sources[]` entry. A section with
 * no official source stays empty and is marked "needs-source" in `status`.
 */
import { z } from "zod";

/** Point-symbol families. The on-screen glyph is a generic approximation; exports use the pack's native cell/block name. */
export const SYMBOL_CATEGORIES = [
  "sign",
  "sign-post",
  "overhead-sign",
  "signal",
  "light",
  "inlet",
  "catch-basin",
  "manhole",
  "headwall",
  "end-section",
  "culvert",
  "pole",
  "guy",
  "hydrant",
  "valve",
  "meter",
  "vault",
  "tree-deciduous",
  "tree-conifer",
  "shrub",
  "monument",
  "benchmark",
  "control-point",
  "spot",
  "mailbox",
  "post",
  "building-corner",
  "misc",
] as const;
export type SymbolCategory = (typeof SYMBOL_CATEGORIES)[number];

export const FEATURE_CATEGORIES = [
  "roadway",
  "signage",
  "drainage",
  "utilities",
  "structures",
  "vegetation",
  "property",
  "control",
  "terrain",
  "misc",
] as const;
export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

export const SECTION_IDS = [
  "units",
  "crs",
  "colors",
  "lineStyles",
  "textStyles",
  "levels",
  "symbols",
  "features",
  "linkingCodes",
  "deliverables",
  "sheets",
  "legal",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const SectionStatus = z.enum(["complete", "partial", "needs-source"]);
export type SectionStatus = z.infer<typeof SectionStatus>;

const Rgb = z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]);
const Unit = z.enum(["us_ft", "intl_ft", "m"]);

export const SourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional(),
  file: z.string().optional(),
  version: z.string().optional(),
  retrieved: z.string().min(4),
  note: z.string().optional(),
});

export const CrsSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["spcs83", "county-ldp", "utm", "other"]),
  /** Where the math lives in this codebase, e.g. "src/lib/ingcs.ts" or a `src/lib/states.ts` zone id. */
  ref: z.string().optional(),
  epsg: z.number().int().optional(),
  units: Unit.optional(),
  note: z.string().optional(),
  sourceId: z.string(),
});

export const LevelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  rgb: Rgb,
  /** Display weight in screen px (approximation of the agency weight). */
  weight: z.number().positive(),
  /** Agency weight number when known (MicroStation 0–31 or a DWG lineweight in mm). */
  nativeWeight: z.number().optional(),
  lineStyle: z.string().optional(),
  plot: z.boolean().optional(),
  sourceId: z.string(),
});

export const LineStyleSchema = z.object({
  name: z.string(),
  /** The agency's own style name, written to exports. */
  nativeName: z.string(),
  /** SVG/DXF dash pattern in display units: dash, gap, dash, gap… (approximation). */
  pattern: z.array(z.number().nonnegative()).optional(),
  description: z.string().optional(),
  approximate: z.boolean().default(true),
  sourceId: z.string(),
});

export const TextStyleSchema = z.object({
  name: z.string(),
  font: z.string(),
  heightPlotIn: z.number().positive().optional(),
  widthFactor: z.number().positive().optional(),
  sourceId: z.string(),
});

export const SymbolSchema = z.object({
  name: z.string(),
  category: z.enum(SYMBOL_CATEGORIES),
  nativeCell: z.string().optional(),
  nativeBlock: z.string().optional(),
  sourceId: z.string(),
});

export const AttributeSchema = z.object({
  key: z.string(),
  label: z.string(),
  required: z.boolean(),
  type: z.enum(["text", "number", "enum"]),
  options: z.array(z.string()).optional(),
  unit: z.string().optional(),
});
export type FeatureAttribute = z.infer<typeof AttributeSchema>;

export const FeatureSchema = z.object({
  /** Field alpha code as crews shoot it. */
  code: z.string().min(1),
  /** Feature-definition / description-key name. */
  name: z.string().min(1),
  kind: z.enum(["point", "line", "breakline", "boundary", "void", "spot", "do-not-include"]),
  level: z.string(),
  symbol: z.string().optional(),
  lineStyle: z.string().optional(),
  /** Per-feature display override when several codes share one level but draw differently. */
  rgb: Rgb.optional(),
  weight: z.number().positive().optional(),
  terrain: z.enum(["include", "exclude", "breakline", "boundary", "void"]),
  attributes: z.array(AttributeSchema).optional(),
  labelTemplate: z.string().optional(),
  category: z.enum(FEATURE_CATEGORIES),
  sourceId: z.string(),
});

export const DeliverableSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean(),
  fileType: z.string().optional(),
  /** What in the GeoLine package satisfies it, if anything. */
  auto: z.enum(["csv-ord", "dxf", "landxml", "control-csv", "qa-report", "plan-sheet", "station-offset", "drainage-table", "sign-inventory"]).optional(),
  note: z.string().optional(),
  sourceId: z.string(),
});

export const LegalSchema = z.object({
  board: z.string(),
  boardUrl: z.string().url().optional(),
  ruleCitation: z.string().optional(),
  /** Template; {ps_name}, {ps_license} and {state} are filled per job. */
  draftLabel: z.string(),
  sealRules: z.string().optional(),
  verified: z.boolean(),
  verifiedNote: z.string().optional(),
  sourceId: z.string(),
});

export const PackSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(["state-dot", "client", "generic"]),
  state: z.string().length(2).optional(),
  name: z.string(),
  agency: z.string(),
  version: z.string(),
  software: z.object({
    primary: z.enum(["ORD", "MicroStation", "Civil3D", "Carlson", "Other"]),
    versions: z.array(z.string()).optional(),
    note: z.string().optional(),
  }),
  /** Another pack this one inherits from. Sections left empty here come from the parent. */
  extends: z.string().optional(),
  sources: z.array(SourceSchema).min(1),
  status: z.partialRecord(z.enum(SECTION_IDS), SectionStatus),
  units: z.object({ horizontal: Unit, vertical: Unit }).optional(),
  crs: z.array(CrsSchema).default([]),
  lineStyles: z.array(LineStyleSchema).default([]),
  textStyles: z.array(TextStyleSchema).default([]),
  levels: z.array(LevelSchema).default([]),
  symbols: z.array(SymbolSchema).default([]),
  features: z.array(FeatureSchema).default([]),
  /** Level used for features whose code is unknown but whose catalog category is known. */
  categoryLevels: z.record(z.string(), z.string()).default({}),
  fallbackLevel: z.string().optional(),
  /** Display overrides for the category and fallback paths, when they draw differently from the shared level. */
  categoryStyles: z.record(z.string(), z.object({ rgb: Rgb, weight: z.number().positive(), dash: z.string().optional() })).default({}),
  fallbackStyle: z.object({ rgb: Rgb, weight: z.number().positive(), dash: z.string().optional() }).optional(),
  linkingCodes: z.array(z.object({ code: z.string(), meaning: z.string() })).default([]),
  deliverables: z.array(DeliverableSchema).default([]),
  legal: LegalSchema.optional(),
  /** Paths to tables still owed by the agency or by the owner, shown on the Standards page. */
  todo: z.array(z.string()).default([]),
});

export type StandardsPack = z.infer<typeof PackSchema>;
export type PackInput = z.input<typeof PackSchema>;
export type PackLevel = z.infer<typeof LevelSchema>;
export type PackFeature = z.infer<typeof FeatureSchema>;
export type PackDeliverable = z.infer<typeof DeliverableSchema>;
export type PackSource = z.infer<typeof SourceSchema>;

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** "8 5" (SVG dash string) → [8, 5]. */
export function dashToPattern(dash?: string): number[] | undefined {
  if (!dash) return undefined;
  const p = dash.trim().split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
  return p.length ? p : undefined;
}
