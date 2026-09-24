import { n as createMiddleware } from "./ssr.mjs";
import { o as RATES } from "./company-D0owGUeH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/job-types-DRBj8xWf.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-p6pS4pM8.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var emptySurvey = () => ({
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
	books: []
});
function quoteLines(job, rates = RATES) {
	const lines = [];
	if (job.hours > 0) lines.push({
		desc: "Conventional reduction",
		qty: job.hours,
		unit: "hr",
		rate: rates.conventionalHr,
		amount: job.hours * rates.conventionalHr
	});
	lines.push({
		desc: "INDOT coding + ORD field book",
		qty: 1,
		unit: "job",
		rate: rates.codingJob,
		amount: rates.codingJob
	});
	const sub = lines.reduce((a, l) => a + l.amount, 0);
	if (job.rush) lines.push({
		desc: "Rush (under five working days)",
		qty: 1,
		unit: "ls",
		rate: Math.round(sub * (rates.rush - 1)),
		amount: sub * (rates.rush - 1)
	});
	for (const co of job.changeOrders ?? []) lines.push({
		desc: `CO: ${co.desc}`,
		qty: 1,
		unit: "ls",
		rate: co.amount,
		amount: co.amount
	});
	return lines;
}
function quoteJob(job, rates = RATES) {
	return Math.round(quoteLines(job, rates).reduce((a, l) => a + l.amount, 0));
}
function invoiceNumber(job) {
	if (job.invoiceNo) return job.invoiceNo;
	const ym = (job.createdAt || "2026-09").slice(0, 7).replace("-", "");
	return `BL-${job.des || job.id}-${ym}`;
}
function nid() {
	return `j${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
function tid() {
	return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
function asSurvey(raw) {
	const base = emptySurvey();
	if (!raw) return base;
	return {
		...base,
		...raw,
		observations: raw.observations ?? base.observations ?? [],
		books: raw.books ?? base.books ?? [],
		hi: raw.hi ?? base.hi ?? "",
		ht: raw.ht ?? base.ht ?? "",
		weather: raw.weather ?? base.weather ?? ""
	};
}
function normalizeJob(j) {
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
		coordOrder: j.coordOrder ?? "PNEZD",
		survey: asSurvey(j.survey),
		createdAt: j.createdAt ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		ticket: j.ticket ?? "",
		timeLog: j.timeLog ?? [],
		invoiceStatus: j.invoiceStatus ?? "none",
		invoiceNo: j.invoiceNo,
		sentAt: j.sentAt,
		paidAt: j.paidAt,
		phone: j.phone,
		changeOrders: j.changeOrders ?? [],
		id: j.id
	};
}
var STATUS_LABEL = {
	intake: "Intake",
	extract: "Extracting",
	qa: "QA",
	ready: "Ready",
	delivered: "Delivered"
};
var KIND_LABEL = { conventional: "Conventional" };
var INVOICE_LABEL = {
	none: "No invoice",
	draft: "Draft",
	sent: "Sent",
	paid: "Paid"
};
var TIME_LABEL = {
	extract: "Extract",
	qa: "QA",
	office: "Office"
};
var PIPE = [
	"intake",
	"extract",
	"qa",
	"ready",
	"delivered"
];
//#endregion
export { TIME_LABEL as a, invoiceNumber as c, quoteJob as d, quoteLines as f, STATUS_LABEL as i, nid as l, KIND_LABEL as n, authMiddleware as o, tid as p, PIPE as r, emptySurvey as s, INVOICE_LABEL as t, normalizeJob as u };
