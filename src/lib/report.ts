import { getFirm, firmCityLine } from "./firm";
import type { Job } from "./jobs";
import { quoteJob, quoteLines, invoiceNumber, KIND_LABEL, TIME_LABEL } from "./jobs";
import { resolveFeature } from "./label";
import type { LabeledShot } from "./label";
import { scopeStatus } from "./scope";
import { stamp } from "./utils";

function money(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function buildTransmittal(opts: {
  job: Job;
  shots: LabeledShot[];
  remaps: Record<string, string>;
}): string {
  const { job, shots, remaps } = opts;
  let matched = 0;
  const unmatched = new Map<string, number>();
  const cats = new Map<string, number>();
  const codes = new Set<string>();
  for (const s of shots) {
    const f = resolveFeature(s, remaps);
    codes.add(s.codeToken.toUpperCase());
    if (f) {
      matched += 1;
      cats.set(f.cat, (cats.get(f.cat) ?? 0) + 1);
    } else {
      const k = (s.codeToken || "(blank)").toUpperCase();
      unmatched.set(k, (unmatched.get(k) ?? 0) + 1);
    }
  }
  const scope = scopeStatus(codes);
  const req = scope.filter((s) => s.required);
  const reqDone = req.filter((s) => s.done).length;
  const firm = getFirm();
  const total = quoteJob(job);
  const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);

  const lines = [
    firm.legal.toUpperCase(),
    firmCityLine(firm),
    firm.email,
    firm.phone,
    "",
    "EXTRACTION TRANSMITTAL",
    `Date          ${stamp()}`,
    `Job           ${job.name}`,
    `Des.          ${job.des || "—"}`,
    `Client        ${job.client}`,
    `PM            ${job.pm || "—"}`,
    `County        ${job.county}`,
    `CRS           ${job.crs}`,
    `Source        ${KIND_LABEL[job.kind]}`,
    `Quote         $${total.toLocaleString("en-US")}`,
    `Invoice       ${invoiceNumber(job)}`,
    `Hours logged  ${logged}`,
    "",
    "COUNTS",
    `Shots         ${shots.length}`,
    `Matched       ${matched}`,
    `Unmatched     ${shots.length - matched}`,
    `Required scope ${reqDone} / ${req.length}`,
    "",
    "INDOT FEATURE CATEGORIES",
    ...[...cats.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c.padEnd(18)} ${n}`),
    "",
    "SCOPE",
    ...scope.map((s) => `${s.done ? "OK " : s.required ? "GAP" : "—  "}  ${s.label}${s.hit.length ? `  [${s.hit.join(", ")}]` : ""}`),
    "",
  ];

  if (unmatched.size) {
    lines.push("UNMATCHED CODES");
    for (const [c, n] of [...unmatched.entries()].sort()) lines.push(`${c.padEnd(12)} ${n}`);
    lines.push("");
  }

  if (job.timeLog.length) {
    lines.push("TIME LOG");
    for (const t of job.timeLog) {
      lines.push(`${t.date}  ${String(t.hours).padStart(5)} h  ${(TIME_LABEL[t.kind] ?? t.kind).padEnd(10)}  ${t.note}`);
    }
    lines.push("");
  }

  if (job.ticket) {
    lines.push("TICKET");
    lines.push(job.ticket);
    lines.push("");
  }

  lines.push("DELIVERABLES");
  lines.push("- ORD field book PNEZD (original alpha codes)");
  lines.push("- ORD labeled PNEZD (INDOT feature definition names)");
  lines.push("- Full labeled workbook");
  lines.push("- Invoice");
  lines.push("- This transmittal");
  lines.push("");
  lines.push("Codes follow the INDOT OpenRoads survey feature-definition list.");
  lines.push("Breaklines flagged Break Line / Spot And Break are DTM-ready.");
  lines.push("QA/QC is run in Extract before this package leaves the desk.");
  lines.push("");
  lines.push(`${firm.name}  ·  ${firmCityLine(firm)}`);
  return lines.join("\r\n") + "\r\n";
}

export function buildInvoice(job: Job): string {
  const firm = getFirm();
  const lines = quoteLines(job);
  const total = quoteJob(job);
  const no = invoiceNumber(job);
  const date = job.sentAt || job.createdAt || stamp();
  const body = [
    firm.legal.toUpperCase(),
    firmCityLine(firm),
    firm.email,
    firm.phone,
    "",
    "INVOICE",
    `Number        ${no}`,
    `Date          ${date}`,
    `Terms         ${firm.terms}`,
    `Due           ${job.due || "—"}`,
    "",
    "BILL TO",
    job.client || "—",
    job.pm ? `Attn: ${job.pm}` : "",
    job.email || "",
    job.phone || "",
    "",
    "JOB",
    `Name          ${job.name}`,
    `Des.          ${job.des || "—"}`,
    `County        ${job.county || "—"}`,
    `CRS           ${job.crs}`,
    `Source        ${KIND_LABEL[job.kind]}`,
    job.rush ? "Rush          Yes (1.35×)" : "",
    "",
    "QTY     UNIT  DESCRIPTION                              RATE        AMOUNT",
    "--------------------------------------------------------------------------",
  ].filter((x, i, a) => x !== "" || a[i - 1] !== "");

  for (const l of lines) {
    const qtyS = qty(l.qty).padStart(6);
    const unit = l.unit.padEnd(5);
    const desc = l.desc.padEnd(38).slice(0, 38);
    const rate = money(l.rate).padStart(10);
    const amt = money(l.amount).padStart(12);
    body.push(`${qtyS}  ${unit} ${desc} ${rate}  ${amt}`);
  }
  body.push("--------------------------------------------------------------------------");
  body.push(`${"".padStart(62)}TOTAL  ${money(total).padStart(12)}`);
  body.push("");
  body.push(`Status        ${job.invoiceStatus === "paid" ? `PAID ${job.paidAt || ""}` : job.invoiceStatus === "sent" ? "SENT" : "DRAFT"}`);
  body.push("");
  body.push(`Payable to ${firm.legal}`);
  body.push(firmCityLine(firm));
  body.push(`${firm.terms}. Extraction sub work — conventional field books.`);
  if (firm.ein) body.push(`EIN ${firm.ein}`);
  body.push("");
  body.push(`${firm.name}  ·  ${firm.email}  ·  ${firm.phone}`);
  return body.join("\r\n") + "\r\n";
}

export function buildFieldbookReport(opts: {
  jobName: string;
  fileName: string;
  shots: LabeledShot[];
  remaps: Record<string, string>;
  survey: {
    crew: string;
    instrument: string;
    occupied: string;
    backsight: string;
    date: string;
    notes: string;
    hi?: string;
    ht?: string;
    weather?: string;
  };
  chains: { code: string; n: number; length: number; closed: boolean; source: string }[];
  extracts: number;
  qa: { errors: number; warns: number; infos: number };
  surface?: string;
}): string {
  const { jobName, fileName, shots, remaps, survey, chains, extracts, qa } = opts;
  const firm = getFirm();
  const control = shots.filter((s) => {
    const f = resolveFeature(s, remaps);
    return f?.cat === "Survey Control" || ["PRE", "PBMK", "PMON", "TRAV", "PIDT"].includes(s.codeToken.toUpperCase());
  });
  const codes = new Map<string, number>();
  for (const s of shots) {
    const k = s.codeToken.toUpperCase() || "(blank)";
    codes.set(k, (codes.get(k) ?? 0) + 1);
  }
  return [
    firm.legal.toUpperCase(),
    firmCityLine(firm),
    "",
    "FIELD BOOK REPORT",
    `Job           ${jobName}`,
    `Book          ${fileName || "—"}`,
    `Date          ${survey.date || stamp()}`,
    `Crew          ${survey.crew || "—"}`,
    `Instrument    ${survey.instrument || "—"}`,
    `Occupied      ${survey.occupied || "—"}`,
    `Backsight     ${survey.backsight || "—"}`,
    `HI / HT       ${survey.hi || "—"} / ${survey.ht || "—"}`,
    `Weather       ${survey.weather || "—"}`,
    "",
    "COUNTS",
    `Points        ${shots.length}`,
    `Control       ${control.length}`,
    `Linear        ${chains.length}`,
    `Extracts      ${extracts}`,
    `QA            ${qa.errors} error / ${qa.warns} warn / ${qa.infos} info`,
    opts.surface ? `Surface       ${opts.surface}` : "",
    "",
    "CODES",
    ...[...codes.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c.padEnd(12)} ${n}`),
    "",
    "LINEAR FEATURES",
    ...chains.map(
      (c) =>
        `${c.code.padEnd(8)} ${String(c.n).padStart(4)} vtx  ${c.length.toFixed(1).padStart(8)} ft  ${c.closed ? "CLS" : "open"}  ${c.source}`,
    ),
    "",
    "CONTROL",
    ...control.map(
      (s) =>
        `${s.point.padEnd(8)} ${s.northing.toFixed(4).padStart(14)} ${s.easting.toFixed(4).padStart(14)} ${s.elevation.toFixed(2).padStart(8)}  ${s.description}`,
    ),
    "",
    survey.notes ? `NOTES\n${survey.notes}\n` : "",
    `${firm.name}  ·  conventional field book — OpenRoads Survey`,
  ]
    .filter((x) => x !== undefined)
    .join("\r\n")
    .replace(/\n\n\n+/g, "\n\n") + "\r\n";
}

