import { buildChains, type UserLine } from "./chains";
import { dist2d } from "./geo";
import { resolveFeature, type LabeledShot } from "./label";
import { lookupCode } from "./catalog";

export type QaSeverity = "error" | "warn" | "info";

export type QaIssue = {
  id: string;
  check: string;
  severity: QaSeverity;
  title: string;
  detail: string;
  shotUids: string[];
  lineId?: string;
  alpha?: string;
};

export type QaReport = {
  issues: QaIssue[];
  errors: number;
  warns: number;
  infos: number;
};

const DUP_FT = 0.05;
const SHORT_FT = 0.3;
const LONG_FT = 200;
const SPIKE_FT = 8;

function isLinear(shot: LabeledShot, remaps: Record<string, string>): boolean {
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

function segsIntersect(
  a: { n: number; e: number },
  b: { n: number; e: number },
  c: { n: number; e: number },
  d: { n: number; e: number },
): boolean {
  const den = (b.n - a.n) * (d.e - c.e) - (b.e - a.e) * (d.n - c.n);
  if (Math.abs(den) < 1e-9) return false;
  const t = ((c.n - a.n) * (d.e - c.e) - (c.e - a.e) * (d.n - c.n)) / den;
  const u = ((c.n - a.n) * (b.e - a.e) - (c.e - a.e) * (b.n - a.n)) / den;
  return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
}

export function runQa(
  shots: LabeledShot[],
  remaps: Record<string, string>,
  userLines: UserLine[],
  skipped = 0,
): QaReport {
  const issues: QaIssue[] = [];
  const push = (issue: Omit<QaIssue, "id">) => {
    if (issues.length >= 60) return;
    issues.push({ ...issue, id: `q${issues.length + 1}` });
  };

  const unmatched = new Map<string, LabeledShot[]>();
  const byPn = new Map<string, LabeledShot[]>();
  const byCode = new Map<string, LabeledShot[]>();
  let blank = 0;
  const blankUids: string[] = [];
  const parseUids: string[] = [];

  for (const s of shots) {
    const f = resolveFeature(s, remaps);
    if (!f) {
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

  for (const [code, list] of unmatched) {
    push({
      check: "unmatched",
      severity: "error",
      title: `Unmatched code ${code}`,
      detail: `${list.length} shot${list.length === 1 ? "" : "s"} not mapped to an INDOT feature definition.`,
      shotUids: list.map((s) => s.uid),
      alpha: code,
    });
  }

  for (const [pn, list] of byPn) {
    if (list.length > 1) {
      push({
        check: "dup-pn",
        severity: "error",
        title: `Duplicate point ${pn}`,
        detail: `${list.length} shots share point number ${pn}.`,
        shotUids: list.map((s) => s.uid),
      });
    }
  }

  if (blank) {
    push({
      check: "blank",
      severity: "error",
      title: "Blank description",
      detail: `${blank} shot${blank === 1 ? "" : "s"} have no feature code.`,
      shotUids: blankUids,
    });
  }

  if (parseUids.length) {
    push({
      check: "parse",
      severity: "error",
      title: "Parse issues",
      detail: `${parseUids.length} row${parseUids.length === 1 ? "" : "s"} loaded with coordinate or field warnings.`,
      shotUids: parseUids,
    });
  }

  const DUP_CELL = 2;
  const dupGrid = new Map<string, LabeledShot[]>();
  let dupCount = 0;
  const dupUids: string[] = [];
  for (const s of shots) {
    const ix = Math.floor(s.easting / DUP_CELL);
    const iy = Math.floor(s.northing / DUP_CELL);
    let matched = false;
    for (let dx = -1; dx <= 1 && !matched; dx++) {
      for (let dy = -1; dy <= 1 && !matched; dy++) {
        const bucket = dupGrid.get(`${ix + dx}:${iy + dy}`);
        if (!bucket) continue;
        for (const o of bucket) {
          if (dist2d(s, o) <= DUP_FT && Math.abs(s.elevation - o.elevation) <= 0.05) {
            dupCount += 1;
            if (dupUids.length < 8) dupUids.push(s.uid, o.uid);
            matched = true;
            break;
          }
        }
      }
    }
    const key = `${ix}:${iy}`;
    const list = dupGrid.get(key);
    if (list) list.push(s);
    else dupGrid.set(key, [s]);
  }
  if (dupCount) {
    push({
      check: "dup-xy",
      severity: "warn",
      title: dupCount === 1 ? "Coincident shots" : `${dupCount} coincident shots`,
      detail: `Shots sit within ${DUP_FT} ft horizontally.`,
      shotUids: dupUids,
    });
  }

  for (const s of shots) {
    if (s.elevation === 0) {
      push({
        check: "zero-z",
        severity: "warn",
        title: `Zero elevation pt ${s.point}`,
        detail: "Elevation is 0.00 — confirm the rod height and geoid.",
        shotUids: [s.uid],
        alpha: s.codeToken.toUpperCase(),
      });
    }
  }

  for (const [code, list] of byCode) {
    if (list.length < 3) continue;
    for (let i = 1; i < list.length - 1; i++) {
      const prev = list[i - 1];
      const cur = list[i];
      const next = list[i + 1];
      const mid = (prev.elevation + next.elevation) / 2;
      if (Math.abs(cur.elevation - mid) > SPIKE_FT) {
        push({
          check: "spike",
          severity: "warn",
          title: `Elevation spike pt ${cur.point}`,
          detail: `${code} jumps ${Math.abs(cur.elevation - mid).toFixed(2)} ft from neighbors.`,
          shotUids: [prev.uid, cur.uid, next.uid],
          alpha: code,
        });
      }
    }
  }

  const chains = buildChains(shots, remaps);
  const linearCodes = new Set<string>();
  for (const s of shots) {
    if (isLinear(s, remaps)) linearCodes.add(s.codeToken.toUpperCase());
  }
  for (const code of linearCodes) {
    const list = byCode.get(code) ?? [];
    if (list.length === 1) {
      const f = resolveFeature(list[0], remaps);
      const attr = f?.attr ?? "";
      if (attr === "Break Line" || attr === "Spot And Break" || !f) {
        push({
          check: "isolated",
          severity: "warn",
          title: `Isolated ${code} pt ${list[0].point}`,
          detail: "Linear / breakline code with a single shot — string will not form.",
          shotUids: [list[0].uid],
          alpha: code,
        });
      }
    }
  }

  for (const chain of chains) {
    const last = chain.shots[chain.shots.length - 1];
    const first = chain.shots[0];
    const firstTok = (first?.remainder || "").toUpperCase();
    const lastTok = (last?.remainder || "").toUpperCase();
    const started = /\bST\b|\bSTART\b/.test(firstTok);
    const ended = /\bEND\b|\bCLS\b|\bCLOSE\b/.test(lastTok);
    if (started && !ended && !chain.closed) {
      push({
        check: "open-st",
        severity: "warn",
        title: `Open ${chain.code} string`,
        detail: `Started at pt ${first.point} with no END / CLS.`,
        shotUids: chain.shots.map((s) => s.uid),
        lineId: chain.id,
        alpha: chain.code,
      });
    }
    for (let i = 1; i < chain.shots.length; i++) {
      const a = chain.shots[i - 1];
      const b = chain.shots[i];
      const d = dist2d(a, b);
      if (d < SHORT_FT) {
        push({
          check: "short",
          severity: "warn",
          title: `Short ${chain.code} segment`,
          detail: `${d.toFixed(2)} ft between ${a.point} and ${b.point}.`,
          shotUids: [a.uid, b.uid],
          lineId: chain.id,
          alpha: chain.code,
        });
      } else if (d > LONG_FT) {
        push({
          check: "long",
          severity: "warn",
          title: `Long ${chain.code} segment`,
          detail: `${d.toFixed(1)} ft between ${a.point} and ${b.point} — likely a missed break.`,
          shotUids: [a.uid, b.uid],
          lineId: chain.id,
          alpha: chain.code,
        });
      }
    }
  }

  const segCount = chains.reduce((n, c) => n + Math.max(0, c.shots.length - 1), 0);
  if (chains.length <= 120 && segCount <= 4000) {
  for (let i = 0; i < chains.length; i++) {
    const a = chains[i];
    if (a.shots.length < 2) continue;
    const ha = Math.atan2(
      a.shots[a.shots.length - 1].easting - a.shots[0].easting,
      a.shots[a.shots.length - 1].northing - a.shots[0].northing,
    );
    for (let j = i + 1; j < chains.length; j++) {
      const b = chains[j];
      if (a.code !== b.code || b.shots.length < 2) continue;
      const hb = Math.atan2(
        b.shots[b.shots.length - 1].easting - b.shots[0].easting,
        b.shots[b.shots.length - 1].northing - b.shots[0].northing,
      );
      let hd = Math.abs(ha - hb) * (180 / Math.PI);
      if (hd > 90) hd = 180 - hd;
      if (hd > 35) continue;
      let crossed = false;
      for (let ai = 1; ai < a.shots.length && !crossed; ai++) {
        for (let bi = 1; bi < b.shots.length; bi++) {
          if (
            segsIntersect(
              { n: a.shots[ai - 1].northing, e: a.shots[ai - 1].easting },
              { n: a.shots[ai].northing, e: a.shots[ai].easting },
              { n: b.shots[bi - 1].northing, e: b.shots[bi - 1].easting },
              { n: b.shots[bi].northing, e: b.shots[bi].easting },
            )
          ) {
            crossed = true;
            break;
          }
        }
      }
      if (crossed) {
        push({
          check: "cross",
          severity: "warn",
          title: `Overlapping ${a.code} strings`,
          detail: "Two nearly parallel strings of the same code cross. Confirm ST/END or a join.",
          shotUids: [a.shots[0].uid, b.shots[0].uid],
          alpha: a.code,
        });
      }
    }
  }
  }

  const nums = shots
    .map((s) => Number(s.point))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (nums.length >= 2) {
    let gaps = 0;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] - nums[i - 1] > 50) gaps += 1;
    }
    if (gaps) {
      push({
        check: "gaps",
        severity: "info",
        title: "Point-number gaps",
        detail: `${gaps} gap${gaps === 1 ? "" : "s"} greater than 50 in the point sequence.`,
        shotUids: [],
      });
    }
  }

  const control = shots.filter((s) => {
    const f = resolveFeature(s, remaps);
    return f?.cat === "Survey Control" || ["PRE", "PBMK", "PMON", "TRAV", "PIDT"].includes(s.codeToken.toUpperCase());
  });
  if (shots.length && !control.length) {
    push({
      check: "control",
      severity: "info",
      title: "No control in the book",
      detail: "No PRE / PBMK / PMON / TRAV shots. Hold control before ORD import.",
      shotUids: [],
    });
  }

  if (skipped > 0) {
    push({
      check: "skipped",
      severity: "info",
      title: "Rows skipped on import",
      detail: `${skipped} row${skipped === 1 ? "" : "s"} did not parse as shots.`,
      shotUids: [],
    });
  }

  for (const line of userLines) {
    if (line.pts.length < 2) {
      push({
        check: "extract-short",
        severity: "warn",
        title: `Extract ${line.code} has ${line.pts.length} vertex`,
        detail: "Drawn line needs at least two vertices.",
        shotUids: [],
        lineId: line.id,
        alpha: line.code,
      });
    }
    if (!lookupCode(line.code)) {
      push({
        check: "extract-code",
        severity: "error",
        title: `Extract line code ${line.code} unmatched`,
        detail: "Drawn line is not on an INDOT feature definition.",
        shotUids: [],
        lineId: line.id,
        alpha: line.code,
      });
    }
  }

  const CHECK = new Set(["CHK", "CHECK", "CK", "CKSHOT", "CKS"]);
  const checks = shots.filter((s) => CHECK.has(s.codeToken.toUpperCase()) || /\bCHK\b|\bCHECK\b/i.test(s.remainder));
  for (const ck of checks) {
    let best: LabeledShot | null = null;
    let bestD = 50;
    for (const c of control) {
      const d = dist2d(ck, c);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    if (!best) {
      push({
        check: "check-orphan",
        severity: "warn",
        title: `Check shot ${ck.point} has no nearby control`,
        detail: "No PRE / PBMK / PMON / TRAV within 50 ft.",
        shotUids: [ck.uid],
      });
    } else if (bestD > 0.08 || Math.abs(ck.elevation - best.elevation) > 0.08) {
      push({
        check: "check-resid",
        severity: "warn",
        title: `Check ${ck.point} vs ${best.point}`,
        detail: `ΔH ${bestD.toFixed(3)} ft · ΔZ ${(ck.elevation - best.elevation).toFixed(3)} ft.`,
        shotUids: [ck.uid, best.uid],
      });
    }
  }

  if (userLines.length) {
    const extracted = new Set(userLines.map((l) => l.code.toUpperCase()));
    for (const chain of chains) {
      if (!extracted.has(chain.code) && chain.shots.length >= 2) {
        push({
          check: "not-extracted",
          severity: "info",
          title: `${chain.code} not extracted`,
          detail: "Field-to-finish string has no office extract. Extract All or Place Line.",
          shotUids: chain.shots.map((s) => s.uid),
          lineId: chain.id,
          alpha: chain.code,
        });
      }
    }
  }

  if (shots.length >= 8) {
    const zs = shots.map((s) => s.elevation).sort((a, b) => a - b);
    const mid = zs[Math.floor(zs.length / 2)];
    const outliers = shots.filter((s) => Math.abs(s.elevation - mid) > 40);
    if (outliers.length && outliers.length < shots.length * 0.15) {
      push({
        check: "z-range",
        severity: "info",
        title: "Elevation outliers",
        detail: `${outliers.length} shot${outliers.length === 1 ? "" : "s"} more than 40 ft from the median ${mid.toFixed(2)}.`,
        shotUids: outliers.slice(0, 12).map((s) => s.uid),
      });
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  return { issues, errors, warns, infos };
}
