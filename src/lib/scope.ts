export type ScopeItem = {
  id: string;
  group: string;
  label: string;
  codes: string[];
  required: boolean;
};

export const TOPO_SCOPE: ScopeItem[] = [
  { id: "ctrl", group: "Control", label: "Control / rebar / benchmarks", codes: ["PRE", "PBMK", "PMON", "TRAV", "PIDT", "PPIN"], required: true },
  { id: "ep", group: "Roadway", label: "Pavement edge", codes: ["EP"], required: true },
  { id: "es", group: "Roadway", label: "Shoulder edge", codes: ["ES"], required: true },
  { id: "rc", group: "Roadway", label: "Road crown", codes: ["RC"], required: true },
  { id: "ct", group: "Roadway", label: "Curb (top / back / bottom)", codes: ["CT", "CB", "CG"], required: false },
  { id: "dl", group: "Drainage", label: "Ditch / flow line", codes: ["DL", "WF"], required: true },
  { id: "str", group: "Drainage", label: "Inlets / pipes / catch basins", codes: ["DR", "PCBD", "PCRB", "PCST", "HD"], required: false },
  { id: "br", group: "Right of Way", label: "Existing R/W", codes: ["BR", "PCON"], required: true },
  { id: "ov", group: "Utility", label: "Overhead utilities", codes: ["OV", "PPOL", "PPWP"], required: true },
  { id: "ug", group: "Utility", label: "Underground marks (gas, fiber, water)", codes: ["UG", "UF", "UW", "PFOM", "PGSO", "PHYD"], required: false },
  { id: "tr", group: "Traffic", label: "Signs / lane lines / delineators", codes: ["PSGN", "PSND", "LL", "PDEL"], required: true },
  { id: "prop", group: "Property", label: "Fence / mailbox / buildings", codes: ["FF", "FW", "PMBX", "BD"], required: false },
  { id: "topo", group: "Topo", label: "Woods / trees / riprap", codes: ["WL", "PTDS", "RP"], required: false },
  { id: "gr", group: "Roadway", label: "Guardrail", codes: ["RB", "RA", "RX"], required: false },
];

export function scopeStatus(codesPresent: Set<string>) {
  return TOPO_SCOPE.map((item) => {
    const hit = item.codes.filter((c) => codesPresent.has(c.toUpperCase()));
    return { ...item, hit, done: hit.length > 0 };
  });
}
