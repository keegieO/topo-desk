/**
 * All 50 states + DC. A state with no pack uses the generic pack and shows a
 * "no DOT pack yet" banner. Wave 1 and Wave 2 are the first 10 states.
 */
export type StateEntry = {
  usps: string;
  name: string;
  packId: string | null;
  wave: 1 | 2 | null;
};

const NAMES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

const PACKS: Record<string, { packId: string; wave: 1 | 2 }> = {
  IN: { packId: "us-in-indot", wave: 1 },
  OH: { packId: "us-oh-odot", wave: 1 },
  KY: { packId: "us-ky-kytc", wave: 1 },
  IL: { packId: "us-il-idot", wave: 1 },
  MI: { packId: "us-mi-mdot", wave: 1 },
  TN: { packId: "us-tn-tdot", wave: 2 },
  PA: { packId: "us-pa-penndot", wave: 2 },
  WI: { packId: "us-wi-wisdot", wave: 2 },
  TX: { packId: "us-tx-txdot", wave: 2 },
  FL: { packId: "us-fl-fdot", wave: 2 },
};

export const STATE_REGISTRY: StateEntry[] = NAMES.map(([usps, name]) => ({
  usps,
  name,
  packId: PACKS[usps]?.packId ?? null,
  wave: PACKS[usps]?.wave ?? null,
}));

export function stateByCode(usps?: string): StateEntry | undefined {
  const k = (usps ?? "").toUpperCase();
  return STATE_REGISTRY.find((s) => s.usps === k);
}
