import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useJobs, quoteJob, quoteLines } from "@/lib/jobs";
import { useBook } from "@/lib/store";
import { INGCS_ZONES } from "@/lib/ingcs";
import { STATE_REGISTRY } from "@/standards/registry";
import { getPack, packIdForState, packWarning } from "@/standards/loader";
import { setActivePack } from "@/lib/active-standards";

const BOOK = ".csv,.txt,.asc,.xyz,.pnezd,.penzd,.fbk,.rw5,.gsi,.jxl";

export function JobForm({
  kicker = "New job",
  title = "Add a job",
  blurb = "",
  submit = "Open on the map",
}: {
  kicker?: string;
  title?: string;
  blurb?: string;
  submit?: string;
}) {
  const addJob = useJobs((s) => s.addJob);
  const navigate = useNavigate();
  const [hours, setHours] = useState("0");
  const [rush, setRush] = useState(false);
  const [countyId, setCountyId] = useState("hamilton");
  const [usps, setUsps] = useState("IN");
  const packId = packIdForState(usps);
  const pack = getPack(packId);
  const warning = packWarning(packId);
  const isIndiana = usps === "IN";
  const [otherCounty, setOtherCounty] = useState("");
  const [crsPick, setCrsPick] = useState("");
  const zone = INGCS_ZONES.find((z) => z.id === countyId) ?? INGCS_ZONES[0];
  const crsOptions = pack.crs.filter((c) => !pack.state || pack.state === usps);
  const crs = isIndiana
    ? `${zone.name} County InGCS — NAD 1983 (2011)`
    : crsPick || crsOptions[0]?.name || "State plane zone (set by the client)";
  const countyName = isIndiana ? zone.name : otherCounty.trim();

  const preview = quoteJob({ hours: Number(hours) || 0, rush });
  const lines = quoteLines({ hours: Number(hours) || 0, rush });

  function arm(name: string) {
    if (isIndiana) useBook.getState().setCrsId(`ingcs:${zone.id}`);
    toast.success(countyName ? `${name} · ${countyName} County` : name);
    void navigate({ to: "/extract" });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const csvFile = fd.get("csv") as File | null;
    const hasBook = !!(csvFile && csvFile.size);
    setActivePack(packId);
    const id = addJob({
      name: String(fd.get("name") || (countyName ? `${countyName} County` : "New job")),
      client: String(fd.get("client") || ""),
      pm: String(fd.get("pm") || ""),
      email: String(fd.get("email") || ""),
      des: String(fd.get("des") || ""),
      county: countyName,
      crs,
      standards: {
        state: usps,
        packId,
        psName: String(fd.get("psName") || "").trim(),
        psLicense: String(fd.get("psLicense") || "").trim(),
      },
      kind: "conventional",
      miles: 0,
      hours: Number(hours) || 0,
      planimetrics: false,
      rush,
      due: String(fd.get("due") || ""),
      notes: String(fd.get("notes") || ""),
      files: hasBook ? [{ name: csvFile!.name, kind: ext(csvFile!.name), size: csvFile!.size }] : [],
      csvName: hasBook ? csvFile!.name : undefined,
      phone: String(fd.get("phone") || ""),
    });
    if (hasBook) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        useJobs.getState().updateJob(id, { csvText: text });
        useBook.getState().loadText(text, csvFile!.name);
        toast.success(csvFile!.name);
        void navigate({ to: "/extract" });
      };
      reader.readAsText(csvFile!);
      return;
    }
    useBook.getState().clear();
    arm(countyName || "New job");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="mt-1 font-display text-lg font-medium tracking-tight">{title}</h2>
        {blurb ? <p className="mt-1 text-sm text-muted-foreground">{blurb}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="name" label="Job name" required placeholder="I-69 topo" />
        <Field id="client" label="Client / firm" placeholder="Consulting firm or INDOT district" />
        <Field id="pm" label="Project manager" />
        <Field id="email" label="Return email" type="email" />
        <Field id="phone" label="Phone" placeholder="(317) 555-0167" />
        <Field id="des" label="Des. number" placeholder="2501384" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">Project state</Label>
          <NativeSelect id="state" value={usps} onChange={(e) => setUsps(e.target.value)}>
            {STATE_REGISTRY.map((st) => (
              <option key={st.usps} value={st.usps}>
                {st.name}
                {st.packId ? "" : " (generic standards)"}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Standards</Label>
          <p className="flex h-10 items-center font-mono text-xs text-foreground">{pack.name}</p>
        </div>
        {isIndiana ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="county">County</Label>
            <NativeSelect id="county" value={countyId} onChange={(e) => setCountyId(e.target.value)}>
              {INGCS_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otherCounty">County</Label>
            <Input id="otherCounty" value={otherCounty} onChange={(e) => setOtherCounty(e.target.value)} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="crsPick">Coordinate system</Label>
          {isIndiana || crsOptions.length === 0 ? (
            <p className="flex h-10 items-center font-mono text-xs text-foreground">{crs}</p>
          ) : (
            <NativeSelect id="crsPick" value={crsPick || crsOptions[0].name} onChange={(e) => setCrsPick(e.target.value)}>
              {crsOptions.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          )}
        </div>
        <Field id="psName" label="Client's PS in responsible charge" placeholder="Name of the licensed surveyor" />
        <Field id="psLicense" label="PS license number" />
        {warning ? (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">{warning}</p>
        ) : null}
        <Field id="due" label="Due" type="date" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hours">Reduction hours</Label>
          <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" />
        </div>
        <label className="flex min-h-10 items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} />
          Rush (under five working days) — 1.35×
        </label>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Scope notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="csv">Field book</Label>
          <Input id="csv" name="csv" type="file" accept={BOOK} />
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm">
            Quote <span className="text-lg font-medium">${preview.toLocaleString("en-US")}</span>
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {lines.map((line) => (
              <li key={line.desc} className="font-mono text-[0.6875rem] text-muted-foreground">
                {line.desc} · ${line.amount.toLocaleString("en-US")}
              </li>
            ))}
          </ul>
        </div>
        <Button type="submit">{submit}</Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}

function ext(name: string) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "file";
}