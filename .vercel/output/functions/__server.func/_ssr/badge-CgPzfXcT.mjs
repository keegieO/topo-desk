import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-pTBIT-ZP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-CgPzfXcT.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		outline: "border-border text-muted-foreground",
		ok: "border-transparent bg-ok/12 text-ok",
		warn: "border-transparent bg-warn/12 text-warn",
		bad: "border-transparent bg-destructive/12 text-destructive",
		muted: "border-transparent bg-secondary text-muted-foreground"
	} },
	defaultVariants: { variant: "outline" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
