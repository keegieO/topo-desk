import { useMemo } from "react";
import { useBook } from "@/lib/store";
import { resolveFeature } from "@/lib/label";
import { cn } from "@/lib/utils";

const CAT_MARK: Record<string, "circle" | "square" | "tri" | "plus" | "diamond"> = {
  Roadway: "circle",
  Drainage: "diamond",
  Utility: "square",
  Property: "plus",
  "Right of Way": "plus",
  "Survey Control": "tri",
  Topo: "circle",
  Traffic: "square",
  Bridge: "diamond",
  Surface: "circle",
};

export function PlanView() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const selectedUid = useBook((s) => s.selectedUid);
  const setSelected = useBook((s) => s.setSelected);

  const layout = useMemo(() => {
    if (!shots.length) return null;
    let minE = Infinity,
      maxE = -Infinity,
      minN = Infinity,
      maxN = -Infinity;
    for (const s of shots) {
      minE = Math.min(minE, s.easting);
      maxE = Math.max(maxE, s.easting);
      minN = Math.min(minN, s.northing);
      maxN = Math.max(maxN, s.northing);
    }
    const spanE = Math.max(maxE - minE, 1);
    const spanN = Math.max(maxN - minN, 1);
    const pad = 0.12;
    const w = 320;
    const h = 360;
    const scale = Math.min(w / (spanE * (1 + pad * 2)), h / (spanN * (1 + pad * 2)));
    const ox = (w - spanE * scale) / 2 - minE * scale;
    const oy = (h - spanN * scale) / 2 - minN * scale;
    return { w, h, scale, ox, oy, minE, minN, spanE, spanN };
  }, [shots]);

  const selected = shots.find((s) => s.uid === selectedUid);

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="kicker">Plan</p>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">N up · INDOT marks</p>
      </div>
      {!layout ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No points</div>
      ) : (
        <svg
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          className="h-auto w-full rounded-lg bg-background"
          role="img"
          aria-label="Plan view of survey shots"
        >
          <rect width={layout.w} height={layout.h} fill="currentColor" className="text-background" />
          <NorthArrow x={layout.w - 28} y={28} />
          {shots.map((s) => {
            const x = s.easting * layout.scale + layout.ox;
            const y = layout.h - (s.northing * layout.scale + layout.oy);
            const f = resolveFeature(s, remaps);
            const mark = CAT_MARK[f?.cat ?? ""] ?? "circle";
            const on = s.uid === selectedUid;
            return (
              <g
                key={s.uid}
                transform={`translate(${x} ${y})`}
                className={cn("cursor-pointer", on ? "text-primary" : f ? "text-foreground" : "text-destructive")}
                onClick={() => setSelected(s.uid)}
              >
                <Mark type={mark} on={on} />
              </g>
            );
          })}
        </svg>
      )}
      {selected ? (
        <SelectedCard uid={selected.uid} />
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Select a shot in the table or plan.</p>
      )}
    </div>
  );
}

function SelectedCard({ uid }: { uid: string }) {
  const shot = useBook((s) => s.shots.find((x) => x.uid === uid));
  const remaps = useBook((s) => s.remaps);
  if (!shot) return null;
  const f = resolveFeature(shot, remaps);
  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-3">
      <p className="font-mono text-xs text-muted-foreground">Point {shot.point}</p>
      <p className="mt-1 font-mono text-sm">
        {shot.codeToken}
        {shot.remainder ? `  ${shot.remainder}` : ""}
      </p>
      <p className="mt-1 text-sm">{f ? `${f.desc || f.name}` : "Unmatched field code"}</p>
      {f ? <p className="font-mono text-[0.6875rem] text-muted-foreground">{f.name}</p> : null}
    </div>
  );
}

function Mark({ type, on }: { type: "circle" | "square" | "tri" | "plus" | "diamond"; on: boolean }) {
  const s = on ? 6 : 4;
  const sw = on ? 1.6 : 1.15;
  if (type === "square") {
    return <rect x={-s} y={-s} width={s * 2} height={s * 2} fill="none" stroke="currentColor" strokeWidth={sw} />;
  }
  if (type === "tri") {
    const p = `0,${-s - 1} ${s},${s} ${-s},${s}`;
    return <polygon points={p} fill="none" stroke="currentColor" strokeWidth={sw} />;
  }
  if (type === "plus") {
    return (
      <g stroke="currentColor" strokeWidth={sw}>
        <line x1={-s} y1={0} x2={s} y2={0} />
        <line x1={0} y1={-s} x2={0} y2={s} />
      </g>
    );
  }
  if (type === "diamond") {
    const p = `0,${-s} ${s},0 0,${s} ${-s},0`;
    return <polygon points={p} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={sw} />;
  }
  return <circle r={s} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={sw} />;
}

function NorthArrow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="text-muted-foreground">
      <polygon points="0,-10 3.2,4 -3.2,4" fill="currentColor" />
      <text x={0} y={14} textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="IBM Plex Mono, ui-monospace">
        N
      </text>
    </g>
  );
}
