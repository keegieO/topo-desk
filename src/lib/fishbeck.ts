/**
 * Fishbeck / INDOT OpenRoads layer mapping.
 *
 * Two naming conventions are exported:
 *   fishbeckLayer()  → INDOT/Fishbeck ORD level name   (S_RDWY_*, S_CTRL_*, …)
 *   civilLayer()     → Civil 3D / MicroStation standard (V-NODE-BLCR, V-SURF-TIN, …)
 *
 * Civil 3D layer names follow the NCS (National CAD Standard) survey prefix scheme:
 *   V-NODE-*   point / node features
 *   V-SURF-*   surface / terrain
 *   V-ROAD-*   roadway edge and crown
 *   V-TOPO-*   topographic linework
 *   V-UTIL-*   utilities
 *   V-PROP-*   property and R/W
 *   V-CTRL-*   survey control
 *   V-BRDN-*   burden / drainage
 *
 * Both flavors are safe for DXF LAYER names (no forbidden chars, ≤ 250 chars).
 */

export type FbLevel = {
  level: string;
  color: string;
  weight: number;
  dash?: string;
  /** Civil 3D / NCS standard layer name */
  civil?: string;
};

const CODE_LEVEL: Record<string, FbLevel> = {
  EP:   { level: "S_RDWY_Pavement-edge",         color: "#3dde62", weight: 2.4, civil: "V-ROAD-EDGE" },
  EG:   { level: "S_RDWY_Edge of gravel",         color: "#d4c15a", weight: 2.1, civil: "V-ROAD-EDGE-GRV" },
  ES:   { level: "S_RDWY_Shoulder-edge",          color: "#8dff6a", weight: 2.1, dash: "8 5",  civil: "V-ROAD-SHLDR" },
  RC:   { level: "S_RDWY_Road crown",             color: "#f4f4f0", weight: 1.7, dash: "10 6", civil: "V-ROAD-CTRLN" },
  CL:   { level: "S_RDWY_Road crown",             color: "#f4f4f0", weight: 1.7, dash: "10 6", civil: "V-ROAD-CTRLN" },
  LL:   { level: "S_TRAF_Lane Lines",             color: "#f7f7f2", weight: 1.6, dash: "2 7",  civil: "V-ROAD-LANE" },
  CT:   { level: "S_RDWY_Curb-top",               color: "#5ad4d4", weight: 2.2, civil: "V-ROAD-CURB-TOP" },
  CB:   { level: "S_RDWY_Curb-back",              color: "#3ad4ff", weight: 2,   civil: "V-ROAD-CURB-BACK" },
  DL:   { level: "S_DR_Ditch line",               color: "#3ad4ff", weight: 2,   dash: "8 4",  civil: "V-BRDN-DITCH" },
  DI:   { level: "S_DR_Ditch line",               color: "#3ad4ff", weight: 1.8, dash: "6 4",  civil: "V-BRDN-DITCH" },
  WF:   { level: "S_DR_Ditch line",               color: "#2a9ed4", weight: 2,   civil: "V-BRDN-FLOW" },
  FL:   { level: "S_DR_Ditch line",               color: "#2a9ed4", weight: 2,   civil: "V-BRDN-FLOW" },
  DR:   { level: "S_DR_Drainage pipe",            color: "#3ad4ff", weight: 2.2, civil: "V-BRDN-PIPE" },
  CMP:  { level: "E_DR_Pipe_CMP",                 color: "#3ad4ff", weight: 2,   civil: "V-BRDN-PIPE-CMP" },
  CPP:  { level: "E_DR_Pipe_Concrete",            color: "#3ad4ff", weight: 2,   civil: "V-BRDN-PIPE-CONC" },
  PVC:  { level: "E_DR_Pipe_PVC",                 color: "#3ad4ff", weight: 2,   civil: "V-BRDN-PIPE-PVC" },
  RP:   { level: "S_TOPO_Riprap",                 color: "#c8a070", weight: 1.8, civil: "V-TOPO-RIPRAP" },
  RB:   { level: "S_RDWY_Guardrail-beam",         color: "#d8d8d4", weight: 2.2, civil: "V-ROAD-GRDRAIL" },
  BR:   { level: "S_RW_Line-Right of Way",        color: "#ff7ad9", weight: 2,   dash: "14 6", civil: "V-PROP-RWAY" },
  RW:   { level: "S_RW_Line-Right of Way",        color: "#ff7ad9", weight: 2,   dash: "14 6", civil: "V-PROP-RWAY" },
  FW:   { level: "S_RW_Line-property",            color: "#e8e8e8", weight: 1.6, dash: "10 3 2 3", civil: "V-PROP-LINE" },
  FF:   { level: "S_PROP_Fence-chain link",       color: "#c8e050", weight: 1.6, dash: "8 4",  civil: "V-PROP-FENC" },
  WL:   { level: "S_TOPO_Woods-brush line",       color: "#3d9c4a", weight: 2,   dash: "12 4 2 4", civil: "V-TOPO-TREE-EDGE" },
  SW:   { level: "S_PROP_Sidewalk",               color: "#e8e8e8", weight: 1.8, civil: "V-ROAD-SWLK" },
  OV:   { level: "S_UTIL_Overhead Utility Line",  color: "#d45cff", weight: 1.6, dash: "1 6",  civil: "V-UTIL-OHWIRE" },
  PPOL: { level: "S_UTIL_Pole-power",             color: "#e24b4b", weight: 1.6, civil: "V-NODE-UTIL-PPOL" },
  PGUY: { level: "S_UTIL_Pole-guy or stub",       color: "#e8a03a", weight: 1.4, civil: "V-NODE-UTIL-GUY" },
  PHYD: { level: "S_UTIL_Fire hydrant",           color: "#c45c32", weight: 1.6, civil: "V-NODE-UTIL-HYD" },
  PTDS: { level: "S_TOPO_Tree deciduous",         color: "#5ad45a", weight: 1.6, civil: "V-NODE-TREE-DEC" },
  PELV: { level: "S_TOPO_Spot elevation",         color: "#b7c4b0", weight: 1.2, civil: "V-NODE-SPOT" },
  PBMK: { level: "S_CTRL_INDOT BM",              color: "#ffe14a", weight: 2,   civil: "V-CTRL-BM" },
  PRE:  { level: "S_CTRL_Brass plug",             color: "#ff4d4d", weight: 2,   civil: "V-CTRL-MON" },
  PMON: { level: "S_CTRL_Stone Mon",              color: "#ff4d4d", weight: 2,   civil: "V-CTRL-MON" },
  TRAV: { level: "Survey_Traverse",               color: "#ff4d4d", weight: 2,   civil: "V-CTRL-TRAV" },
  PSGN: { level: "S_PROP_Sign-single post",       color: "#5ad45a", weight: 1.6, civil: "V-NODE-PROP-SGN" },
  RA:   { level: "S_RDWY_Pavement-edge",          color: "#f4f4f0", weight: 1.5, dash: "6 4",  civil: "V-ROAD-EDGE" },
  TB:   { level: "S_SURF_Top of bank",            color: "#ffe14a", weight: 1.7, civil: "V-TOPO-BANK-TOP" },
  TS:   { level: "S_SURF_Toe of slope",           color: "#3ad4ff", weight: 1.6, dash: "4 3",  civil: "V-TOPO-BANK-TOE" },
  CHE:  { level: "S_CTRL_INDOT BM",              color: "#ff4d4d", weight: 2,   civil: "V-CTRL-BM" },
  A:    { level: "S_TOPO_Spot elevation",         color: "#9aaa92", weight: 1,   civil: "V-NODE-SPOT" },
  X:    { level: "S_TOPO_Spot elevation",         color: "#8a8a86", weight: 1,   civil: "V-NODE-SPOT" },
  PSND: { level: "S_PROP_Sign-single post",       color: "#5ad45a", weight: 1.6, civil: "V-NODE-PROP-SGN" },
  PMBX: { level: "S_PROP_Mail box (single box)",  color: "#e8e8e8", weight: 1.4, civil: "V-NODE-PROP-MBX" },
  PDEL: { level: "S_TRAF_Delineator Post",        color: "#5ad45a", weight: 1.4, civil: "V-NODE-TRAF-DEL" },
  PCCT: { level: "S_TOPO_Conc elevation",         color: "#5ad4d4", weight: 1.4, civil: "V-NODE-CONC" },
  PCON: { level: "S_TOPO_Conc slab",             color: "#5ad4d4", weight: 1.6, civil: "V-TOPO-CONC" },
};

const CAT_LEVEL: Record<string, FbLevel> = {
  Roadway:          { level: "S_RDWY_Pavement-edge",        color: "#3dde62", weight: 2.2, civil: "V-ROAD-EDGE" },
  Drainage:         { level: "S_DR_Drainage pipe",          color: "#3ad4ff", weight: 2,   civil: "V-BRDN-PIPE" },
  Utility:          { level: "S_UTIL_Overhead Utility Line", color: "#d45cff", weight: 1.6, civil: "V-UTIL-OHWIRE" },
  Property:         { level: "S_PROP_Fence-chain link",     color: "#e8e8e8", weight: 1.6, civil: "V-PROP-LINE" },
  "Right of Way":   { level: "S_RW_Line-Right of Way",      color: "#ff7ad9", weight: 2,   dash: "14 6", civil: "V-PROP-RWAY" },
  "Survey Control": { level: "S_CTRL_INDOT BM",            color: "#ff4d4d", weight: 2,   civil: "V-CTRL-BM" },
  Topo:             { level: "S_TOPO_New feature",          color: "#7CFF6B", weight: 1.6, civil: "V-TOPO" },
  Traffic:          { level: "S_TRAF_Lane Lines",           color: "#f4f4f0", weight: 1.6, civil: "V-ROAD-LANE" },
  Surface:          { level: "S_SURF_Top of bank",          color: "#ffe14a", weight: 1.6, civil: "V-TOPO-BANK-TOP" },
  Bridge:           { level: "E_BR_Bridge",                 color: "#d4a0e8", weight: 2,   civil: "V-BRDN-BRIDGE" },
};

/** Civil 3D surface/TIN layers (not code-driven — applied by export functions directly) */
export const CIVIL_LAYER = {
  TIN_FACE:      "V-SURF-TIN",
  CONTOUR_MAJOR: "V-SURF-MAJR",
  CONTOUR_MINOR: "V-SURF-MINR",
  SPOT_ELEV:     "V-NODE-SPOT",
  BREAKLINE:     "V-NODE-BLCR",
  POINT_CLOUD:   "V-NODE-SURV",
  LABEL:         "V-ANNO-SPOT",
} as const;

const FALLBACK: FbLevel = { level: "S_TOPO_New feature", color: "#3dde62", weight: 1.7, civil: "V-TOPO" };

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

/** INDOT/Fishbeck ORD level name — safe for DXF LAYER */
export function fishbeckLayer(code?: string, cat?: string): string {
  return fishbeckLevel(code, cat).level.replace(/[<>/\\":;?*|=]/g, "").slice(0, 250);
}

/**
 * Civil 3D / NCS standard layer name.
 * Falls back to the INDOT name when no Civil 3D mapping is defined.
 * Always safe for DXF LAYER (no forbidden chars, ≤ 250 chars).
 */
export function civilLayer(code?: string, cat?: string): string {
  const lvl = fishbeckLevel(code, cat);
  const name = lvl.civil ?? lvl.level;
  return name.replace(/[<>/\\":;?*|=]/g, "").slice(0, 250);
}

/**
 * Return both layer names for dual-standard DXF output.
 * The Civil 3D name is the primary; the INDOT name is emitted as a comment /
 * xdata attribute so ORD users can still attach by the familiar level name.
 */
export function layerPair(code?: string, cat?: string): { indot: string; civil: string } {
  return {
    indot: fishbeckLayer(code, cat),
    civil: civilLayer(code, cat),
  };
}
