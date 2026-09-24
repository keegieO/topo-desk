import { JobForm } from "@/components/job-form";
import { SERVICES, WORKFLOW, COVERAGE, SEND_LIST, DELIVER_LIST } from "@/lib/company";
import { FIRMS, FIRM_KIND } from "@/lib/clients";
import { useFirm, firmCityLine } from "@/lib/firm";

export function CrewPortal() {
  const firm = useFirm();
  const rates = firm.rates;  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="kicker">For survey companies</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Drop the book. Get an ORD-ready file.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Breakline is the extraction sub. Crews and PMs send conventional field books. We reduce,
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
            LAS/LAZ classification stays in the lidar stack. Breakline codes the vectors to INDOT and runs the
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
          <Rate k="Breakline extraction" v={`$${rates.breaklineMile.toLocaleString()}/mi`} />
          <Rate k="Planimetrics" v={`$${rates.planimetricMile.toLocaleString()}/mi`} />
          <Rate k="INDOT coding + ORD book" v={`$${rates.codingJob}/job`} />
          <Rate k="Rush" v="1.35×" />
        </dl>
      </section>

      <JobForm
        kicker="Send a job"
        title="Crew drop-off"
        blurb="PMs send LAS/LAZ, field books, and control. Quote updates as you type. Put it on the desk and we extract."
        submit="Send to Breakline"
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
