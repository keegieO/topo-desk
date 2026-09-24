import data from "@/data/catalog.json";

export type FeatureKind =
  | "survey"
  | "point"
  | "linear"
  | "alignment"
  | "superelevation";

export type Feature = {
  id: string;
  kind: FeatureKind;
  name: string;
  path: string;
  cat: string;
  desc: string;
  attr: string;
  alphas: string[];
  seed: string;
  pointSym: string;
  linearSym: string;
};

export const features = data.features as Feature[];

export const KIND_LABEL: Record<FeatureKind, string> = {
  survey: "Survey",
  point: "Point",
  linear: "Linear",
  alignment: "Alignment",
  superelevation: "Superelevation",
};

const byId = new Map<string, Feature>();
const byAlpha = new Map<string, Feature>();
const byName = new Map<string, Feature>();
const bySeed = new Map<string, Feature>();

for (const f of features) {
  byId.set(f.id, f);
  const nameKey = f.name.trim().toUpperCase();
  if (nameKey && !byName.has(nameKey)) byName.set(nameKey, f);
  // Prefer survey records when names collide with design defs.
  if (nameKey && (f.kind === "survey" || !byName.has(nameKey))) {
    byName.set(nameKey, f);
  }
  const seedKey = f.seed.trim().toUpperCase();
  if (seedKey && !bySeed.has(seedKey)) bySeed.set(seedKey, f);
  for (const a of f.alphas) {
    const k = a.trim().toUpperCase();
    if (k) byAlpha.set(k, f);
  }
}

// Second pass: survey names always win over design duplicates.
for (const f of features) {
  if (f.kind !== "survey") continue;
  byName.set(f.name.trim().toUpperCase(), f);
}

export function getFeature(id: string | null | undefined): Feature | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

const CODE_ALIAS: Record<string, string> = {
  EPP: "EP",
  EOP: "EP",
  EOG: "EG",
  CL: "RC",
  CLINE: "RC",
  CTR: "RC",
  TOE: "DL",
  TOPDITCH: "WF",
};

export function lookupCode(token: string | null | undefined): Feature | undefined {
  if (!token) return undefined;
  const k = token.trim().toUpperCase();
  if (!k) return undefined;
  const aliased = CODE_ALIAS[k] ?? k;
  return byAlpha.get(aliased) ?? byAlpha.get(k) ?? byName.get(k) ?? bySeed.get(k);
}

export const surveyCategories = [
  ...new Set(features.filter((f) => f.kind === "survey").map((f) => f.cat)),
].sort();

export const allCategories = [...new Set(features.map((f) => f.cat))].sort();

export function searchFeatures(
  query: string,
  opts?: { kind?: FeatureKind | "all"; cat?: string | "all" },
): Feature[] {
  const q = query.trim().toUpperCase();
  const kind = opts?.kind ?? "all";
  const cat = opts?.cat ?? "all";

  const pool = features.filter((f) => {
    if (kind !== "all" && f.kind !== kind) return false;
    if (cat !== "all" && f.cat !== cat) return false;
    return true;
  });

  if (!q) return pool;

  const scored: { f: Feature; s: number }[] = [];
  for (const f of pool) {
    let s = 0;
    for (const a of f.alphas) {
      const A = a.toUpperCase();
      if (A === q) s = Math.max(s, 100);
      else if (A.startsWith(q)) s = Math.max(s, 80);
      else if (A.includes(q)) s = Math.max(s, 50);
    }
    const n = f.name.toUpperCase();
    if (n === q) s = Math.max(s, 95);
    else if (n.startsWith(q)) s = Math.max(s, 70);
    else if (n.includes(q)) s = Math.max(s, 45);
    const d = (f.desc || "").toUpperCase();
    if (d === q) s = Math.max(s, 60);
    else if (d.includes(q)) s = Math.max(s, 30);
    const p = (f.path || "").toUpperCase();
    if (p.includes(q)) s = Math.max(s, 20);
    const seed = (f.seed || "").toUpperCase();
    if (seed === q) s = Math.max(s, 90);
    else if (seed.includes(q)) s = Math.max(s, 40);
    if (s > 0) scored.push({ f, s });
  }
  scored.sort((a, b) => b.s - a.s || a.f.name.localeCompare(b.f.name));
  return scored.map((x) => x.f);
}

export const LINKING_CODES: { code: string; meaning: string }[] = [
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
  { code: "CR", meaning: "Circle radius" },
  { code: "SC", meaning: "Start curve" },
  { code: "EC", meaning: "End curve" },
];

export const LINKING_SET = new Set(LINKING_CODES.map((c) => c.code));

export const ATTR_HINT: Record<string, string> = {
  "Break Line": "Breakline — used in the DTM",
  "Spot And Break": "Spot elevation and breakline",
  Boundary: "Terrain boundary",
  Void: "Void / do not triangulate through",
  "Do Not Include": "Excluded from terrain",
  Point: "Point feature definition",
  Linear: "Linear feature definition",
  Alignment: "Alignment feature definition",
  Superelevation: "Superelevation section",
};
