import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { FirmShell } from "@/components/firm-shell";
import {
  useJobs,
  quoteJob,
  STATUS_LABEL,
  KIND_LABEL,
  PIPE,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board")({
  component: Board,
});

function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  const { setActive, setStatus } = useJobs();
  const quote = quoteJob(job);

  function handleCardClick() {
    setActive(job.id);
    loadJobBook(job);
    void navigate({ to: "/extract" });
    toast.success(`Opened ${job.name}`);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as JobStatus;
    setStatus(job.id, next);
    toast.success("Updated");
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors",
        )}
        onClick={handleCardClick}
      >
        <p className="font-medium text-sm leading-snug mb-1">{job.name}</p>
        <p className="font-mono text-xs text-muted-foreground mb-2 leading-relaxed">
          {[job.des, job.client, job.county].filter(Boolean).join(" · ")}
        </p>
        {quote > 0 && (
          <p className="font-mono text-sm mb-2">
            ${quote.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge variant="muted" className="text-xs">
            {STATUS_LABEL[job.status]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {KIND_LABEL[job.kind]}
          </Badge>
          {job.rush && (
            <Badge variant="bad" className="text-xs">
              Rush
            </Badge>
          )}
        </div>
      </div>
      <NativeSelect
        value={job.status}
        onChange={handleStatusChange}
        className="w-full h-8 text-xs px-2"
        onClick={(e) => e.stopPropagation()}
      >
        {PIPE.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function Board() {
  const { jobs } = useJobs();

  const pipelineValue = jobs
    .filter((j) => j.status !== "delivered")
    .reduce((sum, j) => sum + quoteJob(j), 0);

  return (
    <FirmShell>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <p className="kicker">Pipeline</p>
            <h1 className="text-2xl font-semibold tracking-tight">Job Board</h1>
          </div>
          {pipelineValue > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Pipeline Value
              </p>
              <p className="font-mono text-lg font-semibold">
                ${pipelineValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        <div
          className="overflow-x-auto pb-4"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(200px, 1fr))", gap: "1rem" }}
        >
          {PIPE.map((status) => {
            const col = jobs.filter((j) => j.status === status);
            return (
              <div key={status} className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="kicker text-xs">{STATUS_LABEL[status]}</span>
                  <Badge variant="muted" className="text-xs h-5 px-1.5">
                    {col.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {col.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nothing here</p>
                  ) : (
                    col.map((job) => <JobCard key={job.id} job={job} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FirmShell>
  );
}
