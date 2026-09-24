import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace";
import { useJobs } from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { useBook } from "@/lib/store";

export const Route = createFileRoute("/extract")({ component: ExtractPage });

function ExtractPage() {
  const activeId = useJobs((s) => s.activeId);
  const jobs = useJobs((s) => s.jobs);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    const job = jobs.find((j) => j.id === activeId) ?? (jobs.length === 1 ? jobs[0] : undefined);
    if (!job?.csvText) return;
    booted.current = true;
    const book = useBook.getState();
    const lines = job.userLines?.length ?? 0;
    if (book.raw !== job.csvText || book.userLines.length !== lines) loadJobBook(job);
  }, [activeId, jobs]);

  return <Workspace />;
}
