/** Levels taken from Fishbeck's OpenRoads seed (2501384 SR 67). */

export type FbLevel = {
  level: string;
  color: string;
  weight: number;
  dash?: string;
};

const CODE_LEVEL: Record<string, FbLevel> = {
  EP: { level: "S_RDWY_Pavement-edge", color: "#3dde62", weight: 2.4 },
  EG: { level: "S_RDWY_Edge of gravel", color: "#d4c15a", weight: 2.1 },
  ES: { level: "S_RDWY_Shoulder-edge", color: "#8dff6a", weight: 2.1, dash: "8 5" },
  RC: { level: "S_RDWY_Road crown", color: "#f4f4f0", weight: 1.7, dash: "10 6" },
  CL: { level: "S_RDWY_Road crown", color: "#f4f4f0", weight: 1.7, dash: "10 6" },
  LL: { level: "S_TRAF_Lane Lines", color: "#f7f7f2", weight: 1.6, dash: "2 7" },
  CT: { level: "S_RDWY_Curb-top", color: "#5ad4d4", weight: 2.2 },
  CB: { level: "S_RDWY_Curb-back", color: "#3ad4ff", weight: 2 },
  DL: { level: "S_DR_Ditch line", color: "#3ad4ff", weight: 2, dash: "8 4" },
  DI: { level: "S_DR_Ditch line", color: "#3ad4ff", weight: 1.8, dash: "6 4" },
  WF: { level: "S_DR_Ditch line", color: "#2a9ed4", weight: 2 },
  FL: { level: "S_DR_Ditch line", color: "#2a9ed4", weight: 2 },
  DR: { level: "S_DR_Drainage pipe", color: "#3ad4ff", weight: 2.2 },
  CMP: { level: "E_DR_Pipe_CMP", color: "#3ad4ff", weight: 2 },
  CPP: { level: "E_DR_Pipe_Concrete", color: "#3ad4ff", weight: 2 },
  PVC: { level: "E_DR_Pipe_PVC", color: "#3ad4ff", weight: 2 },
  RP: { level: "S_TOPO_Riprap", color: "#c8a070", weight: 1.8 },
  RB: { level: "S_RDWY_Guardrail-beam", color: "#d8d8d4", weight: 2.2 },
  BR: { level: "S_RW_Line-Right of Way", color: "#ff7ad9", weight: 2, dash: "14 6" },
  RW: { level: "S_RW_Line-Right of Way", color: "#ff7ad9", weight: 2, dash: "14 6" },
  FW: { level: "S_RW_Line-property", color: "#e8e8e8", weight: 1.6, dash: "10 3 2 3" },
  FF: { level: "S_PROP_Fence-chain link", color: "#c8e050", weight: 1.6, dash: "8 4" },
  WL: { level: "S_TOPO_Woods-brush line", color: "#3d9c4a", weight: 2, dash: "12 4 2 4" },
  SW: { level: "S_PROP_Sidewalk", color: "#e8e8e8", weight: 1.8 },
  OV: { level: "S_UTIL_Overhead Utility Line", color: "#d45cff", weight: 1.6, dash: "1 6" },
  PPOL: { level: "S_UTIL_Pole-power", color: "#e24b4b", weight: 1.6 },
  PGUY: { level: "S_UTIL_Pole-guy or stub", color: "#e8a03a", weight: 1.4 },
  PHYD: { level: "S_UTIL_Fire hydrant", color: "#c45c32", weight: 1.6 },
  PTDS: { level: "S_TOPO_Tree deciduous", color: "#5ad45a", weight: 1.6 },
  PELV: { level: "S_TOPO_Spot elevation", color: "#b7c4b0", weight: 1.2 },
  PBMK: { level: "S_CTRL_INDOT BM", color: "#ffe14a", weight: 2 },
  PRE: { level: "S_CTRL_Brass plug", color: "#ff4d4d", weight: 2 },
  PMON: { level: "S_CTRL_Stone Mon", color: "#ff4d4d", weight: 2 },
  TRAV: { level: "Survey_Traverse", color: "#ff4d4d", weight: 2 },
  PSGN: { level: "S_PROP_Sign-single post", color: "#5ad45a", weight: 1.6 },
  RA: { level: "S_RDWY_Pavement-edge", color: "#f4f4f0", weight: 1.5, dash: "6 4" },
  TB: { level: "S_SURF_Top of bank", color: "#ffe14a", weight: 1.7 },
  TS: { level: "S_SURF_Toe of slope", color: "#3ad4ff", weight: 1.6, dash: "4 3" },
  CHE: { level: "S_CTRL_INDOT BM", color: "#ff4d4d", weight: 2 },
  A: { level: "S_TOPO_Spot elevation", color: "#9aaa92", weight: 1 },
  X: { level: "S_TOPO_Spot elevation", color: "#8a8a86", weight: 1 },
  PSND: { level: "S_PROP_Sign-single post", color: "#5ad45a", weight: 1.6 },
  PMBX: { level: "S_PROP_Mail box (single box)", color: "#e8e8e8", weight: 1.4 },
  PDEL: { level: "S_TRAF_Delineator Post", color: "#5ad45a", weight: 1.4 },
  PCCT: { level: "S_TOPO_Conc elevation", color: "#5ad4d4", weight: 1.4 },
  PCON: { level: "S_TOPO_Conc slab", color: "#5ad4d4", weight: 1.6 },
};

const CAT_LEVEL: Record<string, FbLevel> = {
  Roadway: { level: "S_RDWY_Pavement-edge", color: "#3dde62", weight: 2.2 },
  Drainage: { level: "S_DR_Drainage pipe", color: "#3ad4ff", weight: 2 },
  Utility: { level: "S_UTIL_Overhead Utility Line", color: "#d45cff", weight: 1.6 },
  Property: { level: "S_PROP_Fence-chain link", color: "#e8e8e8", weight: 1.6 },
  "Right of Way": { level: "S_RW_Line-Right of Way", color: "#ff7ad9", weight: 2, dash: "14 6" },
  "Survey Control": { level: "S_CTRL_INDOT BM", color: "#ff4d4d", weight: 2 },
  Topo: { level: "S_TOPO_New feature", color: "#7CFF6B", weight: 1.6 },
  Traffic: { level: "S_TRAF_Lane Lines", color: "#f4f4f0", weight: 1.6 },
  Surface: { level: "S_SURF_Top of bank", color: "#ffe14a", weight: 1.6 },
  Bridge: { level: "E_BR_Bridge", color: "#d4a0e8", weight: 2 },
};

const FALLBACK: FbLevel = { level: "S_TOPO_New feature", color: "#3dde62", weight: 1.7 };

function rootCode(code?: string): string {
  return (code ?? "").toUpperCase().replace(/\d+$/g, "");
}

export function fishbeckLevel(code?: string, cat?: string): FbLevel {
  const raw = (code ?? "").toUpperCase();
  const k = rootCode(raw);
  if (k && CODE_LEVEL[k]) return CODE_LEVEL[k];
  if (raw && CODE_LEVEL[raw]) return CODE_LEVEL[raw];
  if (cat && CAT_LEVEL[cat]) return CAT_LEVEL[cat];
  return FALLBACK;
}

export function fishbeckKnown(code?: string): boolean {
  const k = rootCode(code);
  return !!CODE_LEVEL[k] || !!CODE_LEVEL[(code ?? "").toUpperCase()];
}

export function fishbeckLayer(code?: string, cat?: string): string {
  return fishbeckLevel(code, cat).level.replace(/[<>/\\":;?*|=]/g, "").slice(0, 250);
}
