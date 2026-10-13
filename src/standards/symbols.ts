/**
 * Generic on-screen symbols, one per symbol category. Original simple glyphs,
 * not copies of any agency's cell artwork. They are display approximations;
 * exports carry the agency's real cell/block names.
 */
import type { SymbolCategory } from "./schema.ts";

const BODY: Record<SymbolCategory, string> = {
  sign: `<rect x="3" y="2" width="6" height="5" fill="none" stroke="C" stroke-width="1.3"/><path d="M6 7V11" stroke="C" stroke-width="1.3"/>`,
  "sign-post": `<path d="M6 1.5V10.5M4 10.5H8" stroke="C" stroke-width="1.3" fill="none"/>`,
  "overhead-sign": `<path d="M1.5 10.5V3H10.5V10.5" stroke="C" stroke-width="1.3" fill="none"/><rect x="4" y="3" width="4" height="3" fill="C"/>`,
  signal: `<rect x="4" y="1.5" width="4" height="9" rx="1" fill="none" stroke="C" stroke-width="1.2"/><circle cx="6" cy="4" r="0.9" fill="C"/><circle cx="6" cy="8" r="0.9" fill="C"/>`,
  light: `<circle cx="6" cy="6" r="2" fill="C"/><path d="M6 1V2.5M6 9.5V11M1 6H2.5M9.5 6H11" stroke="C" stroke-width="1.1"/>`,
  inlet: `<rect x="2" y="3" width="8" height="6" fill="none" stroke="C" stroke-width="1.3"/><path d="M4 3V9M6 3V9M8 3V9" stroke="C" stroke-width="0.8"/>`,
  "catch-basin": `<rect x="2.5" y="2.5" width="7" height="7" fill="none" stroke="C" stroke-width="1.3"/><path d="M2.5 2.5L9.5 9.5" stroke="C" stroke-width="0.9"/>`,
  manhole: `<circle cx="6" cy="6" r="4.2" fill="none" stroke="C" stroke-width="1.3"/><circle cx="6" cy="6" r="1.6" fill="C"/>`,
  headwall: `<path d="M2 8H10M3 8V4H9V8" stroke="C" stroke-width="1.3" fill="none"/>`,
  "end-section": `<path d="M2 4L10 6L2 8Z" fill="none" stroke="C" stroke-width="1.3"/>`,
  culvert: `<path d="M1.5 4H10.5M1.5 8H10.5" stroke="C" stroke-width="1.3"/>`,
  pole: `<circle cx="6" cy="6" r="3.4" fill="C"/><circle cx="6" cy="6" r="1.2" fill="#111"/>`,
  guy: `<path d="M2 10L10 2M7 2H10V5" stroke="C" stroke-width="1.3" fill="none"/>`,
  hydrant: `<path d="M4 10V5H8V10ZM3 6H9" stroke="C" stroke-width="1.3" fill="none"/><circle cx="6" cy="3.5" r="1.2" fill="C"/>`,
  valve: `<path d="M2 3L10 9V3L2 9Z" fill="none" stroke="C" stroke-width="1.2"/>`,
  meter: `<rect x="2.5" y="3.5" width="7" height="5" fill="none" stroke="C" stroke-width="1.3"/><text x="6" y="7.6" font-size="4" text-anchor="middle" fill="C">M</text>`,
  vault: `<rect x="2" y="2" width="8" height="8" fill="none" stroke="C" stroke-width="1.3"/><path d="M2 2L10 10M10 2L2 10" stroke="C" stroke-width="0.8"/>`,
  "tree-deciduous": `<circle cx="6" cy="5" r="3.6" fill="none" stroke="C" stroke-width="1.3"/><path d="M6 8.5V11" stroke="C" stroke-width="1.3"/>`,
  "tree-conifer": `<path d="M6 1.5L10 9H2Z" fill="none" stroke="C" stroke-width="1.3"/><path d="M6 9V11" stroke="C" stroke-width="1.3"/>`,
  shrub: `<circle cx="4.5" cy="6.5" r="2.4" fill="none" stroke="C" stroke-width="1.1"/><circle cx="7.5" cy="6.5" r="2.4" fill="none" stroke="C" stroke-width="1.1"/>`,
  monument: `<circle cx="6" cy="6" r="3.6" fill="none" stroke="C" stroke-width="1.3"/><path d="M6 2.4V9.6M2.4 6H9.6" stroke="C" stroke-width="0.9"/>`,
  benchmark: `<polygon points="6,1.5 10.5,10.5 1.5,10.5" fill="none" stroke="C" stroke-width="1.3"/><circle cx="6" cy="7.5" r="1" fill="C"/>`,
  "control-point": `<polygon points="6,1.5 10.5,10.5 1.5,10.5" fill="none" stroke="C" stroke-width="1.3"/>`,
  spot: `<path d="M3.5 6H8.5M6 3.5V8.5" stroke="C" stroke-width="1.1"/>`,
  mailbox: `<rect x="3" y="3" width="6" height="4" rx="2" fill="none" stroke="C" stroke-width="1.2"/><path d="M6 7V11" stroke="C" stroke-width="1.2"/>`,
  post: `<rect x="5" y="2" width="2" height="8" fill="C"/>`,
  "building-corner": `<path d="M2 10V2H10" stroke="C" stroke-width="1.4" fill="none"/>`,
  misc: `<path d="M3 3L9 9M9 3L3 9" stroke="C" stroke-width="1.3" fill="none"/>`,
};

export function symbolSvg(cat: SymbolCategory | undefined, color: string, size = 12): string {
  const body = BODY[cat ?? "misc"] ?? BODY.misc;
  return `<svg width="${size}" height="${size}" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">${body.replaceAll('"C"', `"${color}"`)}</svg>`;
}
