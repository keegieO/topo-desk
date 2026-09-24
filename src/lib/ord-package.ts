import { projectAlignment, staOffCsv } from "./align";
import { allChains, buildControlCsv, buildDxf, buildLandXml, cadFilenames } from "./cad-export";
import { chainVertices, extractsAsShots } from "./chains";
import type { UserLine } from "./chains";
import { polylineLength } from "./cogo";
import type { CoordOrder } from "./csv";
import { emptySurvey, type Job } from "./job-types";
import { buildExport } from "./export";
import type { LabeledShot } from "./label";
import { htmlProposal, htmlTransmittal } from "./paper";
import { htmlPlotSheet } from "./sheet";
import { htmlSheetSet } from "./sheet-set";
import { buildFieldbookReport } from "./report";
import { runQa } from "./qa";
import { stamp } from "./utils";
import { zipTexts } from "./zip";
import type { Leader } from "./notes";
import { terrainFromBook, type TerrainModel } from "./terrain";

export function buildOrdPackage(opts: {
  stem: string;
  shots: LabeledShot[];
  remaps: Record<string, string>;
  userLines: UserLine[];
  order: CoordOrder;
  template: string;
  job?: Job;
  fileName: string;
  leaders?: Leader[];
  terrain?: TerrainModel | null;
}): { filename: string; blob: Blob } {
  const { shots, remaps, userLines, job } = opts;
  const extra = extractsAsShots(userLines);
  const allShots = [...shots, ...extra];
  const chains = allChains(shots, remaps, userLines);
  const names = cadFilenames(opts.stem);
  const survey = opts.job?.survey ?? emptySurvey();
  const qa = runQa(shots, remaps, userLines);
  const chainRows = chains.map((c) => ({
    code: c.code,
    n: c.shots.length || c.pts?.length || 0,
    length: polylineLength(chainVertices(c)),
    closed: c.closed,
    source: c.source,
  }));

  const book = buildExport({
    shots: allShots,
    remaps,
    kind: "fieldbook",
    template: opts.template,
    order: opts.order,
    fileName: opts.stem,
  });
  const labeled = buildExport({
    shots: allShots,
    remaps,
    kind: "labeled-ord",
    template: opts.template,
    order: opts.order,
    fileName: opts.stem,
  });
  const workbook = buildExport({
    shots: allShots,
    remaps,
    kind: "full",
    template: opts.template,
    order: opts.order,
    fileName: opts.stem,
  });

  const align = projectAlignment(
    shots,
    chains.map((c) => ({ code: c.code, pts: chainVertices(c) })),
  );
  const staName = `${opts.stem.replace(/\.[^.]+$/, "") || "fieldbook"}_station_offset.csv`;
  const terrain = opts.terrain ?? terrainFromBook(shots, remaps, userLines, 1);
  const index = [
    job?.des ? `Des. ${job.des}` : opts.stem,
    job?.name ?? "Field book",
    job?.crs ?? "",
    "",
    names.dxf,
    names.xml,
    book.filename,
    labeled.filename,
    workbook.filename,
    names.control,
    staName,
    "plan_sheet.html",
    "plan_sheets.html",
    "fieldbook_report.txt",
    ...(job ? ["proposal.html", "transmittal.html"] : []),
    "",
    "DXF layers are INDOT alpha codes. Contours are on S_SURF_MajorContours.",
    `Surface       ${terrain.pts.length} pts, ${terrain.tris.length} triangles, ${terrain.zmin.toFixed(2)} to ${terrain.zmax.toFixed(2)} · ${terrain.note}`,
    "LandXML 1.2 includes the existing TIN. Field book is PNEZD.",
  ]
    .filter((line) => line !== undefined)
    .join("\r\n");

  const files: { name: string; text: string }[] = [
    { name: "INDEX.txt", text: index + "\r\n" },
    { name: names.dxf, text: buildDxf({ shots, chains, leaders: opts.leaders, contours: terrain.contours }) },
    {
      name: names.xml,
      text: buildLandXml({
        shots,
        chains,
        remaps,
        project: job?.name || opts.stem,
        crs: job?.crs || "NAD83(2011)",
        terrain,
      }),
    },
    { name: book.filename, text: book.csv },
    { name: labeled.filename, text: labeled.csv },
    { name: workbook.filename, text: workbook.csv },
    { name: names.control, text: buildControlCsv(shots) },
    { name: staName, text: staOffCsv(shots, align) },
    {
      name: "plan_sheet.html",
      text: htmlPlotSheet({
        title: job?.name || opts.stem,
        des: job?.des || opts.stem,
        client: job?.client || "",
        county: job?.county || "",
        crs: job?.crs || "NAD83(2011)",
        date: job?.survey?.date || new Date().toISOString().slice(0, 10),
        firm: "Breakline Extraction",
        align,
        shots,
        chains,
        leaders: opts.leaders,
        contours: terrain.contours,
      }),
    },
    {
      name: "plan_sheets.html",
      text: htmlSheetSet({
        title: job?.name || opts.stem,
        des: job?.des || opts.stem,
        client: job?.client || "",
        county: job?.county || "",
        crs: job?.crs || "NAD83(2011)",
        date: job?.survey?.date || new Date().toISOString().slice(0, 10),
        firm: "Breakline Extraction",
        shots,
        chains,
        leaders: opts.leaders,
        contours: terrain.contours,
      }),
    },
    {
      name: "fieldbook_report.txt",
      text: buildFieldbookReport({
        jobName: job?.name || opts.fileName || "Field book",
        fileName: opts.fileName,
        shots,
        remaps,
        survey,
        chains: chainRows,
        extracts: userLines.length,
        qa,
        surface: `${terrain.pts.length} pts · ${terrain.tris.length} triangles · ${terrain.zmin.toFixed(2)} to ${terrain.zmax.toFixed(2)} · ${terrain.note}`,
      }),
    },
  ];

  if (job) {
    files.push(
      { name: "proposal.html", text: htmlProposal(job) },
      { name: "transmittal.html", text: htmlTransmittal({ job, shots, remaps }) },
    );
  }

  const des = (job?.des || opts.stem || "fieldbook").replace(/[^\w.-]+/g, "_");
  return {
    filename: `${des}_ORD_${stamp()}.zip`,
    blob: zipTexts(files),
  };
}
