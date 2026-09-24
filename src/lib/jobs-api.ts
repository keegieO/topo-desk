import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { invoiceNumber, normalizeJob, type Job } from "@/lib/job-types";
import { seedJobs, SEED_REV } from "@/lib/job-seed";

type JobRow = {
  id: string;
  name: string;
  client: string;
  pm: string;
  email: string;
  phone: string;
  des: string;
  county: string;
  crs: string;
  kind: string;
  status: string;
  miles: string | number;
  hours: string | number;
  planimetrics: boolean;
  rush: boolean;
  due: string;
  notes: string;
  csv_name: string | null;
  csv_text: string | null;
  remaps: string;
  user_lines: string;
  coord_order: string;
  survey: string;
  ticket: string;
  files: string;
  time_log: string;
  change_orders: string;
  invoice_status: string;
  invoice_no: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function fromRow(row: JobRow): Job {
  const surveyRaw = parseJson<(Job["survey"] & { planLeaders?: Job["leaders"] }) | undefined>(row.survey, undefined);
  const leaders = surveyRaw?.planLeaders ?? [];
  if (surveyRaw && "planLeaders" in surveyRaw) delete surveyRaw.planLeaders;
  return normalizeJob({
    id: row.id,
    name: row.name,
    client: row.client,
    pm: row.pm,
    email: row.email,
    phone: row.phone || undefined,
    des: row.des,
    county: row.county,
    crs: row.crs,
    kind: "conventional",
    status: row.status as Job["status"],
    miles: Number(row.miles) || 0,
    hours: Number(row.hours) || 0,
    planimetrics: Boolean(row.planimetrics),
    rush: Boolean(row.rush),
    due: row.due,
    notes: row.notes,
    csvName: row.csv_name || undefined,
    csvText: row.csv_text || undefined,
    remaps: parseJson(row.remaps, {}),
    userLines: parseJson(row.user_lines, []),
    coordOrder: (row.coord_order as Job["coordOrder"]) || "PNEZD",
    survey: surveyRaw,
    leaders,
    ticket: row.ticket,
    files: parseJson(row.files, []),
    timeLog: parseJson(row.time_log, []),
    changeOrders: parseJson(row.change_orders, []),
    invoiceStatus: row.invoice_status as Job["invoiceStatus"],
    invoiceNo: row.invoice_no || undefined,
    sentAt: row.sent_at || undefined,
    paidAt: row.paid_at || undefined,
    createdAt: typeof row.created_at === "string" ? row.created_at.slice(0, 10) : String(row.created_at).slice(0, 10),
  });
}

async function insertJob(userId: string, job: Job) {
  const sql = await getSql();
  await sql`
    insert into jobs (
      id, user_id, name, client, pm, email, phone, des, county, crs, kind, status,
      miles, hours, planimetrics, rush, due, notes, csv_name, csv_text, remaps,
      user_lines, coord_order, survey, ticket, files, time_log, change_orders,
      invoice_status, invoice_no, sent_at, paid_at, created_at, updated_at
    ) values (
      ${job.id}, ${userId}, ${job.name}, ${job.client}, ${job.pm}, ${job.email},
      ${job.phone ?? ""}, ${job.des}, ${job.county}, ${job.crs}, ${job.kind}, ${job.status},
      ${job.miles}, ${job.hours}, ${job.planimetrics}, ${job.rush}, ${job.due}, ${job.notes},
      ${job.csvName ?? null}, ${job.csvText ?? null}, ${JSON.stringify(job.remaps ?? {})},
      ${JSON.stringify(job.userLines ?? [])}, ${job.coordOrder ?? "PNEZD"},
      ${JSON.stringify({ ...(job.survey ?? {}), planLeaders: job.leaders ?? [] })}, ${job.ticket}, ${JSON.stringify(job.files)},
      ${JSON.stringify(job.timeLog)}, ${JSON.stringify(job.changeOrders)},
      ${job.invoiceStatus}, ${job.invoiceNo ?? null}, ${job.sentAt ?? null}, ${job.paidAt ?? null},
      ${job.createdAt}, now()
    )
    on conflict (id) do nothing
  `;
}

export const listJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const meta = await sql<{ value: string }>`
      select value from shop_meta where user_id = ${context.userId} and key = 'seed'
    `;
    const stale = meta[0]?.value !== SEED_REV;
    if (stale) {
      await sql`delete from jobs where user_id = ${context.userId}`;
      await sql`
        insert into shop_meta (user_id, key, value)
        values (${context.userId}, 'seed', ${SEED_REV})
        on conflict (user_id, key) do update set value = excluded.value
      `;
      const seeded = seedJobs().map((j) => ({
        ...j,
        id: `${context.userId.slice(0, 8)}-${j.id}`,
      }));
      for (const job of seeded) await insertJob(context.userId, job);
      return seeded;
    }
    const rows = await sql<JobRow>`
      select * from jobs where user_id = ${context.userId} order by updated_at desc
    `;
    return rows.map(fromRow);
  });

const jobSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  client: z.string(),
  pm: z.string(),
  email: z.string(),
  des: z.string(),
  county: z.string(),
  crs: z.string(),
  kind: z.literal("conventional"),
  status: z.enum(["intake", "extract", "qa", "ready", "delivered"]),
  miles: z.number(),
  hours: z.number(),
  planimetrics: z.boolean(),
  rush: z.boolean(),
  due: z.string(),
  notes: z.string(),
  files: z.array(z.object({ name: z.string(), kind: z.string(), size: z.number() })),
  csvName: z.string().optional(),
  csvText: z.string().optional(),
  remaps: z.record(z.string(), z.string()).optional(),
  userLines: z.array(z.any()).optional(),
  leaders: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        n: z.number(),
        e: z.number(),
        tn: z.number(),
        te: z.number(),
        arrow: z.boolean(),
        shotUid: z.string().optional(),
        source: z.enum(["auto", "user"]).optional(),
      }),
    )
    .optional(),
  coordOrder: z.enum(["PNEZD", "PENZD"]).optional(),
  survey: z
    .object({
      crew: z.string(),
      instrument: z.string(),
      occupied: z.string(),
      backsight: z.string(),
      date: z.string(),
      notes: z.string(),
      hi: z.string().optional(),
      ht: z.string().optional(),
      weather: z.string().optional(),
      books: z.array(z.object({ name: z.string(), points: z.number() })).optional(),
      observations: z.array(z.any()).optional(),
    })
    .optional(),
  createdAt: z.string(),
  ticket: z.string(),
  timeLog: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      hours: z.number(),
      kind: z.enum(["extract", "qa", "office"]),
      note: z.string(),
    }),
  ),
  invoiceStatus: z.enum(["none", "draft", "sent", "paid"]),
  invoiceNo: z.string().optional(),
  sentAt: z.string().optional(),
  paidAt: z.string().optional(),
  phone: z.string().optional(),
  changeOrders: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      desc: z.string(),
      amount: z.number(),
    }),
  ),
});

export const saveJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => jobSchema.parse(data))
  .handler(async ({ context, data }) => {
    const job = normalizeJob(data);
    if (job.status === "ready" && job.invoiceStatus === "none") {
      job.invoiceStatus = "draft";
      job.invoiceNo = invoiceNumber(job);
    }
    const sql = await getSql();
    await sql`
      insert into jobs (
        id, user_id, name, client, pm, email, phone, des, county, crs, kind, status,
        miles, hours, planimetrics, rush, due, notes, csv_name, csv_text, remaps,
        user_lines, coord_order, survey, ticket, files, time_log, change_orders,
        invoice_status, invoice_no, sent_at, paid_at, created_at, updated_at
      ) values (
        ${job.id}, ${context.userId}, ${job.name}, ${job.client}, ${job.pm}, ${job.email},
        ${job.phone ?? ""}, ${job.des}, ${job.county}, ${job.crs}, ${job.kind}, ${job.status},
        ${job.miles}, ${job.hours}, ${job.planimetrics}, ${job.rush}, ${job.due}, ${job.notes},
        ${job.csvName ?? null}, ${job.csvText ?? null}, ${JSON.stringify(job.remaps ?? {})},
        ${JSON.stringify(job.userLines ?? [])}, ${job.coordOrder ?? "PNEZD"},
        ${JSON.stringify({ ...(job.survey ?? {}), planLeaders: job.leaders ?? [] })}, ${job.ticket}, ${JSON.stringify(job.files)},
        ${JSON.stringify(job.timeLog)}, ${JSON.stringify(job.changeOrders)},
        ${job.invoiceStatus}, ${job.invoiceNo ?? null}, ${job.sentAt ?? null}, ${job.paidAt ?? null},
        ${job.createdAt}, now()
      )
      on conflict (id) do update set
        name = excluded.name,
        client = excluded.client,
        pm = excluded.pm,
        email = excluded.email,
        phone = excluded.phone,
        des = excluded.des,
        county = excluded.county,
        crs = excluded.crs,
        kind = excluded.kind,
        status = excluded.status,
        miles = excluded.miles,
        hours = excluded.hours,
        planimetrics = excluded.planimetrics,
        rush = excluded.rush,
        due = excluded.due,
        notes = excluded.notes,
        csv_name = excluded.csv_name,
        csv_text = excluded.csv_text,
        remaps = excluded.remaps,
        user_lines = excluded.user_lines,
        coord_order = excluded.coord_order,
        survey = excluded.survey,
        ticket = excluded.ticket,
        files = excluded.files,
        time_log = excluded.time_log,
        change_orders = excluded.change_orders,
        invoice_status = excluded.invoice_status,
        invoice_no = excluded.invoice_no,
        sent_at = excluded.sent_at,
        paid_at = excluded.paid_at,
        updated_at = now()
      where jobs.user_id = ${context.userId}
    `;
    return job;
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => z.string().min(1).parse(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from jobs where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });
