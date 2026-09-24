import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as SERVICES, l as WORKFLOW, n as COVERAGE, r as DELIVER_LIST, s as SEND_LIST } from "./company-D0owGUeH.mjs";
import { f as firmCityLine, x as useFirm } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { n as FIRM_KIND, t as FIRMS } from "./clients-W2zo-EWX.mjs";
import { t as JobForm } from "./job-form-BwdthcYs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crew-DjHdKWR4.js
var import_jsx_runtime = require_jsx_runtime();
function CrewPortal() {
	const firm = useFirm();
	const rates = firm.rates;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "For survey companies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl",
						children: "Drop the book. Get an ORD-ready file."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-base text-muted-foreground",
						children: "Breakline is the extraction sub. Crews and PMs send conventional field books. We reduce, extract linework, code to INDOT, QA, and hand back a package you drop into OpenRoads."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: [
							firmCityLine(firm),
							" · ",
							firm.hours,
							" · ",
							firm.phone,
							" · ",
							firm.email
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
							k: "Coding library",
							v: "318 survey"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
							k: "Rush",
							v: "1.35×"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
							k: "Terms",
							v: firm.terms
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
							k: "Shop",
							v: firm.city
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "How it works"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 grid gap-3 sm:grid-cols-3",
				children: WORKFLOW.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted-foreground",
							children: w.step
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-lg font-medium",
							children: w.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: w.detail
						})
					]
				}, w.step))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "What we extract"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: s.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs",
							children: s.rate
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: s.detail
					})]
				}, s.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Rush"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs",
							children: "1.35×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [
							"Under five working days. Same deliverables. Invoice still ",
							firm.terms,
							"."
						]
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: COVERAGE.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: c.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: c.detail
					})]
				}, c.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4 sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "What crews send"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-3",
						children: SEND_LIST.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: s.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: s.detail
						})] }, s.title))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "What you get back"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-2 text-sm text-muted-foreground",
							children: DELIVER_LIST.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "pl-3 -indent-3 before:mr-2 before:content-['—']",
								children: d
							}, d))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs text-muted-foreground",
							children: "LAS/LAZ classification stays in the lidar stack. Breakline codes the vectors to INDOT and runs the shop — tickets, QA, package, invoice."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Who sends work"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: FIRMS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: f.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 font-mono text-[0.6875rem] text-muted-foreground",
						children: [
							FIRM_KIND[f.kind],
							" · ",
							f.city
						]
					})]
				}, f.name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Rate card"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid gap-1.5 font-mono text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "Conventional reduction",
							v: `$${rates.conventionalHr}/hr`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "LiDAR classification",
							v: `$${rates.lidarClassMile.toLocaleString()}/mi`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "Breakline extraction",
							v: `$${rates.breaklineMile.toLocaleString()}/mi`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "Planimetrics",
							v: `$${rates.planimetricMile.toLocaleString()}/mi`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "INDOT coding + ORD book",
							v: `$${rates.codingJob}/job`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rate, {
							k: "Rush",
							v: "1.35×"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobForm, {
				kicker: "Send a job",
				title: "Crew drop-off",
				blurb: "PMs send LAS/LAZ, field books, and control. Quote updates as you type. Put it on the desk and we extract.",
				submit: "Send to Breakline"
			})
		]
	});
}
function HeroStat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-mono text-lg tabular-nums",
			children: v
		})]
	});
}
function Rate({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: v })]
	});
}
function CrewPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrewPortal, {}) });
}
//#endregion
export { CrewPage as component };
