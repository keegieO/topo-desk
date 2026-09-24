import { quoteJob, type Job, type InvoiceStatus } from "./jobs";

export type FirmKind = "agency" | "consultant" | "city";

export type Firm = {
  name: string;
  kind: FirmKind;
  city: string;
  pm: string;
  email: string;
  phone: string;
};

export const FIRMS: Firm[] = [
  {
    name: "INDOT Greenfield District",
    kind: "agency",
    city: "Greenfield, IN",
    pm: "Jordan Yaney",
    email: "greenfield@indot.in.gov",
    phone: "(317) 467-3430",
  },
  {
    name: "INDOT Seymour District",
    kind: "agency",
    city: "Seymour, IN",
    pm: "Survey desk",
    email: "seymour@indot.in.gov",
    phone: "(812) 524-5350",
  },
  {
    name: "United Consulting",
    kind: "consultant",
    city: "Indianapolis, IN",
    pm: "Taylor Hartman",
    email: "thartman@unitedconsulting.com",
    phone: "(317) 895-2585",
  },
  {
    name: "DLZ Indiana",
    kind: "consultant",
    city: "Indianapolis, IN",
    pm: "A. Groff",
    email: "survey@dlz.com",
    phone: "(317) 633-4120",
  },
  {
    name: "Beam, Longest & Neff",
    kind: "consultant",
    city: "Indianapolis, IN",
    pm: "M. MacNeill",
    email: "survey@bln-inc.com",
    phone: "(317) 849-5832",
  },
  {
    name: "USI Consultants",
    kind: "consultant",
    city: "Indianapolis, IN",
    pm: "K. Patel",
    email: "survey@usiconsultants.com",
    phone: "(317) 544-4996",
  },
  {
    name: "City of Greenwood",
    kind: "city",
    city: "Greenwood, IN",
    pm: "Engineering",
    email: "engineering@greenwood.in.gov",
    phone: "(317) 887-5230",
  },
];

export const FIRM_KIND: Record<FirmKind, string> = {
  agency: "Agency",
  consultant: "Consultant",
  city: "City / county",
};

export type ClientRollup = {
  name: string;
  firm?: Firm;
  jobs: Job[];
  open: number;
  billed: number;
  ar: number;
  paid: number;
};

export function rollupClients(jobs: Job[]): ClientRollup[] {
  const map = new Map<string, Job[]>();
  for (const j of jobs) {
    const k = j.client.trim() || "Unassigned";
    const list = map.get(k) ?? [];
    list.push(j);
    map.set(k, list);
  }
  const out: ClientRollup[] = [];
  for (const [name, list] of map) {
    const firm = FIRMS.find((f) => f.name === name);
    let billed = 0;
    let ar = 0;
    let paid = 0;
    let open = 0;
    for (const j of list) {
      const q = quoteJob(j);
      if (j.status !== "delivered") open += q;
      if (j.invoiceStatus === "paid") paid += q;
      else if (j.invoiceStatus === "sent" || j.invoiceStatus === "draft") {
        billed += q;
        if (j.invoiceStatus === "sent") ar += q;
      }
    }
    out.push({ name, firm, jobs: list, open, billed, ar, paid });
  }
  return out.sort((a, b) => b.jobs.length - a.jobs.length || a.name.localeCompare(b.name));
}

export function invoiceAging(status: InvoiceStatus, sentAt?: string): string {
  if (status !== "sent" || !sentAt) return "—";
  const days = Math.floor((Date.now() - Date.parse(sentAt)) / 86400000);
  if (!Number.isFinite(days)) return "—";
  if (days <= 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
