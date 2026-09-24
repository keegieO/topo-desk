import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./router-pTBIT-ZP.mjs";
import { f as firmCityLine, n as AccountGate, r as AuthSlot, x as useFirm } from "./label-CD5-qmOw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firm-shell-CmsCnRoe.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Desk"
	},
	{
		to: "/crew",
		label: "Crew"
	},
	{
		to: "/extract",
		label: "Extract"
	},
	{
		to: "/deliver",
		label: "Deliver"
	},
	{
		to: "/billing",
		label: "Bills"
	},
	{
		to: "/codes",
		label: "Codes"
	},
	{
		to: "/shop",
		label: "Shop"
	}
];
function FirmShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const firm = useFirm();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex min-w-0 items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 16 16",
								className: "h-4 w-4",
								"aria-hidden": true,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "8",
									cy: "8",
									r: "5.25",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.2"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M8 2.2v11.6M2.2 8h11.6",
									stroke: "currentColor",
									strokeWidth: "1.2"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-medium leading-tight",
							children: firm.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[0.6875rem] text-muted-foreground",
							children: firmCityLine(firm)
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-wrap gap-1 sm:ml-6",
						children: NAV.map((item) => {
							const active = pathname === item.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: cn("rounded-md px-3 py-2 text-sm font-medium", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
								children: item.label
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:ml-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8",
			children
		})]
	}) });
}
//#endregion
export { FirmShell as t };
