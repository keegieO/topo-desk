export const COMPANY = {
  name: "Breakline",
  legal: "Breakline Extraction",
  city: "Greenwood, Indiana",
  tagline: "Conventional field-book extraction for survey crews.",
  line: "INDOT-coded. ORD-ready. You shoot it — we reduce it.",
  phone: "(317) 555-0167",
  email: "desk@breakline.work",
  hours: "Mon–Fri 7:00–5:00 ET",
  terms: "Net 15",
};

export const RATES = {
  conventionalHr: 85,
  lidarClassMile: 1800,
  breaklineMile: 2400,
  planimetricMile: 1600,
  codingJob: 650,
  rush: 1.35,
};

export const DISCLAIMER =
  "Breakline Extraction provides CAD extraction, feature coding, and field-book reduction as a subcontractor. We do not perform licensed land surveying, do not stamp plats or legal descriptions, and do not set or certify monuments. Deliverables support the client's licensed land surveyor of record.";

export const OUT_OF_SCOPE = [
  "Licensed land-surveyor stamp or certification",
  "Boundary opinion, ALTA/NSPS, or legal description",
  "Monumentation or construction staking",
  "Native MicroStation DGN / OpenRoads seed authorship — we deliver DXF, LandXML, and PNEZD for import",
  "LiDAR / TopoDOT production extraction (parked — conventional field books only)",
];

export const SERVICES = [
  {
    id: "conv",
    title: "Conventional reduction",
    rate: `$${RATES.conventionalHr}/hr`,
    detail:
      "Total-station and GPS field books. Linking codes ST / END / CLS / J. Remap mixed crew codes (EP vs EOP) before ORD.",
  },
  {
    id: "code",
    title: "INDOT coding + ORD book",
    rate: `$${RATES.codingJob}/job`,
    detail:
      "Alpha codes to S_* feature definitions. Labeled PNEZD, DXF, LandXML, workbook, and extraction transmittal the PM drops into OpenRoads.",
  },
  {
    id: "qa",
    title: "QA / QC checklist",
    rate: "Included",
    detail:
      "Unmatched codes, duplicate points, elevation spikes, open strings, short/long segments, missing control — the survey-tab checks before the book goes back.",
  },
];

export const WORKFLOW = [
  {
    step: "01",
    title: "Crew drops the book",
    detail: "PNEZD / PENZD field book, control, CRS, and DTM limits. Quote is live from hours.",
  },
  {
    step: "02",
    title: "We reduce and code",
    detail: "Field-to-finish strings, remap unmatched alphas to the INDOT survey list, draw missing linework.",
  },
  {
    step: "03",
    title: "QA then ORD package",
    detail: "Checklist against control, EP/ES/RC, ditch, R/W. DXF, LandXML, labeled PNEZD. Net 15.",
  },
];

export const COVERAGE = [
  { title: "Where", detail: "Indiana InGCS (NAD 1983 2011). INDOT districts, consultants, and city crews." },
  { title: "Conventional", detail: "PNEZD / PENZD. Linking ST / END / CLS. Mixed crew codes remapped here." },
  { title: "Return", detail: "DXF + LandXML + ORD field book. Feature names match the INDOT OpenRoads definition list." },
];

export const SEND_LIST = [
  { title: "Control", detail: "PNEZD of monuments, InGCS or State Plane zone, epoch, and geoid." },
  { title: "Field book", detail: "Conventional PNEZD or PENZD. Alpha codes as shot. Linking ST / END / CLS." },
  { title: "Seed file", detail: "INDOT ORD workspace or DGN seed, plus the feature-definition version." },
  { title: "Limits", detail: "Begin/end stations, DTM boundary, and what is in-scope vs photo-only." },
];

export const DELIVER_LIST = [
  "DXF of breaklines and points — layers named by INDOT alpha (attach in ORD / MicroStation)",
  "LandXML 1.2 of CgPoints and plan features",
  "ORD field book (PNEZD) with INDOT alpha codes",
  "Labeled PNEZD — description is the feature definition name",
  "Feature workbook (code, definition, category, attribute type)",
  "Control report (PRE / PBMK / PMON / TRAV)",
  "Station and offset CSV on the roadway alignment",
  "Plan sheet — linework, north, scale, control",
  "QA report — unmatched, duplicates, spikes, open strings",
  "Invoice — Net 15, payable to Breakline Extraction",
];

export const METHOD = [
  "Log files and CRS on the ticket. Confirm InGCS zone and geoid.",
  "Load the conventional PNEZD / PENZD. Hold control.",
  "Field-to-finish: ST / END / CLS / J. Draw missing strings on the shots.",
  "Code every vector to the INDOT survey list. Remap unmatched alphas.",
  "QA against the topo checklist (control, EP/ES/RC, ditch, R/W, overhead).",
  "Package DXF, LandXML, ORD book, labeled PNEZD, workbook, transmittal, and invoice.",
];
