import { PackSchema, rgbToHex, type PackDeliverable, type PackFeature, type PackLevel, type SectionStatus, type StandardsPack, type SymbolCategory } from "./schema.ts";
import { INDIANA_PACK } from "./packs/us-in-indot.ts";
import { GENERIC_PACK } from "./packs/generic-ncs-apwa.ts";
import { STATE_SKELETONS } from "./packs/states.ts";
import { STATE_REGISTRY, stateByCode } from "./registry.ts";

export const DEFAULT_PACK_ID = "us-in-indot";
export const GENERIC_PACK_ID = "generic-ncs-apwa";

const RAW = [INDIANA_PACK, GENERIC_PACK, ...STATE_SKELETONS];

/** Every pack, validated at load. A schema error here is a bug in a pack file. */
const PARSED = new Map<string, StandardsPack>();
for (const raw of RAW) {
  const pack = PackSchema.parse(raw);
  if (PARSED.has(pack.id)) throw new Error(`Duplicate standards pack id ${pack.id}`);
  PARSED.set(pack.id, pack);
}

export function listPacks(): StandardsPack[] {
  return [...PARSED.values()];
}

/** The pack as written (no inheritance). */
export function rawPack(id: string): StandardsPack | undefined {
  return PARSED.get(id);
}

const EFFECTIVE = new Map<string, StandardsPack>();

/**
 * The pack with inheritance applied: any table the pack leaves empty comes
 * from its `extends` parent. Legal, sources and status always stay the pack's own.
 */
export function getPack(id?: string): StandardsPack {
  const key = id && PARSED.has(id) ? id : DEFAULT_PACK_ID;
  const hit = EFFECTIVE.get(key);
  if (hit) return hit;
  const own = PARSED.get(key)!;
  const parent = own.extends && own.extends !== key ? getPack(own.extends) : undefined;
  const pick = <T>(a: T[], b?: T[]) => (a.length ? a : (b ?? []));
  const merged: StandardsPack = parent
    ? {
        ...own,
        units: own.units ?? parent.units,
        crs: own.crs.length ? own.crs : parent.crs,
        lineStyles: pick(own.lineStyles, parent.lineStyles),
        textStyles: pick(own.textStyles, parent.textStyles),
        levels: pick(own.levels, parent.levels),
        symbols: pick(own.symbols, parent.symbols),
        features: pick(own.features, parent.features),
        categoryLevels: Object.keys(own.categoryLevels).length ? own.categoryLevels : parent.categoryLevels,
        categoryStyles: Object.keys(own.categoryStyles).length ? own.categoryStyles : parent.categoryStyles,
        fallbackStyle: own.fallbackStyle ?? parent.fallbackStyle,
        fallbackLevel: own.fallbackLevel ?? parent.fallbackLevel,
        linkingCodes: pick(own.linkingCodes, parent.linkingCodes),
        deliverables: pick(own.deliverables, parent.deliverables),
        legal: own.legal ?? parent.legal,
      }
    : own;
  EFFECTIVE.set(key, merged);
  return merged;
}

/** True when this pack's DOT tables aren't sourced yet and the generic pack is filling in. */
export function usesGenericFallback(id?: string): boolean {
  const own = rawPack(id ?? DEFAULT_PACK_ID);
  if (!own) return false;
  return !!own.extends && own.features.length === 0;
}

export function packForState(usps?: string): StandardsPack {
  const entry = stateByCode(usps);
  return getPack(entry?.packId ?? GENERIC_PACK_ID);
}

export function packIdForState(usps?: string): string {
  return stateByCode(usps)?.packId ?? GENERIC_PACK_ID;
}

export type JobStandards = {
  /** USPS code of the project state. */
  state?: string;
  packId?: string;
  psName?: string;
  psLicense?: string;
};

export function packIdForJob(job?: { standards?: JobStandards } | null): string {
  const s = job?.standards;
  if (s?.packId && PARSED.has(s.packId)) return s.packId;
  if (s?.state) return packIdForState(s.state);
  return DEFAULT_PACK_ID;
}

// ---------- code / level resolution ----------

function rootCode(code?: string): string {
  return (code ?? "").toUpperCase().replace(/\d+$/g, "");
}

const FEATURE_INDEX = new WeakMap<StandardsPack, Map<string, PackFeature>>();
const LEVEL_INDEX = new WeakMap<StandardsPack, Map<string, PackLevel>>();

function featureIndex(pack: StandardsPack): Map<string, PackFeature> {
  let m = FEATURE_INDEX.get(pack);
  if (!m) {
    m = new Map(pack.features.map((f) => [f.code.toUpperCase(), f]));
    FEATURE_INDEX.set(pack, m);
  }
  return m;
}

function levelIndex(pack: StandardsPack): Map<string, PackLevel> {
  let m = LEVEL_INDEX.get(pack);
  if (!m) {
    m = new Map(pack.levels.map((l) => [l.name, l]));
    LEVEL_INDEX.set(pack, m);
  }
  return m;
}

/** Feature for a field code: trailing digits are ignored first (EP1 → EP), then the raw code. */
export function featureFor(pack: StandardsPack, code?: string): PackFeature | undefined {
  const raw = (code ?? "").toUpperCase();
  const idx = featureIndex(pack);
  const k = rootCode(raw);
  return (k && idx.get(k)) || (raw && idx.get(raw)) || undefined;
}

export function isKnownCode(pack: StandardsPack, code?: string): boolean {
  return !!featureFor(pack, code);
}

const UNKNOWN_LEVEL: PackLevel = { name: "UNKNOWN", rgb: [240, 112, 112], weight: 1.6, sourceId: "none" };

/** Same order as the original Indiana logic: code → catalog category → pack fallback. */
export function levelFor(pack: StandardsPack, code?: string, cat?: string): PackLevel {
  const levels = levelIndex(pack);
  const f = featureFor(pack, code);
  const name = f?.level ?? (cat ? pack.categoryLevels[cat] : undefined) ?? pack.fallbackLevel;
  return (name && levels.get(name)) || (name ? { ...UNKNOWN_LEVEL, name } : UNKNOWN_LEVEL);
}

/** Layer / level name safe for DXF LAYER. */
export function layerName(pack: StandardsPack, code?: string, cat?: string): string {
  return levelFor(pack, code, cat).name.replace(/[<>/\\":;?*|=]/g, "").slice(0, 250);
}

export type DisplayStyle = {
  color: string;
  weight: number;
  dash?: string;
  symbol?: SymbolCategory;
  level: string;
};

export function displayStyle(pack: StandardsPack, code?: string, cat?: string): DisplayStyle {
  const lv = levelFor(pack, code, cat);
  const f = featureFor(pack, code);
  const sym = f?.symbol ? pack.symbols.find((s) => s.name === f.symbol)?.category : undefined;
  const override = f ? undefined : (cat && pack.categoryStyles[cat]) || (!cat || !pack.categoryLevels[cat] ? pack.fallbackStyle : undefined);
  const rgb = f?.rgb ?? override?.rgb ?? lv.rgb;
  const weight = f?.weight ?? override?.weight ?? lv.weight;
  const dash = f ? (f.lineStyle ?? lv.lineStyle) : override ? override.dash : lv.lineStyle;
  return { color: rgbToHex(rgb), weight, dash: dash && /\d/.test(dash) ? dash : undefined, symbol: sym, level: lv.name };
}

/** Native cell (DGN) or block (DWG) name for a point code, if the pack records one. */
export function nativeSymbolName(pack: StandardsPack, code?: string): string | undefined {
  const f = featureFor(pack, code);
  if (!f?.symbol) return undefined;
  const s = pack.symbols.find((x) => x.name === f.symbol);
  return s?.nativeCell ?? s?.nativeBlock;
}

// ---------- legal / deliverables ----------

export function draftLabel(pack: StandardsPack, job?: { standards?: JobStandards } | null): string {
  const s = job?.standards ?? {};
  const stateName = stateByCode(s.state ?? pack.state)?.name ?? s.state ?? pack.state ?? "";
  return (pack.legal?.draftLabel ?? "DRAFT. NOT A CERTIFIED DOCUMENT.")
    .replaceAll("{ps_name}", s.psName?.trim() || "the client's Professional Surveyor")
    .replaceAll("{ps_license}", s.psLicense?.trim() || "[license #]")
    .replaceAll("{state}", stateName);
}

export function deliverablesFor(pack: StandardsPack): PackDeliverable[] {
  return pack.deliverables;
}

export type Coverage = { complete: number; partial: number; needsSource: number; total: number };

export function coverage(id: string): Coverage {
  const own = rawPack(id);
  const vals = Object.values(own?.status ?? {}) as SectionStatus[];
  return {
    complete: vals.filter((v) => v === "complete").length,
    partial: vals.filter((v) => v === "partial").length,
    needsSource: vals.filter((v) => v === "needs-source").length,
    total: vals.length,
  };
}

/** One-line warning for the job banner, or null when nothing needs flagging. */
export function packWarning(id: string): string | null {
  const own = rawPack(id);
  if (!own) return null;
  const st = stateByCode(own.state)?.name ?? own.state ?? "";
  if (usesGenericFallback(id)) return `No ${own.agency} tables imported yet. Using generic NCS/APWA standards for layers and codes.`;
  if (own.legal && !own.legal.verified) return `Legal wording for ${st || own.name} not yet verified with the state surveying board.`;
  return null;
}

export { STATE_REGISTRY };
