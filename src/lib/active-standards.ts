/**
 * The standards pack for the job open in the workspace. Indiana keeps the
 * original INDOT level map exactly; any other pack draws and names features
 * from its own tables (or the generic pack while a DOT pack is unsourced).
 */
import {
  DEFAULT_PACK_ID,
  displayStyle,
  getPack,
  isKnownCode,
  levelFor,
  packIdForJob,
  type JobStandards,
} from "@/standards/loader";
import type { SymbolCategory } from "@/standards/schema";
import { fishbeckKnown, fishbeckLevel, type FbLevel } from "./fishbeck";

let activeId = DEFAULT_PACK_ID;

export function setActivePack(id: string) {
  activeId = getPack(id).id;
}

export function setActivePackForJob(job?: { standards?: JobStandards } | null) {
  setActivePack(packIdForJob(job));
}

export function activePackId(): string {
  return activeId;
}

export function isIndianaActive(): boolean {
  return activeId === DEFAULT_PACK_ID;
}

/** Level name, display color, weight and dash for a code under the active pack. */
export function activeLevel(code?: string, cat?: string): FbLevel {
  if (isIndianaActive()) return fishbeckLevel(code, cat);
  const pack = getPack(activeId);
  const lv = levelFor(pack, code, cat);
  const ds = displayStyle(pack, code, cat);
  return { level: lv.name, color: ds.color, weight: ds.weight, dash: ds.dash, civil: lv.name };
}

export function activeKnown(code?: string): boolean {
  if (isIndianaActive()) return fishbeckKnown(code);
  return isKnownCode(getPack(activeId), code);
}

export function activeSymbol(code?: string, cat?: string): SymbolCategory | undefined {
  if (isIndianaActive()) return undefined;
  return displayStyle(getPack(activeId), code, cat).symbol;
}
