import type { UserLine } from "./chains";
import type { CoordOrder } from "./csv";
import type { Leader } from "./notes";
import type { SurveyMeta } from "./job-types";
import { useBook } from "./store";

export type GeoLineProject = {
  kind: "geoline-project";
  version: 1;
  fileName: string;
  raw: string;
  order: CoordOrder;
  crsId: string;
  remaps: Record<string, string>;
  userLines: UserLine[];
  leaders: Leader[];
  survey: SurveyMeta;
};

export function packProject(): string {
  const s = useBook.getState();
  const doc: GeoLineProject = {
    kind: "geoline-project",
    version: 1,
    fileName: s.fileName,
    raw: s.raw,
    order: s.order,
    crsId: s.crsId,
    remaps: s.remaps,
    userLines: s.userLines,
    leaders: s.leaders,
    survey: s.survey,
  };
  return JSON.stringify(doc);
}

export function readProject(text: string): GeoLineProject | null {
  try {
    const doc = JSON.parse(text) as Partial<GeoLineProject>;
    if (doc.kind !== "geoline-project" || typeof doc.raw !== "string") return null;
    return doc as GeoLineProject;
  } catch {
    return null;
  }
}

export function applyProject(doc: GeoLineProject) {
  const book = useBook.getState();
  book.loadBook(doc.raw, doc.fileName || "fieldbook.csv", {
    remaps: doc.remaps,
    userLines: doc.userLines,
    leaders: doc.leaders,
    survey: doc.survey,
    order: doc.order,
  });
  if (doc.crsId) useBook.getState().setCrsId(doc.crsId);
}

export function projectFilename(fileName: string): string {
  const stem = (fileName || "fieldbook").replace(/\.[^.]+$/, "");
  return `${stem}.brk.json`;
}
