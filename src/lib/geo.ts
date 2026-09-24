/** Survey grid → WGS84 for the aerial. Indiana InGCS plus OH, MI, IL, and KY state plane. */

import { findIngcsZone, ingcsById, INGCS_ZONES, type IngcsZone } from "./ingcs";
import { countyById, SP_ZONES, STATE_COUNTIES, zoneById, type SpZone } from "./states";

export const SR67_SITE = {
  name: "S.R. 67 & C.R. 400 S",
  county: "Delaware County, Indiana",
  crs: "Delaware County InGCS — NAD 1983 (2011)",
  des: "2501384",
  lat: 40.134923686336,
  lon: -85.440893725232,
  originN: 149050.822,
  originE: 775965.237,
  azimuthDeg: 35,
};

const FT_PER_DEG_LAT = 364609.7;
const FTUS = 1200 / 3937;
const D2R = Math.PI / 180;
const GRS80_A = 6378137;
const GRS80_E2 = 6.694380022900676e-3;
const INGCS_FE_FT = 240000 / FTUS;
const INGCS_FN_FT = 36000 / FTUS;

export type TmParams = {
  lat0: number;
  lon0: number;
  k0: number;
  fe: number;
  fn: number;
  units: "m" | "ftus";
};

export type LccParams = {
  lat0: number;
  lat1: number;
  lat2: number;
  lon0: number;
  fe: number;
  fn: number;
  units: "ftus";
};

const IN_EAST: TmParams = {
  lat0: 37.5 * D2R,
  lon0: (-85 - 2 / 3) * D2R,
  k0: 0.9999666666666667,
  fe: 328083.3333333333,
  fn: 820208.3333333333,
  units: "ftus",
};

const IN_WEST: TmParams = {
  lat0: 37.5 * D2R,
  lon0: (-87 - 5 / 60) * D2R,
  k0: 0.9999666666666667,
  fe: 2952750,
  fn: 820208.3333333333,
  units: "ftus",
};

const UTM16: TmParams = {
  lat0: 0,
  lon0: -87 * D2R,
  k0: 0.9996,
  fe: 500000,
  fn: 0,
  units: "m",
};

export function ingcsTm(zone: IngcsZone, units: "m" | "ftus" = "ftus"): TmParams {
  if (units === "m") {
    return { lat0: zone.lat0 * D2R, lon0: zone.lon0 * D2R, k0: zone.k0, fe: 240000, fn: 36000, units: "m" };
  }
  return {
    lat0: zone.lat0 * D2R,
    lon0: zone.lon0 * D2R,
    k0: zone.k0,
    fe: INGCS_FE_FT,
    fn: INGCS_FN_FT,
    units: "ftus",
  };
}

function meridianDist(phi: number): number {
  const e2 = GRS80_E2;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const a = GRS80_A;
  return (
    a *
    ((1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * phi -
      (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * phi) +
      (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * phi) -
      (35 * e6 / 3072) * Math.sin(6 * phi))
  );
}

export function tmInverse(easting: number, northing: number, p: TmParams): { lat: number; lon: number } {
  const E = p.units === "ftus" ? easting * FTUS : easting;
  const N = p.units === "ftus" ? northing * FTUS : northing;
  const FE = p.units === "ftus" ? p.fe * FTUS : p.fe;
  const FN = p.units === "ftus" ? p.fn * FTUS : p.fn;
  const a = GRS80_A;
  const e2 = GRS80_E2;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const M0 = meridianDist(p.lat0);
  const M = M0 + (N - FN) / p.k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256));
  const phi1 =
    mu +
    (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) +
    (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) +
    (151 * e1 ** 3 / 96) * Math.sin(6 * mu) +
    (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const sin1 = Math.sin(phi1);
  const cos1 = Math.cos(phi1);
  const tan1 = Math.tan(phi1);
  const e2p = e2 / (1 - e2);
  const C1 = e2p * cos1 * cos1;
  const T1 = tan1 * tan1;
  const N1 = a / Math.sqrt(1 - e2 * sin1 * sin1);
  const R1 = (a * (1 - e2)) / (1 - e2 * sin1 * sin1) ** 1.5;
  const D = (E - FE) / (N1 * p.k0);
  const lat =
    phi1 -
    ((N1 * tan1) / R1) *
      (D * D / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2p) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2p - 3 * C1 * C1) * D ** 6) / 720);
  const lon =
    p.lon0 +
    (D - ((1 + 2 * T1 + C1) * D ** 3) / 6 + ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2p + 24 * T1 * T1) * D ** 5) / 120) /
      cos1;
  return { lat: lat / D2R, lon: lon / D2R };
}

export function tmForward(latDeg: number, lonDeg: number, p: TmParams): { n: number; e: number } {
  const phi = latDeg * D2R;
  const lam = lonDeg * D2R;
  const a = GRS80_A;
  const e2 = GRS80_E2;
  const ep2 = e2 / (1 - e2);
  const sin = Math.sin(phi);
  const cos = Math.cos(phi);
  const tan = Math.tan(phi);
  const N = a / Math.sqrt(1 - e2 * sin * sin);
  const T = tan * tan;
  const C = ep2 * cos * cos;
  const A = (lam - p.lon0) * cos;
  const M = meridianDist(phi);
  const M0 = meridianDist(p.lat0);
  const x = p.k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120);
  const y =
    p.k0 *
    (M -
      M0 +
      N *
        tan *
        (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 + ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720));
  const eM = x + (p.units === "ftus" ? p.fe * FTUS : p.fe);
  const nM = y + (p.units === "ftus" ? p.fn * FTUS : p.fn);
  if (p.units === "ftus") return { e: eM / FTUS, n: nM / FTUS };
  return { e: eM, n: nM };
}

function lccParts(p: LccParams) {
  const e = Math.sqrt(GRS80_E2);
  const m = (phi: number) => Math.cos(phi) / Math.sqrt(1 - GRS80_E2 * Math.sin(phi) ** 2);
  const tOf = (phi: number) => {
    const s = Math.sin(phi);
    return Math.tan(Math.PI / 4 - phi / 2) / ((1 - e * s) / (1 + e * s)) ** (e / 2);
  };
  const m1 = m(p.lat1);
  const t1 = tOf(p.lat1);
  const n = Math.log(m(p.lat1) / m(p.lat2)) / Math.log(t1 / tOf(p.lat2));
  const F = m1 / (n * t1 ** n);
  const rho0 = GRS80_A * F * tOf(p.lat0) ** n;
  return { e, n, F, rho0, tOf };
}

export function lccInverse(easting: number, northing: number, p: LccParams): { lat: number; lon: number } {
  const { e, n, F, rho0 } = lccParts(p);
  const E = (easting - p.fe) * FTUS;
  const N = (northing - p.fn) * FTUS;
  const sign = n >= 0 ? 1 : -1;
  const rho = sign * Math.hypot(E, rho0 - N);
  const theta = Math.atan2(E, rho0 - N);
  const t = (rho / (GRS80_A * F)) ** (1 / n);
  let phi = Math.PI / 2 - 2 * Math.atan(t);
  for (let i = 0; i < 8; i++) {
    const s = Math.sin(phi);
    phi = Math.PI / 2 - 2 * Math.atan(t * ((1 - e * s) / (1 + e * s)) ** (e / 2));
  }
  return { lat: phi / D2R, lon: (theta / n + p.lon0) / D2R };
}

export function lccForward(latDeg: number, lonDeg: number, p: LccParams): { n: number; e: number } {
  const { n, F, rho0, tOf } = lccParts(p);
  const rho = GRS80_A * F * tOf(latDeg * D2R) ** n;
  const theta = n * (lonDeg * D2R - p.lon0);
  return { e: (rho * Math.sin(theta)) / FTUS + p.fe, n: (rho0 - rho * Math.cos(theta)) / FTUS + p.fn };
}

function lccOf(zone: SpZone): LccParams {
  return {
    lat0: zone.lat0 * D2R,
    lat1: (zone.lat1 ?? zone.lat0) * D2R,
    lat2: (zone.lat2 ?? zone.lat0) * D2R,
    lon0: zone.lon0 * D2R,
    fe: zone.fe,
    fn: zone.fn,
    units: "ftus",
  };
}

function tmOfZone(zone: SpZone): TmParams {
  return {
    lat0: zone.lat0 * D2R,
    lon0: zone.lon0 * D2R,
    k0: zone.k0 ?? 1,
    fe: zone.fe,
    fn: zone.fn,
    units: "ftus",
  };
}

export type GridKind = "ingcs" | "sp-east" | "sp-west" | "utm16" | "sp" | "geo" | "local";

export type GeoOrigin = {
  lat: number;
  lon: number;
  originN: number;
  originE: number;
  crs: string;
  id: string;
  kind: GridKind;
  tm?: TmParams;
  lcc?: LccParams;
};

export type CrsHint = {
  crsId?: string;
  county?: string;
  crs?: string;
  fileName?: string;
};

export type KeyinPoint = {
  n: number;
  e: number;
  z: number;
  code?: string;
  point?: string;
  geographic: boolean;
};

function avgNE(shots: { northing: number; easting: number }[]): { n: number; e: number } {
  let n = 0;
  let e = 0;
  const step = Math.max(1, Math.floor(shots.length / 400));
  let c = 0;
  for (let i = 0; i < shots.length; i += step) {
    n += shots[i].northing;
    e += shots[i].easting;
    c += 1;
  }
  return { n: n / c, e: e / c };
}

function inIndiana(lat: number, lon: number): boolean {
  return lat > 37.7 && lat < 41.85 && lon > -88.2 && lon < -84.7;
}

function originFromTm(n: number, e: number, tm: TmParams, id: string, crs: string, kind: GridKind): GeoOrigin {
  const ll = tmInverse(e, n, tm);
  return { lat: ll.lat, lon: ll.lon, originN: n, originE: e, crs, id, kind, tm };
}

function scoreIngcs(z: IngcsZone, avgN: number, avgE: number, units: "m" | "ftus"): number {
  const ll = tmInverse(avgE, avgN, ingcsTm(z, units));
  if (!inIndiana(ll.lat, ll.lon)) return Infinity;
  return Math.abs(ll.lon - z.lon0) * 1.4 + Math.abs(ll.lat - z.lat0);
}

function pickIngcs(avgN: number, avgE: number, hint?: string, units: "m" | "ftus" = "ftus"): IngcsZone {
  let best = INGCS_ZONES.find((z) => z.id === "delaware") ?? INGCS_ZONES[0];
  let bestScore = scoreIngcs(best, avgN, avgE, units);
  for (const z of INGCS_ZONES) {
    const score = scoreIngcs(z, avgN, avgE, units);
    if (score < bestScore - 0.02) {
      bestScore = score;
      best = z;
    }
  }
  const named = findIngcsZone(hint);
  if (named) {
    const namedScore = scoreIngcs(named, avgN, avgE, units);
    if (Number.isFinite(namedScore) && namedScore <= bestScore + 0.02) return named;
  }
  return best;
}

function looksIngcs(n: number, e: number): boolean {
  return n > 40_000 && n < 650_000 && e > 520_000 && e < 1_050_000;
}

function looksIngcsM(n: number, e: number): boolean {
  return n > 15_000 && n < 220_000 && e > 180_000 && e < 320_000;
}

function looksUtm(n: number, e: number): boolean {
  return n > 3_000_000 && e > 160_000 && e < 900_000;
}

function ingcsOrigin(z: IngcsZone, avgN: number, avgE: number, units: "m" | "ftus"): GeoOrigin {
  const unitTag = units === "m" ? " (m)" : "";
  return originFromTm(avgN, avgE, ingcsTm(z, units), `ingcs:${z.id}`, `${z.name} County InGCS — NAD 1983 (2011)${unitTag}`, "ingcs");
}

function inZone(zone: SpZone, lat: number, lon: number): boolean {
  return lat >= zone.latMin && lat <= zone.latMax && lon >= zone.lonMin && lon <= zone.lonMax;
}

function originFromSp(zone: SpZone, n: number, e: number, countyName?: string): GeoOrigin {
  const crs = countyName ? `${countyName} County, ${zone.state} — ${zone.label} (ftUS)` : `${zone.label} — NAD83 (ftUS)`;
  const id = `sp:${zone.id}`;
  if (zone.kind === "lcc") {
    const lcc = lccOf(zone);
    const ll = lccInverse(e, n, lcc);
    return { lat: ll.lat, lon: ll.lon, originN: n, originE: e, crs, id, kind: "sp", lcc };
  }
  const tm = tmOfZone(zone);
  const ll = tmInverse(e, n, tm);
  return { lat: ll.lat, lon: ll.lon, originN: n, originE: e, crs, id, kind: "sp", tm };
}

function pickStatePlane(n: number, e: number): GeoOrigin | null {
  let bestScore = Infinity;
  let best: GeoOrigin | null = null;
  const keep = (lat: number, lon: number, midLat: number, midLon: number, origin: GeoOrigin) => {
    if (!Number.isFinite(lat) || Math.abs(lat) > 60 || Math.abs(lon) > 140) return;
    const score = Math.hypot(lat - midLat, lon - midLon);
    if (score < bestScore) {
      bestScore = score;
      best = origin;
    }
  };
  for (const zone of SP_ZONES) {
    const origin = originFromSp(zone, n, e);
    if (!inZone(zone, origin.lat, origin.lon)) continue;
    keep(origin.lat, origin.lon, (zone.latMin + zone.latMax) / 2, (zone.lonMin + zone.lonMax) / 2, origin);
  }
  const indiana: { tm: TmParams; id: string; crs: string; kind: GridKind; latMin: number; latMax: number; lonMin: number; lonMax: number }[] = [
    { tm: IN_EAST, id: "sp-east", crs: "NAD83 Indiana East (ftUS)", kind: "sp-east", latMin: 37.7, latMax: 41.85, lonMin: -86.55, lonMax: -84.7 },
    { tm: IN_WEST, id: "sp-west", crs: "NAD83 Indiana West (ftUS)", kind: "sp-west", latMin: 37.7, latMax: 41.85, lonMin: -88.2, lonMax: -86.2 },
  ];
  for (const z of indiana) {
    const origin = originFromTm(n, e, z.tm, z.id, z.crs, z.kind);
    if (origin.lat < z.latMin || origin.lat > z.latMax || origin.lon < z.lonMin || origin.lon > z.lonMax) continue;
    keep(origin.lat, origin.lon, (z.latMin + z.latMax) / 2, (z.lonMin + z.lonMax) / 2, origin);
  }
  return best;
}

function fromId(id: string, avgN: number, avgE: number): GeoOrigin | null {
  if (id === "auto" || !id) return null;
  if (id === "geo") return { lat: avgN, lon: avgE, originN: avgN, originE: avgE, crs: "Geographic NAD83", id: "geo", kind: "geo" };
  if (id === "sp-east") return originFromTm(avgN, avgE, IN_EAST, "sp-east", "NAD83 Indiana East (ftUS)", "sp-east");
  if (id === "sp-west") return originFromTm(avgN, avgE, IN_WEST, "sp-west", "NAD83 Indiana West (ftUS)", "sp-west");
  if (id === "utm16") return originFromTm(avgN, avgE, UTM16, "utm16", "NAD83 UTM 16N (m)", "utm16");
  const county = countyById(id);
  const zone = zoneById(id) ?? (county ? zoneById(county.zone) : undefined);
  if (zone) return { ...originFromSp(zone, avgN, avgE, county?.name), id: county?.id ?? `sp:${zone.id}` };
  if (id.startsWith("ingcs:") || findIngcsZone(id)) {
    const z = ingcsById(id) ?? findIngcsZone(id);
    if (z) return ingcsOrigin(z, avgN, avgE, looksIngcsM(avgN, avgE) && !looksIngcs(avgN, avgE) ? "m" : "ftus");
  }
  return null;
}

export function detectGeoOrigin(shots: { northing: number; easting: number }[], hint: CrsHint = {}): GeoOrigin {
  const delaware = INGCS_ZONES.find((z) => z.id === "delaware")!;
  const fallback: GeoOrigin = {
    lat: SR67_SITE.lat,
    lon: SR67_SITE.lon,
    originN: SR67_SITE.originN,
    originE: SR67_SITE.originE,
    crs: SR67_SITE.crs,
    id: "ingcs:delaware",
    kind: "ingcs",
    tm: ingcsTm(delaware),
  };

  if (!shots.length) {
    const named =
      (hint.crsId && hint.crsId !== "auto" ? ingcsById(hint.crsId) ?? findIngcsZone(hint.crsId) ?? zoneById(hint.crsId) : undefined) ??
      findIngcsZone(hint.county) ??
      findIngcsZone(hint.crs) ??
      zoneById(hint.county ?? "") ??
      SP_ZONES.find((z) => hint.county && z.state.toLowerCase() === hint.county.toLowerCase()) ??
      SP_ZONES.find((z) => hint.crs && hint.crs.toLowerCase().includes(z.state.toLowerCase()));
    if (named && "lat0" in named && "k0" in named && !("kind" in named)) {
      const z = named as IngcsZone;
      return { lat: z.lat0, lon: z.lon0, originN: 0, originE: 0, crs: `${z.name} County InGCS — NAD 1983 (2011)`, id: `ingcs:${z.id}`, kind: "ingcs", tm: ingcsTm(z) };
    }
    if (named && "kind" in named) {
      const z = named as SpZone;
      const blank = originFromSp(z, z.fe, z.fn);
      return { ...blank, lat: (z.latMin + z.latMax) / 2, lon: (z.lonMin + z.lonMax) / 2 };
    }
    const forced = fromId(hint.crsId ?? "", fallback.originN, fallback.originE);
    return forced ?? fallback;
  }

  const n0 = shots[0].northing;
  const e0 = shots[0].easting;
  const { n: avgN, e: avgE } = avgNE(shots);

  if (hint.crsId && hint.crsId !== "auto") {
    const forced = fromId(hint.crsId, avgN, avgE);
    if (forced) return forced;
  }

  if (Math.abs(n0) <= 90 && Math.abs(e0) <= 180 && shots.length < 5) {
    return { lat: n0, lon: e0, originN: n0, originE: e0, crs: "Geographic NAD83", id: "geo", kind: "geo" };
  }

  const fileZone = findIngcsZone(hint.fileName);
  if (!fileZone && Math.hypot(avgN - SR67_SITE.originN, avgE - SR67_SITE.originE) < 25_000 && looksIngcs(avgN, avgE)) {
    return ingcsOrigin(delaware, avgN, avgE, "ftus");
  }

  const hintText = [fileZone ? "" : hint.county, fileZone ? "" : hint.crs, fileZone?.name].filter(Boolean).join(" ");

  if (looksIngcs(avgN, avgE) || (looksIngcsM(avgN, avgE) && !looksIngcs(avgN, avgE))) {
    const units = looksIngcs(avgN, avgE) ? "ftus" : "m";
    const z = pickIngcs(avgN, avgE, hintText, units);
    const score = scoreIngcs(z, avgN, avgE, units);
    if (score < 0.55) return ingcsOrigin(z, avgN, avgE, units);
  }

  if (looksUtm(avgN, avgE)) {
    const utm = originFromTm(avgN, avgE, UTM16, "utm16", "NAD83 UTM 16N (m)", "utm16");
    if (utm.lat > 36 && utm.lat < 49 && utm.lon > -92 && utm.lon < -80) return utm;
  }

  const sp = pickStatePlane(avgN, avgE);
  if (sp) return sp;

  if (looksIngcs(avgN, avgE)) {
    const z = pickIngcs(avgN, avgE, hintText, "ftus");
    const trial = ingcsOrigin(z, avgN, avgE, "ftus");
    if (inIndiana(trial.lat, trial.lon)) return trial;
  }

  return { lat: SR67_SITE.lat, lon: SR67_SITE.lon, originN: avgN, originE: avgE, crs: "Local grid (ft)", id: "local", kind: "local" };
}

export function toLatLon(northing: number, easting: number, origin: GeoOrigin): { lat: number; lon: number } {
  if (origin.kind === "geo") return { lat: northing, lon: easting };
  if (origin.lcc) return lccInverse(easting, northing, origin.lcc);
  if (origin.tm) return tmInverse(easting, northing, origin.tm);
  const dN = northing - origin.originN;
  const dE = easting - origin.originE;
  const lat = origin.lat + dN / FT_PER_DEG_LAT;
  const lon = origin.lon + dE / (FT_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180));
  return { lat, lon };
}

export function fromLatLon(lat: number, lon: number, origin: GeoOrigin): { n: number; e: number } {
  if (origin.kind === "geo") return { n: lat, e: lon };
  if (origin.lcc) return lccForward(lat, lon, origin.lcc);
  if (origin.tm) return tmForward(lat, lon, origin.tm);
  const dN = (lat - origin.lat) * FT_PER_DEG_LAT;
  const dE = (lon - origin.lon) * FT_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180);
  return { n: origin.originN + dN, e: origin.originE + dE };
}

export function gridUnit(origin: GeoOrigin): string {
  if (origin.kind === "geo") return "°";
  if (origin.tm?.units === "m") return "m";
  return "ft";
}

export function dist2d(
  a: { n?: number; e?: number; northing?: number; easting?: number },
  b: { n?: number; e?: number; northing?: number; easting?: number },
): number {
  const an = a.northing ?? a.n ?? 0;
  const ae = a.easting ?? a.e ?? 0;
  const bn = b.northing ?? b.n ?? 0;
  const be = b.easting ?? b.e ?? 0;
  return Math.hypot(an - bn, ae - be);
}

export function projectOffset(n0: number, e0: number, along: number, offset: number, azimuthDeg: number): { n: number; e: number } {
  const az = (azimuthDeg * Math.PI) / 180;
  const c = Math.cos(az);
  const s = Math.sin(az);
  return { n: n0 + along * c - offset * s, e: e0 + along * s + offset * c };
}

export function toLocal(n: number, e: number, n0: number, e0: number, azimuthDeg: number): { along: number; offset: number } {
  const az = (azimuthDeg * Math.PI) / 180;
  const c = Math.cos(az);
  const s = Math.sin(az);
  const dn = n - n0;
  const de = e - e0;
  return { along: dn * c + de * s, offset: -dn * s + de * c };
}

export function corridorAzimuth(): number {
  return SR67_SITE.azimuthDeg;
}

export function formatLatLon(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(8)}° ${ns}  ${Math.abs(lon).toFixed(8)}° ${ew}`;
}

export function parseCoordinateKeyin(text: string, order: "PNEZD" | "PENZD" = "PNEZD"): KeyinPoint | null {
  const parts = text
    .trim()
    .split(/[,;\t ]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const nums: number[] = [];
  const words: string[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (Number.isFinite(n) && /^-?\d/.test(p)) nums.push(n);
    else words.push(p);
  }
  if (nums.length < 2) return null;
  const code = words.join(" ") || undefined;
  if (nums.length === 2 && Math.abs(nums[0]) <= 90 && Math.abs(nums[1]) <= 180) {
    return { n: nums[0], e: nums[1], z: 0, code, geographic: true };
  }
  if (nums.length >= 4) {
    if (order === "PENZD") return { point: String(nums[0]), e: nums[1], n: nums[2], z: nums[3], code, geographic: false };
    return { point: String(nums[0]), n: nums[1], e: nums[2], z: nums[3], code, geographic: false };
  }
  if (order === "PENZD") return { e: nums[0], n: nums[1], z: nums[2] ?? 0, code, geographic: false };
  return { n: nums[0], e: nums[1], z: nums[2] ?? 0, code, geographic: false };
}

export const CRS_GROUPS: { label: string; options: { id: string; label: string }[] }[] = [
  { label: "Auto", options: [{ id: "auto", label: "Auto (from coordinates)" }] },
  {
    label: "Indiana — State Plane",
    options: [
      { id: "sp-east", label: "Indiana East (ftUS)" },
      { id: "sp-west", label: "Indiana West (ftUS)" },
      { id: "utm16", label: "NAD83 UTM 16N (metres)" },
      { id: "geo", label: "Geographic NAD83 (lat / lon)" },
    ],
  },
  {
    label: "Indiana — InGCS county",
    options: INGCS_ZONES.map((z) => ({ id: `ingcs:${z.id}`, label: `${z.name} County` })),
  },
  ...["Ohio", "Michigan", "Illinois", "Kentucky"].map((state) => ({
    label: state,
    options: [
      ...SP_ZONES.filter((z) => z.state === state).map((z) => ({ id: `sp:${z.id}`, label: `${z.label} (ftUS)` })),
      ...STATE_COUNTIES.filter((c) => c.state === state).map((c) => ({ id: c.id, label: `${c.name} County` })),
    ],
  })),
];

export const CRS_OPTIONS: { id: string; label: string }[] = CRS_GROUPS.flatMap((g) => g.options);
