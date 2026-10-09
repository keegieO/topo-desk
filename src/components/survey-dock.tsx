import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LevelsPanel } from "@/components/levels-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBook, type RightTab } from "@/lib/store";
import { View3DToolbar } from "@/components/view-3d";
import { useJobs } from "@/lib/jobs";
import { buildChains, chainVertices } from "@/lib/chains";
import { runQa, type QaIssue } from "@/lib/qa";
import { resolveFeature } from "@/lib/label";
import { dist2d } from "@/lib/geo";
import { cn } from "@/lib/utils";
import {
  formatStation,
  inverse,
  polygonArea,
  stationOffset,
  polylineLength,
  azimuthDeg,
  compassRule,
} from "@/lib/cogo";
import { htmlSheetSet } from "@/lib/sheet-set";

const TABS: { id: RightTab; label: string }[] = [
  { id: "levels", label: "Levels" },
  { id: "linear", label: "Linear" },
  { id: "terrain", label: "TIN" },
  { id: "cogo", label: "COGO" },
  { id: "profile", label: "Profile" },
  { id: "pts", label: "Pts" },
  { id: "qa", label: "QA" },
  { id: "sheet", label: "Sheet" },
  { id: "details", label: "Book" },
];

export function SurveyDock() {
  const tab = useBook((s) => s.rightTab);
  const setRightTab = useBook((s) => s.setRightTab);
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const userLines = useBook((s) => s.userLines);
  const skipped = useBook((s) => s.skipped);
  const qa = useMemo(() => runQa(shots, remaps, userLines, skipped), [shots, remaps, userLines, skipped]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="flex shrink-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setRightTab(t.id)}
            className={cn(
              "flex-1 px-1 py-2 text-[0.6875rem] font-medium",
              tab === t.id ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.id === "qa" && qa.errors + qa.warns > 0 ? (
              <span className="ml-0.5 font-mono text-[0.625rem] text-destructive">{qa.errors + qa.warns}</span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="min-h-0 h-full flex-1 overflow-hidden">
        {tab === "levels" ? <LevelsPanel /> : null}
        {tab === "linear" ? <LinearPanel /> : null}
        {tab === "terrain" ? <TerrainPanel /> : null}
        {tab === "cogo" ? <CogoPanel /> : null}
        {tab === "profile" ? <ProfilePanel /> : null}
        {tab === "pts" ? <PtEditorPanel /> : null}
        {tab === "qa" ? <QaPanel /> : null}
        {tab === "sheet" ? <SheetPanel /> : null}
        {tab === "details" ? <DetailsPanel /> : null}
      </div>
    </div>
  );
}

/** Detect PI vertices and return curve data for a polyline (3-point minimum per curve). */
function computeCurves(pts: { n: number; e: number; z?: number }[]) {
  if (pts.length < 3) return [];
  const curves: { pi: number; delta: number; az1: number; az2: number }[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const az1 = azimuthDeg(pts[i - 1].n, pts[i - 1].e, pts[i].n, pts[i].e);
    const az2 = azimuthDeg(pts[i].n, pts[i].e, pts[i + 1].n, pts[i + 1].e);
    let delta = az2 - az1;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) > 1) curves.push({ pi: i, delta, az1, az2 });
  }
  return curves;
}

function LinearPanel() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const userLines = useBook((s) => s.userLines);
  const selectedLineId = useBook((s) => s.selectedLineId);
  const setSelectedLine = useBook((s) => s.setSelectedLine);
  const setSelected = useBook((s) => s.setSelected);
  const focusOn = useBook((s) => s.focusOn);
  const setLineClosed = useBook((s) => s.setLineClosed);
  const reverseUserLine = useBook((s) => s.reverseUserLine);
  const closeSurveyChain = useBook((s) => s.closeSurveyChain);
  const deleteSelected = useBook((s) => s.deleteSelected);
  const setTool = useBook((s) => s.setTool);
  const setActiveCode = useBook((s) => s.setActiveCode);
  const extractAll = useBook((s) => s.extractAll);
  const extractChain = useBook((s) => s.extractChain);
  const offsetLine = useBook((s) => s.offsetLine);
  const surveyStringsOn = useBook((s) => s.surveyStringsOn);
  const setSurveyStringsOn = useBook((s) => s.setSurveyStringsOn);
  const [showCurves, setShowCurves] = useState(false);

  const chains = useMemo(() => buildChains(shots, remaps), [shots, remaps]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Linear features</p>
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const n = extractAll();
              if (!n) toast.message("All field-to-finish strings are already extracted.");
              else toast.success(`Extracted ${n}`);
            }}
          >
            Extract all
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setTool("line")}>
            Place line
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={surveyStringsOn}
            onChange={(e) => setSurveyStringsOn(e.target.checked)}
          />
          Show survey strings
        </label>
        <span className="font-mono text-[0.625rem] text-muted-foreground">
          {chains.length} survey · {userLines.length} extract
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col">
          {chains.map((c) => {
            const verts = chainVertices(c);
            const len = lengthOf(verts);
            const on = selectedLineId === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLine(c.id);
                    if (c.shots[0]) setSelected(c.shots[0].uid);
                    focusOn(c.code);
                    setActiveCode(c.code);
                  }}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent",
                    on && "bg-accent",
                  )}
                >
                  <span className="font-mono font-medium">{c.code}</span>
                  <span className="text-muted-foreground">
                    {c.shots.length} vtx · {len.toFixed(1)} ft{c.closed ? " · CLS" : ""}
                  </span>
                </button>
                {on ? (
                  <div className="flex flex-wrap gap-1 px-3 pb-2">
                    <Tiny
                      onClick={() => closeSurveyChain(c.shots.map((s) => s.uid))}
                      label="Close CLS"
                    />
                    <Tiny
                      onClick={() => {
                        if (extractChain(c.id)) toast.success(`Extracted ${c.code}`);
                        else toast.message("Already extracted");
                      }}
                      label="Extract"
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
          {userLines.map((l) => {
            const len = lengthOf(l.pts);
            const on = selectedLineId === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLine(l.id);
                    setActiveCode(l.code);
                  }}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent",
                    on && "bg-accent",
                  )}
                >
                  <span className="font-mono font-medium">{l.code} · extract</span>
                  <span className="text-muted-foreground">
                    {l.pts.length} vtx · {len.toFixed(1)} ft{l.closed ? " · CLS" : ""}
                  </span>
                </button>
                {on ? (
                  <>
                    <div className="flex flex-wrap gap-1 px-3 pb-1">
                      <Tiny onClick={() => setLineClosed(l.id, !l.closed)} label={l.closed ? "Open" : "Close"} />
                      <Tiny onClick={() => reverseUserLine(l.id)} label="Reverse" />
                      <Tiny
                        onClick={() => {
                          if (offsetLine(l.id)) toast.success("Offset line");
                        }}
                        label="Offset"
                      />
                      <Tiny
                        onClick={() => {
                          useBook.getState().setTool("join");
                          useBook.getState().setJoinPending(l.id);
                          toast.message("Click the line to join");
                        }}
                        label="Join"
                      />
                      <Tiny
                        onClick={() => {
                          useBook.getState().setTool("split");
                          toast.message("Click a vertex to split");
                        }}
                        label="Split"
                      />
                      <Tiny
                        onClick={() => setShowCurves((v) => !v)}
                        label={showCurves ? "Hide curves" : "Curve data"}
                      />
                      <Tiny
                        onClick={() => {
                          useBook.getState().setSelectedLine(l.id);
                          deleteSelected();
                        }}
                        label="Delete"
                      />
                    </div>
                    {showCurves ? <CurveDataTable pts={l.pts} /> : null}
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
        {!chains.length && !userLines.length ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No strings yet. Process the field book, or Place Line on the shots.
          </p>
        ) : null}
      </ScrollArea>
    </div>
  );
}

function TerrainPanel() {
  const terrain = useBook((s) => s.terrain);
  const contoursOn = useBook((s) => s.contoursOn);
  const contourInterval = useBook((s) => s.contourInterval);
  const setContoursOn = useBook((s) => s.setContoursOn);
  const setContourInterval = useBook((s) => s.setContourInterval);
  const buildTerrain = useBook((s) => s.buildTerrain);
  const shots = useBook((s) => s.shots);
  const [show3d, setShow3d] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Terrain model</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Builds when the book opens. GeoLine Solutionss hold the surface. Pipe inverts stay off it.
        </p>
      </div>
      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ci">Contour interval (ft)</Label>
          <Input
            id="ci"
            type="number"
            min={0.1}
            step={0.5}
            value={contourInterval}
            onChange={(e) => setContourInterval(Number(e.target.value) || 1)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => buildTerrain()} disabled={shots.length < 3}>
            Rebuild terrain
          </Button>
          {terrain && (
            <Button type="button" size="sm" variant="outline" onClick={() => setShow3d(true)}>
              View 3D
            </Button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={contoursOn} onChange={(e) => setContoursOn(e.target.checked)} />
          Show contours
        </label>
        {terrain ? (
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            {terrain.pts.length} ground pts · {terrain.tris.length} triangles · {terrain.contours.length} contours
            <br />
            {terrain.zmin.toFixed(2)} to {terrain.zmax.toFixed(2)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No surface yet. Build terrain to contour the survey.</p>
        )}
      </div>

      {/* 3D Terrain modal overlay */}
      {show3d && terrain && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[min(85vh,700px)] rounded-lg overflow-hidden shadow-2xl border border-white/10">
            <View3DToolbar model={terrain} onClose={() => setShow3d(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function CogoPanel() {
  const shots = useBook((s) => s.shots);
  const selectedUid = useBook((s) => s.selectedUid);
  const selectedLineId = useBook((s) => s.selectedLineId);
  const userLines = useBook((s) => s.userLines);
  const remaps = useBook((s) => s.remaps);
  const measure = useBook((s) => s.measure);
  const cogo = useBook((s) => s.cogo);
  const offsetFt = useBook((s) => s.offsetFt);
  const setOffsetFt = useBook((s) => s.setOffsetFt);
  const setTool = useBook((s) => s.setTool);
  const offsetLine = useBook((s) => s.offsetLine);
  const selected = shots.find((s) => s.uid === selectedUid);
  const line = userLines.find((l) => l.id === selectedLineId);
  const chains = useMemo(() => buildChains(shots, remaps), [shots, remaps]);
  const chain = chains.find((c) => c.id === selectedLineId);
  const [showReport, setShowReport] = useState(false);

  const inv =
    measure.length === 2
      ? inverse(
          { n: measure[0].n, e: measure[0].e, z: measure[0].z },
          { n: measure[1].n, e: measure[1].e, z: measure[1].z },
        )
      : cogo?.kind === "inverse"
        ? cogo.inv
        : null;

  const verts = line ? line.pts : chain ? chainVertices(chain) : [];
  const area = verts.length >= 3 ? polygonArea(verts) : null;
  const sta =
    selected && verts.length >= 2
      ? stationOffset(verts, { n: selected.northing, e: selected.easting, z: selected.elevation })
      : null;

  /** All-shots sta/off report for the selected line */
  const staReport = useMemo(() => {
    if (!showReport || verts.length < 2) return null;
    const rows = shots
      .map((s) => {
        const r = stationOffset(verts, { n: s.northing, e: s.easting, z: s.elevation });
        if (!r) return null;
        return { pt: s.point, code: s.codeToken, station: r.station, offset: r.offset, z: s.elevation };
      })
      .filter(Boolean) as { pt: string; code: string; station: number; offset: number; z: number }[];
    rows.sort((a, b) => a.station - b.station);
    return rows;
  }, [showReport, verts, shots]);

  function downloadStaOff() {
    if (!staReport) return;
    const csv = ["Point,Code,Station,Offset,Elev", ...staReport.map((r) => `${r.pt},${r.code},${r.station.toFixed(3)},${r.offset.toFixed(3)},${r.z.toFixed(3)}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `sta-off-${selectedLineId ?? "line"}.csv`;
    a.click();
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 px-3 py-3">
        <p className="text-sm font-medium">COGO</p>
        <div className="flex flex-wrap gap-1">
          <Tiny onClick={() => setTool("inverse")} label="Inverse" />
          <Tiny onClick={() => setTool("measure")} label="Distance" />
          <Tiny onClick={() => setTool("join")} label="Join" />
          <Tiny onClick={() => setTool("split")} label="Split" />
          <Tiny
            onClick={() => {
              if (line && offsetLine(line.id)) toast.success(`Offset ${offsetFt} ft`);
              else toast.message("Select an extract line first");
            }}
            label="Offset"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="off">Offset distance (ft)</Label>
          <Input
            id="off"
            type="number"
            step={0.1}
            value={offsetFt}
            onChange={(e) => setOffsetFt(Number(e.target.value) || 0)}
          />
        </div>
        {inv ? (
          <div className="rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]">
            <p className="font-sans text-xs font-medium">Inverse</p>
            <p className="mt-1">{inv.bearing}</p>
            <p>Az {inv.az.toFixed(4)}°</p>
            <p>Horiz {inv.horiz.toFixed(3)} ft</p>
            <p>Slope {inv.dist.toFixed(3)} ft</p>
            <p>
              ΔN {inv.dN.toFixed(3)} · ΔE {inv.dE.toFixed(3)} · ΔZ {inv.dZ.toFixed(3)}
            </p>
            {inv.gradePct != null ? <p>Grade {inv.gradePct.toFixed(2)}%</p> : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Inverse: click two points (or Measure).</p>
        )}
        {sta ? (
          <div className="rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]">
            <p className="font-sans text-xs font-medium">Station / offset</p>
            <p className="mt-1">
              {formatStation(sta.station)} · {sta.offset >= 0 ? "RT" : "LT"} {Math.abs(sta.offset).toFixed(2)} ft
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Select a line and a point for station/offset.</p>
        )}
        {area && (line?.closed || chain?.closed || verts.length >= 3) ? (
          <div className="rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]">
            <p className="font-sans text-xs font-medium">Area</p>
            <p className="mt-1">{area.area.toFixed(1)} sq ft</p>
            <p>{(area.area / 43560).toFixed(4)} ac</p>
            <p>Perimeter {area.perimeter.toFixed(2)} ft</p>
          </div>
        ) : null}
        {line ? (
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            {line.code} extract · {polylineLength(line.pts).toFixed(2)} ft
          </p>
        ) : null}

        {/* Traverse closure (closed loops only) */}
        {(line?.closed || chain?.closed) && verts.length >= 3 ? (
          <TraverseClosureBox verts={verts} />
        ) : null}

        {/* Station/offset report */}
        {verts.length >= 2 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">Sta/Off report ({shots.length} pts)</p>
              <div className="flex gap-1">
                <Tiny onClick={() => setShowReport((v) => !v)} label={showReport ? "Hide" : "Show table"} />
                {showReport && staReport ? (
                  <Tiny onClick={downloadStaOff} label="CSV ↓" />
                ) : null}
              </div>
            </div>
            {showReport && staReport ? (
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full font-mono text-[0.625rem]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-2 py-1 text-left">Pt</th>
                      <th className="px-2 py-1 text-left">Code</th>
                      <th className="px-2 py-1 text-right">Station</th>
                      <th className="px-2 py-1 text-right">Offset</th>
                      <th className="px-2 py-1 text-right">Elev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staReport.map((r) => (
                      <tr key={r.pt} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="px-2 py-0.5">{r.pt}</td>
                        <td className="px-2 py-0.5">{r.code}</td>
                        <td className="px-2 py-0.5 text-right">{formatStation(r.station)}</td>
                        <td className={cn("px-2 py-0.5 text-right", r.offset > 0 ? "text-sky-600" : "text-rose-600")}>
                          {r.offset >= 0 ? "R" : "L"} {Math.abs(r.offset).toFixed(2)}
                        </td>
                        <td className="px-2 py-0.5 text-right">{r.z.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Select a line to generate sta/off report.</p>
        )}
      </div>
    </ScrollArea>
  );
}

function QaPanel() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const userLines = useBook((s) => s.userLines);
  const skipped = useBook((s) => s.skipped);
  const setSelected = useBook((s) => s.setSelected);
  const setSelectedLine = useBook((s) => s.setSelectedLine);
  const focusOn = useBook((s) => s.focusOn);
  const setShotsOpen = useBook((s) => s.setShotsOpen);
  const setFilter = useBook((s) => s.setFilter);
  const setRightTab = useBook((s) => s.setRightTab);
  const extractAll = useBook((s) => s.extractAll);
  const qa = useMemo(() => runQa(shots, remaps, userLines, skipped), [shots, remaps, userLines, skipped]);

  function jump(issue: QaIssue) {
    if (issue.alpha) focusOn(issue.alpha);
    if (issue.lineId) setSelectedLine(issue.lineId);
    if (issue.shotUids[0]) {
      setSelected(issue.shotUids[0]);
      setShotsOpen(true);
    }
    if (issue.check === "unmatched") setFilter("unmatched");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Survey QA</p>
        <p className="mt-1 font-mono text-[0.6875rem] text-muted-foreground">
          {qa.errors} error · {qa.warns} warn · {qa.infos} info
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {!qa.issues.length ? (
          <p className="px-3 py-8 text-center text-sm text-ok">Checklist clear. Ready for ORD package.</p>
        ) : (
          <ul className="flex flex-col">
            {qa.issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => jump(issue)}
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <Badge variant={issue.severity === "error" ? "bad" : issue.severity === "warn" ? "warn" : "default"}>
                      {issue.severity}
                    </Badge>
                    <span className="text-xs font-medium">{issue.title}</span>
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">{issue.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="flex flex-col gap-1 border-t border-border px-3 py-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            const n = extractAll();
            toast.message(n ? `Extracted ${n}` : "Extract layer up to date");
            setRightTab("linear");
          }}
        >
          Extract remaining
        </Button>
      </div>
    </div>
  );
}

function DetailsPanel() {
  const survey = useBook((s) => s.survey);
  const setSurvey = useBook((s) => s.setSurvey);
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const fileName = useBook((s) => s.fileName);
  const order = useBook((s) => s.order);
  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  const control = shots.filter((s) => {
    const f = resolveFeature(s, remaps);
    return f?.cat === "Survey Control" || ["PRE", "PBMK", "PMON", "TRAV", "PIDT"].includes(s.codeToken.toUpperCase());
  });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 px-3 py-3">
        <p className="text-sm font-medium">Field book</p>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">
          {fileName || "No book"} · {order} · {shots.length} pts · {control.length} control
        </p>
        {job ? (
          <p className="text-xs text-muted-foreground">
            {job.name}
            {job.des ? ` · Des. ${job.des}` : ""}
            {job.county ? ` · ${job.county}` : ""}
          </p>
        ) : null}
        {survey.books?.length ? (
          <ul className="font-mono text-[0.6875rem] text-muted-foreground">
            {survey.books.map((b) => (
              <li key={b.name}>
                {b.name} · {b.points} pts
              </li>
            ))}
          </ul>
        ) : null}
        <Field label="Crew" value={survey.crew} onChange={(v) => setSurvey({ crew: v })} />
        <Field label="Instrument" value={survey.instrument} onChange={(v) => setSurvey({ instrument: v })} />
        <Field label="Occupied" value={survey.occupied} onChange={(v) => setSurvey({ occupied: v })} />
        <Field label="Backsight" value={survey.backsight} onChange={(v) => setSurvey({ backsight: v })} />
        <Field label="HI" value={survey.hi ?? ""} onChange={(v) => setSurvey({ hi: v })} />
        <Field label="HT" value={survey.ht ?? ""} onChange={(v) => setSurvey({ ht: v })} />
        <Field label="Weather" value={survey.weather ?? ""} onChange={(v) => setSurvey({ weather: v })} />
        <Field label="Date" value={survey.date} onChange={(v) => setSurvey({ date: v })} type="date" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sv-notes">Field notes</Label>
          <textarea
            id="sv-notes"
            rows={4}
            value={survey.notes}
            onChange={(e) => setSurvey({ notes: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        {survey.observations?.length ? (
          <div>
            <p className="text-xs font-medium">Observations</p>
            <ul className="mt-1 max-h-40 overflow-auto font-mono text-[0.625rem] text-muted-foreground">
              {survey.observations.slice(0, 80).map((o) => (
                <li key={o.id}>
                  {o.kind} {o.point}
                  {o.occupied ? ` occ ${o.occupied}` : ""}
                  {o.sd != null ? ` SD ${o.sd}` : ""}
                  {o.description ? ` ${o.description}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  );
}

/** Traverse closure box — computes closure error and precision ratio for a closed loop. */
function TraverseClosureBox({ verts }: { verts: { n: number; e: number; z?: number }[] }) {
  const result = useMemo(() => {
    if (verts.length < 3) return null;
    // Treat first point as the close-to target
    const close = { n: verts[0].n, e: verts[0].e, z: verts[0].z };
    const cr = compassRule(verts, close);
    const linearError = Math.hypot(cr.misN, cr.misE);
    const precRatio = cr.perimeter > 0.1 ? cr.perimeter / linearError : null;
    const azErr = azimuthDeg(0, 0, cr.misN, cr.misE);
    return {
      misN: cr.misN,
      misE: cr.misE,
      perimeter: cr.perimeter,
      linearError,
      precRatio,
      azErr,
    };
  }, [verts]);

  if (!result) return null;

  const grade =
    result.precRatio == null
      ? "—"
      : result.precRatio >= 10000
        ? "Excellent"
        : result.precRatio >= 5000
          ? "Good"
          : result.precRatio >= 3000
            ? "Acceptable"
            : "Poor";

  const gradeColor =
    result.precRatio == null
      ? ""
      : result.precRatio >= 10000
        ? "text-ok"
        : result.precRatio >= 5000
          ? "text-ok"
          : result.precRatio >= 3000
            ? "text-amber-500"
            : "text-destructive";

  return (
    <div className="rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]">
      <p className="font-sans text-xs font-medium">Traverse closure</p>
      <p className="mt-1">Perimeter {result.perimeter.toFixed(2)} ft</p>
      <p>Closure error {result.linearError.toFixed(4)} ft</p>
      <p>ΔN {result.misN.toFixed(4)} · ΔE {result.misE.toFixed(4)}</p>
      {result.precRatio != null ? (
        <>
          <p>
            Precision 1:{result.precRatio.toFixed(0)}{" "}
            <span className={gradeColor}>({grade})</span>
          </p>
          <p className="text-muted-foreground">Error az {result.azErr.toFixed(1)}°</p>
        </>
      ) : (
        <p className="text-ok">Loop closes perfectly.</p>
      )}
    </div>
  );
}

/** Ground profile view along selected line. */
function ProfilePanel() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const userLines = useBook((s) => s.userLines);
  const selectedLineId = useBook((s) => s.selectedLineId);
  const [xsInterval, setXsInterval] = useState(25);
  const [showXs, setShowXs] = useState(false);

  const chains = useMemo(() => buildChains(shots, remaps), [shots, remaps]);
  const line = userLines.find((l) => l.id === selectedLineId);
  const chain = chains.find((c) => c.id === selectedLineId);
  const verts = line ? line.pts : chain ? chainVertices(chain) : [];

  /** Project all shots to the line and sort by station */
  const profile = useMemo(() => {
    if (verts.length < 2) return [];
    const rows: { station: number; z: number; pt: string; code: string; offset: number }[] = [];
    for (const s of shots) {
      const r = stationOffset(verts, { n: s.northing, e: s.easting, z: s.elevation });
      if (r && Math.abs(r.offset) < 50) {
        rows.push({ station: r.station, z: s.elevation, pt: s.point, code: s.codeToken, offset: r.offset });
      }
    }
    rows.sort((a, b) => a.station - b.station);
    return rows;
  }, [verts, shots]);

  /** Ground surface at vertex elevations */
  const vertProfile = useMemo(() => {
    if (verts.length < 2) return [];
    let sta = 0;
    const pts: { station: number; z: number }[] = [];
    for (let i = 0; i < verts.length; i++) {
      if (i > 0) sta += Math.hypot(verts[i].n - verts[i - 1].n, verts[i].e - verts[i - 1].e);
      const z = verts[i].z;
      if (z != null && isFinite(z)) pts.push({ station: sta, z });
    }
    return pts;
  }, [verts]);

  /** Cross section points at regular intervals */
  const xsPoints = useMemo(() => {
    if (!showXs || verts.length < 2) return [];
    const totalLen = polylineLength(verts);
    const sections: { station: number; pts: { offset: number; z: number; pt: string }[] }[] = [];
    for (let sta = 0; sta <= totalLen + 0.01; sta += xsInterval) {
      const nearPts = shots
        .map((s) => {
          const r = stationOffset(verts, { n: s.northing, e: s.easting, z: s.elevation });
          if (!r) return null;
          const staDiff = Math.abs(r.station - sta);
          if (staDiff > xsInterval / 2) return null;
          return { offset: r.offset, z: s.elevation, pt: s.point };
        })
        .filter(Boolean) as { offset: number; z: number; pt: string }[];
      nearPts.sort((a, b) => a.offset - b.offset);
      if (nearPts.length >= 2) sections.push({ station: sta, pts: nearPts });
    }
    return sections;
  }, [showXs, verts, shots, xsInterval]);

  if (verts.length < 2) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">
          Select an extract line or survey string in the Linear tab to view its profile.
        </p>
      </div>
    );
  }

  const totalLen = polylineLength(verts);
  const zVals = [...profile.map((p) => p.z), ...vertProfile.map((p) => p.z)].filter(isFinite);
  const zMin = zVals.length ? Math.min(...zVals) : 0;
  const zMax = zVals.length ? Math.max(...zVals) : 1;
  const zRange = Math.max(zMax - zMin, 0.1);
  const W = 280;
  const H = 120;
  const PAD = { t: 8, b: 24, l: 36, r: 8 };
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;

  function toX(sta: number) { return PAD.l + (sta / totalLen) * pw; }
  function toY(z: number) { return PAD.t + ph - ((z - zMin) / zRange) * ph; }

  const groundPath = vertProfile.length >= 2
    ? "M " + vertProfile.map((p) => `${toX(p.station).toFixed(1)},${toY(p.z).toFixed(1)}`).join(" L ")
    : null;

  function downloadProfileCsv() {
    const csv = ["Station,Z,Point,Code,Offset",
      ...profile.map((r) => `${r.station.toFixed(3)},${r.z.toFixed(3)},${r.pt},${r.code},${r.offset.toFixed(3)}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `profile-${selectedLineId ?? "line"}.csv`;
    a.click();
  }

  function downloadXsCsv() {
    if (!xsPoints.length) return;
    const rows = ["Station,Offset,Z,Point"];
    for (const xs of xsPoints) {
      for (const p of xs.pts) rows.push(`${xs.station.toFixed(3)},${p.offset.toFixed(3)},${p.z.toFixed(3)},${p.pt}`);
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = `xsections-${selectedLineId ?? "line"}.csv`;
    a.click();
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ground profile</p>
          <Tiny onClick={downloadProfileCsv} label="CSV ↓" />
        </div>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">
          {selectedLineId} · {totalLen.toFixed(0)} ft · {profile.length} pts
          {zVals.length ? ` · elev ${zMin.toFixed(1)}–${zMax.toFixed(1)}` : ""}
        </p>

        {/* SVG profile */}
        <div className="overflow-x-auto rounded border border-border bg-background">
          <svg width={W} height={H} style={{ minWidth: W }}>
            {/* grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.t + t * ph;
              const z = zMax - t * zRange;
              return (
                <g key={t}>
                  <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#334155" strokeWidth={0.5} />
                  <text x={PAD.l - 2} y={y + 3} fill="#64748b" fontSize={7} textAnchor="end">{z.toFixed(0)}</text>
                </g>
              );
            })}
            {/* station tick labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const x = toX(t * totalLen);
              const sta = t * totalLen;
              return (
                <g key={t}>
                  <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b + 3} stroke="#334155" strokeWidth={0.5} />
                  <text x={x} y={H - 2} fill="#64748b" fontSize={6.5} textAnchor="middle">{formatStation(sta)}</text>
                </g>
              );
            })}
            {/* ground line */}
            {groundPath ? <path d={groundPath} fill="none" stroke="#22c55e" strokeWidth={1.5} /> : null}
            {/* shot dots */}
            {profile.map((p) => (
              <circle
                key={p.pt}
                cx={toX(p.station)}
                cy={toY(p.z)}
                r={2}
                fill={Math.abs(p.offset) < 2 ? "#f59e0b" : "#6366f1"}
                opacity={0.8}
              >
                <title>{p.pt} {p.code} {formatStation(p.station)} z={p.z.toFixed(2)}</title>
              </circle>
            ))}
            {/* axis labels */}
            <text x={PAD.l + pw / 2} y={H - 1} fill="#64748b" fontSize={6.5} textAnchor="middle">Station</text>
            <text x={9} y={PAD.t + ph / 2} fill="#64748b" fontSize={6.5} textAnchor="middle" transform={`rotate(-90,9,${PAD.t + ph / 2})`}>Elev (ft)</text>
          </svg>
        </div>

        {/* Cross sections */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Cross sections</p>
            <div className="flex gap-1">
              <Tiny onClick={() => setShowXs((v) => !v)} label={showXs ? "Hide XS" : "Compute XS"} />
              {xsPoints.length > 0 ? <Tiny onClick={downloadXsCsv} label="CSV ↓" /> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs shrink-0">Interval (ft)</Label>
            <Input
              type="number"
              min={5}
              max={500}
              step={5}
              value={xsInterval}
              onChange={(e) => setXsInterval(Number(e.target.value) || 25)}
              className="h-7 w-20 text-xs"
            />
          </div>
          {showXs && xsPoints.length > 0 ? (
            <div className="flex flex-col gap-3">
              {xsPoints.map((xs) => {
                const maxOff = Math.max(...xs.pts.map((p) => Math.abs(p.offset)), 10);
                const zValsXs = xs.pts.map((p) => p.z);
                const zMinXs = Math.min(...zValsXs);
                const zMaxXs = Math.max(...zValsXs);
                const zRangeXs = Math.max(zMaxXs - zMinXs, 0.1);
                const XW = 180, XH = 50;
                const xPad = { t: 4, b: 14, l: 28, r: 4 };
                const xpw = XW - xPad.l - xPad.r;
                const xph = XH - xPad.t - xPad.b;
                function xsX(off: number) { return xPad.l + ((off + maxOff) / (2 * maxOff)) * xpw; }
                function xsY(z: number) { return xPad.t + xph - ((z - zMinXs) / zRangeXs) * xph; }
                const xsPath = "M " + xs.pts.map((p) => `${xsX(p.offset).toFixed(1)},${xsY(p.z).toFixed(1)}`).join(" L ");
                return (
                  <div key={xs.station} className="rounded border border-border/60 px-2 py-1">
                    <p className="font-mono text-[0.625rem] text-muted-foreground mb-1">{formatStation(xs.station)} · {xs.pts.length} pts</p>
                    <svg width={XW} height={XH}>
                      <line x1={xsX(0)} y1={xPad.t} x2={xsX(0)} y2={XH - xPad.b} stroke="#334155" strokeWidth={0.5} strokeDasharray="2,2" />
                      <path d={xsPath} fill="none" stroke="#22c55e" strokeWidth={1.5} />
                      {xs.pts.map((p) => (
                        <circle key={p.pt} cx={xsX(p.offset)} cy={xsY(p.z)} r={2} fill="#f59e0b" opacity={0.8}>
                          <title>{p.pt} off={p.offset.toFixed(1)} z={p.z.toFixed(2)}</title>
                        </circle>
                      ))}
                      <text x={xsX(-maxOff)} y={XH - 2} fill="#64748b" fontSize={6} textAnchor="start">L {maxOff.toFixed(0)}</text>
                      <text x={xsX(0)} y={XH - 2} fill="#64748b" fontSize={6} textAnchor="middle">CL</text>
                      <text x={xsX(maxOff)} y={XH - 2} fill="#64748b" fontSize={6} textAnchor="end">R {maxOff.toFixed(0)}</text>
                      <text x={xPad.l - 2} y={xPad.t + 4} fill="#64748b" fontSize={6} textAnchor="end">{zMaxXs.toFixed(0)}</text>
                      <text x={xPad.l - 2} y={XH - xPad.b} fill="#64748b" fontSize={6} textAnchor="end">{zMinXs.toFixed(0)}</text>
                    </svg>
                  </div>
                );
              })}
            </div>
          ) : showXs && xsPoints.length === 0 ? (
            <p className="text-xs text-muted-foreground">No cross sections found — check interval or shot distribution.</p>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  );
}

/** Point editor — inline table to view, search, and edit individual shot coords/codes. */
function PtEditorPanel() {
  const shots = useBook((s) => s.shots);
  const selectedUid = useBook((s) => s.selectedUid);
  const setSelected = useBook((s) => s.setSelected);
  const updateShot = useBook((s) => s.updateShot);
  const focusOn = useBook((s) => s.focusOn);
  const [filter, setFilter] = useState("");
  const [editUid, setEditUid] = useState<string | null>(null);
  const [editPt, setEditPt] = useState({ point: "", northing: "", easting: "", elevation: "", description: "" });

  const visible = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return shots;
    return shots.filter(
      (s) =>
        s.point.includes(q) ||
        s.codeToken.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [shots, filter]);

  function startEdit(s: (typeof shots)[0]) {
    setEditUid(s.uid);
    setEditPt({
      point: s.point,
      northing: s.northing.toFixed(4),
      easting: s.easting.toFixed(4),
      elevation: s.elevation.toFixed(4),
      description: s.description,
    });
  }

  function commitEdit() {
    if (!editUid) return;
    const n = parseFloat(editPt.northing);
    const e = parseFloat(editPt.easting);
    const z = parseFloat(editPt.elevation);
    if (isNaN(n) || isNaN(e) || isNaN(z)) {
      toast.error("Invalid coordinate — enter decimal numbers");
      return;
    }
    updateShot(editUid, {
      point: editPt.point,
      northing: n,
      easting: e,
      elevation: z,
      description: editPt.description,
    });
    setEditUid(null);
    toast.success(`Point ${editPt.point} updated`);
  }

  function cancelEdit() {
    setEditUid(null);
  }

  function downloadCsv() {
    const csv = ["Point,Northing,Easting,Elevation,Code,Description",
      ...shots.map((s) => `${s.point},${s.northing.toFixed(4)},${s.easting.toFixed(4)},${s.elevation.toFixed(4)},${s.codeToken},"${s.description}"`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "points.csv";
    a.click();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <p className="shrink-0 text-sm font-medium">Points</p>
        <Input
          placeholder="Filter by pt / code…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7 flex-1 text-xs"
        />
        <Tiny onClick={downloadCsv} label="PNEZD ↓" />
      </div>
      <p className="shrink-0 border-b border-border px-3 py-1 font-mono text-[0.625rem] text-muted-foreground">
        {visible.length} / {shots.length} pts
      </p>
      <ScrollArea className="min-h-0 flex-1">
        <table className="w-full font-mono text-[0.625rem]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="px-2 py-1 text-left">Pt</th>
              <th className="px-2 py-1 text-right">N</th>
              <th className="px-2 py-1 text-right">E</th>
              <th className="px-2 py-1 text-right">Z</th>
              <th className="px-2 py-1 text-left">Code</th>
              <th className="px-2 py-1 text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const on = s.uid === selectedUid;
              const editing = s.uid === editUid;
              if (editing) {
                return (
                  <tr key={s.uid} className="border-b border-border bg-accent/60">
                    <td className="px-1 py-1">
                      <input
                        className="w-14 rounded border border-input bg-background px-1 text-[0.625rem]"
                        value={editPt.point}
                        onChange={(e) => setEditPt((p) => ({ ...p, point: e.target.value }))}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-20 rounded border border-input bg-background px-1 text-[0.625rem] text-right"
                        value={editPt.northing}
                        onChange={(e) => setEditPt((p) => ({ ...p, northing: e.target.value }))}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-20 rounded border border-input bg-background px-1 text-[0.625rem] text-right"
                        value={editPt.easting}
                        onChange={(e) => setEditPt((p) => ({ ...p, easting: e.target.value }))}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-16 rounded border border-input bg-background px-1 text-[0.625rem] text-right"
                        value={editPt.elevation}
                        onChange={(e) => setEditPt((p) => ({ ...p, elevation: e.target.value }))}
                      />
                    </td>
                    <td className="px-1 py-1" colSpan={2}>
                      <input
                        className="w-full rounded border border-input bg-background px-1 text-[0.625rem]"
                        value={editPt.description}
                        onChange={(e) => setEditPt((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Code description"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={commitEdit}
                          className="rounded-sm bg-primary px-1.5 py-0.5 text-[0.625rem] text-primary-foreground"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-sm border border-border px-1.5 py-0.5 text-[0.625rem]"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={s.uid}
                  className={cn("cursor-pointer border-b border-border/50 hover:bg-accent/50", on && "bg-accent")}
                  onClick={() => {
                    setSelected(s.uid);
                    focusOn(s.codeToken);
                  }}
                >
                  <td className="px-2 py-0.5 font-medium">{s.point}</td>
                  <td className="px-2 py-0.5 text-right">{s.northing.toFixed(2)}</td>
                  <td className="px-2 py-0.5 text-right">{s.easting.toFixed(2)}</td>
                  <td className="px-2 py-0.5 text-right">{s.elevation.toFixed(2)}</td>
                  <td className="px-2 py-0.5 text-muted-foreground">{s.codeToken}</td>
                  <td className="px-2 py-0.5 text-center">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        startEdit(s);
                      }}
                      className="rounded-sm border border-border px-1 py-0.5 text-[0.5625rem] hover:bg-background"
                    >
                      ✏
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            {shots.length ? "No points match the filter." : "No points loaded yet."}
          </p>
        ) : null}
      </ScrollArea>
    </div>
  );
}

/** Sheet title block editor — feeds directly into plot sheet and ORD package. */
function SheetPanel() {
  const sheetMeta = useBook((s) => s.sheetMeta);
  const setSheetMeta = useBook((s) => s.setSheetMeta);
  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const leaders = useBook((s) => s.leaders);
  const terrain = useBook((s) => s.terrain);

  /** Pre-fill from active job on first open if fields are empty. */
  function prefillFromJob() {
    if (!job) return;
    const patch: Partial<typeof sheetMeta> = {};
    if (!sheetMeta.title) patch.title = job.name;
    if (!sheetMeta.des) patch.des = job.des ?? "";
    if (!sheetMeta.client) patch.client = job.client;
    if (!sheetMeta.county) patch.county = job.county ?? "";
    if (!sheetMeta.crs) patch.crs = job.crs ?? "";
    if (Object.keys(patch).length) setSheetMeta(patch);
    toast.success("Pre-filled from job");
  }

  function openSheet() {
    const chains = buildChains(shots, remaps);
    const title = sheetMeta.title || job?.name || "Survey";
    const html = htmlSheetSet({
      title,
      des: sheetMeta.des || job?.des || "",
      client: sheetMeta.client || job?.client || "",
      county: sheetMeta.county || job?.county || "",
      crs: sheetMeta.crs || job?.crs || "",
      date: sheetMeta.date || new Date().toLocaleDateString(),
      firm: "GeoLine Solutions",
      shots,
      chains,
      leaders,
      contours: terrain?.contours,
    });
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  const SCALES = ["auto", "10", "20", "30", "40", "50", "100", "200", "400"];

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Sheet title block</p>
          {job ? (
            <Tiny onClick={prefillFromJob} label="Fill from job" />
          ) : null}
        </div>

        <SheetField label="Project title" value={sheetMeta.title} onChange={(v) => setSheetMeta({ title: v })} />
        <SheetField label="Des. number" value={sheetMeta.des} onChange={(v) => setSheetMeta({ des: v })} placeholder="e.g. 2201234" />
        <SheetField label="Client" value={sheetMeta.client} onChange={(v) => setSheetMeta({ client: v })} />
        <SheetField label="County" value={sheetMeta.county} onChange={(v) => setSheetMeta({ county: v })} />
        <SheetField label="CRS / projection" value={sheetMeta.crs} onChange={(v) => setSheetMeta({ crs: v })} placeholder="e.g. IN State Plane East" />

        <div className="flex gap-2">
          <div className="flex-1">
            <SheetField label="Drawn by" value={sheetMeta.drawnBy} onChange={(v) => setSheetMeta({ drawnBy: v })} />
          </div>
          <div className="flex-1">
            <SheetField label="Checked by" value={sheetMeta.checkedBy} onChange={(v) => setSheetMeta({ checkedBy: v })} />
          </div>
        </div>

        <SheetField label="Date" value={sheetMeta.date} onChange={(v) => setSheetMeta({ date: v })} type="date" />

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs">Scale</Label>
            <select
              value={sheetMeta.scale}
              onChange={(e) => setSheetMeta({ scale: e.target.value })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              {SCALES.map((s) => (
                <option key={s} value={s}>{s === "auto" ? "Auto" : `1" = ${s}'`}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <SheetField label="Sheet of" value={sheetMeta.sheetOf} onChange={(v) => setSheetMeta({ sheetOf: v })} placeholder="e.g. 1 of 3" />
          </div>
        </div>

        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-[0.6875rem] text-muted-foreground">
            These fields carry into all plot sheets and the ORD deliverable package.
            The PLS stamps the final output — this tool produces the working drawing.
          </p>
        </div>

        <Button type="button" size="sm" className="w-full" onClick={openSheet}>
          Preview plan sheet
        </Button>
      </div>
    </ScrollArea>
  );
}

/** Curve data table for a selected polyline — shows PI, delta, tangent bearing for each bend. */
function CurveDataTable({ pts }: { pts: { n: number; e: number; z?: number }[] }) {
  const curves = useMemo(() => computeCurves(pts), [pts]);

  if (!curves.length) {
    return (
      <p className="px-3 pb-2 text-[0.6875rem] text-muted-foreground">
        No significant bends detected (&gt;1°).
      </p>
    );
  }

  function downloadCurves() {
    const csv = [
      "PI_vtx,Delta_deg,LT_RT,Az_in,Az_out",
      ...curves.map((c) =>
        `${c.pi},${c.delta.toFixed(4)},${c.delta > 0 ? "RT" : "LT"},${c.az1.toFixed(4)},${c.az2.toFixed(4)}`,
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "curve-data.csv";
    a.click();
  }

  return (
    <div className="mx-3 mb-2 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] font-medium text-muted-foreground">{curves.length} PI(s)</p>
        <Tiny onClick={downloadCurves} label="CSV ↓" />
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full font-mono text-[0.625rem]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-1 text-left">PI vtx</th>
              <th className="px-2 py-1 text-right">Δ (°)</th>
              <th className="px-2 py-1 text-center">Turn</th>
              <th className="px-2 py-1 text-right">Az in</th>
              <th className="px-2 py-1 text-right">Az out</th>
            </tr>
          </thead>
          <tbody>
            {curves.map((c) => (
              <tr key={c.pi} className="border-b border-border/50">
                <td className="px-2 py-0.5">{c.pi}</td>
                <td className="px-2 py-0.5 text-right">{Math.abs(c.delta).toFixed(2)}</td>
                <td className={cn("px-2 py-0.5 text-center font-medium", c.delta > 0 ? "text-sky-600" : "text-rose-600")}>
                  {c.delta > 0 ? "RT" : "LT"}
                </td>
                <td className="px-2 py-0.5 text-right">{c.az1.toFixed(2)}</td>
                <td className="px-2 py-0.5 text-right">{c.az2.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SheetField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = `sh-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const id = `sv-${label.toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Tiny({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border px-2 py-0.5 text-[0.6875rem] hover:bg-background"
    >
      {label}
    </button>
  );
}

function lengthOf(pts: { n: number; e: number }[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += dist2d(pts[i - 1], pts[i]);
  return d;
}
