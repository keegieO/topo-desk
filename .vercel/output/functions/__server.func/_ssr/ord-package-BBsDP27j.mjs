import { s as emptySurvey } from "./job-types-DRBj8xWf.mjs";
import { a as stamp } from "./router-pTBIT-ZP.mjs";
import { _ as lookupCode, f as firmCityLine, l as applyTemplate, m as getFirm, v as resolveFeature } from "./label-CD5-qmOw.mjs";
import { o as dist2d } from "./sample-D-33kfTV.mjs";
import { b as userLineToChain, c as formatStation, g as styleForCode, h as stationOffset, i as chainVertices, m as polylineLength, n as buildChains, s as extractsAsShots, v as toCsv } from "./store-Bj7SGyFp.mjs";
import { a as htmlTransmittal, r as htmlProposal, t as esc } from "./paper-CvbkfkFR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ord-package-BBsDP27j.js
function descForOrd(shot, remaps, labeled) {
	const feature = resolveFeature(shot, remaps);
	const rest = shot.remainder ? ` ${shot.remainder}` : "";
	if (labeled) return ((feature?.name ?? shot.codeToken ?? "UNMATCHED") + rest).trim();
	return shot.description;
}
function buildExport(opts) {
	const { shots, remaps, kind, template, order, fileName } = opts;
	const base = fileName.replace(/\.[^.]+$/, "") || "fieldbook";
	const tag = stamp();
	if (kind === "fieldbook") {
		const rows = [order === "PENZD" ? [
			"P",
			"E",
			"N",
			"Z",
			"D"
		] : [
			"P",
			"N",
			"E",
			"Z",
			"D"
		]];
		for (const s of shots) {
			const d = descForOrd(s, remaps, false);
			rows.push(order === "PENZD" ? [
				s.point,
				s.easting.toFixed(3),
				s.northing.toFixed(3),
				s.elevation.toFixed(3),
				d
			] : [
				s.point,
				s.northing.toFixed(3),
				s.easting.toFixed(3),
				s.elevation.toFixed(3),
				d
			]);
		}
		return {
			filename: `${base}_ORD_PNEZD_${tag}.csv`,
			csv: toCsv(rows)
		};
	}
	if (kind === "labeled-ord") {
		const rows = [order === "PENZD" ? [
			"P",
			"E",
			"N",
			"Z",
			"D"
		] : [
			"P",
			"N",
			"E",
			"Z",
			"D"
		]];
		for (const s of shots) {
			const d = descForOrd(s, remaps, true);
			rows.push(order === "PENZD" ? [
				s.point,
				s.easting.toFixed(3),
				s.northing.toFixed(3),
				s.elevation.toFixed(3),
				d
			] : [
				s.point,
				s.northing.toFixed(3),
				s.easting.toFixed(3),
				s.elevation.toFixed(3),
				d
			]);
		}
		return {
			filename: `${base}_ORD_labeled_${tag}.csv`,
			csv: toCsv(rows)
		};
	}
	if (kind === "annotation") {
		const rows = [[
			"Point",
			"Northing",
			"Easting",
			"Elevation",
			"Label"
		]];
		for (const s of shots) {
			const f = resolveFeature(s, remaps);
			rows.push([
				s.point,
				s.northing.toFixed(3),
				s.easting.toFixed(3),
				s.elevation.toFixed(3),
				applyTemplate(s, f, template)
			]);
		}
		return {
			filename: `${base}_labels_${tag}.csv`,
			csv: toCsv(rows)
		};
	}
	const rows = [[
		"Point",
		"Northing",
		"Easting",
		"Elevation",
		"Alpha Code",
		"Link / Notes",
		"Feature Definition",
		"Description",
		"Category",
		"Attribute Type",
		"Kind",
		"Label",
		"Match",
		"Original Description"
	]];
	for (const s of shots) {
		const f = resolveFeature(s, remaps);
		rows.push([
			s.point,
			s.northing.toFixed(3),
			s.easting.toFixed(3),
			s.elevation.toFixed(3),
			s.codeToken,
			s.remainder,
			f?.name ?? "",
			f?.desc ?? "",
			f?.cat ?? "",
			f?.attr ?? "",
			f?.kind ?? "",
			applyTemplate(s, f, template),
			f ? "matched" : "unmatched",
			s.description
		]);
	}
	return {
		filename: `${base}_INDOT_full_${tag}.csv`,
		csv: toCsv(rows)
	};
}
var CONTROL$1 = /* @__PURE__ */ new Set([
	"PRE",
	"PBMK",
	"PMON",
	"TRAV",
	"PIDT",
	"PPIN"
]);
function allChains(shots, remaps, userLines) {
	return [...buildChains(shots, remaps), ...userLines.map((l) => userLineToChain(l, remaps))];
}
function pair(code, value) {
	return `${code}\n${value}\n`;
}
function aciFromHex(hex) {
	const h = hex.replace("#", "");
	if (h.length < 6) return 7;
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	const swatches = [
		[
			1,
			255,
			0,
			0
		],
		[
			2,
			255,
			255,
			0
		],
		[
			3,
			0,
			255,
			0
		],
		[
			4,
			0,
			255,
			255
		],
		[
			5,
			0,
			0,
			255
		],
		[
			6,
			255,
			0,
			255
		],
		[
			7,
			255,
			255,
			255
		],
		[
			8,
			128,
			128,
			128
		],
		[
			30,
			255,
			127,
			0
		],
		[
			40,
			255,
			191,
			0
		],
		[
			42,
			230,
			200,
			75
		],
		[
			50,
			200,
			160,
			40
		],
		[
			90,
			90,
			212,
			212
		],
		[
			140,
			58,
			212,
			255
		],
		[
			150,
			42,
			158,
			212
		],
		[
			170,
			61,
			156,
			74
		],
		[
			190,
			110,
			232,
			110
		],
		[
			210,
			212,
			92,
			255
		],
		[
			230,
			255,
			122,
			217
		],
		[
			10,
			255,
			77,
			77
		]
	];
	let best = 7;
	let d = Infinity;
	for (const [aci, cr, cg, cb] of swatches) {
		const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
		if (dist < d) {
			d = dist;
			best = aci;
		}
	}
	return best;
}
function layerName(code) {
	return (code || "UNMATCHED").toUpperCase().replace(/[^\w-]/g, "_").slice(0, 31) || "UNMATCHED";
}
function buildDxf(opts) {
	const { shots, chains } = opts;
	const layers = /* @__PURE__ */ new Map();
	const ensure = (code) => {
		const name = layerName(code);
		if (!layers.has(name)) layers.set(name, aciFromHex(styleForCode(code).color));
		return name;
	};
	ensure("P-LABEL");
	layers.set("P-LABEL", 7);
	let ents = "";
	for (const ch of chains) {
		const verts = chainVertices(ch);
		if (verts.length < 2) continue;
		const layer = ensure(ch.code);
		const flags = (ch.closed ? 1 : 0) | 8;
		ents += pair(0, "POLYLINE");
		ents += pair(8, layer);
		ents += pair(66, 1);
		ents += pair(70, flags);
		ents += pair(10, 0);
		ents += pair(20, 0);
		ents += pair(30, 0);
		for (const v of verts) {
			ents += pair(0, "VERTEX");
			ents += pair(8, layer);
			ents += pair(10, v.e.toFixed(4));
			ents += pair(20, v.n.toFixed(4));
			ents += pair(30, v.z.toFixed(4));
			ents += pair(70, 32);
		}
		ents += pair(0, "SEQEND");
		ents += pair(8, layer);
	}
	for (const s of shots) {
		const layer = ensure(s.codeToken);
		ents += pair(0, "POINT");
		ents += pair(8, layer);
		ents += pair(10, s.easting.toFixed(4));
		ents += pair(20, s.northing.toFixed(4));
		ents += pair(30, s.elevation.toFixed(4));
		if (s.point) {
			ents += pair(0, "TEXT");
			ents += pair(8, "P-LABEL");
			ents += pair(10, (s.easting + 1.5).toFixed(4));
			ents += pair(20, (s.northing + 1.5).toFixed(4));
			ents += pair(30, s.elevation.toFixed(4));
			ents += pair(40, 1.5);
			ents += pair(1, String(s.point));
		}
	}
	let out = "";
	out += pair(0, "SECTION");
	out += pair(2, "HEADER");
	out += pair(9, "$ACADVER");
	out += pair(1, "AC1009");
	out += pair(9, "$INSUNITS");
	out += pair(70, 2);
	out += pair(0, "ENDSEC");
	out += pair(0, "SECTION");
	out += pair(2, "TABLES");
	out += pair(0, "TABLE");
	out += pair(2, "LAYER");
	out += pair(70, layers.size);
	for (const [name, color] of layers) {
		out += pair(0, "LAYER");
		out += pair(2, name);
		out += pair(70, 0);
		out += pair(62, color);
		out += pair(6, "CONTINUOUS");
	}
	out += pair(0, "ENDTAB");
	out += pair(0, "ENDSEC");
	out += pair(0, "SECTION");
	out += pair(2, "ENTITIES");
	out += ents;
	out += pair(0, "ENDSEC");
	out += pair(0, "EOF");
	return out;
}
function xmlEsc(s) {
	return String(s ?? "").replace(/[&<>"']/g, (c) => {
		if (c === "&") return "&amp;";
		if (c === "<") return "&lt;";
		if (c === ">") return "&gt;";
		if (c === "\"") return "&quot;";
		return "&apos;";
	});
}
function buildLandXml(opts) {
	const { shots, chains, remaps, project, crs } = opts;
	const now = /* @__PURE__ */ new Date();
	const date = now.toISOString().slice(0, 10);
	const time = now.toISOString().slice(11, 19);
	const pts = shots.map((s) => {
		const f = resolveFeature(s, remaps);
		const code = xmlEsc(s.codeToken || "");
		const name = xmlEsc(String(s.point || s.uid));
		const n = s.northing.toFixed(4);
		const e = s.easting.toFixed(4);
		const z = s.elevation.toFixed(4);
		return `    <CgPoint name="${name}" code="${code}" desc="${xmlEsc(f?.name || s.description)}" oID="${name}">${n} ${e} ${z}</CgPoint>`;
	}).join("\n");
	const feats = chains.map((ch, i) => {
		const verts = chainVertices(ch);
		if (verts.length < 2) return "";
		const list = verts.map((v) => `${v.n.toFixed(4)} ${v.e.toFixed(4)} ${v.z.toFixed(4)}`).join(" ");
		return `    <PlanFeature name="${xmlEsc(`${ch.code}-${i + 1}`)}" state="proposed">
      <CoordGeom>
        <IrregularLine desc="${xmlEsc(ch.feature?.name || ch.code)}">
          <PntList3D>${list}</PntList3D>
        </IrregularLine>
      </CoordGeom>
    </PlanFeature>`;
	}).filter(Boolean).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2" date="${date}" time="${time}">
  <Units>
    <Imperial linearUnit="foot" areaUnit="squareFoot" volumeUnit="cubicFoot" temperatureUnit="fahrenheit" pressureUnit="inchHG"/>
  </Units>
  <CoordinateSystem desc="${xmlEsc(crs)}" horizontalCoordinateSystemName="${xmlEsc(crs)}"/>
  <Application name="Breakline" version="1.0" manufacturer="Breakline Extraction"/>
  <Project name="${xmlEsc(project)}"/>
  <CgPoints>${pts ? `\n${pts}\n  ` : ""}</CgPoints>
  <PlanFeatures>${feats ? `\n${feats}\n  ` : ""}</PlanFeatures>
</LandXML>
`;
}
function buildControlCsv(shots) {
	const rows = [[
		"Point",
		"Northing",
		"Easting",
		"Elevation",
		"Code",
		"Description"
	]];
	for (const s of shots) {
		if (!CONTROL$1.has(s.codeToken.toUpperCase())) continue;
		rows.push([
			String(s.point),
			s.northing.toFixed(4),
			s.easting.toFixed(4),
			s.elevation.toFixed(4),
			s.codeToken,
			s.description
		]);
	}
	return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\r\n") + "\r\n";
}
function cadFilenames(base) {
	const tag = stamp();
	const stem = base.replace(/\.[^.]+$/, "") || "job";
	return {
		dxf: `${stem}_breaklines_${tag}.dxf`,
		xml: `${stem}_LandXML_${tag}.xml`,
		control: `${stem}_control_${tag}.csv`
	};
}
var RANK = {
	CL: 6,
	RC: 5,
	EP: 4,
	EOP: 4,
	ES: 3,
	EOS: 3,
	DL: 2,
	FL: 2
};
/** Survey alignment: INDOT centerline / edge string, else a fitted baseline. */
function projectAlignment(shots, chains) {
	let best = null;
	for (const chain of chains) {
		const pts = chain.pts;
		if (pts.length < 2) continue;
		const rank = RANK[chain.code.toUpperCase()] ?? 0;
		if (!rank) continue;
		let len = 0;
		for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
		const score = rank * 1e6 + len;
		if (!best || score > best.score) best = {
			score,
			pts,
			code: chain.code.toUpperCase()
		};
	}
	if (best) return {
		name: best.code,
		pts: best.pts
	};
	return fitBaseline(shots);
}
function fitBaseline(shots) {
	if (shots.length < 2) return null;
	let n = 0;
	let e = 0;
	for (const s of shots) {
		n += s.northing;
		e += s.easting;
	}
	n /= shots.length;
	e /= shots.length;
	let xx = 0;
	let yy = 0;
	let xy = 0;
	for (const s of shots) {
		const dx = s.easting - e;
		const dy = s.northing - n;
		xx += dx * dx;
		yy += dy * dy;
		xy += dx * dy;
	}
	const theta = .5 * Math.atan2(2 * xy, xx - yy);
	const de = Math.cos(theta);
	const dn = Math.sin(theta);
	let min = Infinity;
	let max = -Infinity;
	let z0 = shots[0].elevation;
	let z1 = shots[0].elevation;
	for (const s of shots) {
		const t = (s.easting - e) * de + (s.northing - n) * dn;
		if (t < min) {
			min = t;
			z0 = s.elevation;
		}
		if (t > max) {
			max = t;
			z1 = s.elevation;
		}
	}
	if (!(max - min > 1)) return null;
	return {
		name: "BASE",
		pts: [{
			e: e + de * min,
			n: n + dn * min,
			z: z0
		}, {
			e: e + de * max,
			n: n + dn * max,
			z: z1
		}]
	};
}
function staOffCsv(shots, align) {
	const rows = ["Point,Northing,Easting,Elevation,Code,Station,Offset"];
	for (const s of shots) {
		const so = align ? stationOffset(align.pts, {
			n: s.northing,
			e: s.easting,
			z: s.elevation
		}) : null;
		rows.push([
			s.point,
			s.northing.toFixed(4),
			s.easting.toFixed(4),
			s.elevation.toFixed(4),
			s.codeToken,
			so ? formatStation(so.station) : "",
			so ? so.offset.toFixed(3) : ""
		].join(","));
	}
	return rows.join("\r\n") + "\r\n";
}
function formatOffset(ft) {
	const side = ft < -.005 ? "L" : ft > .005 ? "R" : "";
	return `${Math.abs(ft).toFixed(2)}${side ? " " + side : ""}`;
}
var CONTROL = /* @__PURE__ */ new Set([
	"PRE",
	"PBMK",
	"PMON",
	"TRAV",
	"PIDT",
	"PPIN"
]);
function ink(hex) {
	const h = hex.replace("#", "");
	if (h.length < 6) return "#1a1c1e";
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return (.2126 * r + .7152 * g + .0722 * b) / 255 > .72 ? "#1a1c1e" : `#${h.slice(0, 6)}`;
}
function htmlPlotSheet(opts) {
	const { shots, chains, align } = opts;
	let minN = Infinity;
	let maxN = -Infinity;
	let minE = Infinity;
	let maxE = -Infinity;
	const consider = (n, e) => {
		if (n < minN) minN = n;
		if (n > maxN) maxN = n;
		if (e < minE) minE = e;
		if (e > maxE) maxE = e;
	};
	for (const s of shots) consider(s.northing, s.easting);
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
	const scale = Math.min(908 / spanE, 568 / spanN);
	const ox = pad + (908 - spanE * scale) / 2;
	const oy = pad + (568 - spanN * scale) / 2;
	const X = (e) => ox + (e - minE) * scale;
	const Y = (n) => oy + (maxN - n) * scale;
	const lines = [];
	for (const chain of chains) {
		const pts = chainVertices(chain);
		if (pts.length < 2) continue;
		const style = styleForCode(chain.code);
		const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p.e).toFixed(2)} ${Y(p.n).toFixed(2)}`).join(" ");
		const dash = style.dash ? ` stroke-dasharray="${style.dash}"` : "";
		lines.push(`<path d="${d}" fill="none" stroke="${ink(style.color)}" stroke-width="${Math.max(1, style.weight * .7)}"${dash}/>`);
	}
	if (align && align.pts.length >= 2) {
		const d = align.pts.map((p, i) => `${i ? "L" : "M"}${X(p.e).toFixed(2)} ${Y(p.n).toFixed(2)}`).join(" ");
		lines.push(`<path d="${d}" fill="none" stroke="#215e9e" stroke-width="2.2" stroke-dasharray="10 5"/>`);
		const a0 = align.pts[0];
		lines.push(`<text x="${X(a0.e).toFixed(1)}" y="${(Y(a0.n) - 8).toFixed(1)}" fill="#215e9e" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${esc(align.name)} 0+00</text>`);
	}
	const marks = [];
	const controlRows = [];
	for (const s of shots) {
		const ctrl = CONTROL.has(s.codeToken.toUpperCase());
		const x = X(s.easting);
		const y = Y(s.northing);
		if (ctrl) {
			marks.push(`<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="none" stroke="#8a3228" stroke-width="1.2"/><path d="M${x.toFixed(1)} ${(y - 7).toFixed(1)}v14M${(x - 7).toFixed(1)} ${y.toFixed(1)}h14" stroke="#8a3228" stroke-width="0.8"/></g>`);
			marks.push(`<text x="${(x + 7).toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="#8a3228" font-size="10" font-family="IBM Plex Mono, ui-monospace, monospace">${esc(s.point)} ${esc(s.codeToken)}</text>`);
			const so = align ? stationOffset(align.pts, {
				n: s.northing,
				e: s.easting,
				z: s.elevation
			}) : null;
			controlRows.push(`<tr><td class="mono">${esc(s.point)}</td><td class="mono">${esc(s.codeToken)}</td><td class="mono right">${s.northing.toFixed(3)}</td><td class="mono right">${s.easting.toFixed(3)}</td><td class="mono right">${s.elevation.toFixed(2)}</td><td class="mono">${so ? esc(formatStation(so.station)) : "—"}</td><td class="mono">${so ? esc(formatOffset(so.offset)) : "—"}</td></tr>`);
		} else marks.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="#1a1c1e"/>`);
	}
	const ftPerPx = 1 / scale;
	const nice = [
		20,
		50,
		100,
		200,
		500,
		1e3,
		2e3
	].find((n) => n / ftPerPx >= 70 && n / ftPerPx <= 180) ?? 100;
	const bar = nice / ftPerPx;
	const barX = pad;
	const barY = 618;
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
      <rect x="0.5" y="0.5" width="979" height="639" fill="none" stroke="#1a1c1e"/>
      ${lines.join("\n")}
      ${marks.join("\n")}
      <g transform="translate(952 36)">
    <polygon points="0,-16 5,8 0,4 -5,8" fill="#1a1c1e"/>
    <text x="0" y="20" text-anchor="middle" font-size="11" font-family="IBM Plex Sans, sans-serif">N</text>
  </g>
      <line x1="${barX}" y1="${barY}" x2="${(barX + bar).toFixed(1)}" y2="${barY}" stroke="#1a1c1e" stroke-width="2"/>
      <line x1="${barX}" y1="614" x2="${barX}" y2="622" stroke="#1a1c1e"/>
      <line x1="${(barX + bar).toFixed(1)}" y1="614" x2="${(barX + bar).toFixed(1)}" y2="622" stroke="#1a1c1e"/>
      <text x="${barX}" y="610" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${nice} ft</text>
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
function buildFieldbookReport(opts) {
	const { jobName, fileName, shots, remaps, survey, chains, extracts, qa } = opts;
	const firm = getFirm();
	const control = shots.filter((s) => {
		return resolveFeature(s, remaps)?.cat === "Survey Control" || [
			"PRE",
			"PBMK",
			"PMON",
			"TRAV",
			"PIDT"
		].includes(s.codeToken.toUpperCase());
	});
	const codes = /* @__PURE__ */ new Map();
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
		"",
		"CODES",
		...[...codes.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c.padEnd(12)} ${n}`),
		"",
		"LINEAR FEATURES",
		...chains.map((c) => `${c.code.padEnd(8)} ${String(c.n).padStart(4)} vtx  ${c.length.toFixed(1).padStart(8)} ft  ${c.closed ? "CLS" : "open"}  ${c.source}`),
		"",
		"CONTROL",
		...control.map((s) => `${s.point.padEnd(8)} ${s.northing.toFixed(4).padStart(14)} ${s.easting.toFixed(4).padStart(14)} ${s.elevation.toFixed(2).padStart(8)}  ${s.description}`),
		"",
		survey.notes ? `NOTES\n${survey.notes}\n` : "",
		`${firm.name}  ·  conventional field book — OpenRoads Survey`
	].filter((x) => x !== void 0).join("\r\n").replace(/\n\n\n+/g, "\n\n") + "\r\n";
}
var DUP_FT = .05;
var SHORT_FT = .3;
var LONG_FT = 200;
var SPIKE_FT = 8;
function isLinear(shot, remaps) {
	const f = resolveFeature(shot, remaps);
	if (!f) {
		const a = shot.codeToken.toUpperCase();
		if (a.startsWith("P") && a.length >= 3) return false;
		return Boolean(a);
	}
	if (f.attr === "Point") return false;
	if (f.attr === "Break Line" || f.attr === "Spot And Break") return true;
	const a = shot.codeToken.toUpperCase();
	if (a.startsWith("P") && a.length >= 3) return false;
	return f.kind === "linear" || f.kind === "alignment";
}
function segsIntersect(a, b, c, d) {
	const den = (b.n - a.n) * (d.e - c.e) - (b.e - a.e) * (d.n - c.n);
	if (Math.abs(den) < 1e-9) return false;
	const t = ((c.n - a.n) * (d.e - c.e) - (c.e - a.e) * (d.n - c.n)) / den;
	const u = ((c.n - a.n) * (b.e - a.e) - (c.e - a.e) * (b.n - a.n)) / den;
	return t > .02 && t < .98 && u > .02 && u < .98;
}
function runQa(shots, remaps, userLines, skipped = 0) {
	const issues = [];
	const push = (issue) => {
		issues.push({
			...issue,
			id: `q${issues.length + 1}`
		});
	};
	const unmatched = /* @__PURE__ */ new Map();
	const byPn = /* @__PURE__ */ new Map();
	const byCode = /* @__PURE__ */ new Map();
	let blank = 0;
	const blankUids = [];
	const parseUids = [];
	for (const s of shots) {
		if (!resolveFeature(s, remaps)) {
			const k = (s.codeToken || "(blank)").toUpperCase();
			const arr = unmatched.get(k) ?? [];
			arr.push(s);
			unmatched.set(k, arr);
		}
		const pn = s.point.trim() || "(blank)";
		const arr = byPn.get(pn) ?? [];
		arr.push(s);
		byPn.set(pn, arr);
		const code = s.codeToken.toUpperCase();
		if (code) {
			const c = byCode.get(code) ?? [];
			c.push(s);
			byCode.set(code, c);
		}
		if (!s.description.trim()) {
			blank += 1;
			blankUids.push(s.uid);
		}
		if (s.issues?.length) parseUids.push(s.uid);
	}
	for (const [code, list] of unmatched) push({
		check: "unmatched",
		severity: "error",
		title: `Unmatched code ${code}`,
		detail: `${list.length} shot${list.length === 1 ? "" : "s"} not mapped to an INDOT feature definition.`,
		shotUids: list.map((s) => s.uid),
		alpha: code
	});
	for (const [pn, list] of byPn) if (list.length > 1) push({
		check: "dup-pn",
		severity: "error",
		title: `Duplicate point ${pn}`,
		detail: `${list.length} shots share point number ${pn}.`,
		shotUids: list.map((s) => s.uid)
	});
	if (blank) push({
		check: "blank",
		severity: "error",
		title: "Blank description",
		detail: `${blank} shot${blank === 1 ? "" : "s"} have no feature code.`,
		shotUids: blankUids
	});
	if (parseUids.length) push({
		check: "parse",
		severity: "error",
		title: "Parse issues",
		detail: `${parseUids.length} row${parseUids.length === 1 ? "" : "s"} loaded with coordinate or field warnings.`,
		shotUids: parseUids
	});
	for (let i = 0; i < shots.length; i++) for (let j = i + 1; j < shots.length; j++) {
		const a = shots[i];
		const b = shots[j];
		if (dist2d(a, b) <= DUP_FT && Math.abs(a.elevation - b.elevation) <= .05) push({
			check: "dup-xy",
			severity: "warn",
			title: `Coincident ${a.point} / ${b.point}`,
			detail: `Shots sit within ${DUP_FT} ft horizontally.`,
			shotUids: [a.uid, b.uid]
		});
	}
	for (const s of shots) if (s.elevation === 0) push({
		check: "zero-z",
		severity: "warn",
		title: `Zero elevation pt ${s.point}`,
		detail: "Elevation is 0.00 — confirm the rod height and geoid.",
		shotUids: [s.uid],
		alpha: s.codeToken.toUpperCase()
	});
	for (const [code, list] of byCode) {
		if (list.length < 3) continue;
		for (let i = 1; i < list.length - 1; i++) {
			const prev = list[i - 1];
			const cur = list[i];
			const next = list[i + 1];
			const mid = (prev.elevation + next.elevation) / 2;
			if (Math.abs(cur.elevation - mid) > SPIKE_FT) push({
				check: "spike",
				severity: "warn",
				title: `Elevation spike pt ${cur.point}`,
				detail: `${code} jumps ${Math.abs(cur.elevation - mid).toFixed(2)} ft from neighbors.`,
				shotUids: [
					prev.uid,
					cur.uid,
					next.uid
				],
				alpha: code
			});
		}
	}
	const chains = buildChains(shots, remaps);
	const linearCodes = /* @__PURE__ */ new Set();
	for (const s of shots) if (isLinear(s, remaps)) linearCodes.add(s.codeToken.toUpperCase());
	for (const code of linearCodes) {
		const list = byCode.get(code) ?? [];
		if (list.length === 1) {
			const f = resolveFeature(list[0], remaps);
			const attr = f?.attr ?? "";
			if (attr === "Break Line" || attr === "Spot And Break" || !f) push({
				check: "isolated",
				severity: "warn",
				title: `Isolated ${code} pt ${list[0].point}`,
				detail: "Linear / breakline code with a single shot — string will not form.",
				shotUids: [list[0].uid],
				alpha: code
			});
		}
	}
	for (const chain of chains) {
		const last = chain.shots[chain.shots.length - 1];
		const first = chain.shots[0];
		const firstTok = (first?.remainder || "").toUpperCase();
		const lastTok = (last?.remainder || "").toUpperCase();
		const started = /\bST\b|\bSTART\b/.test(firstTok);
		const ended = /\bEND\b|\bCLS\b|\bCLOSE\b/.test(lastTok);
		if (started && !ended && !chain.closed) push({
			check: "open-st",
			severity: "warn",
			title: `Open ${chain.code} string`,
			detail: `Started at pt ${first.point} with no END / CLS.`,
			shotUids: chain.shots.map((s) => s.uid),
			lineId: chain.id,
			alpha: chain.code
		});
		for (let i = 1; i < chain.shots.length; i++) {
			const a = chain.shots[i - 1];
			const b = chain.shots[i];
			const d = dist2d(a, b);
			if (d < SHORT_FT) push({
				check: "short",
				severity: "warn",
				title: `Short ${chain.code} segment`,
				detail: `${d.toFixed(2)} ft between ${a.point} and ${b.point}.`,
				shotUids: [a.uid, b.uid],
				lineId: chain.id,
				alpha: chain.code
			});
			else if (d > LONG_FT) push({
				check: "long",
				severity: "warn",
				title: `Long ${chain.code} segment`,
				detail: `${d.toFixed(1)} ft between ${a.point} and ${b.point} — likely a missed break.`,
				shotUids: [a.uid, b.uid],
				lineId: chain.id,
				alpha: chain.code
			});
		}
	}
	for (let i = 0; i < chains.length; i++) {
		const a = chains[i];
		if (a.shots.length < 2) continue;
		const ha = Math.atan2(a.shots[a.shots.length - 1].easting - a.shots[0].easting, a.shots[a.shots.length - 1].northing - a.shots[0].northing);
		for (let j = i + 1; j < chains.length; j++) {
			const b = chains[j];
			if (a.code !== b.code || b.shots.length < 2) continue;
			const hb = Math.atan2(b.shots[b.shots.length - 1].easting - b.shots[0].easting, b.shots[b.shots.length - 1].northing - b.shots[0].northing);
			let hd = Math.abs(ha - hb) * (180 / Math.PI);
			if (hd > 90) hd = 180 - hd;
			if (hd > 35) continue;
			let crossed = false;
			for (let ai = 1; ai < a.shots.length && !crossed; ai++) for (let bi = 1; bi < b.shots.length; bi++) if (segsIntersect({
				n: a.shots[ai - 1].northing,
				e: a.shots[ai - 1].easting
			}, {
				n: a.shots[ai].northing,
				e: a.shots[ai].easting
			}, {
				n: b.shots[bi - 1].northing,
				e: b.shots[bi - 1].easting
			}, {
				n: b.shots[bi].northing,
				e: b.shots[bi].easting
			})) {
				crossed = true;
				break;
			}
			if (crossed) push({
				check: "cross",
				severity: "warn",
				title: `Overlapping ${a.code} strings`,
				detail: "Two nearly parallel strings of the same code cross. Confirm ST/END or a join.",
				shotUids: [a.shots[0].uid, b.shots[0].uid],
				alpha: a.code
			});
		}
	}
	const nums = shots.map((s) => Number(s.point)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
	if (nums.length >= 2) {
		let gaps = 0;
		for (let i = 1; i < nums.length; i++) if (nums[i] - nums[i - 1] > 50) gaps += 1;
		if (gaps) push({
			check: "gaps",
			severity: "info",
			title: "Point-number gaps",
			detail: `${gaps} gap${gaps === 1 ? "" : "s"} greater than 50 in the point sequence.`,
			shotUids: []
		});
	}
	const control = shots.filter((s) => {
		return resolveFeature(s, remaps)?.cat === "Survey Control" || [
			"PRE",
			"PBMK",
			"PMON",
			"TRAV",
			"PIDT"
		].includes(s.codeToken.toUpperCase());
	});
	if (shots.length && !control.length) push({
		check: "control",
		severity: "info",
		title: "No control in the book",
		detail: "No PRE / PBMK / PMON / TRAV shots. Hold control before ORD import.",
		shotUids: []
	});
	if (skipped > 0) push({
		check: "skipped",
		severity: "info",
		title: "Rows skipped on import",
		detail: `${skipped} row${skipped === 1 ? "" : "s"} did not parse as shots.`,
		shotUids: []
	});
	for (const line of userLines) {
		if (line.pts.length < 2) push({
			check: "extract-short",
			severity: "warn",
			title: `Extract ${line.code} has ${line.pts.length} vertex`,
			detail: "Drawn line needs at least two vertices.",
			shotUids: [],
			lineId: line.id,
			alpha: line.code
		});
		if (!lookupCode(line.code)) push({
			check: "extract-code",
			severity: "error",
			title: `Extract line code ${line.code} unmatched`,
			detail: "Drawn line is not on an INDOT feature definition.",
			shotUids: [],
			lineId: line.id,
			alpha: line.code
		});
	}
	const CHECK = /* @__PURE__ */ new Set([
		"CHK",
		"CHECK",
		"CK",
		"CKSHOT",
		"CKS"
	]);
	const checks = shots.filter((s) => CHECK.has(s.codeToken.toUpperCase()) || /\bCHK\b|\bCHECK\b/i.test(s.remainder));
	for (const ck of checks) {
		let best = null;
		let bestD = 50;
		for (const c of control) {
			const d = dist2d(ck, c);
			if (d < bestD) {
				bestD = d;
				best = c;
			}
		}
		if (!best) push({
			check: "check-orphan",
			severity: "warn",
			title: `Check shot ${ck.point} has no nearby control`,
			detail: "No PRE / PBMK / PMON / TRAV within 50 ft.",
			shotUids: [ck.uid]
		});
		else if (bestD > .08 || Math.abs(ck.elevation - best.elevation) > .08) push({
			check: "check-resid",
			severity: "warn",
			title: `Check ${ck.point} vs ${best.point}`,
			detail: `ΔH ${bestD.toFixed(3)} ft · ΔZ ${(ck.elevation - best.elevation).toFixed(3)} ft.`,
			shotUids: [ck.uid, best.uid]
		});
	}
	if (userLines.length) {
		const extracted = new Set(userLines.map((l) => l.code.toUpperCase()));
		for (const chain of chains) if (!extracted.has(chain.code) && chain.shots.length >= 2) push({
			check: "not-extracted",
			severity: "info",
			title: `${chain.code} not extracted`,
			detail: "Field-to-finish string has no office extract. Extract All or Place Line.",
			shotUids: chain.shots.map((s) => s.uid),
			lineId: chain.id,
			alpha: chain.code
		});
	}
	if (shots.length >= 8) {
		const zs = shots.map((s) => s.elevation).sort((a, b) => a - b);
		const mid = zs[Math.floor(zs.length / 2)];
		const outliers = shots.filter((s) => Math.abs(s.elevation - mid) > 40);
		if (outliers.length && outliers.length < shots.length * .15) push({
			check: "z-range",
			severity: "info",
			title: "Elevation outliers",
			detail: `${outliers.length} shot${outliers.length === 1 ? "" : "s"} more than 40 ft from the median ${mid.toFixed(2)}.`,
			shotUids: outliers.slice(0, 12).map((s) => s.uid)
		});
	}
	return {
		issues,
		errors: issues.filter((i) => i.severity === "error").length,
		warns: issues.filter((i) => i.severity === "warn").length,
		infos: issues.filter((i) => i.severity === "info").length
	};
}
var CRC_TABLE = (() => {
	const t = /* @__PURE__ */ new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		t[i] = c >>> 0;
	}
	return t;
})();
function crc32(data) {
	let c = 4294967295;
	for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function dosStamp(d) {
	return {
		time: d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1,
		date: d.getFullYear() - 1980 << 9 | d.getMonth() + 1 << 5 | d.getDate()
	};
}
/** Uncompressed ZIP (method 0). Names are archive paths, no leading slash. */
function zipStore(files) {
	const enc = new TextEncoder();
	const now = dosStamp(/* @__PURE__ */ new Date());
	const parts = [];
	const centrals = [];
	let offset = 0;
	for (const file of files) {
		const name = enc.encode(file.name.replace(/\\/g, "/"));
		const crc = crc32(file.data);
		const local = new Uint8Array(30 + name.length);
		const lv = new DataView(local.buffer);
		lv.setUint32(0, 67324752, true);
		lv.setUint16(4, 20, true);
		lv.setUint16(8, 0, true);
		lv.setUint16(10, now.time, true);
		lv.setUint16(12, now.date, true);
		lv.setUint32(14, crc, true);
		lv.setUint32(18, file.data.length, true);
		lv.setUint32(22, file.data.length, true);
		lv.setUint16(26, name.length, true);
		local.set(name, 30);
		const central = new Uint8Array(46 + name.length);
		const cv = new DataView(central.buffer);
		cv.setUint32(0, 33639248, true);
		cv.setUint16(4, 20, true);
		cv.setUint16(6, 20, true);
		cv.setUint16(12, now.time, true);
		cv.setUint16(14, now.date, true);
		cv.setUint32(16, crc, true);
		cv.setUint32(20, file.data.length, true);
		cv.setUint32(24, file.data.length, true);
		cv.setUint16(28, name.length, true);
		cv.setUint32(42, offset, true);
		central.set(name, 46);
		parts.push(local, file.data);
		centrals.push(central);
		offset += local.length + file.data.length;
	}
	const centralSize = centrals.reduce((n, c) => n + c.length, 0);
	const end = /* @__PURE__ */ new Uint8Array(22);
	const ev = new DataView(end.buffer);
	ev.setUint32(0, 101010256, true);
	ev.setUint16(8, files.length, true);
	ev.setUint16(10, files.length, true);
	ev.setUint32(12, centralSize, true);
	ev.setUint32(16, offset, true);
	const bytes = [
		...parts,
		...centrals,
		end
	].map((p) => p.buffer.slice(p.byteOffset, p.byteOffset + p.byteLength));
	return new Blob(bytes, { type: "application/zip" });
}
function zipTexts(files) {
	const enc = new TextEncoder();
	return zipStore(files.map((f) => ({
		name: f.name,
		data: enc.encode(f.text)
	})));
}
function buildOrdPackage(opts) {
	const { shots, remaps, userLines, job } = opts;
	const extra = extractsAsShots(userLines);
	const allShots = [...shots, ...extra];
	const chains = allChains(shots, remaps, userLines);
	const names = cadFilenames(opts.stem);
	const survey = opts.job?.survey ?? emptySurvey();
	const qa = runQa(shots, remaps, userLines);
	const chainRows = chains.map((c) => ({
		code: c.code,
		n: c.shots.length || c.pts?.length || 0,
		length: polylineLength(chainVertices(c)),
		closed: c.closed,
		source: c.source
	}));
	const book = buildExport({
		shots: allShots,
		remaps,
		kind: "fieldbook",
		template: opts.template,
		order: opts.order,
		fileName: opts.stem
	});
	const labeled = buildExport({
		shots: allShots,
		remaps,
		kind: "labeled-ord",
		template: opts.template,
		order: opts.order,
		fileName: opts.stem
	});
	const workbook = buildExport({
		shots: allShots,
		remaps,
		kind: "full",
		template: opts.template,
		order: opts.order,
		fileName: opts.stem
	});
	const align = projectAlignment(shots, chains.map((c) => ({
		code: c.code,
		pts: chainVertices(c)
	})));
	const staName = `${opts.stem.replace(/\.[^.]+$/, "") || "fieldbook"}_station_offset.csv`;
	const files = [
		{
			name: "INDEX.txt",
			text: [
				job?.des ? `Des. ${job.des}` : opts.stem,
				job?.name ?? "Field book",
				job?.crs ?? "",
				"",
				names.dxf,
				names.xml,
				book.filename,
				labeled.filename,
				workbook.filename,
				names.control,
				staName,
				"plan_sheet.html",
				"fieldbook_report.txt",
				...job ? ["proposal.html", "transmittal.html"] : [],
				"",
				"DXF layers are INDOT alpha codes. LandXML is 1.2 CgPoints and plan features.",
				"Field book is PNEZD for OpenRoads import."
			].filter((line) => line !== void 0).join("\r\n") + "\r\n"
		},
		{
			name: names.dxf,
			text: buildDxf({
				shots,
				chains
			})
		},
		{
			name: names.xml,
			text: buildLandXml({
				shots,
				chains,
				remaps,
				project: job?.name || opts.stem,
				crs: job?.crs || "NAD83(2011)"
			})
		},
		{
			name: book.filename,
			text: book.csv
		},
		{
			name: labeled.filename,
			text: labeled.csv
		},
		{
			name: workbook.filename,
			text: workbook.csv
		},
		{
			name: names.control,
			text: buildControlCsv(shots)
		},
		{
			name: staName,
			text: staOffCsv(shots, align)
		},
		{
			name: "plan_sheet.html",
			text: htmlPlotSheet({
				title: job?.name || opts.stem,
				des: job?.des || opts.stem,
				client: job?.client || "",
				county: job?.county || "",
				crs: job?.crs || "NAD83(2011)",
				date: job?.survey?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				firm: "Breakline Extraction",
				align,
				shots,
				chains
			})
		},
		{
			name: "fieldbook_report.txt",
			text: buildFieldbookReport({
				jobName: job?.name || opts.fileName || "Field book",
				fileName: opts.fileName,
				shots,
				remaps,
				survey,
				chains: chainRows,
				extracts: userLines.length,
				qa
			})
		}
	];
	if (job) files.push({
		name: "proposal.html",
		text: htmlProposal(job)
	}, {
		name: "transmittal.html",
		text: htmlTransmittal({
			job,
			shots,
			remaps
		})
	});
	return {
		filename: `${(job?.des || opts.stem || "fieldbook").replace(/[^\w.-]+/g, "_")}_ORD_${stamp()}.zip`,
		blob: zipTexts(files)
	};
}
//#endregion
export { buildFieldbookReport as a, cadFilenames as c, projectAlignment as d, runQa as f, buildExport as i, formatOffset as l, buildControlCsv as n, buildLandXml as o, staOffCsv as p, buildDxf as r, buildOrdPackage as s, allChains as t, htmlPlotSheet as u };
