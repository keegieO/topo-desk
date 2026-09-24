import { detectFieldbookFormat, parseFieldbook, shotsToPnezd } from "./fieldbook";

export type IngestResult = {
  csv?: { raw: string; name: string };
  append?: boolean;
  warnings: string[];
  errors: string[];
};

const SURVEY_NAME = /\.(csv|txt|asc|xyz|pnezd|penzd|fbk|rw5|raw|gsi|jxl|dc|job)$/i;

export function isSurveyName(name: string): boolean {
  return SURVEY_NAME.test(name);
}

export async function ingestFiles(fileList: FileList | File[], append = false): Promise<IngestResult> {
  const files = Array.from(fileList);
  const out: IngestResult = { errors: [], warnings: [], append };
  if (!files.length) {
    out.errors.push("No file selected");
    return out;
  }
  for (const file of files) {
    const name = file.name;
    try {
      if (/\.(las|laz)$/i.test(name)) {
        out.errors.push(`${name}: LiDAR is parked. Open a PNEZD / RW5 / FBK / CSV field book.`);
        continue;
      }
      if (isSurveyName(name) || /csv|text|plain|xml/.test(file.type) || !file.type) {
        const raw = await file.text();
        if (!/\d/.test(raw)) {
          out.errors.push(`${name}: empty file`);
          continue;
        }
        const fmt = detectFieldbookFormat(raw, name);
        if (fmt === "csv") {
          out.csv = { raw, name };
        } else {
          const book = parseFieldbook(raw, name);
          if (!book.shots.length) {
            out.errors.push(`${name}: no shots reduced`);
            continue;
          }
          out.csv = { raw, name };
          out.warnings.push(...book.warnings);
        }
      } else {
        const raw = await file.text();
        if (/\d{3,}[,\s]+\d{3,}/.test(raw)) out.csv = { raw, name };
        else out.errors.push(`${name}: use .csv / .rw5 / .fbk / .pnezd field book`);
      }
    } catch (err) {
      out.errors.push(`${name}: ${err instanceof Error ? err.message : "failed to read"}`);
    }
  }
  if (!out.csv && !out.errors.length) out.errors.push("Nothing loaded");
  return out;
}

export { shotsToPnezd };
