import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as COMPANY } from "./company-D0owGUeH.mjs";
import { c as invoiceNumber, d as quoteJob, n as KIND_LABEL, t as INVOICE_LABEL } from "./job-types-DRBj8xWf.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { S as useJobs, h as getRates } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { t as Badge } from "./badge-CgPzfXcT.mjs";
import { t as loadJobBook } from "./open-job-DCawJpH5.mjs";
import { i as rollupClients, n as FIRM_KIND, r as invoiceAging } from "./clients-W2zo-EWX.mjs";
import { c as printHtml, n as htmlInvoice, r as htmlProposal } from "./paper-CvbkfkFR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-Daz54J2N.js
var import_jsx_runtime = require_jsx_runtime();
function BillingDesk() {
	const jobs = useJobs((s) => s.jobs);
	const setInvoice = useJobs((s) => s.setInvoice);
	const setActive = useJobs((s) => s.setActive);
	const rates = getRates();
	const billed = jobs.filter((j) => j.invoiceStatus !== "none");
	const ar = billed.filter((j) => j.invoiceStatus === "sent").reduce((a, j) => a + quoteJob(j), 0);
	const paid = billed.filter((j) => j.invoiceStatus === "paid").reduce((a, j) => a + quoteJob(j), 0);
	const draft = billed.filter((j) => j.invoiceStatus === "draft").reduce((a, j) => a + quoteJob(j), 0);
	const clients = rollupClients(jobs);
	const rows = [...jobs].sort((a, b) => (b.due || "").localeCompare(a.due || ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Billing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-medium tracking-tight",
					children: "Invoices and clients"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-xl text-sm text-muted-foreground",
					children: [
						"Quotes become invoices when a job is ready. Print to PDF. ",
						COMPANY.terms,
						". Payable to ",
						COMPANY.legal,
						"."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Open AR",
						v: `$${ar.toLocaleString("en-US")}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Draft",
						v: `$${draft.toLocaleString("en-US")}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Paid",
						v: `$${paid.toLocaleString("en-US")}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium",
						children: "Invoices"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Draft → send → paid. Print is the invoice the PM files."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: rows.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceRow, {
						job,
						onStatus: (st) => setInvoice(job.id, st),
						onActive: () => setActive(job.id)
					}, job.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-medium",
				children: "Clients"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-mono text-[0.6875rem] text-muted-foreground",
								children: c.firm ? `${FIRM_KIND[c.firm.kind]} · ${c.firm.city}` : "New client"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "muted",
								children: [c.jobs.length, " jobs"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid grid-cols-3 gap-2 font-mono text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Open"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: ["$", c.open.toLocaleString("en-US")] })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "AR"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: ["$", c.ar.toLocaleString("en-US")] })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Paid"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: ["$", c.paid.toLocaleString("en-US")] })] })
							]
						}),
						c.firm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: [
								c.firm.pm,
								" · ",
								c.firm.email
							]
						}) : null
					]
				}, c.name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Rate card"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 flex flex-col gap-1.5 font-mono text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Conventional reduction",
							v: `$${rates.conventionalHr}/hr`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "INDOT coding + ORD book",
							v: `$${rates.codingJob}/job`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Rush",
							v: "1.35×"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Terms",
							v: COMPANY.terms
						})
					]
				})]
			})
		]
	});
}
function InvoiceRow({ job, onStatus, onActive }) {
	const money = quoteJob(job);
	const no = invoiceNumber(job);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "rounded-lg border border-border bg-card p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm",
								children: no
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: job.invoiceStatus === "paid" ? "ok" : job.invoiceStatus === "sent" ? "warn" : "outline",
								children: INVOICE_LABEL[job.invoiceStatus]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "muted",
								children: KIND_LABEL[job.kind]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: job.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 font-mono text-xs text-muted-foreground",
						children: [
							job.client,
							" · Des. ",
							job.des || "—",
							" · due ",
							job.due || "—",
							job.invoiceStatus === "sent" ? ` · aging ${invoiceAging(job.invoiceStatus, job.sentAt)}` : ""
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-start gap-2 sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm",
					children: ["$", money.toLocaleString("en-US")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => printHtml(no, htmlInvoice(job)),
							children: "Invoice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job)),
							children: "Proposal"
						}),
						job.invoiceStatus === "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => onStatus("draft"),
							children: "Draft"
						}) : null,
						job.invoiceStatus === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => onStatus("sent"),
							children: "Mark sent"
						}) : null,
						job.invoiceStatus === "sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => onStatus("paid"),
							children: "Mark paid"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/deliver",
								onClick: () => {
									onActive();
									loadJobBook(job);
								},
								children: "Package"
							})
						})
					]
				})]
			})]
		})
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-xl tabular-nums",
			children: v
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: v })]
	});
}
function BillingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillingDesk, {}) });
}
//#endregion
export { BillingPage as component };
