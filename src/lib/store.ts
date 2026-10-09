import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseSurveyCsv, type CoordOrder } from "./csv";
import { labelShots, splitDescription, TEMPLATES, type ExportKind, type LabeledShot, type TemplateId } from "./label";
import { lookupCode } from "./catalog";
import { SAMPLE_CSV, SAMPLE_NAME } from "./sample";
import type { UserLine, Vertex } from "./chains";
import type { SurveyMeta } from "./job-types";
import { emptySurvey } from "./job-types";
import { parseFieldbook, shotsToPnezd } from "./fieldbook";
import { extractAllLines, extractChainById, joinUserLines, offsetUserLine, splitUserLine } from "./linear-edit";
import { insertOnSegment, nearestVertexIndex, type CogoResult } from "./cogo";
import { autoLeaders, type Leader } from "./notes";
import { terrainFromBook, type TerrainModel } from "./terrain";
import { replaceCode, withNote } from "./fieldcode";

type Filter = "all" | "matched" | "unmatched";

export type CadTool =
  | "select"
  | "move"
  | "line"
  | "shape"
  | "recode"
  | "place"
  | "measure"
  | "inverse"
  | "offset"
  | "join"
  | "split"
  | "text";
export type MapMode = "off" | "aerial" | "hybrid" | "roads";
export type RightTab = "levels" | "linear" | "terrain" | "cogo" | "qa" | "details" | "sheet" | "profile" | "pts";

/** Editable title-block fields for plan sheets and ORD package. */
export type SheetMeta = {
  title: string;
  des: string;
  client: string;
  county: string;
  crs: string;
  drawnBy: string;
  checkedBy: string;
  date: string;
  scale: string;
  sheetOf: string;
};

export type CursorNez = { n: number; e: number; z: number; lat?: number; lon?: number } | null;

type State = {
  fileName: string;
  raw: string;
  order: CoordOrder;
  shots: LabeledShot[];
  skipped: number;
  hadHeader: boolean;
  remaps: Record<string, string>;
  templateId: TemplateId;
  exportKind: ExportKind;
  filter: Filter;
  selectedUid: string | null;
  selectedLineId: string | null;
  query: string;
  hiddenAlphas: Record<string, boolean>;
  frozenAlphas: Record<string, boolean>;
  labelsOn: boolean;
  legendOn: boolean;
  tableOn: boolean;
  gcsOn: boolean;
  keyinOn: boolean;
  stylesOn: boolean;
  uiRev: number;
  mapMode: MapMode;
  earthOn: boolean;
  leftOpen: boolean;
  rightOpen: boolean;
  shotsOpen: boolean;
  focusNonce: number;
  focusAlpha: string | null;
  tool: CadTool;
  activeCode: string | null;
  userLines: UserLine[];
  draft: Vertex[];
  measure: Vertex[];
  cursor: CursorNez;
  isolated: string | null;
  crsId: string;
  rightTab: RightTab;
  survey: SurveyMeta;
  surveyStringsOn: boolean;
  contoursOn: boolean;
  contourInterval: number;
  terrain: TerrainModel | null;
  terrainBusy: boolean;
  offsetFt: number;
  cogo: CogoResult | null;
  joinPending: string | null;
  leaders: Leader[];
  textTip: Vertex | null;
  arrowOn: boolean;
  selectedLeaderId: string | null;
  sheetMeta: SheetMeta;
  setSheetMeta: (patch: Partial<SheetMeta>) => void;
  loadText: (raw: string, fileName: string) => void;
  loadSample: () => void;
  loadBook: (raw: string, fileName: string, extra?: { remaps?: Record<string, string>; userLines?: UserLine[]; survey?: SurveyMeta; order?: CoordOrder; leaders?: Leader[] }) => void;
  appendText: (raw: string, fileName: string) => { added: number; warnings: string[] };
  clear: () => void;
  setOrder: (order: CoordOrder) => void;
  setRemap: (code: string, featureId: string | null) => void;
  setTemplate: (id: TemplateId) => void;
  setExportKind: (k: ExportKind) => void;
  setFilter: (f: Filter) => void;
  setSelected: (uid: string | null) => void;
  setSelectedLine: (id: string | null) => void;
  setQuery: (q: string) => void;
  toggleAlpha: (code: string) => void;
  showAllAlphas: () => void;
  hideAllAlphas: (codes: string[]) => void;
  toggleFrozen: (code: string) => void;
  setLabelsOn: (v: boolean) => void;
  setLegendOn: (v: boolean) => void;
  setTableOn: (v: boolean) => void;
  setGcsOn: (v: boolean) => void;
  setKeyinOn: (v: boolean) => void;
  setStylesOn: (v: boolean) => void;
  setMapMode: (m: MapMode) => void;
  setEarthOn: (v: boolean) => void;
  setLeftOpen: (v: boolean) => void;
  setRightOpen: (v: boolean) => void;
  setShotsOpen: (v: boolean) => void;
  focusOn: (alpha: string | null) => void;
  setTool: (t: CadTool) => void;
  setActiveCode: (code: string | null) => void;
  moveShot: (uid: string, n: number, e: number, z?: number) => void;
  recodeShot: (uid: string, code: string) => void;
  addShot: (v: Vertex, code?: string) => void;
  setShotDesc: (uid: string, description: string) => void;
  updateShot: (uid: string, patch: Partial<Pick<LabeledShot, "point" | "northing" | "easting" | "elevation" | "description">>) => void;
  addDraft: (v: Vertex) => void;
  undoDraft: () => void;
  commitDraft: () => void;
  cancelDraft: () => void;
  deleteSelected: () => void;
  setMeasure: (pts: Vertex[]) => void;
  setCursor: (c: CursorNez) => void;
  isolate: (code: string | null) => void;
  updateUserLine: (id: string, pts: Vertex[]) => void;
  setLineClosed: (id: string, closed: boolean) => void;
  reverseUserLine: (id: string) => void;
  closeSurveyChain: (shotUids: string[]) => void;
  setCrsId: (id: string) => void;
  setRightTab: (t: RightTab) => void;
  setSurvey: (patch: Partial<SurveyMeta>) => void;
  extractAll: () => number;
  extractChain: (chainId: string) => boolean;
  joinLines: (aId: string, bId: string) => boolean;
  splitLineAt: (lineId: string, index: number) => boolean;
  offsetLine: (lineId: string, dist?: number) => boolean;
  insertOnLine: (lineId: string, n: number, e: number, z: number) => boolean;
  setSurveyStringsOn: (v: boolean) => void;
  setContoursOn: (v: boolean) => void;
  setContourInterval: (n: number) => void;
  buildTerrain: () => void;
  setOffsetFt: (n: number) => void;
  setCogo: (c: CogoResult | null) => void;
  setJoinPending: (id: string | null) => void;
  setArrowOn: (v: boolean) => void;
  setTextTip: (v: Vertex | null) => void;
  addLeader: (leader: Leader) => void;
  setLeaders: (leaders: Leader[]) => void;
  autoNotes: () => number;
  editFeature: (uids: string[], fromCode: string, patch: { code?: string; note?: string; description?: string }) => void;
  selectLeader: (id: string | null) => void;
  viewCmd: { nonce: number; fit?: boolean; n?: number; e?: number } | null;
  locate: (n: number, e: number) => void;
  fitView: () => void;
};

function relabel(shot: LabeledShot, description: string): LabeledShot {
  const { codeToken, remainder } = splitDescription(description);
  const hit = lookupCode(codeToken);
  return {
    ...shot,
    description,
    codeToken,
    remainder,
    matchId: hit?.id ?? null,
  };
}

function ingest(raw: string, fileName: string, orderHint?: CoordOrder) {
  const book = parseFieldbook(raw, fileName, orderHint);
  const csvRaw = book.format === "csv" ? raw : shotsToPnezd(book.shots);
  return {
    fileName,
    raw: csvRaw,
    order: book.order,
    shots: labelShots(book.shots),
    skipped: book.skipped,
    hadHeader: book.format === "csv" ? parseSurveyCsv(raw, fileName, orderHint).hadHeader : true,
    surveyPatch: book.survey,
    warnings: book.warnings,
  };
}

const ingested = ingest(SAMPLE_CSV, SAMPLE_NAME, "PNEZD");
const sample = {
  fileName: ingested.fileName,
  raw: ingested.raw,
  order: ingested.order,
  shots: ingested.shots,
  skipped: ingested.skipped,
  hadHeader: ingested.hadHeader,
};

const uiDefaults = {
  remaps: {} as Record<string, string>,
  templateId: "code-desc" as TemplateId,
  exportKind: "labeled-ord" as ExportKind,
  filter: "all" as Filter,
  selectedUid: null as string | null,
  selectedLineId: null as string | null,
  query: "",
  hiddenAlphas: {} as Record<string, boolean>,
  frozenAlphas: {} as Record<string, boolean>,
  labelsOn: false,
  legendOn: false,
  tableOn: false,
  gcsOn: false,
  keyinOn: false,
  stylesOn: true,
  uiRev: 3,
  mapMode: "hybrid" as MapMode,
  earthOn: false,
  leftOpen: true,
  rightOpen: true,
  shotsOpen: false,
  focusNonce: 0,
  focusAlpha: null as string | null,
  tool: "select" as CadTool,
  activeCode: "EP" as string | null,
  userLines: [] as UserLine[],
  draft: [] as Vertex[],
  measure: [] as Vertex[],
  cursor: null as CursorNez,
  isolated: null as string | null,
  crsId: "auto" as string,
  rightTab: "levels" as RightTab,
  survey: emptySurvey(),
  surveyStringsOn: true,
  contoursOn: false,
  contourInterval: 1,
  terrain: null as TerrainModel | null,
  terrainBusy: false,
  offsetFt: 2,
  cogo: null as CogoResult | null,
  joinPending: null as string | null,
  leaders: [] as Leader[],
  textTip: null as Vertex | null,
  arrowOn: true,
  selectedLeaderId: null as string | null,
  viewCmd: null as { nonce: number; fit?: boolean; n?: number; e?: number } | null,
  sheetMeta: {
    title: "",
    des: "",
    client: "",
    county: "",
    crs: "",
    drawnBy: "",
    checkedBy: "",
    date: "",
    scale: "auto",
    sheetOf: "",
  } as SheetMeta,
};

let lineSeq = 1;
let shotSeq = 1;

function nextLineId() {
  return `x${lineSeq++}`;
}

function mergeSurvey(base: SurveyMeta, patch: Partial<SurveyMeta> | undefined): SurveyMeta {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    crew: patch.crew || base.crew,
    instrument: patch.instrument || base.instrument,
    occupied: patch.occupied || base.occupied,
    backsight: patch.backsight || base.backsight,
    date: patch.date || base.date,
    notes: patch.notes || base.notes,
    hi: patch.hi || base.hi,
    ht: patch.ht || base.ht,
    weather: patch.weather || base.weather,
    observations: patch.observations?.length ? patch.observations : (base.observations ?? []),
    books: (() => {
      const a = base.books ?? [];
      const b = patch.books ?? [];
      if (!b.length) return a;
      return [...a, ...b.filter((x) => !a.some((y) => y.name === x.name))];
    })(),
  };
}

export const useBook = create<State>()(
  persist(
    (set, get) => ({
      ...sample,
      ...uiDefaults,
      loadText: (raw, fileName) => {
        const next = ingest(raw, fileName);
        set({
          fileName: next.fileName,
          raw: next.raw,
          order: next.order,
          shots: next.shots,
          skipped: next.skipped,
          hadHeader: next.hadHeader,
          remaps: {},
          selectedUid: null,
          selectedLineId: null,
          filter: "all",
          query: "",
          hiddenAlphas: {},
          frozenAlphas: {},
          shotsOpen: false,
          userLines: [],
          draft: [],
          measure: [],
          isolated: null,
          survey: mergeSurvey(emptySurvey(), next.surveyPatch),
          cogo: null,
          joinPending: null,
          leaders: autoLeaders(next.shots),
          terrain: null,
          textTip: null,
          selectedLeaderId: null,
          surveyStringsOn: true,
          crsId: "auto",
          mapMode: "hybrid",
          gcsOn: true,
        });
      },
      loadBook: (raw, fileName, extra) => {
        const next = ingest(raw, fileName, extra?.order);
        set({
          fileName: next.fileName,
          raw: next.raw,
          order: next.order,
          shots: next.shots,
          skipped: next.skipped,
          hadHeader: next.hadHeader,
          remaps: extra?.remaps ?? {},
          userLines: extra?.userLines ?? [],
          leaders: extra?.leaders?.length ? extra.leaders : autoLeaders(next.shots, extra?.remaps ?? {}),
          terrain: null,
          textTip: null,
          selectedLeaderId: null,
          survey: mergeSurvey(extra?.survey ?? emptySurvey(), next.surveyPatch),
          selectedUid: null,
          selectedLineId: null,
          filter: "all",
          query: "",
          hiddenAlphas: {},
          frozenAlphas: {},
          draft: [],
          measure: [],
          isolated: null,
          cogo: null,
          joinPending: null,
          crsId: "auto",
          mapMode: "hybrid",
          gcsOn: true,
        });
      },
      appendText: (raw, fileName) => {
        const next = ingest(raw, fileName);
        const existing = get().shots;
        const used = new Set(existing.map((s) => s.point));
        const nums = existing.map((s) => Number(s.point)).filter((n) => Number.isFinite(n));
        let max = nums.length ? Math.max(...nums) : 0;
        const incoming = next.shots.map((s) => {
          if (!used.has(s.point)) {
            used.add(s.point);
            return s;
          }
          max += 1;
          used.add(String(max));
          return { ...s, point: String(max), uid: `p${Date.now().toString(36)}${shotSeq++}` };
        });
        const shots = [...existing, ...incoming];
        const mergedRaw = existing.length ? `${get().raw.trim()}\n${next.raw}` : next.raw;
        const name = get().fileName ? `${get().fileName.replace(/\.[^.]+$/, "")}+${fileName}` : fileName;
        set({
          shots,
          raw: mergedRaw,
          fileName: name,
          skipped: get().skipped + next.skipped,
          survey: mergeSurvey(get().survey, next.surveyPatch),
        });
        return { added: incoming.length, warnings: next.warnings };
      },
      loadSample: () => {
        const next = ingest(SAMPLE_CSV, SAMPLE_NAME, "PNEZD");
        set({
          fileName: next.fileName,
          raw: next.raw,
          order: next.order,
          shots: next.shots,
          skipped: next.skipped,
          hadHeader: next.hadHeader,
          remaps: {},
          selectedUid: null,
          selectedLineId: null,
          filter: "all",
          query: "",
          hiddenAlphas: {},
          frozenAlphas: {},
          userLines: [],
          draft: [],
          measure: [],
          isolated: null,
          survey: emptySurvey(),
          cogo: null,
          joinPending: null,
          leaders: [],
          textTip: null,
          selectedLeaderId: null,
          terrain: null,
          surveyStringsOn: true,
        });
      },
      clear: () =>
        set({
          fileName: "",
          raw: "",
          shots: [],
          skipped: 0,
          selectedUid: null,
          selectedLineId: null,
          remaps: {},
          query: "",
          hiddenAlphas: {},
          frozenAlphas: {},
          userLines: [],
          draft: [],
          measure: [],
          isolated: null,
          survey: emptySurvey(),
          cogo: null,
          joinPending: null,
          leaders: [],
          textTip: null,
          selectedLeaderId: null,
          terrain: null,
        }),
      setOrder: (order) =>
        set((s) => {
          if (!s.raw) return { order };
          const next = ingest(s.raw, s.fileName, order);
          return {
            fileName: next.fileName,
            raw: next.raw,
            order: next.order,
            shots: next.shots,
            skipped: next.skipped,
            hadHeader: next.hadHeader,
            remaps: s.remaps,
          };
        }),
      setRemap: (code, featureId) =>
        set((s) => {
          const key = code.trim().toUpperCase();
          const remaps = { ...s.remaps };
          if (!featureId) delete remaps[key];
          else remaps[key] = featureId;
          return { remaps };
        }),
      setTemplate: (id) => set({ templateId: id }),
      setExportKind: (k) => set({ exportKind: k }),
      setFilter: (f) => set({ filter: f }),
      setSelected: (uid) => set({ selectedUid: uid }),
      setSelectedLine: (id) => set({ selectedLineId: id }),
      setQuery: (q) => set({ query: q }),
      toggleAlpha: (code) =>
        set((s) => {
          const hiddenAlphas = { ...s.hiddenAlphas };
          const k = code.toUpperCase();
          if (hiddenAlphas[k]) delete hiddenAlphas[k];
          else hiddenAlphas[k] = true;
          return { hiddenAlphas };
        }),
      showAllAlphas: () => set({ hiddenAlphas: {}, isolated: null }),
      hideAllAlphas: (codes) =>
        set({
          hiddenAlphas: Object.fromEntries(codes.map((c) => [c.toUpperCase(), true])),
        }),
      toggleFrozen: (code) =>
        set((s) => {
          const frozenAlphas = { ...s.frozenAlphas };
          const k = code.toUpperCase();
          if (frozenAlphas[k]) delete frozenAlphas[k];
          else frozenAlphas[k] = true;
          return { frozenAlphas };
        }),
      setLabelsOn: (v) => set({ labelsOn: v }),
      setLegendOn: (v) => set({ legendOn: v }),
      setTableOn: (v) => set({ tableOn: v }),
      setGcsOn: (v) => set({ gcsOn: v }),
      setKeyinOn: (v) => set({ keyinOn: v }),
      setStylesOn: (v) => set({ stylesOn: v }),
      setMapMode: (m) => set({ mapMode: m }),
      setEarthOn: (v) => set({ earthOn: v }),
      setLeftOpen: (v) => set({ leftOpen: v }),
      setRightOpen: (v) => set({ rightOpen: v }),
      setShotsOpen: (v) => set({ shotsOpen: v }),
      focusOn: (alpha) =>
        set((s) => ({
          focusAlpha: alpha,
          focusNonce: s.focusNonce + 1,
        })),
      setTool: (t) => set({ tool: t, draft: [], measure: [], textTip: null, joinPending: t === "join" ? get().joinPending : null }),
      setActiveCode: (code) => set({ activeCode: code ? code.toUpperCase() : null }),
      moveShot: (uid, n, e, z) =>
        set((s) => ({
          shots: s.shots.map((sh) =>
            sh.uid === uid
              ? { ...sh, northing: n, easting: e, elevation: z ?? sh.elevation }
              : sh,
          ),
        })),
      recodeShot: (uid, code) =>
        set((s) => {
          const next = code.trim().toUpperCase();
          if (!next) return {};
          return {
            shots: s.shots.map((sh) => {
              if (sh.uid !== uid) return sh;
              const description = sh.remainder ? `${next} ${sh.remainder}` : next;
              return relabel(sh, description);
            }),
            activeCode: next,
          };
        }),
      addShot: (v, code) =>
        set((s) => {
          const alpha = (code || s.activeCode || "EP").toUpperCase();
          const nums = s.shots.map((sh) => Number(sh.point)).filter((n) => Number.isFinite(n));
          const pn = (nums.length ? Math.max(...nums) : 1000) + 1;
          const shot: LabeledShot = relabel(
            {
              uid: `p${Date.now().toString(36)}${shotSeq++}`,
              rowIndex: s.shots.length,
              point: String(pn),
              northing: v.n,
              easting: v.e,
              elevation: v.z,
              description: alpha,
              issues: [],
              codeToken: alpha,
              remainder: "",
              matchId: lookupCode(alpha)?.id ?? null,
            },
            alpha,
          );
          return { shots: [...s.shots, shot], selectedUid: shot.uid };
        }),
      setShotDesc: (uid, description) =>
        set((s) => ({
          shots: s.shots.map((sh) => (sh.uid === uid ? relabel(sh, description) : sh)),
        })),
      updateShot: (uid, patch) =>
        set((s) => ({
          shots: s.shots.map((sh) => {
            if (sh.uid !== uid) return sh;
            const next = { ...sh, ...patch };
            if (patch.description != null) return relabel(next, patch.description);
            return next;
          }),
        })),
      addDraft: (v) => set((s) => ({ draft: [...s.draft, v] })),
      undoDraft: () => set((s) => ({ draft: s.draft.slice(0, -1) })),
      commitDraft: () =>
        set((s) => {
          if (s.draft.length < 2) return { draft: [] };
          const code = (s.activeCode || "EP").toUpperCase();
          const line: UserLine = {
            id: nextLineId(),
            code,
            pts: s.draft,
            closed: s.tool === "shape",
            source: "extract",
          };
          return { userLines: [...s.userLines, line], draft: [], selectedLineId: line.id };
        }),
      cancelDraft: () => set({ draft: [], measure: [], joinPending: null }),
      deleteSelected: () =>
        set((s) => {
          if (s.selectedLeaderId) {
            return {
              leaders: s.leaders.filter((l) => l.id !== s.selectedLeaderId),
              selectedLeaderId: null,
            };
          }
          if (s.selectedLineId && s.userLines.some((l) => l.id === s.selectedLineId)) {
            return {
              userLines: s.userLines.filter((l) => l.id !== s.selectedLineId),
              selectedLineId: null,
            };
          }
          if (s.selectedUid) {
            return { shots: s.shots.filter((sh) => sh.uid !== s.selectedUid), selectedUid: null };
          }
          return {};
        }),
      setMeasure: (pts) => set({ measure: pts }),
      setCursor: (c) => set({ cursor: c }),
      isolate: (code) =>
        set((s) => {
          if (!code || s.isolated === code.toUpperCase()) {
            return { isolated: null, hiddenAlphas: {} };
          }
          return { isolated: code.toUpperCase() };
        }),
      updateUserLine: (id, pts) =>
        set((s) => ({
          userLines: s.userLines.map((l) => (l.id === id ? { ...l, pts } : l)),
        })),
      setLineClosed: (id, closed) =>
        set((s) => ({
          userLines: s.userLines.map((l) => (l.id === id ? { ...l, closed } : l)),
        })),
      reverseUserLine: (id) =>
        set((s) => ({
          userLines: s.userLines.map((l) => (l.id === id ? { ...l, pts: [...l.pts].reverse() } : l)),
        })),
      closeSurveyChain: (shotUids) =>
        set((s) => {
          if (!shotUids.length) return {};
          const last = shotUids[shotUids.length - 1];
          return {
            shots: s.shots.map((sh) => {
              if (sh.uid !== last) return sh;
              if (/\bCLS\b|\bCLOSE\b/i.test(sh.remainder)) return sh;
              const description = `${sh.codeToken} ${`${sh.remainder} CLS`.trim()}`;
              return relabel(sh, description);
            }),
          };
        }),
      setCrsId: (id) => set({ crsId: id }),
      setRightTab: (t) => set({ rightTab: t, rightOpen: true }),
      setSurvey: (patch) => set((s) => ({ survey: { ...s.survey, ...patch } })),
      extractAll: () => {
        const s = get();
        const extra = extractAllLines(s.shots, s.remaps, s.userLines, "x");
        if (!extra.length) return 0;
        set({
          userLines: [...s.userLines, ...extra],
          rightTab: "linear",
          rightOpen: true,
        });
        return extra.length;
      },
      extractChain: (chainId) => {
        const s = get();
        const line = extractChainById(s.shots, s.remaps, chainId, s.userLines, nextLineId());
        if (!line) return false;
        set({ userLines: [...s.userLines, line], selectedLineId: line.id });
        return true;
      },
      joinLines: (aId, bId) => {
        const s = get();
        const a = s.userLines.find((l) => l.id === aId);
        const b = s.userLines.find((l) => l.id === bId);
        if (!a || !b || a.id === b.id) return false;
        const joined = joinUserLines(a, b, nextLineId());
        set({
          userLines: s.userLines.filter((l) => l.id !== aId && l.id !== bId).concat(joined),
          selectedLineId: joined.id,
          joinPending: null,
          cogo: { kind: "join", code: joined.code },
        });
        return true;
      },
      splitLineAt: (lineId, index) => {
        const s = get();
        const line = s.userLines.find((l) => l.id === lineId);
        if (!line) return false;
        const parts = splitUserLine(line, index, nextLineId(), nextLineId());
        if (!parts) return false;
        set({
          userLines: s.userLines.filter((l) => l.id !== lineId).concat(parts),
          selectedLineId: parts[0].id,
        });
        return true;
      },
      offsetLine: (lineId, dist) => {
        const s = get();
        const line = s.userLines.find((l) => l.id === lineId);
        if (!line) return false;
        const d = dist ?? s.offsetFt;
        const off = offsetUserLine(line, d, nextLineId());
        set({
          userLines: [...s.userLines, off],
          selectedLineId: off.id,
          cogo: { kind: "offset", dist: d },
        });
        return true;
      },
      insertOnLine: (lineId, n, e, z) => {
        const s = get();
        const line = s.userLines.find((l) => l.id === lineId);
        if (!line) return false;
        const next = insertOnSegment(line.pts, n, e, z, 8);
        if (!next) return false;
        set({
          userLines: s.userLines.map((l) => (l.id === lineId ? { ...l, pts: next.map((p) => ({ n: p.n, e: p.e, z: p.z ?? z })) } : l)),
        });
        return true;
      },
      setSurveyStringsOn: (v) => set({ surveyStringsOn: v }),
      setContoursOn: (v) => set({ contoursOn: v }),
      setContourInterval: (n) => set({ contourInterval: Math.max(0.1, n), terrain: null }),
      buildTerrain: () => {
        const s = get();
        if (s.terrainBusy) return;
        if (s.shots.length < 3) return;
        set({ terrainBusy: true });
        window.setTimeout(() => {
          const now = get();
          try {
            const terrain = terrainFromBook(now.shots, now.remaps, now.userLines, now.contourInterval);
            set({ terrain, contoursOn: true, terrainBusy: false });
          } catch {
            set({ terrainBusy: false });
          }
        }, 30);
      },
      setOffsetFt: (n) => set({ offsetFt: n }),
      setCogo: (c) => set({ cogo: c }),
      setJoinPending: (id) => set({ joinPending: id }),
      setArrowOn: (v) => set({ arrowOn: v }),
      setTextTip: (v) => set({ textTip: v }),
      addLeader: (leader) =>
        set((s) => ({
          leaders: [...s.leaders.filter((l) => l.id !== leader.id), { ...leader, source: leader.source ?? "user" }],
          textTip: null,
        })),
      setLeaders: (leaders) => set({ leaders, textTip: null }),
      autoNotes: () => {
        const s = get();
        const next = autoLeaders(s.shots, s.remaps);
        const manual = s.leaders.filter((l) => l.source === "user");
        set({ leaders: [...manual, ...next] });
        return next.length;
      },
      editFeature: (uids, fromCode, patch) =>
        set((s) => {
          const idset = new Set(uids);
          const shots = s.shots.map((sh) => {
            if (!idset.has(sh.uid)) return sh;
            if (patch.description != null) return relabel(sh, patch.description);
            let description = sh.description;
            if (patch.code) description = replaceCode(description, fromCode || sh.codeToken, patch.code);
            if (patch.note != null) description = withNote(description, patch.note);
            return relabel(sh, description);
          });
          const manual = s.leaders.filter((l) => l.source === "user");
          const next = autoLeaders(shots, s.remaps);
          return { shots, leaders: [...manual, ...next] };
        }),
      selectLeader: (id) => set({ selectedLeaderId: id, selectedUid: null, selectedLineId: null }),
      setSheetMeta: (patch) => set((s) => ({ sheetMeta: { ...s.sheetMeta, ...patch } })),
      locate: (n, e) =>
        set((s) => ({ viewCmd: { nonce: (s.viewCmd?.nonce ?? 0) + 1, n, e } })),
      fitView: () => set((s) => ({ viewCmd: { nonce: (s.viewCmd?.nonce ?? 0) + 1, fit: true } })),
    }),
    {
      name: "breakline-cad-v2",
      partialize: (s) => ({
        templateId: s.templateId,
        exportKind: s.exportKind,
        labelsOn: s.labelsOn,
        legendOn: s.legendOn,
        tableOn: s.tableOn,
        gcsOn: s.gcsOn,
        keyinOn: s.keyinOn,
        stylesOn: s.stylesOn,
        leaders: s.leaders,
        uiRev: s.uiRev,
        mapMode: s.mapMode,
        earthOn: s.earthOn,
        activeCode: s.activeCode,
        crsId: s.crsId,
        rightTab: s.rightTab,
        contoursOn: s.contoursOn,
        contourInterval: s.contourInterval,
        surveyStringsOn: s.surveyStringsOn,
        offsetFt: s.offsetFt,
        sheetMeta: s.sheetMeta,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<State>;
        const rev = saved.uiRev ?? 0;
        const next = { ...current, ...saved };
        if (rev < 3) {
          next.labelsOn = false;
          next.legendOn = false;
          next.tableOn = false;
          next.gcsOn = false;
          next.keyinOn = false;
          next.stylesOn = true;
          next.uiRev = 3;
        }
        return next;
      },
    },
  ),
);

export function templateOf(id: TemplateId): string {
  return TEMPLATES.find((t) => t.id === id)?.tmpl ?? "{code} — {desc}";
}

export function visibleShots(s: {
  shots: LabeledShot[];
  hiddenAlphas: Record<string, boolean>;
  isolated: string | null;
}): LabeledShot[] {
  return s.shots.filter((sh) => {
    const k = sh.codeToken.toUpperCase();
    if (s.isolated) return k === s.isolated;
    return !s.hiddenAlphas[k];
  });
}

export { nearestVertexIndex };
