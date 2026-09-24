import { toCsv, type CoordOrder } from "./csv";
import {
  applyTemplate,
  resolveFeature,
  type ExportKind,
  type LabeledShot,
} from "./label";
import { stamp } from "./utils";

function descForOrd(shot: LabeledShot, remaps: Record<string, string>, labeled: boolean): string {
  const feature = resolveFeature(shot, remaps);
  const rest = shot.remainder ? ` ${shot.remainder}` : "";
  if (labeled) {
    const name = feature?.name ?? shot.codeToken ?? "UNMATCHED";
    return (name + rest).trim();
  }
  return shot.description;
}

export function buildExport(opts: {
  shots: LabeledShot[];
  remaps: Record<string, string>;
  kind: ExportKind;
  template: string;
  order: CoordOrder;
  fileName: string;
}): { filename: string; csv: string } {
  const { shots, remaps, kind, template, order, fileName } = opts;
  const base = fileName.replace(/\.[^.]+$/, "") || "fieldbook";
  const tag = stamp();

  if (kind === "fieldbook") {
    const header = order === "PENZD" ? ["P", "E", "N", "Z", "D"] : ["P", "N", "E", "Z", "D"];
    const rows: (string | number)[][] = [header];
    for (const s of shots) {
      const d = descForOrd(s, remaps, false);
      rows.push(
        order === "PENZD"
          ? [s.point, s.easting.toFixed(3), s.northing.toFixed(3), s.elevation.toFixed(3), d]
          : [s.point, s.northing.toFixed(3), s.easting.toFixed(3), s.elevation.toFixed(3), d],
      );
    }
    return { filename: `${base}_ORD_PNEZD_${tag}.csv`, csv: toCsv(rows) };
  }

  if (kind === "labeled-ord") {
    const header = order === "PENZD" ? ["P", "E", "N", "Z", "D"] : ["P", "N", "E", "Z", "D"];
    const rows: (string | number)[][] = [header];
    for (const s of shots) {
      const d = descForOrd(s, remaps, true);
      rows.push(
        order === "PENZD"
          ? [s.point, s.easting.toFixed(3), s.northing.toFixed(3), s.elevation.toFixed(3), d]
          : [s.point, s.northing.toFixed(3), s.easting.toFixed(3), s.elevation.toFixed(3), d],
      );
    }
    return { filename: `${base}_ORD_labeled_${tag}.csv`, csv: toCsv(rows) };
  }

  if (kind === "annotation") {
    const rows: (string | number)[][] = [["Point", "Northing", "Easting", "Elevation", "Label"]];
    for (const s of shots) {
      const f = resolveFeature(s, remaps);
      rows.push([
        s.point,
        s.northing.toFixed(3),
        s.easting.toFixed(3),
        s.elevation.toFixed(3),
        applyTemplate(s, f, template),
      ]);
    }
    return { filename: `${base}_labels_${tag}.csv`, csv: toCsv(rows) };
  }

  const rows: (string | number)[][] = [
    [
      "Point",
      "Northing",
      "Easting",
      "Elevation",
      "Alpha Code",
      "Link / Notes",
      "Feature Definition",
      "Description",
      "Category",
      "Attribute Type",
      "Kind",
      "Label",
      "Match",
      "Original Description",
    ],
  ];
  for (const s of shots) {
    const f = resolveFeature(s, remaps);
    rows.push([
      s.point,
      s.northing.toFixed(3),
      s.easting.toFixed(3),
      s.elevation.toFixed(3),
      s.codeToken,
      s.remainder,
      f?.name ?? "",
      f?.desc ?? "",
      f?.cat ?? "",
      f?.attr ?? "",
      f?.kind ?? "",
      applyTemplate(s, f, template),
      f ? "matched" : "unmatched",
      s.description,
    ]);
  }
  return { filename: `${base}_INDOT_full_${tag}.csv`, csv: toCsv(rows) };
}
