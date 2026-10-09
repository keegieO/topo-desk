import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { JobForm } from "@/components/job-form";
import { JobTicket } from "@/components/job-ticket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { rollupClients } from "@/lib/clients";
import { buildOrdPackage } from "@/lib/ord-package";
import { templateOf, useBook } from "@/lib/store";
import { downloadBlob } from "@/lib/utils";
import {
  useJobs,
  quoteJob,
  STATUS_LABEL,
  KIND_LABEL,
  INVOICE_LABEL,
  PIPE,
  type Job,
} from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { cn } from "@/lib/utils";

export function Desk() {
  const jobs = useJobs((s) => s.jobs);
  const activeId = useJobs((s) => s.activeId);
  const clearJobs = useJobs((s) => s.clearJobs);
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = PIPE.map((st) => ({ st, n: jobs.filter((j) => j.status === st).length }));
  const openValue = jobs.filter((j) => j.status !== "delivered").reduce((a, j) => a + quoteJob(j), 0);
  const ar = jobs.filter((j) => j.invoiceStatus === "sent").reduce((a, j) => a + quoteJob(j), 0);
  const weekHours = jobs.reduce((a, j) => a + j.timeLog.reduce((x, t) => x + t.hours, 0), 0);
  const clients = rollupClients(jobs);
  const dueSoon = useMemo(() => dueBoard(jobs), [jobs]);
  const utilization = useMemo(() => {
    const byKind: Record<string, number> = {};
    const byClient: Record<string, number> = {};
    let total = 0;
    let billable = 0;
    for (const job of jobs) {
      for (const t of job.timeLog) {
        byKind[t.kind] = (byKind[t.kind] ?? 0) + t.hours;
        byClient[job.client || "Unknown"] = (byClient[job.client || "Unknown"] ?? 0) + t.hours;
        total += t.hours;
        if (t.kind === "extract" || t.kind === "qa") billable += t.hours;
      }
    }
    return { byKind, byClient, total, billable, nonBillable: total - billable };
  }, [jobs]);
  const live = jobs.find((j) => j.id === activeId) ?? jobs[0];

  function packageLive() {
    const book = useBook.getState();
    if (!book.shots.length) {
      toast.error("No field book on the drawing");
      return;
    }
    const pack = buildOrdPackage({
      stem: book.fileName || live?.des || "fieldbook",
      shots: book.shots,
      remaps: book.remaps,
      userLines: book.userLines,
      order: book.order,
      template: templateOf(book.templateId),
      job: live,
      fileName: book.fileName || live?.des || "fieldbook",
      leaders: book.leaders,
      terrain: book.terrain,
    });
    downloadBlob(pack.filename, pack.blob);
    toast.success(pack.filename);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Desk</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {COMPANY.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {COMPANY.city} · {COMPANY.phone}
            {live ? ` · Des. ${live.des}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/extract">Open drawing</Link>
          </Button>
          <Button variant="outline" onClick={packageLive} disabled={!live}>
            ORD package
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {counts.map((c) => (
          <div key={c.st} className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="kicker">{STATUS_LABEL[c.st]}</p>
            <p className="mt-1 font-mono text-2xl tabular-nums">{c.n}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-2 sm:grid-cols-4">
        <Stat label="Open book" value={`$${openValue.toLocaleString("en-US")}`} />
        <Stat label="Open AR" value={`$${ar.toLocaleString("en-US")}`} />
        <Stat label="Hours logged" value={String(weekHours)} />
        <Stat label="Clients" value={String(clients.length)} />
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-medium">Due</h2>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dueSoon.length ? (
            dueSoon.map((job) => <DueCard key={job.id} job={job} />)
          ) : (
            <li className="text-sm text-muted-foreground">Nothing due in the next two weeks.</li>
          )}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-medium">Register</h2>
            {jobs.length ? (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (!window.confirm("Remove every ticket from the register?")) return;
                  clearJobs();
                  setOpenId(null);
                  toast.success("Register cleared");
                }}
              >
                Clear all
              </button>
            ) : null}
          </div>
          <ul className="flex flex-col gap-2">
            {jobs.length ? null : <li className="text-sm text-muted-foreground">No tickets. Add a job below.</li>}
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                active={job.id === activeId}
                expanded={job.id === openId}
                onToggle={() => setOpenId((id) => (id === job.id ? null : job.id))}
              />
            ))}
          </ul>
        </div>
        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="kicker">This job</p>
            {live ? (
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <Fact k="Status" v={STATUS_LABEL[live.status]} />
                <Fact k="CRS" v={live.crs} />
                <Fact k="Occupied" v={live.survey?.occupied || "—"} />
                <Fact k="Backsight" v={live.survey?.backsight || "—"} />
                <Fact k="Instrument" v={live.survey?.instrument || "—"} />
                <Fact k="Book" v={live.csvName || "—"} />
                <Fact k="Invoice" v={INVOICE_LABEL[live.invoiceStatus]} />
                <Fact k="Hours" v={String(live.timeLog.reduce((a, t) => a + t.hours, 0))} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No job on the register.</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="kicker">Clients</p>
            <ul className="mt-3 flex flex-col gap-2">
              {clients.map((c) => (
                <li key={c.name} className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate">{c.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.jobs.length}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link to="/billing">Billing</Link>
            </Button>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Utilization</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Total hours</p>
            <p className="mt-0.5 font-mono text-2xl tabular-nums">{utilization.total}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billable</p>
            <p className="mt-0.5 font-mono text-2xl tabular-nums text-ok">{utilization.billable}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Non-billable</p>
            <p className="mt-0.5 font-mono text-2xl tabular-nums">{utilization.nonBillable}</p>
          </div>
        </div>
        {utilization.total > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="kicker mt-0">By type</p>
              <ul className="mt-2 flex flex-col gap-1">
                {Object.entries(utilization.byKind).map(([k, h]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round((h / utilization.total) * 80)}px` }} />
                      <span className="text-xs text-muted-foreground capitalize">{k}</span>
                    </div>
                    <span className="font-mono text-xs tabular-nums">{h}h</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker mt-0">By client</p>
              <ul className="mt-2 flex flex-col gap-1">
                {Object.entries(utilization.byClient).sort((a,b) => b[1]-a[1]).slice(0,6).map(([c, h]) => (
                  <li key={c} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">{c}</span>
                    <span className="font-mono text-xs tabular-nums">{h}h</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {utilization.total === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">Log time on job tickets to see utilization.</p>
        )}
      </section>

      <JobForm kicker="New job" title="Add a job" blurb="" />
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate text-right font-mono text-xs">{v}</dd>
    </div>
  );
}

function dueBoard(jobs: Job[]): Job[] {
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);
  const hi = horizon.toISOString().slice(0, 10);
  return jobs
    .filter((j) => j.status !== "delivered" && j.due && j.due <= hi)
    .sort((a, b) => {
      const ao = a.due < today ? 0 : 1;
      const bo = b.due < today ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return a.due.localeCompare(b.due);
    });
}

function DueCard({ job }: { job: Job }) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = job.due < today;
  const setActive = useJobs((s) => s.setActive);
  const setStatus = useJobs((s) => s.setStatus);
  const navigate = useNavigate();

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Badge variant={overdue ? "bad" : job.rush ? "warn" : "outline"}>{overdue ? "Overdue" : job.due}</Badge>
        <Badge variant="muted">{STATUS_LABEL[job.status]}</Badge>
      </div>
      <p className="mt-2 text-sm font-medium">{job.name}</p>
      <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
        {job.client} · ${quoteJob(job).toLocaleString("en-US")}
      </p>
      <Button
        size="sm"
        className="mt-3"
        onClick={() => {
          setActive(job.id);
          loadJobBook(job);
          if (job.status === "intake") setStatus(job.id, "extract");
          void navigate({ to: "/extract" });
          toast.success(`Opened ${job.des || job.name}`);
        }}
      >
        Open
      </Button>
    </li>
  );
}

function JobRow({
  job,
  active,
  expanded,
  onToggle,
}: {
  job: Job;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const setActive = useJobs((s) => s.setActive);
  const setStatus = useJobs((s) => s.setStatus);
  const navigate = useNavigate();
  const money = quoteJob(job);
  const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);
  const removeJob = useJobs((s) => s.removeJob);

  function openExtract() {
    setActive(job.id);
    loadJobBook(job);
    if (job.status === "intake") setStatus(job.id, "extract");
    void navigate({ to: "/extract" });
    toast.success(`Opened ${job.des || job.name}`);
  }

  return (
    <li className={cn("rounded-lg border bg-card p-4", active ? "border-primary" : "border-border")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button type="button" onClick={onToggle} className="min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{job.name}</p>
            <Badge variant={job.status === "delivered" ? "ok" : job.status === "qa" ? "warn" : "outline"}>
              {STATUS_LABEL[job.status]}
            </Badge>
            <Badge variant="muted">{KIND_LABEL[job.kind]}</Badge>
            {job.rush ? <Badge variant="bad">Rush</Badge> : null}
            {job.invoiceStatus !== "none" ? <Badge variant="outline">{INVOICE_LABEL[job.invoiceStatus]}</Badge> : null}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Des. {job.des || "—"} · {job.client} · {job.county} Co. · due {job.due || "—"}
            {logged ? ` · ${logged}h` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{job.notes}</p>
        </button>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <p className="font-mono text-sm">${money.toLocaleString("en-US")}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={openExtract}>
              Extract
            </Button>
            <Button size="sm" variant="outline" onClick={onToggle}>
              {expanded ? "Close ticket" : "Ticket"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                removeJob(job.id);
                toast.success(`Removed ${job.des || job.name}`);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
      {expanded ? <JobTicket job={job} /> : null}
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="kicker">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">{value}</p>
    </div>
  );
}
