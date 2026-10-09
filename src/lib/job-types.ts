import { RATES } from "./company";
import type { UserLine } from "./chains";
import type { Leader } from "./notes";
import type { CoordOrder } from "./csv";
import type { Observation } from "./fieldbook";

export type JobKind = "conventional";
export type JobStatus = "intake" | "extract" | "qa" | "ready" | "delivered";
export type InvoiceStatus = "none" | "draft" | "sent" | "paid";
export type TimeKind = "extract" | "qa" | "office";

export type JobFile = { name: string; kind: string; size: number };

export type TimeEntry = {
  id: string;
  date: string;
  hours: number;
  kind: TimeKind;
  note: string;
};

export type QuoteLine = {
  desc: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
};

export type ChangeOrder = {
  id: string;
  date: string;
  desc: string;
  amount: number;
};

export type LineItemKind =
  | "lidar_class"
  | "breakline"
  | "planimetric"
  | "lidar_qa"
  | "extra_coding"
  | "custom";

export type LineItem = {
  id: string;
  kind: LineItemKind;
  desc: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
};

export type SurveyBook = { name: string; points: number };

export type SurveyMeta = {
  crew: string;
  instrument: string;
  occupied: string;
  backsight: string;
  date: string;
  notes: string;
  hi?: string;
  ht?: string;
  weather?: string;
  observations?: Observation[];
  books?: SurveyBook[];
};

export type Job = {
  id: string;
  name: string;
  client: string;
  pm: string;
  email: string;
  des: string;
  county: string;
  crs: string;
  kind: JobKind;
  status: JobStatus;
  miles: number;
  hours: number;
  planimetrics: boolean;
  rush: boolean;
  due: string;
  notes: string;
  files: JobFile[];
  csvName?: string;
  csvText?: string;
  remaps?: Record<string, string>;
  userLines?: UserLine[];
  leaders?: Leader[];
  coordOrder?: CoordOrder;
  crsId?: string;
  survey?: SurveyMeta;
  createdAt: string;
  ticket: string;
  timeLog: TimeEntry[];
  invoiceStatus: InvoiceStatus;
  invoiceNo?: string;
  sentAt?: string;
  paidAt?: string;
  phone?: string;
  changeOrders: ChangeOrder[];
  lineItems?: LineItem[];
};

export const emptySurvey = (): SurveyMeta => ({
  crew: "",
  instrument: "",
  occupied: "",
  backsight: "",
  date: "",
  notes: "",
  hi: "",
  ht: "",
  weather: "",
  observations: [],
  books: [],
});

export function quoteLines(
  job: Pick<Job, "hours" | "rush"> & { changeOrders?: ChangeOrder[]; lineItems?: LineItem[] },
  rates: typeof RATES = RATES,
): QuoteLine[] {
  const lines: QuoteLine[] = [];
  if (job.hours > 0) {
    lines.push({
      desc: "Conventional reduction",
      qty: job.hours,
      unit: "hr",
      rate: rates.conventionalHr,
      amount: job.hours * rates.conventionalHr,
    });
  }
  lines.push({
    desc: "INDOT coding + ORD field book",
    qty: 1,
    unit: "job",
    rate: rates.codingJob,
    amount: rates.codingJob,
  });

  // Custom line items
  for (const item of job.lineItems ?? []) {
    lines.push({
      desc: item.desc,
      qty: item.qty,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount,
    });
  }

  // Rush applies after subtotal including line items
  const sub = lines.reduce((a, l) => a + l.amount, 0);
  if (job.rush) {
    lines.push({
      desc: "Rush (under five working days)",
      qty: 1,
      unit: "ls",
      rate: Math.round(sub * (rates.rush - 1)),
      amount: sub * (rates.rush - 1),
    });
  }

  // Change orders at the end
  for (const co of job.changeOrders ?? []) {
    lines.push({
      desc: `CO: ${co.desc}`,
      qty: 1,
      unit: "ls",
      rate: co.amount,
      amount: co.amount,
    });
  }
  return lines;
}

export function quoteJob(
  job: Pick<Job, "hours" | "rush"> & { changeOrders?: ChangeOrder[] },
  rates: typeof RATES = RATES,
): number {
  return Math.round(quoteLines(job, rates).reduce((a, l) => a + l.amount, 0));
}

export function invoiceNumber(job: Job): string {
  if (job.invoiceNo) return job.invoiceNo;
  const ym = (job.createdAt || "2026-09").slice(0, 7).replace("-", "");
  return `BL-${job.des || job.id}-${ym}`;
}

export function nid() {
  return `j${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export function tid() {
  return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

function asSurvey(raw: Partial<SurveyMeta> | undefined): SurveyMeta {
  const base = emptySurvey();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    observations: raw.observations ?? base.observations ?? [],
    books: raw.books ?? base.books ?? [],
    hi: raw.hi ?? base.hi ?? "",
    ht: raw.ht ?? base.ht ?? "",
    weather: raw.weather ?? base.weather ?? "",
  };
}

export function normalizeJob(j: Partial<Job> & { id: string }): Job {
  return {
    name: j.name ?? "Untitled job",
    client: j.client ?? "",
    pm: j.pm ?? "",
    email: j.email ?? "",
    des: j.des ?? "",
    county: j.county ?? "",
    crs: j.crs ?? "Indiana InGCS — NAD 1983 (2011)",
    kind: "conventional",
    status: j.status ?? "intake",
    miles: j.miles ?? 0,
    hours: j.hours ?? 0,
    planimetrics: j.planimetrics ?? false,
    rush: j.rush ?? false,
    due: j.due ?? "",
    notes: j.notes ?? "",
    files: j.files ?? [],
    csvName: j.csvName,
    csvText: j.csvText,
    remaps: j.remaps ?? {},
    userLines: j.userLines ?? [],
    leaders: j.leaders ?? [],
    coordOrder: j.coordOrder ?? "PNEZD",
    crsId: j.crsId,
    survey: asSurvey(j.survey),
    createdAt: j.createdAt ?? new Date().toISOString().slice(0, 10),
    ticket: j.ticket ?? "",
    timeLog: j.timeLog ?? [],
    invoiceStatus: j.invoiceStatus ?? "none",
    invoiceNo: j.invoiceNo,
    sentAt: j.sentAt,
    paidAt: j.paidAt,
    phone: j.phone,
    changeOrders: j.changeOrders ?? [],
    lineItems: j.lineItems ?? [],
    id: j.id,
  };
}

export const STATUS_LABEL: Record<JobStatus, string> = {
  intake: "Intake",
  extract: "Extracting",
  qa: "QA",
  ready: "Ready",
  delivered: "Delivered",
};

export const KIND_LABEL: Record<JobKind, string> = {
  conventional: "Conventional",
};

export const INVOICE_LABEL: Record<InvoiceStatus, string> = {
  none: "No invoice",
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

export const TIME_LABEL: Record<TimeKind, string> = {
  extract: "Extract",
  qa: "QA",
  office: "Office",
};

export const PIPE: JobStatus[] = ["intake", "extract", "qa", "ready", "delivered"];
