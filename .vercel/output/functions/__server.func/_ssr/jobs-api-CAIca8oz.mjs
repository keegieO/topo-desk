import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { c as invoiceNumber, o as authMiddleware, u as normalizeJob } from "./job-types-DRBj8xWf.mjs";
import { A as boolean, D as _enum, F as object, L as record, M as literal, O as any, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-NGmFKla7.mjs";
import { n as SAMPLE_CSV, r as SAMPLE_NAME } from "./sample-D-33kfTV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs-api-CAIca8oz.js
/** Bump to wipe prior demo jobs and reseed a clean book. */
var SEED_REV = "clean-5";
function seedJobs() {
	return [normalizeJob({
		id: "2501384",
		name: "S.R. 67 & C.R. 400 S topographic survey",
		client: "INDOT Greenfield District",
		pm: "Jordan Yaney",
		email: "greenfield@indot.in.gov",
		phone: "(317) 467-3430",
		des: "2501384",
		county: "Delaware",
		crs: "Delaware County InGCS — NAD 1983 (2011)",
		kind: "conventional",
		status: "intake",
		hours: 0,
		rush: false,
		due: "2026-10-02",
		notes: "Conventional topo. Delaware InGCS. Control 600–604.",
		ticket: "",
		files: [{
			name: SAMPLE_NAME,
			kind: "csv",
			size: SAMPLE_CSV.length
		}],
		csvName: SAMPLE_NAME,
		csvText: SAMPLE_CSV,
		createdAt: "2026-09-22",
		timeLog: [],
		invoiceStatus: "none",
		survey: {
			crew: "Greenfield topo 2",
			instrument: "Trimble S7 / R12i",
			occupied: "600",
			backsight: "601",
			date: "2026-09-22",
			notes: "Occupied 600. Backsight 601. Prism constant 0.",
			hi: "5.21",
			ht: "5.00",
			weather: "Clear, 68°F"
		}
	})];
}
function parseJson(raw, fallback) {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function fromRow(row) {
	return normalizeJob({
		id: row.id,
		name: row.name,
		client: row.client,
		pm: row.pm,
		email: row.email,
		phone: row.phone || void 0,
		des: row.des,
		county: row.county,
		crs: row.crs,
		kind: "conventional",
		status: row.status,
		miles: Number(row.miles) || 0,
		hours: Number(row.hours) || 0,
		planimetrics: Boolean(row.planimetrics),
		rush: Boolean(row.rush),
		due: row.due,
		notes: row.notes,
		csvName: row.csv_name || void 0,
		csvText: row.csv_text || void 0,
		remaps: parseJson(row.remaps, {}),
		userLines: parseJson(row.user_lines, []),
		coordOrder: row.coord_order || "PNEZD",
		survey: parseJson(row.survey, void 0),
		ticket: row.ticket,
		files: parseJson(row.files, []),
		timeLog: parseJson(row.time_log, []),
		changeOrders: parseJson(row.change_orders, []),
		invoiceStatus: row.invoice_status,
		invoiceNo: row.invoice_no || void 0,
		sentAt: row.sent_at || void 0,
		paidAt: row.paid_at || void 0,
		createdAt: typeof row.created_at === "string" ? row.created_at.slice(0, 10) : String(row.created_at).slice(0, 10)
	});
}
async function insertJob(userId, job) {
	await (await getSql())`
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
      ${JSON.stringify(job.survey ?? {})}, ${job.ticket}, ${JSON.stringify(job.files)},
      ${JSON.stringify(job.timeLog)}, ${JSON.stringify(job.changeOrders)},
      ${job.invoiceStatus}, ${job.invoiceNo ?? null}, ${job.sentAt ?? null}, ${job.paidAt ?? null},
      ${job.createdAt}, now()
    )
    on conflict (id) do nothing
  `;
}
var listJobs_createServerFn_handler = createServerRpc({
	id: "d07785986d5b0f6acbc0fc0e486627625d03857c3ba365bbcef8e59bfc3c43b9",
	name: "listJobs",
	filename: "src/lib/jobs-api.ts"
}, (opts) => listJobs.__executeServer(opts));
var listJobs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listJobs_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const stale = (await sql`
      select value from shop_meta where user_id = ${context.userId} and key = 'seed'
    `)[0]?.value !== SEED_REV;
	if (stale) {
		await sql`delete from jobs where user_id = ${context.userId}`;
		await sql`
        insert into shop_meta (user_id, key, value)
        values (${context.userId}, 'seed', ${SEED_REV})
        on conflict (user_id, key) do update set value = excluded.value
      `;
	}
	const rows = stale ? [] : await sql`
          select * from jobs where user_id = ${context.userId} order by updated_at desc
        `;
	if (!rows.length) {
		const seeded = seedJobs().map((j) => ({
			...j,
			id: `${context.userId.slice(0, 8)}-${j.id}`
		}));
		for (const job of seeded) await insertJob(context.userId, job);
		return seeded;
	}
	return rows.map(fromRow);
});
var jobSchema = object({
	id: string().min(1),
	name: string(),
	client: string(),
	pm: string(),
	email: string(),
	des: string(),
	county: string(),
	crs: string(),
	kind: literal("conventional"),
	status: _enum([
		"intake",
		"extract",
		"qa",
		"ready",
		"delivered"
	]),
	miles: number(),
	hours: number(),
	planimetrics: boolean(),
	rush: boolean(),
	due: string(),
	notes: string(),
	files: array(object({
		name: string(),
		kind: string(),
		size: number()
	})),
	csvName: string().optional(),
	csvText: string().optional(),
	remaps: record(string(), string()).optional(),
	userLines: array(any()).optional(),
	coordOrder: _enum(["PNEZD", "PENZD"]).optional(),
	survey: object({
		crew: string(),
		instrument: string(),
		occupied: string(),
		backsight: string(),
		date: string(),
		notes: string(),
		hi: string().optional(),
		ht: string().optional(),
		weather: string().optional(),
		books: array(object({
			name: string(),
			points: number()
		})).optional(),
		observations: array(any()).optional()
	}).optional(),
	createdAt: string(),
	ticket: string(),
	timeLog: array(object({
		id: string(),
		date: string(),
		hours: number(),
		kind: _enum([
			"extract",
			"qa",
			"office"
		]),
		note: string()
	})),
	invoiceStatus: _enum([
		"none",
		"draft",
		"sent",
		"paid"
	]),
	invoiceNo: string().optional(),
	sentAt: string().optional(),
	paidAt: string().optional(),
	phone: string().optional(),
	changeOrders: array(object({
		id: string(),
		date: string(),
		desc: string(),
		amount: number()
	}))
});
var saveJob_createServerFn_handler = createServerRpc({
	id: "ce793a16fec1b51dabc24cff4038f25666d6842965d82988b9317a7beb7303f2",
	name: "saveJob",
	filename: "src/lib/jobs-api.ts"
}, (opts) => saveJob.__executeServer(opts));
var saveJob = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => jobSchema.parse(data)).handler(saveJob_createServerFn_handler, async ({ context, data }) => {
	const job = normalizeJob(data);
	if (job.status === "ready" && job.invoiceStatus === "none") {
		job.invoiceStatus = "draft";
		job.invoiceNo = invoiceNumber(job);
	}
	await (await getSql())`
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
        ${JSON.stringify(job.survey ?? {})}, ${job.ticket}, ${JSON.stringify(job.files)},
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
var deleteJob_createServerFn_handler = createServerRpc({
	id: "4266664ed51095772ff70d498d5951010f4e21bad17b823fe188363a6241a59d",
	name: "deleteJob",
	filename: "src/lib/jobs-api.ts"
}, (opts) => deleteJob.__executeServer(opts));
var deleteJob = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => string().min(1).parse(id)).handler(deleteJob_createServerFn_handler, async ({ context, data: id }) => {
	await (await getSql())`delete from jobs where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { deleteJob_createServerFn_handler, listJobs_createServerFn_handler, saveJob_createServerFn_handler };
