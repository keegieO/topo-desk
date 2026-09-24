import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  FileUp,
  Download,
  RotateCcw,
  Eraser,
  Copy,
  Map as MapIcon,
  Tag,
  Table2,
  Layers,
  BookOpen,
  PanelLeft,
  PanelRight,
  List,
  MessageSquare,
  MousePointer2,
  Move,
  Spline,
  Pentagon,
  Type,
  MapPin,
  Ruler,
  ShieldCheck,
  FilePlus2,
  Waypoints,
  GitMerge,
  Scissors,
  ArrowLeftRight,
  Mountain,
  Play,
  MoveHorizontal,
  Save,
  Globe,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBook, templateOf, type CadTool, type MapMode } from "@/lib/store";
import { TEMPLATES, EXPORT_KINDS, applyTemplate, resolveFeature } from "@/lib/label";
import { buildExport } from "@/lib/export";
import { extractsAsShots, buildChains, chainVertices } from "@/lib/chains";
import { allChains, buildDxf, buildLandXml, cadFilenames } from "@/lib/cad-export";
import { htmlSheetSet } from "@/lib/sheet-set";
import { openDocument } from "@/lib/print";
import { terrainFromBook } from "@/lib/terrain";
import { downloadBlob, downloadText } from "@/lib/utils";
import { buildOrdPackage } from "@/lib/ord-package";
import { packProject, projectFilename } from "@/lib/project-file";
import { useJobs } from "@/lib/jobs";
import { saveActiveDrawing } from "@/lib/open-job";
import type { CoordOrder } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { buildFieldbookReport } from "@/lib/report";
import { runQa } from "@/lib/qa";
import { polylineLength } from "@/lib/cogo";

const RIBBON_TABS = ["File", "Home", "Field Book", "Drawing", "Terrain", "View"] as const;
type RibbonTab = (typeof RIBBON_TABS)[number];

export function Ribbon({
  onOpenFiles,
  onAppendFiles,
}: {
  onOpenFiles?: (files: FileList | null) => void;
  onAppendFiles?: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const appendRef = useRef<HTMLInputElement>(null);
  const shots = useBook((s) => s.shots);
  const fileName = useBook((s) => s.fileName);
  const order = useBook((s) => s.order);
  const remaps = useBook((s) => s.remaps);
  const templateId = useBook((s) => s.templateId);
  const exportKind = useBook((s) => s.exportKind);
  const labelsOn = useBook((s) => s.labelsOn);
  const legendOn = useBook((s) => s.legendOn);
  const tableOn = useBook((s) => s.tableOn);
  const gcsOn = useBook((s) => s.gcsOn);
  const keyinOn = useBook((s) => s.keyinOn);
  const stylesOn = useBook((s) => s.stylesOn);
  const mapMode = useBook((s) => s.mapMode);
  const setMapMode = useBook((s) => s.setMapMode);
  const earthOn = useBook((s) => s.earthOn);
  const setEarthOn = useBook((s) => s.setEarthOn);
  const leftOpen = useBook((s) => s.leftOpen);
  const rightOpen = useBook((s) => s.rightOpen);
  const shotsOpen = useBook((s) => s.shotsOpen);
  const tool = useBook((s) => s.tool);
  const rightTab = useBook((s) => s.rightTab);
  const loadSample = useBook((s) => s.loadSample);
  const clear = useBook((s) => s.clear);
  const setOrder = useBook((s) => s.setOrder);
  const setTemplate = useBook((s) => s.setTemplate);
  const setExportKind = useBook((s) => s.setExportKind);
  const setLabelsOn = useBook((s) => s.setLabelsOn);
  const setLegendOn = useBook((s) => s.setLegendOn);
  const setTableOn = useBook((s) => s.setTableOn);
  const setGcsOn = useBook((s) => s.setGcsOn);
  const setKeyinOn = useBook((s) => s.setKeyinOn);
  const setStylesOn = useBook((s) => s.setStylesOn);
  const setLeftOpen = useBook((s) => s.setLeftOpen);
  const setRightOpen = useBook((s) => s.setRightOpen);
  const setShotsOpen = useBook((s) => s.setShotsOpen);
  const setTool = useBook((s) => s.setTool);
  const setRightTab = useBook((s) => s.setRightTab);
  const userLines = useBook((s) => s.userLines);
  const extractAll = useBook((s) => s.extractAll);
  const contoursOn = useBook((s) => s.contoursOn);
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState<RibbonTab>("Home");

  function exportNow() {
    if (!shots.length) {
      toast.error("No points to export");
      return;
    }
    const extra = extractsAsShots(userLines);
    const { filename, csv } = buildExport({
      shots: [...shots, ...extra],
      remaps,
      kind: exportKind,
      template: templateOf(templateId),
      order,
      fileName: fileName || "fieldbook",
    });
    downloadText(filename, csv);
    toast.success(`Downloaded ${filename}`);
    setExportOpen(false);
  }

  function exportCad(kind: "dxf" | "xml") {
    if (!shots.length && !userLines.length) {
      toast.error("No linework");
      return;
    }
    const chains = allChains(shots, remaps, userLines);
    const names = cadFilenames(fileName || "fieldbook");
    if (kind === "dxf") {
      const book = useBook.getState();
      const built = book.terrain ?? (book.contoursOn ? terrainFromBook(shots, remaps, userLines, book.contourInterval) : null);
      const contours = built?.contours ?? [];
      downloadText(names.dxf, buildDxf({ shots, chains, leaders: book.leaders, contours }), "application/dxf;charset=utf-8");
      toast.success(names.dxf);
    } else {
      const job = useJobs.getState().jobs.find((j) => j.id === useJobs.getState().activeId);
      downloadText(
        names.xml,
        buildLandXml({
          shots,
          chains,
          remaps,
          project: job?.name || fileName || "survey",
          crs: job?.crs || "Indiana InGCS — NAD 1983 (2011)",
          terrain: useBook.getState().terrain,
        }),
        "application/xml;charset=utf-8",
      );
      toast.success(names.xml);
    }
    setExportOpen(false);
  }

  function copyLabels() {
    if (!shots.length) return;
    const tmpl = templateOf(templateId);
    const lines = shots.map((s) => {
      const f = resolveFeature(s, remaps);
      return `${s.point},${applyTemplate(s, f, tmpl)}`;
    });
    void navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied point labels");
  }

  function processBook() {
    const chains = buildChains(shots, remaps);
    toast.success(`Processed ${shots.length} points · ${chains.length} linear strings`);
    useBook.getState().setRightTab("linear");
  }

  function doExtractAll() {
    const n = extractAll();
    if (!n) toast.message("Nothing new to extract — field-to-finish strings already on the extract layer.");
    else toast.success(`Extracted ${n} linear feature${n === 1 ? "" : "s"}`);
  }

  function plotSheet() {
    if (!shots.length && !userLines.length) {
      toast.error("No linework");
      return;
    }
    const job = useJobs.getState().jobs.find((j) => j.id === useJobs.getState().activeId);
    const chains = allChains(shots, remaps, userLines);
    openDocument(
      `${job?.des || "plan"}_plan_sheet.html`,
      htmlSheetSet({
        title: job?.name || fileName || "Plan",
        des: job?.des || "",
        client: job?.client || "",
        county: job?.county || "",
        crs: job?.crs || "",
        date: job?.survey?.date || "",
        firm: "Breakline",
        shots,
        chains,
        leaders: useBook.getState().leaders,
        contours: useBook.getState().terrain?.contours,
      }),
    );
  }

  function packageOrd() {
    if (!shots.length && !userLines.length) {
      toast.error("No points to package");
      return;
    }
    const st = useJobs.getState();
    const job = st.jobs.find((j) => j.id === st.activeId);
    const pack = buildOrdPackage({
      stem: fileName || job?.des || "fieldbook",
      shots,
      remaps,
      userLines,
      order,
      template: templateOf(templateId),
      job,
      fileName: fileName || "",
      leaders: useBook.getState().leaders,
      terrain: useBook.getState().terrain,
    });
    downloadBlob(pack.filename, pack.blob);
    toast.success(pack.filename);
    setExportOpen(false);
  }

  function reportBook() {
    const job = useJobs.getState().jobs.find((j) => j.id === useJobs.getState().activeId);
    const chains = allChains(shots, remaps, userLines).map((c) => ({
      code: c.code,
      n: c.shots.length || c.pts?.length || 0,
      length: polylineLength(chainVertices(c)),
      closed: c.closed,
      source: c.source,
    }));
    const qa = runQa(shots, remaps, userLines, useBook.getState().skipped);
    const text = buildFieldbookReport({
      jobName: job?.name || fileName || "Field book",
      fileName: fileName || "",
      shots,
      remaps,
      survey: useBook.getState().survey,
      chains,
      extracts: userLines.length,
      qa,
    });
    downloadText(`${(fileName || "fieldbook").replace(/\.[^.]+$/, "")}_report.txt`, text, "text/plain;charset=utf-8");
    toast.success("Field book report");
    setExportOpen(false);
  }

  const accept = ".csv,.txt,.asc,.xyz,.pnezd,.penzd,.fbk,.rw5,.raw,.gsi,.jxl,.dc,.json";

  return (
    <div className="border-b border-border bg-ribbon">
      <div className="flex h-7 items-end gap-0 overflow-x-auto px-1">
        {RIBBON_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-7 shrink-0 px-3 text-xs",
              tab === t
                ? "border-b-2 border-primary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-nowrap items-center gap-0.5 overflow-x-auto px-2 py-1">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            onOpenFiles?.(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={appendRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            onAppendFiles?.(e.target.files);
            e.target.value = "";
          }}
        />
        <div className={tab === "File" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Primary</span>
        <RibbonBtn onClick={() => inputRef.current?.click()} icon={<FileUp />} label="Open" />
        <RibbonBtn
          onClick={() => {
            if (!shots.length && !useBook.getState().raw) {
              toast.error("Nothing to save");
              return;
            }
            const name = projectFilename(fileName);
            downloadText(name, packProject(), "application/json;charset=utf-8");
            if (saveActiveDrawing()) toast.success(`Saved ${name}`);
            else toast.success(`Saved ${name} on this computer`);
          }}
          icon={<Save />}
          label="Save file"
        />
        <RibbonBtn onClick={() => appendRef.current?.click()} icon={<FilePlus2 />} label="Append" />
        <RibbonBtn onClick={plotSheet} icon={<Download />} label="Sheets" />
        <RibbonBtn onClick={clear} icon={<Eraser />} label="Clear" />
        </div>

        <div className={tab === "Field Book" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Field book</span>
        <RibbonBtn onClick={loadSample} icon={<RotateCcw />} label="Sample" />

        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <RibbonBtn onClick={processBook} icon={<Play />} label="Process" />
        <RibbonBtn onClick={doExtractAll} icon={<Waypoints />} label="Extract all" />
        <ToggleBtn on={shotsOpen} onClick={() => setShotsOpen(!shotsOpen)} icon={<List />} label="Book" />
        <ToggleBtn
          on={rightOpen && rightTab === "qa"}
          onClick={() => setRightTab("qa")}
          icon={<ShieldCheck />}
          label="QA"
        />
        </div>

        <div className={tab === "File" ? "contents" : "hidden"}>
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogTrigger asChild>
            <RibbonBtn icon={<Download />} label="Export" />
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="order">Coordinate order</Label>
                <NativeSelect id="order" value={order} onChange={(e) => setOrder(e.target.value as CoordOrder)}>
                  <option value="PNEZD">PNEZD — Point, Northing, Easting, Z, Desc</option>
                  <option value="PENZD">PENZD — Point, Easting, Northing, Z, Desc</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tmpl">Plan label</Label>
                <NativeSelect
                  id="tmpl"
                  value={templateId}
                  onChange={(e) => setTemplate(e.target.value as typeof templateId)}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kind">Format</Label>
                <NativeSelect
                  id="kind"
                  value={exportKind}
                  onChange={(e) => setExportKind(e.target.value as typeof exportKind)}
                >
                  {EXPORT_KINDS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={exportNow} disabled={!shots.length}>
                  <Download />
                  Download CSV
                </Button>
                <Button variant="secondary" onClick={() => exportCad("dxf")} disabled={!shots.length && !userLines.length}>
                  DXF
                </Button>
                <Button variant="secondary" onClick={() => exportCad("xml")} disabled={!shots.length && !userLines.length}>
                  LandXML
                </Button>
                <Button variant="outline" onClick={copyLabels} disabled={!shots.length}>
                  <Copy />
                  Copy labels
                </Button>
                <Button variant="secondary" onClick={packageOrd} disabled={!shots.length && !userLines.length}>
                  ORD package
                </Button>
                <Button variant="outline" onClick={reportBook} disabled={!shots.length}>
                  Field book report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Link
          to="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent"
        >
          Desk
        </Link>
        <Link
          to="/codes"
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Library</span>
        </Link>
        </div>

        <div className={tab === "Home" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Selection</span>
        <ToolBtn id="select" tool={tool} setTool={setTool} icon={<MousePointer2 />} label="Element" />
        <ToolBtn id="move" tool={tool} setTool={setTool} icon={<Move />} label="Move" />
        <ToolBtn id="line" tool={tool} setTool={setTool} icon={<Spline />} label="Line" />
        <ToolBtn id="shape" tool={tool} setTool={setTool} icon={<Pentagon />} label="Shape" />
        <ToolBtn id="place" tool={tool} setTool={setTool} icon={<MapPin />} label="Point" />
        <ToolBtn id="recode" tool={tool} setTool={setTool} icon={<Type />} label="Recode" />
        <ToolBtn id="text" tool={tool} setTool={setTool} icon={<MessageSquare />} label="Text" />
        </div>

        <div className={tab === "Drawing" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Manipulate</span>
        <ToolBtn id="measure" tool={tool} setTool={setTool} icon={<Ruler />} label="Measure" />
        <ToolBtn id="inverse" tool={tool} setTool={setTool} icon={<ArrowLeftRight />} label="Inverse" />
        <ToolBtn id="offset" tool={tool} setTool={setTool} icon={<MoveHorizontal />} label="Offset" />
        <ToolBtn id="join" tool={tool} setTool={setTool} icon={<GitMerge />} label="Join" />
        <ToolBtn id="split" tool={tool} setTool={setTool} icon={<Scissors />} label="Split" />
        <ToggleBtn on={stylesOn} onClick={() => setStylesOn(!stylesOn)} icon={<Spline />} label="Styles" />
        <ToggleBtn on={labelsOn} onClick={() => setLabelsOn(!labelsOn)} icon={<Tag />} label="Labels" />
        <ToggleBtn on={useBook((s) => s.arrowOn)} onClick={() => useBook.getState().setArrowOn(!useBook.getState().arrowOn)} icon={<MousePointer2 />} label="Arrow" />
        <RibbonBtn
          onClick={() => {
            const n = useBook.getState().autoNotes();
            if (!n) toast.message("No notes on the points");
            else toast.success(`${n} notes`);
          }}
          icon={<MessageSquare />}
          label="Auto notes"
        />
        </div>

        <div className={tab === "Terrain" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Terrain</span>
        <ToggleBtn
          on={contoursOn}
          onClick={() => {
            const s = useBook.getState();
            if (s.contoursOn) s.setContoursOn(false);
            else s.buildTerrain();
          }}
          icon={<Mountain />}
          label="TIN"
        />
        </div>

        <div className={tab === "View" ? "contents" : "hidden"}>
        <span className="px-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">Display</span>
          {(
            [
              ["off", "Off"],
              ["aerial", "Aerial"],
              ["hybrid", "Hybrid"],
              ["roads", "Roads"],
            ] as [MapMode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMapMode(id)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 px-2 text-xs font-medium",
                mapMode === id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {id === "hybrid" ? <MapIcon className="h-3.5 w-3.5" /> : null}
              <span className={id === "hybrid" ? "" : "hidden md:inline"}>{label}</span>
            </button>
          ))}
        <ToggleBtn on={earthOn} onClick={() => setEarthOn(!earthOn)} icon={<Globe />} label="Earth" />
        <ToggleBtn on={legendOn} onClick={() => setLegendOn(!legendOn)} icon={<Layers />} label="Legend" />
        <ToggleBtn on={tableOn} onClick={() => setTableOn(!tableOn)} icon={<Table2 />} label="Control" />
        <ToggleBtn on={gcsOn} onClick={() => setGcsOn(!gcsOn)} icon={<MapIcon />} label="GCS" />
        <ToggleBtn on={keyinOn} onClick={() => setKeyinOn(!keyinOn)} icon={<Type />} label="Key-in" />
        <ToggleBtn on={leftOpen} onClick={() => setLeftOpen(!leftOpen)} icon={<PanelLeft />} label="Levels" />
        <ToggleBtn on={rightOpen} onClick={() => setRightOpen(!rightOpen)} icon={<PanelRight />} label="Survey" />
        </div>
      </div>
    </div>
  );
}

function RibbonBtn({
  onClick,
  icon,
  label,
}: {
  onClick?: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Button type="button" variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-xs" onClick={onClick}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function ToggleBtn({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium",
        on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function ToolBtn({
  id,
  tool,
  setTool,
  icon,
  label,
}: {
  id: CadTool;
  tool: CadTool;
  setTool: (t: CadTool) => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => setTool(id)}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium",
        tool === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
