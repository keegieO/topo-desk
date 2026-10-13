/**
 * Convert an agency table into pack JSON you paste into a pack file.
 *
 *   node --experimental-strip-types scripts/packs/import.ts features INDOT-Survey.csv --source indot-survey-codes
 *   node --experimental-strip-types scripts/packs/import.ts levels ODOT-levels.csv --source odot-levels
 *
 * XLSX: save the sheet as CSV first. Output goes to stdout; a summary of
 * skipped rows goes to stderr.
 */
import { readFileSync } from "node:fs";
import { importFeatureTable, importLevelTable } from "../../src/standards/importers.ts";

const [kind, file, ...rest] = process.argv.slice(2);
const sourceIdx = rest.indexOf("--source");
const sourceId = sourceIdx >= 0 ? rest[sourceIdx + 1] : "";
if (!kind || !file || !sourceId) {
  console.error("usage: import.ts <features|levels> <file.csv> --source <source-id>");
  process.exit(2);
}
const text = readFileSync(file, "utf8");
const out = kind === "levels" ? importLevelTable(text, sourceId) : importFeatureTable(text, sourceId);
console.log(JSON.stringify(kind === "levels" ? (out as ReturnType<typeof importLevelTable>).levels : (out as ReturnType<typeof importFeatureTable>).features, null, 2));
console.error(`${kind}: ${(kind === "levels" ? (out as ReturnType<typeof importLevelTable>).levels : (out as ReturnType<typeof importFeatureTable>).features).length} rows, ${out.skipped.length} skipped`);
for (const s of out.skipped.slice(0, 40)) console.error("  skipped: " + s);
