import type { FeatureAttribute } from "../schema.ts";

/**
 * Default draft label used until a state's legal wording is verified with that
 * state's surveying board. {ps_name}, {ps_license} and {state} are filled per job.
 */
export const DEFAULT_DRAFT_LABEL =
  "DRAFT. Drafting prepared by GeoLine Solutions under the direction of {ps_name}, {state} PS {ps_license}, for their review. NOT A CERTIFIED DOCUMENT.";

/** ASCE 38 utility quality levels. */
export const ASCE38_QL = ["QL-A", "QL-B", "QL-C", "QL-D"];

export const UTILITY_ATTRS: FeatureAttribute[] = [
  { key: "owner", label: "Utility owner", required: true, type: "text" },
  { key: "ql", label: "ASCE 38 quality level", required: true, type: "enum", options: ASCE38_QL },
  { key: "size", label: "Size", required: false, type: "text", unit: "in" },
  { key: "material", label: "Material", required: false, type: "text" },
];

export const PIPE_ATTRS: FeatureAttribute[] = [
  { key: "size", label: "Pipe size", required: true, type: "number", unit: "in" },
  { key: "material", label: "Material (RCP, CMP, HDPE, PVC…)", required: true, type: "text" },
  { key: "shape", label: "Shape", required: false, type: "enum", options: ["round", "elliptical", "arch", "box"] },
];

export const DRAINAGE_STRUCTURE_ATTRS: FeatureAttribute[] = [
  { key: "type", label: "Structure type", required: true, type: "enum", options: ["inlet", "catch basin", "manhole", "headwall", "endwall", "end section", "junction box"] },
  { key: "rim", label: "Rim / grate elevation", required: true, type: "number", unit: "ft" },
  { key: "inv_in", label: "Invert in", required: false, type: "number", unit: "ft" },
  { key: "inv_out", label: "Invert out", required: true, type: "number", unit: "ft" },
  { key: "to", label: "Downstream structure (point number)", required: false, type: "text" },
  { key: "size", label: "Outlet pipe size", required: false, type: "number", unit: "in" },
  { key: "material", label: "Outlet pipe material", required: false, type: "text" },
];

export const SIGN_ATTRS: FeatureAttribute[] = [
  { key: "mutcd", label: "MUTCD sign code (e.g. R1-1)", required: true, type: "text" },
  { key: "post", label: "Post type", required: false, type: "enum", options: ["single", "double", "U-channel", "square tube", "breakaway", "overhead", "mast arm"] },
  { key: "text", label: "Legend text", required: false, type: "text" },
];

export const TREE_ATTRS: FeatureAttribute[] = [
  { key: "species", label: "Species", required: false, type: "text" },
  { key: "dbh", label: "Trunk diameter (DBH)", required: false, type: "number", unit: "in" },
];
