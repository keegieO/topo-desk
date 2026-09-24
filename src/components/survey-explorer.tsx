import { useMemo } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBook } from "@/lib/store";
import { resolveFeature } from "@/lib/label";
import { styleForCode } from "@/lib/symbology";
import { fishbeckKnown, fishbeckLevel } from "@/lib/fishbeck";
import { cn } from "@/lib/utils";

const CODE_NAME: Record<string, string> = {
  ES: "Edge of shoulder",
  LL: "Lane line",
  EP: "Edge of pavement",
  RC: "Road crown",
  DL: "Ditch line",
  WF: "Flow line",
  RP: "Riprap",
  RB: "Guardrail",
  FF: "Field fence",
  BR: "Right of way",
  WL: "Woods line",
  CMP: "Cross pipe",
  CPP: "Pipe",
  DR: "Drainage pipe",
};

export function SurveyExplorer() {
  const shots = useBook((s) => s.shots);
  const remaps = useBook((s) => s.remaps);
  const hiddenAlphas = useBook((s) => s.hiddenAlphas);
  const toggleAlpha = useBook((s) => s.toggleAlpha);
  const showAllAlphas = useBook((s) => s.showAllAlphas);
  const hideAllAlphas = useBook((s) => s.hideAllAlphas);
  const focusOn = useBook((s) => s.focusOn);
  const query = useBook((s) => s.query);
  const setQuery = useBook((s) => s.setQuery);
  const selectedUid = useBook((s) => s.selectedUid);
  const activeCode = useBook((s) => s.activeCode);
  const setActiveCode = useBook((s) => s.setActiveCode);
  const setSelected = useBook((s) => s.setSelected);
  const setTool = useBook((s) => s.setTool);
  const isolated = useBook((s) => s.isolated);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { code: string; n: number; cat: string; desc: string; name: string; unmatched: boolean }
    >();
    for (const s of shots) {
      const code = (s.codeToken || "(blank)").toUpperCase();
      const f = resolveFeature(s, remaps);
      const fb = fishbeckLevel(code, f?.cat);
      const family = fb.level.split("_").slice(0, 2).join("_") || "Survey";
      const cur = map.get(code);
      if (cur) cur.n += 1;
      else
        map.set(code, {
          code,
          n: 1,
          cat: family,
          desc: fb.level,
          name: f?.name || CODE_NAME[code] || "",
          unmatched: !f && !fishbeckKnown(code),
        });
    }
    const rows = [...map.values()].sort((a, b) => a.desc.localeCompare(b.desc) || a.code.localeCompare(b.code));
    const q = query.trim().toUpperCase();
    const filtered = q
      ? rows.filter((r) => `${r.code} ${r.desc} ${r.name} ${r.cat}`.toUpperCase().includes(q))
      : rows;
    const byCat = new Map<string, typeof filtered>();
    for (const r of filtered) {
      const list = byCat.get(r.cat) ?? [];
      list.push(r);
      byCat.set(r.cat, list);
    }
    return { rows: filtered, byCat: [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0])), total: rows.length };
  }, [shots, remaps, query]);

  const selectedCode = shots.find((s) => s.uid === selectedUid)?.codeToken.toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium">Levels</p>
      </div>
      <div className="border-b border-border px-3 py-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          className="h-8"
        />
        <div className="mt-2 flex gap-1">
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={showAllAlphas}>
            Display all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => hideAllAlphas(groups.rows.map((r) => r.code))}
          >
            Hide all
          </Button>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-1 py-1">
          {groups.byCat.map(([cat, rows]) => (
            <div key={cat} className="mb-1">
              <p className="px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {cat}
              </p>
              <ul>
                {rows.map((r) => {
                  const on = isolated ? isolated === r.code : !hiddenAlphas[r.code];
                  const style = styleForCode(r.code, r.cat);
                  const level = fishbeckLevel(r.code, r.unmatched ? undefined : r.cat);
                  const active = activeCode === r.code;
                  const picked = selectedCode === r.code;
                  return (
                    <li key={r.code}>
                      <div
                        className={cn(
                          "flex w-full items-center gap-1 whitespace-nowrap rounded-sm px-1 py-0.5 text-xs",
                          active ? "bg-level text-level-foreground" : picked ? "bg-accent" : "hover:bg-accent/70",
                          !on && !active && "opacity-40",
                        )}
                      >
                        <button
                          type="button"
                          title={on ? "Hide" : "Display"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlpha(r.code);
                          }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-current"
                        >
                          {on ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCode(r.code);
                            const hit = shots.find((s) => s.codeToken.toUpperCase() === r.code);
                            if (hit) setSelected(hit.uid);
                          }}
                          onDoubleClick={() => focusOn(r.code)}
                          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: r.unmatched ? "var(--color-destructive)" : style.color }}
                          />
                          <span className="min-w-0 flex-1 truncate">{level.level}</span>
                          <span className={cn("font-mono", r.unmatched ? "text-destructive" : "opacity-70")}>{r.code}</span>
                          <span className="font-mono tabular-nums opacity-70">{r.n}</span>
                        </button>
                        <button
                          type="button"
                          title="Draw"
                          onClick={() => {
                            setActiveCode(r.code);
                            setTool("line");
                          }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm opacity-70 hover:opacity-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {!groups.rows.length ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No codes in this job.</p>
          ) : null}
        </div>
      </ScrollArea>
      <p className="border-t border-border px-3 py-1.5 font-mono text-[0.625rem] text-muted-foreground">
        {groups.total} codes
        {activeCode ? ` · ${activeCode}` : ""}
      </p>
    </div>
  );
}
