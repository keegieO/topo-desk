import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { I as Check, P as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { _ as lookupCode, a as KIND_LABEL, b as splitDescription, c as allCategories, o as LINKING_CODES, t as ATTR_HINT, u as features, y as searchFeatures } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { t as Badge } from "./badge-CgPzfXcT.mjs";
import { t as Input } from "./input-DxUPs7fi.mjs";
import { t as NativeSelect } from "./native-select-C9RyDdPV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/codes-BoJhaqbI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		id: "survey",
		label: "Survey"
	},
	{
		id: "point",
		label: "Point"
	},
	{
		id: "linear",
		label: "Linear"
	},
	{
		id: "alignment",
		label: "Alignment"
	},
	{
		id: "all",
		label: "All"
	}
];
function CodeLibrary() {
	const [kind, setKind] = (0, import_react.useState)("survey");
	const [cat, setCat] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(null);
	const cats = (0, import_react.useMemo)(() => {
		return kind === "all" ? allCategories : [...new Set(features.filter((f) => f.kind === kind).map((f) => f.cat))].sort();
	}, [kind]);
	const rows = (0, import_react.useMemo)(() => searchFeatures(q, {
		kind,
		cat
	}), [
		q,
		kind,
		cat
	]);
	const decoder = (0, import_react.useMemo)(() => {
		const { codeToken, remainder } = splitDescription(q);
		const hit = lookupCode(codeToken);
		if (!q.trim()) return null;
		return {
			codeToken,
			remainder,
			hit
		};
	}, [q]);
	function copy(text, id) {
		navigator.clipboard.writeText(text);
		setCopied(id);
		toast.success("Copied");
		window.setTimeout(() => setCopied((c) => c === id ? null : c), 1200);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Look up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: "INDOT feature codes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted-foreground text-pretty",
						children: [features.length, " feature definitions from the INDOT OpenRoads workbook. Search by alpha code, name, or description. Paste a raw description such as EP ST to decode it."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "EP, PHYD, pavement, manhole…",
								className: "sm:flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
								value: kind,
								onChange: (e) => {
									setKind(e.target.value);
									setCat("all");
								},
								className: "sm:w-40",
								children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k.id,
									children: k.label
								}, k.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
								value: cat,
								onChange: (e) => setCat(e.target.value),
								className: "sm:w-48",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All categories"
								}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))]
							})
						]
					}),
					decoder?.hit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-border bg-background p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "Decoded"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-sm",
								children: [decoder.codeToken, decoder.remainder ? `  ${decoder.remainder}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm",
								children: [decoder.hit.desc || decoder.hit.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [" · ", decoder.hit.name]
								})]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Showing ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-foreground",
						children: rows.length
					}),
					" of",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums",
						children: features.length
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: rows.slice(0, 250).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl border border-border bg-card p-3 sm:p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										f.alphas.length ? f.alphas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-sm font-medium",
											children: a
										}, a)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-sm font-medium text-muted-foreground",
											children: "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "muted",
											children: KIND_LABEL[f.kind]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: f.cat
										}),
										f.attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: f.attr === "Break Line" || f.attr === "Spot And Break" ? "ok" : "outline",
											children: f.attr
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium",
									children: f.desc || f.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-mono text-[0.6875rem] text-muted-foreground",
									children: f.name
								}),
								f.attr && ATTR_HINT[f.attr] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ATTR_HINT[f.attr]
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 gap-2",
							children: [f.alphas[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => copy(f.alphas[0], `a-${f.id}`),
								children: [copied === `a-${f.id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Code"]
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => copy(f.name, `n-${f.id}`),
								children: [copied === `n-${f.id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Definition"]
							})]
						})]
					})
				}, f.id))
			}),
			rows.length > 250 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground",
				children: [
					"Narrow the search to see the rest of ",
					rows.length,
					" matches."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "OpenRoads linking codes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Placed after the feature code in the description. They are stripped from matching and kept on export."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: LINKING_CODES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border bg-background px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs font-medium",
								children: c.code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.meaning
							})]
						}, c.code))
					})
				]
			})
		]
	});
}
function CodesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeLibrary, {}) });
}
//#endregion
export { CodesPage as component };
