import { s as emptySurvey } from "./job-types-DRBj8xWf.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { _ as lookupCode, b as splitDescription, g as labelShots, s as TEMPLATES, v as resolveFeature } from "./label-CD5-qmOw.mjs";
import { n as SAMPLE_CSV, o as dist2d, r as SAMPLE_NAME } from "./sample-D-33kfTV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-Bj7SGyFp.js
function splitCsvLine(line, delim) {
	if (delim === " ") return line.trim().split(/\s+/);
	const out = [];
	let cur = "";
	let q = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (q) {
			if (ch === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else q = false;
			} else cur += ch;
		} else if (ch === "\"") q = true;
		else if (ch === delim) {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out.map((s) => s.trim());
}
function detectDelim(sample) {
	const counts = {
		",": 0,
		"	": 0,
		";": 0,
		"|": 0
	};
	for (const line of sample) {
		counts[","] += (line.match(/,/g) || []).length;
		counts["	"] += (line.match(/\t/g) || []).length;
		counts[";"] += (line.match(/;/g) || []).length;
		counts["|"] += (line.match(/\|/g) || []).length;
	}
	const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
	if (best && best[1] >= sample.length) return best[0];
	return " ";
}
var HEADER_ALIASES = {
	p: "point",
	pt: "point",
	point: "point",
	"point number": "point",
	"point no": "point",
	"pt#": "point",
	pn: "point",
	n: "northing",
	north: "northing",
	northing: "northing",
	y: "northing",
	lat: "northing",
	latitude: "northing",
	e: "easting",
	east: "easting",
	easting: "easting",
	x: "easting",
	lon: "easting",
	lng: "easting",
	long: "easting",
	longitude: "easting",
	z: "elevation",
	elev: "elevation",
	elevation: "elevation",
	el: "elevation",
	h: "elevation",
	d: "description",
	desc: "description",
	description: "description",
	code: "description",
	"feature code": "description",
	feature: "description",
	"alpha code": "description",
	fd: "description",
	"feature definition": "description",
	notes: "description",
	remark: "description"
};
function normalizeHeader(h) {
	return HEADER_ALIASES[h.trim().toLowerCase().replace(/[_./]+/g, " ").replace(/\s+/g, " ")] ?? null;
}
function isNumericToken(s) {
	if (!s) return false;
	return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(s.replace(/,/g, ""));
}
function toNum(s) {
	if (s == null || s === "") return null;
	const n = Number(String(s).replace(/,/g, ""));
	return Number.isFinite(n) ? n : null;
}
function looksLikeHeader(cells) {
	if (cells.map(normalizeHeader).filter(Boolean).length >= 2) return true;
	const joined = cells.join(" ").toUpperCase();
	if (/NORTH|EAST|ELEV|DESC|POINT|PNEZD|PENZD|LAT|LON/.test(joined) && cells.some((c) => /[A-Za-z]/.test(c))) return true;
	return false;
}
function detectOrder(n, e) {
	if (n > 24e5 && e < 24e5) return "PENZD";
	if (e > 24e5 && n < 24e5) return "PNEZD";
	return "PNEZD";
}
function findCoordTriple(cells) {
	const nums = [];
	for (let i = 0; i < cells.length; i++) if (toNum(cells[i]) != null && isNumericToken(cells[i])) nums.push(i);
	if (nums.length < 2) return null;
	let start = 0;
	if (nums[0] === 0 && nums.length >= 4) {
		const p = toNum(cells[0]) ?? 0;
		const n1 = toNum(cells[nums[1]]) ?? 0;
		if (Number.isInteger(p) && Math.abs(p) < 1e6 && Math.abs(n1) > 1e3 && Math.abs(p - n1) > 50) start = 1;
	}
	const triple = nums.slice(start);
	if (triple.length < 2) return null;
	const ni = triple[0];
	const ei = triple[1];
	const zi = triple[2] ?? -1;
	const di = zi >= 0 ? zi + 1 : ei + 1;
	return {
		point: start === 1 || nums[0] === 0 && start === 1 ? cells[0] : cells[0] && !isNumericToken(cells[0]) ? cells[0] : "",
		ni,
		ei,
		zi,
		di
	};
}
function parseSurveyCsv(raw, fileName = "fieldbook.csv", orderHint) {
	const nonempty = raw.replace(/^\uFEFF/, "").split(/\r?\n/).map((l, i) => ({
		l: l.trim(),
		i
	})).filter((x) => x.l && !x.l.startsWith("#"));
	if (nonempty.length === 0) return {
		shots: [],
		order: orderHint ?? "PNEZD",
		delimiter: ",",
		hadHeader: false,
		fileName,
		raw,
		skipped: 0
	};
	let start = 0;
	let forced = orderHint ?? null;
	const first = nonempty[0].l.toUpperCase().replace(/[^A-Z]/g, "");
	if (first === "PNEZD" || first === "PNEZDS" || first === "PENZD" || first === "PENZDS") {
		if (!orderHint) forced = first.startsWith("PEN") ? "PENZD" : "PNEZD";
		start = 1;
	}
	const delim = detectDelim(nonempty.slice(start, start + 12).map((x) => x.l));
	let hadHeader = false;
	let col = {
		point: 0,
		northing: 1,
		easting: 2,
		elevation: 3,
		description: 4
	};
	let named = false;
	const firstCells = splitCsvLine(nonempty[start]?.l ?? "", delim);
	if (firstCells.length >= 3 && looksLikeHeader(firstCells)) {
		hadHeader = true;
		named = true;
		const idx = {};
		firstCells.forEach((c, i) => {
			const m = normalizeHeader(c);
			if (m === "point") idx.point = i;
			if (m === "northing") idx.northing = i;
			if (m === "easting") idx.easting = i;
			if (m === "elevation") idx.elevation = i;
			if (m === "description") idx.description = i;
		});
		col = {
			point: idx.point ?? 0,
			northing: idx.northing ?? 1,
			easting: idx.easting ?? 2,
			elevation: idx.elevation ?? 3,
			description: idx.description ?? Math.max(firstCells.length - 1, 4)
		};
		start += 1;
		if (!orderHint && idx.northing != null && idx.easting != null && idx.easting < idx.northing) forced = "PENZD";
		if (idx.northing != null && idx.easting != null) {
			forced = forced ?? "PNEZD";
			if (idx.easting < idx.northing) col = {
				...col,
				northing: idx.northing,
				easting: idx.easting
			};
		}
	}
	const shots = [];
	let skipped = 0;
	const nSamples = [];
	const eSamples = [];
	for (const { l, i } of nonempty.slice(start)) {
		const cells = splitCsvLine(l, delim);
		if (cells.length < 3) {
			skipped += 1;
			continue;
		}
		let point = "";
		let nRaw = "";
		let eRaw = "";
		let zRaw = "";
		let description = "";
		if (named) {
			point = cells[col.point] ?? "";
			nRaw = cells[col.northing] ?? "";
			eRaw = cells[col.easting] ?? "";
			zRaw = cells[col.elevation] ?? "";
			description = cells.slice(col.description).join(" ").trim();
			if (col.description === col.elevation) description = cells.slice(col.elevation + 1).join(" ").trim();
		} else {
			const hit = findCoordTriple(cells);
			if (!hit) {
				skipped += 1;
				continue;
			}
			point = hit.point || cells[0];
			nRaw = cells[hit.ni] ?? "";
			eRaw = cells[hit.ei] ?? "";
			zRaw = hit.zi >= 0 ? cells[hit.zi] ?? "" : "";
			description = cells.slice(Math.max(hit.di, 0)).join(" ").trim();
			if (isNumericToken(point) && (point === nRaw || point === eRaw)) point = "";
		}
		const issues = [];
		const n = toNum(nRaw);
		const e = toNum(eRaw);
		const z = toNum(zRaw);
		if (n == null || e == null) {
			skipped += 1;
			continue;
		}
		if (z == null) issues.push("Missing elevation");
		nSamples.push(n);
		eSamples.push(e);
		shots.push({
			uid: `r${i}-${point || shots.length}`,
			rowIndex: i + 1,
			point: point || String(shots.length + 1),
			northing: n,
			easting: e,
			elevation: z ?? 0,
			description,
			issues
		});
	}
	let order = forced ?? "PNEZD";
	if (!forced && nSamples.length) {
		const votes = {
			PNEZD: 0,
			PENZD: 0
		};
		for (let k = 0; k < nSamples.length; k++) votes[detectOrder(nSamples[k], eSamples[k])] += 1;
		if (votes.PENZD > votes.PNEZD) order = "PENZD";
	}
	if (order === "PENZD" && !hadHeader) for (const s of shots) {
		const n = s.northing;
		s.northing = s.easting;
		s.easting = n;
	}
	return {
		shots,
		order,
		delimiter: delim,
		hadHeader,
		fileName,
		raw,
		skipped
	};
}
function csvEscape(value) {
	const s = String(value ?? "");
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function toCsv(rows) {
	return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}
function azimuthDeg(n0, e0, n1, e1) {
	let az = Math.atan2(e1 - e0, n1 - n0) * 180 / Math.PI;
	if (az < 0) az += 360;
	return az;
}
function dmsParts(deg) {
	const sign = deg < 0 ? -1 : 1;
	let x = Math.abs(deg) + 1e-12;
	const d = Math.floor(x);
	x = (x - d) * 60;
	const m = Math.floor(x);
	const s = (x - m) * 60;
	return {
		d,
		m,
		s: s < 0 ? 0 : s,
		sign
	};
}
function formatDms(deg, prec = 1) {
	const { d, m, s, sign } = dmsParts(deg);
	const ss = s.toFixed(prec).padStart(prec ? 4 : 2, "0");
	return `${sign < 0 ? "-" : ""}${d}°${String(m).padStart(2, "0")}'${ss}"`;
}
function bearingText(az) {
	const a = (az % 360 + 360) % 360;
	if (a < 1e-4 || a > 359.9999) return "Due North";
	if (Math.abs(a - 90) < 1e-4) return "Due East";
	if (Math.abs(a - 180) < 1e-4) return "Due South";
	if (Math.abs(a - 270) < 1e-4) return "Due West";
	if (a < 90) return `N ${formatDms(a)} E`;
	if (a < 180) return `S ${formatDms(180 - a)} E`;
	if (a < 270) return `S ${formatDms(a - 180)} W`;
	return `N ${formatDms(360 - a)} W`;
}
/** Carlson / TDS packed DMS: 35.15205 = 35°15'20.5" */
function carlsonDmsToDeg(v) {
	const sign = v < 0 ? -1 : 1;
	const x = Math.abs(v);
	const d = Math.floor(x + 1e-12);
	const m = Math.floor((x - d) * 100 + 1e-12);
	const s = ((x - d) * 100 - m) * 100;
	return sign * (d + m / 60 + s / 3600);
}
function inverse(a, b) {
	const dN = b.n - a.n;
	const dE = b.e - a.e;
	const dZ = (b.z ?? 0) - (a.z ?? 0);
	const horiz = Math.hypot(dN, dE);
	const dist = Math.hypot(horiz, dZ);
	const az = azimuthDeg(a.n, a.e, b.n, b.e);
	return {
		dist,
		horiz,
		dN,
		dE,
		dZ,
		az,
		bearing: bearingText(az),
		gradePct: horiz > 1e-6 ? dZ / horiz * 100 : null
	};
}
function polygonArea(pts) {
	if (pts.length < 3) return {
		area: 0,
		perimeter: 0
	};
	let a = 0;
	let p = 0;
	const n = pts.length;
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		a += pts[i].e * pts[j].n - pts[j].e * pts[i].n;
		p += Math.hypot(pts[j].n - pts[i].n, pts[j].e - pts[i].e);
	}
	return {
		area: Math.abs(a) / 2,
		perimeter: p
	};
}
/** Positive dist offsets to the right of the directed polyline (surveyor's right). */
function offsetLine(pts, dist) {
	if (pts.length < 2) return pts.map((p) => ({ ...p }));
	const out = [];
	for (let i = 0; i < pts.length; i++) {
		const prev = pts[i === 0 ? 0 : i - 1];
		const next = pts[i === pts.length - 1 ? i : i + 1];
		const dN = next.n - prev.n;
		const dE = next.e - prev.e;
		const len = Math.hypot(dN, dE) || 1;
		const rn = -dE / len;
		const re = dN / len;
		out.push({
			n: pts[i].n + rn * dist,
			e: pts[i].e + re * dist,
			z: pts[i].z
		});
	}
	return out;
}
function projectToSeg(a, b, p) {
	const dN = b.n - a.n;
	const dE = b.e - a.e;
	const len2 = dN * dN + dE * dE;
	const t = len2 < 1e-18 ? 0 : ((p.n - a.n) * dN + (p.e - a.e) * dE) / len2;
	const n = a.n + t * dN;
	const e = a.e + t * dE;
	return {
		t,
		n,
		e,
		dist: Math.hypot(p.n - n, p.e - e)
	};
}
function stationOffset(line, pt) {
	if (line.length < 2) return null;
	let bestDist = Infinity;
	let best = null;
	let sta = 0;
	for (let i = 1; i < line.length; i++) {
		const a = line[i - 1];
		const b = line[i];
		const seg = Math.hypot(b.n - a.n, b.e - a.e) || 1e-12;
		const pr = projectToSeg(a, b, pt);
		const tc = Math.max(0, Math.min(1, pr.t));
		const cn = a.n + tc * (b.n - a.n);
		const ce = a.e + tc * (b.e - a.e);
		const dist = Math.hypot(pt.n - cn, pt.e - ce);
		const rn = -(b.e - a.e) / seg;
		const re = (b.n - a.n) / seg;
		const offset = (pt.n - cn) * rn + (pt.e - ce) * re;
		if (dist < bestDist) {
			bestDist = dist;
			best = {
				station: sta + tc * seg,
				offset,
				z: pt.z ?? 0,
				on: pr.t >= -.02 && pr.t <= 1.02,
				index: i - 1
			};
		}
		sta += seg;
	}
	return best;
}
function formatStation(ft) {
	const sign = ft < 0 ? "-" : "";
	const a = Math.abs(ft);
	const hun = Math.floor(a / 100);
	return `${sign}${hun}+${(a - hun * 100).toFixed(2).padStart(5, "0")}`;
}
function polylineLength(pts) {
	let d = 0;
	for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].n - pts[i - 1].n, pts[i].e - pts[i - 1].e);
	return d;
}
function reduceShot(opts) {
	const az = opts.angleRight ? (opts.bsAzimuthDeg + opts.haDeg) % 360 : opts.haDeg;
	const zRad = opts.zenithDeg * Math.PI / 180;
	const azRad = az * Math.PI / 180;
	const hd = opts.sd * Math.sin(zRad);
	const dZ = opts.sd * Math.cos(zRad) + opts.hi - opts.ht;
	return {
		n: opts.occN + hd * Math.cos(azRad),
		e: opts.occE + hd * Math.sin(azRad),
		z: opts.occZ + dZ,
		az: (az + 360) % 360,
		hd
	};
}
function nearestVertexIndex(pts, n, e, maxFt = 8) {
	let best = -1;
	let d = maxFt;
	for (let i = 0; i < pts.length; i++) {
		const dist = Math.hypot(pts[i].n - n, pts[i].e - e);
		if (dist < d) {
			d = dist;
			best = i;
		}
	}
	return best;
}
function insertOnSegment(pts, n, e, z, maxFt = 6) {
	let bestI = -1;
	let bestD = maxFt;
	let best = null;
	for (let i = 1; i < pts.length; i++) {
		const pr = projectToSeg(pts[i - 1], pts[i], {
			n,
			e,
			z
		});
		if (pr.t <= .02 || pr.t >= .98) continue;
		const cn = pts[i - 1].n + pr.t * (pts[i].n - pts[i - 1].n);
		const ce = pts[i - 1].e + pr.t * (pts[i].e - pts[i - 1].e);
		const dist = Math.hypot(n - cn, e - ce);
		if (dist < bestD) {
			bestD = dist;
			bestI = i;
			const za = pts[i - 1].z ?? z;
			const zb = pts[i].z ?? z;
			best = {
				n: cn,
				e: ce,
				z: za + pr.t * (zb - za)
			};
		}
	}
	if (bestI < 0 || !best) return null;
	return [
		...pts.slice(0, bestI),
		best,
		...pts.slice(bestI)
	];
}
function joinPolylines(a, b) {
	if (!a.length) return b.map((p) => ({ ...p }));
	if (!b.length) return a.map((p) => ({ ...p }));
	const a0 = a[0];
	const a1 = a[a.length - 1];
	const b0 = b[0];
	const b1 = b[b.length - 1];
	const d = [
		{
			k: "a1b0",
			v: Math.hypot(a1.n - b0.n, a1.e - b0.e)
		},
		{
			k: "a1b1",
			v: Math.hypot(a1.n - b1.n, a1.e - b1.e)
		},
		{
			k: "a0b0",
			v: Math.hypot(a0.n - b0.n, a0.e - b0.e)
		},
		{
			k: "a0b1",
			v: Math.hypot(a0.n - b1.n, a0.e - b1.e)
		}
	].sort((x, y) => x.v - y.v)[0];
	const A = a.map((p) => ({ ...p }));
	const B = b.map((p) => ({ ...p }));
	if (d.k === "a1b0") return [...A, ...B.slice(d.v < .05 ? 1 : 0)];
	if (d.k === "a1b1") return [...A, ...B.reverse().slice(d.v < .05 ? 1 : 0)];
	if (d.k === "a0b0") return [...A.reverse(), ...B.slice(d.v < .05 ? 1 : 0)];
	return [...A.reverse(), ...B.reverse().slice(d.v < .05 ? 1 : 0)];
}
function splitPolyline(pts, index) {
	if (index <= 0 || index >= pts.length - 1) return null;
	const left = pts.slice(0, index + 1).map((p) => ({ ...p }));
	const right = pts.slice(index).map((p) => ({ ...p }));
	if (left.length < 2 || right.length < 2) return null;
	return [left, right];
}
function detectFieldbookFormat(raw, fileName = "") {
	const name = fileName.toLowerCase();
	if (/\.rw5$/i.test(name) || /\.raw$/i.test(name)) return "rw5";
	if (/\.fbk$/i.test(name)) return "fbk";
	if (/\.gsi$/i.test(name)) return "gsi";
	if (/\.jxl$/i.test(name) || /<\s*jobxml/i.test(raw)) return "jxl";
	const head = raw.slice(0, 2500);
	if (/<\s*jobxml/i.test(head)) return "jxl";
	if (/^\*/m.test(head) && /\b(11|81|82|83)\d{2}/.test(head)) return "gsi";
	if (/^(JB|MO|OC|BK|SS|SP|TR|LS),/im.test(head)) return "rw5";
	if (/^!/m.test(head) && /\b(ST|BK|F1)\b/i.test(head)) return "fbk";
	if (/^\s*ST\s+\S+/im.test(head) && /^\s*(BK|F1)\s+/im.test(head)) return "fbk";
	return "csv";
}
function uid(prefix, i, pt) {
	return `${prefix}${i}-${pt || i}`;
}
function num(s) {
	if (s == null || s === "") return null;
	const n = Number(String(s).replace(/,/g, ""));
	return Number.isFinite(n) ? n : null;
}
function parseRw5Tags(line) {
	const parts = line.split(",");
	const out = { rec: (parts[0] || "").trim().toUpperCase() };
	for (const part of parts.slice(1)) {
		const s = part.trim();
		if (!s) continue;
		if (s.startsWith("--")) {
			out.DESC = s.slice(2).trim();
			continue;
		}
		const two = s.match(/^([A-Z]{2})(.*)$/i);
		if (two && !/^[NE]$/i.test(two[1])) {
			out[two[1].toUpperCase()] = two[2].trim();
			continue;
		}
		const one = s.match(/^([NE])\s*(.*)$/i);
		if (one) {
			out[one[1].toUpperCase()] = one[2].trim();
			continue;
		}
		if (!out.VAL) out.VAL = s;
	}
	return out;
}
function parsePackedAngle(raw) {
	const v = num(raw);
	if (v == null) return null;
	const abs = Math.abs(v);
	const frac = abs - Math.floor(abs);
	if (frac > 0 && (frac >= .6 || /[.]/.test(String(raw ?? "")) && frac * 100 % 1 > 1e-4 || frac * 100 >= 60)) return carlsonDmsToDeg(v);
	if (frac > 0 && frac < .6) return carlsonDmsToDeg(v);
	return v;
}
function parseRw5(raw, fileName) {
	const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
	const observations = [];
	const warnings = [];
	const store = /* @__PURE__ */ new Map();
	let occupied = "";
	let occN = 0;
	let occE = 0;
	let occZ = 0;
	let haveOcc = false;
	let backsight = "";
	let bsAz = 0;
	let hi = 0;
	let ht = 0;
	let angleRight = true;
	let jobName = "";
	let seq = 0;
	const pushObs = (o) => {
		observations.push({
			...o,
			id: `o${seq++}`
		});
	};
	const putStore = (pt, n, e, z, desc) => {
		store.set(pt, {
			n,
			e,
			z,
			desc
		});
	};
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("--") && !t.includes(",")) continue;
		const f = parseRw5Tags(t);
		const rec = f.rec;
		if (rec === "JB") jobName = f.NM || f.DESC || jobName;
		else if (rec === "MO") {
			if (f.AD != null) angleRight = f.AD === "1" || f.AD === "1.0";
		} else if (rec === "SP" || rec === "GPS" || rec === "GS") {
			const pt = f.PN || f.OP || "";
			const n = num(f.N);
			const e = num(f.E);
			const z = num(f.EL) ?? 0;
			if (pt && n != null && e != null) {
				putStore(pt, n, e, z, f.DESC || "");
				pushObs({
					kind: rec === "SP" ? "store" : "gps",
					point: pt,
					n,
					e,
					z,
					description: f.DESC || "",
					raw: t
				});
			}
		} else if (rec === "OC") {
			occupied = f.OP || f.PN || occupied;
			const n = num(f.N);
			const e = num(f.E);
			const z = num(f.EL);
			if (n != null && e != null) {
				occN = n;
				occE = e;
				occZ = z ?? 0;
				haveOcc = true;
				putStore(occupied, occN, occE, occZ, f.DESC || "OCC");
			} else if (occupied && store.has(occupied)) {
				const s = store.get(occupied);
				occN = s.n;
				occE = s.e;
				occZ = s.z;
				haveOcc = true;
			}
			pushObs({
				kind: "occupy",
				point: occupied,
				n: haveOcc ? occN : void 0,
				e: haveOcc ? occE : void 0,
				z: haveOcc ? occZ : void 0,
				hi,
				description: f.DESC || "",
				raw: t
			});
		} else if (rec === "BK") {
			backsight = f.BP || f.PN || backsight;
			const bs = parsePackedAngle(f.BS);
			if (bs != null) bsAz = bs;
			else if (backsight && store.has(backsight) && haveOcc) {
				const s = store.get(backsight);
				bsAz = Math.atan2(s.e - occE, s.n - occN) * 180 / Math.PI;
				if (bsAz < 0) bsAz += 360;
			}
			pushObs({
				kind: "backsight",
				point: backsight,
				occupied,
				backsight,
				azimuth: bsAz,
				description: f.DESC || "",
				raw: t
			});
		} else if (rec === "LS") {
			if (f.HI != null) hi = num(f.HI) ?? hi;
			if (f.HR != null) ht = num(f.HR) ?? ht;
		} else if (rec === "SS" || rec === "TR" || rec === "F1" || rec === "SD") {
			const pt = f.FP || f.PN || "";
			const ha = parsePackedAngle(f.AR ?? f.AZ ?? f.HA);
			const va = parsePackedAngle(f.ZE ?? f.VA ?? f.ZD);
			const sd = num(f.SD ?? f.HD);
			const desc = f.DESC || "";
			if (f.HR != null) ht = num(f.HR) ?? ht;
			if (f.HI != null) hi = num(f.HI) ?? hi;
			if (pt && ha != null && va != null && sd != null && haveOcc) {
				const red = reduceShot({
					occN,
					occE,
					occZ,
					hi,
					ht,
					haDeg: ha,
					zenithDeg: va,
					sd,
					bsAzimuthDeg: bsAz,
					angleRight
				});
				putStore(pt, red.n, red.e, red.z, desc);
				pushObs({
					kind: rec === "TR" ? "traverse" : "sideshot",
					point: pt,
					occupied,
					n: red.n,
					e: red.e,
					z: red.z,
					ha,
					va,
					sd,
					hi,
					ht,
					azimuth: red.az,
					description: desc,
					raw: t
				});
				if (rec === "TR") {
					occupied = pt;
					occN = red.n;
					occE = red.e;
					occZ = red.z;
				}
			} else warnings.push(`Could not reduce ${rec} ${pt || t.slice(0, 24)}`);
		}
	}
	const shots = [];
	let i = 0;
	for (const [point, s] of store) shots.push({
		uid: uid("rw", i++, point),
		rowIndex: i,
		point,
		northing: s.n,
		easting: s.e,
		elevation: s.z,
		description: s.desc || "SHOT",
		issues: []
	});
	return {
		format: "rw5",
		shots,
		observations,
		survey: {
			occupied,
			backsight,
			hi: hi ? String(hi) : "",
			ht: ht ? String(ht) : "",
			notes: jobName,
			observations,
			books: [{
				name: fileName,
				points: shots.length
			}]
		},
		skipped: warnings.length,
		order: "PNEZD",
		warnings
	};
}
function parseFbk(raw, fileName) {
	const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
	const store = /* @__PURE__ */ new Map();
	const observations = [];
	const warnings = [];
	let occupied = "";
	let occN = 0;
	let occE = 0;
	let occZ = 0;
	let haveOcc = false;
	let backsight = "";
	let bsAz = 0;
	let hi = 0;
	let ht = 5;
	let seq = 0;
	const pushObs = (o) => observations.push({
		...o,
		id: `o${seq++}`
	});
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("!") || t.startsWith("*") || t.startsWith("#")) {
			if (t.toUpperCase().startsWith("NOTE")) pushObs({
				kind: "note",
				point: "",
				description: t,
				raw: t
			});
			continue;
		}
		const cells = t.split(/[,\s]+/).filter(Boolean);
		const rec = (cells[0] || "").toUpperCase();
		if (rec === "UNITS" || rec === "NOTE") continue;
		if (rec === "ST" || rec === "OC") {
			const pt = cells[1] || "";
			const n = num(cells[2]);
			const e = num(cells[3]);
			const z = num(cells[4]) ?? 0;
			occupied = pt;
			if (n != null && e != null) {
				occN = n;
				occE = e;
				occZ = z;
				haveOcc = true;
				store.set(pt, {
					n,
					e,
					z,
					desc: cells.slice(5).join(" ") || "OCC"
				});
			} else if (store.has(pt)) {
				const s = store.get(pt);
				occN = s.n;
				occE = s.e;
				occZ = s.z;
				haveOcc = true;
			}
			pushObs({
				kind: "occupy",
				point: pt,
				n: occN,
				e: occE,
				z: occZ,
				description: "",
				raw: t
			});
		} else if (rec === "BK") {
			backsight = cells[1] || "";
			const az = parsePackedAngle(cells[2]);
			if (az != null) bsAz = az;
			else if (store.has(backsight) && haveOcc) {
				const s = store.get(backsight);
				bsAz = Math.atan2(s.e - occE, s.n - occN) * 180 / Math.PI;
				if (bsAz < 0) bsAz += 360;
			}
			pushObs({
				kind: "backsight",
				point: backsight,
				occupied,
				azimuth: bsAz,
				description: "",
				raw: t
			});
		} else if (rec === "HI") hi = num(cells[1]) ?? hi;
		else if (rec === "HT" || rec === "HR") ht = num(cells[1]) ?? ht;
		else if (rec === "F1" || rec === "SS" || rec === "TR") {
			const pt = cells[1] || "";
			const ha = parsePackedAngle(cells[2]);
			const va = parsePackedAngle(cells[3]);
			const sd = num(cells[4]);
			const desc = cells.slice(5).join(" ");
			if (pt && ha != null && va != null && sd != null && haveOcc) {
				const red = reduceShot({
					occN,
					occE,
					occZ,
					hi,
					ht,
					haDeg: ha,
					zenithDeg: va,
					sd,
					bsAzimuthDeg: bsAz,
					angleRight: true
				});
				store.set(pt, {
					n: red.n,
					e: red.e,
					z: red.z,
					desc
				});
				pushObs({
					kind: rec === "TR" ? "traverse" : "sideshot",
					point: pt,
					occupied,
					n: red.n,
					e: red.e,
					z: red.z,
					ha,
					va,
					sd,
					description: desc,
					raw: t
				});
			} else warnings.push(`Could not reduce ${t.slice(0, 40)}`);
		} else {
			const n = num(cells[1]);
			const e = num(cells[2]);
			const z = num(cells[3]);
			if (cells[0] && n != null && e != null && Math.abs(n) > 10 && Math.abs(e) > 10) {
				const pt = cells[0];
				const desc = cells.slice(4).join(" ");
				store.set(pt, {
					n,
					e,
					z: z ?? 0,
					desc
				});
				pushObs({
					kind: "store",
					point: pt,
					n,
					e,
					z: z ?? 0,
					description: desc,
					raw: t
				});
			}
		}
	}
	const shots = [];
	let i = 0;
	for (const [point, s] of store) shots.push({
		uid: uid("fb", i++, point),
		rowIndex: i,
		point,
		northing: s.n,
		easting: s.e,
		elevation: s.z,
		description: s.desc || "SHOT",
		issues: []
	});
	return {
		format: "fbk",
		shots,
		observations,
		survey: {
			occupied,
			backsight,
			hi: hi ? String(hi) : "",
			ht: ht ? String(ht) : "",
			observations,
			books: [{
				name: fileName,
				points: shots.length
			}]
		},
		skipped: warnings.length,
		order: "PNEZD",
		warnings
	};
}
function parseGsiWord(word) {
	const m = word.match(/^(\d{2})(\d{3})([+-])(.+)$/);
	if (!m) return null;
	return {
		wi: m[1],
		value: m[3] === "-" ? `-${m[4].trim()}` : m[4].trim()
	};
}
function parseGsi(raw, fileName) {
	const shots = [];
	const observations = [];
	const warnings = [];
	const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
	let i = 0;
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("!")) continue;
		const words = t.split(/\s+/).filter(Boolean);
		const fields = {};
		for (const w of words) {
			const p = parseGsiWord(w.replace(/^\*/, ""));
			if (p) fields[p.wi] = p.value;
		}
		const pt = (fields["11"] || "").replace(/^0+/, "") || String(i + 1);
		const e = num(fields["81"]);
		const n = num(fields["82"]);
		const z = num(fields["83"]);
		const desc = (fields["71"] || fields["41"] || "").replace(/^0+/, "");
		if (n != null && e != null) {
			shots.push({
				uid: uid("gs", i, pt),
				rowIndex: i + 1,
				point: pt,
				northing: n,
				easting: e,
				elevation: z ?? 0,
				description: desc || "SHOT",
				issues: []
			});
			observations.push({
				id: `o${i}`,
				kind: "store",
				point: pt,
				n,
				e,
				z: z ?? 0,
				description: desc,
				raw: t
			});
			i += 1;
		} else if (t) warnings.push(`GSI line skipped: ${t.slice(0, 40)}`);
	}
	return {
		format: "gsi",
		shots,
		observations,
		survey: {
			observations,
			books: [{
				name: fileName,
				points: shots.length
			}]
		},
		skipped: warnings.length,
		order: "PNEZD",
		warnings
	};
}
function xmlText(block, tag) {
	const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
	return m ? m[1].trim() : "";
}
function parseJxl(raw, fileName) {
	const shots = [];
	const observations = [];
	const warnings = [];
	const blocks = raw.split(/<(?:PointRecord|CoordinateRecord|Point)\b/i).slice(1);
	let i = 0;
	for (const b of blocks) {
		const point = xmlText(b, "PointNumber") || xmlText(b, "Name") || xmlText(b, "ID") || String(i + 1);
		const n = num(xmlText(b, "North") || xmlText(b, "Northing") || xmlText(b, "Y"));
		const e = num(xmlText(b, "East") || xmlText(b, "Easting") || xmlText(b, "X"));
		const z = num(xmlText(b, "Elevation") || xmlText(b, "Z") || xmlText(b, "Height"));
		const desc = xmlText(b, "Code") || xmlText(b, "FeatureCode") || xmlText(b, "Description");
		if (n != null && e != null) {
			shots.push({
				uid: uid("jx", i, point),
				rowIndex: i + 1,
				point,
				northing: n,
				easting: e,
				elevation: z ?? 0,
				description: desc || "SHOT",
				issues: []
			});
			observations.push({
				id: `o${i}`,
				kind: "store",
				point,
				n,
				e,
				z: z ?? 0,
				description: desc,
				raw: ""
			});
			i += 1;
		}
	}
	if (!shots.length) warnings.push("No PointRecord / CoordinateRecord nodes in JobXML.");
	return {
		format: "jxl",
		shots,
		observations,
		survey: {
			observations,
			books: [{
				name: fileName,
				points: shots.length
			}]
		},
		skipped: warnings.length,
		order: "PNEZD",
		warnings
	};
}
function parseFieldbook(raw, fileName = "fieldbook.csv", orderHint) {
	const format = detectFieldbookFormat(raw, fileName);
	if (format === "rw5") return parseRw5(raw, fileName);
	if (format === "fbk") return parseFbk(raw, fileName);
	if (format === "gsi") return parseGsi(raw, fileName);
	if (format === "jxl") return parseJxl(raw, fileName);
	const csv = parseSurveyCsv(raw, fileName, orderHint);
	return {
		format: "csv",
		shots: csv.shots,
		observations: [],
		survey: { books: [{
			name: fileName,
			points: csv.shots.length
		}] },
		skipped: csv.skipped,
		order: csv.order,
		warnings: []
	};
}
function shotsToPnezd(shots) {
	const rows = ["P,N,E,Z,D"];
	for (const s of shots) {
		const d = (s.description || "").replace(/"/g, "\"\"");
		rows.push(`${s.point},${s.northing.toFixed(4)},${s.easting.toFixed(4)},${s.elevation.toFixed(3)},${d}`);
	}
	return rows.join("\n") + "\n";
}
var CAT_STYLE = {
	Roadway: {
		color: "#e6c84b",
		mark: "circle",
		weight: 2.2
	},
	Drainage: {
		color: "#3ad4ff",
		mark: "diamond",
		weight: 2
	},
	Utility: {
		color: "#d45cff",
		mark: "square",
		weight: 1.8
	},
	Property: {
		color: "#e8e8e8",
		mark: "plus",
		weight: 1.6
	},
	"Right of Way": {
		color: "#ff7ad9",
		mark: "plus",
		weight: 2
	},
	"Survey Control": {
		color: "#ff4d4d",
		mark: "tri",
		weight: 2
	},
	Topo: {
		color: "#6ee86e",
		mark: "circle",
		weight: 1.5
	},
	Traffic: {
		color: "#f4f4f0",
		mark: "square",
		weight: 1.6
	},
	Bridge: {
		color: "#d4a0e8",
		mark: "diamond",
		weight: 2
	},
	Surface: {
		color: "#ffe14a",
		mark: "circle",
		weight: 1.6
	}
};
var FALLBACK_STYLE = {
	color: "#f07070",
	mark: "x",
	weight: 1.6
};
function styleFor(cat) {
	if (!cat) return FALLBACK_STYLE;
	return CAT_STYLE[cat] ?? FALLBACK_STYLE;
}
/** MicroStation-like per-code colors so parallel road strings read as separate features. */
var CODE_STYLE = {
	RC: {
		color: "#f4f4f0",
		weight: 2.4,
		dash: "10 6",
		mark: "circle"
	},
	CL: {
		color: "#f4f4f0",
		weight: 2.4,
		dash: "10 6",
		mark: "circle"
	},
	EP: {
		color: "#e6c84b",
		weight: 2.6,
		mark: "circle"
	},
	EG: {
		color: "#d4b24a",
		weight: 2.2,
		mark: "circle"
	},
	ES: {
		color: "#c4a040",
		weight: 1.8,
		dash: "7 4",
		mark: "circle"
	},
	CT: {
		color: "#5ad4d4",
		weight: 2.4,
		mark: "circle"
	},
	DP: {
		color: "#e6c84b",
		weight: 2.2,
		mark: "circle"
	},
	AA: {
		color: "#d8a84a",
		weight: 2.2,
		mark: "circle"
	},
	LL: {
		color: "#f4f4f0",
		weight: 1.4,
		dash: "4 8",
		mark: "circle"
	},
	RB: {
		color: "#c8c8c4",
		weight: 2.4,
		mark: "circle"
	},
	DL: {
		color: "#3ad4ff",
		weight: 2,
		dash: "8 4",
		mark: "diamond"
	},
	WF: {
		color: "#2a9ed4",
		weight: 2,
		mark: "diamond"
	},
	FL: {
		color: "#2a9ed4",
		weight: 2,
		mark: "diamond"
	},
	DI: {
		color: "#3ad4ff",
		weight: 1.8,
		dash: "6 4",
		mark: "diamond"
	},
	OV: {
		color: "#d45cff",
		weight: 1.8,
		dash: "1 6",
		mark: "circle"
	},
	FW: {
		color: "#e8e8e8",
		weight: 1.6,
		dash: "10 3 2 3",
		mark: "plus"
	},
	FF: {
		color: "#c8e050",
		weight: 1.6,
		dash: "8 4",
		mark: "circle"
	},
	WL: {
		color: "#3d9c4a",
		weight: 2,
		dash: "12 4 2 4",
		mark: "tree"
	},
	BR: {
		color: "#ff7ad9",
		weight: 2,
		dash: "14 6",
		mark: "plus"
	},
	RP: {
		color: "#c8a070",
		weight: 1.8,
		mark: "diamond"
	},
	PHYD: {
		color: "#c45c32",
		mark: "diamond",
		weight: 1.6
	},
	PPOL: {
		color: "#e24b4b",
		mark: "pole",
		weight: 1.6
	},
	PGUY: {
		color: "#e8a03a",
		mark: "x",
		weight: 1.4
	},
	PSGN: {
		color: "#5ad45a",
		mark: "square",
		weight: 1.6
	},
	PSND: {
		color: "#5ad45a",
		mark: "square",
		weight: 1.6
	},
	PBMK: {
		color: "#ffe14a",
		mark: "tri",
		weight: 2
	},
	PRE: {
		color: "#ff4d4d",
		mark: "circle",
		weight: 2
	},
	PMON: {
		color: "#ff4d4d",
		mark: "tri",
		weight: 2
	},
	TRAV: {
		color: "#ff4d4d",
		mark: "tri",
		weight: 2
	},
	PELV: {
		color: "#8aa08a",
		mark: "plus",
		weight: 1.2
	},
	PTDS: {
		color: "#5ad45a",
		mark: "tree",
		weight: 1.6
	},
	PMBX: {
		color: "#e8e8e8",
		mark: "square",
		weight: 1.4
	},
	PELM: {
		color: "#e8e8e8",
		mark: "square",
		weight: 1.4
	},
	PTER: {
		color: "#e8e8e8",
		mark: "square",
		weight: 1.4
	},
	PFOM: {
		color: "#e8e8e8",
		mark: "plus",
		weight: 1.4
	},
	PTFP: {
		color: "#e8e8e8",
		mark: "plus",
		weight: 1.4
	},
	PPST: {
		color: "#e8e8e8",
		mark: "plus",
		weight: 1.4
	},
	PGSO: {
		color: "#e8a03a",
		mark: "circle",
		weight: 1.6
	},
	PCON: {
		color: "#5ad4d4",
		mark: "square",
		weight: 1.6
	},
	PCCT: {
		color: "#5ad4d4",
		mark: "circle",
		weight: 1.4
	},
	PDEL: {
		color: "#5ad45a",
		mark: "square",
		weight: 1.4
	},
	PCBD: {
		color: "#f4f4f0",
		mark: "square",
		weight: 1.4
	},
	PCRB: {
		color: "#f4f4f0",
		mark: "square",
		weight: 1.4
	},
	PCST: {
		color: "#f4f4f0",
		mark: "square",
		weight: 1.4
	}
};
function styleForCode(code, cat) {
	const k = (code ?? "").toUpperCase();
	if (k && CODE_STYLE[k]) return CODE_STYLE[k];
	const catStyle = styleFor(cat);
	return {
		color: catStyle.color,
		weight: catStyle.weight,
		mark: catStyle.mark
	};
}
var SHEET_LEGEND = [
	{
		id: "RC",
		label: "ROAD CROWN",
		color: "#f4f4f0",
		mark: "circle",
		linear: true
	},
	{
		id: "EP",
		label: "EDGE OF PAVEMENT",
		color: "#e6c84b",
		mark: "circle",
		linear: true
	},
	{
		id: "ES",
		label: "EDGE OF SHOULDER",
		color: "#c4a040",
		mark: "circle",
		linear: true
	},
	{
		id: "CT",
		label: "CURB TOP",
		color: "#5ad4d4",
		mark: "circle",
		linear: true
	},
	{
		id: "DL",
		label: "DITCH LINE",
		color: "#3ad4ff",
		mark: "diamond",
		linear: true
	},
	{
		id: "WF",
		label: "FLOW LINE",
		color: "#2a9ed4",
		mark: "circle",
		linear: true
	},
	{
		id: "OV",
		label: "OVERHEAD UTILITY",
		color: "#d45cff",
		mark: "circle",
		linear: true
	},
	{
		id: "WL",
		label: "WOODS LINE",
		color: "#3d9c4a",
		mark: "tree",
		linear: true
	},
	{
		id: "RB",
		label: "GUARDRAIL",
		color: "#c8c8c4",
		mark: "circle",
		linear: true
	},
	{
		id: "PPOL",
		label: "POWER POLE",
		color: "#e24b4b",
		mark: "pole"
	},
	{
		id: "PSGN",
		label: "SIGN",
		color: "#5ad45a",
		mark: "square"
	},
	{
		id: "PHYD",
		label: "FIRE HYDRANT",
		color: "#c45c32",
		mark: "diamond"
	},
	{
		id: "PTDS",
		label: "TREE (DECIDUOUS)",
		color: "#5ad45a",
		mark: "tree"
	},
	{
		id: "PRE",
		label: "REBAR",
		color: "#ff4d4d",
		mark: "circle"
	},
	{
		id: "PBMK",
		label: "BENCHMARK",
		color: "#ffe14a",
		mark: "tri"
	}
];
function markSvg(mark, color, size = 12) {
	const s = size;
	const sw = 1.4;
	const c = color;
	if (mark === "square") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
	if (mark === "tri") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><polygon points="6,1.5 10.5,10.5 1.5,10.5" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
	if (mark === "plus") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><path d="M6 1.5 V10.5 M1.5 6 H10.5" stroke="${c}" stroke-width="${sw}" fill="none"/></svg>`;
	if (mark === "diamond") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
	if (mark === "pole") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.4" fill="${c}"/><circle cx="6" cy="6" r="1.2" fill="#111"/></svg>`;
	if (mark === "tree") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="5" r="3.6" fill="none" stroke="${c}" stroke-width="${sw}"/><path d="M6 8.5 V11" stroke="${c}" stroke-width="${sw}"/></svg>`;
	if (mark === "x") return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><path d="M3 3 L9 9 M9 3 L3 9" stroke="${c}" stroke-width="${sw}" fill="none"/></svg>`;
	return `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.6" fill="none" stroke="${c}" stroke-width="${sw}"/></svg>`;
}
var POINT_ATTR = /* @__PURE__ */ new Set(["Point"]);
function tokensOf(rem) {
	return rem.toUpperCase().split(/\s+/).map((t) => t.replace(/[.,;:]+$/g, "")).filter(Boolean);
}
function hasToken(tokens, set) {
	return tokens.some((t) => set.has(t));
}
var START_SET = /* @__PURE__ */ new Set([
	"ST",
	"START",
	"STRT",
	"PC",
	"SC"
]);
var END_SET = /* @__PURE__ */ new Set([
	"END",
	"PT",
	"EC"
]);
var CLOSE_SET = /* @__PURE__ */ new Set(["CLS", "CLOSE"]);
var JOIN_SET = /* @__PURE__ */ new Set([
	"J",
	"JOIN",
	"JPT",
	"OC"
]);
function isPointCode(shot, feature) {
	const alpha = shot.codeToken.toUpperCase();
	if (alpha.startsWith("P") && alpha.length >= 3) {
		if (feature?.attr === "Break Line") return false;
		return true;
	}
	if (!feature) return false;
	if (POINT_ATTR.has(feature.attr)) return true;
	return false;
}
function heading(a, b) {
	return Math.atan2(b.easting - a.easting, b.northing - a.northing);
}
function turnDeg(a, b, c) {
	const h1 = heading(a, b);
	const h2 = heading(b, c);
	let d = Math.abs(h1 - h2) * (180 / Math.PI);
	if (d > 180) d = 360 - d;
	return d;
}
var GAP_FT = 140;
var REVERSE_DEG = 135;
var REVERSE_MIN_FT = 14;
function shouldBreak(chain, next) {
	if (!chain.length) return false;
	const last = chain[chain.length - 1];
	const d = dist2d(last, next);
	if (d > GAP_FT) return true;
	if (chain.length >= 2 && d > REVERSE_MIN_FT) {
		const prev = chain[chain.length - 2];
		if (turnDeg(prev, last, next) > REVERSE_DEG) return true;
	}
	return false;
}
function finish(run, closed, remaps, seq, out) {
	if (run.length < 2) return;
	const feature = resolveFeature(run[0], remaps);
	out.push({
		id: `c${seq.n++}-${run[0].codeToken.toUpperCase()}`,
		code: run[0].codeToken.toUpperCase(),
		feature,
		shots: run.slice(),
		closed,
		source: "survey"
	});
}
/**
* Field-to-finish: each alpha code keeps an active string.
* Point features (PHYD, PPOL, …) do not break linear strings.
* ST starts a new string; END/CLS close; reverse/gap splits opposite edges.
*/
function buildChains(shots, remaps) {
	const chains = [];
	const active = /* @__PURE__ */ new Map();
	const seq = { n: 0 };
	const closeCode = (code, closed = false) => {
		const cur = active.get(code);
		if (!cur) return;
		finish(cur.run, closed || cur.closed, remaps, seq, chains);
		active.delete(code);
	};
	const start = (shot) => {
		const code = shot.codeToken.toUpperCase();
		active.set(code, {
			run: [shot],
			closed: false
		});
	};
	const nearestEnd = (code, shot) => {
		let best = null;
		const consider = (run) => {
			if (run.length < 1) return;
			const d0 = dist2d(run[0], shot);
			const d1 = dist2d(run[run.length - 1], shot);
			const atStart = d0 < d1;
			const d = Math.min(d0, d1);
			if (d < 60 && (!best || d < best.d)) best = {
				run,
				atStart,
				d
			};
		};
		const cur = active.get(code);
		if (cur) consider(cur.run);
		for (const ch of chains) if (ch.code === code) consider(ch.shots);
		return best;
	};
	for (const shot of shots) {
		const code = shot.codeToken.toUpperCase();
		if (!code) continue;
		if (isPointCode(shot, resolveFeature(shot, remaps))) continue;
		const tok = tokensOf(shot.remainder);
		const isStart = hasToken(tok, START_SET);
		const isEnd = hasToken(tok, END_SET);
		const isClose = hasToken(tok, CLOSE_SET);
		if (hasToken(tok, JOIN_SET)) {
			const hit = nearestEnd(code, shot);
			if (hit) {
				if (hit.atStart) hit.run.unshift(shot);
				else hit.run.push(shot);
				if (isEnd || isClose) closeCode(code, isClose);
				continue;
			}
		}
		if (isStart) {
			closeCode(code);
			start(shot);
			if (isEnd || isClose) closeCode(code, isClose);
			continue;
		}
		const cur = active.get(code);
		if (cur) {
			if (shouldBreak(cur.run, shot)) {
				closeCode(code);
				start(shot);
			} else cur.run.push(shot);
		} else start(shot);
		if (isEnd) closeCode(code, false);
		else if (isClose) closeCode(code, true);
	}
	for (const code of [...active.keys()]) closeCode(code);
	return chains;
}
function chainedShotIds(chains) {
	const ids = /* @__PURE__ */ new Set();
	for (const c of chains) {
		if (c.shots.length < 2 && !(c.pts && c.pts.length >= 2)) continue;
		for (const s of c.shots) ids.add(s.uid);
	}
	return ids;
}
function userLineToChain(line, remaps) {
	const fakeShots = line.pts.map((p, i) => ({
		uid: `${line.id}-v${i}`,
		rowIndex: i,
		point: "",
		northing: p.n,
		easting: p.e,
		elevation: p.z,
		description: line.code,
		issues: [],
		codeToken: line.code,
		remainder: i === 0 ? "ST" : i === line.pts.length - 1 ? "END" : "",
		matchId: null
	}));
	return {
		id: line.id,
		code: line.code.toUpperCase(),
		feature: resolveFeature(fakeShots[0], remaps),
		shots: fakeShots,
		closed: line.closed,
		source: "extract",
		pts: line.pts
	};
}
function chainStyle(chain) {
	return styleForCode(chain.code, chain.feature?.cat);
}
function chainVertices(chain) {
	if (chain.pts?.length) return chain.pts;
	return chain.shots.map((s) => ({
		n: s.northing,
		e: s.easting,
		z: s.elevation,
		uid: s.uid
	}));
}
function extractsAsShots(lines, start = 9e4) {
	const out = [];
	let n = start;
	for (const line of lines) line.pts.forEach((p, i) => {
		const rem = i === 0 ? "ST" : i === line.pts.length - 1 ? "END" : "";
		out.push({
			uid: `${line.id}-${i}`,
			rowIndex: n,
			point: String(n),
			northing: p.n,
			easting: p.e,
			elevation: p.z,
			description: rem ? `${line.code} ${rem}` : line.code,
			issues: [],
			codeToken: line.code,
			remainder: rem,
			matchId: null
		});
		n += 1;
	});
	return out;
}
function asNez(v) {
	return {
		n: v.n,
		e: v.e,
		z: v.z
	};
}
function fromNez(p, uid) {
	return {
		n: p.n,
		e: p.e,
		z: p.z ?? 0,
		uid
	};
}
function similar(a, b) {
	if (a.length < 2 || b.length < 2) return false;
	const a0 = a[0];
	const a1 = a[a.length - 1];
	const b0 = b[0];
	const b1 = b[b.length - 1];
	const d00 = Math.hypot(a0.n - b0.n, a0.e - b0.e);
	const d11 = Math.hypot(a1.n - b1.n, a1.e - b1.e);
	const d01 = Math.hypot(a0.n - b1.n, a0.e - b1.e);
	const d10 = Math.hypot(a1.n - b0.n, a1.e - b0.e);
	return d00 < .2 && d11 < .2 || d01 < .2 && d10 < .2;
}
function extractAllLines(shots, remaps, existing, idBase = "x") {
	const chains = buildChains(shots, remaps);
	const extra = [];
	let seq = existing.length + 1;
	for (const c of chains) {
		const verts = chainVertices(c).map((v) => ({
			n: v.n,
			e: v.e,
			z: v.z
		}));
		if (verts.length < 2) continue;
		if (existing.some((l) => l.code === c.code && similar(l.pts, verts))) continue;
		if (extra.some((l) => l.code === c.code && similar(l.pts, verts))) continue;
		extra.push({
			id: `${idBase}${seq++}`,
			code: c.code,
			pts: verts,
			closed: c.closed,
			source: "extract"
		});
	}
	return extra;
}
function joinUserLines(a, b, id) {
	const pts = joinPolylines(a.pts.map(asNez), b.pts.map(asNez)).map((p) => fromNez(p));
	return {
		id,
		code: a.code || b.code,
		pts,
		closed: false,
		source: "extract"
	};
}
function splitUserLine(line, index, idA, idB) {
	const parts = splitPolyline(line.pts.map(asNez), index);
	if (!parts) return null;
	return [{
		id: idA,
		code: line.code,
		pts: parts[0].map((p) => fromNez(p)),
		closed: false,
		source: "extract"
	}, {
		id: idB,
		code: line.code,
		pts: parts[1].map((p) => fromNez(p)),
		closed: false,
		source: "extract"
	}];
}
function offsetUserLine(line, dist, id) {
	return {
		id,
		code: line.code,
		pts: offsetLine(line.pts.map(asNez), dist).map((p) => fromNez(p)),
		closed: line.closed,
		source: "extract"
	};
}
function extractChainById(shots, remaps, chainId, existing, id) {
	const c = buildChains(shots, remaps).find((x) => x.id === chainId);
	if (!c) return null;
	const verts = chainVertices(c).map((v) => ({
		n: v.n,
		e: v.e,
		z: v.z
	}));
	if (verts.length < 2) return null;
	if (existing.some((l) => l.code === c.code && similar(l.pts, verts))) return null;
	return {
		id,
		code: c.code,
		pts: verts,
		closed: c.closed,
		source: "extract"
	};
}
function relabel(shot, description) {
	const { codeToken, remainder } = splitDescription(description);
	const hit = lookupCode(codeToken);
	return {
		...shot,
		description,
		codeToken,
		remainder,
		matchId: hit?.id ?? null
	};
}
function ingest(raw, fileName, orderHint) {
	const book = parseFieldbook(raw, fileName, orderHint);
	return {
		fileName,
		raw: book.format === "csv" ? raw : shotsToPnezd(book.shots),
		order: book.order,
		shots: labelShots(book.shots),
		skipped: book.skipped,
		hadHeader: book.format === "csv" ? parseSurveyCsv(raw, fileName, orderHint).hadHeader : true,
		surveyPatch: book.survey,
		warnings: book.warnings
	};
}
var ingested = ingest(SAMPLE_CSV, SAMPLE_NAME, "PNEZD");
var sample = {
	fileName: ingested.fileName,
	raw: ingested.raw,
	order: ingested.order,
	shots: ingested.shots,
	skipped: ingested.skipped,
	hadHeader: ingested.hadHeader
};
var uiDefaults = {
	remaps: {},
	templateId: "code-desc",
	exportKind: "labeled-ord",
	filter: "all",
	selectedUid: null,
	selectedLineId: null,
	query: "",
	hiddenAlphas: {},
	frozenAlphas: {},
	labelsOn: true,
	legendOn: true,
	tableOn: true,
	mapMode: "hybrid",
	leftOpen: true,
	rightOpen: true,
	shotsOpen: false,
	focusNonce: 0,
	focusAlpha: null,
	tool: "select",
	activeCode: "EP",
	userLines: [],
	draft: [],
	measure: [],
	cursor: null,
	isolated: null,
	crsId: "auto",
	rightTab: "levels",
	survey: emptySurvey(),
	surveyStringsOn: true,
	contoursOn: false,
	contourInterval: 1,
	offsetFt: 2,
	cogo: null,
	joinPending: null,
	viewCmd: null
};
var lineSeq = 1;
var shotSeq = 1;
function nextLineId() {
	return `x${lineSeq++}`;
}
function mergeSurvey(base, patch) {
	if (!patch) return base;
	return {
		...base,
		...patch,
		crew: patch.crew || base.crew,
		instrument: patch.instrument || base.instrument,
		occupied: patch.occupied || base.occupied,
		backsight: patch.backsight || base.backsight,
		date: patch.date || base.date,
		notes: patch.notes || base.notes,
		hi: patch.hi || base.hi,
		ht: patch.ht || base.ht,
		weather: patch.weather || base.weather,
		observations: patch.observations?.length ? patch.observations : base.observations ?? [],
		books: (() => {
			const a = base.books ?? [];
			const b = patch.books ?? [];
			if (!b.length) return a;
			return [...a, ...b.filter((x) => !a.some((y) => y.name === x.name))];
		})()
	};
}
var useBook = create()(persist((set, get) => ({
	...sample,
	...uiDefaults,
	loadText: (raw, fileName) => {
		const next = ingest(raw, fileName);
		set({
			fileName: next.fileName,
			raw: next.raw,
			order: next.order,
			shots: next.shots,
			skipped: next.skipped,
			hadHeader: next.hadHeader,
			remaps: {},
			selectedUid: null,
			selectedLineId: null,
			filter: "all",
			query: "",
			hiddenAlphas: {},
			frozenAlphas: {},
			shotsOpen: false,
			userLines: [],
			draft: [],
			measure: [],
			isolated: null,
			survey: mergeSurvey(emptySurvey(), next.surveyPatch),
			cogo: null,
			joinPending: null,
			surveyStringsOn: true
		});
	},
	loadBook: (raw, fileName, extra) => {
		const next = ingest(raw, fileName, extra?.order);
		set({
			fileName: next.fileName,
			raw: next.raw,
			order: next.order,
			shots: next.shots,
			skipped: next.skipped,
			hadHeader: next.hadHeader,
			remaps: extra?.remaps ?? {},
			userLines: extra?.userLines ?? [],
			survey: mergeSurvey(extra?.survey ?? emptySurvey(), next.surveyPatch),
			selectedUid: null,
			selectedLineId: null,
			filter: "all",
			query: "",
			hiddenAlphas: {},
			frozenAlphas: {},
			draft: [],
			measure: [],
			isolated: null,
			cogo: null,
			joinPending: null
		});
	},
	appendText: (raw, fileName) => {
		const next = ingest(raw, fileName);
		const existing = get().shots;
		const used = new Set(existing.map((s) => s.point));
		const nums = existing.map((s) => Number(s.point)).filter((n) => Number.isFinite(n));
		let max = nums.length ? Math.max(...nums) : 0;
		const incoming = next.shots.map((s) => {
			if (!used.has(s.point)) {
				used.add(s.point);
				return s;
			}
			max += 1;
			used.add(String(max));
			return {
				...s,
				point: String(max),
				uid: `p${Date.now().toString(36)}${shotSeq++}`
			};
		});
		set({
			shots: [...existing, ...incoming],
			raw: existing.length ? `${get().raw.trim()}\n${next.raw}` : next.raw,
			fileName: get().fileName ? `${get().fileName.replace(/\.[^.]+$/, "")}+${fileName}` : fileName,
			skipped: get().skipped + next.skipped,
			survey: mergeSurvey(get().survey, next.surveyPatch)
		});
		return {
			added: incoming.length,
			warnings: next.warnings
		};
	},
	loadSample: () => {
		const next = ingest(SAMPLE_CSV, SAMPLE_NAME, "PNEZD");
		set({
			fileName: next.fileName,
			raw: next.raw,
			order: next.order,
			shots: next.shots,
			skipped: next.skipped,
			hadHeader: next.hadHeader,
			remaps: {},
			selectedUid: null,
			selectedLineId: null,
			filter: "all",
			query: "",
			hiddenAlphas: {},
			frozenAlphas: {},
			userLines: [],
			draft: [],
			measure: [],
			isolated: null,
			survey: emptySurvey(),
			cogo: null,
			joinPending: null,
			surveyStringsOn: true
		});
	},
	clear: () => set({
		fileName: "",
		raw: "",
		shots: [],
		skipped: 0,
		selectedUid: null,
		selectedLineId: null,
		remaps: {},
		query: "",
		hiddenAlphas: {},
		frozenAlphas: {},
		userLines: [],
		draft: [],
		measure: [],
		isolated: null,
		survey: emptySurvey(),
		cogo: null,
		joinPending: null
	}),
	setOrder: (order) => set((s) => {
		if (!s.raw) return { order };
		const next = ingest(s.raw, s.fileName, order);
		return {
			fileName: next.fileName,
			raw: next.raw,
			order: next.order,
			shots: next.shots,
			skipped: next.skipped,
			hadHeader: next.hadHeader,
			remaps: s.remaps
		};
	}),
	setRemap: (code, featureId) => set((s) => {
		const key = code.trim().toUpperCase();
		const remaps = { ...s.remaps };
		if (!featureId) delete remaps[key];
		else remaps[key] = featureId;
		return { remaps };
	}),
	setTemplate: (id) => set({ templateId: id }),
	setExportKind: (k) => set({ exportKind: k }),
	setFilter: (f) => set({ filter: f }),
	setSelected: (uid) => set({ selectedUid: uid }),
	setSelectedLine: (id) => set({ selectedLineId: id }),
	setQuery: (q) => set({ query: q }),
	toggleAlpha: (code) => set((s) => {
		const hiddenAlphas = { ...s.hiddenAlphas };
		const k = code.toUpperCase();
		if (hiddenAlphas[k]) delete hiddenAlphas[k];
		else hiddenAlphas[k] = true;
		return { hiddenAlphas };
	}),
	showAllAlphas: () => set({
		hiddenAlphas: {},
		isolated: null
	}),
	hideAllAlphas: (codes) => set({ hiddenAlphas: Object.fromEntries(codes.map((c) => [c.toUpperCase(), true])) }),
	toggleFrozen: (code) => set((s) => {
		const frozenAlphas = { ...s.frozenAlphas };
		const k = code.toUpperCase();
		if (frozenAlphas[k]) delete frozenAlphas[k];
		else frozenAlphas[k] = true;
		return { frozenAlphas };
	}),
	setLabelsOn: (v) => set({ labelsOn: v }),
	setLegendOn: (v) => set({ legendOn: v }),
	setTableOn: (v) => set({ tableOn: v }),
	setMapMode: (m) => set({ mapMode: m }),
	setLeftOpen: (v) => set({ leftOpen: v }),
	setRightOpen: (v) => set({ rightOpen: v }),
	setShotsOpen: (v) => set({ shotsOpen: v }),
	focusOn: (alpha) => set((s) => ({
		focusAlpha: alpha,
		focusNonce: s.focusNonce + 1
	})),
	setTool: (t) => set({
		tool: t,
		draft: [],
		measure: [],
		joinPending: t === "join" ? get().joinPending : null
	}),
	setActiveCode: (code) => set({ activeCode: code ? code.toUpperCase() : null }),
	moveShot: (uid, n, e, z) => set((s) => ({ shots: s.shots.map((sh) => sh.uid === uid ? {
		...sh,
		northing: n,
		easting: e,
		elevation: z ?? sh.elevation
	} : sh) })),
	recodeShot: (uid, code) => set((s) => {
		const next = code.trim().toUpperCase();
		if (!next) return {};
		return {
			shots: s.shots.map((sh) => {
				if (sh.uid !== uid) return sh;
				return relabel(sh, sh.remainder ? `${next} ${sh.remainder}` : next);
			}),
			activeCode: next
		};
	}),
	addShot: (v, code) => set((s) => {
		const alpha = (code || s.activeCode || "EP").toUpperCase();
		const nums = s.shots.map((sh) => Number(sh.point)).filter((n) => Number.isFinite(n));
		const pn = (nums.length ? Math.max(...nums) : 1e3) + 1;
		const shot = relabel({
			uid: `p${Date.now().toString(36)}${shotSeq++}`,
			rowIndex: s.shots.length,
			point: String(pn),
			northing: v.n,
			easting: v.e,
			elevation: v.z,
			description: alpha,
			issues: [],
			codeToken: alpha,
			remainder: "",
			matchId: lookupCode(alpha)?.id ?? null
		}, alpha);
		return {
			shots: [...s.shots, shot],
			selectedUid: shot.uid
		};
	}),
	setShotDesc: (uid, description) => set((s) => ({ shots: s.shots.map((sh) => sh.uid === uid ? relabel(sh, description) : sh) })),
	updateShot: (uid, patch) => set((s) => ({ shots: s.shots.map((sh) => {
		if (sh.uid !== uid) return sh;
		const next = {
			...sh,
			...patch
		};
		if (patch.description != null) return relabel(next, patch.description);
		return next;
	}) })),
	addDraft: (v) => set((s) => ({ draft: [...s.draft, v] })),
	undoDraft: () => set((s) => ({ draft: s.draft.slice(0, -1) })),
	commitDraft: () => set((s) => {
		if (s.draft.length < 2) return { draft: [] };
		const code = (s.activeCode || "EP").toUpperCase();
		const line = {
			id: nextLineId(),
			code,
			pts: s.draft,
			closed: s.tool === "shape",
			source: "extract"
		};
		return {
			userLines: [...s.userLines, line],
			draft: [],
			selectedLineId: line.id
		};
	}),
	cancelDraft: () => set({
		draft: [],
		measure: [],
		joinPending: null
	}),
	deleteSelected: () => set((s) => {
		if (s.selectedLineId && s.userLines.some((l) => l.id === s.selectedLineId)) return {
			userLines: s.userLines.filter((l) => l.id !== s.selectedLineId),
			selectedLineId: null
		};
		if (s.selectedUid) return {
			shots: s.shots.filter((sh) => sh.uid !== s.selectedUid),
			selectedUid: null
		};
		return {};
	}),
	setMeasure: (pts) => set({ measure: pts }),
	setCursor: (c) => set({ cursor: c }),
	isolate: (code) => set((s) => {
		if (!code || s.isolated === code.toUpperCase()) return {
			isolated: null,
			hiddenAlphas: {}
		};
		return { isolated: code.toUpperCase() };
	}),
	updateUserLine: (id, pts) => set((s) => ({ userLines: s.userLines.map((l) => l.id === id ? {
		...l,
		pts
	} : l) })),
	setLineClosed: (id, closed) => set((s) => ({ userLines: s.userLines.map((l) => l.id === id ? {
		...l,
		closed
	} : l) })),
	reverseUserLine: (id) => set((s) => ({ userLines: s.userLines.map((l) => l.id === id ? {
		...l,
		pts: [...l.pts].reverse()
	} : l) })),
	closeSurveyChain: (shotUids) => set((s) => {
		if (!shotUids.length) return {};
		const last = shotUids[shotUids.length - 1];
		return { shots: s.shots.map((sh) => {
			if (sh.uid !== last) return sh;
			if (/\bCLS\b|\bCLOSE\b/i.test(sh.remainder)) return sh;
			return relabel(sh, `${sh.codeToken} ${`${sh.remainder} CLS`.trim()}`);
		}) };
	}),
	setCrsId: (id) => set({ crsId: id }),
	setRightTab: (t) => set({
		rightTab: t,
		rightOpen: true
	}),
	setSurvey: (patch) => set((s) => ({ survey: {
		...s.survey,
		...patch
	} })),
	extractAll: () => {
		const s = get();
		const extra = extractAllLines(s.shots, s.remaps, s.userLines, "x");
		if (!extra.length) return 0;
		set({
			userLines: [...s.userLines, ...extra],
			rightTab: "linear",
			rightOpen: true
		});
		return extra.length;
	},
	extractChain: (chainId) => {
		const s = get();
		const line = extractChainById(s.shots, s.remaps, chainId, s.userLines, nextLineId());
		if (!line) return false;
		set({
			userLines: [...s.userLines, line],
			selectedLineId: line.id
		});
		return true;
	},
	joinLines: (aId, bId) => {
		const s = get();
		const a = s.userLines.find((l) => l.id === aId);
		const b = s.userLines.find((l) => l.id === bId);
		if (!a || !b || a.id === b.id) return false;
		const joined = joinUserLines(a, b, nextLineId());
		set({
			userLines: s.userLines.filter((l) => l.id !== aId && l.id !== bId).concat(joined),
			selectedLineId: joined.id,
			joinPending: null,
			cogo: {
				kind: "join",
				code: joined.code
			}
		});
		return true;
	},
	splitLineAt: (lineId, index) => {
		const s = get();
		const line = s.userLines.find((l) => l.id === lineId);
		if (!line) return false;
		const parts = splitUserLine(line, index, nextLineId(), nextLineId());
		if (!parts) return false;
		set({
			userLines: s.userLines.filter((l) => l.id !== lineId).concat(parts),
			selectedLineId: parts[0].id
		});
		return true;
	},
	offsetLine: (lineId, dist) => {
		const s = get();
		const line = s.userLines.find((l) => l.id === lineId);
		if (!line) return false;
		const d = dist ?? s.offsetFt;
		const off = offsetUserLine(line, d, nextLineId());
		set({
			userLines: [...s.userLines, off],
			selectedLineId: off.id,
			cogo: {
				kind: "offset",
				dist: d
			}
		});
		return true;
	},
	insertOnLine: (lineId, n, e, z) => {
		const s = get();
		const line = s.userLines.find((l) => l.id === lineId);
		if (!line) return false;
		const next = insertOnSegment(line.pts, n, e, z, 8);
		if (!next) return false;
		set({ userLines: s.userLines.map((l) => l.id === lineId ? {
			...l,
			pts: next.map((p) => ({
				n: p.n,
				e: p.e,
				z: p.z ?? z
			}))
		} : l) });
		return true;
	},
	setSurveyStringsOn: (v) => set({ surveyStringsOn: v }),
	setContoursOn: (v) => set({ contoursOn: v }),
	setContourInterval: (n) => set({ contourInterval: Math.max(.1, n) }),
	setOffsetFt: (n) => set({ offsetFt: n }),
	setCogo: (c) => set({ cogo: c }),
	setJoinPending: (id) => set({ joinPending: id }),
	locate: (n, e) => set((s) => ({ viewCmd: {
		nonce: (s.viewCmd?.nonce ?? 0) + 1,
		n,
		e
	} })),
	fitView: () => set((s) => ({ viewCmd: {
		nonce: (s.viewCmd?.nonce ?? 0) + 1,
		fit: true
	} }))
}), {
	name: "breakline-cad-v2",
	partialize: (s) => ({
		templateId: s.templateId,
		exportKind: s.exportKind,
		labelsOn: s.labelsOn,
		legendOn: s.legendOn,
		tableOn: s.tableOn,
		mapMode: s.mapMode,
		activeCode: s.activeCode,
		crsId: s.crsId,
		rightTab: s.rightTab,
		contoursOn: s.contoursOn,
		contourInterval: s.contourInterval,
		surveyStringsOn: s.surveyStringsOn,
		offsetFt: s.offsetFt
	})
}));
function templateOf(id) {
	return TEMPLATES.find((t) => t.id === id)?.tmpl ?? "{code} — {desc}";
}
function visibleShots(s) {
	return s.shots.filter((sh) => {
		const k = sh.codeToken.toUpperCase();
		if (s.isolated) return k === s.isolated;
		return !s.hiddenAlphas[k];
	});
}
//#endregion
export { templateOf as _, chainedShotIds as a, userLineToChain as b, formatStation as c, nearestVertexIndex as d, parseFieldbook as f, styleForCode as g, stationOffset as h, chainVertices as i, inverse as l, polylineLength as m, buildChains as n, detectFieldbookFormat as o, polygonArea as p, chainStyle as r, extractsAsShots as s, SHEET_LEGEND as t, markSvg as u, toCsv as v, visibleShots as x, useBook as y };
