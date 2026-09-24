import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as OUT_OF_SCOPE, i as DISCLAIMER } from "./company-D0owGUeH.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { x as useFirm } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { c as printHtml, i as htmlSow, o as htmlVendor } from "./paper-CvbkfkFR.mjs";
import { t as Input } from "./input-DxUPs7fi.mjs";
import { t as Label } from "./label-BY4xM6qU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-Csl2CxAE.js
var import_jsx_runtime = require_jsx_runtime();
function ShopDesk() {
	const firm = useFirm();
	function save(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const str = (k) => String(fd.get(k) || "");
		const num = (k, fallback) => {
			const n = Number(fd.get(k));
			return Number.isFinite(n) && n >= 0 ? n : fallback;
		};
		const rates = {
			conventionalHr: num("conventionalHr", firm.rates.conventionalHr),
			lidarClassMile: num("lidarClassMile", firm.rates.lidarClassMile),
			breaklineMile: num("breaklineMile", firm.rates.breaklineMile),
			planimetricMile: num("planimetricMile", firm.rates.planimetricMile),
			codingJob: num("codingJob", firm.rates.codingJob),
			rush: num("rush", firm.rates.rush)
		};
		firm.setFirm({
			name: str("name"),
			legal: str("legal"),
			street: str("street"),
			city: str("city"),
			state: str("state"),
			zip: str("zip"),
			phone: str("phone"),
			email: str("email"),
			hours: str("hours"),
			terms: str("terms"),
			ein: str("ein"),
			gl: str("gl"),
			eo: str("eo"),
			remit: str("remit"),
			tagline: str("tagline"),
			rates
		});
		toast.success("Shop saved — invoices and proposals use this");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Shop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-medium tracking-tight",
					children: "Take paid work"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted-foreground",
					children: "This desk is the extraction shop. It is not a licensed survey practice. Fill the identity, print a proposal, reduce the book, send DXF + LandXML + PNEZD, invoice."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCard, {
						k: "You do outside this app",
						items: [
							"Indiana LLC (or equivalent) and EIN",
							"Business checking. W-9 ready for every client",
							"General liability — firms will ask for a COI before they send the book",
							"Professional liability / E&O — extraction still carries risk",
							"You do not stamp unless you are an Indiana LS. You are the sub. Their LS is of record",
							"ShareFile / Dropbox / FTP for large field books. This desk logs files; it does not host them"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCard, {
						k: "This desk now does",
						items: [
							"Proposal a PM can print and sign",
							"Work order / subcontract terms",
							"QA/QC on the survey tab before the book goes back",
							"DXF and LandXML the PM attaches in ORD",
							"Labeled PNEZD, workbook, control report",
							"Print invoice, transmittal, change orders"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCard, {
						k: "Still not this app",
						items: [
							"LiDAR / TopoDOT production extraction — conventional field books only",
							"Native DGN / ORD seed files — DXF and LandXML import instead",
							"ALTA, boundary, staking, legal descriptions",
							"QuickBooks, payroll, sales tax",
							"A lawyer-reviewed contract — have counsel read the SOW once"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Paper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Print to PDF from the browser dialog. Job-specific proposals live on the ticket."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: () => printHtml("Vendor information", htmlVendor()),
							children: "Vendor sheet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => printHtml("Extraction subcontract", htmlSow()),
							children: "Subcontract template"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: DISCLAIMER
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border bg-card p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "Identity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "legal",
									label: "Legal name",
									defaultValue: firm.legal
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "name",
									label: "DBA",
									defaultValue: firm.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "street",
									label: "Street",
									defaultValue: firm.street,
									className: "sm:col-span-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "city",
									label: "City",
									defaultValue: firm.city
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										name: "state",
										label: "State",
										defaultValue: firm.state
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										name: "zip",
										label: "ZIP",
										defaultValue: firm.zip
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "phone",
									label: "Phone",
									defaultValue: firm.phone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "email",
									label: "Email",
									defaultValue: firm.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "hours",
									label: "Hours",
									defaultValue: firm.hours
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "terms",
									label: "Terms",
									defaultValue: firm.terms
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "ein",
									label: "EIN",
									defaultValue: firm.ein,
									placeholder: "XX-XXXXXXX"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "tagline",
									label: "Line on paper",
									defaultValue: firm.tagline,
									className: "sm:col-span-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "remit",
									label: "Remit / ACH note",
									defaultValue: firm.remit,
									className: "sm:col-span-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "gl",
									label: "General liability",
									defaultValue: firm.gl,
									placeholder: "Carrier · $1M"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									name: "eo",
									label: "Professional liability",
									defaultValue: firm.eo,
									placeholder: "Carrier · $1M"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border bg-card p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "Rate card"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Quotes, proposals, and invoices read these numbers."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										name: "conventionalHr",
										label: "Conventional $/hr",
										defaultValue: String(firm.rates.conventionalHr)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										name: "codingJob",
										label: "INDOT coding $/job",
										defaultValue: String(firm.rates.codingJob)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										name: "rush",
										label: "Rush multiplier",
										defaultValue: String(firm.rates.rush)
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Save shop"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Stored on this device. Out of scope: ",
								OUT_OF_SCOPE[0],
								"."
							]
						})]
					})
				]
			})
		]
	});
}
function CheckCard({ k, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 flex flex-col gap-2 text-sm",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "pl-3 -indent-3 before:mr-2 before:content-['—'] text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: item
				})
			}, item))
		})]
	});
}
function Field({ name, label, defaultValue, placeholder, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: className ? `flex flex-col gap-1 ${className}` : "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: name,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: name,
			name,
			defaultValue,
			placeholder
		})]
	});
}
function ShopPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopDesk, {}) });
}
//#endregion
export { ShopPage as component };
