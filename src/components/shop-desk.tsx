import { type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCLAIMER, OUT_OF_SCOPE } from "@/lib/company";
import { useFirm, type FirmRates } from "@/lib/firm";
import { htmlSow, htmlVendor } from "@/lib/paper";
import { printHtml } from "@/lib/print";

export function ShopDesk() {
  const firm = useFirm();

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => String(fd.get(k) || "");
    const num = (k: string, fallback: number) => {
      const n = Number(fd.get(k));
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    const rates: FirmRates = {
      conventionalHr: num("conventionalHr", firm.rates.conventionalHr),
      lidarClassMile: num("lidarClassMile", firm.rates.lidarClassMile),
      breaklineMile: num("breaklineMile", firm.rates.breaklineMile),
      planimetricMile: num("planimetricMile", firm.rates.planimetricMile),
      codingJob: num("codingJob", firm.rates.codingJob),
      rush: num("rush", firm.rates.rush),
    };
    firm.setFirm({
      name: str("name"),
      legal: str("legal"),
      street: str("street"),
      city: str("city"),
      state: str("state"),
      zip: str("zip"),
      phone: str("phone"),
      email: str("email"),
      hours: str("hours"),
      terms: str("terms"),
      ein: str("ein"),
      gl: str("gl"),
      eo: str("eo"),
      remit: str("remit"),
      tagline: str("tagline"),
      rates,
    });
    toast.success("Shop saved — invoices and proposals use this");
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="kicker">Shop</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">Take paid work</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This desk is the extraction shop. It is not a licensed survey practice. Fill the
          identity, print a proposal, reduce the book, send DXF + LandXML + PNEZD, invoice.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <CheckCard
          k="You do outside this app"
          items={[
            "Indiana LLC (or equivalent) and EIN",
            "Business checking. W-9 ready for every client",
            "General liability — firms will ask for a COI before they send the book",
            "Professional liability / E&O — extraction still carries risk",
            "You do not stamp unless you are an Indiana LS. You are the sub. Their LS is of record",
            "ShareFile / Dropbox / FTP for large field books. This desk logs files; it does not host them",
          ]}
        />
        <CheckCard
          k="This desk now does"
          items={[
            "Proposal a PM can print and sign",
            "Work order / subcontract terms",
            "QA/QC on the survey tab before the book goes back",
            "DXF and LandXML the PM attaches in ORD",
            "Labeled PNEZD, workbook, control report",
            "Print invoice, transmittal, change orders",
          ]}
        />
        <CheckCard
          k="Still not this app"
          items={[
            "LiDAR / TopoDOT production extraction — conventional field books only",
            "Native DGN / ORD seed files — DXF and LandXML import instead",
            "ALTA, boundary, staking, legal descriptions",
            "QuickBooks, payroll, sales tax",
            "A lawyer-reviewed contract — have counsel read the SOW once",
          ]}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <p className="kicker">Paper</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Print to PDF from the browser dialog. Job-specific proposals live on the ticket.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" onClick={() => printHtml("Vendor information", htmlVendor())}>
            Vendor sheet
          </Button>
          <Button type="button" variant="outline" onClick={() => printHtml("Extraction subcontract", htmlSow())}>
            Subcontract template
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{DISCLAIMER}</p>
      </section>

      <form onSubmit={save} className="flex flex-col gap-6">
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <p className="kicker">Identity</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field name="legal" label="Legal name" defaultValue={firm.legal} />
            <Field name="name" label="DBA" defaultValue={firm.name} />
            <Field name="street" label="Street" defaultValue={firm.street} className="sm:col-span-2" />
            <Field name="city" label="City" defaultValue={firm.city} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="state" label="State" defaultValue={firm.state} />
              <Field name="zip" label="ZIP" defaultValue={firm.zip} />
            </div>
            <Field name="phone" label="Phone" defaultValue={firm.phone} />
            <Field name="email" label="Email" defaultValue={firm.email} />
            <Field name="hours" label="Hours" defaultValue={firm.hours} />
            <Field name="terms" label="Terms" defaultValue={firm.terms} />
            <Field name="ein" label="EIN" defaultValue={firm.ein} placeholder="XX-XXXXXXX" />
            <Field name="tagline" label="Line on paper" defaultValue={firm.tagline} className="sm:col-span-2" />
            <Field name="remit" label="Remit / ACH note" defaultValue={firm.remit} className="sm:col-span-2" />
            <Field name="gl" label="General liability" defaultValue={firm.gl} placeholder="Carrier · $1M" />
            <Field name="eo" label="Professional liability" defaultValue={firm.eo} placeholder="Carrier · $1M" />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <p className="kicker">Rate card</p>
          <p className="mt-1 text-sm text-muted-foreground">Quotes, proposals, and invoices read these numbers.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field name="conventionalHr" label="Conventional $/hr" defaultValue={String(firm.rates.conventionalHr)} />
            <Field name="codingJob" label="INDOT coding $/job" defaultValue={String(firm.rates.codingJob)} />
            <Field name="rush" label="Rush multiplier" defaultValue={String(firm.rates.rush)} />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save shop</Button>
          <p className="text-xs text-muted-foreground">Stored on this device. Out of scope: {OUT_OF_SCOPE[0]}.</p>
        </div>
      </form>
    </div>
  );
}

function CheckCard({ k, items }: { k: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="kicker">{k}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="pl-3 -indent-3 before:mr-2 before:content-['—'] text-muted-foreground">
            <span className="text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className ? `flex flex-col gap-1 ${className}` : "flex flex-col gap-1"}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
