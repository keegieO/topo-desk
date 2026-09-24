import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as quoteJob, f as quoteLines } from "./job-types-DRBj8xWf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { S as useJobs } from "./label-CD5-qmOw.mjs";
import { y as useBook } from "./store-Bj7SGyFp.mjs";
import { t as Input } from "./input-DxUPs7fi.mjs";
import { t as Label } from "./label-BY4xM6qU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/job-form-BwdthcYs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JobForm({ kicker = "New job", title = "Crew drop-off", blurb = "PMs send PNEZD field books and control. You reduce, code to INDOT, QA, and return an ORD package.", submit = "Put on desk" }) {
	const addJob = useJobs((s) => s.addJob);
	const navigate = useNavigate();
	const [hours, setHours] = (0, import_react.useState)("0");
	const [rush, setRush] = (0, import_react.useState)(false);
	const previewJob = {
		hours: Number(hours) || 0,
		rush
	};
	const preview = quoteJob(previewJob);
	const lines = quoteLines(previewJob);
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const csvFile = fd.get("csv");
		const id = addJob({
			name: String(fd.get("name") || "Untitled job"),
			client: String(fd.get("client") || ""),
			pm: String(fd.get("pm") || ""),
			email: String(fd.get("email") || ""),
			des: String(fd.get("des") || ""),
			county: String(fd.get("county") || ""),
			crs: String(fd.get("crs") || "Indiana InGCS — NAD 1983 (2011)"),
			kind: "conventional",
			miles: 0,
			hours: Number(hours) || 0,
			planimetrics: false,
			rush,
			due: String(fd.get("due") || ""),
			notes: String(fd.get("notes") || ""),
			files: csvFile && csvFile.size ? [{
				name: csvFile.name,
				kind: ext(csvFile.name),
				size: csvFile.size
			}] : [],
			csvName: csvFile && /\.(csv|txt|pnezd|penzd|fbk)$/i.test(csvFile.name) ? csvFile.name : void 0,
			phone: String(fd.get("phone") || "")
		});
		if (csvFile && csvFile.size && /\.(csv|txt|pnezd|penzd|fbk)$/i.test(csvFile.name)) {
			const reader = new FileReader();
			reader.onload = () => {
				const text = String(reader.result ?? "");
				useJobs.getState().updateJob(id, { csvText: text });
				useBook.getState().loadText(text, csvFile.name);
				toast.success("Job in. Field book loaded.");
				navigate({ to: "/extract" });
			};
			reader.readAsText(csvFile);
			return;
		}
		toast.success("Job on the desk.");
		navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-lg font-medium tracking-tight",
					children: title
				}),
				blurb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: blurb
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "name",
						label: "Job name",
						required: true,
						placeholder: "S.R. 67 topo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "client",
						label: "Client / firm",
						placeholder: "Consulting firm or INDOT district"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "pm",
						label: "Project manager"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "email",
						label: "Return email",
						type: "email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "phone",
						label: "Phone",
						placeholder: "(317) 555-0167"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "des",
						label: "Des. number",
						placeholder: "2501384"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "county",
						label: "County",
						placeholder: "Delaware"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "crs",
							children: "Coordinate system"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "crs",
							name: "crs",
							defaultValue: "Indiana InGCS — NAD 1983 (2011)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "due",
						label: "Due",
						type: "date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "hours",
							children: "Reduction hours"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "hours",
							value: hours,
							onChange: (e) => setHours(e.target.value),
							inputMode: "decimal"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-10 items-center gap-2 text-sm sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: rush,
							onChange: (e) => setRush(e.target.checked)
						}), "Rush (under five working days) — 1.35×"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "notes",
							children: "Scope notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "notes",
							name: "notes",
							rows: 3,
							className: "rounded-md border border-input bg-background px-3 py-2 text-sm",
							placeholder: "DTM limits, excluded areas, ORD workspace version…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 sm:col-span-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "csv",
								children: "Field book (optional)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "csv",
								name: "csv",
								type: "file",
								accept: ".csv,.txt,.pnezd,.penzd,.fbk"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "PNEZD / PENZD / CSV opens in Extract."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm",
					children: ["Quote ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-lg font-medium",
						children: ["$", preview.toLocaleString("en-US")]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 font-mono text-[0.6875rem] text-muted-foreground",
					children: lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						l.desc,
						" · $",
						Math.round(l.amount).toLocaleString("en-US")
					] }, l.desc))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: submit
				})]
			})
		]
	});
}
function Field({ id, label, type = "text", placeholder, required }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id,
			name: id,
			type,
			placeholder,
			required
		})]
	});
}
function ext(name) {
	return name.split(".").pop()?.toLowerCase() || "file";
}
//#endregion
export { JobForm as t };
