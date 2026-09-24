import{r as e}from"./utils-DrFK5Y6O.js";import{D as t,E as n,O as r,S as i,T as a,a as o,k as s,w as c,y as l}from"./label-Dk8ArXTg.js";import{c as u,d,l as f,s as p}from"./button-CiSBz239.js";function m(e,t){return`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${v(e)}</title>
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
  ${t}
</body>
</html>`}function h(t,n){let r=window.open(``,`_blank`,`noopener,noreferrer,width=1100,height=760`);if(!r){e(t,n,`text/html;charset=utf-8`);return}r.document.open(),r.document.write(n),r.document.close()}function g(t,n){let r=m(t,n),i=window.open(``,`_blank`,`noopener,noreferrer,width=920,height=1100`);if(!i){e(`${y(t)}.html`,r,`text/html;charset=utf-8`);return}i.document.open(),i.document.write(r),i.document.close()}function _(e){return String(e??``).replace(/[&<>"']/g,e=>e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e===`"`?`&quot;`:`&#39;`)}function v(e){return _(e)}function y(e){return e.replace(/[^\w.-]+/g,`_`).slice(0,80)||`document`}function b(e){return e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2})}var x=[{id:`ctrl`,group:`Control`,label:`Control / rebar / benchmarks`,codes:[`PRE`,`PBMK`,`PMON`,`TRAV`,`PIDT`,`PPIN`],required:!0},{id:`ep`,group:`Roadway`,label:`Pavement edge`,codes:[`EP`],required:!0},{id:`es`,group:`Roadway`,label:`Shoulder edge`,codes:[`ES`],required:!0},{id:`rc`,group:`Roadway`,label:`Road crown`,codes:[`RC`],required:!0},{id:`ct`,group:`Roadway`,label:`Curb (top / back / bottom)`,codes:[`CT`,`CB`,`CG`],required:!1},{id:`dl`,group:`Drainage`,label:`Ditch / flow line`,codes:[`DL`,`WF`],required:!0},{id:`str`,group:`Drainage`,label:`Inlets / pipes / catch basins`,codes:[`DR`,`PCBD`,`PCRB`,`PCST`,`HD`],required:!1},{id:`br`,group:`Right of Way`,label:`Existing R/W`,codes:[`BR`,`PCON`],required:!0},{id:`ov`,group:`Utility`,label:`Overhead utilities`,codes:[`OV`,`PPOL`,`PPWP`],required:!0},{id:`ug`,group:`Utility`,label:`Underground marks (gas, fiber, water)`,codes:[`UG`,`UF`,`UW`,`PFOM`,`PGSO`,`PHYD`],required:!1},{id:`tr`,group:`Traffic`,label:`Signs / lane lines / delineators`,codes:[`PSGN`,`PSND`,`LL`,`PDEL`],required:!0},{id:`prop`,group:`Property`,label:`Fence / mailbox / buildings`,codes:[`FF`,`FW`,`PMBX`,`BD`],required:!1},{id:`topo`,group:`Topo`,label:`Woods / trees / riprap`,codes:[`WL`,`PTDS`,`RP`],required:!1},{id:`gr`,group:`Roadway`,label:`Guardrail`,codes:[`RB`,`RA`,`RX`],required:!1}];function S(e){return x.map(t=>{let n=t.codes.filter(t=>e.has(t.toUpperCase()));return{...t,hit:n,done:n.length>0}})}function C(e,t,n){let i=[e.street,r(e)].filter(Boolean).join(`<br/>`);return`<div class="head">
    <div class="brand">
      <div class="mark">BL</div>
      <div>
        <h1>${_(e.legal)}</h1>
        <p class="muted" style="margin:0">${_(e.tagline)}</p>
      </div>
    </div>
    <div class="mono right muted">
      <div style="font-size:13pt;font-weight:600;color:#1a1c1e">${_(t)}</div>
      ${n?`<div>${_(n)}</div>`:``}
      <div>${_(e.email)}</div>
      <div>${_(e.phone)}</div>
      <div>${i}</div>
    </div>
  </div>
  <hr class="rule"/>`}function w(e){return`<h2>Bill to</h2>
  <p>
    ${_(e.client||`—`)}<br/>
    ${e.pm?`Attn: ${_(e.pm)}<br/>`:``}
    ${e.email?`${_(e.email)}<br/>`:``}
    ${e.phone?_(e.phone):``}
  </p>`}function T(e){return`<h2>Job</h2>
  <table>
    <tr><td class="muted" style="width:28%">Name</td><td>${_(e.name)}</td></tr>
    <tr><td class="muted">Des.</td><td class="mono">${_(e.des||`—`)}</td></tr>
    <tr><td class="muted">County / CRS</td><td>${_(e.county||`—`)} · ${_(e.crs)}</td></tr>
    <tr><td class="muted">Source</td><td>${_(l[e.kind])}${e.rush?` · Rush 1.35×`:``}</td></tr>
    <tr><td class="muted">Due</td><td class="mono">${_(e.due||`—`)}</td></tr>
  </table>`}function E(e){let t=n(e),r=a(e);return`<h2>Amounts</h2>
  <table>
    <thead><tr><th class="right">Qty</th><th>Unit</th><th>Description</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
    <tbody>
      ${t.map(e=>`<tr>
      <td class="right" style="width:8%">${_(String(e.qty))}</td>
      <td style="width:10%">${_(e.unit)}</td>
      <td>${_(e.desc)}</td>
      <td class="right" style="width:16%">${b(e.rate)}</td>
      <td class="right" style="width:16%">${b(e.amount)}</td>
    </tr>`).join(``)}
      <tr class="total"><td colspan="4" class="right">Total</td><td class="right">$${b(r)}</td></tr>
    </tbody>
  </table>`}function D(){return`<p class="disclaimer">${_(u)}</p>`}function O(e,t){return`<div class="sig">
    <div><div class="line">Accepted — ${_(t||`Client PM`)} / date</div></div>
    <div><div class="line">${_(e.legal)} / date</div></div>
  </div>`}function k(e){let n=s(),r=c(e),i=e.sentAt||e.createdAt||new Date().toISOString().slice(0,10),a=e.invoiceStatus===`paid`?`PAID ${e.paidAt||``}`:e.invoiceStatus===`sent`?`SENT`:`DRAFT`;return`${C(n,`Invoice`,r)}
  <p class="mono muted">Date ${_(i)} · Terms ${_(n.terms)} · Due ${_(e.due||`—`)} · ${_(a)}</p>
  ${w(e)}
  ${T(e)}
  ${E(e)}
  <h2>Remit</h2>
  <p>Payable to ${_(n.legal)}${n.ein?` · EIN ${_(n.ein)}`:``}<br/>${_(t(n))}<br/>${_(n.remit)}</p>
  ${D()}`}function A(e){let t=s(),n=a(e),r=d.map(e=>`<li><strong>${_(e.title)}.</strong> ${_(e.detail)}</li>`).join(``),i=p.map(e=>`<li>${_(e)}</li>`).join(``),o=f.map(e=>`<li>${_(e)}</li>`).join(``);return`${C(t,`Proposal`,e.des?`Des. ${e.des}`:void 0)}
  <p>Proposal for extraction sub work. Quote <strong>$${b(n)}</strong>. Terms ${_(t.terms)}. Valid 30 days.</p>
  ${w(e)}
  ${T(e)}
  ${e.notes?`<h2>Scope notes</h2><p>${_(e.notes)}</p>`:``}
  ${E(e)}
  <h2>What we need from you</h2>
  <ul>${r}</ul>
  <h2>What you get</h2>
  <ul>${i}</ul>
  <h2>Out of scope</h2>
  <ul>${o}</ul>
  ${D()}
  ${O(t,e.client)}`}function j(e){let t=s(),n=e?`Work order · ${e.des||e.name}`:`Extraction subcontract (template)`,r=e?`${w(e)}${T(e)}${E(e)}`:`<p class="muted">Attach this to a job-specific proposal. Fill client, Des., miles, and due date before sending.</p>`;return`${C(t,n)}
  ${r}
  <h2>1. Parties</h2>
  <p>${_(t.legal)} (“Sub”) will perform extraction and coding described in the attached proposal for the client named above (“Client”). Client’s licensed land surveyor of record remains responsible for the survey.</p>
  <h2>2. Services</h2>
  <p>Sub reduces conventional field books, remaps alpha codes to the INDOT OpenRoads survey feature-definition list, runs QA/QC, and returns CAD-ready files. LiDAR / TopoDOT production extraction is out of scope.</p>
  <h2>3. Deliverables</h2>
  <ul>${p.map(e=>`<li>${_(e)}</li>`).join(``)}</ul>
  <h2>4. Client-furnished items</h2>
  <ul>${d.map(e=>`<li><strong>${_(e.title)}.</strong> ${_(e.detail)}</li>`).join(``)}</ul>
  <p>Field books larger than browser storage stay on Client’s transfer (ShareFile, Dropbox, or FTP). Sub logs file names and CRS on the ticket.</p>
  <h2>5. Schedule and changes</h2>
  <p>Due date is in the proposal. Rush is 1.35× when the due date is under five working days. Extra miles, extra planimetrics, or added tiles are change orders, quoted before the extra work starts.</p>
  <h2>6. Fees and payment</h2>
  <p>Fees follow the proposal. ${_(t.terms)}. Late invoices accrue 1.5% per month on unpaid balances. Work product may be withheld on accounts more than 30 days past due.</p>
  <h2>7. License and stamp</h2>
  <p>${_(u)}</p>
  <h2>8. Standard of care</h2>
  <p>Sub will perform the work with the care ordinarily used by extraction technicians on INDOT topographic surveys. This is not a warranty of fitness for a particular design. Client’s LS reviews and accepts the files before they go to design.</p>
  <h2>9. Liability</h2>
  <p>Sub’s aggregate liability for a job is limited to the fees paid for that job. Neither party is liable for incidental or consequential damages. ${t.gl?`General liability: ${_(t.gl)}. `:``}${t.eo?`Professional liability: ${_(t.eo)}.`:`Certificates of insurance issued on request.`}</p>
  <h2>10. Files and reuse</h2>
  <p>Client owns the delivered files for the named job. Sub may keep a working copy for QA and archive. Sub’s INDOT code library, templates, and software remain Sub’s.</p>
  <h2>11. Law</h2>
  <p>Indiana law. Venue in Johnson County, Indiana. This template should be reviewed by counsel before first use.</p>
  ${O(t,e?.client??`Client`)}`}function M(){let e=s();return`${C(e,`Vendor information`)}
  <p>Send this with the W-9. This is not an IRS form.</p>
  <table>
    <tr><td class="muted" style="width:32%">Legal name</td><td>${_(e.legal)}</td></tr>
    <tr><td class="muted">DBA</td><td>${_(e.name)}</td></tr>
    <tr><td class="muted">Address</td><td>${_(t(e))}</td></tr>
    <tr><td class="muted">Phone</td><td class="mono">${_(e.phone)}</td></tr>
    <tr><td class="muted">Email</td><td class="mono">${_(e.email)}</td></tr>
    <tr><td class="muted">EIN</td><td class="mono">${_(e.ein||`Add EIN on Shop`)}</td></tr>
    <tr><td class="muted">Terms</td><td>${_(e.terms)}</td></tr>
    <tr><td class="muted">Remit</td><td>${_(e.remit)}</td></tr>
    <tr><td class="muted">Hours</td><td>${_(e.hours)}</td></tr>
    <tr><td class="muted">General liability</td><td>${_(e.gl||`Add carrier and limit on Shop`)}</td></tr>
    <tr><td class="muted">Professional liability</td><td>${_(e.eo||`Add carrier and limit on Shop`)}</td></tr>
  </table>
  ${D()}`}function N(e){let{job:t,shots:n,remaps:r}=e,l=s(),u=0,d=new Map,f=new Map,m=new Set;for(let e of n){let t=o(e,r);if(m.add(e.codeToken.toUpperCase()),t)u+=1,f.set(t.cat,(f.get(t.cat)??0)+1);else{let t=(e.codeToken||`(blank)`).toUpperCase();d.set(t,(d.get(t)??0)+1)}}let h=S(m),g=t.timeLog.reduce((e,t)=>e+t.hours,0),v=[...f.entries()].sort((e,t)=>t[1]-e[1]).map(([e,t])=>`<tr><td>${_(e)}</td><td class="right">${t}</td></tr>`).join(``),y=h.map(e=>`<tr><td>${e.done?`OK`:e.required?`GAP`:`—`}</td><td>${_(e.label)}</td><td class="mono muted">${_(e.hit.join(`, `)||e.codes.join(`, `))}</td></tr>`).join(``),x=d.size?`<h2>Unmatched codes</h2><table>${[...d.entries()].map(([e,t])=>`<tr><td class="mono">${_(e)}</td><td class="right">${t}</td></tr>`).join(``)}</table>`:``,w=t.timeLog.length?`<h2>Time log</h2>
      <table>${t.timeLog.map(e=>`<tr><td class="mono">${_(e.date)}</td><td class="right">${e.hours} h</td><td>${_(i[e.kind]??e.kind)}</td><td>${_(e.note)}</td></tr>`).join(``)}</table>`:``;return`${C(l,`Extraction transmittal`,c(t))}
  ${T(t)}
  <h2>Counts</h2>
  <table>
    <tr><td>Shots</td><td class="right">${n.length}</td></tr>
    <tr><td>Matched</td><td class="right">${u}</td></tr>
    <tr><td>Unmatched</td><td class="right">${n.length-u}</td></tr>
    <tr><td>Hours logged</td><td class="right">${g}</td></tr>
    <tr><td>Quote</td><td class="right">$${b(a(t))}</td></tr>
  </table>
  <h2>INDOT feature categories</h2>
  <table>${v||`<tr><td class="muted">No matched shots.</td></tr>`}</table>
  <h2>Scope checklist</h2>
  <table>
    <thead><tr><th></th><th>Item</th><th>Codes</th></tr></thead>
    <tbody>${y}</tbody>
  </table>
  ${x}
  ${w}
  ${t.ticket?`<h2>Ticket</h2><p>${_(t.ticket)}</p>`:``}
  <h2>Deliverables in this package</h2>
  <ul>${p.map(e=>`<li>${_(e)}</li>`).join(``)}</ul>
  ${D()}`}export{M as a,h as c,N as i,g as l,A as n,S as o,j as r,_ as s,k as t};