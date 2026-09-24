import { SAMPLE_CSV, SAMPLE_NAME } from "./sample";
import { useBook } from "./store";
import type { Job } from "./jobs";
import { findIngcsZone, ingcsById } from "./ingcs";
import { useJobs } from "./jobs";

export function loadJobBook(job: Job) {
  const text = job.csvText ?? (job.csvName === SAMPLE_NAME || job.des === "2501384" ? SAMPLE_CSV : undefined);
  const name = job.csvName ?? (text ? SAMPLE_NAME : undefined);
  if (text && name) {
    useBook.getState().loadBook(text, name, {
      remaps: job.remaps,
      userLines: job.userLines,
      leaders: job.leaders,
      survey: job.survey,
      order: job.coordOrder,
    });
    if (job.crsId) useBook.getState().setCrsId(job.crsId);
    else {
      const zone = findIngcsZone(job.county) ?? findIngcsZone(job.crs);
      if (zone) useBook.getState().setCrsId(`ingcs:${zone.id}`);
    }
  } else if (!text) {
    useBook.getState().clear();
    const zone = findIngcsZone(job.county) ?? findIngcsZone(job.crs);
    if (zone) useBook.getState().setCrsId(`ingcs:${zone.id}`);
  }
}

export function saveActiveDrawing(): boolean {
  const id = useJobs.getState().activeId;
  if (!id) return false;
  const book = useBook.getState();
  const zone = ingcsById(book.crsId) ?? findIngcsZone(book.crsId);
  useJobs.getState().updateJob(id, {
    csvText: book.raw,
    csvName: book.fileName || undefined,
    remaps: book.remaps,
    userLines: book.userLines,
    leaders: book.leaders,
    coordOrder: book.order,
    crsId: book.crsId,
    survey: book.survey,
    ...(zone
      ? { county: zone.name, crs: `${zone.name} County InGCS — NAD 1983 (2011)` }
      : {}),
    ...(book.fileName
      ? { files: [{ name: book.fileName, kind: "csv", size: book.raw.length }] }
      : {}),
  });
  return true;
}