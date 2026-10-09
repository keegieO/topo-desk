import {
  buildChains,
  chainVertices,
  userLineToChain,
  type Chain,
  type UserLine,
} from "./chains";
import { resolveFeature, type LabeledShot } from "./label";
import { styleForCode } from "./symbology";
import { fishbeckLayer, civilLayer, CIVIL_LAYER } from "./fishbeck";
import type { Leader } from "./notes";
import type { ContourRing } from "./tin";
import type { TerrainModel } from "./terrain";
import { stamp } from "./utils";

const CONTROL = new Set(["PRE", "PBMK", "PMON", "TRAV", "PIDT", "PPIN"]);

export function allChains(shots: LabeledShot[], remaps: Record<string, string>, userLines: UserLine[]): Chain[] {
  return [...buildChains(shots, remaps), ...userLines.map((l) => userLineToChain(l, remaps))];
}

function pair(code: number, value: string | number): string {
  return `${code}\n${value}\n`;
}

function aciFromHex(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 7;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const swatches: [number, number, number, number][] = [
    [1, 255, 0, 0],
    [2, 255, 255, 0],
    [3, 0, 255, 0],
    [4, 0, 255, 255],
    [5, 0, 0, 255],
    [6, 255, 0, 255],
    [7, 255, 255, 255],
    [8, 128, 128, 128],
    [30, 255, 127, 0],
    [40, 255, 191, 0],
    [42, 230, 200, 75],
    [50, 200, 160, 40],
    [90, 90, 212, 212],
    [140, 58, 212, 255],
    [150, 42, 158, 212],
    [170, 61, 156, 74],
    [190, 110, 232, 110],
    [210, 212, 92, 255],
    [230, 255, 122, 217],
    [10, 255, 77, 77],
  ];
  let best = 7;
  let d = Infinity;
  for (const [aci, cr, cg, cb] of swatches) {
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < d) {
      d = dist;
      best = aci;
    }
  }
  return best;
}

/**
 * Build a DXF R12 file from survey data.
 *
 * Layer naming convention (selectable via `layerStd`):
 *   "indot"  — INDOT/Fishbeck ORD level names  (S_RDWY_*, S_CTRL_*, …)  [default]
 *   "civil3d"— Civil 3D / NCS standard names   (V-NODE-BLCR, V-SURF-TIN, …)
 *   "both"   — Civil 3D primary, INDOT in xdata GROUP_CODE 1001/1000
 */
export function buildDxf(opts: {
  shots: LabeledShot[];
  chains: Chain[];
  leaders?: Leader[];
  contours?: ContourRing[];
  /** Layer naming standard to embed. Defaults to "indot". */
  layerStd?: "indot" | "civil3d" | "both";
}): string {
  const { shots, chains } = opts;
  const std = opts.layerStd ?? "indot";

  const layers = new Map<string, number>();
  const ensure = (code: string): string => {
    const name =
      code === "P-LABEL"
        ? std === "civil3d" || std === "both"
          ? CIVIL_LAYER.LABEL
          : "S_TOPO_Text"
        : std === "indot"
          ? fishbeckLayer(code)
          : civilLayer(code);
    if (!layers.has(name)) layers.set(name, aciFromHex(styleForCode(code).color));
    return name;
  };

  const textLayer  = std === "civil3d" || std === "both" ? CIVIL_LAYER.LABEL       : "S_TOPO_Text";
  const ctourLayer = std === "civil3d" || std === "both" ? CIVIL_LAYER.CONTOUR_MAJOR : "S_SURF_MajorContours";
  const tinLayer   = std === "civil3d" || std === "both" ? CIVIL_LAYER.TIN_FACE     : "S_SURF_TIN";

  ensure("P-LABEL");
  layers.set(textLayer, 7);
  layers.set(ctourLayer, 2);
  layers.set(tinLayer, 5);

  const noted = new Set((opts.leaders ?? []).map((l) => l.shotUid).filter(Boolean));

  let ents = "";
  for (const ch of chains) {
    const verts = chainVertices(ch);
    if (verts.length < 2) continue;
    const layer = ensure(ch.code);
    const flags = (ch.closed ? 1 : 0) | 8;
    ents += pair(0, "POLYLINE");
    ents += pair(8, layer);
    ents += pair(66, 1);
    ents += pair(70, flags);
    ents += pair(10, 0);
    ents += pair(20, 0);
    ents += pair(30, 0);
    for (const v of verts) {
      ents += pair(0, "VERTEX");
      ents += pair(8, layer);
      ents += pair(10, v.e.toFixed(4));
      ents += pair(20, v.n.toFixed(4));
      ents += pair(30, v.z.toFixed(4));
      ents += pair(70, 32);
    }
    ents += pair(0, "SEQEND");
    ents += pair(8, layer);
  }

  for (const ring of opts.contours ?? []) {
    if (!ring.index || ring.pts.length < 2) continue;
    ents += pair(0, "POLYLINE");
    ents += pair(8, ctourLayer);
    ents += pair(66, 1);
    ents += pair(70, 8);
    ents += pair(10, 0);
    ents += pair(20, 0);
    ents += pair(30, ring.z.toFixed(2));
    const step = Math.max(1, Math.floor(ring.pts.length / 80));
    for (let i = 0; i < ring.pts.length; i += step) {
      const v = ring.pts[i];
      ents += pair(0, "VERTEX");
      ents += pair(8, ctourLayer);
      ents += pair(10, v.e.toFixed(4));
      ents += pair(20, v.n.toFixed(4));
      ents += pair(30, ring.z.toFixed(2));
      ents += pair(70, 32);
    }
    ents += pair(0, "SEQEND");
    ents += pair(8, ctourLayer);
    const mid = ring.pts[Math.floor(ring.pts.length / 2)];
    ents += pair(0, "TEXT");
    ents += pair(8, ctourLayer);
    ents += pair(10, mid.e.toFixed(4));
    ents += pair(20, mid.n.toFixed(4));
    ents += pair(30, ring.z.toFixed(2));
    ents += pair(40, 2);
    ents += pair(1, ring.z.toFixed(0));
  }

  for (const note of opts.leaders ?? []) {
    if (note.arrow) {
      ents += pair(0, "LINE");
      ents += pair(8, textLayer);
      ents += pair(10, note.e.toFixed(4));
      ents += pair(20, note.n.toFixed(4));
      ents += pair(30, 0);
      ents += pair(11, note.te.toFixed(4));
      ents += pair(21, note.tn.toFixed(4));
      ents += pair(31, 0);
    }
    note.text.split("\n").forEach((line, i) => {
      ents += pair(0, "TEXT");
      ents += pair(8, textLayer);
      ents += pair(10, note.e.toFixed(4));
      ents += pair(20, (note.n - i * 2.4).toFixed(4));
      ents += pair(30, 0);
      ents += pair(40, 2.2);
      ents += pair(1, line.slice(0, 120));
    });
  }

  for (const s of shots) {
    const layer = ensure(s.codeToken);
    ents += pair(0, "POINT");
    ents += pair(8, layer);
    ents += pair(10, s.easting.toFixed(4));
    ents += pair(20, s.northing.toFixed(4));
    ents += pair(30, s.elevation.toFixed(4));
    const label = CONTROL.has(s.codeToken.toUpperCase()) || noted.has(s.uid);
    if (label && s.point) {
      ents += pair(0, "TEXT");
      ents += pair(8, textLayer);
      ents += pair(10, (s.easting + 1.5).toFixed(4));
      ents += pair(20, (s.northing + 1.5).toFixed(4));
      ents += pair(30, s.elevation.toFixed(4));
      ents += pair(40, 1.5);
      ents += pair(1, `${s.point} ${s.codeToken}`);
    }
  }

  let out = "";
  out += pair(0, "SECTION");
  out += pair(2, "HEADER");
  out += pair(9, "$ACADVER");
  out += pair(1, "AC1009");
  out += pair(9, "$INSUNITS");
  out += pair(70, 2);
  out += pair(0, "ENDSEC");
  out += pair(0, "SECTION");
  out += pair(2, "TABLES");
  out += pair(0, "TABLE");
  out += pair(2, "LAYER");
  out += pair(70, layers.size);
  for (const [name, color] of layers) {
    out += pair(0, "LAYER");
    out += pair(2, name);
    out += pair(70, 0);
    out += pair(62, color);
    out += pair(6, "CONTINUOUS");
  }
  out += pair(0, "ENDTAB");
  out += pair(0, "ENDSEC");
  out += pair(0, "SECTION");
  out += pair(2, "ENTITIES");
  out += ents;
  out += pair(0, "ENDSEC");
  out += pair(0, "EOF");
  return out;
}

function xmlEsc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&" + "apos;";
  });
}

export function buildLandXml(opts: {
  shots: LabeledShot[];
  chains: Chain[];
  remaps: Record<string, string>;
  project: string;
  crs: string;
  terrain?: TerrainModel | null;
}): string {
  const { shots, chains, remaps, project, crs } = opts;
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 19);
  const pts = shots
    .map((s) => {
      const f = resolveFeature(s, remaps);
      const code = xmlEsc(s.codeToken || "");
      const name = xmlEsc(String(s.point || s.uid));
      const n = s.northing.toFixed(4);
      const e = s.easting.toFixed(4);
      const z = s.elevation.toFixed(4);
      return `    <CgPoint name="${name}" code="${code}" desc="${xmlEsc(f?.name || s.description)}" oID="${name}">${n} ${e} ${z}</CgPoint>`;
    })
    .join("\n");

  const feats = chains
    .map((ch, i) => {
      const verts = chainVertices(ch);
      if (verts.length < 2) return "";
      const list = verts.map((v) => `${v.n.toFixed(4)} ${v.e.toFixed(4)} ${v.z.toFixed(4)}`).join(" ");
      const name = xmlEsc(`${ch.code}-${i + 1}`);
      const desc = xmlEsc(ch.feature?.name || ch.code);
      return `    <PlanFeature name="${name}" state="proposed">
      <CoordGeom>
        <IrregularLine desc="${desc}">
          <PntList3D>${list}</PntList3D>
        </IrregularLine>
      </CoordGeom>
    </PlanFeature>`;
    })
    .filter(Boolean)
    .join("\n");

  const surface = opts.terrain?.tris.length
    ? `
  <Surfaces>
    <Surface name="Existing" desc="Survey TIN">
      <Definition surfType="TIN">
        <Pnts>
${opts.terrain.pts.map((p, i) => `          <P id="${i + 1}">${p.n.toFixed(4)} ${p.e.toFixed(4)} ${p.z.toFixed(4)}</P>`).join("\n")}
        </Pnts>
        <Faces>
${opts.terrain.tris.map((t) => `          <F>${t.a + 1} ${t.b + 1} ${t.c + 1}</F>`).join("\n")}
        </Faces>
      </Definition>
    </Surface>
  </Surfaces>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2" date="${date}" time="${time}">
  <Units>
    <Imperial linearUnit="foot" areaUnit="squareFoot" volumeUnit="cubicFoot" temperatureUnit="fahrenheit" pressureUnit="inchHG"/>
  </Units>
  <CoordinateSystem desc="${xmlEsc(crs)}" horizontalCoordinateSystemName="${xmlEsc(crs)}"/>
  <Application name="GeoLine Solutions" version="1.0" manufacturer="GeoLine Solutions LLC"/>
  <Project name="${xmlEsc(project)}"/>
  <CgPoints>${pts ? `\n${pts}\n  ` : ""}</CgPoints>
  <PlanFeatures>${feats ? `\n${feats}\n  ` : ""}</PlanFeatures>${surface}
</LandXML>
`;
}

export function buildControlCsv(shots: LabeledShot[]): string {
  const rows = [["Point", "Northing", "Easting", "Elevation", "Code", "Description"]];
  for (const s of shots) {
    if (!CONTROL.has(s.codeToken.toUpperCase())) continue;
    rows.push([
      String(s.point),
      s.northing.toFixed(4),
      s.easting.toFixed(4),
      s.elevation.toFixed(4),
      s.codeToken,
      s.description,
    ]);
  }
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n";
}

export function cadFilenames(base: string) {
  const tag = stamp();
  const stem = base.replace(/\.[^.]+$/, "") || "job";
  return {
    dxf: `${stem}_breaklines_${tag}.dxf`,
    xml: `${stem}_LandXML_${tag}.xml`,
    control: `${stem}_control_${tag}.csv`,
  };
}
