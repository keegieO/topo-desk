import type { Alignment } from "./align";
import { formatOffset } from "./align";
import type { Chain } from "./chains";
import { chainVertices } from "./chains";
import { formatStation, stationOffset } from "./cogo";
import type { LabeledShot } from "./label";
import { esc } from "./print";
import { styleForCode } from "./symbology";
import type { Leader } from "./notes";

const CONTROL = new Set(["PRE", "PBMK", "PMON", "TRAV", "PIDT", "PPIN"]);

function ink(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#1a1c1e";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return y > 0.72 ? "#1a1c1e" : `#${h.slice(0, 6)}`;
}

export function htmlPlotSheet(opts: {
  title: string;
  des: string;
  client: string;
  county: string;
  crs: string;
  date: string;
  firm: string;
  align: Alignment | null;
  shots: LabeledShot[];
  chains: Chain[];
  leaders?: Leader[];
  contours?: { z: number; index: boolean; pts: { n: number; e: number }[] }[];
}): string {
  const { shots, chains, align } = opts;
  let minN = Infinity;
  let maxN = -Infinity;
  let minE = Infinity;
  let maxE = -Infinity;
  const consider = (n: number, e: number) => {
    if (n < minN) minN = n;
    if (n > maxN) maxN = n;
    if (e < minE) minE = e;
    if (e > maxE) maxE = e;
  };
  for (const s of shots) consider(s.northing, s.easting);
  for (const note of opts.leaders ?? []) {
    consider(note.n, note.e);
    consider(note.tn, note.te);
  }
  if (!Number.isFinite(minN)) {
    minN = 0;
    maxN = 1;
    minE = 0;
    maxE = 1;
  }
  const spanN = Math.max(maxN - minN, 1);
  const spanE = Math.max(maxE - minE, 1);
  const vw = 980;
  const vh = 640;
  const pad = 36;
  const scale = Math.min((vw - pad * 2) / spanE, (vh - pad * 2) / spanN);
  const ox = pad + ((vw - pad * 2) - spanE * scale) / 2;
  const oy = pad + ((vh - pad * 2) - spanN * scale) / 2;
  const X = (e: number) => ox + (e - minE) * scale;
  const Y = (n: number) => oy + (maxN - n) * scale;

  const lines: string[] = [];
  for (const ring of opts.contours ?? []) {
    if (ring.pts.length < 2) continue;
    const d = ring.pts.map((p, i) => `${i ? "L" : "M"}${X(p.e).toFixed(2)} ${Y(p.n).toFixed(2)}`).join(" ");
    lines.push(
      `<path d="${d}" fill="none" stroke="${ring.index ? "#8a7040" : "#c4b48a"}" stroke-width="${ring.index ? 1.1 : 0.45}"/>`,
    );
    if (ring.index && ring.pts.length > 4) {
      const mid = ring.pts[Math.floor(ring.pts.length / 2)];
      lines.push(
        `<text x="${X(mid.e).toFixed(1)}" y="${Y(mid.n).toFixed(1)}" fill="#8a7040" font-size="9" font-family="Arial, Helvetica, sans-serif">${ring.z.toFixed(0)}</text>`,
      );
    }
  }
  for (const chain of chains) {
    const pts = chainVertices(chain);
    if (pts.length < 2) continue;
    const style = styleForCode(chain.code);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p.e).toFixed(2)} ${Y(p.n).toFixed(2)}`).join(" ");
    const dash = style.dash ? ` stroke-dasharray="${style.dash}"` : "";
    lines.push(
      `<path d="${d}" fill="none" stroke="${ink(style.color)}" stroke-width="${Math.max(1, style.weight * 0.7)}"${dash}/>`,
    );
  }
  if (align && align.pts.length >= 2) {
    const d = align.pts.map((p, i) => `${i ? "L" : "M"}${X(p.e).toFixed(2)} ${Y(p.n).toFixed(2)}`).join(" ");
    lines.push(`<path d="${d}" fill="none" stroke="#215e9e" stroke-width="2.2" stroke-dasharray="10 5"/>`);
    const a0 = align.pts[0];
    lines.push(
      `<text x="${X(a0.e).toFixed(1)}" y="${(Y(a0.n) - 8).toFixed(1)}" fill="#215e9e" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${esc(align.name)} 0+00</text>`,
    );
  }

  const marks: string[] = [];
  const controlRows: string[] = [];
  const crowded = shots.length > 600;
  for (const note of opts.leaders ?? []) {
    const x1 = X(note.e);
    const y1 = Y(note.n);
    const x2 = X(note.te);
    const y2 = Y(note.tn);
    if (note.arrow) {
      marks.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#1a1c1e" stroke-width="0.7"/>`);
    }
    note.text.split("\n").forEach((line, i) => {
      marks.push(
        `<text x="${x1.toFixed(1)}" y="${(y1 + i * 9).toFixed(1)}" fill="#1a1c1e" font-size="9" font-family="Arial, Helvetica, sans-serif">${esc(line)}</text>`,
      );
    });
  }
  for (const s of shots) {
    const ctrl = CONTROL.has(s.codeToken.toUpperCase());
    const x = X(s.easting);
    const y = Y(s.northing);
    if (ctrl) {
      marks.push(
        `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="none" stroke="#8a3228" stroke-width="1.2"/><path d="M${x.toFixed(1)} ${(y - 7).toFixed(1)}v14M${(x - 7).toFixed(1)} ${y.toFixed(1)}h14" stroke="#8a3228" stroke-width="0.8"/></g>`,
      );
      marks.push(
        `<text x="${(x + 7).toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="#8a3228" font-size="10" font-family="IBM Plex Mono, ui-monospace, monospace">${esc(s.point)} ${esc(s.codeToken)}</text>`,
      );
      const so = align ? stationOffset(align.pts, { n: s.northing, e: s.easting, z: s.elevation }) : null;
      controlRows.push(
        `<tr><td class="mono">${esc(s.point)}</td><td class="mono">${esc(s.codeToken)}</td><td class="mono right">${s.northing.toFixed(3)}</td><td class="mono right">${s.easting.toFixed(3)}</td><td class="mono right">${s.elevation.toFixed(2)}</td><td class="mono">${so ? esc(formatStation(so.station)) : "—"}</td><td class="mono">${so ? esc(formatOffset(so.offset)) : "—"}</td></tr>`,
      );
    } else if (!crowded) {
      marks.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="#1a1c1e"/>`);
    }
  }

  const ftPerPx = 1 / scale;
  const nice = [20, 50, 100, 200, 500, 1000, 2000].find((n) => n / ftPerPx >= 70 && n / ftPerPx <= 180) ?? 100;
  const bar = nice / ftPerPx;
  const barX = pad;
  const barY = vh - 22;

  const north = `<g transform="translate(${vw - 28} 36)">
    <polygon points="0,-16 5,8 0,4 -5,8" fill="#1a1c1e"/>
    <text x="0" y="20" text-anchor="middle" font-size="11" font-family="IBM Plex Sans, sans-serif">N</text>
  </g>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(opts.des)} plan sheet</title>
<style>
  @page { size: letter landscape; margin: 0.45in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: #1a1c1e; }
  body { font-family: "IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif; font-size: 10pt; }
  .sheet { display: grid; grid-template-columns: 1fr 220px; gap: 14px; align-items: start; }
  svg { width: 100%; height: auto; background: #f7f7f3; border: 1px solid #1a1c1e; }
  h1 { font-size: 13pt; margin: 0 0 2px; letter-spacing: -0.02em; }
  h2 { font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: #5c6066; margin: 12px 0 4px; font-weight: 600; }
  p { margin: 0 0 4px; }
  .mono { font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace; font-size: 8.5pt; }
  .muted { color: #5c6066; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 3px 4px; border-bottom: 1px solid #d8d8d4; font-size: 8pt; }
  th { letter-spacing: 0.06em; text-transform: uppercase; color: #5c6066; font-weight: 500; }
  .right { text-align: right; font-variant-numeric: tabular-nums; }
  .rule { border: 0; border-top: 1.5px solid #1a1c1e; margin: 8px 0; }
</style>
</head>
<body>
  <div class="sheet">
    <svg viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Plan">
      <rect x="0.5" y="0.5" width="${vw - 1}" height="${vh - 1}" fill="none" stroke="#1a1c1e"/>
      ${lines.join("\n")}
      ${marks.join("\n")}
      ${north}
      <line x1="${barX}" y1="${barY}" x2="${(barX + bar).toFixed(1)}" y2="${barY}" stroke="#1a1c1e" stroke-width="2"/>
      <line x1="${barX}" y1="${barY - 4}" x2="${barX}" y2="${barY + 4}" stroke="#1a1c1e"/>
      <line x1="${(barX + bar).toFixed(1)}" y1="${barY - 4}" x2="${(barX + bar).toFixed(1)}" y2="${barY + 4}" stroke="#1a1c1e"/>
      <text x="${barX}" y="${barY - 8}" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${nice} ft</text>
    </svg>
    <aside>
      <p class="mono muted">${esc(opts.firm)}</p>
      <h1>${esc(opts.title)}</h1>
      <p class="mono">Des. ${esc(opts.des || "—")}</p>
      <hr class="rule"/>
      <p>${esc(opts.client)}</p>
      <p class="muted">${esc(opts.county)}</p>
      <p class="mono muted">${esc(opts.crs)}</p>
      <p class="mono muted">${esc(opts.date)} · US ft</p>
      <h2>Alignment</h2>
      <p class="mono">${align ? esc(align.name) + " · " + shots.length + " pts" : "—"}</p>
      <h2>Control</h2>
      <table>
        <thead><tr><th>Pt</th><th>Code</th><th>N</th><th>E</th><th>Z</th><th>Sta</th><th>Off</th></tr></thead>
        <tbody>${controlRows.join("") || `<tr><td colspan="7" class="muted">No control in this book.</td></tr>`}</tbody>
      </table>
      <p class="muted" style="margin-top:12px">Plan sheet for OpenRoads import. Not a stamped survey.</p>
    </aside>
  </div>
</body>
</html>`;
}
