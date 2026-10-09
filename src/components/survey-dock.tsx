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
  { id: "eleminfo", label: "Elem" },
  { id: "recode", label: "Recode" },
  { id: "layers", label: "Layers" },
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
        {tab === "eleminfo" ? <ElemInfoPanel /> : null}
        {tab === "recode" ? <BatchRecodePanel /> : null}
        {tab === "layers" ? <LayerStandardsPanel /> : null}
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

/** HSL elevation color ramp: blue→cyan→green→yellow→red */
function elevColorCss(t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  let h: number, s: number, l: number;
  if (clamp < 0.25) {
    h = 240 - clamp * 160; s = 90; l = 40;
  } else if (clamp < 0.5) {
    const tt = (clamp - 0.25) / 0.25;
    h = 196 - tt * 68; s = 80; l = 45;
  } else if (clamp < 0.75) {
    const tt = (clamp - 0.5) / 0.25;
    h = 128 - tt * 56; s = 85; l = 50;
  } else {
    const tt = (clamp - 0.75) / 0.25;
    h = 72 - tt * 72; s = 90; l = 55;
  }
  return `hsl(${h.toFixed(0)},${s}%,${l}%)`;
}

function ElevRamp({ zmin, zmax }: { zmin: number; zmax: number }) {
  const steps = 10;
  const ticks = Array.from({ length: steps + 1 }, (_, i) => i / steps);
  const dz = zmax - zmin;
  const range = dz > 0.01;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[0.6875rem] font-medium text-foreground">Elevation color ramp</p>
      <div className="flex gap-1.5 items-center">
        <div
          className="h-5 w-28 rounded"
          style={{
            background: `linear-gradient(to right, ${ticks.map((t) => elevColorCss(t)).join(", ")})`,
          }}
        />
        <div className="flex flex-col text-[0.6rem] font-mono text-muted-foreground leading-none gap-0.5">
          <span>{zmin.toFixed(1)} ft</span>
          {range && <span>{((zmin + zmax) / 2).toFixed(1)}</span>}
          <span>{zmax.toFixed(1)} ft</span>
        </div>
      </div>
      {range && (
        <p className="text-[0.6rem] text-muted-foreground font-mono">Δz = {dz.toFixed(2)} ft</p>
      )}
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
  const terrainBusy = useBook((s) => s.terrainBusy);
  const shots = useBook((s) => s.shots);
  const [show3d, setShow3d] = useState(false);

  // Spot elevation stats
  const spotStats = useMemo(() => {
    if (!terrain || !terrain.pts.length) return null;
    const sorted = [...terrain.pts].sort((a, b) => a.z - b.z);
    const n = sorted.length;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1].z + sorted[n / 2].z) / 2 : sorted[Math.floor(n / 2)].z;
    const mean = terrain.pts.reduce((acc, p) => acc + p.z, 0) / n;
    return { high: sorted[n - 1], low: sorted[0], median, mean };
  }, [terrain]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Terrain / TIN surface</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Builds on load. Breakline codes (EP, EG, RC, etc.) constrain the TIN edges.
        </p>
      </div>
      <ScrollArea className="flex-1">
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => buildTerrain()} disabled={shots.length < 3 || terrainBusy}>
              {terrainBusy ? "Building…" : "Rebuild terrain"}
            </Button>
            {terrain && (
              <Button type="button" size="sm" variant="outline" onClick={() => setShow3d(true)}>
                View 3D
              </Button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={contoursOn} onChange={(e) => setContoursOn(e.target.checked)} />
            Show contours on map
          </label>

          {terrain ? (
            <>
              <div className="rounded border border-border bg-muted/20 p-2 flex flex-col gap-1.5">
                <p className="text-[0.6875rem] font-medium text-foreground">Surface statistics</p>
                <p className="font-mono text-[0.6rem] text-muted-foreground">
                  {terrain.pts.length.toLocaleString()} ground pts · {terrain.tris.length.toLocaleString()} triangles
                </p>
                <p className="font-mono text-[0.6rem] text-muted-foreground">
                  {terrain.contours.length} contour rings · interval {contourInterval} ft
                </p>
                {spotStats && (
                  <>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[0.6rem] text-muted-foreground mt-0.5">
                      <span className="text-foreground">High:</span><span>{spotStats.high.z.toFixed(2)} ft</span>
                      <span className="text-foreground">Low:</span><span>{spotStats.low.z.toFixed(2)} ft</span>
                      <span className="text-foreground">Mean:</span><span>{spotStats.mean.toFixed(2)} ft</span>
                      <span className="text-foreground">Median:</span><span>{spotStats.median.toFixed(2)} ft</span>
                    </div>
                    <p className="font-mono text-[0.6rem] text-muted-foreground">
                      High at N {spotStats.high.n.toFixed(1)} E {spotStats.high.e.toFixed(1)}
                    </p>
                    <p className="font-mono text-[0.6rem] text-muted-foreground">
                      Low at N {spotStats.low.n.toFixed(1)} E {spotStats.low.e.toFixed(1)}
                    </p>
                  </>
                )}
                <p className="font-mono text-[0.6rem] text-muted-foreground">{terrain.note}</p>
              </div>
              <ElevRamp zmin={terrain.zmin} zmax={terrain.zmax} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No surface yet. Build terrain to contour the survey.</p>
          )}
        </div>
      </ScrollArea>

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

// ---------------------------------------------------------------------------
// Element Info Panel — MicroStation-style full attributes for selected point
// ---------------------------------------------------------------------------
function ElemInfoPanel() {
  const shots = useBook((s) => s.shots);
  const selectedUid = useBook((s) => s.selectedUid);
  const updateShot = useBook((s) => s.updateShot);
  const remaps = useBook((s) => s.remaps);
  const focusOn = useBook((s) => s.focusOn);
  const setRightTab = useBook((s) => s.setRightTab);
  const isolated = useBook((s) => s.isolated);
  const isolate = useBook((s) => s.isolate);

  const shot = shots.find((s) => s.uid === selectedUid);

  const [edit, setEdit] = useState<{
    point: string; northing: string; easting: string; elevation: string; description: string;
  } | null>(null);

  // Whenever selected shot changes, reset inline edit
  useMemo(() => { setEdit(null); }, [selectedUid]);

  if (!shot) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
        <p>No element selected.</p>
        <p className="text-[0.6875rem]">Click a point on the map or select one in the Pts table.</p>
      </div>
    );
  }

  const feat = resolveFeature(shot, remaps);

  function startEdit() {
    setEdit({
      point: shot!.point,
      northing: shot!.northing.toFixed(4),
      easting: shot!.easting.toFixed(4),
      elevation: shot!.elevation.toFixed(4),
      description: shot!.description,
    });
  }

  function commitEdit() {
    if (!edit) return;
    const n = parseFloat(edit.northing);
    const e = parseFloat(edit.easting);
    const z = parseFloat(edit.elevation);
    if (isNaN(n) || isNaN(e) || isNaN(z)) {
      toast.error("Invalid coordinate");
      return;
    }
    updateShot(shot!.uid, { point: edit.point, northing: n, easting: e, elevation: z, description: edit.description });
    setEdit(null);
    toast.success(`Point ${edit.point} updated`);
  }

  const isIsolated = isolated === shot.codeToken.toUpperCase();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold font-mono">Pt {shot.point}</p>
          <div className="flex gap-1">
            <Tiny onClick={startEdit} label="Edit" />
            <Tiny
              onClick={() => { focusOn(shot.codeToken); setRightTab("levels"); }}
              label="Go to level"
            />
            <Tiny
              onClick={() => isolate(isIsolated ? null : shot.codeToken)}
              label={isIsolated ? "Show all" : "Isolate"}
            />
          </div>
        </div>

        {/* Element type badge */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="font-mono text-[0.6875rem]">
            {shot.codeToken}
          </Badge>
          {feat ? (
            <span className="text-[0.6875rem] text-muted-foreground">{feat.name}</span>
          ) : (
            <span className="text-[0.6875rem] text-muted-foreground italic">Unmatched code</span>
          )}
          {feat?.cat ? (
            <Badge variant="outline" className="font-mono text-[0.625rem]">{feat.cat}</Badge>
          ) : null}
        </div>

        {/* Coordinates */}
        <div className="rounded-md border border-border p-2 font-mono text-[0.6875rem]">
          <p className="mb-1 font-sans text-xs font-medium text-muted-foreground">Coordinates</p>
          {edit ? (
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-[5rem_1fr] items-center gap-1">
                <span className="text-muted-foreground">Point</span>
                <input
                  className="rounded border border-input bg-background px-1.5 py-0.5 font-mono text-[0.6875rem]"
                  value={edit.point}
                  onChange={(e) => setEdit((p) => p && ({ ...p, point: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-[5rem_1fr] items-center gap-1">
                <span className="text-muted-foreground">Northing</span>
                <input
                  className="rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono text-[0.6875rem]"
                  value={edit.northing}
                  onChange={(e) => setEdit((p) => p && ({ ...p, northing: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-[5rem_1fr] items-center gap-1">
                <span className="text-muted-foreground">Easting</span>
                <input
                  className="rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono text-[0.6875rem]"
                  value={edit.easting}
                  onChange={(e) => setEdit((p) => p && ({ ...p, easting: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-[5rem_1fr] items-center gap-1">
                <span className="text-muted-foreground">Elevation</span>
                <input
                  className="rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono text-[0.6875rem]"
                  value={edit.elevation}
                  onChange={(e) => setEdit((p) => p && ({ ...p, elevation: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-[5rem_1fr] items-center gap-1">
                <span className="text-muted-foreground">Description</span>
                <input
                  className="rounded border border-input bg-background px-1.5 py-0.5 font-mono text-[0.6875rem]"
                  value={edit.description}
                  onChange={(e) => setEdit((p) => p && ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-1 pt-1">
                <Button size="sm" className="h-6 text-xs" onClick={commitEdit}>Apply</Button>
                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setEdit(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <tbody>
                {[
                  ["Point", shot.point],
                  ["Northing", shot.northing.toFixed(4)],
                  ["Easting", shot.easting.toFixed(4)],
                  ["Elevation", `${shot.elevation.toFixed(4)} ft`],
                  ["Description", shot.description || "—"],
                  ["Remainder", shot.remainder || "—"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border/50">
                    <td className="py-0.5 pr-2 text-muted-foreground">{label}</td>
                    <td className="py-0.5 text-right">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feature info */}
        {feat ? (
          <div className="rounded-md border border-border p-2 font-mono text-[0.6875rem]">
            <p className="mb-1 font-sans text-xs font-medium text-muted-foreground">Feature library</p>
            <table className="w-full">
              <tbody>
                {[
                  ["ID", feat.id],
                  ["Name", feat.name],
                  ["Category", feat.cat],
                  ["Kind", feat.kind],
                  ["Point sym", feat.pointSym || "—"],
                  ["Linear sym", feat.linearSym || "—"],
                  ["Description", feat.desc || "—"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border/50">
                    <td className="py-0.5 pr-2 text-muted-foreground">{label}</td>
                    <td className="py-0.5 text-right">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* QA flags on this point */}
        {shot.issues?.length ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2">
            <p className="mb-1 text-xs font-medium text-destructive">QA flags</p>
            <ul className="space-y-0.5">
              {shot.issues.map((issue, i) => (
                <li key={i} className="text-[0.6875rem] text-destructive">{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Shot index context */}
        <p className="text-[0.625rem] text-muted-foreground font-mono">
          Row {shot.rowIndex + 1} · uid {shot.uid} · {shots.length} total pts
        </p>
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Batch Recode Panel — mass-recode all points of one code to another
// ---------------------------------------------------------------------------
function BatchRecodePanel() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const batchRecode = useBook((s) => s.batchRecode);
  const recodeShot = useBook((s) => s.recodeShot);
  const isolated = useBook((s) => s.isolated);
  const isolate = useBook((s) => s.isolate);

  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Aggregate codes from shots
  const codeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shots) {
      const c = s.codeToken.toUpperCase();
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [shots]);

  // Preview — how many shots would be recoded
  const previewCount = useMemo(() => {
    const from = fromCode.trim().toUpperCase();
    if (!from) return 0;
    return shots.filter((s) => s.codeToken.toUpperCase() === from).length;
  }, [shots, fromCode]);

  function doRecode() {
    const from = fromCode.trim().toUpperCase();
    const to = toCode.trim().toUpperCase();
    if (!from || !to) { toast.error("Enter both From and To codes"); return; }
    if (from === to) { toast.error("From and To are the same"); return; }
    const n = batchRecode(from, to);
    if (n === 0) {
      toast.message(`No points with code ${from} found`);
      setLastResult(null);
    } else {
      toast.success(`Recoded ${n} point${n !== 1 ? "s" : ""} from ${from} → ${to}`);
      setLastResult(`${n} pts ${from} → ${to}`);
      setFromCode(to);
      setToCode("");
    }
  }

  // Select a single shot to recode individually
  const selectedUid = useBook((s) => s.selectedUid);
  const selectedShot = shots.find((s) => s.uid === selectedUid);

  function recodeSingle(to: string) {
    if (!selectedShot || !to.trim()) return;
    recodeShot(selectedShot.uid, to.trim().toUpperCase());
    toast.success(`Recoded Pt ${selectedShot.point} → ${to.trim().toUpperCase()}`);
  }

  const [singleCode, setSingleCode] = useState("");

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 px-3 py-3">
        <p className="text-sm font-medium">Batch Recode</p>

        {/* Code inventory */}
        <div className="rounded-md border border-border">
          <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
            <p className="text-xs font-medium">Code inventory ({codeCounts.length})</p>
            {isolated ? (
              <Tiny onClick={() => isolate(null)} label="Show all" />
            ) : null}
          </div>
          <div className="max-h-40 overflow-auto">
            {codeCounts.map(([code, count]) => {
              const feat = resolveFeature({ codeToken: code, description: code, remainder: "", matchId: null, uid: "", rowIndex: 0, point: "", northing: 0, easting: 0, elevation: 0, issues: [] }, remaps);
              const isIso = isolated === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setFromCode(code); }}
                  onDoubleClick={() => isolate(isIso ? null : code)}
                  title="Click to use as From code · Double-click to isolate"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 border-b border-border/50 px-2 py-1 text-left text-[0.6875rem] hover:bg-accent",
                    fromCode === code && "bg-accent",
                    isIso && "ring-1 ring-inset ring-primary",
                  )}
                >
                  <span className="font-mono font-medium">{code}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {feat ? <span className="max-w-[8rem] truncate">{feat.name}</span> : null}
                    <span>{count} pts</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch recode form */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="recode-from" className="text-xs">From code</Label>
              <Input
                id="recode-from"
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                placeholder="EP"
                className="h-7 font-mono text-xs uppercase"
              />
            </div>
            <span className="mb-1 text-sm text-muted-foreground">→</span>
            <div className="flex flex-col gap-1">
              <Label htmlFor="recode-to" className="text-xs">To code</Label>
              <Input
                id="recode-to"
                value={toCode}
                onChange={(e) => setToCode(e.target.value.toUpperCase())}
                placeholder="EP2"
                className="h-7 font-mono text-xs uppercase"
              />
            </div>
          </div>
          {previewCount > 0 ? (
            <p className="text-[0.6875rem] text-muted-foreground">
              Will recode <span className="font-semibold text-foreground">{previewCount}</span> point{previewCount !== 1 ? "s" : ""}
            </p>
          ) : fromCode ? (
            <p className="text-[0.6875rem] text-destructive">No points with code {fromCode}</p>
          ) : null}
          <Button size="sm" onClick={doRecode} disabled={!fromCode || !toCode} className="w-full">
            Recode {previewCount > 0 ? `(${previewCount} pts)` : ""}
          </Button>
          {lastResult ? (
            <p className="font-mono text-[0.625rem] text-ok">✓ {lastResult}</p>
          ) : null}
        </div>

        {/* Single-shot recode */}
        {selectedShot ? (
          <div className="flex flex-col gap-2 rounded-md border border-border p-2">
            <p className="text-xs font-medium">
              Selected: Pt {selectedShot.point} · <span className="font-mono">{selectedShot.codeToken}</span>
            </p>
            <div className="flex gap-2">
              <Input
                value={singleCode}
                onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                placeholder="New code"
                className="h-7 flex-1 font-mono text-xs uppercase"
              />
              <Button size="sm" className="h-7" onClick={() => { recodeSingle(singleCode); setSingleCode(""); }}>
                Apply
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[0.6875rem] text-muted-foreground">Select a point to recode it individually.</p>
        )}
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// DXF Layer Standards Panel — view/configure layer names, colors, weights
// ---------------------------------------------------------------------------

const DEFAULT_LAYERS = [
  { name: "BOUNDARY",       color: 1,  weight: 2, desc: "Property / boundary lines",       group: "Boundary" },
  { name: "EASEMENT",       color: 4,  weight: 1, desc: "Easements & ROW",                  group: "Boundary" },
  { name: "ROW",            color: 4,  weight: 2, desc: "Right-of-way lines",                group: "Boundary" },
  { name: "TOPO-CONTOUR",   color: 3,  weight: 1, desc: "Major contour lines (5 ft)",        group: "Topo" },
  { name: "TOPO-INDEX",     color: 3,  weight: 2, desc: "Index contour lines (25 ft)",       group: "Topo" },
  { name: "TOPO-MINOR",     color: 3,  weight: 0, desc: "Minor contour lines (1 ft)",        group: "Topo" },
  { name: "EP",             color: 7,  weight: 1, desc: "Edge of pavement",                  group: "Road" },
  { name: "CL",             color: 5,  weight: 1, desc: "Road centerline",                   group: "Road" },
  { name: "BACK-CURB",      color: 7,  weight: 0, desc: "Back of curb",                      group: "Road" },
  { name: "GUARD-RAIL",     color: 6,  weight: 1, desc: "Guardrail / barrier",               group: "Road" },
  { name: "DRAINAGE",       color: 4,  weight: 1, desc: "Drainage features & swales",        group: "Drainage" },
  { name: "DITCH",          color: 4,  weight: 0, desc: "Ditch centerline",                  group: "Drainage" },
  { name: "CULVERT",        color: 4,  weight: 1, desc: "Culvert pipes",                     group: "Drainage" },
  { name: "INLET",          color: 4,  weight: 0, desc: "Storm inlets",                      group: "Drainage" },
  { name: "TREE-DL",        color: 3,  weight: 1, desc: "Tree drip lines",                   group: "Veg" },
  { name: "TREE-PT",        color: 3,  weight: 0, desc: "Tree points",                       group: "Veg" },
  { name: "FENCE",          color: 6,  weight: 1, desc: "Fence lines",                       group: "Struct" },
  { name: "BLDG",           color: 7,  weight: 2, desc: "Building outlines",                 group: "Struct" },
  { name: "WALL",           color: 7,  weight: 1, desc: "Retaining / concrete walls",        group: "Struct" },
  { name: "UTILITY-OHE",    color: 2,  weight: 0, desc: "Overhead electric",                 group: "Utility" },
  { name: "UTILITY-UGE",    color: 2,  weight: 0, desc: "Underground electric",              group: "Utility" },
  { name: "UTILITY-GAS",    color: 1,  weight: 0, desc: "Gas lines",                         group: "Utility" },
  { name: "UTILITY-SAN",    color: 5,  weight: 1, desc: "Sanitary sewer",                    group: "Utility" },
  { name: "UTILITY-STORM",  color: 4,  weight: 1, desc: "Storm sewer",                       group: "Utility" },
  { name: "UTILITY-WATER",  color: 5,  weight: 1, desc: "Water main",                        group: "Utility" },
  { name: "CTRL-PT",        color: 2,  weight: 2, desc: "Control points (benchmarks, traverse)", group: "Control" },
  { name: "CTRL-MON",       color: 2,  weight: 1, desc: "Monuments",                         group: "Control" },
  { name: "SURVEY-PT",      color: 7,  weight: 0, desc: "Shot points (all other topo)",      group: "Survey" },
  { name: "SURVEY-LABELS",  color: 7,  weight: 0, desc: "Point labels & numbers",            group: "Survey" },
  { name: "SURVEY-LEADERS", color: 7,  weight: 0, desc: "Leader notes",                      group: "Survey" },
] as const;

const ACI_NAMES: Record<number, string> = {
  1: "Red", 2: "Yellow", 3: "Green", 4: "Cyan", 5: "Blue", 6: "Magenta", 7: "White",
};
const ACI_HEX: Record<number, string> = {
  1: "#ff0000", 2: "#ffff00", 3: "#00ff00", 4: "#00ffff", 5: "#0000ff", 6: "#ff00ff", 7: "#ffffff",
};

function LayerStandardsPanel() {
  const [filter, setFilter] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const l of DEFAULT_LAYERS) {
      if (!seen.has(l.group)) { seen.add(l.group); out.push(l.group); }
    }
    return out;
  }, []);

  const visible = useMemo(() => {
    const q = filter.toLowerCase();
    return DEFAULT_LAYERS.filter((l) => {
      if (activeGroup && l.group !== activeGroup) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q);
    });
  }, [filter, activeGroup]);

  function downloadLayerDxf() {
    // Emit a DXF LAYER table that can be merged into any drawing
    const lines = [
      "0", "SECTION", "2", "TABLES",
      "0", "TABLE", "2", "LAYER", "70", String(DEFAULT_LAYERS.length),
      ...DEFAULT_LAYERS.flatMap((l) => [
        "0", "LAYER",
        "2", l.name,
        "70", "0",
        "62", String(l.color),
        "6", "Continuous",
        "370", String(l.weight),
      ]),
      "0", "ENDTAB",
      "0", "ENDSEC",
      "0", "EOF",
    ];
    const text = lines.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/dxf" }));
    a.download = "survey-layer-standards.dxf";
    a.click();
    toast.success("survey-layer-standards.dxf downloaded");
  }

  function downloadLayerCsv() {
    const csv = ["Layer,Group,Color,Weight,Description",
      ...DEFAULT_LAYERS.map((l) => `${l.name},${l.group},${l.color} (${ACI_NAMES[l.color] ?? l.color}),${l.weight},"${l.desc}"`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "survey-layer-standards.csv";
    a.click();
    toast.success("survey-layer-standards.csv downloaded");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">DXF Layer Standards</p>
          <div className="flex gap-1">
            <Tiny onClick={downloadLayerDxf} label="DXF ↓" />
            <Tiny onClick={downloadLayerCsv} label="CSV ↓" />
          </div>
        </div>
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          CADD naming per INDOT / FHWA convention · AutoCAD Color Index
        </p>
      </div>

      {/* Group filter pills */}
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-border px-3 py-1.5">
        <button
          type="button"
          onClick={() => setActiveGroup(null)}
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.6875rem]",
            !activeGroup ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent",
          )}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.6875rem]",
              activeGroup === g ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-1.5 border-b border-border">
        <Input
          placeholder="Filter layers…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      {/* Layer table */}
      <ScrollArea className="min-h-0 flex-1">
        <table className="w-full font-mono text-[0.625rem]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="px-2 py-1 text-left">Layer name</th>
              <th className="px-2 py-1 text-center" title="AutoCAD Color Index">ACI</th>
              <th className="px-2 py-1 text-center" title="Line weight (mm × 100)">Wt</th>
              <th className="px-2 py-1 text-left hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <tr key={l.name} className="border-b border-border/50 hover:bg-accent/50">
                <td className="px-2 py-1 font-medium">{l.name}</td>
                <td className="px-2 py-1">
                  <span className="flex items-center justify-center gap-1">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm border border-border"
                      style={{ background: ACI_HEX[l.color] ?? "#888" }}
                    />
                    <span className="text-muted-foreground">{l.color}</span>
                  </span>
                </td>
                <td className="px-2 py-1 text-center text-muted-foreground">{l.weight}</td>
                <td className="px-2 py-1 text-muted-foreground hidden sm:table-cell">{l.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No layers match.</p>
        ) : null}
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-3 py-1.5">
        <p className="font-mono text-[0.625rem] text-muted-foreground">
          {DEFAULT_LAYERS.length} standard layers · Color = AutoCAD ACI · Wt = lineweight index
        </p>
      </div>
    </div>
  );
}
