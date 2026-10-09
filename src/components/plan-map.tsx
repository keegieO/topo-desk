import { useEffect, useMemo, useRef, useState } from "react";
import { useBook, templateOf, visibleShots, type MapMode } from "@/lib/store";
import { resolveFeature, applyTemplate } from "@/lib/label";
import { buildChains, chainedShotIds, userLineToChain, chainStyle, chainVertices, type Chain } from "@/lib/chains";
import { detectGeoOrigin, toLatLon, fromLatLon, CRS_GROUPS, formatLatLon, gridUnit, parseCoordinateKeyin, type GeoOrigin, type KeyinPoint } from "@/lib/geo";
import { noteText } from "@/lib/notes";
import { parseField } from "@/lib/fieldcode";
import { useJobs } from "@/lib/jobs";
import { NativeSelect } from "@/components/ui/native-select";
import { markSvg, styleForCode, SHEET_LEGEND } from "@/lib/symbology";
import { fishbeckLevel } from "@/lib/fishbeck";
import { lookupCode } from "@/lib/catalog";
import { nearestElevation, nearestShot, snapVertex } from "@/lib/snap";
import type { LabeledShot } from "@/lib/label";
import type { Feature } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { inverse, nearestVertexIndex, formatStation, stationOffset } from "@/lib/cogo";
import { sampleElevation } from "@/lib/terrain";
import { toast } from "sonner";

type LeafletNS = typeof import("leaflet");
type LeafMap = import("leaflet").Map;
type LeafGroup = import("leaflet").LayerGroup;
type LeafTile = import("leaflet").TileLayer;

type MapApi = {
  L: LeafletNS;
  map: LeafMap;
  lines: LeafGroup;
  points: LeafGroup;
  labels: LeafGroup;
  verts: LeafGroup;
  draft: LeafGroup;
  tin: LeafGroup;
  aerial: LeafTile;
  places: LeafTile;
  roads: LeafTile;
  streets: LeafTile;
  locate: LeafGroup;
};

const IMAGERY = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const PLACES = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ROADS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
const STREETS = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "aerial", label: "Aerial" },
  { id: "hybrid", label: "Hybrid" },
  { id: "roads", label: "Roads" },
];

function zonesForState(state: string): { id: string; label: string }[] {
  if (state === "Indiana") {
    const plane = CRS_GROUPS.find((g) => g.label.startsWith("Indiana — State"));
    const counties = CRS_GROUPS.find((g) => g.label.includes("InGCS"));
    return [
      ...(plane?.options.filter((o) => o.id === "sp-east" || o.id === "sp-west") ?? []),
      ...(counties?.options ?? []),
    ];
  }
  return CRS_GROUPS.find((g) => g.label === state)?.options.filter((o) => o.id !== "auto") ?? [];
}

function stateOfCrs(id: string): string {
  if (id.startsWith("ingcs:") || id === "sp-east" || id === "sp-west") return "Indiana";
  if (id.startsWith("sp:oh") || id.startsWith("cty:oh")) return "Ohio";
  if (id.startsWith("sp:mi") || id.startsWith("cty:mi")) return "Michigan";
  if (id.startsWith("sp:il") || id.startsWith("cty:il")) return "Illinois";
  if (id.startsWith("sp:ky") || id.startsWith("cty:ky")) return "Kentucky";
  return "Indiana";
}

function gcsName(origin: GeoOrigin): string {
  const county = origin.crs.match(/^(.+?) County InGCS/);
  if (county) return `InGCS-${county[1].replace(/[^A-Za-z]/g, "")}F`;
  if (origin.kind === "sp-east") return "Indiana East (ftUS)";
  if (origin.kind === "sp-west") return "Indiana West (ftUS)";
  if (origin.kind === "utm16") return "NAD83 UTM 16N";
  if (origin.kind === "geo") return "Geographic NAD83";
  return origin.crs;
}

function gcsAbout(origin: GeoOrigin): string {
  const county = origin.crs.match(/^(.+?) County InGCS/);
  if (county) return `Indiana GCS ${county[1]} County · NAVD88`;
  return origin.crs;
}

function thinPath<T>(pts: T[], max: number): T[] {
  if (pts.length <= max) return pts;
  const step = Math.ceil(pts.length / max);
  const out: T[] = [];
  for (let i = 0; i < pts.length; i += step) out.push(pts[i]);
  const last = pts[pts.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

export function PlanMap() {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MapApi | null>(null);
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const hiddenAlphas = useBook((s) => s.hiddenAlphas);
  const isolated = useBook((s) => s.isolated);
  const labelsOn = useBook((s) => s.labelsOn);
  const legendOn = useBook((s) => s.legendOn);
  const tableOn = useBook((s) => s.tableOn);
  const gcsOn = useBook((s) => s.gcsOn);
  const keyinOn = useBook((s) => s.keyinOn);
  const stylesOn = useBook((s) => s.stylesOn);
  const leaders = useBook((s) => s.leaders);
  const selectedLeaderId = useBook((s) => s.selectedLeaderId);
  const mapMode = useBook((s) => s.mapMode);
  const setMapMode = useBook((s) => s.setMapMode);
  const earthOn = useBook((s) => s.earthOn);
  const setEarthOn = useBook((s) => s.setEarthOn);
  const selectedUid = useBook((s) => s.selectedUid);
  const selectedLineId = useBook((s) => s.selectedLineId);
  const fileName = useBook((s) => s.fileName);
  const templateId = useBook((s) => s.templateId);
  const focusAlpha = useBook((s) => s.focusAlpha);
  const focusNonce = useBook((s) => s.focusNonce);
  const viewCmd = useBook((s) => s.viewCmd);
  const tool = useBook((s) => s.tool);
  const draft = useBook((s) => s.draft);
  const measure = useBook((s) => s.measure);
  const userLines = useBook((s) => s.userLines);
  const frozenAlphas = useBook((s) => s.frozenAlphas);
  const crsId = useBook((s) => s.crsId);
  const setCrsId = useBook((s) => s.setCrsId);
  const surveyStringsOn = useBook((s) => s.surveyStringsOn);
  const contoursOn = useBook((s) => s.contoursOn);
  const terrain = useBook((s) => s.terrain);
  const terrainBusy = useBook((s) => s.terrainBusy);
  const contourInterval = useBook((s) => s.contourInterval);
  const cogo = useBook((s) => s.cogo);
  const tmpl = templateOf(templateId);
  const [mapReady, setMapReady] = useState(0);
  const [mapZoom, setMapZoom] = useState(17);

  useEffect(() => {
    if (shots.length < 3 || terrain || terrainBusy) return;
    const id = window.setTimeout(() => useBook.getState().buildTerrain(), 80);
    return () => window.clearTimeout(id);
  }, [fileName, shots.length, contourInterval, terrain, terrainBusy]);

  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  const origin = useMemo(
    () => detectGeoOrigin(shots, { crsId, county: job?.county, crs: job?.crs, fileName }),
    [shots, crsId, job?.county, job?.crs, fileName],
  );

  const visible = useMemo(
    () => visibleShots({ shots, hiddenAlphas, isolated }),
    [shots, hiddenAlphas, isolated],
  );

  const allSurveyChains = useMemo(() => buildChains(visible, remaps), [visible, remaps]);
  const surveyChains = surveyStringsOn ? allSurveyChains : [];
  const extractChains = useMemo(
    () =>
      userLines
        .filter((l) => (isolated ? l.code === isolated : !hiddenAlphas[l.code]))
        .map((l) => userLineToChain(l, remaps)),
    [userLines, remaps, hiddenAlphas, isolated],
  );
  const chains = useMemo(() => [...surveyChains, ...extractChains], [surveyChains, extractChains]);
  const chained = useMemo(() => chainedShotIds(allSurveyChains), [allSurveyChains]);
  const pointShots = useMemo(
    () => visible.filter((s) => !chained.has(s.uid)),
    [visible, chained],
  );

  const controlShots = useMemo(
    () =>
      shots.filter((s) => {
        const f = resolveFeature(s, remaps);
        return f?.cat === "Survey Control" || ["PRE", "PBMK", "PMON", "TRAV", "PIDT"].includes(s.codeToken.toUpperCase());
      }),
    [shots, remaps],
  );

  const selected = shots.find((s) => s.uid === selectedUid);
  const selectedFeat = selected ? resolveFeature(selected, remaps) : undefined;
  const selectedChain = chains.find((c) => c.id === selectedLineId) ?? chains.find((c) => c.shots.some((s) => s.uid === selectedUid));

  useEffect(() => {
    const book = useBook.getState();
    if (book.shots.length && book.leaders.length === 0) book.autoNotes();
  }, [shots.length]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let dead = false;
    let ro: ResizeObserver | null = null;

    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as LeafletNS;
      if (dead || !hostRef.current) return;

      const map = L.map(hostRef.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 4,
        maxZoom: 22,
        zoomSnap: 0.25,
        preferCanvas: true,
      }).setView([origin.lat, origin.lon], 17);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: true, metric: false, position: "bottomleft" }).addTo(map);

      const aerial = L.tileLayer(IMAGERY, { maxZoom: 22, maxNativeZoom: 19, attribution: "Esri" });
      const roads = L.tileLayer(ROADS, { maxZoom: 22, maxNativeZoom: 19, opacity: 0.35 });
      const places = L.tileLayer(PLACES, { maxZoom: 22, maxNativeZoom: 19 });
      const streets = L.tileLayer(STREETS, { maxZoom: 22, maxNativeZoom: 19, attribution: "Esri" });

      const tin = L.layerGroup().addTo(map);
      const lines = L.layerGroup().addTo(map);
      const verts = L.layerGroup().addTo(map);
      const points = L.layerGroup().addTo(map);
      const labels = L.layerGroup().addTo(map);
      const draftG = L.layerGroup().addTo(map);
      const locate = L.layerGroup().addTo(map);

      apiRef.current = { L, map, lines, points, labels, verts, draft: draftG, tin, aerial, places, roads, streets, locate };
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(hostRef.current);
      map.invalidateSize();
      setMapReady((n) => n + 1);
    })();

    return () => {
      dead = true;
      ro?.disconnect();
      apiRef.current?.map.remove();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { map, aerial, places, roads, streets } = api;
    const show = (layer: LeafTile, on: boolean) => {
      if (on) {
        if (!map.hasLayer(layer)) layer.addTo(map);
      } else if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
    show(streets, mapMode === "roads");
    show(aerial, mapMode === "aerial" || mapMode === "hybrid");
    show(roads, mapMode === "hybrid");
    show(places, mapMode === "hybrid");
    aerial.setZIndex(1);
    streets.setZIndex(1);
    roads.setZIndex(2);
    places.setZIndex(3);
  }, [mapMode, mapReady]);

  useEffect(() => {
    const map = apiRef.current?.map;
    if (!map) return;
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [earthOn, mapReady]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { map } = api;

    const onMove = (ev: { latlng: { lat: number; lng: number } }) => {
      const ne = fromLatLon(ev.latlng.lat, ev.latlng.lng, origin);
      const snap = nearestShot(ne.n, ne.e, useBook.getState().shots, 8);
      useBook.getState().setCursor({
        n: snap?.northing ?? ne.n,
        e: snap?.easting ?? ne.e,
        z: snap?.elevation ?? nearestElevation(ne.n, ne.e, useBook.getState().shots, useBook.getState().cursor?.z ?? 0),
        lat: ev.latlng.lat,
        lon: ev.latlng.lng,
      });
      const live = useBook.getState();
      const api = apiRef.current;
      if (api && live.tool === "text" && live.textTip) {
        api.draft.clearLayers();
        const a = toLatLon(live.textTip.n, live.textTip.e, origin);
        api.L.polyline(
          [
            [a.lat, a.lon],
            [ev.latlng.lat, ev.latlng.lng],
          ],
          { color: "#f4f4f0", weight: 1, dashArray: "4 3", interactive: false },
        ).addTo(api.draft);
      }
    };

    const onClick = (ev: { latlng: { lat: number; lng: number }; originalEvent: MouseEvent }) => {
      const t = ev.originalEvent.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "path" ||
          t.classList?.contains("leaflet-interactive") ||
          t.classList?.contains("leaflet-marker-icon") ||
          Boolean(t.closest?.(".leaflet-marker-icon")))
      ) {
        return;
      }
      const st = useBook.getState();
      const ne = fromLatLon(ev.latlng.lat, ev.latlng.lng, origin);
      const z = nearestElevation(ne.n, ne.e, st.shots, st.cursor?.z ?? 0);
      const pt = snapVertex(ne.n, ne.e, z, st.shots, 8);
      if (st.tool === "line" || st.tool === "shape") {
        st.addDraft(pt);
        return;
      }
      if (st.tool === "place") {
        st.addShot(pt);
        return;
      }
      if (st.tool === "text") {
        const hit = nearestShot(pt.n, pt.e, st.shots, 8);
        if (!st.arrowOn) {
          const preset = hit ? (noteText(hit) ?? "") : "";
          const text = window.prompt("Text", preset);
          if (!text?.trim()) return;
          st.addLeader({
            id: `n-${Date.now().toString(36)}`,
            text: text.trim(),
            n: pt.n,
            e: pt.e,
            tn: hit?.northing ?? pt.n,
            te: hit?.easting ?? pt.e,
            arrow: false,
            shotUid: hit?.uid,
          });
          return;
        }
        if (!st.textTip) {
          st.setTextTip(
            hit
              ? { n: hit.northing, e: hit.easting, z: hit.elevation, uid: hit.uid }
              : pt,
          );
          return;
        }
        const tipShot = st.shots.find((s) => s.uid === st.textTip?.uid);
        const preset = tipShot ? (noteText(tipShot) ?? "") : "";
        const text = window.prompt("Text", preset);
        const tip = st.textTip;
        st.setTextTip(null);
        apiRef.current?.draft.clearLayers();
        if (!text?.trim() || !tip) return;
        st.addLeader({
          id: `n-${Date.now().toString(36)}`,
          text: text.trim(),
          n: pt.n,
          e: pt.e,
          tn: tip.n,
          te: tip.e,
          arrow: true,
          shotUid: tip.uid,
        });
        return;
      }
      if (st.tool === "delete") {
        const hit = nearestShot(ne.n, ne.e, st.shots, 12);
        if (hit) {
          st.deleteShot(hit.uid);
          toast.success(`Deleted pt ${hit.point}`);
        } else {
          // Try deleting selected line
          if (st.selectedLineId) {
            st.deleteSelected();
            toast.success("Deleted line");
          }
        }
        return;
      }
      if (st.tool === "copy") {
        const hit = nearestShot(ne.n, ne.e, st.shots, 12);
        if (!st.selectedUid) {
          // First click: pick source
          if (hit) {
            st.setSelected(hit.uid);
            toast.message(`Copy: click destination for pt ${hit.point}`);
          }
        } else {
          // Second click: place copy at destination
          const src = st.shots.find((s) => s.uid === st.selectedUid);
          if (src) {
            const dN = pt.n - src.northing;
            const dE = pt.e - src.easting;
            const newUid = st.duplicateShot(st.selectedUid, dN, dE);
            if (newUid) toast.success(`Copied to pt`);
          }
          st.setSelected(null);
        }
        return;
      }
      if (st.tool === "recode") {
        const hit = nearestShot(ne.n, ne.e, st.shots, 12);
        if (hit && st.activeCode) st.recodeShot(hit.uid, st.activeCode);
        return;
      }
      if (st.tool === "measure" || st.tool === "inverse") {
        const next = [...st.measure, pt].slice(-2);
        st.setMeasure(next);
        if (st.tool === "inverse" && next.length === 2) {
          st.setCogo({
            kind: "inverse",
            a: next[0],
            b: next[1],
            inv: inverse(next[0], next[1]),
          });
          st.setRightTab("cogo");
        }
        return;
      }
      if (st.tool === "offset") {
        const line = st.userLines.find((l) => l.id === st.selectedLineId) ?? st.userLines[0];
        if (line && st.offsetLine(line.id)) toast.success(`Offset ${st.offsetFt} ft`);
        else toast.message("Select an extract line first");
        return;
      }
      if (st.tool === "split") {
        const line = st.userLines.find((l) => l.id === st.selectedLineId);
        if (!line) {
          toast.message("Select an extract line");
          return;
        }
        const idx = nearestVertexIndex(line.pts, pt.n, pt.e, 10);
        if (idx >= 0) {
          if (st.splitLineAt(line.id, idx)) toast.success("Split");
          else if (st.insertOnLine(line.id, pt.n, pt.e, pt.z)) toast.success("Vertex inserted");
        } else if (st.insertOnLine(line.id, pt.n, pt.e, pt.z)) toast.success("Vertex inserted");
        return;
      }
      if (st.tool === "select") {
        st.setSelected(null);
        st.setSelectedLine(null);
      }
    };

    const onDbl = (ev: { originalEvent: MouseEvent }) => {
      ev.originalEvent.preventDefault();
      const st = useBook.getState();
      if (st.tool === "line" || st.tool === "shape") st.commitDraft();
    };

    const onCtx = (ev: { originalEvent: MouseEvent }) => {
      ev.originalEvent.preventDefault();
      const st = useBook.getState();
      if (st.tool === "line" || st.tool === "shape") st.commitDraft();
    };

    if (tool === "line" || tool === "shape" || tool === "measure" || tool === "place" || tool === "text" || tool === "inverse") map.doubleClickZoom.disable();
    else map.doubleClickZoom.enable();
    map.on("mousemove", onMove);
    map.on("click", onClick);
    map.on("dblclick", onDbl);
    map.on("contextmenu", onCtx);
    return () => {
      map.off("mousemove", onMove);
      map.off("click", onClick);
      map.off("dblclick", onDbl);
      map.off("contextmenu", onCtx);
    };
  }, [origin, mapReady, tool]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { L, lines, points, labels, verts } = api;
    lines.clearLayers();
    points.clearLayers();
    labels.clearLayers();
    verts.clearLayers();
    if (!visible.length && !extractChains.length) return;

    const latlng = (n: number, e: number) => {
      const g = toLatLon(n, e, origin);
      return L.latLng(g.lat, g.lon);
    };
    const canvas = L.canvas({ padding: 0.5 });

    const clickShot = (uid: string) => {
      const st = useBook.getState();
      if (st.tool === "recode" && st.activeCode) {
        st.recodeShot(uid, st.activeCode);
        return;
      }
      st.setSelected(uid);
    };

    // ORD-style decorator helpers
    type VertEntry = { n: number; e: number; z: number; uid?: string };

    const addFlowArrows = (
      vertsList: VertEntry[],
      style: { color: string; weight: number; dash?: string },
    ) => {
      if (vertsList.length < 2) return;
      const step = Math.max(1, Math.floor(vertsList.length / 4));
      for (let i = step; i < vertsList.length - 1; i += step) {
        const a = vertsList[i];
        const b = vertsList[i + 1] ?? vertsList[i - 1];
        const dN = b.n - a.n;
        const dE = b.e - a.e;
        const angle = Math.atan2(dE, dN) * (180 / Math.PI);
        const icon = L.divIcon({
          className: "ord-flow-arrow",
          html: `<svg width="10" height="10" viewBox="0 0 10 10" style="transform:rotate(${angle}deg)"><path d="M5 1 L8 7 L5 5.5 L2 7 Z" fill="${style.color}" opacity="0.9"/></svg>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        lines.addLayer(L.marker(latlng(a.n, a.e), { icon, interactive: false }));
      }
    };

    const addOvTicks = (
      vertsList: VertEntry[],
      style: { color: string; weight: number; dash?: string },
    ) => {
      const step = Math.max(2, Math.floor(vertsList.length / 6));
      for (let i = step; i < vertsList.length - 1; i += step) {
        const a = vertsList[i - 1];
        const b = vertsList[i];
        const len = Math.hypot(b.n - a.n, b.e - a.e) || 1;
        const pn = (b.e - a.e) / len;
        const pe = -(b.n - a.n) / len;
        const half = 3;
        const m = vertsList[i];
        const t1 = latlng(m.n + pn * half, m.e + pe * half);
        const t2 = latlng(m.n - pn * half, m.e - pe * half);
        const tick = L.polyline([t1, t2], {
          color: style.color,
          weight: 1.2,
          opacity: 0.7,
          interactive: false,
        });
        lines.addLayer(tick);
      }
    };

    let vertBudget = 1800;
    const drawChain = (chain: Chain) => {
      const vertsList = chainVertices(chain);
      if (vertsList.length < 2) return;
      const rawStyle = chainStyle(chain);
      const style = stylesOn ? rawStyle : { ...rawStyle, color: "#d0d0cc", weight: 1.2, dash: undefined };
      const cap = mapZoom >= 17 ? 5000 : mapZoom >= 15 ? 1800 : 700;
      const path = thinPath(vertsList, cap).map((v) => latlng(v.n, v.e));
      if (chain.closed && path.length) path.push(path[0]);
      const on = selectedChain?.id === chain.id;
      const heavy = vertsList.length > 80;
      if (!heavy) {
        const halo = L.polyline(path, {
          color: on ? "#ffffff" : "#111111",
          weight: style.weight + (on ? 3 : 1.6),
          opacity: on ? 0.9 : 0.35,
          lineJoin: "round",
          lineCap: "round",
          interactive: false,
          smoothFactor: 0,
        });
        lines.addLayer(halo);
      }
      const poly = L.polyline(path, {
        color: style.color,
        weight: on ? style.weight + 0.6 : style.weight,
        opacity: 1,
        dashArray: style.dash,
        lineJoin: "round",
        lineCap: "round",
        smoothFactor: 0,
      });
      poly.on("click", (e) => {
        L.DomEvent.stop(e);
        const st = useBook.getState();
        if (st.tool === "join" && chain.source === "extract") {
          if (st.joinPending && st.joinPending !== chain.id) {
            if (st.joinLines(st.joinPending, chain.id)) toast.success("Joined");
            else toast.message("Could not join");
          } else {
            st.setJoinPending(chain.id);
            st.setSelectedLine(chain.id);
            toast.message("Click the second line");
          }
          return;
        }
        if (st.tool === "offset" && chain.source === "extract") {
          if (st.offsetLine(chain.id)) toast.success(`Offset ${st.offsetFt} ft`);
          return;
        }
        useBook.getState().setSelectedLine(chain.id);
        if (chain.shots.length) {
          const step = Math.max(1, Math.floor(chain.shots.length / 250));
          let best = chain.shots[0];
          let bestD = Infinity;
          const ll = e.latlng;
          for (let i = 0; i < chain.shots.length; i += step) {
            const s = chain.shots[i];
            const g = toLatLon(s.northing, s.easting, origin);
            const d = (g.lat - ll.lat) ** 2 + (g.lon - ll.lng) ** 2;
            if (d < bestD) {
              bestD = d;
              best = s;
            }
          }
          clickShot(best.uid);
        }
      });
      const feat = chain.feature;
      const level = fishbeckLevel(chain.code, feat?.cat);
      poly.bindTooltip(
        `${level.level}<br/>${chain.code}${feat?.desc ? `  ${feat.desc}` : ""}<br/>N ${vertsList[0].n.toFixed(3)}  E ${vertsList[0].e.toFixed(3)}  Z ${vertsList[0].z.toFixed(2)}`,
        { sticky: true, opacity: 0.95, className: "ord-tip" },
      );
      lines.addLayer(poly);

      // ORD-style line decorators (zoom-gated)
      if (mapZoom >= 16) {
        const drainCodes = new Set(["DL", "WF", "FL", "DR", "DI", "TS"]);
        const ovCodes = new Set(["OV"]);
        const code = chain.code.toUpperCase().replace(/\d+$/, "");
        if (drainCodes.has(code) && vertsList.length >= 3) {
          addFlowArrows(vertsList, style);
        }
        if (ovCodes.has(code) && vertsList.length >= 4) {
          addOvTicks(vertsList, style);
        }
      }

      for (let vi = 0; vi < vertsList.length; vi++) {
        if (vertBudget <= 0) break;
        vertBudget -= 1;
        const v = vertsList[vi];
        const dense = vertsList.length > 80 && !on;
        if (dense) continue;
        const shot = v.uid ? chain.shots.find((s) => s.uid === v.uid) : undefined;
        const tip = shot
          ? `Pt ${shot.point}  ${shot.codeToken}<br/>N ${shot.northing.toFixed(4)}  E ${shot.easting.toFixed(4)}  Z ${shot.elevation.toFixed(2)}`
          : `N ${v.n.toFixed(4)}  E ${v.e.toFixed(4)}  Z ${v.z.toFixed(2)}`;
        const extractMove = chain.source === "extract" && tool === "move";
        const shotMove = tool === "move" && v.uid && !frozenAlphas[chain.code];
        if (extractMove || shotMove) {
          const icon = L.divIcon({
            className: "ord-icon",
            html: `<span class="ord-mark" style="color:${style.color}">${markSvg("circle", "#fff", 10)}</span>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          const m = L.marker(latlng(v.n, v.e), { icon, draggable: true, zIndexOffset: 500 });
          m.on("click", () => {
            const st = useBook.getState();
            if (st.tool === "split" && chain.source === "extract") {
              if (st.splitLineAt(chain.id, vi)) toast.success("Split");
              return;
            }
            if (v.uid) clickShot(v.uid);
            st.setSelectedLine(chain.id);
          });
          m.on("dragend", () => {
            const ll = m.getLatLng();
            const ne = fromLatLon(ll.lat, ll.lng, origin);
            if (chain.source === "extract") {
              const line = useBook.getState().userLines.find((l) => l.id === chain.id);
              if (!line) return;
              const pts = line.pts.map((p, i) => (i === vi ? { ...p, n: ne.n, e: ne.e } : p));
              useBook.getState().updateUserLine(chain.id, pts);
            } else if (v.uid) {
              useBook.getState().moveShot(v.uid, ne.n, ne.e);
            }
          });
          m.bindTooltip(tip, { direction: "top", offset: [0, -8], className: "ord-tip" });
          verts.addLayer(m);
        } else {
          const mk = L.circleMarker(latlng(v.n, v.e), {
            renderer: canvas,
            radius: on ? 3.2 : 1.7,
            color: style.color,
            weight: 1,
            fillColor: on ? "#fff" : style.color,
            fillOpacity: 1,
          });
          if (v.uid) {
            mk.on("click", (e) => {
              L.DomEvent.stop(e);
              clickShot(v.uid!);
            });
          }
          mk.bindTooltip(tip, { direction: "top", offset: [0, -6], className: "ord-tip" });
          verts.addLayer(mk);
        }
      }
    };

    for (const chain of chains) drawChain(chain);

    const pointStep = pointShots.length > 3500 ? Math.ceil(pointShots.length / 3500) : 1;
    for (let pi = 0; pi < pointShots.length; pi += pointStep) {
      const s = pointShots[pi];
      const f = resolveFeature(s, remaps);
      const style = styleForCode(s.codeToken, f?.cat);
      const on = s.uid === selectedUid;
      if (pointShots.length > 600) {
        const mk = L.circleMarker(latlng(s.northing, s.easting), {
          renderer: canvas,
          radius: on ? 5 : 2.5,
          color: style.color,
          weight: 1,
          fillColor: style.color,
          fillOpacity: 1,
        });
        mk.on("click", () => clickShot(s.uid));
        points.addLayer(mk);
        continue;
      }
      const html = `<span class="ord-mark ${on ? "is-on" : ""}" style="color:${style.color}">${markSvg(style.mark, on ? "#fff" : style.color, on ? 16 : 12)}</span>`;
      const icon = L.divIcon({
        className: "ord-icon",
        html,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker(latlng(s.northing, s.easting), {
        icon,
        zIndexOffset: on ? 600 : 0,
        draggable: tool === "move" && !frozenAlphas[s.codeToken.toUpperCase()],
      });
      m.on("click", () => clickShot(s.uid));
      m.on("dragend", () => {
        const ll = m.getLatLng();
        const ne = fromLatLon(ll.lat, ll.lng, origin);
        useBook.getState().moveShot(s.uid, ne.n, ne.e);
      });
      const title = f ? `${s.codeToken} — ${f.desc || f.name}` : `${s.codeToken} unmatched`;
      m.bindTooltip(
        `Pt ${s.point}  ${title}<br/>N ${s.northing.toFixed(4)}  E ${s.easting.toFixed(4)}  Z ${s.elevation.toFixed(2)}`,
        { direction: "top", offset: [0, -8], className: "ord-tip" },
      );
      points.addLayer(m);
    }

    const showNotes = mapZoom >= 16;
    for (const note of leaders) {
      if (!showNotes) break;
      const tip = latlng(note.tn, note.te);
      const at = latlng(note.n, note.e);
      if (note.arrow && (note.n !== note.tn || note.e !== note.te)) {
        const de = note.te - note.e;
        const dn = note.tn - note.n;
        const len = Math.hypot(de, dn) || 1;
        const ux = de / len;
        const uy = dn / len;
        const size = 7;
        const bx = note.te - ux * size;
        const by = note.tn - uy * size;
        const px = -uy;
        const py = ux;
        const w = size * 0.38;
        L.polyline([at, latlng(by, bx)], {
          renderer: canvas,
          color: "#f4f4f0",
          weight: note.id === selectedLeaderId ? 2.2 : 1.15,
          interactive: false,
        }).addTo(lines);
        L.polygon(
          [tip, latlng(by + px * w, bx + py * w), latlng(by - px * w, bx - py * w)],
          {
            renderer: canvas,
            color: "#f4f4f0",
            weight: 1,
            fillColor: "#f4f4f0",
            fillOpacity: 1,
            interactive: false,
          },
        ).addTo(lines);
      }
      const html = note.text
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br/>");
      const icon = L.divIcon({
        className: "ord-label",
        html: `<span class="is-note${note.id === selectedLeaderId ? " is-on" : ""}">${html}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 8],
      });
      const marker = L.marker(at, { icon, zIndexOffset: 700 });
      marker.on("click", () => useBook.getState().selectLeader(note.id));
      labels.addLayer(marker);
    }

    if (labelsOn) {
      const labeled = new Set<string>();
      const labelShot = (s: LabeledShot, text: string, extra = "") => {
        if (labeled.has(s.uid)) return;
        labeled.add(s.uid);
        const icon = L.divIcon({
          className: "ord-label",
          html: `<span class="${extra}">${escapeHtml(text)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [-8, 8],
        });
        labels.addLayer(L.marker(latlng(s.northing, s.easting), { icon, interactive: false, zIndexOffset: 400 }));
      };
      for (const s of controlShots) {
        if (hiddenAlphas[s.codeToken.toUpperCase()]) continue;
        if (isolated && isolated !== s.codeToken.toUpperCase()) continue;
        labelShot(s, `${s.point}  ${s.codeToken}  ${s.elevation.toFixed(2)}`, "is-ctrl");
      }
      for (const s of pointShots) {
        if (pointShots.length > 600) continue;
        const f = resolveFeature(s, remaps);
        if (f?.cat === "Survey Control") continue;
        const alpha = s.codeToken.toUpperCase();
        if (alpha === "PELV") continue;
        labelShot(s, `${s.point}  ${s.codeToken}`);
      }
      for (const chain of chains) {
        const first = chain.shots[0];
        const last = chain.shots[chain.shots.length - 1];
        if (first) labelShot(first, `${first.point}  ${first.codeToken}`);
        if (last) labelShot(last, `${last.point}  ${last.codeToken}`);
      }
    }

    if (selected) {
      L.circleMarker(latlng(selected.northing, selected.easting), {
        radius: 10,
        color: "#fff",
        weight: 2,
        fillOpacity: 0,
      }).addTo(points);
    }
  }, [
    visible,
    chains,
    pointShots,
    remaps,
    labelsOn,
    selectedUid,
    selected,
    selectedChain,
    origin,
    hiddenAlphas,
    controlShots,
    mapReady,
    tool,
    frozenAlphas,
    extractChains.length,
    isolated,
    stylesOn,
    leaders,
    selectedLeaderId,
    mapZoom,
  ]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { L, draft: g } = api;
    g.clearLayers();
    const latlng = (n: number, e: number) => {
      const p = toLatLon(n, e, origin);
      return L.latLng(p.lat, p.lon);
    };
    if (draft.length) {
      const path = draft.map((v) => latlng(v.n, v.e));
      const code = useBook.getState().activeCode ?? "EP";
      const style = styleForCode(code, lookupCode(code)?.cat);
      if (useBook.getState().tool === "shape" && path.length > 2) {
        L.polygon(path, { color: style.color, weight: 2.6, dashArray: "5 4", fillOpacity: 0.08 }).addTo(g);
      } else {
        L.polyline(path, { color: style.color, weight: 2.6, dashArray: "5 4" }).addTo(g);
      }
      for (const v of draft) {
        L.circleMarker(latlng(v.n, v.e), {
          radius: 3.5,
          color: "#fff",
          weight: 1,
          fillColor: style.color,
          fillOpacity: 1,
        }).addTo(g);
      }
    }
    if (measure.length) {
      const path = measure.map((v) => latlng(v.n, v.e));
      L.polyline(path, { color: "#ffe14a", weight: 2, dashArray: "4 3" }).addTo(g);
      for (const v of measure) {
        L.circleMarker(latlng(v.n, v.e), { radius: 4, color: "#ffe14a", fillColor: "#ffe14a", fillOpacity: 1, weight: 1 }).addTo(g);
      }
    }
  }, [draft, measure, origin, mapReady]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { L, tin } = api;
    tin.clearLayers();
    if (!contoursOn || !terrain) return;
    const latlng = (n: number, e: number) => {
      const p = toLatLon(n, e, origin);
      return L.latLng(p.lat, p.lon);
    };
    for (const ring of terrain.contours) {
      if (ring.pts.length < 2) continue;
      if (mapZoom < 16 && !ring.index) continue;
      L.polyline(
        ring.pts.map((p) => latlng(p.n, p.e)),
        {
          color: ring.index ? "#d5d8d2" : "#8e948e",
          weight: ring.index ? 1.1 : 0.6,
          opacity: ring.index ? 0.85 : 0.45,
          interactive: false,
        },
      ).addTo(tin);
      if (ring.index && ring.pts.length > 8 && mapZoom >= 15) {
        const mid = ring.pts[Math.floor(ring.pts.length / 2)];
        const icon = L.divIcon({
          className: "ord-label",
          html: `<span class="is-note">${ring.z.toFixed(0)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [8, 6],
        });
        L.marker(latlng(mid.n, mid.e), { icon, interactive: false, zIndexOffset: 500 }).addTo(tin);
      }
    }
  }, [contoursOn, terrain, origin, mapReady, mapZoom]);

  useEffect(() => {
    const map = apiRef.current?.map;
    if (!map) return;
    const onZoom = () => setMapZoom(map.getZoom());
    onZoom();
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [mapReady]);

  const fittedFor = useRef<string>("");
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const key = [fileName, shots.length, origin.id, origin.kind, origin.lat.toFixed(6), origin.lon.toFixed(6)].join(":");
    if (fittedFor.current === key) return;
    const { L, map } = api;
    const step = Math.max(1, Math.floor(shots.length / 1200));
    const pts = [];
    const src = visible.length ? visible : shots;
    for (let i = 0; i < src.length; i += step) {
      const s = src[i];
      const g = toLatLon(s.northing, s.easting, origin);
      pts.push(L.latLng(g.lat, g.lon));
    }
    fittedFor.current = key;
    if (!pts.length) {
      map.setView([origin.lat, origin.lon], 12, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(pts).pad(0.08), { animate: false, maxZoom: 18 });
  }, [visible, shots, fileName, origin, mapReady]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || !focusAlpha) return;
    const { L, map } = api;
    const subset = shots.filter((s) => s.codeToken.toUpperCase() === focusAlpha.toUpperCase());
    if (!subset.length) return;
    const pts = subset.map((s) => {
      const g = toLatLon(s.northing, s.easting, origin);
      return L.latLng(g.lat, g.lon);
    });
    map.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 19 });
  }, [focusNonce, focusAlpha, shots, origin, mapReady]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || !viewCmd) return;
    const { L, map } = api;
    const book = useBook.getState();
    if (viewCmd.fit) {
      const pts = book.shots.map((s) => {
        const g = toLatLon(s.northing, s.easting, origin);
        return L.latLng(g.lat, g.lon);
      });
      if (!pts.length) return;
      map.fitBounds(L.latLngBounds(pts).pad(0.08), { maxZoom: 18 });
      return;
    }
    if (viewCmd.n == null || viewCmd.e == null) return;
    const g = toLatLon(viewCmd.n, viewCmd.e, origin);
    const z = map.getZoom();
    map.setView(L.latLng(g.lat, g.lon), z < 18 ? 19 : z);
    api.locate.clearLayers();
    const ll = L.latLng(g.lat, g.lon);
    L.circleMarker(ll, { radius: 16, color: "#ffe14a", weight: 2, fillOpacity: 0 }).addTo(api.locate);
    L.circleMarker(ll, { radius: 3, color: "#ffe14a", weight: 1, fillColor: "#ffe14a", fillOpacity: 1 }).addTo(api.locate);
  }, [viewCmd, origin, mapReady]);

  const invHud =
    measure.length === 2
      ? inverse(measure[0], measure[1])
      : cogo?.kind === "inverse"
        ? cogo.inv
        : null;
  const selectedLine = userLines.find((l) => l.id === selectedLineId);
  const staHud =
    selected && selectedLine
      ? stationOffset(selectedLine.pts, { n: selected.northing, e: selected.easting, z: selected.elevation })
      : null;

  const drawCursor =
    tool === "line" ||
    tool === "shape" ||
    tool === "measure" ||
    tool === "place" ||
    tool === "text" ||
    tool === "recode" ||
    tool === "inverse" ||
    tool === "offset" ||
    tool === "join" ||
    tool === "split" ||
    tool === "delete" ||
    tool === "copy";

  return (
    <div className="flex h-full min-h-0 w-full">
    <div className={cn("relative h-full min-h-0 min-w-0 overflow-hidden bg-cad", earthOn ? "w-1/2" : "w-full", drawCursor ? "cursor-crosshair" : "")}>
      <div className="ord-view-chrome pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 px-2 py-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="rounded-sm bg-card/90 px-2 py-0.5 font-mono text-[0.6875rem] text-foreground shadow-sm">
            View 1 — Top
          </span>
          <div className="pointer-events-auto flex overflow-hidden rounded-sm bg-card/90 shadow-sm">
            {MAP_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMapMode(m.id)}
                className={cn(
                  "h-7 px-2 font-mono text-[0.6875rem]",
                  mapMode === m.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                )}
              >
                {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEarthOn(!earthOn)}
              className={cn(
                "h-7 border-l border-border px-2 font-mono text-[0.6875rem]",
                earthOn ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
              )}
            >
              Earth
            </button>
          </div>
        </div>
        <div className="pointer-events-auto flex w-[17.5rem] max-w-[min(100%,17.5rem)] shrink-0 flex-col gap-1">
          {gcsOn ? (
            <div className="flex flex-col gap-1 rounded-sm border border-border bg-card/95 px-2 py-1.5 shadow-sm">
              <span className="truncate font-mono text-[0.6875rem] font-medium text-foreground">{gcsName(origin)}</span>
              <span className="truncate text-[0.625rem] text-muted-foreground">{gcsAbout(origin)}</span>
              <label className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[0.625rem] text-muted-foreground">State</span>
                <NativeSelect
                  aria-label="State"
                  className="h-7 flex-1 px-1 py-0 font-mono text-[0.6875rem]"
                  value={stateOfCrs(crsId === "auto" ? origin.id : crsId)}
                  onChange={(e) => {
                    const next = zonesForState(e.target.value)[0];
                    if (next) setCrsId(next.id);
                  }}
                >
                  {["Indiana", "Ohio", "Michigan", "Illinois", "Kentucky"].map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[0.625rem] text-muted-foreground">Zone</span>
                <NativeSelect
                  aria-label="County or state plane zone"
                  className="h-7 flex-1 px-1 py-0 font-mono text-[0.6875rem]"
                  value={crsId === "auto" ? origin.id : crsId}
                  onChange={(e) => setCrsId(e.target.value)}
                >
                  <option value="auto">Auto (from coordinates)</option>
                  {zonesForState(stateOfCrs(crsId === "auto" ? origin.id : crsId)).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </div>
          ) : null}
          {contoursOn && terrain ? <TerrainReadout /> : terrainBusy ? <TerrainReadout /> : null}
        </div>
      </div>

      <div ref={hostRef} className="ord-map h-full w-full" />

      <NorthArrow />

      {legendOn ? <SheetLegend /> : null}
      {tableOn ? (
        <ControlTable
          shots={controlShots.length ? controlShots : shots.slice(0, 8)}
          remaps={remaps}
          crs={origin.crs}
          unit={gridUnit(origin)}
        />
      ) : null}
      <CoordHud originCrs={origin.crs} unit={gridUnit(origin)} />
      {keyinOn ? <CoordKeyin origin={origin} /> : null}

      {invHud ? (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-1.5 font-mono text-xs shadow-md">
          {invHud.bearing} · {invHud.horiz.toFixed(2)} ft
          {invHud.dZ ? ` · ΔZ ${invHud.dZ.toFixed(2)}` : ""}
        </div>
      ) : null}
      {staHud && selected ? (
        <div className="pointer-events-none absolute bottom-[4.5rem] left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-1 font-mono text-[0.6875rem] text-muted-foreground shadow-md">
          {formatStation(staHud.station)} · {staHud.offset >= 0 ? "RT" : "LT"} {Math.abs(staHud.offset).toFixed(2)}
        </div>
      ) : null}

      {selectedChain || selected ? (
        <FeatureEdit chain={selectedChain} shot={selectedChain ? undefined : selected} />
      ) : null}

      {selected ? (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-md">
          <p className="font-medium">
            Pt {selected.point} · {selected.codeToken}
            {selectedFeat ? ` — ${selectedFeat.desc || selectedFeat.name}` : " — unmatched"}
          </p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            N {selected.northing.toFixed(4)} &nbsp; E {selected.easting.toFixed(4)} &nbsp; Z {selected.elevation.toFixed(2)} {gridUnit(origin)}
          </p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            {origin.crs} · {formatLatLon(toLatLon(selected.northing, selected.easting, origin).lat, toLatLon(selected.northing, selected.easting, origin).lon)}
          </p>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
            {applyTemplate(selected, selectedFeat, tmpl)}
            {selectedFeat ? ` · ${selectedFeat.name}` : ""}
          </p>
        </div>
      ) : null}
    </div>
    {earthOn ? (
      <EarthPane ready={mapReady} origin={origin} shots={shots} fileName={fileName} getPlan={() => apiRef.current} />
    ) : null}
    </div>
  );
}

function TerrainReadout() {
  const terrain = useBook((s) => s.terrain);
  const busy = useBook((s) => s.terrainBusy);
  const cursor = useBook((s) => s.cursor);
  const fileName = useBook((s) => s.fileName);
  const interval = useBook((s) => s.contourInterval);
  const name = (fileName || "survey").replace(/\.[^.]+$/, "");
  const z =
    cursor && terrain && terrain.tris.length
      ? sampleElevation(terrain.pts, terrain.tris, cursor.n, cursor.e)
      : null;
  return (
    <div className="pointer-events-none rounded-sm border border-border bg-card/95 px-2.5 py-1.5 font-mono text-[0.6875rem] shadow-sm">
      <p>Terrain Model: {name}</p>
      {busy || !terrain ? (
        <p>Building surface…</p>
      ) : (
        <>
          <p>Contours · {interval} ft / {interval * 5} ft index</p>
          <p>Elevation {z == null ? "—" : `${z.toFixed(2)}'`}</p>
          <p className="text-muted-foreground">
            {terrain.zmin.toFixed(2)} to {terrain.zmax.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
}

function FeatureEdit({
  chain,
  shot,
}: {
  chain?: Chain;
  shot?: { uid: string; codeToken: string; description: string; elevation: number };
}) {
  const editFeature = useBook((s) => s.editFeature);
  const noted = chain?.shots.find((s) => parseField(s.description).note) ?? chain?.shots[0] ?? shot;
  const code0 = chain?.code ?? shot?.codeToken ?? "";
  const desc = noted?.description ?? "";
  const [code, setCode] = useState(code0);
  const [note, setNote] = useState(() => parseField(desc).note);
  useEffect(() => {
    setCode(code0);
    setNote(parseField(desc).note);
  }, [code0, desc, chain?.id, shot?.uid]);
  if (!noted || !code0) return null;
  const uids = chain?.shots.length ? chain.shots.map((s) => s.uid) : [noted.uid];
  const preview = noteText({
    description: desc,
    remainder: parseField(desc).note,
    elevation: noted.elevation,
    codeToken: code0,
  });
  return (
    <form
      className="pointer-events-auto absolute top-12 left-2 z-30 flex w-56 flex-col gap-1 rounded-md border border-border bg-card/95 p-2 shadow-md"
      onSubmit={(e) => {
        e.preventDefault();
        editFeature(uids, code0, { code, note });
      }}
    >
      <p className="font-mono text-[0.625rem] text-muted-foreground">{chain ? "Line" : "Point"}</p>
      <input
        aria-label="Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs"
      />
      <input
        aria-label="Note"
        value={note}
        placeholder="INV 18IN CPP"
        onChange={(e) => setNote(e.target.value)}
        className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs"
      />
      {preview ? <p className="font-mono text-[0.625rem] text-foreground">{preview.replace("\n", " · ")}</p> : null}
      <button type="submit" className="h-7 rounded-sm bg-primary text-xs text-primary-foreground">
        Apply
      </button>
    </form>
  );
}

function EarthPane({
  ready,
  origin,
  shots,
  fileName,
  getPlan,
}: {
  ready: number;
  origin: GeoOrigin;
  shots: LabeledShot[];
  fileName: string;
  getPlan: () => MapApi | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafMap | null>(null);
  const getPlanRef = useRef(getPlan);
  getPlanRef.current = getPlan;
  const [guy, setGuy] = useState<{ lat: number; lng: number; heading: number } | null>(null);
  const [armed, setArmed] = useState(false);
  const [earthReady, setEarthReady] = useState(0);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;
  const originRef = useRef(origin);
  originRef.current = origin;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;
    let dead = false;
    let earth: LeafMap | null = null;

    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as LeafletNS;
      const plan = getPlanRef.current();
      if (dead || !plan || !hostRef.current) return;
      const c = plan.map.getCenter();
      earth = L.map(hostRef.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 4,
        maxZoom: 21,
      }).setView(c, Math.max(plan.map.getZoom(), 16));
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 21,
        attribution: "Google",
      }).addTo(earth);
      L.control.zoom({ position: "bottomright" }).addTo(earth);
      mapRef.current = earth;
      setEarthReady((n) => n + 1);
      earth.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        setArmed((on) => {
          if (!on) return on;
          setGuy({ lat: e.latlng.lat, lng: e.latlng.lng, heading: 0 });
          return false;
        });
      });
      window.setTimeout(() => earth?.invalidateSize(), 50);
    })();

    return () => {
      dead = true;
      earth?.remove();
      mapRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    const map = mapRef.current;
    const list = shotsRef.current;
    const here = originRef.current;
    if (!map || !list.length) return;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    const step = Math.max(1, Math.floor(list.length / 800));
    for (let i = 0; i < list.length; i += step) {
      const g = toLatLon(list[i].northing, list[i].easting, here);
      if (g.lat < minLat) minLat = g.lat;
      if (g.lat > maxLat) maxLat = g.lat;
      if (g.lon < minLon) minLon = g.lon;
      if (g.lon > maxLon) maxLon = g.lon;
    }
    if (!Number.isFinite(minLat)) return;
    map.fitBounds(
      [
        [minLat, minLon],
        [maxLat, maxLon],
      ],
      { animate: false, padding: [28, 28], maxZoom: 18 },
    );
  }, [earthReady, fileName, origin.id, origin.lat, origin.lon, shots.length]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !guy) return;
    let marker: { remove: () => void } | null = null;
    let cancel = false;
    void import("leaflet").then((mod) => {
      if (cancel) return;
      const L = (mod.default ?? mod) as LeafletNS;
      const icon = L.divIcon({
        className: "ord-icon",
        html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:#f4b400;border:2px solid #fff;box-shadow:0 1px 2px #000"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      marker = L.marker([guy.lat, guy.lng], { icon, interactive: false, zIndexOffset: 800 }).addTo(map);
    });
    return () => {
      cancel = true;
      marker?.remove();
    };
  }, [guy]);

  function placeAt(clientX: number, clientY: number) {
    const map = mapRef.current;
    const host = hostRef.current;
    if (!map || !host) return;
    const rect = host.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    const ll = map.containerPointToLatLng([x, y]);
    setGuy((g) => ({ lat: ll.lat, lng: ll.lng, heading: g?.heading ?? 0 }));
    setArmed(false);
  }

  const sv = guy
    ? `https://www.google.com/maps?layer=c&cbll=${guy.lat},${guy.lng}&cbp=0,${guy.heading},0,0,0&output=svembed`
    : "";

  return (
    <div className="relative h-full min-h-0 w-1/2 border-l border-border">
      <div className="pointer-events-none absolute top-1 left-2 z-20">
        <span className="rounded-sm bg-card/90 px-2 py-0.5 font-mono text-[0.6875rem] text-foreground shadow-sm">
          Earth
        </span>
      </div>
      <div
        className={cn(
          "absolute top-1 right-2 z-30 flex items-center gap-1",
          armed ? "cursor-crosshair" : "",
        )}
      >
        <button
          type="button"
          title="Street View"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
            (e.currentTarget as HTMLButtonElement).dataset.x = String(e.clientX);
            (e.currentTarget as HTMLButtonElement).dataset.y = String(e.clientY);
          }}
          onPointerUp={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            const x0 = Number(el.dataset.x ?? e.clientX);
            const y0 = Number(el.dataset.y ?? e.clientY);
            const dist = Math.hypot(e.clientX - x0, e.clientY - y0);
            if (dist < 8) {
              setArmed((v) => !v);
              return;
            }
            placeAt(e.clientX, e.clientY);
          }}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-sm bg-card/95 shadow-sm",
            armed ? "ring-2 ring-primary" : "",
          )}
        >
          <Pegman />
        </button>
      </div>
      <div ref={hostRef} className={cn("ord-map h-full w-full", armed ? "cursor-crosshair" : "")} />
      {guy ? (
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-[46%] flex-col border-t border-border bg-black">
          <div className="flex h-7 shrink-0 items-center justify-between gap-2 bg-card px-2">
            <span className="font-mono text-[0.6875rem]">Street View</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="h-6 px-2 font-mono text-[0.6875rem] hover:bg-accent"
                onClick={() => setGuy({ ...guy, heading: (guy.heading + 315) % 360 })}
              >
                Left
              </button>
              <button
                type="button"
                className="h-6 px-2 font-mono text-[0.6875rem] hover:bg-accent"
                onClick={() => setGuy({ ...guy, heading: (guy.heading + 45) % 360 })}
              >
                Right
              </button>
              <button type="button" className="h-6 px-2 font-mono text-[0.6875rem] hover:bg-accent" onClick={() => setGuy(null)}>
                Close
              </button>
            </div>
          </div>
          <iframe title="Google Street View" src={sv} className="min-h-0 w-full flex-1 border-0" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      ) : null}
    </div>
  );
}

function Pegman() {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" aria-hidden>
      <circle cx="11" cy="5" r="3.2" fill="#f4b400" />
      <path d="M11 9.2c2.6 0 4.4 1.5 4.6 3.4l.7 6.2h-2.1l-.5-4.2-1.2 8.6h-3l-1.2-8.6-.5 4.2H5.7l.7-6.2C6.6 10.7 8.4 9.2 11 9.2z" fill="#f4b400" />
      <path d="M7.2 26.2c.2-1.6 1.6-2.6 3.8-2.6s3.6 1 3.8 2.6" fill="none" stroke="#e37400" strokeWidth="1.4" />
    </svg>
  );
}

function NorthArrow() {
  return (
    <div className="pointer-events-none absolute bottom-24 left-3 z-20 hidden sm:block">
      <svg width="54" height="72" viewBox="0 0 54 72" className="drop-shadow-md">
        <circle cx="27" cy="40" r="18" fill="none" stroke="#f4f4f0" strokeWidth="1.2" />
        <path d="M27 8 L31 28 L27 24 L23 28 Z" fill="#f4f4f0" />
        <path d="M27 72 L31 52 L27 56 L23 52 Z" fill="none" stroke="#f4f4f0" />
        <path d="M9 40 H45 M27 22 V58" stroke="#f4f4f0" strokeWidth="1" />
        <text x="27" y="18" textAnchor="middle" fill="#f4f4f0" fontSize="10" fontFamily="IBM Plex Mono, ui-monospace">
          N
        </text>
      </svg>
    </div>
  );
}

function SheetLegend() {
  return (
    <div className="ord-legend pointer-events-none absolute top-10 left-3 z-20 hidden max-h-[min(70%,28rem)] overflow-hidden md:block">
      <p className="mb-1 font-mono text-xs font-semibold tracking-[0.2em] text-white">LEGEND</p>
      <ul className="flex flex-col gap-0.5">
        {SHEET_LEGEND.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <span
              className="inline-flex w-4 justify-center"
              dangerouslySetInnerHTML={{ __html: markSvg(item.mark, item.color, 11) }}
            />
            {item.linear ? <span className="h-px w-5" style={{ background: item.color }} /> : null}
            <span className="font-mono text-[0.625rem] tracking-wide text-white">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ControlTable({
  shots,
  remaps,
  crs,
  unit,
}: {
  shots: LabeledShot[];
  remaps: Record<string, string>;
  crs: string;
  unit: string;
}) {
  if (!shots.length) return null;
  return (
    <div className="pointer-events-none absolute right-2 bottom-8 z-20 hidden max-h-[40%] max-w-[min(100%-1rem,28rem)] overflow-auto rounded-sm border border-foreground/40 bg-card/95 text-foreground shadow-md md:block">
      <p className="border-b border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wide">
        {crs} · {unit}
      </p>
      <table className="w-full border-collapse font-mono text-[0.625rem]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-2 py-1 font-medium">Point</th>
            <th className="px-2 py-1 font-medium">Northing</th>
            <th className="px-2 py-1 font-medium">Easting</th>
            <th className="px-2 py-1 font-medium">Elevation</th>
            <th className="px-2 py-1 font-medium">Code</th>
          </tr>
        </thead>
        <tbody>
          {shots.slice(0, 8).map((s) => {
            const f = resolveFeature(s, remaps);
            return (
              <tr key={s.uid} className="border-b border-border/70">
                <td className="px-2 py-0.5">{s.point}</td>
                <td className="px-2 py-0.5">{s.northing.toFixed(4)}</td>
                <td className="px-2 py-0.5">{s.easting.toFixed(4)}</td>
                <td className="px-2 py-0.5">{s.elevation.toFixed(2)}</td>
                <td className="px-2 py-0.5">{s.codeToken || f?.seed || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CoordKeyin({ origin }: { origin: GeoOrigin }) {
  const order = useBook((s) => s.order);
  const activeCode = useBook((s) => s.activeCode);
  const [pt, setPt] = useState("");
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [z, setZ] = useState("");
  const [code, setCode] = useState("");

  function resolve(): KeyinPoint | null {
    if (e.trim()) {
      const nn = Number(n);
      const ee = Number(e);
      const zz = z.trim() ? Number(z) : (useBook.getState().cursor?.z ?? 0);
      if (!Number.isFinite(nn) || !Number.isFinite(ee) || !Number.isFinite(zz)) return null;
      return {
        n: nn,
        e: ee,
        z: zz,
        code: code.trim() || undefined,
        point: pt.trim() || undefined,
        geographic: false,
      };
    }
    const blob = [pt, n, z, code].map((s) => s.trim()).filter(Boolean).join(" ");
    const parsed = parseCoordinateKeyin(blob || n, order);
    if (!parsed) return null;
    if (!parsed.geographic) return parsed;
    const g = fromLatLon(parsed.n, parsed.e, origin);
    return { ...parsed, n: g.n, e: g.e, geographic: false };
  }

  function go(place: boolean) {
    const hit = resolve();
    if (!hit) {
      toast.error("Enter northing and easting");
      return;
    }
    const ll = toLatLon(hit.n, hit.e, origin);
    const st = useBook.getState();
    st.setCursor({ n: hit.n, e: hit.e, z: hit.z, lat: ll.lat, lon: ll.lon });
    if (place) {
      const alpha = (hit.code || code || activeCode || "EP").toUpperCase();
      st.addShot({ n: hit.n, e: hit.e, z: hit.z }, alpha);
      if (hit.point) {
        const uid = useBook.getState().selectedUid;
        if (uid) st.updateShot(uid, { point: hit.point });
      }
    }
    st.locate(hit.n, hit.e);
  }

  function readCursor() {
    const c = useBook.getState().cursor;
    if (!c) return;
    setN(c.n.toFixed(4));
    setE(c.e.toFixed(4));
    setZ(c.z.toFixed(2));
  }

  const preview = (() => {
    const hit = e.trim() && n.trim() ? resolve() : null;
    if (!hit) return null;
    const ll = toLatLon(hit.n, hit.e, origin);
    return formatLatLon(ll.lat, ll.lon);
  })();

  const field =
    "h-7 w-[6.75rem] rounded-sm border border-input bg-card px-1.5 font-mono text-[0.6875rem] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form
      className="pointer-events-auto absolute bottom-8 left-2 z-30 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-1 rounded-sm border border-border bg-card/95 p-1 shadow-md"
      onSubmit={(ev) => {
        ev.preventDefault();
        go(false);
      }}
    >
      <input className={cn(field, "w-14")} aria-label="Point" placeholder="Pt" value={pt} onChange={(ev) => setPt(ev.target.value)} />
      <input
        className={field}
        aria-label="Northing"
        placeholder="Northing"
        value={n}
        onChange={(ev) => setN(ev.target.value)}
        onPaste={(ev) => {
          const text = ev.clipboardData.getData("text");
          if (!/[,;\s]/.test(text)) return;
          const parsed = parseCoordinateKeyin(text, order);
          if (!parsed) return;
          ev.preventDefault();
          const grid = parsed.geographic ? fromLatLon(parsed.n, parsed.e, origin) : parsed;
          if (parsed.point) setPt(parsed.point);
          setN((parsed.geographic ? grid.n : parsed.n).toFixed(4));
          setE((parsed.geographic ? grid.e : parsed.e).toFixed(4));
          setZ(parsed.z.toFixed(2));
          if (parsed.code) setCode(parsed.code);
        }}
      />
      <input className={field} aria-label="Easting" placeholder="Easting" value={e} onChange={(ev) => setE(ev.target.value)} />
      <input className={cn(field, "w-20")} aria-label="Elevation" placeholder="Elev" value={z} onChange={(ev) => setZ(ev.target.value)} />
      <input className={cn(field, "w-16")} aria-label="Code" placeholder={activeCode || "Code"} value={code} onChange={(ev) => setCode(ev.target.value)} />
      <button type="submit" className="h-7 rounded-sm bg-secondary px-2 text-xs font-medium text-secondary-foreground">
        Go
      </button>
      <button type="button" className="h-7 rounded-sm bg-primary px-2 text-xs font-medium text-primary-foreground" onClick={() => go(true)}>
        Place
      </button>
      <button type="button" className="h-7 rounded-sm px-2 text-xs text-muted-foreground hover:bg-accent" onClick={readCursor}>
        Read
      </button>
      {preview ? <span className="px-1 font-mono text-[0.625rem] text-muted-foreground">{preview}</span> : null}
    </form>
  );
}

function CoordHud({ originCrs, unit }: { originCrs: string; unit: string }) {
  const cursor = useBook((s) => s.cursor);
  if (!cursor) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center sm:flex">
        <p className="rounded-t-sm bg-card/90 px-3 py-1 font-mono text-[0.6875rem] text-foreground shadow-sm">
          {originCrs}
        </p>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center sm:flex">
      <p className="max-w-[calc(100%-2rem)] truncate rounded-t-sm bg-card/90 px-3 py-1 font-mono text-[0.6875rem] text-foreground shadow-sm">
        N {cursor.n.toFixed(3)} &nbsp; E {cursor.e.toFixed(3)} &nbsp; Z {cursor.z.toFixed(2)} {unit}
        {cursor.lat != null && cursor.lon != null ? `  ·  ${formatLatLon(cursor.lat, cursor.lon)}` : ""}
        <span className="text-muted-foreground"> &nbsp; {originCrs}</span>
      </p>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, "");
}

export function JobMeta({
  className,
  feature,
}: {
  className?: string;
  feature?: Feature;
}) {
  return <span className={cn("font-mono", className)}>{feature?.name}</span>;
}
