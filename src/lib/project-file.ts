import type { UserLine } from "./chains";
import type { CoordOrder } from "./csv";
import type { Leader } from "./notes";
import type { SurveyMeta } from "./job-types";
import { useBook } from "./store";

export type BreaklineProject = {
  kind: "breakline-project";
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
  const doc: BreaklineProject = {
    kind: "breakline-project",
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

export function readProject(text: string): BreaklineProject | null {
  try {
    const doc = JSON.parse(text) as Partial<BreaklineProject>;
    if (doc.kind !== "breakline-project" || typeof doc.raw !== "string") return null;
    return doc as BreaklineProject;
  } catch {
    return null;
  }
}

export function applyProject(doc: BreaklineProject) {
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
