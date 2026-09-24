import { d as quoteJob } from "./job-types-DRBj8xWf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clients-W2zo-EWX.js
var FIRMS = [
	{
		name: "INDOT Greenfield District",
		kind: "agency",
		city: "Greenfield, IN",
		pm: "Jordan Yaney",
		email: "greenfield@indot.in.gov",
		phone: "(317) 467-3430"
	},
	{
		name: "INDOT Seymour District",
		kind: "agency",
		city: "Seymour, IN",
		pm: "Survey desk",
		email: "seymour@indot.in.gov",
		phone: "(812) 524-5350"
	},
	{
		name: "United Consulting",
		kind: "consultant",
		city: "Indianapolis, IN",
		pm: "Taylor Hartman",
		email: "thartman@unitedconsulting.com",
		phone: "(317) 895-2585"
	},
	{
		name: "DLZ Indiana",
		kind: "consultant",
		city: "Indianapolis, IN",
		pm: "A. Groff",
		email: "survey@dlz.com",
		phone: "(317) 633-4120"
	},
	{
		name: "Beam, Longest & Neff",
		kind: "consultant",
		city: "Indianapolis, IN",
		pm: "M. MacNeill",
		email: "survey@bln-inc.com",
		phone: "(317) 849-5832"
	},
	{
		name: "USI Consultants",
		kind: "consultant",
		city: "Indianapolis, IN",
		pm: "K. Patel",
		email: "survey@usiconsultants.com",
		phone: "(317) 544-4996"
	},
	{
		name: "City of Greenwood",
		kind: "city",
		city: "Greenwood, IN",
		pm: "Engineering",
		email: "engineering@greenwood.in.gov",
		phone: "(317) 887-5230"
	}
];
var FIRM_KIND = {
	agency: "Agency",
	consultant: "Consultant",
	city: "City / county"
};
function rollupClients(jobs) {
	const map = /* @__PURE__ */ new Map();
	for (const j of jobs) {
		const k = j.client.trim() || "Unassigned";
		const list = map.get(k) ?? [];
		list.push(j);
		map.set(k, list);
	}
	const out = [];
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
		out.push({
			name,
			firm,
			jobs: list,
			open,
			billed,
			ar,
			paid
		});
	}
	return out.sort((a, b) => b.jobs.length - a.jobs.length || a.name.localeCompare(b.name));
}
function invoiceAging(status, sentAt) {
	if (status !== "sent" || !sentAt) return "—";
	const days = Math.floor((Date.now() - Date.parse(sentAt)) / 864e5);
	if (!Number.isFinite(days)) return "—";
	if (days <= 0) return "Today";
	if (days === 1) return "1 day";
	return `${days} days`;
}
//#endregion
export { rollupClients as i, FIRM_KIND as n, invoiceAging as r, FIRMS as t };
