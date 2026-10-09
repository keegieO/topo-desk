import { useState } from "react";
import { JobForm } from "@/components/job-form";
import { SERVICES, WORKFLOW, COVERAGE, SEND_LIST, DELIVER_LIST } from "@/lib/company";
import { FIRMS, FIRM_KIND } from "@/lib/clients";
import { useFirm, firmCityLine, type FirmRates } from "@/lib/firm";

export function CrewPortal() {
  const firm = useFirm();
  const rates = firm.rates;
  const [calcMiles, setCalcMiles] = useState(1);
  const [calcHours, setCalcHours] = useState(0);
  const [calcPlan, setCalcPlan] = useState(false);
  const [calcRush, setCalcRush] = useState(false);
  const [calcKind, setCalcKind] = useState<"conventional" | "breakline">("conventional");
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="kicker">For survey companies</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Drop the book. Get an ORD-ready file.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            GeoLine Solutions is the extraction sub. Crews and PMs send conventional field books. We reduce,
            extract linework, code to INDOT, QA, and hand back a package you drop into OpenRoads.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {firmCityLine(firm)} · {firm.hours} · {firm.phone} · {firm.email}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          <HeroStat k="Coding library" v="318 survey" />
          <HeroStat k="Rush" v="1.35×" />
          <HeroStat k="Terms" v={firm.terms} />
          <HeroStat k="Shop" v={firm.city} />
        </dl>
      </section>

      <section>
        <p className="kicker">How it works</p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {WORKFLOW.map((w) => (
            <li key={w.step} className="rounded-lg border border-border bg-card p-4">
              <p className="font-mono text-xs text-muted-foreground">{w.step}</p>
              <h2 className="mt-2 font-display text-lg font-medium">{w.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{w.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <p className="kicker">What we extract</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.id} className="flex flex-col rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-medium">{s.title}</h2>
                <p className="font-mono text-xs">{s.rate}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
            </li>
          ))}
          <li className="flex flex-col rounded-lg border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-medium">Rush</h2>
              <p className="font-mono text-xs">1.35×</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Under five working days. Same deliverables. Invoice still {firm.terms}.
            </p>
          </li>
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COVERAGE.map((c) => (
          <div key={c.title} className="rounded-lg border border-border bg-card p-4">
            <p className="kicker">{c.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <p className="kicker">What crews send</p>
          <ul className="mt-3 flex flex-col gap-3">
            {SEND_LIST.map((s) => (
              <li key={s.title}>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <p className="kicker">What you get back</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {DELIVER_LIST.map((d) => (
              <li key={d} className="pl-3 -indent-3 before:mr-2 before:content-['—']">
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            LAS/LAZ classification stays in the lidar stack. GeoLine Solutions codes the vectors to INDOT and runs the
            shop — tickets, QA, package, invoice.
          </p>
        </div>
      </section>

      <section>
        <p className="kicker">Who sends work</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FIRMS.map((f) => (
            <li key={f.name} className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">{f.name}</p>
              <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                {FIRM_KIND[f.kind]} · {f.city}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Rate card</p>
        <dl className="mt-3 grid gap-1.5 font-mono text-sm sm:grid-cols-2">
          <Rate k="Conventional reduction" v={`$${rates.conventionalHr}/hr`} />
          <Rate k="LiDAR classification" v={`$${rates.lidarClassMile.toLocaleString()}/mi`} />
          <Rate k="GeoLine Solutions extraction" v={`$${rates.breaklineMile.toLocaleString()}/mi`} />
          <Rate k="Planimetrics" v={`$${rates.planimetricMile.toLocaleString()}/mi`} />
          <Rate k="INDOT coding + ORD book" v={`$${rates.codingJob}/job`} />
          <Rate k="Rush" v="1.35×" />
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Rate calculator</p>
        <h2 className="mt-1 font-display text-lg font-medium">Get an instant quote</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Job type</label>
            <select value={calcKind} onChange={e => setCalcKind(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="conventional">Conventional reduction</option>
              <option value="breakline">GeoLine Solutions extraction</option>
              <option value="lidar">LiDAR classification</option>
              <option value="planimetric">Planimetrics</option>
            </select>
          </div>
          {/* miles slider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Corridor miles <span className="font-mono text-muted-foreground">{calcMiles}</span></label>
            <input type="range" min={0.1} max={20} step={0.1} value={calcMiles} onChange={e => setCalcMiles(Number(e.target.value))} className="w-full" />
          </div>
          {/* hours (for conventional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reduction hours <span className="font-mono text-muted-foreground">{calcHours}</span></label>
            <input type="range" min={0} max={40} step={0.5} value={calcHours} onChange={e => setCalcHours(Number(e.target.value))} className="w-full" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={calcPlan} onChange={e => setCalcPlan(e.target.checked)} />
            Add planimetrics
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={calcRush} onChange={e => setCalcRush(e.target.checked)} />
            Rush (1.35×)
          </label>
        </div>
        {/* Live quote result */}
        <div className="mt-5 rounded-md bg-muted/40 p-4 font-mono">
          <QuoteResult kind={calcKind} miles={calcMiles} hours={calcHours} plan={calcPlan} rush={calcRush} rates={rates} />
        </div>
      </section>

      <JobForm
        kicker="Send a job"
        title="Crew drop-off"
        blurb="PMs send LAS/LAZ, field books, and control. Quote updates as you type. Put it on the desk and we extract."
        submit="Send to GeoLine Solutions"
      />
    </div>
  );
}

function HeroStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <dt className="kicker">{k}</dt>
      <dd className="mt-1 font-mono text-lg tabular-nums">{v}</dd>
    </div>
  );
}

function Rate({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function QuoteResult({ kind, miles, hours, plan, rush, rates }: {
  kind: string; miles: number; hours: number; plan: boolean; rush: boolean;
  rates: FirmRates;
}) {
  const lines: { desc: string; amount: number }[] = [];
  if (kind === "conventional" && hours > 0) lines.push({ desc: `Reduction ${hours}h × $${rates.conventionalHr}/hr`, amount: hours * rates.conventionalHr });
  if (kind === "breakline") lines.push({ desc: `GeoLine Solutions ${miles} mi × $${rates.breaklineMile.toLocaleString()}/mi`, amount: miles * rates.breaklineMile });
  if (kind === "lidar") lines.push({ desc: `LiDAR classification ${miles} mi × $${rates.lidarClassMile.toLocaleString()}/mi`, amount: miles * rates.lidarClassMile });
  if (kind === "planimetric") lines.push({ desc: `Planimetrics ${miles} mi × $${rates.planimetricMile.toLocaleString()}/mi`, amount: miles * rates.planimetricMile });
  if (plan && kind !== "planimetric") lines.push({ desc: `Planimetrics ${miles} mi × $${rates.planimetricMile.toLocaleString()}/mi`, amount: miles * rates.planimetricMile });
  lines.push({ desc: "INDOT coding + ORD book", amount: rates.codingJob });
  let total = lines.reduce((a, l) => a + l.amount, 0);
  if (rush) total *= 1.35;
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i} className="flex justify-between text-sm text-muted-foreground">
          <span>{l.desc}</span>
          <span>${l.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
      {rush && <div className="flex justify-between text-sm text-muted-foreground"><span>Rush 1.35×</span><span></span></div>}
      <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
        <span>Estimated total</span>
        <span>${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
      </div>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">Estimate only. Actual quote on invoice after scope is confirmed.</p>
    </div>
  );
}
