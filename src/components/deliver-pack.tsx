import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBook, templateOf } from "@/lib/store";
import { useJobs, KIND_LABEL, STATUS_LABEL, invoiceNumber, INVOICE_LABEL } from "@/lib/jobs";
import { loadJobBook } from "@/lib/open-job";
import { resolveFeature } from "@/lib/label";
import { buildExport } from "@/lib/export";
import { allChains, buildControlCsv, buildDxf, buildLandXml, cadFilenames } from "@/lib/cad-export";
import { chainVertices, extractsAsShots } from "@/lib/chains";
import { htmlInvoice, htmlProposal, htmlSow, htmlTransmittal, htmlQaReport, htmlControlReport } from "@/lib/paper";
import { projectAlignment, staOffCsv } from "@/lib/align";
import { htmlPlotSheet } from "@/lib/sheet";
import { openDocument, printHtml } from "@/lib/print";
import { scopeStatus } from "@/lib/scope";
import { downloadBlob, downloadText } from "@/lib/utils";
import { buildOrdPackage } from "@/lib/ord-package";
import { useFirm } from "@/lib/firm";
import { runQa } from "@/lib/qa";

export function DeliverPack() {
  const jobs = useJobs((s) => s.jobs);
  const activeId = useJobs((s) => s.activeId);
  const setStatus = useJobs((s) => s.setStatus);
  const setInvoice = useJobs((s) => s.setInvoice);
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const order = useBook((s) => s.order);
  const fileName = useBook((s) => s.fileName);
  const templateId = useBook((s) => s.templateId);
  const userLines = useBook((s) => s.userLines);
  const leaders = useBook((s) => s.leaders);

  const job = jobs.find((j) => j.id === activeId) ?? jobs[0];
  const firm = useFirm();

  const stats = useMemo(() => {
    const codes = new Set<string>();
    let matched = 0;
    const unmatched = new Map<string, number>();
    for (const s of shots) {
      codes.add(s.codeToken.toUpperCase());
      const f = resolveFeature(s, remaps);
      if (f) matched += 1;
      else unmatched.set((s.codeToken || "?").toUpperCase(), (unmatched.get((s.codeToken || "?").toUpperCase()) ?? 0) + 1);
    }
    const scope = scopeStatus(codes);
    const req = scope.filter((x) => x.required);
    return {
      matched,
      unmatched: shots.length - matched,
      unmatchedCodes: [...unmatched.entries()],
      scope,
      reqDone: req.filter((x) => x.done).length,
      req: req.length,
    };
  }, [shots, remaps]);

  const chains = useMemo(() => allChains(shots, remaps, userLines), [shots, remaps, userLines]);
  const qa = useMemo(() => runQa(shots, remaps, userLines), [shots, remaps, userLines]);
  const align = useMemo(
    () => projectAlignment(shots, chains.map((c) => ({ code: c.code, pts: chainVertices(c) }))),
    [shots, chains],
  );

  useEffect(() => {
    if (!job?.csvText) return;
    const book = useBook.getState();
    if (book.fileName === job.csvName && book.shots.length) return;
    loadJobBook(job);
  }, [job]);

  function stem() {
    return fileName || job?.des || "fieldbook";
  }

  function dl(kind: "fieldbook" | "labeled-ord" | "full") {
    if (!shots.length) {
      toast.error("No shots — open the job in Extract first");
      return;
    }
    const extra = extractsAsShots(userLines);
    const { filename, csv } = buildExport({
      shots: [...shots, ...extra],
      remaps,
      kind,
      template: templateOf(templateId),
      order,
      fileName: stem(),
    });
    downloadText(filename, csv);
    toast.success(filename);
  }

  function dlDxf() {
    if (!shots.length && !userLines.length) {
      toast.error("No linework");
      return;
    }
    const names = cadFilenames(stem());
    downloadText(names.dxf, buildDxf({ shots, chains, leaders }), "application/dxf;charset=utf-8");
    toast.success(names.dxf);
  }

  function dlXml() {
    if (!job) return;
    const names = cadFilenames(stem());
    downloadText(
      names.xml,
      buildLandXml({
        shots,
        chains,
        remaps,
        project: job.name,
        crs: job.crs,
        terrain: useBook.getState().terrain,
      }),
      "application/xml;charset=utf-8",
    );
    toast.success(names.xml);
  }

  function dlControl() {
    const names = cadFilenames(stem());
    downloadText(names.control, buildControlCsv(shots));
    toast.success(names.control);
  }

  function openSheet() {
    if (!shots.length) {
      toast.error("No field book");
      return;
    }
    openDocument(
      `${job?.des || "plan"}_plan_sheet.html`,
      htmlPlotSheet({
        title: job?.name || fileName || "Plan",
        des: job?.des || "",
        client: job?.client || "",
        county: job?.county || "",
        crs: job?.crs || "",
        date: job?.survey?.date || "",
        firm: firm.legal,
        align,
        shots,
        chains,
        leaders,
        contours: useBook.getState().terrain?.contours,
      }),
    );
  }

  function printQa() {
    if (!shots.length) {
      toast.error("No field book");
      return;
    }
    printHtml(`${job?.des || "job"}_qa_report`, htmlQaReport(job!, qa, shots));
  }

  function printControl() {
    if (!shots.length) {
      toast.error("No field book");
      return;
    }
    printHtml(`${job?.des || "job"}_control_report`, htmlControlReport(job!, shots));
  }

  function dlSta() {
    if (!shots.length) {
      toast.error("No field book");
      return;
    }
    const name = `${stem()}_station_offset.csv`;
    downloadText(name, staOffCsv(shots, align));
    toast.success(name);
  }

  function packageAll() {
    if (!shots.length && !userLines.length) {
      toast.error("No field book on this job");
      return;
    }
    const pack = buildOrdPackage({
      stem: stem(),
      shots,
      remaps,
      userLines,
      order,
      template: templateOf(templateId),
      job,
      fileName: fileName || stem(),
      leaders,
      terrain: useBook.getState().terrain,
    });
    downloadBlob(pack.filename, pack.blob);
    toast.success(pack.filename);
  }

  if (!job) {
    return <p className="text-sm text-muted-foreground">No jobs on the desk.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="kicker">Deliver</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">{job.name}</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Des. {job.des || "—"} · {job.client} · {KIND_LABEL[job.kind]} · {STATUS_LABEL[job.status]} ·{" "}
          {INVOICE_LABEL[job.invoiceStatus]}
          {align ? ` · Align ${align.name}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={packageAll} disabled={!shots.length && !userLines.length}>
            <Download />
            ORD package
          </Button>
          <Button variant="outline" onClick={openSheet} disabled={!shots.length}>
            Plan sheet
          </Button>
          <Button variant="outline" onClick={dlSta} disabled={!shots.length}>
            Station / offset
          </Button>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-4">
        <Tile k="Shots" v={shots.length} />
        <Tile k="Matched" v={stats.matched} ok />
        <Tile k="Unmatched" v={stats.unmatched} bad={stats.unmatched > 0} />
        <Tile k="Strings" v={chains.length} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="kicker">INDOT topo checklist</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {stats.scope.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">{s.label}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{s.codes.join(", ")}</span>
                </span>
                {s.done ? (
                  <Badge variant="ok">In</Badge>
                ) : s.required ? (
                  <Badge variant="bad">Gap</Badge>
                ) : (
                  <Badge variant="muted">Optional</Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="kicker">QA</p>
            <ul className="mt-3 flex flex-col gap-1.5 font-mono text-sm">
              <li className="flex justify-between">
                <span>Errors</span>
                <span className={qa.errors ? "text-destructive" : "text-ok"}>{qa.errors}</span>
              </li>
              <li className="flex justify-between">
                <span>Warnings</span>
                <span className={qa.warns ? "text-warn" : ""}>{qa.warns}</span>
              </li>
              <li className="flex justify-between">
                <span>Info</span>
                <span>{qa.infos}</span>
              </li>
            </ul>
          </div>
          {stats.unmatchedCodes.length ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="kicker">Hold for remap</p>
              <ul className="mt-2 font-mono text-sm">
                {stats.unmatchedCodes.map(([c, n]) => (
                  <li key={c}>
                    {c} · {n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Files</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={dlDxf} disabled={!shots.length && !userLines.length}>
            <Download />
            DXF
          </Button>
          <Button onClick={dlXml} disabled={!shots.length && !userLines.length}>
            <Download />
            LandXML
          </Button>
          <Button variant="secondary" onClick={() => dl("fieldbook")} disabled={!shots.length}>
            <Download />
            ORD field book
          </Button>
          <Button variant="secondary" onClick={() => dl("labeled-ord")} disabled={!shots.length}>
            <Download />
            Labeled PNEZD
          </Button>
          <Button variant="outline" onClick={() => dl("full")} disabled={!shots.length}>
            <Download />
            Workbook
          </Button>
          <Button variant="outline" onClick={dlControl} disabled={!shots.length}>
            <Download />
            Control
          </Button>
          <Button variant="outline" onClick={dlSta} disabled={!shots.length}>
            <Download />
            Station CSV
          </Button>
          <Button variant="outline" onClick={openSheet} disabled={!shots.length}>
            Plan sheet
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Paper</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job))}>
            Proposal
          </Button>
          <Button variant="outline" onClick={() => printHtml(`Work order ${job.des || job.name}`, htmlSow(job))}>
            Work order
          </Button>
          <Button
            variant="outline"
            onClick={() => printHtml(`${job.des || "job"} transmittal`, htmlTransmittal({ job, shots, remaps }))}
          >
            Transmittal
          </Button>
          <Button
            variant="outline"
            onClick={printQa}
            disabled={!shots.length}
          >
            QA report
          </Button>
          <Button
            variant="outline"
            onClick={printControl}
            disabled={!shots.length}
          >
            Control report
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (job.invoiceStatus === "none") setInvoice(job.id, "draft");
              const latest = useJobs.getState().jobs.find((j) => j.id === job.id) ?? job;
              printHtml(invoiceNumber(latest), htmlInvoice(latest));
            }}
          >
            Invoice
          </Button>
          <Button onClick={packageAll} disabled={!shots.length && !userLines.length}>
            ORD package
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setStatus(job.id, "delivered");
              if (job.invoiceStatus === "none" || job.invoiceStatus === "draft") setInvoice(job.id, "sent");
              toast.success("Marked delivered");
            }}
          >
            Mark delivered
          </Button>
        </div>
        <p className="mt-3 font-mono text-[0.6875rem] text-muted-foreground">
          {firm.legal} · {firm.city}, {firm.state} · {firm.email} · {invoiceNumber(job)} · {chains.length} strings
        </p>
      </section>
    </div>
  );
}

function Tile({ k, v, ok, bad }: { k: string; v: string | number; ok?: boolean; bad?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="kicker">{k}</p>
      <p className={`mt-1 font-mono text-2xl tabular-nums ${ok ? "text-ok" : bad ? "text-destructive" : ""}`}>{v}</p>
    </div>
  );
}
