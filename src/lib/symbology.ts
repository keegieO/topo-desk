import { fishbeckLevel } from "./fishbeck";

export type MarkKind = "circle" | "square" | "tri" | "plus" | "diamond" | "pole" | "tree" | "x";

export type CatStyle = {
  color: string;
  mark: MarkKind;
  weight: number;
};

export type LineStyle = {
  color: string;
  weight: number;
  dash?: string;
  mark: MarkKind;
};

export const CAT_STYLE: Record<string, CatStyle> = {
  Roadway: { color: "#e6c84b", mark: "circle", weight: 2.2 },
  Drainage: { color: "#3ad4ff", mark: "diamond", weight: 2 },
  Utility: { color: "#d45cff", mark: "square", weight: 1.8 },
  Property: { color: "#e8e8e8", mark: "plus", weight: 1.6 },
  "Right of Way": { color: "#ff7ad9", mark: "plus", weight: 2 },
  "Survey Control": { color: "#ff4d4d", mark: "tri", weight: 2 },
  Topo: { color: "#6ee86e", mark: "circle", weight: 1.5 },
  Traffic: { color: "#f4f4f0", mark: "square", weight: 1.6 },
  Bridge: { color: "#d4a0e8", mark: "diamond", weight: 2 },
  Surface: { color: "#ffe14a", mark: "circle", weight: 1.6 },
};

export const FALLBACK_STYLE: CatStyle = { color: "#f07070", mark: "x", weight: 1.6 };

export function styleFor(cat?: string): CatStyle {
  if (!cat) return FALLBACK_STYLE;
  return CAT_STYLE[cat] ?? FALLBACK_STYLE;
}

/** MicroStation-like per-code colors so parallel road strings read as separate features. */
export const CODE_STYLE: Record<string, LineStyle> = {
  RC: { color: "#f4f4f0", weight: 2.4, dash: "10 6", mark: "circle" },
  CL: { color: "#f4f4f0", weight: 2.4, dash: "10 6", mark: "circle" },
  EP: { color: "#e6c84b", weight: 2.4, mark: "circle" },
  EG: { color: "#d8c27a", weight: 2, dash: "6 3", mark: "circle" },
  ES: { color: "#3dde62", weight: 2, dash: "8 5", mark: "circle" },
  CT: { color: "#5ad4d4", weight: 2.4, mark: "circle" },
  DP: { color: "#e6c84b", weight: 2.2, mark: "circle" },
  AA: { color: "#d8a84a", weight: 2.2, mark: "circle" },
  LL: { color: "#f7f7f2", weight: 1.7, dash: "2 7", mark: "circle" },
  RB: { color: "#c8c8c4", weight: 2.4, mark: "circle" },
  DL: { color: "#3ad4ff", weight: 2.0, dash: "8 4", mark: "diamond" },
  WF: { color: "#2a9ed4", weight: 2.0, mark: "diamond" },
  FL: { color: "#2a9ed4", weight: 2.0, mark: "diamond" },
  DI: { color: "#3ad4ff", weight: 1.8, dash: "6 4", mark: "diamond" },
  OV: { color: "#d45cff", weight: 1.8, dash: "1 6", mark: "circle" },
  FW: { color: "#e8e8e8", weight: 1.6, dash: "10 3 2 3", mark: "plus" },
  FF: { color: "#c8e050", weight: 1.6, dash: "8 4", mark: "circle" },
  WL: { color: "#3d9c4a", weight: 2.0, dash: "12 4 2 4", mark: "tree" },
  BR: { color: "#ff7ad9", weight: 2.0, dash: "14 6", mark: "plus" },
  RP: { color: "#c8a070", weight: 1.8, mark: "diamond" },
  CMP: { color: "#3ad4ff", weight: 2.2, mark: "circle" },
  CPP: { color: "#3ad4ff", weight: 2.2, mark: "circle" },
  RCP: { color: "#3ad4ff", weight: 2.2, mark: "circle" },
  PVC: { color: "#3ad4ff", weight: 2, dash: "6 3", mark: "circle" },
  DR: { color: "#3ad4ff", weight: 2.2, mark: "circle" },
  HD: { color: "#8fd0ff", weight: 2, mark: "square" },
  FES: { color: "#8fd0ff", weight: 2, mark: "square" },
  GR: { color: "#ffe14a", weight: 2, dash: "10 4", mark: "plus" },
  SW: { color: "#e8e8e8", weight: 1.8, mark: "square" },
  PHYD: { color: "#c45c32", mark: "diamond", weight: 1.6 },
  PPOL: { color: "#e24b4b", mark: "pole", weight: 1.6 },
  PGUY: { color: "#e8a03a", mark: "x", weight: 1.4 },
  PSGN: { color: "#5ad45a", mark: "square", weight: 1.6 },
  PSND: { color: "#5ad45a", mark: "square", weight: 1.6 },
  PBMK: { color: "#ffe14a", mark: "tri", weight: 2 },
  PRE: { color: "#ff4d4d", mark: "circle", weight: 2 },
  PMON: { color: "#ff4d4d", mark: "tri", weight: 2 },
  TRAV: { color: "#ff4d4d", mark: "tri", weight: 2 },
  PELV: { color: "#8aa08a", mark: "plus", weight: 1.2 },
  PTDS: { color: "#5ad45a", mark: "tree", weight: 1.6 },
  PMBX: { color: "#e8e8e8", mark: "square", weight: 1.4 },
  PELM: { color: "#e8e8e8", mark: "square", weight: 1.4 },
  PTER: { color: "#e8e8e8", mark: "square", weight: 1.4 },
  PFOM: { color: "#e8e8e8", mark: "plus", weight: 1.4 },
  PTFP: { color: "#e8e8e8", mark: "plus", weight: 1.4 },
  PPST: { color: "#e8e8e8", mark: "plus", weight: 1.4 },
  PGSO: { color: "#e8a03a", mark: "circle", weight: 1.6 },
  PCON: { color: "#5ad4d4", mark: "square", weight: 1.6 },
  PCCT: { color: "#5ad4d4", mark: "circle", weight: 1.4 },
  PDEL: { color: "#5ad45a", mark: "square", weight: 1.4 },
  PCBD: { color: "#f4f4f0", mark: "square", weight: 1.4 },
  PCRB: { color: "#f4f4f0", mark: "square", weight: 1.4 },
  PCST: { color: "#f4f4f0", mark: "square", weight: 1.4 },
  RA: { color: "#f4f4f0", weight: 1.5, dash: "6 4", mark: "circle" },
  TB: { color: "#ffe14a", weight: 1.7, mark: "circle" },
  TS: { color: "#3ad4ff", weight: 1.6, dash: "4 3", mark: "circle" },
  CHE: { color: "#ff4d4d", mark: "tri", weight: 2 },
  A: { color: "#9aaa92", weight: 1.1, mark: "plus" },
  X: { color: "#8a8a86", weight: 1, mark: "x" },
};

export function styleForCode(code?: string, cat?: string): LineStyle {
  const raw = (code ?? "").toUpperCase();
  const k = raw.replace(/\d+$/g, "") || raw;
  const base = (k && CODE_STYLE[k]) || (raw && CODE_STYLE[raw]);
  if (base) return base;
  const fb = fishbeckLevel(raw, cat);
  return { color: fb.color, weight: fb.weight, dash: fb.dash, mark: styleFor(cat).mark };
}

export type LegendItem = {
  id: string;
  label: string;
  color: string;
  mark: MarkKind;
  linear?: boolean;
};

export const SHEET_LEGEND: LegendItem[] = [
  { id: "RC", label: "ROAD CROWN", color: "#f4f4f0", mark: "circle", linear: true },
  { id: "EP", label: "EDGE OF PAVEMENT", color: "#e6c84b", mark: "circle", linear: true },
  { id: "ES", label: "EDGE OF SHOULDER", color: "#c4a040", mark: "circle", linear: true },
  { id: "CT", label: "CURB TOP", color: "#5ad4d4", mark: "circle", linear: true },
  { id: "DL", label: "DITCH LINE", color: "#3ad4ff", mark: "diamond", linear: true },
  { id: "WF", label: "FLOW LINE", color: "#2a9ed4", mark: "circle", linear: true },
  { id: "OV", label: "OVERHEAD UTILITY", color: "#d45cff", mark: "circle", linear: true },
  { id: "WL", label: "WOODS LINE", color: "#3d9c4a", mark: "tree", linear: true },
  { id: "RB", label: "GUARDRAIL", color: "#c8c8c4", mark: "circle", linear: true },
  { id: "PPOL", label: "POWER POLE", color: "#e24b4b", mark: "pole" },
  { id: "PSGN", label: "SIGN", color: "#5ad45a", mark: "square" },
  { id: "PHYD", label: "FIRE HYDRANT", color: "#c45c32", mark: "diamond" },
  { id: "PTDS", label: "TREE (DECIDUOUS)", color: "#5ad45a", mark: "tree" },
  { id: "PRE", label: "REBAR", color: "#ff4d4d", mark: "circle" },
  { id: "PBMK", label: "BENCHMARK", color: "#ffe14a", mark: "tri" },
];

export function markSvg(mark: MarkKind, color: string, size = 12): string {
  const s = size;
  const sw = 1.4;
  const c = color;
  if (mark === "square") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
  }
  if (mark === "tri") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><polygon points="6,1.5 10.5,10.5 1.5,10.5" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
  }
  if (mark === "plus") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><path d="M6 1.5 V10.5 M1.5 6 H10.5" stroke="${c}" stroke-width="${sw}" fill="none"/></svg>`;
  }
  if (mark === "diamond") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
  }
  if (mark === "pole") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.4" fill="${c}"/><circle cx="6" cy="6" r="1.2" fill="#111"/></svg>`;
  }
  if (mark === "tree") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="5" r="3.6" fill="none" stroke="${c}" stroke-width="${sw}"/><path d="M6 8.5 V11" stroke="${c}" stroke-width="${sw}"/></svg>`;
  }
  if (mark === "x") {
    return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><path d="M3 3 L9 9 M9 3 L3 9" stroke="${c}" stroke-width="${sw}" fill="none"/></svg>`;
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.6" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
}
