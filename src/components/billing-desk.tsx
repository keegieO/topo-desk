import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useJobs,
  quoteJob,
  invoiceNumber,
  INVOICE_LABEL,
  KIND_LABEL,
  type Job,
  type InvoiceStatus,
} from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { rollupClients, invoiceAging, FIRM_KIND } from "@/lib/clients";
import { COMPANY } from "@/lib/company";
import { getRates } from "@/lib/firm";
import { htmlInvoice, htmlProposal } from "@/lib/paper";
import { printHtml } from "@/lib/print";

export function BillingDesk() {
  const jobs = useJobs((s) => s.jobs);
  const setInvoice = useJobs((s) => s.setInvoice);
  const setActive = useJobs((s) => s.setActive);
  const rates = getRates();
  const billed = jobs.filter((j) => j.invoiceStatus !== "none");
  const ar = billed.filter((j) => j.invoiceStatus === "sent").reduce((a, j) => a + quoteJob(j), 0);
  const paid = billed.filter((j) => j.invoiceStatus === "paid").reduce((a, j) => a + quoteJob(j), 0);
  const draft = billed.filter((j) => j.invoiceStatus === "draft").reduce((a, j) => a + quoteJob(j), 0);
  const clients = rollupClients(jobs);

  const rows = [...jobs].sort((a, b) => (b.due || "").localeCompare(a.due || ""));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="kicker">Billing</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">Invoices and clients</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Quotes become invoices when a job is ready. Print to PDF. {COMPANY.terms}. Payable to {COMPANY.legal}.
        </p>
      </section>

      <section className="grid gap-2 sm:grid-cols-3">
        <Stat k="Open AR" v={`$${ar.toLocaleString("en-US")}`} />
        <Stat k="Draft" v={`$${draft.toLocaleString("en-US")}`} />
        <Stat k="Paid" v={`$${paid.toLocaleString("en-US")}`} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium">Invoices</h2>
          <p className="text-xs text-muted-foreground">Draft → send → paid. Print is the invoice the PM files.</p>
        </div>
        <ul className="flex flex-col gap-2">
          {rows.map((job) => (
            <InvoiceRow key={job.id} job={job} onStatus={(st) => setInvoice(job.id, st)} onActive={() => setActive(job.id)} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium">Clients</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {clients.map((c) => (
            <li key={c.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                    {c.firm ? `${FIRM_KIND[c.firm.kind]} · ${c.firm.city}` : "New client"}
                  </p>
                </div>
                <Badge variant="muted">{c.jobs.length} jobs</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
                <div>
                  <dt className="text-muted-foreground">Open</dt>
                  <dd>${c.open.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AR</dt>
                  <dd>${c.ar.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd>${c.paid.toLocaleString("en-US")}</dd>
                </div>
              </dl>
              {c.firm ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.firm.pm} · {c.firm.email}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Rate card</p>
        <dl className="mt-3 flex flex-col gap-1.5 font-mono text-sm">
          <Row k="Conventional reduction" v={`$${rates.conventionalHr}/hr`} />
          <Row k="INDOT coding + ORD book" v={`$${rates.codingJob}/job`} />
          <Row k="Rush" v="1.35×" />
          <Row k="Terms" v={COMPANY.terms} />
        </dl>
      </section>
    </div>
  );
}

function InvoiceRow({
  job,
  onStatus,
  onActive,
}: {
  job: Job;
  onStatus: (st: InvoiceStatus) => void;
  onActive: () => void;
}) {
  const money = quoteJob(job);
  const no = invoiceNumber(job);

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm">{no}</p>
            <Badge
              variant={
                job.invoiceStatus === "paid" ? "ok" : job.invoiceStatus === "sent" ? "warn" : "outline"
              }
            >
              {INVOICE_LABEL[job.invoiceStatus]}
            </Badge>
            <Badge variant="muted">{KIND_LABEL[job.kind]}</Badge>
          </div>
          <p className="mt-1 text-sm">{job.name}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {job.client} · Des. {job.des || "—"} · due {job.due || "—"}
            {job.invoiceStatus === "sent" ? ` · aging ${invoiceAging(job.invoiceStatus, job.sentAt)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <p className="font-mono text-sm">${money.toLocaleString("en-US")}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => printHtml(no, htmlInvoice(job))}>
              Invoice
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job))}
            >
              Proposal
            </Button>
            {job.invoiceStatus === "none" ? (
              <Button size="sm" onClick={() => onStatus("draft")}>
                Draft
              </Button>
            ) : null}
            {job.invoiceStatus === "draft" ? (
              <Button size="sm" onClick={() => onStatus("sent")}>
                Mark sent
              </Button>
            ) : null}
            {job.invoiceStatus === "sent" ? (
              <Button size="sm" onClick={() => onStatus("paid")}>
                Mark paid
              </Button>
            ) : null}
            <Button size="sm" variant="outline" asChild>
              <Link
                to="/deliver"
                onClick={() => {
                  onActive();
                  loadJobBook(job);
                }}
              >
                Package
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="kicker">{k}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">{v}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
