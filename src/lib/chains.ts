import { type Feature } from "./catalog";
import { dist2d } from "./geo";
import { resolveFeature } from "./label";
import type { LabeledShot } from "./label";
import { styleForCode, type LineStyle } from "./symbology";
import { parseField } from "./fieldcode";

export type Vertex = {
  n: number;
  e: number;
  z: number;
  uid?: string;
};

export type UserLine = {
  id: string;
  code: string;
  pts: Vertex[];
  closed: boolean;
  source: "extract";
};

export type Chain = {
  id: string;
  code: string;
  feature?: Feature;
  shots: LabeledShot[];
  closed: boolean;
  source: "survey" | "extract";
  pts?: Vertex[];
};

const POINT_ATTR = new Set(["Point"]);

function tokensOf(rem: string): string[] {
  return rem
    .toUpperCase()
    .split(/\s+/)
    .map((t) => t.replace(/[.,;:]+$/g, ""))
    .filter(Boolean);
}

const START_SET = new Set(["ST", "START", "STRT", "PC", "SC", "B", "BGN", "BEGIN"]);
const END_SET = new Set(["END", "PT", "EC", "E"]);
const CLOSE_SET = new Set(["CLS", "CLOSE"]);
const JOIN_SET = new Set(["J", "JOIN", "JPT", "OC"]);

function isPointCode(shot: LabeledShot, feature: Feature | undefined): boolean {
  const alpha = shot.codeToken.toUpperCase();
  if (alpha.startsWith("P") && alpha.length >= 3) {
    if (feature?.attr === "Break Line") return false;
    return true;
  }
  if (!feature) return false;
  if (POINT_ATTR.has(feature.attr)) return true;
  return false;
}

function heading(a: LabeledShot, b: LabeledShot): number {
  return Math.atan2(b.easting - a.easting, b.northing - a.northing);
}

function turnDeg(a: LabeledShot, b: LabeledShot, c: LabeledShot): number {
  const h1 = heading(a, b);
  const h2 = heading(b, c);
  let d = Math.abs(h1 - h2) * (180 / Math.PI);
  if (d > 180) d = 360 - d;
  return d;
}

const GAP_FT = 120;
const REVERSE_DEG = 135;
const REVERSE_MIN_FT = 14;

function shouldBreak(chain: LabeledShot[], next: LabeledShot): boolean {
  if (!chain.length) return false;
  const last = chain[chain.length - 1];
  const d = dist2d(last, next);
  if (d > GAP_FT) return true;
  if (chain.length >= 2 && d > 6) {
    const prev = chain[chain.length - 2];
    const fe = last.easting - prev.easting;
    const fn = last.northing - prev.northing;
    const flen = Math.hypot(fe, fn) || 1;
    const de = next.easting - last.easting;
    const dn = next.northing - last.northing;
    const along = (de * fe + dn * fn) / flen;
    const cross = Math.abs(de * fn - dn * fe) / flen;
    // Next shot is the other edge or a cross-section, not the next point down the line.
    if (cross > 8 && along < Math.max(4, cross * 0.45)) return true;
    if (d > REVERSE_MIN_FT && turnDeg(prev, last, next) > REVERSE_DEG) return true;
  }
  return false;
}

function finish(
  run: LabeledShot[],
  code: string,
  closed: boolean,
  remaps: Record<string, string>,
  seq: { n: number },
  out: Chain[],
) {
  if (run.length < 2) return;
  const feature = resolveFeature({ ...run[0], codeToken: code }, remaps);
  out.push({
    id: `c${seq.n++}-${code}`,
    code,
    feature,
    shots: run.slice(),
    closed,
    source: "survey",
  });
}

/**
 * Field-to-finish: each alpha code keeps an active string.
 * Point features (PHYD, PPOL, …) do not break linear strings.
 * ST starts a new string; END/CLS close; reverse/gap splits opposite edges.
 */
export function buildChains(shots: LabeledShot[], remaps: Record<string, string>): Chain[] {
  const chains: Chain[] = [];
  const active = new Map<string, { run: LabeledShot[]; closed: boolean }[]>();
  const seq = { n: 0 };

  const closeCode = (code: string, closed = false) => {
    const runs = active.get(code);
    if (!runs) return;
    for (const cur of runs) finish(cur.run, code, closed || cur.closed, remaps, seq, chains);
    active.delete(code);
  };

  const nearestEnd = (code: string, shot: LabeledShot): { run: LabeledShot[]; atStart: boolean } | null => {
    let best: { run: LabeledShot[]; atStart: boolean; d: number } | null = null;
    const consider = (run: LabeledShot[]) => {
      if (run.length < 1) return;
      const d0 = dist2d(run[0], shot);
      const d1 = dist2d(run[run.length - 1], shot);
      const atStart = d0 < d1;
      const d = Math.min(d0, d1);
      if (d < 60 && (!best || d < best.d)) best = { run, atStart, d };
    };
    for (const cur of active.get(code) ?? []) consider(cur.run);
    for (const ch of chains) {
      if (ch.code === code) consider(ch.shots);
    }
    return best;
  };

  for (const shot of shots) {
    const field = parseField(shot.description);
    const parts = field.codes.length
      ? field.codes
      : shot.codeToken
        ? [{ code: shot.codeToken.toUpperCase(), flags: tokensOf(shot.remainder) }]
        : [];
    for (const part of parts) {
      const code = part.code.toUpperCase();
      if (!code) continue;
      const feature = resolveFeature({ ...shot, codeToken: code }, remaps);
      if (isPointCode({ ...shot, codeToken: code }, feature)) continue;
      const flags = part.flags.map((f) => f.toUpperCase());
      const isStart = flags.some((f) => START_SET.has(f));
      const isEnd = flags.some((f) => END_SET.has(f));
      const isClose = flags.some((f) => CLOSE_SET.has(f));
      const isJoin = flags.some((f) => JOIN_SET.has(f));

      if (isJoin) {
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
        active.set(code, [{ run: [shot], closed: false }]);
        if (isEnd || isClose) closeCode(code, isClose);
        continue;
      }

      const runs = active.get(code) ?? [];
      let placed = false;
      for (const cur of runs) {
        if (cur.run.length !== 2) continue;
        const [a, b] = cur.run;
        const dA = dist2d(a, shot);
        const dB = dist2d(b, shot);
        const fe = shot.easting - a.easting;
        const fn = shot.northing - a.northing;
        const flen = Math.hypot(fe, fn) || 1;
        const cross = Math.abs((b.easting - a.easting) * fn - (b.northing - a.northing) * fe) / flen;
        if (dA < GAP_FT && cross > 8 && dA + 1 < dB) {
          cur.run.pop();
          runs.push({ run: [b], closed: false });
          cur.run.push(shot);
          placed = true;
          break;
        }
      }
      if (!placed) {
        let best: { run: LabeledShot[]; closed: boolean } | null = null;
        let bestD = Infinity;
        for (const cur of runs) {
          if (shouldBreak(cur.run, shot)) continue;
          const d = dist2d(cur.run[cur.run.length - 1], shot);
          if (d < bestD) {
            bestD = d;
            best = cur;
          }
        }
        if (best) best.run.push(shot);
        else {
          runs.push({ run: [shot], closed: false });
          active.set(code, runs);
        }
      }
      if (!active.has(code)) active.set(code, runs);

      if (isEnd) closeCode(code, false);
      else if (isClose) closeCode(code, true);
    }
  }

  for (const code of [...active.keys()]) closeCode(code);

  return chains;
}

export function chainedShotIds(chains: Chain[]): Set<string> {
  const ids = new Set<string>();
  for (const c of chains) {
    if (c.shots.length < 2 && !(c.pts && c.pts.length >= 2)) continue;
    for (const s of c.shots) ids.add(s.uid);
  }
  return ids;
}

export function userLineToChain(line: UserLine, remaps: Record<string, string>): Chain {
  const fakeShots: LabeledShot[] = line.pts.map((p, i) => ({
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
    matchId: null,
  }));
  return {
    id: line.id,
    code: line.code.toUpperCase(),
    feature: resolveFeature(fakeShots[0], remaps),
    shots: fakeShots,
    closed: line.closed,
    source: "extract",
    pts: line.pts,
  };
}

export function chainStyle(chain: Chain): LineStyle {
  return styleForCode(chain.code, chain.feature?.cat);
}

export function chainVertices(chain: Chain): Vertex[] {
  if (chain.pts?.length) return chain.pts;
  return chain.shots.map((s) => ({
    n: s.northing,
    e: s.easting,
    z: s.elevation,
    uid: s.uid,
  }));
}

export function extractsAsShots(lines: UserLine[], start = 90000): LabeledShot[] {
  const out: LabeledShot[] = [];
  let n = start;
  for (const line of lines) {
    line.pts.forEach((p, i) => {
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
        matchId: null,
      });
      n += 1;
    });
  }
  return out;
}
