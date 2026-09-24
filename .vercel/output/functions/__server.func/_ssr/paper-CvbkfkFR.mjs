import { a as OUT_OF_SCOPE, i as DISCLAIMER, r as DELIVER_LIST, s as SEND_LIST } from "./company-D0owGUeH.mjs";
import { a as TIME_LABEL, c as invoiceNumber, d as quoteJob, f as quoteLines, n as KIND_LABEL } from "./job-types-DRBj8xWf.mjs";
import { i as downloadText } from "./router-pTBIT-ZP.mjs";
import { d as firmAddress, f as firmCityLine, m as getFirm, v as resolveFeature } from "./label-CD5-qmOw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/paper-CvbkfkFR.js
function wrapPrint(title, inner) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escAttr(title)}</title>
<style>
  @page { size: letter; margin: 0.7in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #1a1c1e; }
  body {
    font-family: "IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
  }
  h1 { font-size: 16pt; font-weight: 600; margin: 0 0 4pt; letter-spacing: -0.02em; }
  h2 { font-size: 10pt; font-weight: 600; margin: 18pt 0 6pt; letter-spacing: 0.08em; text-transform: uppercase; color: #3a3e44; }
  p { margin: 0 0 8pt; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { text-align: left; font-weight: 500; border-bottom: 1px solid #1a1c1e; padding: 4pt 6pt; font-size: 8pt; letter-spacing: 0.06em; text-transform: uppercase; color: #5c6066; }
  td { padding: 5pt 6pt; border-bottom: 1px solid #d8d8d4; vertical-align: top; }
  .right { text-align: right; font-variant-numeric: tabular-nums; }
  .mono { font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace; font-size: 9.5pt; }
  .muted { color: #5c6066; }
  .rule { border: 0; border-top: 1.5pt solid #1a1c1e; margin: 10pt 0 12pt; }
  .hair { border: 0; border-top: 1px solid #c8c8c2; margin: 10pt 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16pt; }
  .mark { width: 28pt; height: 28pt; background: #215e9e; color: #f7f7f3; display: flex; align-items: center; justify-content: center; font-size: 8pt; font-weight: 600; letter-spacing: 0.04em; }
  .brand { display: flex; gap: 10pt; align-items: center; }
  .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 24pt; margin-top: 28pt; }
  .sig .line { border-top: 1px solid #1a1c1e; margin-top: 28pt; padding-top: 6pt; font-size: 9pt; color: #5c6066; }
  .disclaimer { font-size: 8.5pt; color: #5c6066; margin-top: 18pt; }
  .total td { border-bottom: none; font-weight: 600; font-size: 11pt; }
  ul { margin: 0 0 8pt; padding-left: 16pt; }
  li { margin: 0 0 3pt; }
  @media print { .noprint { display: none !important; } }
  .noprint { margin: 12pt 0 18pt; }
  .noprint button {
    font: 500 11pt "IBM Plex Sans", sans-serif;
    background: #215e9e; color: #fff; border: 0; padding: 8pt 14pt; cursor: pointer;
  }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">Print / save PDF</button></div>
  ${inner}
</body>
</html>`;
}
function openDocument(filename, html) {
	const w = window.open("", "_blank", "noopener,noreferrer,width=1100,height=760");
	if (!w) {
		downloadText(filename, html, "text/html;charset=utf-8");
		return;
	}
	w.document.open();
	w.document.write(html);
	w.document.close();
}
function printHtml(title, inner) {
	const html = wrapPrint(title, inner);
	const w = window.open("", "_blank", "noopener,noreferrer,width=920,height=1100");
	if (!w) {
		downloadText(`${safeFile(title)}.html`, html, "text/html;charset=utf-8");
		return;
	}
	w.document.open();
	w.document.write(html);
	w.document.close();
}
function esc(s) {
	return String(s ?? "").replace(/[&<>"']/g, (c) => {
		if (c === "&") return "&amp;";
		if (c === "<") return "&lt;";
		if (c === ">") return "&gt;";
		if (c === "\"") return "&quot;";
		return "&#39;";
	});
}
function escAttr(s) {
	return esc(s);
}
function safeFile(s) {
	return s.replace(/[^\w.-]+/g, "_").slice(0, 80) || "document";
}
function money(n) {
	return n.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
var TOPO_SCOPE = [
	{
		id: "ctrl",
		group: "Control",
		label: "Control / rebar / benchmarks",
		codes: [
			"PRE",
			"PBMK",
			"PMON",
			"TRAV",
			"PIDT",
			"PPIN"
		],
		required: true
	},
	{
		id: "ep",
		group: "Roadway",
		label: "Pavement edge",
		codes: ["EP"],
		required: true
	},
	{
		id: "es",
		group: "Roadway",
		label: "Shoulder edge",
		codes: ["ES"],
		required: true
	},
	{
		id: "rc",
		group: "Roadway",
		label: "Road crown",
		codes: ["RC"],
		required: true
	},
	{
		id: "ct",
		group: "Roadway",
		label: "Curb (top / back / bottom)",
		codes: [
			"CT",
			"CB",
			"CG"
		],
		required: false
	},
	{
		id: "dl",
		group: "Drainage",
		label: "Ditch / flow line",
		codes: ["DL", "WF"],
		required: true
	},
	{
		id: "str",
		group: "Drainage",
		label: "Inlets / pipes / catch basins",
		codes: [
			"DR",
			"PCBD",
			"PCRB",
			"PCST",
			"HD"
		],
		required: false
	},
	{
		id: "br",
		group: "Right of Way",
		label: "Existing R/W",
		codes: ["BR", "PCON"],
		required: true
	},
	{
		id: "ov",
		group: "Utility",
		label: "Overhead utilities",
		codes: [
			"OV",
			"PPOL",
			"PPWP"
		],
		required: true
	},
	{
		id: "ug",
		group: "Utility",
		label: "Underground marks (gas, fiber, water)",
		codes: [
			"UG",
			"UF",
			"UW",
			"PFOM",
			"PGSO",
			"PHYD"
		],
		required: false
	},
	{
		id: "tr",
		group: "Traffic",
		label: "Signs / lane lines / delineators",
		codes: [
			"PSGN",
			"PSND",
			"LL",
			"PDEL"
		],
		required: true
	},
	{
		id: "prop",
		group: "Property",
		label: "Fence / mailbox / buildings",
		codes: [
			"FF",
			"FW",
			"PMBX",
			"BD"
		],
		required: false
	},
	{
		id: "topo",
		group: "Topo",
		label: "Woods / trees / riprap",
		codes: [
			"WL",
			"PTDS",
			"RP"
		],
		required: false
	},
	{
		id: "gr",
		group: "Roadway",
		label: "Guardrail",
		codes: [
			"RB",
			"RA",
			"RX"
		],
		required: false
	}
];
function scopeStatus(codesPresent) {
	return TOPO_SCOPE.map((item) => {
		const hit = item.codes.filter((c) => codesPresent.has(c.toUpperCase()));
		return {
			...item,
			hit,
			done: hit.length > 0
		};
	});
}
function head(f, doc, no) {
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
function billTo(job) {
	return `<h2>Bill to</h2>
  <p>
    ${esc(job.client || "—")}<br/>
    ${job.pm ? `Attn: ${esc(job.pm)}<br/>` : ""}
    ${job.email ? `${esc(job.email)}<br/>` : ""}
    ${job.phone ? esc(job.phone) : ""}
  </p>`;
}
function jobBlock(job) {
	return `<h2>Job</h2>
  <table>
    <tr><td class="muted" style="width:28%">Name</td><td>${esc(job.name)}</td></tr>
    <tr><td class="muted">Des.</td><td class="mono">${esc(job.des || "—")}</td></tr>
    <tr><td class="muted">County / CRS</td><td>${esc(job.county || "—")} · ${esc(job.crs)}</td></tr>
    <tr><td class="muted">Source</td><td>${esc(KIND_LABEL[job.kind])}${job.rush ? " · Rush 1.35×" : ""}</td></tr>
    <tr><td class="muted">Due</td><td class="mono">${esc(job.due || "—")}</td></tr>
  </table>`;
}
function linesTable(job) {
	const lines = quoteLines(job);
	const total = quoteJob(job);
	return `<h2>Amounts</h2>
  <table>
    <thead><tr><th class="right">Qty</th><th>Unit</th><th>Description</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
    <tbody>
      ${lines.map((l) => `<tr>
      <td class="right" style="width:8%">${esc(String(l.qty))}</td>
      <td style="width:10%">${esc(l.unit)}</td>
      <td>${esc(l.desc)}</td>
      <td class="right" style="width:16%">${money(l.rate)}</td>
      <td class="right" style="width:16%">${money(l.amount)}</td>
    </tr>`).join("")}
      <tr class="total"><td colspan="4" class="right">Total</td><td class="right">$${money(total)}</td></tr>
    </tbody>
  </table>`;
}
function disclaimer() {
	return `<p class="disclaimer">${esc(DISCLAIMER)}</p>`;
}
function sig(f, client) {
	return `<div class="sig">
    <div><div class="line">Accepted — ${esc(client || "Client PM")} / date</div></div>
    <div><div class="line">${esc(f.legal)} / date</div></div>
  </div>`;
}
function htmlInvoice(job) {
	const f = getFirm();
	const no = invoiceNumber(job);
	const date = job.sentAt || job.createdAt || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const status = job.invoiceStatus === "paid" ? `PAID ${job.paidAt || ""}` : job.invoiceStatus === "sent" ? "SENT" : "DRAFT";
	return `${head(f, "Invoice", no)}
  <p class="mono muted">Date ${esc(date)} · Terms ${esc(f.terms)} · Due ${esc(job.due || "—")} · ${esc(status)}</p>
  ${billTo(job)}
  ${jobBlock(job)}
  ${linesTable(job)}
  <h2>Remit</h2>
  <p>Payable to ${esc(f.legal)}${f.ein ? ` · EIN ${esc(f.ein)}` : ""}<br/>${esc(firmAddress(f))}<br/>${esc(f.remit)}</p>
  ${disclaimer()}`;
}
function htmlProposal(job) {
	const f = getFirm();
	const total = quoteJob(job);
	const send = SEND_LIST.map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.detail)}</li>`).join("");
	const del = DELIVER_LIST.map((d) => `<li>${esc(d)}</li>`).join("");
	const out = OUT_OF_SCOPE.map((d) => `<li>${esc(d)}</li>`).join("");
	return `${head(f, "Proposal", job.des ? `Des. ${job.des}` : void 0)}
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
function htmlSow(job) {
	const f = getFirm();
	const title = job ? `Work order · ${job.des || job.name}` : "Extraction subcontract (template)";
	const jobBit = job ? `${billTo(job)}${jobBlock(job)}${linesTable(job)}` : `<p class="muted">Attach this to a job-specific proposal. Fill client, Des., miles, and due date before sending.</p>`;
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
function htmlVendor() {
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
function htmlTransmittal(opts) {
	const { job, shots, remaps } = opts;
	const f = getFirm();
	let matched = 0;
	const unmatched = /* @__PURE__ */ new Map();
	const cats = /* @__PURE__ */ new Map();
	const codes = /* @__PURE__ */ new Set();
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
	const catRows = [...cats.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `<tr><td>${esc(c)}</td><td class="right">${n}</td></tr>`).join("");
	const scopeRows = scope.map((s) => `<tr><td>${s.done ? "OK" : s.required ? "GAP" : "—"}</td><td>${esc(s.label)}</td><td class="mono muted">${esc(s.hit.join(", ") || s.codes.join(", "))}</td></tr>`).join("");
	const um = unmatched.size ? `<h2>Unmatched codes</h2><table>${[...unmatched.entries()].map(([c, n]) => `<tr><td class="mono">${esc(c)}</td><td class="right">${n}</td></tr>`).join("")}</table>` : "";
	const time = job.timeLog.length ? `<h2>Time log</h2>
      <table>${job.timeLog.map((t) => `<tr><td class="mono">${esc(t.date)}</td><td class="right">${t.hours} h</td><td>${esc(TIME_LABEL[t.kind] ?? t.kind)}</td><td>${esc(t.note)}</td></tr>`).join("")}</table>` : "";
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
//#endregion
export { htmlTransmittal as a, printHtml as c, htmlSow as i, scopeStatus as l, htmlInvoice as n, htmlVendor as o, htmlProposal as r, openDocument as s, esc as t };
