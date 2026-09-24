import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import {
  ATTR_HINT,
  KIND_LABEL,
  LINKING_CODES,
  allCategories,
  features,
  lookupCode,
  searchFeatures,
  type FeatureKind,
} from "@/lib/catalog";
import { splitDescription } from "@/lib/label";

const KINDS: { id: FeatureKind | "all"; label: string }[] = [
  { id: "survey", label: "Survey" },
  { id: "point", label: "Point" },
  { id: "linear", label: "Linear" },
  { id: "alignment", label: "Alignment" },
  { id: "all", label: "All" },
];

export function CodeLibrary() {
  const [kind, setKind] = useState<FeatureKind | "all">("survey");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const cats = useMemo(() => {
    const pool = kind === "all" ? allCategories : [...new Set(features.filter((f) => f.kind === kind).map((f) => f.cat))].sort();
    return pool;
  }, [kind]);

  const rows = useMemo(() => searchFeatures(q, { kind, cat }), [q, kind, cat]);

  const decoder = useMemo(() => {
    const { codeToken, remainder } = splitDescription(q);
    const hit = lookupCode(codeToken);
    if (!q.trim()) return null;
    return { codeToken, remainder, hit };
  }, [q]);

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied");
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Look up</p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-tight">INDOT feature codes</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          {features.length} feature definitions from the INDOT OpenRoads workbook. Search by alpha code, name, or description. Paste a raw description such as EP ST to decode it.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="EP, PHYD, pavement, manhole…"
            className="sm:flex-1"
          />
          <NativeSelect
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as FeatureKind | "all");
              setCat("all");
            }}
            className="sm:w-40"
          >
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-48">
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
        {decoder?.hit ? (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <p className="kicker">Decoded</p>
            <p className="mt-1 font-mono text-sm">
              {decoder.codeToken}
              {decoder.remainder ? `  ${decoder.remainder}` : ""}
            </p>
            <p className="mt-1 text-sm">
              {decoder.hit.desc || decoder.hit.name}
              <span className="text-muted-foreground"> · {decoder.hit.name}</span>
            </p>
          </div>
        ) : null}
      </section>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono tabular-nums text-foreground">{rows.length}</span> of{" "}
        <span className="font-mono tabular-nums">{features.length}</span>
      </p>

      <ul className="flex flex-col gap-2">
        {rows.slice(0, 250).map((f) => (
          <li key={f.id} className="rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {f.alphas.length ? (
                    f.alphas.map((a) => (
                      <span key={a} className="font-mono text-sm font-medium">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-sm font-medium text-muted-foreground">—</span>
                  )}
                  <Badge variant="muted">{KIND_LABEL[f.kind]}</Badge>
                  <Badge variant="outline">{f.cat}</Badge>
                  {f.attr ? (
                    <Badge variant={f.attr === "Break Line" || f.attr === "Spot And Break" ? "ok" : "outline"}>
                      {f.attr}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-medium">{f.desc || f.name}</p>
                <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">{f.name}</p>
                {f.attr && ATTR_HINT[f.attr] ? (
                  <p className="mt-1 text-xs text-muted-foreground">{ATTR_HINT[f.attr]}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                {f.alphas[0] ? (
                  <Button variant="outline" size="sm" onClick={() => copy(f.alphas[0], `a-${f.id}`)}>
                    {copied === `a-${f.id}` ? <Check /> : <Copy />}
                    Code
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => copy(f.name, `n-${f.id}`)}>
                  {copied === `n-${f.id}` ? <Check /> : <Copy />}
                  Definition
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {rows.length > 250 ? (
        <p className="text-center text-sm text-muted-foreground">Narrow the search to see the rest of {rows.length} matches.</p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="kicker">OpenRoads linking codes</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed after the feature code in the description. They are stripped from matching and kept on export.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LINKING_CODES.map((c) => (
            <li key={c.code} className="rounded-md border border-border bg-background px-3 py-2">
              <p className="font-mono text-xs font-medium">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.meaning}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
