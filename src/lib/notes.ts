import { buildChains } from "./chains";
import { parseField, rootCode } from "./fieldcode";
import type { LabeledShot } from "./label";

export type Leader = {
  id: string;
  text: string;
  n: number;
  e: number;
  tn: number;
  te: number;
  arrow: boolean;
  shotUid?: string;
  source?: "auto" | "user";
};

const CALLOUT: Record<string, string> = {
  RP: "RIPRAP",
  GR: "GUARDRAIL",
  RB: "GUARDRAIL",
  HD: "HEADWALL",
  CB: "CATCH BASIN",
  DI: "DROP INLET",
  FES: "FLARED END SECTION",
  CMP: "CMP",
  CPP: "CPP",
  RCP: "RCP",
  PVC: "PVC",
  DR: "DRAINAGE PIPE",
  PSGN: "SIGN",
  PDEL: "DELINEATOR",
  PMBX: "MAILBOX",
  PHYD: "FIRE HYDRANT",
  PPOL: "POWER POLE",
  PTDS: "TREE",
  WL: "WOODS LINE",
  FW: "FENCE",
  FF: "FENCE",
  SW: "SIDEWALK",
};

const PIPE = new Set(["DR", "CMP", "CPP", "RCP", "PVC", "HD"]);

export function noteText(shot: Pick<LabeledShot, "description" | "remainder" | "elevation" | "codeToken">): string | null {
  const field = parseField(shot.description || `${shot.codeToken} ${shot.remainder}`.trim());
  const code = field.codes[0]?.code || shot.codeToken;
  return callout(code, field.note, shot.elevation);
}

function callout(code: string, note: string, z: number): string | null {
  const root = rootCode(code);
  const raw = note.trim();
  const inv = raw.match(/INV\.?\s*(\d+(?:\.\d+)?)\s*IN\.?\s*([A-Z0-9]+)/i);
  if (inv) return `${inv[1]}" ${inv[2].toUpperCase()}\nINV. = ${z.toFixed(2)}'`;
  const sized = raw.match(/(\d+(?:\.\d+)?)\s*IN\.?\s*([A-Z]+)/i);
  if (sized) return `${sized[1]}" ${sized[2].toUpperCase()}\nINV. = ${z.toFixed(2)}'`;
  const only = raw.match(/(\d+(?:\.\d+)?)\s*IN\b/i);
  if (only) {
    const kind = CALLOUT[root] && !PIPE.has(root) ? CALLOUT[root] : root === "PTDS" ? "TREE" : "CMP";
    return `${only[1]}" ${kind}`;
  }
  if (raw.length > 1) return raw.toUpperCase();
  if (PIPE.has(root)) return `${CALLOUT[root] ?? root}\nINV. = ${z.toFixed(2)}'`;
  if (CALLOUT[root]) return CALLOUT[root];
  return null;
}

function place(anchorN: number, anchorE: number, prevN: number, prevE: number, side: number): { n: number; e: number } {
  const de = anchorE - prevE;
  const dn = anchorN - prevN;
  const len = Math.hypot(de, dn) || 1;
  const feet = 36;
  return {
    n: anchorN + (-de / len) * feet * side,
    e: anchorE + (dn / len) * feet * side,
  };
}

export function autoLeaders(shots: LabeledShot[], remaps: Record<string, string> = {}): Leader[] {
  const chains = buildChains(shots, remaps);
  const used = new Set<string>();
  const found: { rank: number; leader: Leader }[] = [];
  let n = 0;

  const push = (code: string, text: string, s: LabeledShot, prev: { northing: number; easting: number } | undefined, rank: number) => {
    const side = n % 2 === 0 ? 1 : -1;
    n += 1;
    const at = place(s.northing, s.easting, prev?.northing ?? s.northing + 1, prev?.easting ?? s.easting, side);
    found.push({
      rank,
      leader: {
        id: `auto-${code}-${s.uid}`,
        text,
        n: at.n,
        e: at.e,
        tn: s.northing,
        te: s.easting,
        arrow: true,
        shotUid: s.uid,
        source: "auto",
      },
    });
    used.add(`${code}:${s.uid}`);
  };

  for (const chain of chains) {
    let best: { s: LabeledShot; text: string; rank: number; i: number } | null = null;
    for (let i = 0; i < chain.shots.length; i++) {
      const s = chain.shots[i];
      const field = parseField(s.description);
      const text = callout(chain.code, field.note, s.elevation);
      if (!text) continue;
      const rank = text.includes("INV") ? 0 : text.includes('"') ? 1 : rootCode(chain.code) === "RP" ? 2 : field.note ? 3 : 4;
      if (!best || rank < best.rank) best = { s, text, rank, i };
    }
    if (!best) continue;
    if (best.rank > 3 && chain.shots.length > 2 && !CALLOUT[rootCode(chain.code)]) continue;
    for (const s of chain.shots) used.add(`${chain.code}:${s.uid}`);
    const prev = chain.shots[Math.max(0, best.i - 1)];
    push(chain.code, best.text, best.s, prev, best.rank);
  }

  for (const s of shots) {
    const field = parseField(s.description);
    const codes = field.codes.length ? field.codes.map((c) => c.code) : [s.codeToken];
    for (const code of codes) {
      if (used.has(`${code}:${s.uid}`)) continue;
      const text = callout(code, field.note, s.elevation);
      if (!text) continue;
      const rank = text.includes("INV") ? 0 : field.note ? 2 : 4;
      if (rank > 3 && !CALLOUT[rootCode(code)]) continue;
      push(code, text, s, undefined, rank);
    }
  }

  found.sort((a, b) => a.rank - b.rank);
  return found.slice(0, 120).map((f) => f.leader);
}
