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
  const zone = INGCS_ZONES.find((z) => z.id === countyId) ?? INGCS_ZONES[0];
  const crs = `${zone.name} County InGCS — NAD 1983 (2011)`;

  const preview = quoteJob({ hours: Number(hours) || 0, rush });
  const lines = quoteLines({ hours: Number(hours) || 0, rush });

  function arm(name: string) {
    useBook.getState().setCrsId(`ingcs:${zone.id}`);
    toast.success(`${name} · ${zone.name} County`);
    void navigate({ to: "/extract" });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const csvFile = fd.get("csv") as File | null;
    const hasBook = !!(csvFile && csvFile.size);
    const id = addJob({
      name: String(fd.get("name") || `${zone.name} County`),
      client: String(fd.get("client") || ""),
      pm: String(fd.get("pm") || ""),
      email: String(fd.get("email") || ""),
      des: String(fd.get("des") || ""),
      county: zone.name,
      crs,
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
    arm(zone.name);
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
          <Label htmlFor="county">County</Label>
          <NativeSelect id="county" value={countyId} onChange={(e) => setCountyId(e.target.value)}>
            {INGCS_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Coordinate system</Label>
          <p className="flex h-10 items-center font-mono text-xs text-foreground">{crs}</p>
        </div>
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