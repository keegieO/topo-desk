/**
 * Drainage, sign and utility tables built from point attributes.
 *
 * Attributes come from the shot description as KEY=VALUE (or KEY:VALUE)
 * tokens after the field code, e.g.  "INL TYPE=inlet RIM=812.40 INV_OUT=806.20 TO=1045 SIZE=15 MATERIAL=RCP".
 * Nothing here "fixes" field data: problems become QA flags for the client PS.
 */
export type AttrPoint = {
  id: string;
  code: string;
  n: number;
  e: number;
  z?: number;
  desc?: string;
  attrs?: Record<string, string>;
};

export function parseAttrs(desc?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!desc) return out;
  const re = /([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*("([^"]*)"|[^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(desc))) out[m[1].toLowerCase()] = m[3] ?? m[2];
  return out;
}

function attrsOf(p: AttrPoint): Record<string, string> {
  return { ...parseAttrs(p.desc), ...(p.attrs ?? {}) };
}

function num(v?: string): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export type StructureRow = {
  id: string;
  code: string;
  type: string;
  rim?: number;
  invIn?: number;
  invOut?: number;
  depth?: number;
  to?: string;
  size?: number;
  material?: string;
  n: number;
  e: number;
};

export type PipeRow = {
  from: string;
  to: string;
  size?: number;
  material?: string;
  length: number;
  invFrom?: number;
  invTo?: number;
  /** ft/ft, positive = falls downstream. */
  slope?: number;
};

export type DrainageFlag = { id: string; severity: "error" | "warn"; message: string };

export function drainageTables(points: AttrPoint[], isStructure: (code: string) => boolean): {
  structures: StructureRow[];
  pipes: PipeRow[];
  flags: DrainageFlag[];
} {
  const flags: DrainageFlag[] = [];
  const structures: StructureRow[] = points
    .filter((p) => isStructure(p.code))
    .map((p) => {
      const a = attrsOf(p);
      const rim = num(a.rim) ?? p.z;
      const invOut = num(a.inv_out);
      const invIn = num(a.inv_in);
      const low = [invIn, invOut].filter((v): v is number => v !== undefined);
      return {
        id: p.id,
        code: p.code,
        type: a.type ?? p.code,
        rim,
        invIn,
        invOut,
        depth: rim !== undefined && low.length ? +(rim - Math.min(...low)).toFixed(2) : undefined,
        to: a.to,
        size: num(a.size),
        material: a.material ?? a.mat,
        n: p.n,
        e: p.e,
      };
    });

  const byId = new Map(structures.map((s) => [s.id, s]));
  const pipes: PipeRow[] = [];
  for (const s of structures) {
    if (s.rim === undefined) flags.push({ id: s.id, severity: "warn", message: `${s.id}: no rim elevation` });
    if (s.invOut === undefined && s.to) flags.push({ id: s.id, severity: "warn", message: `${s.id}: outlet pipe listed but no outlet invert` });
    if (!s.to) continue;
    const t = byId.get(s.to);
    if (!t) {
      flags.push({ id: s.id, severity: "error", message: `${s.id}: downstream structure ${s.to} not found` });
      continue;
    }
    const length = +Math.hypot(t.n - s.n, t.e - s.e).toFixed(2);
    const invTo = t.invIn ?? t.invOut;
    const slope = s.invOut !== undefined && invTo !== undefined && length > 0 ? +((s.invOut - invTo) / length).toFixed(4) : undefined;
    if (slope !== undefined && slope < 0) flags.push({ id: s.id, severity: "error", message: `${s.id}→${t.id}: pipe slopes uphill (${(slope * 100).toFixed(2)}%)` });
    if (slope === undefined) flags.push({ id: s.id, severity: "warn", message: `${s.id}→${t.id}: missing invert, slope not computed` });
    if (s.invOut !== undefined && s.rim !== undefined && s.invOut > s.rim) flags.push({ id: s.id, severity: "error", message: `${s.id}: invert above rim` });
    pipes.push({ from: s.id, to: t.id, size: s.size, material: s.material, length, invFrom: s.invOut, invTo, slope });
  }
  return { structures, pipes, flags };
}

export type SignRow = { id: string; mutcd: string; post?: string; text?: string; n: number; e: number };

export function signInventory(points: AttrPoint[], isSign: (code: string) => boolean): { rows: SignRow[]; flags: DrainageFlag[] } {
  const flags: DrainageFlag[] = [];
  const rows = points
    .filter((p) => isSign(p.code))
    .map((p) => {
      const a = attrsOf(p);
      if (!a.mutcd) flags.push({ id: p.id, severity: "warn", message: `${p.id}: sign has no MUTCD code` });
      return { id: p.id, mutcd: (a.mutcd ?? "").toUpperCase(), post: a.post, text: a.text, n: p.n, e: p.e };
    });
  return { rows, flags };
}

/** Utility label with ASCE 38 quality level, e.g. "12\" PVC WATER (CITY) QL-B". */
export function utilityLabel(kind: string, attrs: Record<string, string>): string {
  const size = attrs.size ? `${attrs.size}"` : "";
  const owner = attrs.owner ? `(${attrs.owner.toUpperCase()})` : "";
  const ql = attrs.ql ? "QL-" + attrs.ql.toUpperCase().replace(/^QL-?/, "") : "";
  return [size, attrs.material?.toUpperCase(), kind.toUpperCase(), owner, ql].filter(Boolean).join(" ");
}

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function drainageCsv(t: ReturnType<typeof drainageTables>): string {
  const head = "Structure,Type,Northing,Easting,Rim,Invert In,Invert Out,Depth,Outlet To,Size (in),Material";
  const rows = t.structures.map((s) =>
    [s.id, s.type, s.n.toFixed(3), s.e.toFixed(3), s.rim?.toFixed(2), s.invIn?.toFixed(2), s.invOut?.toFixed(2), s.depth?.toFixed(2), s.to, s.size, s.material].map(csvCell).join(","),
  );
  const pipeHead = "From,To,Size (in),Material,Length (ft),Invert From,Invert To,Slope (%)";
  const pipes = t.pipes.map((p) =>
    [p.from, p.to, p.size, p.material, p.length.toFixed(2), p.invFrom?.toFixed(2), p.invTo?.toFixed(2), p.slope !== undefined ? (p.slope * 100).toFixed(2) : ""].map(csvCell).join(","),
  );
  const flags = t.flags.map((f) => `${f.severity.toUpperCase()},${csvCell(f.message)}`);
  return [head, ...rows, "", pipeHead, ...pipes, "", "Flags for PS review", ...flags].join("\r\n") + "\r\n";
}

export function signCsv(t: ReturnType<typeof signInventory>): string {
  const head = "Point,MUTCD Code,Post,Legend,Northing,Easting";
  const rows = t.rows.map((r) => [r.id, r.mutcd, r.post, r.text, r.n.toFixed(3), r.e.toFixed(3)].map(csvCell).join(","));
  const flags = t.flags.map((f) => `${f.severity.toUpperCase()},${csvCell(f.message)}`);
  return [head, ...rows, "", "Flags for PS review", ...flags].join("\r\n") + "\r\n";
}
