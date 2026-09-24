import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as invoiceNumber, i as STATUS_LABEL, n as KIND_LABEL, t as INVOICE_LABEL } from "./job-types-DRBj8xWf.mjs";
import { N as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as downloadText, r as downloadBlob } from "./router-pTBIT-ZP.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { S as useJobs, v as resolveFeature, x as useFirm } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { t as Badge } from "./badge-CgPzfXcT.mjs";
import { _ as templateOf, i as chainVertices, s as extractsAsShots, y as useBook } from "./store-Bj7SGyFp.mjs";
import { t as loadJobBook } from "./open-job-DCawJpH5.mjs";
import { a as htmlTransmittal, c as printHtml, i as htmlSow, l as scopeStatus, n as htmlInvoice, r as htmlProposal, s as openDocument } from "./paper-CvbkfkFR.mjs";
import { c as cadFilenames, d as projectAlignment, f as runQa, i as buildExport, n as buildControlCsv, o as buildLandXml, p as staOffCsv, r as buildDxf, s as buildOrdPackage, t as allChains, u as htmlPlotSheet } from "./ord-package-BBsDP27j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deliver-BifnzKKs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DeliverPack() {
	const jobs = useJobs((s) => s.jobs);
	const activeId = useJobs((s) => s.activeId);
	const setStatus = useJobs((s) => s.setStatus);
	const setInvoice = useJobs((s) => s.setInvoice);
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const order = useBook((s) => s.order);
	const fileName = useBook((s) => s.fileName);
	const templateId = useBook((s) => s.templateId);
	const userLines = useBook((s) => s.userLines);
	const job = jobs.find((j) => j.id === activeId) ?? jobs[0];
	const firm = useFirm();
	const stats = (0, import_react.useMemo)(() => {
		const codes = /* @__PURE__ */ new Set();
		let matched = 0;
		const unmatched = /* @__PURE__ */ new Map();
		for (const s of shots) {
			codes.add(s.codeToken.toUpperCase());
			if (resolveFeature(s, remaps)) matched += 1;
			else unmatched.set((s.codeToken || "?").toUpperCase(), (unmatched.get((s.codeToken || "?").toUpperCase()) ?? 0) + 1);
		}
		const scope = scopeStatus(codes);
		const req = scope.filter((x) => x.required);
		return {
			matched,
			unmatched: shots.length - matched,
			unmatchedCodes: [...unmatched.entries()],
			scope,
			reqDone: req.filter((x) => x.done).length,
			req: req.length
		};
	}, [shots, remaps]);
	const chains = (0, import_react.useMemo)(() => allChains(shots, remaps, userLines), [
		shots,
		remaps,
		userLines
	]);
	const qa = (0, import_react.useMemo)(() => runQa(shots, remaps, userLines), [
		shots,
		remaps,
		userLines
	]);
	const align = (0, import_react.useMemo)(() => projectAlignment(shots, chains.map((c) => ({
		code: c.code,
		pts: chainVertices(c)
	}))), [shots, chains]);
	(0, import_react.useEffect)(() => {
		if (!job?.csvText) return;
		const book = useBook.getState();
		if (book.fileName === job.csvName && book.shots.length) return;
		loadJobBook(job);
	}, [job]);
	function stem() {
		return fileName || job?.des || "fieldbook";
	}
	function dl(kind) {
		if (!shots.length) {
			toast.error("No shots — open the job in Extract first");
			return;
		}
		const extra = extractsAsShots(userLines);
		const { filename, csv } = buildExport({
			shots: [...shots, ...extra],
			remaps,
			kind,
			template: templateOf(templateId),
			order,
			fileName: stem()
		});
		downloadText(filename, csv);
		toast.success(filename);
	}
	function dlDxf() {
		if (!shots.length && !userLines.length) {
			toast.error("No linework");
			return;
		}
		const names = cadFilenames(stem());
		downloadText(names.dxf, buildDxf({
			shots,
			chains
		}), "application/dxf;charset=utf-8");
		toast.success(names.dxf);
	}
	function dlXml() {
		if (!job) return;
		const names = cadFilenames(stem());
		downloadText(names.xml, buildLandXml({
			shots,
			chains,
			remaps,
			project: job.name,
			crs: job.crs
		}), "application/xml;charset=utf-8");
		toast.success(names.xml);
	}
	function dlControl() {
		const names = cadFilenames(stem());
		downloadText(names.control, buildControlCsv(shots));
		toast.success(names.control);
	}
	function openSheet() {
		if (!shots.length) {
			toast.error("No field book");
			return;
		}
		openDocument(`${job?.des || "plan"}_plan_sheet.html`, htmlPlotSheet({
			title: job?.name || fileName || "Plan",
			des: job?.des || "",
			client: job?.client || "",
			county: job?.county || "",
			crs: job?.crs || "",
			date: job?.survey?.date || "",
			firm: firm.legal,
			align,
			shots,
			chains
		}));
	}
	function dlSta() {
		if (!shots.length) {
			toast.error("No field book");
			return;
		}
		const name = `${stem()}_station_offset.csv`;
		downloadText(name, staOffCsv(shots, align));
		toast.success(name);
	}
	function packageAll() {
		if (!shots.length && !userLines.length) {
			toast.error("No field book on this job");
			return;
		}
		const pack = buildOrdPackage({
			stem: stem(),
			shots,
			remaps,
			userLines,
			order,
			template: templateOf(templateId),
			job,
			fileName: fileName || stem()
		});
		downloadBlob(pack.filename, pack.blob);
		toast.success(pack.filename);
	}
	if (!job) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No jobs on the desk."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Deliver"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-medium tracking-tight",
					children: job.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-mono text-sm text-muted-foreground",
					children: [
						"Des. ",
						job.des || "—",
						" · ",
						job.client,
						" · ",
						KIND_LABEL[job.kind],
						" · ",
						STATUS_LABEL[job.status],
						" ·",
						" ",
						INVOICE_LABEL[job.invoiceStatus],
						align ? ` · Align ${align.name}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: packageAll,
							disabled: !shots.length && !userLines.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "ORD package"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: openSheet,
							disabled: !shots.length,
							children: "Plan sheet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: dlSta,
							disabled: !shots.length,
							children: "Station / offset"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						k: "Shots",
						v: shots.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						k: "Matched",
						v: stats.matched,
						ok: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						k: "Unmatched",
						v: stats.unmatched,
						bad: stats.unmatched > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						k: "Strings",
						v: chains.length
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "INDOT topo checklist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-1.5",
						children: stats.scope.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 font-mono text-xs text-muted-foreground",
								children: s.codes.join(", ")
							})] }), s.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "ok",
								children: "In"
							}) : s.required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "bad",
								children: "Gap"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "muted",
								children: "Optional"
							})]
						}, s.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "QA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 flex flex-col gap-1.5 font-mono text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Errors" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: qa.errors ? "text-destructive" : "text-ok",
										children: qa.errors
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Warnings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: qa.warns ? "text-warn" : "",
										children: qa.warns
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: qa.infos })]
								})
							]
						})]
					}), stats.unmatchedCodes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "Hold for remap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 font-mono text-sm",
							children: stats.unmatchedCodes.map(([c, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								c,
								" · ",
								n
							] }, c))
						})]
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Files"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: dlDxf,
							disabled: !shots.length && !userLines.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "DXF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: dlXml,
							disabled: !shots.length && !userLines.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "LandXML"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => dl("fieldbook"),
							disabled: !shots.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "ORD field book"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => dl("labeled-ord"),
							disabled: !shots.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Labeled PNEZD"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => dl("full"),
							disabled: !shots.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Workbook"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: dlControl,
							disabled: !shots.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Control"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: dlSta,
							disabled: !shots.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Station CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: openSheet,
							disabled: !shots.length,
							children: "Plan sheet"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Paper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job)),
								children: "Proposal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => printHtml(`Work order ${job.des || job.name}`, htmlSow(job)),
								children: "Work order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => printHtml(`${job.des || "job"} transmittal`, htmlTransmittal({
									job,
									shots,
									remaps
								})),
								children: "Transmittal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => {
									if (job.invoiceStatus === "none") setInvoice(job.id, "draft");
									const latest = useJobs.getState().jobs.find((j) => j.id === job.id) ?? job;
									printHtml(invoiceNumber(latest), htmlInvoice(latest));
								},
								children: "Invoice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: packageAll,
								disabled: !shots.length && !userLines.length,
								children: "ORD package"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									setStatus(job.id, "delivered");
									if (job.invoiceStatus === "none" || job.invoiceStatus === "draft") setInvoice(job.id, "sent");
									toast.success("Marked delivered");
								},
								children: "Mark delivered"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-[0.6875rem] text-muted-foreground",
						children: [
							firm.legal,
							" · ",
							firm.city,
							", ",
							firm.state,
							" · ",
							firm.email,
							" · ",
							invoiceNumber(job),
							" · ",
							chains.length,
							" strings"
						]
					})
				]
			})
		]
	});
}
function Tile({ k, v, ok, bad }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 font-mono text-2xl tabular-nums ${ok ? "text-ok" : bad ? "text-destructive" : ""}`,
			children: v
		})]
	});
}
function DeliverPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliverPack, {}) });
}
//#endregion
export { DeliverPage as component };
