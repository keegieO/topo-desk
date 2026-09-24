import { projectAlignment } from "./align";
import { chainVertices, type Chain } from "./chains";
import { formatStation, stationOffset, type Nez } from "./cogo";
import type { LabeledShot } from "./label";
import type { Leader } from "./notes";
import { esc } from "./print";
import { styleForCode } from "./symbology";

type Ring = { z: number; index: boolean; pts: { n: number; e: number }[] };

const CONTROL = new Set(["PRE", "PBMK", "PMON", "TRAV", "PIDT", "PPIN"]);

export function htmlSheetSet(opts: {
  title: string;
  des: string;
  client: string;
  county: string;
  crs: string;
  date: string;
  firm: string;
  shots: LabeledShot[];
  chains: Chain[];
  leaders?: Leader[];
  contours?: Ring[];
}): string {
  const align = projectAlignment(
    opts.shots,
    opts.chains.map((c) => ({ code: c.code, pts: chainVertices(c) })),
  );
  if (!align || align.pts.length < 2) return fallback(opts);
  const len = lengthOf(align.pts);
  const offs: number[] = [];
  const at = (n: number, e: number, z = 0) => stationOffset(align.pts, { n, e, z });
  for (const s of opts.shots) {
    const hit = at(s.northing, s.easting, s.elevation);
    if (hit) offs.push(Math.abs(hit.offset));
  }
  offs.sort((a, b) => a - b);
  const halfData = offs.length ? offs[Math.min(offs.length - 1, Math.floor(offs.length * 0.98))] : 80;
  const plan = layout(len, halfData + 20);
  const pages: string[] = [];
  for (let i = 0; i < plan.count; i++) {
    const sta0 = i * plan.step;
    const sta1 = Math.min(len, sta0 + plan.along);
    pages.push(drawSheet(opts, align.pts, i, plan.count, sta0, sta1, plan));
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(opts.des || opts.title)} sheets</title>
<style>
  @page { size: letter landscape; margin: 0.4in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: #1a1c1e; }
  body { font-family: "IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif; }
  .page { break-after: page; page-break-after: always; }
  .page:last-child { break-after: auto; page-break-after: auto; }
  svg { width: 100%; height: auto; background: #f7f7f3; }
  .noprint { margin: 0 0 8px; }
  .noprint button { font: 600 12px sans-serif; background: #1a1c1e; color: #fff; border: 0; padding: 8px 12px; cursor: pointer; }
  @media print { .noprint { display: none; } }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">Print sheet set / save PDF</button></div>
  ${pages.join("\n")}
</body>
</html>`;
}

function lengthOf(pts: Nez[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
  return Math.max(s, 1);
}

function layout(len: number, halfNeed: number) {
  const scales = [10, 20, 30, 40, 50, 100, 200, 400];
  const pick = (scale: number) => {
    const along = 9 * scale;
    const across = 6.2 * scale;
    const overlap = 0.55 * scale;
    const step = Math.max(40, along - overlap);
    const count = Math.max(1, Math.ceil(Math.max(len - overlap, 1) / step));
    return { scale, along, across, step, count, half: across / 2 };
  };
  let scale = scales.find((s) => (6.2 * s) / 2 >= halfNeed) ?? 400;
  let plan = pick(scale);
  while (plan.count > 20) {
    const next = scales.find((s) => s > scale);
    if (!next) break;
    scale = next;
    plan = pick(scale);
  }
  return plan;
}

function drawSheet(
  opts: Parameters<typeof htmlSheetSet>[0],
  align: Nez[],
  index: number,
  count: number,
  sta0: number,
  sta1: number,
  plan: ReturnType<typeof layout>,
): string {
  const vw = 1040;
  const vh = 700;
  const padL = 36;
  const padR = 176;
  const padT = 28;
  const padB = 32;
  const drawW = vw - padL - padR;
  const drawH = vh - padT - padB;
  const half = plan.half;
  const X = (sta: number) => padL + ((sta - sta0) / Math.max(sta1 - sta0, 1)) * drawW;
  const Y = (off: number) => padT + ((half - off) / (half * 2)) * drawH;
  const inside = (sta: number, off: number) => sta >= sta0 - 8 && sta <= sta1 + 8 && Math.abs(off) <= half + 12;
  const loc = (n: number, e: number, z = 0) => stationOffset(align, { n, e, z });

  const paths: string[] = [];
  const pushPath = (pts: { n: number; e: number }[], stroke: string, width: number, dash?: string) => {
    let d = "";
    const flush = () => {
      if (d) {
        paths.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);
        d = "";
      }
    };
    for (let i = 0; i < pts.length; i++) {
      const hit = loc(pts[i].n, pts[i].e);
      if (!hit || !inside(hit.station, hit.offset)) {
        flush();
        continue;
      }
      const cmd = d ? "L" : "M";
      d += `${cmd}${X(hit.station).toFixed(1)} ${Y(hit.offset).toFixed(1)}`;
    }
    flush();
  };

  for (const ring of opts.contours ?? []) {
    if (ring.pts.length < 2) continue;
    pushPath(ring.pts, ring.index ? "#8a7040" : "#c4b48a", ring.index ? 1.15 : 0.45);
    if (!ring.index) continue;
    const mid = ring.pts[Math.floor(ring.pts.length / 2)];
    const hit = loc(mid.n, mid.e);
    if (hit && inside(hit.station, hit.offset)) {
      paths.push(
        `<text x="${X(hit.station).toFixed(1)}" y="${Y(hit.offset).toFixed(1)}" fill="#8a7040" font-size="10" font-family="Arial, Helvetica, sans-serif">${ring.z.toFixed(0)}</text>`,
      );
    }
  }
  for (const chain of opts.chains) {
    const pts = chainVertices(chain);
    if (pts.length < 2) continue;
    const style = styleForCode(chain.code);
    const hex = style.color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const stroke = y > 0.72 ? "#1a1c1e" : style.color;
    pushPath(pts, stroke, Math.max(1, style.weight * 0.65), style.dash);
  }
  for (const note of opts.leaders ?? []) {
    const a = loc(note.n, note.e);
    const b = loc(note.tn, note.te);
    if (!a || !b || !inside(b.station, b.offset)) continue;
    if (note.arrow) {
      paths.push(
        `<line x1="${X(a.station).toFixed(1)}" y1="${Y(a.offset).toFixed(1)}" x2="${X(b.station).toFixed(1)}" y2="${Y(b.offset).toFixed(1)}" stroke="#1a1c1e" stroke-width="0.7"/>`,
      );
    }
    note.text.split("\n").forEach((line, i) => {
      paths.push(
        `<text x="${X(a.station).toFixed(1)}" y="${(Y(a.offset) + i * 10).toFixed(1)}" fill="#1a1c1e" font-size="10" font-family="Arial, Helvetica, sans-serif">${esc(line)}</text>`,
      );
    });
  }
  for (const s of opts.shots) {
    if (!CONTROL.has(s.codeToken.toUpperCase())) continue;
    const hit = loc(s.northing, s.easting, s.elevation);
    if (!hit || !inside(hit.station, hit.offset)) continue;
    const x = X(hit.station);
    const y = Y(hit.offset);
    paths.push(
      `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="none" stroke="#8a3228"/><text x="${(x + 6).toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="#8a3228" font-size="10" font-family="ui-monospace, monospace">${esc(s.point)} ${esc(s.codeToken)}</text></g>`,
    );
  }

  const mid = (sta0 + sta1) / 2;
  const north = northArrow(align, mid, vw - padR + 28, 46);
  const matchL = index > 0 ? `<text x="${padL + 4}" y="${padT + 14}" font-size="10" font-family="ui-monospace, monospace">MATCH ${esc(formatStation(sta0))}</text>` : "";
  const matchR =
    index < count - 1
      ? `<text x="${(padL + drawW - 4).toFixed(0)}" y="${padT + 14}" text-anchor="end" font-size="10" font-family="ui-monospace, monospace">MATCH ${esc(formatStation(sta1))}</text>`
      : "";

  return `<section class="page">
    <svg viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Sheet ${index + 1}">
      <rect x="0.5" y="0.5" width="${vw - 1}" height="${vh - 1}" fill="none" stroke="#1a1c1e"/>
      <rect x="${padL}" y="${padT}" width="${drawW}" height="${drawH}" fill="none" stroke="#1a1c1e"/>
      ${paths.join("\n")}
      ${matchL}${matchR}
      ${north}
      <text x="${padL}" y="${vh - 12}" font-size="11" font-family="ui-monospace, monospace">1" = ${plan.scale}'</text>
      <text x="${(vw - 12)}" y="22" text-anchor="end" font-size="12" font-family="IBM Plex Sans, sans-serif">${esc(opts.firm)}</text>
      <text x="${(vw - 12)}" y="40" text-anchor="end" font-size="14" font-family="IBM Plex Sans, sans-serif">${esc(opts.title)}</text>
      <text x="${(vw - 12)}" y="58" text-anchor="end" font-size="11" font-family="ui-monospace, monospace">Des. ${esc(opts.des || "—")}</text>
      <text x="${(vw - 12)}" y="78" text-anchor="end" font-size="11">${esc(opts.client)}</text>
      <text x="${(vw - 12)}" y="94" text-anchor="end" font-size="11">${esc(opts.county)}</text>
      <text x="${(vw - 12)}" y="118" text-anchor="end" font-size="10" font-family="ui-monospace, monospace">${esc(formatStation(sta0))} – ${esc(formatStation(sta1))}</text>
      <text x="${(vw - 12)}" y="136" text-anchor="end" font-size="11">Sheet ${index + 1} of ${count}</text>
      <text x="${(vw - 12)}" y="160" text-anchor="end" font-size="10" font-family="ui-monospace, monospace">${esc(opts.crs)}</text>
      <text x="${(vw - 12)}" y="176" text-anchor="end" font-size="10">${esc(opts.date)} · US survey ft</text>
      <text x="${(vw - 12)}" y="${vh - 16}" text-anchor="end" font-size="9">Existing topography. Not a stamped survey.</text>
    </svg>
  </section>`;
}

function northArrow(align: Nez[], sta: number, x: number, y: number): string {
  let run = 0;
  let dn = 1;
  let de = 0;
  for (let i = 1; i < align.length; i++) {
    const seg = Math.hypot(align[i].n - align[i - 1].n, align[i].e - align[i - 1].e) || 1;
    if (run + seg >= sta || i === align.length - 1) {
      dn = (align[i].n - align[i - 1].n) / seg;
      de = (align[i].e - align[i - 1].e) / seg;
      break;
    }
    run += seg;
  }
  const pageX = dn;
  const pageY = -de;
  const ang = (Math.atan2(-pageY, pageX) * 180) / Math.PI;
  return `<g transform="translate(${x} ${y}) rotate(${ang.toFixed(1)})">
    <polygon points="0,-14 4.5,8 0,4 -4.5,8" fill="#1a1c1e"/>
    <text x="0" y="20" text-anchor="middle" font-size="11" transform="rotate(${(-ang).toFixed(1)})">N</text>
  </g>`;
}

function fallback(opts: Parameters<typeof htmlSheetSet>[0]): string {
  return `<!doctype html><html><body><p>${esc(opts.title)} — not enough linework to cut sheets.</p></body></html>`;
}
