import { useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle, usePanelRef } from "react-resizable-panels";
import { KeyIn } from "@/components/key-in";
import { Ribbon } from "@/components/ribbon";
import { SurveyExplorer } from "@/components/survey-explorer";
import { SurveyDock } from "@/components/survey-dock";
import { PlanMap } from "@/components/plan-map";
import { PointsTable } from "@/components/points-table";
import { FeaturePicker } from "@/components/feature-picker";
import { Badge } from "@/components/ui/badge";
import { AccountGate } from "@/components/account-gate";
import { AuthSlot } from "@/components/auth-slot";
import { useBook } from "@/lib/store";
import { resolveFeature } from "@/lib/label";
import { formatOffset, projectAlignment } from "@/lib/align";
import { chainVertices } from "@/lib/chains";
import { allChains } from "@/lib/cad-export";
import { formatStation, stationOffset } from "@/lib/cogo";
import { detectGeoOrigin, formatLatLon, gridUnit, SR67_SITE } from "@/lib/geo";
import { COMPANY } from "@/lib/company";
import { useJobs } from "@/lib/jobs";
import { lookupCode } from "@/lib/catalog";
import { applyProject, readProject } from "@/lib/project-file";
import { ingestFiles } from "@/lib/files";
import { runQa } from "@/lib/qa";
import { cn } from "@/lib/utils";

const TOOL_PROMPT: Record<string, string> = {
  select: "Element Selection",
  move: "Move Element",
  line: "Place SmartLine",
  shape: "Place Shape",
  recode: "Recode Feature",
  place: "Place Point",
  measure: "Measure Distance",
  inverse: "Inverse — click two points",
  offset: "Offset — click an extract line",
  join: "Join — click two extract lines",
  split: "Split — click a vertex",
};

export async function openSurveyFiles(fileList: FileList | File[] | null, append = false) {
  if (!fileList || (fileList as FileList).length === 0) return;
  const files = Array.from(fileList as ArrayLike<File>);
  const rest: File[] = [];
  for (const file of files) {
    if (/\.json$/i.test(file.name)) {
      const text = await file.text();
      const doc = readProject(text);
      if (doc) {
        applyProject(doc);
        toast.success(`Opened ${doc.fileName || file.name}`);
        continue;
      }
      toast.error(`${file.name} is not a GeoLine Solutions file`);
      continue;
    }
    rest.push(file);
  }
  if (!rest.length) return;
  const result = await ingestFiles(rest, append);
  const st = useBook.getState();
  if (result.csv) {
    if (append && st.shots.length) {
      const { added, warnings } = st.appendText(result.csv.raw, result.csv.name);
      toast.success(`Appended ${added} shots`);
      for (const w of warnings) toast.message(w);
    } else {
      st.loadText(result.csv.raw, result.csv.name);
      const n = useBook.getState().shots.length;
      const skip = useBook.getState().skipped;
      toast.success(`Loaded ${n} shots${skip ? ` · ${skip} skipped` : ""}`);
    }
  }
  for (const err of result.errors) toast.error(err);
  for (const w of result.warnings) toast.message(w);
}

export function Workspace() {
  return (
    <AccountGate>
      <CadShell />
    </AccountGate>
  );
}

function CadShell() {
  const shots = useBook((s) => s.shots);
  const fileName = useBook((s) => s.fileName);
  const skipped = useBook((s) => s.skipped);
  const remaps = useBook((s) => s.remaps);
  const userLines = useBook((s) => s.userLines);
  const leftOpen = useBook((s) => s.leftOpen);
  const rightOpen = useBook((s) => s.rightOpen);
  const shotsOpen = useBook((s) => s.shotsOpen);
  const setLeftOpen = useBook((s) => s.setLeftOpen);
  const setRightOpen = useBook((s) => s.setRightOpen);
  const setRemap = useBook((s) => s.setRemap);
  const filter = useBook((s) => s.filter);
  const setFilter = useBook((s) => s.setFilter);
  const tool = useBook((s) => s.tool);
  const activeCode = useBook((s) => s.activeCode);
  const cursor = useBook((s) => s.cursor);
  const selectedUid = useBook((s) => s.selectedUid);
  const draft = useBook((s) => s.draft);
  const survey = useBook((s) => s.survey);
  const raw = useBook((s) => s.raw);
  const crsId = useBook((s) => s.crsId);
  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  const origin = useMemo(
    () => detectGeoOrigin(shots, { crsId, county: job?.county, crs: job?.crs, fileName }),
    [shots, crsId, job?.county, job?.crs, fileName],
  );
  const [remapOpen, setRemapOpen] = useState(false);
  const [isMd, setIsMd] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const codesRef = usePanelRef();
  const levelsRef = usePanelRef();
  const qa = useMemo(() => runQa(shots, remaps, userLines, skipped), [shots, remaps, userLines, skipped]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsMd(mq.matches);
      if (!mq.matches) {
        useBook.getState().setLeftOpen(false);
        useBook.getState().setRightOpen(false);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMd) return;
    if (leftOpen) codesRef.current?.expand();
    else codesRef.current?.collapse();
  }, [leftOpen, isMd, codesRef]);

  useEffect(() => {
    if (!isMd) return;
    if (rightOpen) levelsRef.current?.expand();
    else levelsRef.current?.collapse();
  }, [rightOpen, isMd, levelsRef]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const url = (e as CustomEvent<{ url?: string }>).detail?.url;
      if (!url) return;
      void (async () => {
        setBusy("Reading file…");
        try {
          const name = url.split("/").pop() || "file";
          if (/\.(las|laz)$/i.test(name)) {
            toast.error("LiDAR is parked. Open a PNEZD / CSV field book.");
            return;
          }
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Could not read ${name}`);
          useBook.getState().loadText(await res.text(), name);
          toast.success(`Loaded ${useBook.getState().shots.length} shots`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Load failed");
        } finally {
          setBusy(null);
        }
      })();
    };
    window.addEventListener("breakline-open", onOpen);
    return () => window.removeEventListener("breakline-open", onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const st = useBook.getState();
      if (e.key === "Escape") {
        st.cancelDraft();
        st.setTool("select");
        e.preventDefault();
      } else if (e.key === "Enter") {
        st.commitDraft();
        e.preventDefault();
      } else if (e.key === "Backspace" && st.draft.length) {
        st.undoDraft();
        e.preventDefault();
      } else if (e.key === "Delete") {
        st.deleteSelected();
      } else if (e.key === "v" || e.key === "V") {
        st.setTool("select");
      } else if (e.key === "m" || e.key === "M") {
        st.setTool("move");
      } else if (e.key === "l" || e.key === "L") {
        st.setTool("line");
      } else if (e.key === "s" || e.key === "S") {
        st.setTool("shape");
      } else if (e.key === "r" || e.key === "R") {
        st.setTool("recode");
      } else if (e.key === "p" || e.key === "P") {
        st.setTool("place");
      } else if (e.key === "i" || e.key === "I") {
        st.setTool("inverse");
      } else if (e.key === "j" || e.key === "J") {
        st.setTool("join");
      } else if (e.key === "q" || e.key === "Q") {
        st.setRightTab("qa");
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        document.getElementById("cad-keyin")?.focus();
        e.preventDefault();
      } else if ((e.key === "e" || e.key === "E") && (e.ctrlKey || e.metaKey)) {
        const n = st.extractAll();
        toast.success(n ? `Extracted ${n}` : "Extract layer up to date");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const id = useJobs.getState().activeId;
    if (!id) return;
    const t = window.setTimeout(() => {
      const job = useJobs.getState().jobs.find((j) => j.id === id);
      if (!job) return;
      const book = useBook.getState();
      useJobs.getState().updateJob(id, {
        csvText: book.raw,
        csvName: book.fileName || job.csvName,
        remaps: book.remaps,
        userLines: book.userLines,
        leaders: book.leaders,
        coordOrder: book.order,
        crsId: book.crsId,
        survey: book.survey,
        files: book.fileName
          ? [{ name: book.fileName, kind: "csv", size: book.raw.length }]
          : job.files,
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [raw, remaps, userLines, fileName, survey, shots.length, crsId]);

  const stats = useMemo(() => {
    let matched = 0;
    const unmatchedCodes = new Map<string, number>();
    for (const s of shots) {
      const f = resolveFeature(s, remaps);
      if (f) matched += 1;
      else {
        const k = (s.codeToken || "(blank)").toUpperCase();
        unmatchedCodes.set(k, (unmatchedCodes.get(k) ?? 0) + 1);
      }
    }
    return {
      total: shots.length,
      matched,
      unmatched: shots.length - matched,
      unmatchedCodes: [...unmatchedCodes.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [shots, remaps]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy("Reading file…");
    try {
      await openSurveyFiles(files);
    } finally {
      setBusy(null);
    }
  }

  const align = useMemo(
    () =>
      projectAlignment(
        shots,
        allChains(shots, remaps, userLines).map((c) => ({ code: c.code, pts: chainVertices(c) })),
      ),
    [shots, remaps, userLines],
  );
  const held = selectedUid ? shots.find((sh) => sh.uid === selectedUid) : undefined;
  const readout = cursor ?? (held ? { n: held.northing, e: held.easting, z: held.elevation } : null);
  const sta = readout && align ? stationOffset(align.pts, readout) : null;
  const feat = activeCode ? lookupCode(activeCode) : undefined;
  const prompt = `${TOOL_PROMPT[tool] ?? tool}${activeCode ? ` · ${activeCode}${feat ? "  " + (feat.desc || feat.name) : ""}` : ""}${draft.length ? ` · ${draft.length} vtx` : ""}`;

  return (
    <div
      className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void onFiles(e.dataTransfer.files);
      }}
    >
      <TitleBar fileName={fileName} />
      <Ribbon onOpenFiles={onFiles} onAppendFiles={(files) => void openSurveyFiles(files, true)} />

      {stats.unmatchedCodes.length > 0 ? (
        <div className="shrink-0 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setRemapOpen((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs"
          >
            <Badge variant="bad">{stats.unmatched}</Badge>
            <span className="font-medium">Unmatched</span>
            <span className="font-mono text-muted-foreground">
              {stats.unmatchedCodes.map(([c]) => c).join("  ")}
            </span>
          </button>
          {remapOpen ? (
            <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
              {stats.unmatchedCodes.map(([code, n]) => (
                <div key={code} className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
                  <span className="font-mono text-xs font-medium">{code}</span>
                  <Badge variant="bad">{n}</Badge>
                  <FeaturePicker value={remaps[code] ?? null} onChange={(id) => setRemap(code, id)} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <PanelGroup orientation="horizontal" className="h-full" id="cad-layout">
          {isMd ? (
            <>
              <Panel
                id="codes"
                panelRef={codesRef}
                defaultSize={280}
                minSize={240}
                maxSize={560}
                collapsible
                collapsedSize={0}
                groupResizeBehavior="preserve-pixel-size"
                className="min-h-0 overflow-hidden"
              >
                <SurveyExplorer />
              </Panel>
              <PanelResizeHandle className="cad-split" />
            </>
          ) : null}

          <Panel id="view" minSize="40%" className="min-h-0 min-w-0">
            <div className="flex h-full min-h-0 flex-col">
              <div className="relative min-h-0 flex-1">
                <PlanMap />
                {!shots.length && !busy ? (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
                    <div className="pointer-events-auto max-w-sm rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
                      <p className="font-display text-lg font-medium">Open a field book</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Drop a CSV, RW5, or FBK, or use File → Open. Set State and Zone in the map corner so the
                        aerial matches the shots. File → Save file writes a GeoLine Solutions file you can open on this PC later.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              {shotsOpen ? (
                <div className="h-[min(38vh,18rem)] shrink-0 overflow-auto border-t border-border bg-card">
                  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
                    <p className="text-xs font-medium">Field book</p>
                    <div className="flex rounded-md border border-border p-0.5">
                      {(["all", "matched", "unmatched"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFilter(f)}
                          className={cn(
                            "rounded-sm px-2.5 py-1 text-xs font-medium capitalize",
                            filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PointsTable />
                </div>
              ) : null}
            </div>
          </Panel>

          {isMd ? (
            <>
              <PanelResizeHandle className="cad-split" />
              <Panel
                id="levels"
                panelRef={levelsRef}
                defaultSize={280}
                minSize={240}
                maxSize={560}
                collapsible
                collapsedSize={0}
                groupResizeBehavior="preserve-pixel-size"
                className="min-h-0 overflow-hidden"
              >
                <SurveyDock />
              </Panel>
            </>
          ) : null}
        </PanelGroup>

        {leftOpen && !isMd ? (
          <div className="absolute inset-0 z-30 bg-foreground/40" onClick={() => setLeftOpen(false)}>
            <div className="h-full w-[min(22rem,92vw)] bg-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              <SurveyExplorer />
            </div>
          </div>
        ) : null}
        {rightOpen && !isMd ? (
          <div className="absolute inset-0 z-30 flex justify-end bg-foreground/40" onClick={() => setRightOpen(false)}>
            <div className="h-full w-[min(22rem,92vw)] bg-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              <SurveyDock />
            </div>
          </div>
        ) : null}

        {busy ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60">
            <p className="rounded-md border border-border bg-card px-4 py-2 text-sm">{busy}</p>
          </div>
        ) : null}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-ribbon px-2 py-1 font-mono text-xs text-muted-foreground">
        <KeyIn />
        <span className="text-foreground">{prompt}</span>
        <span className="text-foreground">{stats.total} pts</span>
        <span className="text-ok">{stats.matched}</span>
        <span className={stats.unmatched ? "text-destructive" : ""}>{stats.unmatched} um</span>
        {skipped ? <span>{skipped} skip</span> : null}
        {qa.errors + qa.warns > 0 ? (
          <button type="button" className="text-warn" onClick={() => useBook.getState().setRightTab("qa")}>
            QA {qa.errors}/{qa.warns}
          </button>
        ) : (
          <span className="text-ok">QA clear</span>
        )}
        <span className="text-foreground">
          N {readout ? readout.n.toFixed(3) : "—"} &nbsp; E {readout ? readout.e.toFixed(3) : "—"} &nbsp; Z{" "}
          {readout ? readout.z.toFixed(2) : "—"} {gridUnit(origin)}
        </span>
        {cursor?.lat != null && cursor.lon != null ? <span className="hidden md:inline">{formatLatLon(cursor.lat, cursor.lon)}</span> : null}
        <span className="hidden lg:inline">
          {align ? align.name : "STA"} {sta ? formatStation(sta.station) : "—"} &nbsp; {sta ? formatOffset(sta.offset) : "—"}
        </span>
        <span className="ml-auto hidden xl:inline">{origin.crs}</span>
      </footer>
    </div>
  );
}

function TitleBar({ fileName }: { fileName: string }) {
  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-title px-3 py-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <Mark />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#e8edf2]">
          {COMPANY.name} · {job?.name || (fileName ? fileName.replace(/\.(csv|txt)$/i, ".dgn") : "Extract")}
        </p>
      </div>
      <span className="hidden font-mono text-xs text-[#8fa3b8] lg:inline">
        Des. {job?.des || SR67_SITE.des}
      </span>
      <AuthSlot compact />
    </header>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 2.2v11.6M2.2 8h11.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
