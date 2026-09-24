import { useMemo, useState } from "react";
import { Eye, EyeOff, Snowflake } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBook } from "@/lib/store";
import { resolveFeature } from "@/lib/label";
import { styleForCode } from "@/lib/symbology";
import { cn } from "@/lib/utils";

export function LevelsPanel() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const hiddenAlphas = useBook((s) => s.hiddenAlphas);
  const frozenAlphas = useBook((s) => s.frozenAlphas);
  const toggleAlpha = useBook((s) => s.toggleAlpha);
  const toggleFrozen = useBook((s) => s.toggleFrozen);
  const focusOn = useBook((s) => s.focusOn);
  const isolate = useBook((s) => s.isolate);
  const isolated = useBook((s) => s.isolated);
  const selectedUid = useBook((s) => s.selectedUid);
  const setSelected = useBook((s) => s.setSelected);
  const setActiveCode = useBook((s) => s.setActiveCode);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const levels = useMemo(() => {
    const map = new Map<
      string,
      { name: string; cat: string; code: string; n: number; unmatched: boolean }
    >();
    for (const s of shots) {
      const f = resolveFeature(s, remaps);
      const name = f?.name ?? `UNMATCHED_${(s.codeToken || "BLANK").toUpperCase()}`;
      const cur = map.get(name);
      if (cur) cur.n += 1;
      else
        map.set(name, {
          name,
          cat: f?.cat ?? "Unmatched",
          code: (s.codeToken || "").toUpperCase(),
          n: 1,
          unmatched: !f,
        });
    }
    const list = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    const byCat = new Map<string, typeof list>();
    for (const lv of list) {
      const arr = byCat.get(lv.cat) ?? [];
      arr.push(lv);
      byCat.set(lv.cat, arr);
    }
    return { list, byCat: [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
  }, [shots, remaps]);

  const selectedCode = shots.find((s) => s.uid === selectedUid)?.codeToken.toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Level display</p>
      </div>
      <div className="grid grid-cols-[auto_auto_1fr_auto] gap-1 border-b border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
        <span className="w-7 text-center">On</span>
        <span className="w-7 text-center">Frz</span>
        <span>Name</span>
        <span>Used</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {levels.byCat.map(([cat, rows]) => {
          const collapsed = openCats[cat] === false;
          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => setOpenCats((s) => ({ ...s, [cat]: s[cat] === false }))}
                className="flex w-full items-center px-3 py-1 text-left text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:bg-accent/50"
              >
                {collapsed ? "▸" : "▾"} {cat}
              </button>
              {collapsed ? null : (
                <ul>
                  {rows.map((lv) => {
                    const on = isolated ? isolated === lv.code : !hiddenAlphas[lv.code];
                    const frozen = Boolean(frozenAlphas[lv.code]);
                    const active = selectedCode === lv.code;
                    const color = lv.unmatched ? "var(--color-destructive)" : styleForCode(lv.code, lv.cat).color;
                    return (
                      <li key={lv.name}>
                        <div
                          className={cn(
                            "grid grid-cols-[auto_auto_1fr_auto] items-center gap-1 whitespace-nowrap px-1 text-xs",
                            active ? "bg-level text-level-foreground" : "hover:bg-accent/70",
                            !on && !active && "opacity-40",
                          )}
                        >
                          <button
                            type="button"
                            title={on ? "Hide" : "Display"}
                            onClick={() => toggleAlpha(lv.code)}
                            className="flex h-7 w-7 items-center justify-center"
                          >
                            {on ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            title={frozen ? "Thaw" : "Freeze"}
                            onClick={() => toggleFrozen(lv.code)}
                            className={cn("flex h-7 w-7 items-center justify-center", frozen ? "text-primary" : "opacity-40")}
                          >
                            <Snowflake className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCode(lv.code);
                              const hit = shots.find((s) => s.codeToken.toUpperCase() === lv.code);
                              if (hit) setSelected(hit.uid);
                            }}
                            onDoubleClick={() => {
                              isolate(lv.code);
                              focusOn(lv.code);
                            }}
                            className="flex min-w-0 items-center gap-2 py-1.5 text-left"
                          >
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                            <span className="truncate font-mono">{lv.name}</span>
                          </button>
                          <span className="pr-2 font-mono tabular-nums text-muted-foreground">{lv.n}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
