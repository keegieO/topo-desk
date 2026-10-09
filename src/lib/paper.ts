import { DISCLAIMER, OUT_OF_SCOPE, DELIVER_LIST, SEND_LIST } from "./company";
import type { QaReport } from "./qa";
import { firmAddress, firmCityLine, getFirm, type FirmProfile } from "./firm";
import { invoiceNumber, KIND_LABEL, quoteJob, quoteLines, TIME_LABEL, type Job } from "./jobs";
import { resolveFeature, type LabeledShot } from "./label";
import { esc, money } from "./print";
import { scopeStatus } from "./scope";

function head(f: FirmProfile, doc: string, no?: string) {
  const addr = [f.street, firmCityLine(f)].filter(Boolean).join("<br/>");
  return `<div class="head">
    <div class="brand">
      <div class="mark">BL</div>
      <div>
        <h1>${esc(f.legal)}</h1>
        <p class="muted" style="margin:0">${esc(f.tagline)}</p>
      </div>
    </div>
    <div class="mono right muted">
      <div style="font-size:13pt;font-weight:600;color:#1a1c1e">${esc(doc)}</div>
      ${no ? `<div>${esc(no)}</div>` : ""}
      <div>${esc(f.email)}</div>
      <div>${esc(f.phone)}</div>
      <div>${addr}</div>
    </div>
  </div>
  <hr class="rule"/>`;
}

function billTo(job: Job) {
  return `<h2>Bill to</h2>
  <p>
    ${esc(job.client || "—")}<br/>
    ${job.pm ? `Attn: ${esc(job.pm)}<br/>` : ""}
    ${job.email ? `${esc(job.email)}<br/>` : ""}
    ${job.phone ? esc(job.phone) : ""}
  </p>`;
}

function jobBlock(job: Job) {
  return `<h2>Job</h2>
  <table>
    <tr><td class="muted" style="width:28%">Name</td><td>${esc(job.name)}</td></tr>
    <tr><td class="muted">Des.</td><td class="mono">${esc(job.des || "—")}</td></tr>
    <tr><td class="muted">County / CRS</td><td>${esc(job.county || "—")} · ${esc(job.crs)}</td></tr>
    <tr><td class="muted">Source</td><td>${esc(KIND_LABEL[job.kind])}${job.rush ? " · Rush 1.35×" : ""}</td></tr>
    <tr><td class="muted">Due</td><td class="mono">${esc(job.due || "—")}</td></tr>
  </table>`;
}

function linesTable(job: Job) {
  const lines = quoteLines(job);
  const total = quoteJob(job);
  const rows = lines
    .map(
      (l) => `<tr>
      <td class="right" style="width:8%">${esc(String(l.qty))}</td>
      <td style="width:10%">${esc(l.unit)}</td>
      <td>${esc(l.desc)}</td>
      <td class="right" style="width:16%">${money(l.rate)}</td>
      <td class="right" style="width:16%">${money(l.amount)}</td>
    </tr>`,
    )
    .join("");
  return `<h2>Amounts</h2>
  <table>
    <thead><tr><th class="right">Qty</th><th>Unit</th><th>Description</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="total"><td colspan="4" class="right">Total</td><td class="right">$${money(total)}</td></tr>
    </tbody>
  </table>`;
}

function disclaimer() {
  return `<p class="disclaimer">${esc(DISCLAIMER)}</p>`;
}

function sig(f: FirmProfile, client: string) {
  return `<div class="sig">
    <div><div class="line">Accepted — ${esc(client || "Client PM")} / date</div></div>
    <div><div class="line">${esc(f.legal)} / date</div></div>
  </div>`;
}

export function htmlInvoice(job: Job): string {
  const f = getFirm();
  const no = invoiceNumber(job);
  const date = job.sentAt || job.createdAt || new Date().toISOString().slice(0, 10);
  const status =
    job.invoiceStatus === "paid" ? `PAID ${job.paidAt || ""}` : job.invoiceStatus === "sent" ? "SENT" : "DRAFT";
  return `${head(f, "Invoice", no)}
  <p class="mono muted">Date ${esc(date)} · Terms ${esc(f.terms)} · Due ${esc(job.due || "—")} · ${esc(status)}</p>
  ${billTo(job)}
  ${jobBlock(job)}
  ${linesTable(job)}
  <h2>Remit</h2>
  <p>Payable to ${esc(f.legal)}${f.ein ? ` · EIN ${esc(f.ein)}` : ""}<br/>${esc(firmAddress(f))}<br/>${esc(f.remit)}</p>
  ${disclaimer()}`;
}

export function htmlProposal(job: Job): string {
  const f = getFirm();
  const total = quoteJob(job);
  const send = SEND_LIST.map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.detail)}</li>`).join("");
  const del = DELIVER_LIST.map((d) => `<li>${esc(d)}</li>`).join("");
  const out = OUT_OF_SCOPE.map((d) => `<li>${esc(d)}</li>`).join("");
  return `${head(f, "Proposal", job.des ? `Des. ${job.des}` : undefined)}
  <p>Proposal for extraction sub work. Quote <strong>$${money(total)}</strong>. Terms ${esc(f.terms)}. Valid 30 days.</p>
  ${billTo(job)}
  ${jobBlock(job)}
  ${job.notes ? `<h2>Scope notes</h2><p>${esc(job.notes)}</p>` : ""}
  ${linesTable(job)}
  <h2>What we need from you</h2>
  <ul>${send}</ul>
  <h2>What you get</h2>
  <ul>${del}</ul>
  <h2>Out of scope</h2>
  <ul>${out}</ul>
  ${disclaimer()}
  ${sig(f, job.client)}`;
}

export function htmlSow(job?: Job): string {
  const f = getFirm();
  const title = job ? `Work order · ${job.des || job.name}` : "Extraction subcontract (template)";
  const jobBit = job
    ? `${billTo(job)}${jobBlock(job)}${linesTable(job)}`
    : `<p class="muted">Attach this to a job-specific proposal. Fill client, Des., miles, and due date before sending.</p>`;
  return `${head(f, title)}
  ${jobBit}
  <h2>1. Parties</h2>
  <p>${esc(f.legal)} (“Sub”) will perform extraction and coding described in the attached proposal for the client named above (“Client”). Client’s licensed land surveyor of record remains responsible for the survey.</p>
  <h2>2. Services</h2>
  <p>Sub reduces conventional field books, remaps alpha codes to the INDOT OpenRoads survey feature-definition list, runs QA/QC, and returns CAD-ready files. LiDAR / TopoDOT production extraction is out of scope.</p>
  <h2>3. Deliverables</h2>
  <ul>${DELIVER_LIST.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
  <h2>4. Client-furnished items</h2>
  <ul>${SEND_LIST.map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.detail)}</li>`).join("")}</ul>
  <p>Field books larger than browser storage stay on Client’s transfer (ShareFile, Dropbox, or FTP). Sub logs file names and CRS on the ticket.</p>
  <h2>5. Schedule and changes</h2>
  <p>Due date is in the proposal. Rush is 1.35× when the due date is under five working days. Extra miles, extra planimetrics, or added tiles are change orders, quoted before the extra work starts.</p>
  <h2>6. Fees and payment</h2>
  <p>Fees follow the proposal. ${esc(f.terms)}. Late invoices accrue 1.5% per month on unpaid balances. Work product may be withheld on accounts more than 30 days past due.</p>
  <h2>7. License and stamp</h2>
  <p>${esc(DISCLAIMER)}</p>
  <h2>8. Standard of care</h2>
  <p>Sub will perform the work with the care ordinarily used by extraction technicians on INDOT topographic surveys. This is not a warranty of fitness for a particular design. Client’s LS reviews and accepts the files before they go to design.</p>
  <h2>9. Liability</h2>
  <p>Sub’s aggregate liability for a job is limited to the fees paid for that job. Neither party is liable for incidental or consequential damages. ${f.gl ? `General liability: ${esc(f.gl)}. ` : ""}${f.eo ? `Professional liability: ${esc(f.eo)}.` : "Certificates of insurance issued on request."}</p>
  <h2>10. Files and reuse</h2>
  <p>Client owns the delivered files for the named job. Sub may keep a working copy for QA and archive. Sub’s INDOT code library, templates, and software remain Sub’s.</p>
  <h2>11. Law</h2>
  <p>Indiana law. Venue in Johnson County, Indiana. This template should be reviewed by counsel before first use.</p>
  ${sig(f, job?.client ?? "Client")}`;
}

export function htmlVendor(): string {
  const f = getFirm();
  return `${head(f, "Vendor information")}
  <p>Send this with the W-9. This is not an IRS form.</p>
  <table>
    <tr><td class="muted" style="width:32%">Legal name</td><td>${esc(f.legal)}</td></tr>
    <tr><td class="muted">DBA</td><td>${esc(f.name)}</td></tr>
    <tr><td class="muted">Address</td><td>${esc(firmAddress(f))}</td></tr>
    <tr><td class="muted">Phone</td><td class="mono">${esc(f.phone)}</td></tr>
    <tr><td class="muted">Email</td><td class="mono">${esc(f.email)}</td></tr>
    <tr><td class="muted">EIN</td><td class="mono">${esc(f.ein || "Add EIN on Shop")}</td></tr>
    <tr><td class="muted">Terms</td><td>${esc(f.terms)}</td></tr>
    <tr><td class="muted">Remit</td><td>${esc(f.remit)}</td></tr>
    <tr><td class="muted">Hours</td><td>${esc(f.hours)}</td></tr>
    <tr><td class="muted">General liability</td><td>${esc(f.gl || "Add carrier and limit on Shop")}</td></tr>
    <tr><td class="muted">Professional liability</td><td>${esc(f.eo || "Add carrier and limit on Shop")}</td></tr>
  </table>
  ${disclaimer()}`;
}

export function htmlTransmittal(opts: {
  job: Job;
  shots: LabeledShot[];
  remaps: Record<string, string>;
}): string {
  const { job, shots, remaps } = opts;
  const f = getFirm();
  let matched = 0;
  const unmatched = new Map<string, number>();
  const cats = new Map<string, number>();
  const codes = new Set<string>();
  for (const s of shots) {
    const feat = resolveFeature(s, remaps);
    codes.add(s.codeToken.toUpperCase());
    if (feat) {
      matched += 1;
      cats.set(feat.cat, (cats.get(feat.cat) ?? 0) + 1);
    } else {
      const k = (s.codeToken || "(blank)").toUpperCase();
      unmatched.set(k, (unmatched.get(k) ?? 0) + 1);
    }
  }
  const scope = scopeStatus(codes);
  const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);
  const catRows = [...cats.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `<tr><td>${esc(c)}</td><td class="right">${n}</td></tr>`)
    .join("");
  const scopeRows = scope
    .map(
      (s) =>
        `<tr><td>${s.done ? "OK" : s.required ? "GAP" : "—"}</td><td>${esc(s.label)}</td><td class="mono muted">${esc(s.hit.join(", ") || s.codes.join(", "))}</td></tr>`,
    )
    .join("");
  const um = unmatched.size
    ? `<h2>Unmatched codes</h2><table>${[...unmatched.entries()].map(([c, n]) => `<tr><td class="mono">${esc(c)}</td><td class="right">${n}</td></tr>`).join("")}</table>`
    : "";
  const time = job.timeLog.length
    ? `<h2>Time log</h2>
      <table>${job.timeLog.map((t) => `<tr><td class="mono">${esc(t.date)}</td><td class="right">${t.hours} h</td><td>${esc(TIME_LABEL[t.kind] ?? t.kind)}</td><td>${esc(t.note)}</td></tr>`).join("")}</table>`
    : "";

  return `${head(f, "Extraction transmittal", invoiceNumber(job))}
  ${jobBlock(job)}
  <h2>Counts</h2>
  <table>
    <tr><td>Shots</td><td class="right">${shots.length}</td></tr>
    <tr><td>Matched</td><td class="right">${matched}</td></tr>
    <tr><td>Unmatched</td><td class="right">${shots.length - matched}</td></tr>
    <tr><td>Hours logged</td><td class="right">${logged}</td></tr>
    <tr><td>Quote</td><td class="right">$${money(quoteJob(job))}</td></tr>
  </table>
  <h2>INDOT feature categories</h2>
  <table>${catRows || `<tr><td class="muted">No matched shots.</td></tr>`}</table>
  <h2>Scope checklist</h2>
  <table>
    <thead><tr><th></th><th>Item</th><th>Codes</th></tr></thead>
    <tbody>${scopeRows}</tbody>
  </table>
  ${um}
  ${time}
  ${job.ticket ? `<h2>Ticket</h2><p>${esc(job.ticket)}</p>` : ""}
  <h2>Deliverables in this package</h2>
  <ul>${DELIVER_LIST.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
  ${disclaimer()}`;
}

const SEV_COLOR: Record<string, string> = {
  error: "#c0392b",
  warn: "#d68910",
  info: "#1a5276",
};

export function htmlQaReport(job: Job, report: QaReport, shots: LabeledShot[]): string {
  const f = getFirm();

  // Build a map from uid → point number for resolving shotUids
  const uidToPoint = new Map<string, string>();
  for (const s of shots) {
    uidToPoint.set(s.uid, s.point);
  }

  if (report.issues.length === 0) {
    return `${head(f, "QA Report", job.des ? `Des. ${job.des}` : undefined)}
  ${jobBlock(job)}
  <div style="text-align:center;padding:2em 0;font-size:18pt;color:#1e8449;font-weight:600">Pass — 0 findings</div>`;
  }

  // Summary table
  const summaryRows = [
    { label: "Errors", count: report.errors, sev: "error" },
    { label: "Warnings", count: report.warns, sev: "warn" },
    { label: "Infos", count: report.infos, sev: "info" },
  ]
    .map(
      (r) => `<tr>
      <td><span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${SEV_COLOR[r.sev]};color:#fff;font-size:9pt;font-weight:600">${esc(r.label)}</span></td>
      <td class="right" style="font-weight:${r.count > 0 ? "600" : "normal"};color:${r.count > 0 ? SEV_COLOR[r.sev] : "inherit"}">${r.count}</td>
    </tr>`,
    )
    .join("");

  // Sort issues: errors first, then warns, then infos
  const ORDER: Record<string, number> = { error: 0, warn: 1, info: 2 };
  const sorted = [...report.issues].sort((a, b) => (ORDER[a.severity] ?? 3) - (ORDER[b.severity] ?? 3));

  const issueRows = sorted
    .map((issue) => {
      const pts = issue.shotUids
        .map((uid) => uidToPoint.get(uid) ?? uid)
        .filter(Boolean)
        .join(", ");
      return `<tr>
      <td style="white-space:nowrap">
        <span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${SEV_COLOR[issue.severity]};color:#fff;font-size:8pt;font-weight:600">${esc(issue.severity.toUpperCase())}</span>
      </td>
      <td class="mono" style="font-size:8pt;white-space:nowrap">${esc(issue.check)}</td>
      <td><strong>${esc(issue.title)}</strong><br/><span class="muted" style="font-size:8.5pt">${esc(issue.detail)}</span></td>
      <td class="mono muted" style="font-size:8pt;white-space:nowrap">${esc(pts)}</td>
    </tr>`;
    })
    .join("");

  return `${head(f, "QA Report", job.des ? `Des. ${job.des}` : undefined)}
  ${jobBlock(job)}
  <h2>Summary</h2>
  <table><tbody>${summaryRows}</tbody></table>
  <h2>Findings</h2>
  <table>
    <thead><tr><th>Sev.</th><th>Check</th><th>Finding</th><th>Points</th></tr></thead>
    <tbody>${issueRows}</tbody>
  </table>`;
}

const CONTROL_CODES = new Set(["PRE", "PBMK", "PMON", "TRAV", "PIDT", "CK", "CHECK", "CHK"]);

export function htmlControlReport(job: Job, shots: LabeledShot[]): string {
  const f = getFirm();

  const controls = shots
    .filter((s) => CONTROL_CODES.has(s.codeToken.toUpperCase()))
    .sort((a, b) => {
      const na = Number(a.point);
      const nb = Number(b.point);
      const aNum = isNaN(na);
      const bNum = isNaN(nb);
      if (aNum && bNum) return a.point.localeCompare(b.point);
      if (aNum) return 1;
      if (bNum) return -1;
      return na - nb;
    });

  const rows = controls
    .map(
      (s) => `<tr>
      <td class="mono">${esc(s.point)}</td>
      <td class="mono">${esc(s.codeToken.toUpperCase())}</td>
      <td class="mono right">${s.northing.toFixed(4)}</td>
      <td class="mono right">${s.easting.toFixed(4)}</td>
      <td class="mono right">${s.elevation.toFixed(2)}</td>
      <td>${esc(s.description)}</td>
    </tr>`,
    )
    .join("");

  return `${head(f, "Control report", job.des ? `Des. ${job.des}` : undefined)}
  ${jobBlock(job)}
  <table>
    <thead><tr><th>Pt #</th><th>Code</th><th class="right">Northing</th><th class="right">Easting</th><th class="right">Elevation</th><th>Description</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="6" class="muted">No control points found.</td></tr>`}</tbody>
  </table>
  <p class="muted" style="margin-top:1em;font-size:9pt">${controls.length} control point${controls.length === 1 ? "" : "s"}</p>
  ${sig(f, job.client)}`;
}
