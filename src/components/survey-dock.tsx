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
} from "@/lib/cogo";

const TABS: { id: RightTab; label: string }[] = [
  { id: "levels", label: "Levels" },
  { id: "linear", label: "Linear" },
  { id: "terrain", label: "TIN" },
  { id: "cogo", label: "COGO" },
  { id: "qa", label: "QA" },
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
        {tab === "qa" ? <QaPanel /> : null}
        {tab === "details" ? <DetailsPanel /> : null}
      </div>
    </div>
  );
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
                  <div className="flex flex-wrap gap-1 px-3 pb-2">
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
                      onClick={() => {
                        useBook.getState().setSelectedLine(l.id);
                        deleteSelected();
                      }}
                      label="Delete"
                    />
                  </div>
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
