import { downloadText } from "./utils";

export function wrapPrint(title: string, inner: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escAttr(title)}</title>
<style>
  @page { size: letter; margin: 0.65in 0.75in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #1a1c1e; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
  }
  h1 { font-size: 17pt; font-weight: 700; margin: 0 0 2pt; letter-spacing: -0.03em; color: #0f1217; }
  h2 {
    font-size: 8.5pt; font-weight: 700; margin: 20pt 0 6pt;
    letter-spacing: 0.12em; text-transform: uppercase; color: #215e9e;
    border-bottom: 1.5pt solid #215e9e; padding-bottom: 3pt;
  }
  p { margin: 0 0 7pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 6pt; }
  thead tr { background: #215e9e; color: #fff; }
  th {
    text-align: left; font-weight: 600; padding: 5pt 7pt;
    font-size: 8pt; letter-spacing: 0.07em; text-transform: uppercase;
  }
  td { padding: 5pt 7pt; border-bottom: 0.5pt solid #e0e2e8; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f6f7fb; }
  .right { text-align: right; font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
  .mono { font-family: ui-monospace, "Consolas", "Menlo", monospace; font-size: 9pt; }
  .muted { color: #5c6370; }
  .rule { border: 0; border-top: 2pt solid #215e9e; margin: 10pt 0 14pt; }
  .hair { border: 0; border-top: 0.5pt solid #c8cad0; margin: 10pt 0; }
  .head {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 16pt; margin-bottom: 0;
  }
  .mark {
    width: 34pt; height: 34pt; background: #215e9e; color: #f0f4ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 9pt; font-weight: 800; letter-spacing: 0.06em;
    border-radius: 3pt;
  }
  .brand { display: flex; gap: 12pt; align-items: center; }
  .sig {
    display: grid; grid-template-columns: 1fr 1fr; gap: 32pt; margin-top: 36pt;
    page-break-inside: avoid;
  }
  .sig .line {
    border-top: 1pt solid #1a1c1e; margin-top: 36pt; padding-top: 8pt;
    font-size: 8.5pt; color: #5c6370;
  }
  .disclaimer { font-size: 8pt; color: #7c8090; margin-top: 20pt; border-top: 0.5pt solid #e0e2e8; padding-top: 8pt; }
  .total td {
    border-top: 1.5pt solid #215e9e; border-bottom: none;
    font-weight: 700; font-size: 11pt; background: #eef3fa !important;
  }
  ul { margin: 0 0 8pt; padding-left: 18pt; }
  li { margin: 0 0 4pt; }
  .badge {
    display: inline-block; padding: 2pt 7pt; border-radius: 3pt;
    font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .badge-paid { background: #d4edda; color: #155724; }
  .badge-sent { background: #d1ecf1; color: #0c5460; }
  .badge-draft { background: #fff3cd; color: #856404; }
  .severity-error { background: #f8d7da; color: #721c24; }
  .severity-warn  { background: #fff3cd; color: #856404; }
  .severity-info  { background: #d1ecf1; color: #0c5460; }
  .severity-pass  { background: #d4edda; color: #155724; }
  @media print { .noprint { display: none !important; } }
  .noprint { margin: 10pt 0 16pt; }
  .noprint button {
    font: 600 10.5pt "Segoe UI", sans-serif;
    background: #215e9e; color: #fff; border: 0;
    padding: 7pt 18pt; cursor: pointer; border-radius: 3pt;
  }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">Print / save PDF</button></div>
  ${inner}
</body>
</html>`;
}

export function openDocument(filename: string, html: string) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=1100,height=760");
  if (!w) {
    downloadText(filename, html, "text/html;charset=utf-8");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function printHtml(title: string, inner: string) {
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

export function downloadHtml(filename: string, inner: string) {
  const title = filename.replace(/\.html$/i, "");
  downloadText(filename, wrapPrint(title, inner), "text/html;charset=utf-8");
}

export function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&" + "#39;";
  });
}

function escAttr(s: string): string {
  return esc(s);
}

function safeFile(s: string): string {
  return s.replace(/[^\w.-]+/g, "_").slice(0, 80) || "document";
}

export function money(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
