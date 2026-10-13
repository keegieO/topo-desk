/**
 * Standards QA: checks that depend on the job's pack. Results are flags for
 * the client PS; nothing here edits field data.
 */
import { featureFor, levelFor, type JobStandards } from "./loader.ts";
import { drainageTables, parseAttrs, signInventory, type AttrPoint } from "./drainage.ts";
import { isDrainageStructure, isSign, type PackageShot } from "./package-files.ts";
import type { StandardsPack } from "./schema.ts";

export type StandardsIssue = {
  severity: "error" | "warn" | "info";
  title: string;
  detail: string;
  points: string[];
};

function codeOf(s: PackageShot): string {
  return (s.codeToken || s.description.trim().split(/\s+/)[0] || "").toUpperCase();
}

export function standardsQa(pack: StandardsPack, shots: PackageShot[], standards?: JobStandards): StandardsIssue[] {
  const out: StandardsIssue[] = [];

  if (!standards?.psName?.trim()) {
    out.push({
      severity: "warn",
      title: "No PS in responsible charge",
      detail: "Add the client's Professional Surveyor and license number on the job. The draft label and transmittal name them.",
      points: [],
    });
  }

  // Missing required attributes, grouped per code + attribute.
  const missing = new Map<string, { code: string; key: string; label: string; pts: string[] }>();
  for (const s of shots) {
    const code = codeOf(s);
    const f = featureFor(pack, code);
    const req = f?.attributes?.filter((a) => a.required) ?? [];
    if (!req.length) continue;
    const attrs = parseAttrs(s.description);
    for (const a of req) {
      if (attrs[a.key] !== undefined && attrs[a.key] !== "") continue;
      if (a.key === "rim" && Number.isFinite(s.elevation)) continue; // shot elevation stands in for rim
      const k = `${code}|${a.key}`;
      const cur = missing.get(k) ?? { code, key: a.key, label: a.label, pts: [] };
      cur.pts.push(s.point);
      missing.set(k, cur);
    }
  }
  for (const m of missing.values()) {
    out.push({
      severity: "warn",
      title: `${m.pts.length} ${m.code} point${m.pts.length === 1 ? "" : "s"} missing ${m.label}`,
      detail: `Add it to the point description as ${m.key.toUpperCase()}=… or confirm with the crew.`,
      points: m.pts.slice(0, 40),
    });
  }

  const pts: AttrPoint[] = shots.map((s) => ({ id: s.point, code: codeOf(s), n: s.northing, e: s.easting, z: s.elevation, desc: s.description }));
  const drain = drainageTables(pts, (c) => isDrainageStructure(pack, c));
  for (const f of drain.flags) out.push({ severity: f.severity, title: "Drainage", detail: f.message, points: [f.id] });
  const signs = signInventory(pts, (c) => isSign(pack, c));
  if (signs.flags.length && !missing.size) {
    out.push({ severity: "warn", title: `${signs.flags.length} sign${signs.flags.length === 1 ? "" : "s"} without an MUTCD code`, detail: "Add MUTCD=R1-1 (etc.) to the description.", points: signs.flags.map((f) => f.id).slice(0, 40) });
  }

  // Codes the pack doesn't know (non-Indiana packs; Indiana uses the catalog QA).
  if (pack.id !== "us-in-indot") {
    const unknown = new Map<string, number>();
    for (const s of shots) {
      const c = codeOf(s);
      if (c && !featureFor(pack, c) && levelFor(pack, c).name === pack.fallbackLevel) unknown.set(c, (unknown.get(c) ?? 0) + 1);
    }
    if (unknown.size) {
      out.push({
        severity: "info",
        title: `${unknown.size} code${unknown.size === 1 ? "" : "s"} not in ${pack.name}`,
        detail: [...unknown.entries()].slice(0, 20).map(([c, n]) => `${c} (${n})`).join(", ") + ". They go on the fallback layer until mapped.",
        points: [],
      });
    }
  }
  return out;
}

/** Civil 3D description-key set as CSV: code, layer, description format, notes. */
export function descriptionKeysCsv(pack: StandardsPack): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = pack.features.map((f) => {
    const sym = f.symbol ? pack.symbols.find((s) => s.name === f.symbol) : undefined;
    return [`${f.code}*`, f.level, sym?.nativeBlock ?? sym?.nativeCell ?? "", "$*", f.name, f.kind, f.terrain].map((v) => esc(String(v))).join(",");
  });
  return ["Code,Layer,Point Style / Block,Format,Description,Kind,Terrain", ...rows].join("\r\n") + "\r\n";
}
