import { getFeature, LINKING_SET, lookupCode, type Feature } from "./catalog";
import type { ParsedShot } from "./csv";

export const TEMPLATES = [
  { id: "code-desc", label: "Code — description", tmpl: "{code} — {desc}" },
  { id: "pt-code", label: "Point + code", tmpl: "{pt}  {code}" },
  { id: "pt-code-z", label: "Point + code + elev", tmpl: "{pt}  {code}  {z}" },
  { id: "def", label: "Feature definition", tmpl: "{def}" },
  { id: "pt-def", label: "Point + definition", tmpl: "{pt}  {def}" },
  { id: "code", label: "Alpha code only", tmpl: "{code}" },
  { id: "desc", label: "Description only", tmpl: "{desc}" },
  { id: "full", label: "Point · code · definition", tmpl: "{pt}  {code}  {def}" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export type LabeledShot = ParsedShot & {
  codeToken: string;
  remainder: string;
  matchId: string | null;
};

export function splitDescription(description: string): { codeToken: string; remainder: string } {
  const trimmed = description.trim();
  if (!trimmed) return { codeToken: "", remainder: "" };
  const parts = trimmed.split(/\s+/);
  const first = parts[0].replace(/[.,;:]+$/g, "");
  // If first token is a linking code, the feature may be second (rare).
  if (LINKING_SET.has(first.toUpperCase()) && parts[1]) {
    const second = parts[1].replace(/[.,;:]+$/g, "");
    if (lookupCode(second)) {
      return { codeToken: second, remainder: [first, ...parts.slice(2)].join(" ") };
    }
  }
  return { codeToken: first, remainder: parts.slice(1).join(" ") };
}

export function labelShots(shots: ParsedShot[]): LabeledShot[] {
  return shots.map((s) => {
    const { codeToken, remainder } = splitDescription(s.description);
    const hit = lookupCode(codeToken);
    return {
      ...s,
      codeToken,
      remainder,
      matchId: hit?.id ?? null,
    };
  });
}

export function resolveFeature(
  shot: LabeledShot,
  remaps: Record<string, string>,
): Feature | undefined {
  const key = shot.codeToken.trim().toUpperCase();
  const remapId = remaps[key];
  if (remapId) return getFeature(remapId);
  return getFeature(shot.matchId);
}

function fmtZ(z: number): string {
  return z.toFixed(2);
}

export function applyTemplate(
  shot: LabeledShot,
  feature: Feature | undefined,
  tmpl: string,
): string {
  const code = shot.codeToken || "—";
  const def = feature?.name ?? shot.codeToken ?? "UNMATCHED";
  const desc = feature?.desc || feature?.name || shot.codeToken || "";
  const cat = feature?.cat ?? "";
  const attr = feature?.attr ?? "";
  const z = fmtZ(shot.elevation);
  const n = shot.northing.toFixed(3);
  const e = shot.easting.toFixed(3);
  return tmpl
    .replaceAll("{pt}", shot.point)
    .replaceAll("{code}", code)
    .replaceAll("{def}", def)
    .replaceAll("{desc}", desc)
    .replaceAll("{cat}", cat)
    .replaceAll("{attr}", attr)
    .replaceAll("{z}", z)
    .replaceAll("{n}", n)
    .replaceAll("{e}", e)
    .replaceAll("{rest}", shot.remainder)
    .trim();
}

export type ExportKind = "fieldbook" | "labeled-ord" | "annotation" | "full";

export const EXPORT_KINDS: { id: ExportKind; label: string; hint: string }[] = [
  {
    id: "fieldbook",
    label: "ORD field book (PNEZD)",
    hint: "Keeps original alpha codes so OpenRoads can import the field book.",
  },
  {
    id: "labeled-ord",
    label: "ORD labeled PNEZD",
    hint: "Description becomes the INDOT feature definition name, plus leftover link codes.",
  },
  {
    id: "annotation",
    label: "Annotation labels",
    hint: "Point, N, E, Z, and a plan label from the template.",
  },
  {
    id: "full",
    label: "Full labeled workbook",
    hint: "Every column: codes, definition, category, attribute type, label.",
  },
];
