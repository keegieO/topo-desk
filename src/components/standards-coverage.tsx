import { useMemo, useState } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { coverage, getPack, listPacks, packWarning, rawPack, STATE_REGISTRY } from "@/standards/loader";
import { rgbToHex, type SectionStatus } from "@/standards/schema";
import { symbolSvg } from "@/standards/symbols";

const STATUS_CLASS: Record<SectionStatus, string> = {
  complete: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "needs-source": "bg-muted text-muted-foreground",
};

export function StandardsCoverage() {
  const packs = useMemo(() => listPacks(), []);
  const [pick, setPick] = useState("us-in-indot");
  const pack = getPack(pick);
  const own = rawPack(pick)!;
  const warn = packWarning(pick);
  const statePacks = STATE_REGISTRY.filter((s) => s.packId);
  const others = STATE_REGISTRY.filter((s) => !s.packId);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="kicker">Standards</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">State and client standards packs</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Each job follows one pack: codes, levels or layers, colors, line styles, symbols, coordinate systems,
          deliverables and draft wording. Tables come only from the agency's published standards. Anything not yet
          imported is marked "needs source", and that state falls back to the generic NCS + APWA pack.
        </p>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Wave</th>
              <th className="px-3 py-2">Agency · software</th>
              <th className="px-3 py-2">Sections</th>
              <th className="px-3 py-2">Legal wording</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {statePacks.map((s) => {
              const p = rawPack(s.packId!)!;
              const c = coverage(p.id);
              return (
                <tr key={s.usps} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{s.wave}</td>
                  <td className="px-3 py-2">
                    {p.agency}
                    <span className="block text-xs text-muted-foreground">{p.software.primary}{p.software.note ? ` · ${p.software.note}` : ""}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {c.complete} complete · {c.partial} partial · {c.needsSource} need source
                  </td>
                  <td className="px-3 py-2 text-xs">{p.legal?.verified ? "Verified" : "Not verified"}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="text-xs font-medium underline-offset-4 hover:underline" onClick={() => setPick(p.id)}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Pack</p>
            <h2 className="mt-1 font-display text-lg font-medium">{pack.name}</h2>
            <p className="text-xs text-muted-foreground">{pack.agency} · {pack.version}</p>
          </div>
          <NativeSelect value={pick} onChange={(e) => setPick(e.target.value)} className="w-64" aria-label="Choose pack">
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        {warn ? <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">{warn}</p> : null}

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(own.status).map(([k, v]) => (
            <span key={k} className={`rounded px-2 py-1 font-mono text-[0.6875rem] ${STATUS_CLASS[v as SectionStatus]}`}>
              {k}: {v}
            </span>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Levels / layers ({pack.levels.length})</h3>
            <p className="text-xs text-muted-foreground">Display approximation. Exports write these names.</p>
            <ul className="mt-2 max-h-80 overflow-y-auto rounded-md border border-border">
              {pack.levels.map((l) => (
                <li key={l.name} className="flex items-center gap-2 border-b border-border px-2 py-1 text-xs last:border-0">
                  <svg width="28" height="8" aria-hidden>
                    <line x1="0" y1="4" x2="28" y2="4" stroke={rgbToHex(l.rgb)} strokeWidth={Math.min(l.weight, 4)} strokeDasharray={l.lineStyle && /\d/.test(l.lineStyle) ? l.lineStyle : undefined} />
                  </svg>
                  <span className="font-mono">{l.name}</span>
                  {l.description ? <span className="text-muted-foreground">· {l.description}</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-medium">Symbols ({pack.symbols.length})</h3>
              <ul className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
                {pack.symbols.map((sym) => (
                  <li key={sym.name} className="flex items-center gap-2 text-xs">
                    <span dangerouslySetInnerHTML={{ __html: symbolSvg(sym.category, "currentColor", 16) }} />
                    <span className="font-mono">{sym.nativeCell ?? sym.nativeBlock ?? sym.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Deliverables</h3>
              <ul className="mt-2 flex flex-col gap-1 text-xs">
                {pack.deliverables.map((d) => (
                  <li key={d.id}>
                    <span className="font-medium">{d.required ? "Required" : "Optional"}</span> · {d.title}
                    {d.note ? <span className="text-muted-foreground"> — {d.note}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Coordinate systems</h3>
              <ul className="mt-2 flex flex-col gap-1 text-xs">
                {pack.crs.length ? pack.crs.map((c) => <li key={c.id}>{c.name}{c.note ? <span className="text-muted-foreground"> — {c.note}</span> : null}</li>) : <li className="text-muted-foreground">Needs source</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Sources</h3>
            <ul className="mt-2 flex flex-col gap-1 text-xs">
              {own.sources.map((s) => (
                <li key={s.id}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                  <span className="text-muted-foreground"> · retrieved {s.retrieved}{s.note ? ` · ${s.note}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Draft label and legal</h3>
            <p className="mt-2 text-xs">{own.legal?.draftLabel ?? pack.legal?.draftLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {own.legal?.board ?? pack.legal?.board}
              {own.legal?.ruleCitation ? ` · ${own.legal.ruleCitation}` : ""} · {own.legal?.verified ? "verified" : "not verified"}
            </p>
            {own.todo.length ? (
              <>
                <h3 className="mt-4 text-sm font-medium">Still to import</h3>
                <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                  {own.todo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">Other states</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Jobs in these states use the generic NCS + APWA pack until a DOT pack is added.
        </p>
        <p className="mt-2 text-xs leading-relaxed">{others.map((s) => s.name).join(" · ")}</p>
      </section>
    </div>
  );
}
