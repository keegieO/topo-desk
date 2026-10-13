/**
 * State DOT packs, first 10 states. Indiana is a full pack (us-in-indot.ts).
 * The other nine record the official sources, software and legal shell, and
 * inherit levels/features from the generic pack until each DOT's own tables
 * are imported. No level, color, code or cell name below is invented: every
 * DOT-specific section is "needs-source" until imported from the URLs listed.
 */
import type { PackInput } from "../schema.ts";
import { DEFAULT_DRAFT_LABEL } from "./shared.ts";

const RETRIEVED = "2026-10-13";

type Skeleton = {
  usps: string;
  slug: string;
  stateName: string;
  agency: string;
  abbr: string;
  software: PackInput["software"];
  sources: { id: string; title: string; url: string; note?: string }[];
  crs?: PackInput["crs"];
  crsStatus?: "partial" | "needs-source";
  board: string;
  todo: string[];
};

function skeleton(s: Skeleton): PackInput {
  const main = s.sources[0].id;
  return {
    id: `us-${s.usps.toLowerCase()}-${s.slug}`,
    kind: "state-dot",
    state: s.usps,
    name: `${s.stateName} · ${s.abbr}`,
    agency: s.agency,
    version: "not yet imported",
    software: s.software,
    extends: "generic-ncs-apwa",
    sources: s.sources.map((x) => ({ ...x, retrieved: RETRIEVED })),
    status: {
      units: "needs-source",
      crs: s.crsStatus ?? "needs-source",
      colors: "needs-source",
      lineStyles: "needs-source",
      textStyles: "needs-source",
      levels: "needs-source",
      symbols: "needs-source",
      features: "needs-source",
      linkingCodes: "needs-source",
      deliverables: "needs-source",
      sheets: "needs-source",
      legal: "partial",
    },
    crs: s.crs ?? [],
    legal: {
      board: `${s.board} (verify name and rule)`,
      draftLabel: DEFAULT_DRAFT_LABEL,
      verified: false,
      verifiedNote: "Ask this board whether a PS may seal drafting prepared by an outside firm under the PS's direction.",
      sourceId: main,
    },
    todo: [
      `Download the current ${s.abbr} CAD workspace / standards from the sources listed and record its version.`,
      "Export the level table (or Civil 3D layer list), color table and line-style names; import with scripts/packs.",
      "Import the survey feature code list and linking/control codes.",
      "Record cell/block names for signs, drainage structures and utilities.",
      `Find the ${s.abbr} survey manual / survey deliverable requirements for the deliverables checklist.`,
      "Confirm the state's foot definition (US survey foot vs international foot) from NGS or state statute.",
      ...s.todo,
    ],
  };
}

const SP = (id: string, name: string, ref: string, sourceId: string, note?: string) => ({
  id,
  name,
  kind: "spcs83" as const,
  ref,
  note: note ?? "Display math exists in src/lib/states.ts; units not yet confirmed for deliverables.",
  sourceId,
});

export const STATE_SKELETONS: PackInput[] = [
  skeleton({
    usps: "OH",
    slug: "odot",
    stateName: "Ohio",
    abbr: "ODOT",
    agency: "Ohio Department of Transportation",
    software: { primary: "ORD", note: "OHDOT ORD workspace" },
    sources: [
      { id: "odot-cadd", title: "ODOT CADD Standards", url: "https://www.dot.state.oh.us/caddmapping/Pages/standards.aspx" },
      { id: "odot-ord-survey", title: "ODOT OpenRoads Survey guide", url: "https://tas.transportation.ohio.gov/CADD/ODOTcadd/Standards/ODOT/Training/Guides/ODOT_OpenRoadsSurvey.pdf" },
      {
        id: "odot-survey-specs",
        title: "ODOT Survey and Mapping Specifications (Jan 2020 attachment)",
        url: "https://ftp.dot.state.oh.us/PUB/CONTRACTS/ATTACH/MOE-109278/appendix_I/Survey%20and%20Mapping%20Specifications%20January%2017%202020.pdf",
        note: "DTM accuracy classes and check-shot counts; find the current edition.",
      },
    ],
    crs: [SP("oh-n", "Ohio North (NAD83)", "src/lib/states.ts oh-n", "odot-cadd"), SP("oh-s", "Ohio South (NAD83)", "src/lib/states.ts oh-s", "odot-cadd")],
    crsStatus: "partial",
    board: "Ohio State Board of Registration for Professional Engineers and Surveyors",
    todo: ["Add ODOT DTM accuracy classes to tolerances with the source page."],
  }),
  skeleton({
    usps: "KY",
    slug: "kytc",
    stateName: "Kentucky",
    abbr: "KYTC",
    agency: "Kentucky Transportation Cabinet",
    software: { primary: "ORD" },
    sources: [
      { id: "kytc-cadd", title: "KYTC CADD Standards", url: "https://transportation.ky.gov/CADD-Standards" },
      { id: "kytc-ord-faq", title: "KYTC ORD CAD Standards and FAQ", url: "https://Transportation.ky.gov/CADD-Standards/Documents/KYTC%20ORD%20CAD%20Standards%20and%20FAQ.pdf" },
      { id: "kytc-cadd-support", title: "KYTC CADD Support", url: "https://transportation.ky.gov/Highway-Design/Pages/CADD-Support.aspx" },
    ],
    crs: [
      SP("ky-n", "Kentucky North (NAD83)", "src/lib/states.ts ky-n", "kytc-cadd"),
      SP("ky-s", "Kentucky South (NAD83)", "src/lib/states.ts ky-s", "kytc-cadd"),
    ],
    crsStatus: "partial",
    board: "Kentucky State Board of Licensure for Professional Engineers and Land Surveyors",
    todo: ["Kentucky also has a Single Zone state plane system; confirm which one KYTC requires."],
  }),
  skeleton({
    usps: "IL",
    slug: "idot",
    stateName: "Illinois",
    abbr: "IDOT",
    agency: "Illinois Department of Transportation",
    software: { primary: "MicroStation", note: "Confirm whether IDOT survey deliverables are MicroStation or ORD, and which version." },
    sources: [{ id: "idot-cadd", title: "IDOT CADD Downloads and Guidelines", url: "https://idot.illinois.gov/doing-business/idotcadd-support-and-information.html" }],
    crs: [SP("il-e", "Illinois East (NAD83)", "src/lib/states.ts il-e", "idot-cadd"), SP("il-w", "Illinois West (NAD83)", "src/lib/states.ts il-w", "idot-cadd")],
    crsStatus: "partial",
    board: "Illinois Department of Financial and Professional Regulation — Land Surveyors",
    todo: [],
  }),
  skeleton({
    usps: "MI",
    slug: "mdot",
    stateName: "Michigan",
    abbr: "MDOT",
    agency: "Michigan Department of Transportation",
    software: { primary: "ORD", note: "Confirm" },
    sources: [
      {
        id: "mdot-design-wiki",
        title: "MDOT Road Design wiki",
        url: "https://mdotwiki.state.mi.us/design/index.php/Help:Contents",
        note: "No single CAD-standards download page found yet; find MDOT's ORD workspace link.",
      },
    ],
    crs: [
      SP("mi-n", "Michigan North (NAD83)", "src/lib/states.ts mi-n", "mdot-design-wiki", "Display math in src/lib/states.ts converts with the US survey foot. Michigan law is commonly cited as defining the international foot; verify before using for deliverables."),
      SP("mi-c", "Michigan Central (NAD83)", "src/lib/states.ts mi-c", "mdot-design-wiki", "See Michigan North note on foot definition."),
      SP("mi-s", "Michigan South (NAD83)", "src/lib/states.ts mi-s", "mdot-design-wiki", "See Michigan North note on foot definition."),
    ],
    crsStatus: "partial",
    board: "Michigan Board of Professional Surveyors (LARA)",
    todo: ["Get the MDOT ORD workspace download link from the owner before importing."],
  }),
  skeleton({
    usps: "TN",
    slug: "tdot",
    stateName: "Tennessee",
    abbr: "TDOT",
    agency: "Tennessee Department of Transportation",
    software: { primary: "ORD" },
    sources: [
      { id: "tdot-cadd", title: "TDOT CADD Support", url: "https://tn.gov/tdot/roadway-design/tdot-cadd-support.html" },
      { id: "tdot-survey-ord", title: "TDOT Survey (ORD) Manual", url: "https://tn.gov/content/dam/tn/tdot/roadway-design/documents/tdot-ord-workspace/survey/Survey%20(ORD)%20Manual.pdf" },
    ],
    board: "Tennessee State Board of Examiners for Land Surveyors",
    todo: [],
  }),
  skeleton({
    usps: "PA",
    slug: "penndot",
    stateName: "Pennsylvania",
    abbr: "PennDOT",
    agency: "Pennsylvania Department of Transportation",
    software: { primary: "ORD" },
    sources: [
      {
        id: "penndot-ord",
        title: "PennDOT ORD Modeling Standards Manual (draft)",
        url: "https://docs.penndot.pa.gov/Public/Bureaus/DesignandDelivery/CADD/Standards/ORD_Standards_and_Documentation/Current_Modeling_Standards_Manual_Draft.pdf",
        note: "Labeled draft by PennDOT.",
      },
    ],
    board: "Pennsylvania State Registration Board for Professional Engineers, Land Surveyors and Geologists",
    todo: [],
  }),
  skeleton({
    usps: "WI",
    slug: "wisdot",
    stateName: "Wisconsin",
    abbr: "WisDOT",
    agency: "Wisconsin Department of Transportation",
    software: { primary: "Civil3D", note: "WisDOT uses Civil 3D, not ORD." },
    sources: [{ id: "wisdot-c3d-survey", title: "WisDOT Civil 3D survey settings", url: "https://c3dkb.dot.wi.gov/Content/c3d/wisdot-cstm/c3d-itm/c3d-itm-srvy.htm" }],
    board: "Wisconsin Examining Board of Architects, Landscape Architects, Professional Engineers, Designers and Professional Land Surveyors",
    todo: ["Import WisDOT description keys, figure prefixes and layer list (Civil 3D path).", "Source the Wisconsin County Coordinate System (WISCRS) zone parameters."],
  }),
  skeleton({
    usps: "TX",
    slug: "txdot",
    stateName: "Texas",
    abbr: "TxDOT",
    agency: "Texas Department of Transportation",
    software: { primary: "ORD" },
    sources: [
      { id: "txdot-bentley", title: "TxDOT Digital Delivery — Bentley Software Data", url: "https://www.txdot.gov/business/resources/digital-delivery/bentley-software-data-txdot-digital-delivery.html" },
    ],
    board: "Texas Board of Professional Engineers and Land Surveyors",
    todo: [],
  }),
  skeleton({
    usps: "FL",
    slug: "fdot",
    stateName: "Florida",
    abbr: "FDOT",
    agency: "Florida Department of Transportation",
    software: { primary: "ORD", note: "FDOTConnect workspace" },
    sources: [
      { id: "fdot-cadd", title: "FDOT CADD Office", url: "https://www.fdot.gov/cadd/" },
      { id: "fdot-survey-workflow", title: "FDOTConnect Design Survey Workflow", url: "https://fdot.gov/cadd/downloads/documentation/fdotconnecttraining/fdotord/fdotconnect-survey-workflow" },
    ],
    board: "Florida Board of Professional Surveyors and Mappers",
    todo: [],
  }),
];
