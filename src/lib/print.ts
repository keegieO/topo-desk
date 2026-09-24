import { downloadText } from "./utils";

export function wrapPrint(title: string, inner: string): string {
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
