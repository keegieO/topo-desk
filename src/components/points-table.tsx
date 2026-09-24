import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useBook, templateOf } from "@/lib/store";
import { applyTemplate, resolveFeature } from "@/lib/label";
import { formatOffset, projectAlignment } from "@/lib/align";
import { chainVertices } from "@/lib/chains";
import { allChains } from "@/lib/cad-export";
import { formatStation, stationOffset } from "@/lib/cogo";
import { detectGeoOrigin, toLatLon, formatLatLon } from "@/lib/geo";
import { useJobs } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export function PointsTable() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const filter = useBook((s) => s.filter);
  const query = useBook((s) => s.query);
  const selectedUid = useBook((s) => s.selectedUid);
  const setSelected = useBook((s) => s.setSelected);
  const updateShot = useBook((s) => s.updateShot);
  const templateId = useBook((s) => s.templateId);
  const crsId = useBook((s) => s.crsId);
  const fileName = useBook((s) => s.fileName);
  const tmpl = templateOf(templateId);
  const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
  const userLines = useBook((s) => s.userLines);
  const origin = useMemo(
    () => detectGeoOrigin(shots, { crsId, county: job?.county, crs: job?.crs, fileName }),
    [shots, crsId, job?.county, job?.crs, fileName],
  );
  const align = useMemo(
    () =>
      projectAlignment(
        shots,
        allChains(shots, remaps, userLines).map((c) => ({ code: c.code, pts: chainVertices(c) })),
      ),
    [shots, remaps, userLines],
  );

  const rows = useMemo(() => {
    const q = query.trim().toUpperCase();
    return shots.filter((s) => {
      const f = resolveFeature(s, remaps);
      const matched = Boolean(f);
      if (filter === "matched" && !matched) return false;
      if (filter === "unmatched" && matched) return false;
      if (!q) return true;
      const hay = `${s.point} ${s.codeToken} ${s.description} ${f?.name ?? ""} ${f?.desc ?? ""} ${f?.cat ?? ""}`.toUpperCase();
      return hay.includes(q);
    });
  }, [shots, remaps, filter, query]);

  if (!shots.length) {
    return (
      <p className="px-2 py-10 text-center text-sm text-muted-foreground">
        Open a field book to list point, northing, easting, elevation, and code.
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="px-2 py-10 text-center text-sm text-muted-foreground">No shots match this filter.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Pt</th>
            <th className="py-2 pr-3 font-medium">N</th>
            <th className="py-2 pr-3 font-medium">E</th>
            <th className="py-2 pr-3 font-medium">Z</th>
            <th className="py-2 pr-3 font-medium">Sta</th>
            <th className="py-2 pr-3 font-medium">Off</th>
            <th className="py-2 pr-3 font-medium">Code</th>
            <th className="py-2 pr-3 font-medium">Lat / Lon</th>
            <th className="py-2 pr-3 font-medium">INDOT feature</th>
            <th className="py-2 font-medium">Label</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const f = resolveFeature(s, remaps);
            const selected = selectedUid === s.uid;
            const ll = toLatLon(s.northing, s.easting, origin);
            return (
              <tr
                key={s.uid}
                onClick={() => setSelected(s.uid)}
                className={cn(
                  "cursor-pointer border-b border-border/70 transition-colors duration-[var(--motion-quick)]",
                  selected ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <td className="py-2 pr-3 font-mono tabular-nums">
                  {selected ? (
                    <input
                      className="w-20 bg-transparent font-mono text-sm"
                      defaultValue={s.point}
                      onBlur={(e) => updateShot(s.uid, { point: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    s.point
                  )}
                </td>
                <td className="py-2 pr-3 font-mono tabular-nums text-muted-foreground">
                  {selected ? (
                    <input
                      className="w-28 bg-transparent font-mono text-sm"
                      defaultValue={s.northing.toFixed(4)}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) updateShot(s.uid, { northing: n });
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    s.northing.toFixed(4)
                  )}
                </td>
                <td className="py-2 pr-3 font-mono tabular-nums text-muted-foreground">
                  {selected ? (
                    <input
                      className="w-28 bg-transparent font-mono text-sm"
                      defaultValue={s.easting.toFixed(4)}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) updateShot(s.uid, { easting: n });
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    s.easting.toFixed(4)
                  )}
                </td>
                <td className="py-2 pr-3 font-mono tabular-nums">
                  {selected ? (
                    <input
                      className="w-20 bg-transparent font-mono text-sm"
                      defaultValue={s.elevation.toFixed(2)}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) updateShot(s.uid, { elevation: n });
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    s.elevation.toFixed(2)
                  )}
                </td>
                <td className="py-2 pr-3 font-mono tabular-nums text-muted-foreground">
                  {(() => {
                    const so = align
                      ? stationOffset(align.pts, { n: s.northing, e: s.easting, z: s.elevation })
                      : null;
                    return so ? formatStation(so.station) : "—";
                  })()}
                </td>
                <td className="py-2 pr-3 font-mono tabular-nums text-muted-foreground">
                  {(() => {
                    const so = align
                      ? stationOffset(align.pts, { n: s.northing, e: s.easting, z: s.elevation })
                      : null;
                    return so ? formatOffset(so.offset) : "—";
                  })()}
                </td>
                <td className="py-2 pr-3">
                  {selected ? (
                    <input
                      className="w-full bg-transparent font-mono text-xs"
                      defaultValue={s.description}
                      onBlur={(e) => updateShot(s.uid, { description: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-medium">{s.codeToken || "—"}</span>
                      {s.remainder ? (
                        <span className="font-mono text-[0.6875rem] text-muted-foreground">{s.remainder}</span>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                  {formatLatLon(ll.lat, ll.lon)}
                </td>
                <td className="py-2 pr-3">
                  {f ? (
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-medium">{f.desc || f.name}</span>
                        <Badge variant="ok">{f.cat}</Badge>
                      </div>
                      <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">{f.name}</p>
                    </div>
                  ) : (
                    <Badge variant="bad">Unmatched</Badge>
                  )}
                </td>
                <td className="py-2 font-mono text-xs">{applyTemplate(s, f, tmpl)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
