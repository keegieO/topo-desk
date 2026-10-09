import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import {
  useJobs,
  quoteJob,
  quoteLines,
  invoiceNumber,
  KIND_LABEL,
  STATUS_LABEL,
  INVOICE_LABEL,
  TIME_LABEL,
  PIPE,
  type Job,
  type JobStatus,
  type TimeKind,
  type InvoiceStatus,
} from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { htmlInvoice, htmlProposal, htmlSow } from "@/lib/paper";
import { printHtml } from "@/lib/print";

export function JobTicket({ job }: { job: Job }) {
  const setStatus = useJobs((s) => s.setStatus);
  const setInvoice = useJobs((s) => s.setInvoice);
  const addTime = useJobs((s) => s.addTime);
  const updateJob = useJobs((s) => s.updateJob);
  const setActive = useJobs((s) => s.setActive);
  const addChangeOrder = useJobs((s) => s.addChangeOrder);
  const navigate = useNavigate();
  const money = quoteJob(job);
  const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);
  const lines = quoteLines(job);

  function openExtract() {
    setActive(job.id);
    loadJobBook(job);
    if (job.status === "intake") setStatus(job.id, "extract");
    void navigate({ to: "/extract" });
    toast.success(`Opened ${job.des || job.name}`);
  }

  function draftEmail() {
    const subject = encodeURIComponent(`[GeoLine Solutions] ${job.des ? `Des. ${job.des} — ` : ""}${job.name} — Files Ready`);
    const body = encodeURIComponent(
      `Hi ${job.pm || job.client || "PM"},\n\n` +
      `Your extraction package is ready for Des. ${job.des || job.name}.\n\n` +
      `Deliverables in this package:\n` +
      `— Labeled PNEZD field book (ORD format)\n` +
      `— DXF linework (INDOT coded)\n` +
      `— LandXML surface\n` +
      `— Control point CSV\n` +
      `— Extraction transmittal (PDF)\n\n` +
      `Invoice ${invoiceNumber(job)} is attached. Terms net 30.\n\n` +
      `Please review and confirm receipt.\n\n` +
      `Thanks,\nGeoLine Solutions\n`
    );
    const to = job.email ? encodeURIComponent(job.email) : "";
    window.open(`mailto:${to}?subject=${subject}&body=${body}`);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{job.notes || "No scope notes."}</p>
          <TicketNotes job={job} />
          <TimeLog job={job} onAdd={(e) => addTime(job.id, e)} />
          <ChangeOrders job={job} onAdd={(co) => addChangeOrder(job.id, co)} />
        </div>
        <aside className="flex flex-col gap-3">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="kicker">Quote</p>
            <p className="mt-1 font-mono text-xl tabular-nums">${money.toLocaleString("en-US")}</p>
            <ul className="mt-2 flex flex-col gap-1 font-mono text-[0.6875rem] text-muted-foreground">
              {lines.map((l, i) => (
                <li key={`${l.desc}-${i}`} className="flex justify-between gap-2">
                  <span className="truncate">{l.desc}</span>
                  <span>${Math.round(l.amount).toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-2 gap-2 font-mono text-[0.6875rem]">
            <Meta k="PM" v={job.pm || "—"} />
            <Meta k="Hours logged" v={`${logged}`} />
            <Meta k="CRS" v={job.crs} span />
            <Meta k="Invoice" v={`${invoiceNumber(job)} · ${INVOICE_LABEL[job.invoiceStatus]}`} span />
          </dl>
          {job.files.length ? (
            <ul className="font-mono text-[0.6875rem] text-muted-foreground">
              {job.files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No files logged. Drop a PNEZD on the job form.</p>
          )}
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={openExtract}>
          Extract
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link
            to="/deliver"
            onClick={() => {
              setActive(job.id);
              loadJobBook(job);
            }}
          >
            Package
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={draftEmail}
        >
          Draft email
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/billing" onClick={() => setActive(job.id)}>
            Billing
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job))}
        >
          Proposal
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => printHtml(`Work order ${job.des || job.name}`, htmlSow(job))}
        >
          Work order
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => printHtml(invoiceNumber(job), htmlInvoice(job))}
        >
          Invoice
        </Button>
        <NativeSelect
          className="h-8 w-40 text-xs"
          value={job.status}
          onChange={(e) => setStatus(job.id, e.target.value as JobStatus)}
        >
          {PIPE.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABEL[st]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          className="h-8 w-36 text-xs"
          value={job.invoiceStatus}
          onChange={(e) => setInvoice(job.id, e.target.value as InvoiceStatus)}
        >
          {(["none", "draft", "sent", "paid"] as const).map((st) => (
            <option key={st} value={st}>
              {INVOICE_LABEL[st]}
            </option>
          ))}
        </NativeSelect>
        <Badge variant="muted">{KIND_LABEL[job.kind]}</Badge>
      </div>
      <button
        type="button"
        className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => updateJob(job.id, { status: "delivered" })}
      >
        Mark delivered
      </button>
    </div>
  );
}

function TicketNotes({ job }: { job: Job }) {
  const updateJob = useJobs((s) => s.updateJob);
  const [text, setText] = useState(job.ticket);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`ticket-${job.id}`}>Ticket</Label>
      <textarea
        id={`ticket-${job.id}`}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text !== job.ticket) updateJob(job.id, { ticket: text });
        }}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="Classification notes, hold points, remap decisions…"
      />
    </div>
  );
}

function TimeLog({
  job,
  onAdd,
}: {
  job: Job;
  onAdd: (e: { date: string; hours: number; kind: TimeKind; note: string }) => void;
}) {
  const [kind, setKind] = useState<TimeKind>("extract");
  const [hours, setHours] = useState("2");
  const [note, setNote] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: FormEvent) {
    e.preventDefault();
    const h = Number(hours);
    if (!h) {
      toast.error("Hours required");
      return;
    }
    onAdd({ date: today, hours: h, kind, note: note.trim() });
    setNote("");
    toast.success("Time logged");
  }

  return (
    <div>
      <p className="kicker">Time log</p>
      {job.timeLog.length ? (
        <ul className="mt-2 flex flex-col gap-1 font-mono text-xs">
          {job.timeLog.map((t) => (
            <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2">
              <span>
                {t.date} · {TIME_LABEL[t.kind]} · {t.hours}h
              </span>
              <span className="text-muted-foreground">{t.note || "—"}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() =>
                  useJobs.getState().updateJob(job.id, { timeLog: job.timeLog.filter((x) => x.id !== t.id) })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No hours yet.</p>
      )}
      <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-[7rem_6rem_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`kind-${job.id}`}>Kind</Label>
          <NativeSelect id={`kind-${job.id}`} value={kind} onChange={(e) => setKind(e.target.value as TimeKind)}>
            <option value="extract">Extract</option>
            <option value="qa">QA</option>
            <option value="office">Office</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`hrs-${job.id}`}>Hours</Label>
          <Input id={`hrs-${job.id}`} value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`note-${job.id}`}>Note</Label>
          <Input id={`note-${job.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="EP through the intersection" />
        </div>
        <Button type="submit" size="sm" variant="secondary">
          Log
        </Button>
      </form>
    </div>
  );
}

function ChangeOrders({
  job,
  onAdd,
}: {
  job: Job;
  onAdd: (co: { date: string; desc: string; amount: number }) => void;
}) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!desc.trim() || !Number.isFinite(n) || n === 0) {
      toast.error("Change order needs a description and amount");
      return;
    }
    onAdd({ date: today, desc: desc.trim(), amount: n });
    setDesc("");
    setAmount("");
    toast.success("Change order on the quote");
  }

  return (
    <div>
      <p className="kicker">Change orders</p>
      {job.changeOrders?.length ? (
        <ul className="mt-2 flex flex-col gap-1 font-mono text-xs">
          {job.changeOrders.map((c) => (
            <li key={c.id} className="flex justify-between gap-2">
              <span>
                {c.date} · {c.desc}
              </span>
              <span>${c.amount.toLocaleString("en-US")}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() =>
                  useJobs.getState().updateJob(job.id, {
                    changeOrders: (job.changeOrders ?? []).filter((x) => x.id !== c.id),
                  })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No extras yet. Extra miles or tiles go here before the work starts.</p>
      )}
      <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`co-desc-${job.id}`}>Description</Label>
          <Input
            id={`co-desc-${job.id}`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Extra 0.2 mi south of limits"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`co-amt-${job.id}`}>Amount</Label>
          <Input id={`co-amt-${job.id}`} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        </div>
        <Button type="submit" size="sm" variant="secondary">
          Add CO
        </Button>
      </form>
    </div>
  );
}

function Meta({ k, v, span }: { k: string; v: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2 min-w-0" : "min-w-0"}>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate">{v}</dd>
    </div>
  );
}
