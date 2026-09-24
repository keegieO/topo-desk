import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as COMPANY } from "./company-D0owGUeH.mjs";
import { A as Eye, C as Map$1, D as GitMerge, E as Layers, F as ChevronsUpDown, I as Check, L as BookOpen, M as Eraser, N as Download, O as FileUp, P as Copy, R as ArrowLeftRight, S as Mountain, T as List, _ as PanelRight, a as Tag, b as MoveHorizontal, c as Snowflake, d as Scissors, f as Ruler, g as Pencil, h as Pentagon, j as EyeOff, k as FilePlus2, l as ShieldCheck, m as Play, n as Waypoints, o as Table2, p as RotateCcw, r as Type, s as Spline, t as X, u as Search, v as PanelLeft, w as MapPin, x as MousePointer2, y as Move } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as downloadText, n as cn, r as downloadBlob } from "./router-pTBIT-ZP.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { S as useJobs, _ as lookupCode, i as EXPORT_KINDS, l as applyTemplate, n as AccountGate, p as getFeature, r as AuthSlot, s as TEMPLATES, v as resolveFeature, y as searchFeatures } from "./label-CD5-qmOw.mjs";
import { t as Badge } from "./badge-CgPzfXcT.mjs";
import { a as detectGeoOrigin, c as fromLatLon, d as toLatLon, i as SR67_SITE, l as gridUnit, o as dist2d, s as formatLatLon, t as CRS_OPTIONS, u as parseCoordinateKeyin } from "./sample-D-33kfTV.mjs";
import { _ as templateOf, a as chainedShotIds, b as userLineToChain, c as formatStation, d as nearestVertexIndex, f as parseFieldbook, g as styleForCode, h as stationOffset, i as chainVertices, l as inverse, m as polylineLength, n as buildChains, o as detectFieldbookFormat, p as polygonArea, r as chainStyle, s as extractsAsShots, t as SHEET_LEGEND, u as markSvg, x as visibleShots, y as useBook } from "./store-Bj7SGyFp.mjs";
import { t as loadJobBook } from "./open-job-DCawJpH5.mjs";
import { t as Input } from "./input-DxUPs7fi.mjs";
import { t as NativeSelect } from "./native-select-C9RyDdPV.mjs";
import { t as Label } from "./label-BY4xM6qU.mjs";
import { a as buildFieldbookReport, c as cadFilenames, d as projectAlignment, f as runQa, i as buildExport, l as formatOffset, o as buildLandXml, r as buildDxf, s as buildOrdPackage, t as allChains } from "./ord-package-BBsDP27j.mjs";
import { i as qt, n as fn, r as nn, t as Qt } from "../_libs/react-resizable-panels.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/extract-D959KSnB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KeyIn() {
	const [value, setValue] = (0, import_react.useState)("");
	function run(raw) {
		const q = raw.trim();
		if (!q) return;
		const st = useBook.getState();
		const low = q.toLowerCase();
		if (low === "fit" || low === "ze" || low === "za") {
			st.fitView();
			return;
		}
		const ne = q.match(/^(?:ne|xy)\s+(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/i);
		if (ne) {
			const n = Number(ne[1]);
			const e = Number(ne[2]);
			if (st.tool === "place") st.addShot({
				n,
				e,
				z: st.cursor?.z ?? st.shots[0]?.elevation ?? 0
			});
			st.locate(n, e);
			return;
		}
		const tagged = q.match(/^(?:pt|pn|p)\s+(\S+)$/i);
		const num = tagged ? tagged[1] : /^\d+[a-z]?$/i.test(q) ? q : null;
		if (num) {
			const shot = st.shots.find((s) => s.point.toLowerCase() === num.toLowerCase());
			if (!shot) {
				toast.error(`Point ${num} is not in this book`);
				return;
			}
			st.setSelected(shot.uid);
			st.setSelectedLine(null);
			st.locate(shot.northing, shot.easting);
			return;
		}
		toast.message("Key-in: point number, NE n,e, fit");
	}
	function onSubmit(e) {
		e.preventDefault();
		run(value);
		setValue("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		onSubmit,
		className: "shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id: "cad-keyin",
			value,
			onChange: (e) => setValue(e.target.value),
			placeholder: "Key-in",
			"aria-label": "Key-in",
			spellCheck: false,
			autoCapitalize: "off",
			className: "h-7 w-36 rounded-sm border border-border bg-card px-2 font-mono text-xs text-foreground outline-none focus:border-ring sm:w-44"
		})
	});
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-foreground/40", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 grid w-[min(calc(100%-2rem),40rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-5 text-foreground shadow-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-3 top-3 rounded-sm p-1 text-muted-foreground hover:text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col gap-1.5", className),
	...props
});
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-lg font-medium tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function Ribbon({ onOpenFiles, onAppendFiles }) {
	const inputRef = (0, import_react.useRef)(null);
	const appendRef = (0, import_react.useRef)(null);
	const shots = useBook((s) => s.shots);
	const fileName = useBook((s) => s.fileName);
	const order = useBook((s) => s.order);
	const remaps = useBook((s) => s.remaps);
	const templateId = useBook((s) => s.templateId);
	const exportKind = useBook((s) => s.exportKind);
	const labelsOn = useBook((s) => s.labelsOn);
	const legendOn = useBook((s) => s.legendOn);
	const tableOn = useBook((s) => s.tableOn);
	const mapMode = useBook((s) => s.mapMode);
	const setMapMode = useBook((s) => s.setMapMode);
	const leftOpen = useBook((s) => s.leftOpen);
	const rightOpen = useBook((s) => s.rightOpen);
	const shotsOpen = useBook((s) => s.shotsOpen);
	const tool = useBook((s) => s.tool);
	const rightTab = useBook((s) => s.rightTab);
	const loadSample = useBook((s) => s.loadSample);
	const clear = useBook((s) => s.clear);
	const setOrder = useBook((s) => s.setOrder);
	const setTemplate = useBook((s) => s.setTemplate);
	const setExportKind = useBook((s) => s.setExportKind);
	const setLabelsOn = useBook((s) => s.setLabelsOn);
	const setLegendOn = useBook((s) => s.setLegendOn);
	const setTableOn = useBook((s) => s.setTableOn);
	const setLeftOpen = useBook((s) => s.setLeftOpen);
	const setRightOpen = useBook((s) => s.setRightOpen);
	const setShotsOpen = useBook((s) => s.setShotsOpen);
	const setTool = useBook((s) => s.setTool);
	const setRightTab = useBook((s) => s.setRightTab);
	const userLines = useBook((s) => s.userLines);
	const extractAll = useBook((s) => s.extractAll);
	const contoursOn = useBook((s) => s.contoursOn);
	const setContoursOn = useBook((s) => s.setContoursOn);
	const [exportOpen, setExportOpen] = (0, import_react.useState)(false);
	function exportNow() {
		if (!shots.length) {
			toast.error("No points to export");
			return;
		}
		const extra = extractsAsShots(userLines);
		const { filename, csv } = buildExport({
			shots: [...shots, ...extra],
			remaps,
			kind: exportKind,
			template: templateOf(templateId),
			order,
			fileName: fileName || "fieldbook"
		});
		downloadText(filename, csv);
		toast.success(`Downloaded ${filename}`);
		setExportOpen(false);
	}
	function exportCad(kind) {
		if (!shots.length && !userLines.length) {
			toast.error("No linework");
			return;
		}
		const chains = allChains(shots, remaps, userLines);
		const names = cadFilenames(fileName || "fieldbook");
		if (kind === "dxf") {
			downloadText(names.dxf, buildDxf({
				shots,
				chains
			}), "application/dxf;charset=utf-8");
			toast.success(names.dxf);
		} else {
			const job = useJobs.getState().jobs.find((j) => j.id === useJobs.getState().activeId);
			downloadText(names.xml, buildLandXml({
				shots,
				chains,
				remaps,
				project: job?.name || fileName || "survey",
				crs: job?.crs || "Indiana InGCS — NAD 1983 (2011)"
			}), "application/xml;charset=utf-8");
			toast.success(names.xml);
		}
		setExportOpen(false);
	}
	function copyLabels() {
		if (!shots.length) return;
		const tmpl = templateOf(templateId);
		const lines = shots.map((s) => {
			const f = resolveFeature(s, remaps);
			return `${s.point},${applyTemplate(s, f, tmpl)}`;
		});
		navigator.clipboard.writeText(lines.join("\n"));
		toast.success("Copied point labels");
	}
	function processBook() {
		const chains = buildChains(shots, remaps);
		toast.success(`Processed ${shots.length} points · ${chains.length} linear strings`);
		useBook.getState().setRightTab("linear");
	}
	function doExtractAll() {
		const n = extractAll();
		if (!n) toast.message("Nothing new to extract — field-to-finish strings already on the extract layer.");
		else toast.success(`Extracted ${n} linear feature${n === 1 ? "" : "s"}`);
	}
	function packageOrd() {
		if (!shots.length && !userLines.length) {
			toast.error("No points to package");
			return;
		}
		const st = useJobs.getState();
		const job = st.jobs.find((j) => j.id === st.activeId);
		const pack = buildOrdPackage({
			stem: fileName || job?.des || "fieldbook",
			shots,
			remaps,
			userLines,
			order,
			template: templateOf(templateId),
			job,
			fileName: fileName || ""
		});
		downloadBlob(pack.filename, pack.blob);
		toast.success(pack.filename);
		setExportOpen(false);
	}
	function reportBook() {
		const job = useJobs.getState().jobs.find((j) => j.id === useJobs.getState().activeId);
		const chains = allChains(shots, remaps, userLines).map((c) => ({
			code: c.code,
			n: c.shots.length || c.pts?.length || 0,
			length: polylineLength(chainVertices(c)),
			closed: c.closed,
			source: c.source
		}));
		const qa = runQa(shots, remaps, userLines, useBook.getState().skipped);
		const text = buildFieldbookReport({
			jobName: job?.name || fileName || "Field book",
			fileName: fileName || "",
			shots,
			remaps,
			survey: useBook.getState().survey,
			chains,
			extracts: userLines.length,
			qa
		});
		downloadText(`${(fileName || "fieldbook").replace(/\.[^.]+$/, "")}_report.txt`, text, "text/plain;charset=utf-8");
		toast.success("Field book report");
		setExportOpen(false);
	}
	const accept = ".csv,.txt,.asc,.xyz,.pnezd,.penzd,.fbk,.rw5,.raw,.gsi,.jxl,.dc";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-ribbon",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-nowrap items-center gap-0.5 overflow-x-auto px-2 py-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					multiple: true,
					accept,
					className: "sr-only",
					onChange: (e) => {
						onOpenFiles?.(e.target.files);
						e.target.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: appendRef,
					type: "file",
					multiple: true,
					accept,
					className: "sr-only",
					onChange: (e) => {
						onAppendFiles?.(e.target.files);
						e.target.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: () => inputRef.current?.click(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {}),
					label: "Open"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: () => appendRef.current?.click(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlus2, {}),
					label: "Append"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: loadSample,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}),
					label: "Sample"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: clear,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, {}),
					label: "Clear"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: processBook,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}),
					label: "Process"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
					onClick: doExtractAll,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waypoints, {}),
					label: "Extract all"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open: exportOpen,
					onOpenChange: setExportOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RibbonBtn, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}),
							label: "Export"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Export" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "order",
										children: "Coordinate order"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
										id: "order",
										value: order,
										onChange: (e) => setOrder(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PNEZD",
											children: "PNEZD — Point, Northing, Easting, Z, Desc"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PENZD",
											children: "PENZD — Point, Easting, Northing, Z, Desc"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "tmpl",
										children: "Plan label"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
										id: "tmpl",
										value: templateId,
										onChange: (e) => setTemplate(e.target.value),
										children: TEMPLATES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: t.id,
											children: t.label
										}, t.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "kind",
										children: "Format"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
										id: "kind",
										value: exportKind,
										onChange: (e) => setExportKind(e.target.value),
										children: EXPORT_KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: k.id,
											children: k.label
										}, k.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											onClick: exportNow,
											disabled: !shots.length,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download CSV"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											onClick: () => exportCad("dxf"),
											disabled: !shots.length && !userLines.length,
											children: "DXF"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											onClick: () => exportCad("xml"),
											disabled: !shots.length && !userLines.length,
											children: "LandXML"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											onClick: copyLabels,
											disabled: !shots.length,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy labels"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											onClick: packageOrd,
											disabled: !shots.length && !userLines.length,
											children: "ORD package"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											onClick: reportBook,
											disabled: !shots.length,
											children: "Field book report"
										})
									]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "select",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, {}),
					label: "Element"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "move",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Move, {}),
					label: "Move"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "line",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spline, {}),
					label: "Line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "shape",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pentagon, {}),
					label: "Shape"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "place",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {}),
					label: "Point"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "recode",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, {}),
					label: "Recode"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "measure",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, {}),
					label: "Measure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "inverse",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, {}),
					label: "Inverse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "offset",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveHorizontal, {}),
					label: "Offset"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "join",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitMerge, {}),
					label: "Join"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
					id: "split",
					tool,
					setTool,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scissors, {}),
					label: "Split"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center",
					children: [
						["off", "Off"],
						["aerial", "Aerial"],
						["hybrid", "Hybrid"],
						["roads", "Roads"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setMapMode(id),
						className: cn("inline-flex h-9 items-center gap-1.5 px-2 text-xs font-medium", mapMode === id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
						children: [id === "hybrid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { className: "h-3.5 w-3.5" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: id === "hybrid" ? "" : "hidden md:inline",
							children: label
						})]
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: labelsOn,
					onClick: () => setLabelsOn(!labelsOn),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {}),
					label: "Labels"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: legendOn,
					onClick: () => setLegendOn(!legendOn),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {}),
					label: "Legend"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: tableOn,
					onClick: () => setTableOn(!tableOn),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, {}),
					label: "Control"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: contoursOn,
					onClick: () => setContoursOn(!contoursOn),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {}),
					label: "TIN"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: shotsOpen,
					onClick: () => setShotsOpen(!shotsOpen),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {}),
					label: "Book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: rightOpen && rightTab === "qa",
					onClick: () => setRightTab("qa"),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {}),
					label: "QA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: leftOpen,
					onClick: () => setLeftOpen(!leftOpen),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {}),
					label: "Codes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleBtn, {
					on: rightOpen,
					onClick: () => setRightOpen(!rightOpen),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelRight, {}),
					label: "Survey"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent",
					children: "Desk"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/codes",
					className: "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Library"
					})]
				})
			]
		})
	});
}
function RibbonBtn({ onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "ghost",
		size: "sm",
		className: "h-9 gap-1.5 px-2 text-xs",
		onClick,
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: label
		})]
	});
}
function ToggleBtn({ on, onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium", on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden md:inline",
			children: label
		})]
	});
}
function ToolBtn({ id, tool, setTool, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setTool(id),
		className: cn("inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium", tool === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden xl:inline",
			children: label
		})]
	});
}
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-px", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function SurveyExplorer() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const hiddenAlphas = useBook((s) => s.hiddenAlphas);
	const toggleAlpha = useBook((s) => s.toggleAlpha);
	const showAllAlphas = useBook((s) => s.showAllAlphas);
	const hideAllAlphas = useBook((s) => s.hideAllAlphas);
	const focusOn = useBook((s) => s.focusOn);
	const query = useBook((s) => s.query);
	const setQuery = useBook((s) => s.setQuery);
	const selectedUid = useBook((s) => s.selectedUid);
	const activeCode = useBook((s) => s.activeCode);
	const setActiveCode = useBook((s) => s.setActiveCode);
	const setSelected = useBook((s) => s.setSelected);
	const setTool = useBook((s) => s.setTool);
	const isolated = useBook((s) => s.isolated);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const s of shots) {
			const code = (s.codeToken || "(blank)").toUpperCase();
			const f = resolveFeature(s, remaps);
			const cur = map.get(code);
			if (cur) cur.n += 1;
			else map.set(code, {
				code,
				n: 1,
				cat: f?.cat ?? "Unmatched",
				desc: f?.desc || f?.name || "Unmatched",
				name: f?.name ?? "",
				unmatched: !f
			});
		}
		const rows = [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
		const q = query.trim().toUpperCase();
		const filtered = q ? rows.filter((r) => `${r.code} ${r.desc} ${r.name} ${r.cat}`.toUpperCase().includes(q)) : rows;
		const byCat = /* @__PURE__ */ new Map();
		for (const r of filtered) {
			const list = byCat.get(r.cat) ?? [];
			list.push(r);
			byCat.set(r.cat, list);
		}
		return {
			rows: filtered,
			byCat: [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0])),
			total: rows.length
		};
	}, [
		shots,
		remaps,
		query
	]);
	const selectedCode = shots.find((s) => s.uid === selectedUid)?.codeToken.toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-card text-card-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-3 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Feature definitions"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Filter",
					className: "h-8"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-7 px-2 text-xs",
						onClick: showAllAlphas,
						children: "Display all"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-7 px-2 text-xs",
						onClick: () => hideAllAlphas(groups.rows.map((r) => r.code)),
						children: "Hide all"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-1 py-1",
					children: [groups.byCat.map(([cat, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: cat
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: rows.map((r) => {
							const on = isolated ? isolated === r.code : !hiddenAlphas[r.code];
							const style = styleForCode(r.code, r.cat);
							const active = activeCode === r.code;
							const picked = selectedCode === r.code;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex w-full items-center gap-1 whitespace-nowrap rounded-sm px-1 py-0.5 text-xs", active ? "bg-level text-level-foreground" : picked ? "bg-accent" : "hover:bg-accent/70", !on && !active && "opacity-40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: on ? "Hide" : "Display",
										onClick: (e) => {
											e.stopPropagation();
											toggleAlpha(r.code);
										},
										className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-current",
										children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setActiveCode(r.code);
											const hit = shots.find((s) => s.codeToken.toUpperCase() === r.code);
											if (hit) setSelected(hit.uid);
										},
										onDoubleClick: () => focusOn(r.code),
										className: "flex min-w-0 flex-1 items-center gap-2 py-1 text-left",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-2 w-2 shrink-0 rounded-full",
												style: { background: r.unmatched ? "var(--color-destructive)" : style.color }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("font-mono font-medium", r.unmatched ? "text-destructive" : ""),
												children: r.code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 truncate opacity-70",
												children: r.desc
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono tabular-nums opacity-70",
												children: r.n
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: "Draw",
										onClick: () => {
											setActiveCode(r.code);
											setTool("line");
										},
										className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm opacity-70 hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
									})
								]
							}) }, r.code);
						}) })]
					}, cat)), !groups.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-6 text-center text-xs text-muted-foreground",
						children: "No codes in this job."
					}) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "border-t border-border px-3 py-1.5 font-mono text-[0.625rem] text-muted-foreground",
				children: [
					groups.total,
					" codes",
					activeCode ? ` · ${activeCode}` : ""
				]
			})
		]
	});
}
function LevelsPanel() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const hiddenAlphas = useBook((s) => s.hiddenAlphas);
	const frozenAlphas = useBook((s) => s.frozenAlphas);
	const toggleAlpha = useBook((s) => s.toggleAlpha);
	const toggleFrozen = useBook((s) => s.toggleFrozen);
	const focusOn = useBook((s) => s.focusOn);
	const isolate = useBook((s) => s.isolate);
	const isolated = useBook((s) => s.isolated);
	const selectedUid = useBook((s) => s.selectedUid);
	const setSelected = useBook((s) => s.setSelected);
	const setActiveCode = useBook((s) => s.setActiveCode);
	const [openCats, setOpenCats] = (0, import_react.useState)({});
	const levels = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const s of shots) {
			const f = resolveFeature(s, remaps);
			const name = f?.name ?? `UNMATCHED_${(s.codeToken || "BLANK").toUpperCase()}`;
			const cur = map.get(name);
			if (cur) cur.n += 1;
			else map.set(name, {
				name,
				cat: f?.cat ?? "Unmatched",
				code: (s.codeToken || "").toUpperCase(),
				n: 1,
				unmatched: !f
			});
		}
		const list = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
		const byCat = /* @__PURE__ */ new Map();
		for (const lv of list) {
			const arr = byCat.get(lv.cat) ?? [];
			arr.push(lv);
			byCat.set(lv.cat, arr);
		}
		return {
			list,
			byCat: [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0]))
		};
	}, [shots, remaps]);
	const selectedCode = shots.find((s) => s.uid === selectedUid)?.codeToken.toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-card text-card-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-3 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Level display"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[auto_auto_1fr_auto] gap-1 border-b border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-7 text-center",
						children: "On"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-7 text-center",
						children: "Frz"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Used" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: levels.byCat.map(([cat, rows]) => {
					const collapsed = openCats[cat] === false;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenCats((s) => ({
							...s,
							[cat]: s[cat] === false
						})),
						className: "flex w-full items-center px-3 py-1 text-left text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:bg-accent/50",
						children: [
							collapsed ? "▸" : "▾",
							" ",
							cat
						]
					}), collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: rows.map((lv) => {
						const on = isolated ? isolated === lv.code : !hiddenAlphas[lv.code];
						const frozen = Boolean(frozenAlphas[lv.code]);
						const active = selectedCode === lv.code;
						const color = lv.unmatched ? "var(--color-destructive)" : styleForCode(lv.code, lv.cat).color;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("grid grid-cols-[auto_auto_1fr_auto] items-center gap-1 whitespace-nowrap px-1 text-xs", active ? "bg-level text-level-foreground" : "hover:bg-accent/70", !on && !active && "opacity-40"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									title: on ? "Hide" : "Display",
									onClick: () => toggleAlpha(lv.code),
									className: "flex h-7 w-7 items-center justify-center",
									children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									title: frozen ? "Thaw" : "Freeze",
									onClick: () => toggleFrozen(lv.code),
									className: cn("flex h-7 w-7 items-center justify-center", frozen ? "text-primary" : "opacity-40"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setActiveCode(lv.code);
										const hit = shots.find((s) => s.codeToken.toUpperCase() === lv.code);
										if (hit) setSelected(hit.uid);
									},
									onDoubleClick: () => {
										isolate(lv.code);
										focusOn(lv.code);
									},
									className: "flex min-w-0 items-center gap-2 py-1.5 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2 w-2 shrink-0 rounded-full",
										style: { background: color }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-mono",
										children: lv.name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pr-2 font-mono tabular-nums text-muted-foreground",
									children: lv.n
								})
							]
						}) }, lv.name);
					}) })] }, cat);
				})
			})
		]
	});
}
function circumcircle(pts, a, b, c) {
	const ax = pts[a].e;
	const ay = pts[a].n;
	const bx = pts[b].e;
	const by = pts[b].n;
	const cx = pts[c].e;
	const cy = pts[c].n;
	const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
	if (Math.abs(d) < 1e-18) return null;
	const a2 = ax * ax + ay * ay;
	const b2 = bx * bx + by * by;
	const c2 = cx * cx + cy * cy;
	const e = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
	const n = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
	return {
		n,
		e,
		r2: (ax - e) ** 2 + (ay - n) ** 2
	};
}
function delaunay(pts) {
	if (pts.length < 3) return [];
	let minN = Infinity;
	let maxN = -Infinity;
	let minE = Infinity;
	let maxE = -Infinity;
	for (const p of pts) {
		if (p.n < minN) minN = p.n;
		if (p.n > maxN) maxN = p.n;
		if (p.e < minE) minE = p.e;
		if (p.e > maxE) maxE = p.e;
	}
	const d = Math.max(maxN - minN, maxE - minE, 1) * 20;
	const superPts = [
		{
			n: minN - d,
			e: minE - d,
			z: 0
		},
		{
			n: minN - d,
			e: maxE + d * 2,
			z: 0
		},
		{
			n: maxN + d * 2,
			e: minE - d,
			z: 0
		}
	];
	const all = pts.concat(superPts);
	let tris = [{
		a: pts.length,
		b: pts.length + 1,
		c: pts.length + 2
	}];
	for (let i = 0; i < pts.length; i++) {
		const bad = [];
		for (let t = 0; t < tris.length; t++) {
			const tri = tris[t];
			const cc = circumcircle(all, tri.a, tri.b, tri.c);
			if (!cc) continue;
			const dx = pts[i].e - cc.e;
			const dy = pts[i].n - cc.n;
			if (dx * dx + dy * dy <= cc.r2 + 1e-9) bad.push(t);
		}
		const edges = [];
		const pushEdge = (u, v) => {
			for (let k = 0; k < edges.length; k++) if (edges[k][0] === v && edges[k][1] === u || edges[k][0] === u && edges[k][1] === v) {
				edges.splice(k, 1);
				return;
			}
			edges.push([u, v]);
		};
		for (const t of bad) {
			const tri = tris[t];
			pushEdge(tri.a, tri.b);
			pushEdge(tri.b, tri.c);
			pushEdge(tri.c, tri.a);
		}
		const keep = tris.filter((_, idx) => !bad.includes(idx));
		for (const [u, v] of edges) keep.push({
			a: u,
			b: v,
			c: i
		});
		tris = keep;
	}
	return tris.filter((t) => t.a < pts.length && t.b < pts.length && t.c < pts.length);
}
function interp(a, b, z) {
	const dz = b.z - a.z;
	if (Math.abs(dz) < 1e-12) return null;
	const t = (z - a.z) / dz;
	if (t < -1e-9 || t > 1 + 1e-9) return null;
	const u = Math.max(0, Math.min(1, t));
	return {
		n: a.n + u * (b.n - a.n),
		e: a.e + u * (b.e - a.e)
	};
}
function buildContours(pts, tris, interval) {
	if (!pts.length || !tris.length || interval <= 0) return [];
	let zmin = Infinity;
	let zmax = -Infinity;
	for (const p of pts) {
		if (p.z < zmin) zmin = p.z;
		if (p.z > zmax) zmax = p.z;
	}
	const start = Math.ceil((zmin + 1e-6) / interval) * interval;
	const out = [];
	for (let z = start; z <= zmax + 1e-6; z += interval) {
		const index = Math.abs(z / (interval * 5) - Math.round(z / (interval * 5))) < 1e-6;
		for (const t of tris) {
			const A = pts[t.a];
			const B = pts[t.b];
			const C = pts[t.c];
			const hits = [];
			const ab = interp(A, B, z);
			const bc = interp(B, C, z);
			const ca = interp(C, A, z);
			if (ab) hits.push(ab);
			if (bc) hits.push(bc);
			if (ca) hits.push(ca);
			if (hits.length === 2) out.push({
				z,
				index,
				pts: [hits[0], hits[1]]
			});
		}
	}
	return out;
}
var POINT_ONLY = /* @__PURE__ */ new Set(["Point"]);
var SKIP_CAT = /* @__PURE__ */ new Set([
	"Signs",
	"Signals",
	"Utilities",
	"Vegetation"
]);
function groundPoints(shots, remaps, extra = []) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (n, e, z) => {
		const k = `${n.toFixed(3)}:${e.toFixed(3)}`;
		if (seen.has(k)) return;
		seen.add(k);
		out.push({
			n,
			e,
			z
		});
	};
	for (const s of shots) {
		const f = resolveFeature(s, remaps);
		const alpha = s.codeToken.toUpperCase();
		if (f?.attr && POINT_ONLY.has(f.attr) && f.cat !== "Survey Control") continue;
		if (f && SKIP_CAT.has(f.cat)) continue;
		if (alpha.startsWith("P") && alpha.length >= 3 && f?.attr === "Point") continue;
		if (!Number.isFinite(s.northing) || !Number.isFinite(s.easting) || !Number.isFinite(s.elevation)) continue;
		push(s.northing, s.easting, s.elevation);
	}
	for (const v of extra) push(v.n, v.e, v.z);
	return out;
}
function terrainFromBook(shots, remaps, userLines, interval) {
	const extra = [];
	for (const l of userLines) extra.push(...l.pts);
	const pts = groundPoints(shots, remaps, extra);
	const capped = pts.length > 2200 ? thin(pts, 2200) : pts;
	const tris = delaunay(capped);
	return {
		pts: capped,
		tris,
		contours: buildContours(capped, tris, interval)
	};
}
function thin(pts, max) {
	if (pts.length <= max) return pts;
	const step = pts.length / max;
	const out = [];
	for (let i = 0; i < max; i++) out.push(pts[Math.floor(i * step)]);
	return out;
}
var TABS = [
	{
		id: "levels",
		label: "Levels"
	},
	{
		id: "linear",
		label: "Linear"
	},
	{
		id: "terrain",
		label: "TIN"
	},
	{
		id: "cogo",
		label: "COGO"
	},
	{
		id: "qa",
		label: "QA"
	},
	{
		id: "details",
		label: "Book"
	}
];
function SurveyDock() {
	const tab = useBook((s) => s.rightTab);
	const setRightTab = useBook((s) => s.setRightTab);
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const userLines = useBook((s) => s.userLines);
	const skipped = useBook((s) => s.skipped);
	const qa = (0, import_react.useMemo)(() => runQa(shots, remaps, userLines, skipped), [
		shots,
		remaps,
		userLines,
		skipped
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-card text-card-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 border-b border-border",
			children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setRightTab(t.id),
				className: cn("flex-1 px-1 py-2 text-[0.6875rem] font-medium", tab === t.id ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"),
				children: [t.label, t.id === "qa" && qa.errors + qa.warns > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-0.5 font-mono text-[0.625rem] text-destructive",
					children: qa.errors + qa.warns
				}) : null]
			}, t.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 h-full flex-1 overflow-hidden",
			children: [
				tab === "levels" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelsPanel, {}) : null,
				tab === "linear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearPanel, {}) : null,
				tab === "terrain" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerrainPanel, {}) : null,
				tab === "cogo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CogoPanel, {}) : null,
				tab === "qa" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QaPanel, {}) : null,
				tab === "details" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailsPanel, {}) : null
			]
		})]
	});
}
function LinearPanel() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const userLines = useBook((s) => s.userLines);
	const selectedLineId = useBook((s) => s.selectedLineId);
	const setSelectedLine = useBook((s) => s.setSelectedLine);
	const setSelected = useBook((s) => s.setSelected);
	const focusOn = useBook((s) => s.focusOn);
	const setLineClosed = useBook((s) => s.setLineClosed);
	const reverseUserLine = useBook((s) => s.reverseUserLine);
	const closeSurveyChain = useBook((s) => s.closeSurveyChain);
	const deleteSelected = useBook((s) => s.deleteSelected);
	const setTool = useBook((s) => s.setTool);
	const setActiveCode = useBook((s) => s.setActiveCode);
	const extractAll = useBook((s) => s.extractAll);
	const extractChain = useBook((s) => s.extractChain);
	const offsetLine = useBook((s) => s.offsetLine);
	const surveyStringsOn = useBook((s) => s.surveyStringsOn);
	const setSurveyStringsOn = useBook((s) => s.setSurveyStringsOn);
	const chains = (0, import_react.useMemo)(() => buildChains(shots, remaps), [shots, remaps]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Linear features"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						onClick: () => {
							const n = extractAll();
							if (!n) toast.message("All field-to-finish strings are already extracted.");
							else toast.success(`Extracted ${n}`);
						},
						children: "Extract all"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "outline",
						onClick: () => setTool("line"),
						children: "Place line"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b border-border px-3 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: surveyStringsOn,
						onChange: (e) => setSurveyStringsOn(e.target.checked)
					}), "Show survey strings"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-[0.625rem] text-muted-foreground",
					children: [
						chains.length,
						" survey · ",
						userLines.length,
						" extract"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "flex flex-col",
					children: [chains.map((c) => {
						const len = lengthOf(chainVertices(c));
						const on = selectedLineId === c.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setSelectedLine(c.id);
								if (c.shots[0]) setSelected(c.shots[0].uid);
								focusOn(c.code);
								setActiveCode(c.code);
							},
							className: cn("flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent", on && "bg-accent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-medium",
								children: c.code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									c.shots.length,
									" vtx · ",
									len.toFixed(1),
									" ft",
									c.closed ? " · CLS" : ""
								]
							})]
						}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1 px-3 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
								onClick: () => closeSurveyChain(c.shots.map((s) => s.uid)),
								label: "Close CLS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
								onClick: () => {
									if (extractChain(c.id)) toast.success(`Extracted ${c.code}`);
									else toast.message("Already extracted");
								},
								label: "Extract"
							})]
						}) : null] }, c.id);
					}), userLines.map((l) => {
						const len = lengthOf(l.pts);
						const on = selectedLineId === l.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setSelectedLine(l.id);
								setActiveCode(l.code);
							},
							className: cn("flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent", on && "bg-accent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono font-medium",
								children: [l.code, " · extract"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									l.pts.length,
									" vtx · ",
									len.toFixed(1),
									" ft",
									l.closed ? " · CLS" : ""
								]
							})]
						}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1 px-3 pb-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => setLineClosed(l.id, !l.closed),
									label: l.closed ? "Open" : "Close"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => reverseUserLine(l.id),
									label: "Reverse"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => {
										if (offsetLine(l.id)) toast.success("Offset line");
									},
									label: "Offset"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => {
										useBook.getState().setTool("join");
										useBook.getState().setJoinPending(l.id);
										toast.message("Click the line to join");
									},
									label: "Join"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => {
										useBook.getState().setTool("split");
										toast.message("Click a vertex to split");
									},
									label: "Split"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
									onClick: () => {
										useBook.getState().setSelectedLine(l.id);
										deleteSelected();
									},
									label: "Delete"
								})
							]
						}) : null] }, l.id);
					})]
				}), !chains.length && !userLines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-8 text-center text-sm text-muted-foreground",
					children: "No strings yet. Process the field book, or Place Line on the shots."
				}) : null]
			})
		]
	});
}
function TerrainPanel() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const userLines = useBook((s) => s.userLines);
	const contoursOn = useBook((s) => s.contoursOn);
	const contourInterval = useBook((s) => s.contourInterval);
	const setContoursOn = useBook((s) => s.setContoursOn);
	const setContourInterval = useBook((s) => s.setContourInterval);
	const tin = (0, import_react.useMemo)(() => terrainFromBook(shots, remaps, userLines, contourInterval), [
		shots,
		remaps,
		userLines,
		contourInterval
	]);
	const zs = tin.pts.map((p) => p.z);
	const zmin = zs.length ? Math.min(...zs) : 0;
	const zmax = zs.length ? Math.max(...zs) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Terrain from survey"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "TIN from topo shots and breaklines — not LiDAR."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 px-3 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: contoursOn,
						onChange: (e) => setContoursOn(e.target.checked)
					}), "Display contours"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ci",
						children: "Contour interval (ft)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ci",
						type: "number",
						min: .1,
						step: .5,
						value: contourInterval,
						onChange: (e) => setContourInterval(Number(e.target.value) || 1)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-[0.6875rem] text-muted-foreground",
					children: [
						tin.pts.length,
						" ground pts · ",
						tin.tris.length,
						" triangles",
						zs.length ? ` · ${zmin.toFixed(2)} to ${zmax.toFixed(2)}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => setContoursOn(true),
					disabled: !tin.tris.length,
					children: "Build contours"
				})
			]
		})]
	});
}
function CogoPanel() {
	const shots = useBook((s) => s.shots);
	const selectedUid = useBook((s) => s.selectedUid);
	const selectedLineId = useBook((s) => s.selectedLineId);
	const userLines = useBook((s) => s.userLines);
	const remaps = useBook((s) => s.remaps);
	const measure = useBook((s) => s.measure);
	const cogo = useBook((s) => s.cogo);
	const offsetFt = useBook((s) => s.offsetFt);
	const setOffsetFt = useBook((s) => s.setOffsetFt);
	const setTool = useBook((s) => s.setTool);
	const offsetLine = useBook((s) => s.offsetLine);
	const selected = shots.find((s) => s.uid === selectedUid);
	const line = userLines.find((l) => l.id === selectedLineId);
	const chain = (0, import_react.useMemo)(() => buildChains(shots, remaps), [shots, remaps]).find((c) => c.id === selectedLineId);
	const inv = measure.length === 2 ? inverse({
		n: measure[0].n,
		e: measure[0].e,
		z: measure[0].z
	}, {
		n: measure[1].n,
		e: measure[1].e,
		z: measure[1].z
	}) : cogo?.kind === "inverse" ? cogo.inv : null;
	const verts = line ? line.pts : chain ? chainVertices(chain) : [];
	const area = verts.length >= 3 ? polygonArea(verts) : null;
	const sta = selected && verts.length >= 2 ? stationOffset(verts, {
		n: selected.northing,
		e: selected.easting,
		z: selected.elevation
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 px-3 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "COGO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
							onClick: () => setTool("inverse"),
							label: "Inverse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
							onClick: () => setTool("measure"),
							label: "Distance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
							onClick: () => setTool("join"),
							label: "Join"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
							onClick: () => setTool("split"),
							label: "Split"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiny, {
							onClick: () => {
								if (line && offsetLine(line.id)) toast.success(`Offset ${offsetFt} ft`);
								else toast.message("Select an extract line first");
							},
							label: "Offset"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "off",
						children: "Offset distance (ft)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "off",
						type: "number",
						step: .1,
						value: offsetFt,
						onChange: (e) => setOffsetFt(Number(e.target.value) || 0)
					})]
				}),
				inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-sans text-xs font-medium",
							children: "Inverse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1",
							children: inv.bearing
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Az ",
							inv.az.toFixed(4),
							"°"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Horiz ",
							inv.horiz.toFixed(3),
							" ft"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Slope ",
							inv.dist.toFixed(3),
							" ft"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"ΔN ",
							inv.dN.toFixed(3),
							" · ΔE ",
							inv.dE.toFixed(3),
							" · ΔZ ",
							inv.dZ.toFixed(3)
						] }),
						inv.gradePct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Grade ",
							inv.gradePct.toFixed(2),
							"%"
						] }) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Inverse: click two points (or Measure)."
				}),
				sta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-xs font-medium",
						children: "Station / offset"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [
							formatStation(sta.station),
							" · ",
							sta.offset >= 0 ? "RT" : "LT",
							" ",
							Math.abs(sta.offset).toFixed(2),
							" ft"
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Select a line and a point for station/offset."
				}),
				area && (line?.closed || chain?.closed || verts.length >= 3) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-sans text-xs font-medium",
							children: "Area"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1",
							children: [area.area.toFixed(1), " sq ft"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [(area.area / 43560).toFixed(4), " ac"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Perimeter ",
							area.perimeter.toFixed(2),
							" ft"
						] })
					]
				}) : null,
				line ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-[0.6875rem] text-muted-foreground",
					children: [
						line.code,
						" extract · ",
						polylineLength(line.pts).toFixed(2),
						" ft"
					]
				}) : null
			]
		})
	});
}
function QaPanel() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const userLines = useBook((s) => s.userLines);
	const skipped = useBook((s) => s.skipped);
	const setSelected = useBook((s) => s.setSelected);
	const setSelectedLine = useBook((s) => s.setSelectedLine);
	const focusOn = useBook((s) => s.focusOn);
	const setShotsOpen = useBook((s) => s.setShotsOpen);
	const setFilter = useBook((s) => s.setFilter);
	const setRightTab = useBook((s) => s.setRightTab);
	const extractAll = useBook((s) => s.extractAll);
	const qa = (0, import_react.useMemo)(() => runQa(shots, remaps, userLines, skipped), [
		shots,
		remaps,
		userLines,
		skipped
	]);
	function jump(issue) {
		if (issue.alpha) focusOn(issue.alpha);
		if (issue.lineId) setSelectedLine(issue.lineId);
		if (issue.shotUids[0]) {
			setSelected(issue.shotUids[0]);
			setShotsOpen(true);
		}
		if (issue.check === "unmatched") setFilter("unmatched");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Survey QA"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-mono text-[0.6875rem] text-muted-foreground",
					children: [
						qa.errors,
						" error · ",
						qa.warns,
						" warn · ",
						qa.infos,
						" info"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: !qa.issues.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-8 text-center text-sm text-ok",
					children: "Checklist clear. Ready for ORD package."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col",
					children: qa.issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => jump(issue),
						className: "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: issue.severity === "error" ? "bad" : issue.severity === "warn" ? "warn" : "default",
								children: issue.severity
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium",
								children: issue.title
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[0.6875rem] text-muted-foreground",
							children: issue.detail
						})]
					}) }, issue.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-1 border-t border-border px-3 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					className: "w-full",
					onClick: () => {
						const n = extractAll();
						toast.message(n ? `Extracted ${n}` : "Extract layer up to date");
						setRightTab("linear");
					},
					children: "Extract remaining"
				})
			})
		]
	});
}
function DetailsPanel() {
	const survey = useBook((s) => s.survey);
	const setSurvey = useBook((s) => s.setSurvey);
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const fileName = useBook((s) => s.fileName);
	const order = useBook((s) => s.order);
	const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
	const control = shots.filter((s) => {
		return resolveFeature(s, remaps)?.cat === "Survey Control" || [
			"PRE",
			"PBMK",
			"PMON",
			"TRAV",
			"PIDT"
		].includes(s.codeToken.toUpperCase());
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 px-3 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Field book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-[0.6875rem] text-muted-foreground",
					children: [
						fileName || "No book",
						" · ",
						order,
						" · ",
						shots.length,
						" pts · ",
						control.length,
						" control"
					]
				}),
				job ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						job.name,
						job.des ? ` · Des. ${job.des}` : "",
						job.county ? ` · ${job.county}` : ""
					]
				}) : null,
				survey.books?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "font-mono text-[0.6875rem] text-muted-foreground",
					children: survey.books.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						b.name,
						" · ",
						b.points,
						" pts"
					] }, b.name))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Crew",
					value: survey.crew,
					onChange: (v) => setSurvey({ crew: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Instrument",
					value: survey.instrument,
					onChange: (v) => setSurvey({ instrument: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Occupied",
					value: survey.occupied,
					onChange: (v) => setSurvey({ occupied: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Backsight",
					value: survey.backsight,
					onChange: (v) => setSurvey({ backsight: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "HI",
					value: survey.hi ?? "",
					onChange: (v) => setSurvey({ hi: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "HT",
					value: survey.ht ?? "",
					onChange: (v) => setSurvey({ ht: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Weather",
					value: survey.weather ?? "",
					onChange: (v) => setSurvey({ weather: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					value: survey.date,
					onChange: (v) => setSurvey({ date: v }),
					type: "date"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "sv-notes",
						children: "Field notes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "sv-notes",
						rows: 4,
						value: survey.notes,
						onChange: (e) => setSurvey({ notes: e.target.value }),
						className: "rounded-md border border-input bg-background px-3 py-2 text-sm"
					})]
				}),
				survey.observations?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium",
					children: "Observations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 max-h-40 overflow-auto font-mono text-[0.625rem] text-muted-foreground",
					children: survey.observations.slice(0, 80).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						o.kind,
						" ",
						o.point,
						o.occupied ? ` occ ${o.occupied}` : "",
						o.sd != null ? ` SD ${o.sd}` : "",
						o.description ? ` ${o.description}` : ""
					] }, o.id))
				})] }) : null
			]
		})
	});
}
function Field({ label, value, onChange, type = "text" }) {
	const id = `sv-${label.toLowerCase()}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id,
			type,
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function Tiny({ onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "rounded-sm border border-border px-2 py-0.5 text-[0.6875rem] hover:bg-background",
		children: label
	});
}
function lengthOf(pts) {
	let d = 0;
	for (let i = 1; i < pts.length; i++) d += dist2d(pts[i - 1], pts[i]);
	return d;
}
function nearestShot(n, e, shots, maxFt = 8) {
	let best = null;
	let bestD = maxFt;
	for (const s of shots) {
		const d = dist2d({
			northing: n,
			easting: e
		}, s);
		if (d < bestD) {
			bestD = d;
			best = s;
		}
	}
	return best;
}
function snapVertex(n, e, z, shots, maxFt = 8) {
	const hit = nearestShot(n, e, shots, maxFt);
	if (!hit) return {
		n,
		e,
		z
	};
	return {
		n: hit.northing,
		e: hit.easting,
		z: hit.elevation,
		uid: hit.uid
	};
}
function nearestElevation(n, e, shots, fallback = 0) {
	const hit = nearestShot(n, e, shots, 1e9);
	return hit ? hit.elevation : fallback;
}
var IMAGERY = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
var PLACES = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
var ROADS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
var STREETS = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
var MAP_MODES = [
	{
		id: "off",
		label: "Off"
	},
	{
		id: "aerial",
		label: "Aerial"
	},
	{
		id: "hybrid",
		label: "Hybrid"
	},
	{
		id: "roads",
		label: "Roads"
	}
];
function PlanMap() {
	const hostRef = (0, import_react.useRef)(null);
	const apiRef = (0, import_react.useRef)(null);
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const hiddenAlphas = useBook((s) => s.hiddenAlphas);
	const isolated = useBook((s) => s.isolated);
	const labelsOn = useBook((s) => s.labelsOn);
	const legendOn = useBook((s) => s.legendOn);
	const tableOn = useBook((s) => s.tableOn);
	const mapMode = useBook((s) => s.mapMode);
	const setMapMode = useBook((s) => s.setMapMode);
	const selectedUid = useBook((s) => s.selectedUid);
	const selectedLineId = useBook((s) => s.selectedLineId);
	const fileName = useBook((s) => s.fileName);
	const templateId = useBook((s) => s.templateId);
	const focusAlpha = useBook((s) => s.focusAlpha);
	const focusNonce = useBook((s) => s.focusNonce);
	const viewCmd = useBook((s) => s.viewCmd);
	const tool = useBook((s) => s.tool);
	const draft = useBook((s) => s.draft);
	const measure = useBook((s) => s.measure);
	const userLines = useBook((s) => s.userLines);
	const frozenAlphas = useBook((s) => s.frozenAlphas);
	const crsId = useBook((s) => s.crsId);
	const setCrsId = useBook((s) => s.setCrsId);
	const surveyStringsOn = useBook((s) => s.surveyStringsOn);
	const contoursOn = useBook((s) => s.contoursOn);
	const contourInterval = useBook((s) => s.contourInterval);
	const cogo = useBook((s) => s.cogo);
	const tmpl = templateOf(templateId);
	const [mapReady, setMapReady] = (0, import_react.useState)(0);
	const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
	const origin = (0, import_react.useMemo)(() => detectGeoOrigin(shots, {
		crsId,
		county: job?.county,
		crs: job?.crs
	}), [
		shots,
		crsId,
		job?.county,
		job?.crs
	]);
	const visible = (0, import_react.useMemo)(() => visibleShots({
		shots,
		hiddenAlphas,
		isolated
	}), [
		shots,
		hiddenAlphas,
		isolated
	]);
	const allSurveyChains = (0, import_react.useMemo)(() => buildChains(visible, remaps), [visible, remaps]);
	const surveyChains = surveyStringsOn ? allSurveyChains : [];
	const extractChains = (0, import_react.useMemo)(() => userLines.filter((l) => isolated ? l.code === isolated : !hiddenAlphas[l.code]).map((l) => userLineToChain(l, remaps)), [
		userLines,
		remaps,
		hiddenAlphas,
		isolated
	]);
	const chains = (0, import_react.useMemo)(() => [...surveyChains, ...extractChains], [surveyChains, extractChains]);
	const chained = (0, import_react.useMemo)(() => chainedShotIds(allSurveyChains), [allSurveyChains]);
	const pointShots = (0, import_react.useMemo)(() => visible.filter((s) => !chained.has(s.uid)), [visible, chained]);
	const controlShots = (0, import_react.useMemo)(() => shots.filter((s) => {
		return resolveFeature(s, remaps)?.cat === "Survey Control" || [
			"PRE",
			"PBMK",
			"PMON",
			"TRAV",
			"PIDT"
		].includes(s.codeToken.toUpperCase());
	}), [shots, remaps]);
	const selected = shots.find((s) => s.uid === selectedUid);
	const selectedFeat = selected ? resolveFeature(selected, remaps) : void 0;
	const selectedChain = chains.find((c) => c.id === selectedLineId) ?? chains.find((c) => c.shots.some((s) => s.uid === selectedUid));
	(0, import_react.useEffect)(() => {
		if (!hostRef.current) return;
		let dead = false;
		let ro = null;
		(async () => {
			const mod = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const L = mod.default ?? mod;
			if (dead || !hostRef.current) return;
			const map = L.map(hostRef.current, {
				zoomControl: false,
				attributionControl: true,
				minZoom: 4,
				maxZoom: 22,
				zoomSnap: .25
			}).setView([origin.lat, origin.lon], 17);
			L.control.zoom({ position: "bottomright" }).addTo(map);
			L.control.scale({
				imperial: true,
				metric: false,
				position: "bottomleft"
			}).addTo(map);
			const aerial = L.tileLayer(IMAGERY, {
				maxZoom: 22,
				maxNativeZoom: 19,
				attribution: "Esri"
			});
			const roads = L.tileLayer(ROADS, {
				maxZoom: 22,
				maxNativeZoom: 19,
				opacity: .95
			});
			const places = L.tileLayer(PLACES, {
				maxZoom: 22,
				maxNativeZoom: 19
			});
			const streets = L.tileLayer(STREETS, {
				maxZoom: 22,
				maxNativeZoom: 19,
				attribution: "Esri"
			});
			const lines = L.layerGroup().addTo(map);
			const verts = L.layerGroup().addTo(map);
			const points = L.layerGroup().addTo(map);
			const labels = L.layerGroup().addTo(map);
			const draftG = L.layerGroup().addTo(map);
			const tin = L.layerGroup().addTo(map);
			const locate = L.layerGroup().addTo(map);
			apiRef.current = {
				L,
				map,
				lines,
				points,
				labels,
				verts,
				draft: draftG,
				tin,
				aerial,
				places,
				roads,
				streets,
				locate
			};
			ro = new ResizeObserver(() => map.invalidateSize());
			ro.observe(hostRef.current);
			map.invalidateSize();
			setMapReady((n) => n + 1);
		})();
		return () => {
			dead = true;
			ro?.disconnect();
			apiRef.current?.map.remove();
			apiRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const { map, aerial, places, roads, streets } = api;
		const show = (layer, on) => {
			if (on) {
				if (!map.hasLayer(layer)) layer.addTo(map);
			} else if (map.hasLayer(layer)) map.removeLayer(layer);
		};
		show(streets, mapMode === "roads");
		show(aerial, mapMode === "aerial" || mapMode === "hybrid");
		show(roads, mapMode === "hybrid");
		show(places, mapMode === "hybrid");
		aerial.setZIndex(1);
		streets.setZIndex(1);
		roads.setZIndex(2);
		places.setZIndex(3);
	}, [mapMode, mapReady]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const { map } = api;
		const onMove = (ev) => {
			const ne = fromLatLon(ev.latlng.lat, ev.latlng.lng, origin);
			const snap = nearestShot(ne.n, ne.e, useBook.getState().shots, 8);
			useBook.getState().setCursor({
				n: snap?.northing ?? ne.n,
				e: snap?.easting ?? ne.e,
				z: snap?.elevation ?? nearestElevation(ne.n, ne.e, useBook.getState().shots, useBook.getState().cursor?.z ?? 0),
				lat: ev.latlng.lat,
				lon: ev.latlng.lng
			});
		};
		const onClick = (ev) => {
			const t = ev.originalEvent.target;
			if (t && (t.tagName === "path" || t.classList?.contains("leaflet-interactive") || t.classList?.contains("leaflet-marker-icon") || Boolean(t.closest?.(".leaflet-marker-icon")))) return;
			const st = useBook.getState();
			const ne = fromLatLon(ev.latlng.lat, ev.latlng.lng, origin);
			const z = nearestElevation(ne.n, ne.e, st.shots, st.cursor?.z ?? 0);
			const pt = snapVertex(ne.n, ne.e, z, st.shots, 8);
			if (st.tool === "line" || st.tool === "shape") {
				st.addDraft(pt);
				return;
			}
			if (st.tool === "place") {
				st.addShot(pt);
				return;
			}
			if (st.tool === "recode") {
				const hit = nearestShot(ne.n, ne.e, st.shots, 12);
				if (hit && st.activeCode) st.recodeShot(hit.uid, st.activeCode);
				return;
			}
			if (st.tool === "measure" || st.tool === "inverse") {
				const next = [...st.measure, pt].slice(-2);
				st.setMeasure(next);
				if (st.tool === "inverse" && next.length === 2) {
					st.setCogo({
						kind: "inverse",
						a: next[0],
						b: next[1],
						inv: inverse(next[0], next[1])
					});
					st.setRightTab("cogo");
				}
				return;
			}
			if (st.tool === "offset") {
				const line = st.userLines.find((l) => l.id === st.selectedLineId) ?? st.userLines[0];
				if (line && st.offsetLine(line.id)) toast.success(`Offset ${st.offsetFt} ft`);
				else toast.message("Select an extract line first");
				return;
			}
			if (st.tool === "split") {
				const line = st.userLines.find((l) => l.id === st.selectedLineId);
				if (!line) {
					toast.message("Select an extract line");
					return;
				}
				const idx = nearestVertexIndex(line.pts, pt.n, pt.e, 10);
				if (idx >= 0) {
					if (st.splitLineAt(line.id, idx)) toast.success("Split");
					else if (st.insertOnLine(line.id, pt.n, pt.e, pt.z)) toast.success("Vertex inserted");
				} else if (st.insertOnLine(line.id, pt.n, pt.e, pt.z)) toast.success("Vertex inserted");
				return;
			}
			if (st.tool === "select") {
				st.setSelected(null);
				st.setSelectedLine(null);
			}
		};
		const onDbl = (ev) => {
			ev.originalEvent.preventDefault();
			const st = useBook.getState();
			if (st.tool === "line" || st.tool === "shape") st.commitDraft();
		};
		const onCtx = (ev) => {
			ev.originalEvent.preventDefault();
			const st = useBook.getState();
			if (st.tool === "line" || st.tool === "shape") st.commitDraft();
		};
		if (tool === "line" || tool === "shape" || tool === "measure" || tool === "place" || tool === "inverse") map.doubleClickZoom.disable();
		else map.doubleClickZoom.enable();
		map.on("mousemove", onMove);
		map.on("click", onClick);
		map.on("dblclick", onDbl);
		map.on("contextmenu", onCtx);
		return () => {
			map.off("mousemove", onMove);
			map.off("click", onClick);
			map.off("dblclick", onDbl);
			map.off("contextmenu", onCtx);
		};
	}, [
		origin,
		mapReady,
		tool
	]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const { L, lines, points, labels, verts } = api;
		lines.clearLayers();
		points.clearLayers();
		labels.clearLayers();
		verts.clearLayers();
		if (!visible.length && !extractChains.length) return;
		const latlng = (n, e) => {
			const g = toLatLon(n, e, origin);
			return L.latLng(g.lat, g.lon);
		};
		const canvas = L.canvas({ padding: .5 });
		const clickShot = (uid) => {
			const st = useBook.getState();
			if (st.tool === "recode" && st.activeCode) {
				st.recodeShot(uid, st.activeCode);
				return;
			}
			st.setSelected(uid);
		};
		const drawChain = (chain) => {
			const vertsList = chainVertices(chain);
			if (vertsList.length < 2) return;
			const style = chainStyle(chain);
			const path = vertsList.map((v) => latlng(v.n, v.e));
			if (chain.closed && path.length) path.push(path[0]);
			const on = selectedChain?.id === chain.id;
			const halo = L.polyline(path, {
				color: on ? "#ffffff" : "#111111",
				weight: style.weight + (on ? 3 : 1.6),
				opacity: on ? .9 : .35,
				lineJoin: "round",
				lineCap: "round",
				interactive: false
			});
			const poly = L.polyline(path, {
				color: style.color,
				weight: on ? style.weight + .6 : style.weight,
				opacity: 1,
				dashArray: style.dash,
				lineJoin: "round",
				lineCap: "round"
			});
			poly.on("click", (e) => {
				L.DomEvent.stop(e);
				const st = useBook.getState();
				if (st.tool === "join" && chain.source === "extract") {
					if (st.joinPending && st.joinPending !== chain.id) {
						if (st.joinLines(st.joinPending, chain.id)) toast.success("Joined");
						else toast.message("Could not join");
					} else {
						st.setJoinPending(chain.id);
						st.setSelectedLine(chain.id);
						toast.message("Click the second line");
					}
					return;
				}
				if (st.tool === "offset" && chain.source === "extract") {
					if (st.offsetLine(chain.id)) toast.success(`Offset ${st.offsetFt} ft`);
					return;
				}
				useBook.getState().setSelectedLine(chain.id);
				if (chain.shots[0]) clickShot(chain.shots[0].uid);
			});
			const feat = chain.feature;
			poly.bindTooltip(`${chain.code}  ${feat?.desc || feat?.name || chain.code}<br/>N ${vertsList[0].n.toFixed(3)}  E ${vertsList[0].e.toFixed(3)}  Z ${vertsList[0].z.toFixed(2)}`, {
				sticky: true,
				opacity: .95,
				className: "ord-tip"
			});
			lines.addLayer(halo);
			lines.addLayer(poly);
			for (let vi = 0; vi < vertsList.length; vi++) {
				const v = vertsList[vi];
				const shot = v.uid ? chain.shots.find((s) => s.uid === v.uid) : void 0;
				const tip = shot ? `Pt ${shot.point}  ${shot.codeToken}<br/>N ${shot.northing.toFixed(4)}  E ${shot.easting.toFixed(4)}  Z ${shot.elevation.toFixed(2)}` : `N ${v.n.toFixed(4)}  E ${v.e.toFixed(4)}  Z ${v.z.toFixed(2)}`;
				const extractMove = chain.source === "extract" && tool === "move";
				const shotMove = tool === "move" && v.uid && !frozenAlphas[chain.code];
				if (extractMove || shotMove) {
					const icon = L.divIcon({
						className: "ord-icon",
						html: `<span class="ord-mark" style="color:${style.color}">${markSvg("circle", "#fff", 10)}</span>`,
						iconSize: [14, 14],
						iconAnchor: [7, 7]
					});
					const m = L.marker(latlng(v.n, v.e), {
						icon,
						draggable: true,
						zIndexOffset: 500
					});
					m.on("click", () => {
						const st = useBook.getState();
						if (st.tool === "split" && chain.source === "extract") {
							if (st.splitLineAt(chain.id, vi)) toast.success("Split");
							return;
						}
						if (v.uid) clickShot(v.uid);
						st.setSelectedLine(chain.id);
					});
					m.on("dragend", () => {
						const ll = m.getLatLng();
						const ne = fromLatLon(ll.lat, ll.lng, origin);
						if (chain.source === "extract") {
							const line = useBook.getState().userLines.find((l) => l.id === chain.id);
							if (!line) return;
							const pts = line.pts.map((p, i) => i === vi ? {
								...p,
								n: ne.n,
								e: ne.e
							} : p);
							useBook.getState().updateUserLine(chain.id, pts);
						} else if (v.uid) useBook.getState().moveShot(v.uid, ne.n, ne.e);
					});
					m.bindTooltip(tip, {
						direction: "top",
						offset: [0, -8],
						className: "ord-tip"
					});
					verts.addLayer(m);
				} else {
					const mk = L.circleMarker(latlng(v.n, v.e), {
						renderer: canvas,
						radius: on ? 3.2 : 1.7,
						color: style.color,
						weight: 1,
						fillColor: on ? "#fff" : style.color,
						fillOpacity: 1
					});
					if (v.uid) mk.on("click", (e) => {
						L.DomEvent.stop(e);
						clickShot(v.uid);
					});
					mk.bindTooltip(tip, {
						direction: "top",
						offset: [0, -6],
						className: "ord-tip"
					});
					verts.addLayer(mk);
				}
			}
		};
		for (const chain of chains) drawChain(chain);
		for (const s of pointShots) {
			const f = resolveFeature(s, remaps);
			const style = styleForCode(s.codeToken, f?.cat);
			const on = s.uid === selectedUid;
			const html = `<span class="ord-mark ${on ? "is-on" : ""}" style="color:${style.color}">${markSvg(style.mark, on ? "#fff" : style.color, on ? 16 : 12)}</span>`;
			const icon = L.divIcon({
				className: "ord-icon",
				html,
				iconSize: [18, 18],
				iconAnchor: [9, 9]
			});
			const m = L.marker(latlng(s.northing, s.easting), {
				icon,
				zIndexOffset: on ? 600 : 0,
				draggable: tool === "move" && !frozenAlphas[s.codeToken.toUpperCase()]
			});
			m.on("click", () => clickShot(s.uid));
			m.on("dragend", () => {
				const ll = m.getLatLng();
				const ne = fromLatLon(ll.lat, ll.lng, origin);
				useBook.getState().moveShot(s.uid, ne.n, ne.e);
			});
			const title = f ? `${s.codeToken} — ${f.desc || f.name}` : `${s.codeToken} unmatched`;
			m.bindTooltip(`Pt ${s.point}  ${title}<br/>N ${s.northing.toFixed(4)}  E ${s.easting.toFixed(4)}  Z ${s.elevation.toFixed(2)}`, {
				direction: "top",
				offset: [0, -8],
				className: "ord-tip"
			});
			points.addLayer(m);
		}
		if (labelsOn) {
			const labeled = /* @__PURE__ */ new Set();
			const labelShot = (s, text, extra = "") => {
				if (labeled.has(s.uid)) return;
				labeled.add(s.uid);
				const icon = L.divIcon({
					className: "ord-label",
					html: `<span class="${extra}">${escapeHtml(text)}</span>`,
					iconSize: [0, 0],
					iconAnchor: [-8, 8]
				});
				labels.addLayer(L.marker(latlng(s.northing, s.easting), {
					icon,
					interactive: false,
					zIndexOffset: 400
				}));
			};
			for (const s of controlShots) {
				if (hiddenAlphas[s.codeToken.toUpperCase()]) continue;
				if (isolated && isolated !== s.codeToken.toUpperCase()) continue;
				labelShot(s, `${s.point}  ${s.codeToken}  ${s.elevation.toFixed(2)}`, "is-ctrl");
			}
			for (const s of pointShots) {
				if (resolveFeature(s, remaps)?.cat === "Survey Control") continue;
				if (s.codeToken.toUpperCase() === "PELV") continue;
				labelShot(s, `${s.point}  ${s.codeToken}`);
			}
			for (const chain of chains) {
				const first = chain.shots[0];
				const last = chain.shots[chain.shots.length - 1];
				if (first) labelShot(first, `${first.point}  ${first.codeToken}`);
				if (last) labelShot(last, `${last.point}  ${last.codeToken}`);
			}
		}
		if (selected) L.circleMarker(latlng(selected.northing, selected.easting), {
			radius: 10,
			color: "#fff",
			weight: 2,
			fillOpacity: 0
		}).addTo(points);
	}, [
		visible,
		chains,
		pointShots,
		remaps,
		labelsOn,
		selectedUid,
		selected,
		selectedChain,
		origin,
		hiddenAlphas,
		controlShots,
		mapReady,
		tool,
		frozenAlphas,
		extractChains.length,
		isolated
	]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const { L, draft: g } = api;
		g.clearLayers();
		const latlng = (n, e) => {
			const p = toLatLon(n, e, origin);
			return L.latLng(p.lat, p.lon);
		};
		if (draft.length) {
			const path = draft.map((v) => latlng(v.n, v.e));
			const code = useBook.getState().activeCode ?? "EP";
			const style = styleForCode(code, lookupCode(code)?.cat);
			if (useBook.getState().tool === "shape" && path.length > 2) L.polygon(path, {
				color: style.color,
				weight: 2.6,
				dashArray: "5 4",
				fillOpacity: .08
			}).addTo(g);
			else L.polyline(path, {
				color: style.color,
				weight: 2.6,
				dashArray: "5 4"
			}).addTo(g);
			for (const v of draft) L.circleMarker(latlng(v.n, v.e), {
				radius: 3.5,
				color: "#fff",
				weight: 1,
				fillColor: style.color,
				fillOpacity: 1
			}).addTo(g);
		}
		if (measure.length) {
			const path = measure.map((v) => latlng(v.n, v.e));
			L.polyline(path, {
				color: "#ffe14a",
				weight: 2,
				dashArray: "4 3"
			}).addTo(g);
			for (const v of measure) L.circleMarker(latlng(v.n, v.e), {
				radius: 4,
				color: "#ffe14a",
				fillColor: "#ffe14a",
				fillOpacity: 1,
				weight: 1
			}).addTo(g);
		}
	}, [
		draft,
		measure,
		origin,
		mapReady
	]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const { L, tin } = api;
		tin.clearLayers();
		if (!contoursOn) return;
		const built = terrainFromBook(shots, remaps, userLines, contourInterval);
		const latlng = (n, e) => {
			const p = toLatLon(n, e, origin);
			return L.latLng(p.lat, p.lon);
		};
		for (const ring of built.contours) {
			if (ring.pts.length < 2) continue;
			L.polyline(ring.pts.map((p) => latlng(p.n, p.e)), {
				color: ring.index ? "#e8d9a8" : "#c4b896",
				weight: ring.index ? 1.6 : .8,
				opacity: ring.index ? .9 : .65,
				interactive: false
			}).addTo(tin);
		}
	}, [
		contoursOn,
		contourInterval,
		shots,
		remaps,
		userLines,
		origin,
		mapReady
	]);
	const fittedFor = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api) return;
		const key = [
			fileName,
			shots.length,
			origin.id,
			origin.kind,
			origin.lat.toFixed(6),
			origin.lon.toFixed(6)
		].join(":");
		if (fittedFor.current === key) return;
		const { L, map } = api;
		const pts = (visible.length ? visible : shots).map((s) => {
			const g = toLatLon(s.northing, s.easting, origin);
			return L.latLng(g.lat, g.lon);
		});
		if (!pts.length) return;
		fittedFor.current = key;
		map.fitBounds(L.latLngBounds(pts).pad(.08), {
			animate: false,
			maxZoom: 18
		});
	}, [
		visible,
		shots,
		fileName,
		origin,
		mapReady
	]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api || !focusAlpha) return;
		const { L, map } = api;
		const subset = shots.filter((s) => s.codeToken.toUpperCase() === focusAlpha.toUpperCase());
		if (!subset.length) return;
		const pts = subset.map((s) => {
			const g = toLatLon(s.northing, s.easting, origin);
			return L.latLng(g.lat, g.lon);
		});
		map.fitBounds(L.latLngBounds(pts).pad(.2), { maxZoom: 19 });
	}, [
		focusNonce,
		focusAlpha,
		shots,
		origin,
		mapReady
	]);
	(0, import_react.useEffect)(() => {
		const api = apiRef.current;
		if (!api || !viewCmd) return;
		const { L, map } = api;
		const book = useBook.getState();
		if (viewCmd.fit) {
			const pts = book.shots.map((s) => {
				const g = toLatLon(s.northing, s.easting, origin);
				return L.latLng(g.lat, g.lon);
			});
			if (!pts.length) return;
			map.fitBounds(L.latLngBounds(pts).pad(.08), { maxZoom: 18 });
			return;
		}
		if (viewCmd.n == null || viewCmd.e == null) return;
		const g = toLatLon(viewCmd.n, viewCmd.e, origin);
		const z = map.getZoom();
		map.setView(L.latLng(g.lat, g.lon), z < 18 ? 19 : z);
		api.locate.clearLayers();
		const ll = L.latLng(g.lat, g.lon);
		L.circleMarker(ll, {
			radius: 16,
			color: "#ffe14a",
			weight: 2,
			fillOpacity: 0
		}).addTo(api.locate);
		L.circleMarker(ll, {
			radius: 3,
			color: "#ffe14a",
			weight: 1,
			fillColor: "#ffe14a",
			fillOpacity: 1
		}).addTo(api.locate);
	}, [
		viewCmd,
		origin,
		mapReady
	]);
	const invHud = measure.length === 2 ? inverse(measure[0], measure[1]) : cogo?.kind === "inverse" ? cogo.inv : null;
	const selectedLine = userLines.find((l) => l.id === selectedLineId);
	const staHud = selected && selectedLine ? stationOffset(selectedLine.pts, {
		n: selected.northing,
		e: selected.easting,
		z: selected.elevation
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-full min-h-0 w-full overflow-hidden bg-cad", tool === "line" || tool === "shape" || tool === "measure" || tool === "place" || tool === "recode" || tool === "inverse" || tool === "offset" || tool === "join" || tool === "split" ? "cursor-crosshair" : ""),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ord-view-chrome pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-2 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-sm bg-card/90 px-2 py-0.5 font-mono text-[0.6875rem] text-foreground shadow-sm",
						children: "View 1 — Top"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto flex overflow-hidden rounded-sm bg-card/90 shadow-sm",
						children: MAP_MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMapMode(m.id),
							className: cn("h-7 px-2 font-mono text-[0.6875rem]", mapMode === m.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"),
							children: m.label
						}, m.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "pointer-events-auto flex min-w-0 max-w-[min(100%,22rem)] items-center gap-1 rounded-sm bg-card/90 px-1 py-0.5 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							"aria-label": "Coordinate system",
							className: "h-7 w-full border-0 bg-transparent py-0 font-mono text-[0.6875rem] shadow-none",
							value: crsId,
							onChange: (e) => setCrsId(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: "auto",
									children: ["Auto — ", CRS_OPTIONS.find((o) => o.id === origin.id)?.label ?? origin.crs]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
									label: "Statewide",
									children: CRS_OPTIONS.filter((o) => o.id === "sp-east" || o.id === "sp-west" || o.id === "utm16" || o.id === "geo").map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: o.id,
										children: o.label
									}, o.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
									label: "InGCS county (ftUS)",
									children: CRS_OPTIONS.filter((o) => o.id.startsWith("ingcs:")).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: o.id,
										children: o.label
									}, o.id))
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: hostRef,
				className: "ord-map h-full w-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NorthArrow, {}),
			legendOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetLegend, {}) : null,
			tableOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlTable, {
				shots: controlShots.length ? controlShots : shots.slice(0, 8),
				remaps,
				crs: origin.crs,
				unit: gridUnit(origin)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoordHud, {
				originCrs: origin.crs,
				unit: gridUnit(origin)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoordKeyin, { origin }),
			invHud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-1.5 font-mono text-xs shadow-md",
				children: [
					invHud.bearing,
					" · ",
					invHud.horiz.toFixed(2),
					" ft",
					invHud.dZ ? ` · ΔZ ${invHud.dZ.toFixed(2)}` : ""
				]
			}) : null,
			staHud && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute bottom-[4.5rem] left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-1 font-mono text-[0.6875rem] text-muted-foreground shadow-md",
				children: [
					formatStation(staHud.station),
					" · ",
					staHud.offset >= 0 ? "RT" : "LT",
					" ",
					Math.abs(staHud.offset).toFixed(2)
				]
			}) : null,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute bottom-8 left-1/2 z-20 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							"Pt ",
							selected.point,
							" · ",
							selected.codeToken,
							selectedFeat ? ` — ${selectedFeat.desc || selectedFeat.name}` : " — unmatched"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[0.6875rem] text-muted-foreground",
						children: [
							"N ",
							selected.northing.toFixed(4),
							" \xA0 E ",
							selected.easting.toFixed(4),
							" \xA0 Z ",
							selected.elevation.toFixed(2),
							" ",
							gridUnit(origin)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[0.6875rem] text-muted-foreground",
						children: [
							origin.crs,
							" · ",
							formatLatLon(toLatLon(selected.northing, selected.easting, origin).lat, toLatLon(selected.northing, selected.easting, origin).lon)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 font-mono text-[0.6875rem] text-muted-foreground",
						children: [applyTemplate(selected, selectedFeat, tmpl), selectedFeat ? ` · ${selectedFeat.name}` : ""]
					})
				]
			}) : null
		]
	});
}
function NorthArrow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute bottom-24 left-3 z-20 hidden sm:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: "54",
			height: "72",
			viewBox: "0 0 54 72",
			className: "drop-shadow-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "27",
					cy: "40",
					r: "18",
					fill: "none",
					stroke: "#f4f4f0",
					strokeWidth: "1.2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M27 8 L31 28 L27 24 L23 28 Z",
					fill: "#f4f4f0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M27 72 L31 52 L27 56 L23 52 Z",
					fill: "none",
					stroke: "#f4f4f0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M9 40 H45 M27 22 V58",
					stroke: "#f4f4f0",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "27",
					y: "18",
					textAnchor: "middle",
					fill: "#f4f4f0",
					fontSize: "10",
					fontFamily: "IBM Plex Mono, ui-monospace",
					children: "N"
				})
			]
		})
	});
}
function SheetLegend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ord-legend pointer-events-none absolute top-10 left-3 z-20 hidden max-h-[min(70%,28rem)] overflow-hidden md:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 font-mono text-xs font-semibold tracking-[0.2em] text-white",
			children: "LEGEND"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-0.5",
			children: SHEET_LEGEND.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex w-4 justify-center",
						dangerouslySetInnerHTML: { __html: markSvg(item.mark, item.color, 11) }
					}),
					item.linear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-px w-5",
						style: { background: item.color }
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[0.625rem] tracking-wide text-white",
						children: item.label
					})
				]
			}, item.id))
		})]
	});
}
function ControlTable({ shots, remaps, crs, unit }) {
	if (!shots.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute top-10 right-3 z-20 hidden max-w-[min(100%-2rem,36rem)] overflow-hidden rounded-sm border border-foreground/40 bg-card/95 text-foreground shadow-md md:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "border-b border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wide",
			children: [
				crs,
				" · ",
				unit
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse font-mono text-[0.625rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 font-medium",
						children: "Point"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 font-medium",
						children: "Northing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 font-medium",
						children: "Easting"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 font-medium",
						children: "Elevation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 font-medium",
						children: "Code"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shots.slice(0, 8).map((s) => {
				const f = resolveFeature(s, remaps);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-0.5",
							children: s.point
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-0.5",
							children: s.northing.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-0.5",
							children: s.easting.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-0.5",
							children: s.elevation.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-0.5",
							children: s.codeToken || f?.seed || ""
						})
					]
				}, s.uid);
			}) })]
		})]
	});
}
function CoordKeyin({ origin }) {
	const order = useBook((s) => s.order);
	const activeCode = useBook((s) => s.activeCode);
	const [pt, setPt] = (0, import_react.useState)("");
	const [n, setN] = (0, import_react.useState)("");
	const [e, setE] = (0, import_react.useState)("");
	const [z, setZ] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	function resolve() {
		if (e.trim()) {
			const nn = Number(n);
			const ee = Number(e);
			const zz = z.trim() ? Number(z) : useBook.getState().cursor?.z ?? 0;
			if (!Number.isFinite(nn) || !Number.isFinite(ee) || !Number.isFinite(zz)) return null;
			return {
				n: nn,
				e: ee,
				z: zz,
				code: code.trim() || void 0,
				point: pt.trim() || void 0,
				geographic: false
			};
		}
		const blob = [
			pt,
			n,
			z,
			code
		].map((s) => s.trim()).filter(Boolean).join(" ");
		const parsed = parseCoordinateKeyin(blob || n, order);
		if (!parsed) return null;
		if (!parsed.geographic) return parsed;
		const g = fromLatLon(parsed.n, parsed.e, origin);
		return {
			...parsed,
			n: g.n,
			e: g.e,
			geographic: false
		};
	}
	function go(place) {
		const hit = resolve();
		if (!hit) {
			toast.error("Enter northing and easting");
			return;
		}
		const ll = toLatLon(hit.n, hit.e, origin);
		const st = useBook.getState();
		st.setCursor({
			n: hit.n,
			e: hit.e,
			z: hit.z,
			lat: ll.lat,
			lon: ll.lon
		});
		if (place) {
			const alpha = (hit.code || code || activeCode || "EP").toUpperCase();
			st.addShot({
				n: hit.n,
				e: hit.e,
				z: hit.z
			}, alpha);
			if (hit.point) {
				const uid = useBook.getState().selectedUid;
				if (uid) st.updateShot(uid, { point: hit.point });
			}
		}
		st.locate(hit.n, hit.e);
	}
	function readCursor() {
		const c = useBook.getState().cursor;
		if (!c) return;
		setN(c.n.toFixed(4));
		setE(c.e.toFixed(4));
		setZ(c.z.toFixed(2));
	}
	const preview = (() => {
		const hit = e.trim() && n.trim() ? resolve() : null;
		if (!hit) return null;
		const ll = toLatLon(hit.n, hit.e, origin);
		return formatLatLon(ll.lat, ll.lon);
	})();
	const field = "h-7 w-[6.75rem] rounded-sm border border-input bg-card px-1.5 font-mono text-[0.6875rem] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "pointer-events-auto absolute bottom-8 left-2 z-30 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-1 rounded-sm border border-border bg-card/95 p-1 shadow-md",
		onSubmit: (ev) => {
			ev.preventDefault();
			go(false);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: cn(field, "w-14"),
				"aria-label": "Point",
				placeholder: "Pt",
				value: pt,
				onChange: (ev) => setPt(ev.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: field,
				"aria-label": "Northing",
				placeholder: "Northing",
				value: n,
				onChange: (ev) => setN(ev.target.value),
				onPaste: (ev) => {
					const text = ev.clipboardData.getData("text");
					if (!/[,;\s]/.test(text)) return;
					const parsed = parseCoordinateKeyin(text, order);
					if (!parsed) return;
					ev.preventDefault();
					const grid = parsed.geographic ? fromLatLon(parsed.n, parsed.e, origin) : parsed;
					if (parsed.point) setPt(parsed.point);
					setN((parsed.geographic ? grid.n : parsed.n).toFixed(4));
					setE((parsed.geographic ? grid.e : parsed.e).toFixed(4));
					setZ(parsed.z.toFixed(2));
					if (parsed.code) setCode(parsed.code);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: field,
				"aria-label": "Easting",
				placeholder: "Easting",
				value: e,
				onChange: (ev) => setE(ev.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: cn(field, "w-20"),
				"aria-label": "Elevation",
				placeholder: "Elev",
				value: z,
				onChange: (ev) => setZ(ev.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: cn(field, "w-16"),
				"aria-label": "Code",
				placeholder: activeCode || "Code",
				value: code,
				onChange: (ev) => setCode(ev.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "h-7 rounded-sm bg-secondary px-2 text-xs font-medium text-secondary-foreground",
				children: "Go"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-7 rounded-sm bg-primary px-2 text-xs font-medium text-primary-foreground",
				onClick: () => go(true),
				children: "Place"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-7 rounded-sm px-2 text-xs text-muted-foreground hover:bg-accent",
				onClick: readCursor,
				children: "Read"
			}),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-1 font-mono text-[0.625rem] text-muted-foreground",
				children: preview
			}) : null
		]
	});
}
function CoordHud({ originCrs, unit }) {
	const cursor = useBook((s) => s.cursor);
	if (!cursor) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center sm:flex",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-t-sm bg-card/90 px-3 py-1 font-mono text-[0.6875rem] text-foreground shadow-sm",
			children: originCrs
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center sm:flex",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "max-w-[calc(100%-2rem)] truncate rounded-t-sm bg-card/90 px-3 py-1 font-mono text-[0.6875rem] text-foreground shadow-sm",
			children: [
				"N ",
				cursor.n.toFixed(3),
				" \xA0 E ",
				cursor.e.toFixed(3),
				" \xA0 Z ",
				cursor.z.toFixed(2),
				" ",
				unit,
				cursor.lat != null && cursor.lon != null ? `  ·  ${formatLatLon(cursor.lat, cursor.lon)}` : "",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [" \xA0 ", originCrs]
				})
			]
		})
	});
}
function escapeHtml(s) {
	return s.replace(/[<>&"']/g, "");
}
function PointsTable() {
	const shots = useBook((s) => s.shots);
	const remaps = useBook((s) => s.remaps);
	const filter = useBook((s) => s.filter);
	const query = useBook((s) => s.query);
	const selectedUid = useBook((s) => s.selectedUid);
	const setSelected = useBook((s) => s.setSelected);
	const updateShot = useBook((s) => s.updateShot);
	const templateId = useBook((s) => s.templateId);
	const crsId = useBook((s) => s.crsId);
	const tmpl = templateOf(templateId);
	const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
	const userLines = useBook((s) => s.userLines);
	const origin = (0, import_react.useMemo)(() => detectGeoOrigin(shots, {
		crsId,
		county: job?.county,
		crs: job?.crs
	}), [
		shots,
		crsId,
		job?.county,
		job?.crs
	]);
	const align = (0, import_react.useMemo)(() => projectAlignment(shots, allChains(shots, remaps, userLines).map((c) => ({
		code: c.code,
		pts: chainVertices(c)
	}))), [
		shots,
		remaps,
		userLines
	]);
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toUpperCase();
		return shots.filter((s) => {
			const f = resolveFeature(s, remaps);
			const matched = Boolean(f);
			if (filter === "matched" && !matched) return false;
			if (filter === "unmatched" && matched) return false;
			if (!q) return true;
			return `${s.point} ${s.codeToken} ${s.description} ${f?.name ?? ""} ${f?.desc ?? ""} ${f?.cat ?? ""}`.toUpperCase().includes(q);
		});
	}, [
		shots,
		remaps,
		filter,
		query
	]);
	if (!shots.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-2 py-10 text-center text-sm text-muted-foreground",
		children: "Open a field book to list point, northing, easting, elevation, and code."
	});
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-2 py-10 text-center text-sm text-muted-foreground",
		children: "No shots match this filter."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[920px] border-collapse text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Pt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "N"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "E"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Z"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Sta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "Lat / Lon"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 pr-3 font-medium",
						children: "INDOT feature"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 font-medium",
						children: "Label"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((s) => {
				const f = resolveFeature(s, remaps);
				const selected = selectedUid === s.uid;
				const ll = toLatLon(s.northing, s.easting, origin);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					onClick: () => setSelected(s.uid),
					className: cn("cursor-pointer border-b border-border/70 transition-colors duration-[var(--motion-quick)]", selected ? "bg-accent" : "hover:bg-accent/60"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-20 bg-transparent font-mono text-sm",
								defaultValue: s.point,
								onBlur: (e) => updateShot(s.uid, { point: e.target.value }),
								onClick: (e) => e.stopPropagation()
							}) : s.point
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums text-muted-foreground",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-28 bg-transparent font-mono text-sm",
								defaultValue: s.northing.toFixed(4),
								onBlur: (e) => {
									const n = Number(e.target.value);
									if (Number.isFinite(n)) updateShot(s.uid, { northing: n });
								},
								onClick: (e) => e.stopPropagation()
							}) : s.northing.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums text-muted-foreground",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-28 bg-transparent font-mono text-sm",
								defaultValue: s.easting.toFixed(4),
								onBlur: (e) => {
									const n = Number(e.target.value);
									if (Number.isFinite(n)) updateShot(s.uid, { easting: n });
								},
								onClick: (e) => e.stopPropagation()
							}) : s.easting.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-20 bg-transparent font-mono text-sm",
								defaultValue: s.elevation.toFixed(2),
								onBlur: (e) => {
									const n = Number(e.target.value);
									if (Number.isFinite(n)) updateShot(s.uid, { elevation: n });
								},
								onClick: (e) => e.stopPropagation()
							}) : s.elevation.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums text-muted-foreground",
							children: (() => {
								const so = align ? stationOffset(align.pts, {
									n: s.northing,
									e: s.easting,
									z: s.elevation
								}) : null;
								return so ? formatStation(so.station) : "—";
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono tabular-nums text-muted-foreground",
							children: (() => {
								const so = align ? stationOffset(align.pts, {
									n: s.northing,
									e: s.easting,
									z: s.elevation
								}) : null;
								return so ? formatOffset(so.offset) : "—";
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-full bg-transparent font-mono text-xs",
								defaultValue: s.description,
								onBlur: (e) => updateShot(s.uid, { description: e.target.value }),
								onClick: (e) => e.stopPropagation()
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs font-medium",
									children: s.codeToken || "—"
								}), s.remainder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[0.6875rem] text-muted-foreground",
									children: s.remainder
								}) : null]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3 font-mono text-[0.6875rem] tabular-nums text-muted-foreground",
							children: formatLatLon(ll.lat, ll.lon)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3",
							children: f ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-medium",
										children: f.desc || f.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "ok",
										children: f.cat
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-mono text-[0.6875rem] text-muted-foreground",
									children: f.name
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "bad",
								children: "Unmatched"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 font-mono text-xs",
							children: applyTemplate(s, f, tmpl)
						})
					]
				}, s.uid);
			}) })]
		})
	});
}
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "start", sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-lg border border-border bg-card p-3 text-foreground shadow-md outline-none", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-card text-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b border-border px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-64 overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm text-muted-foreground",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
function FeaturePicker({ value, onChange, placeholder = "Map to INDOT code" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const selected = getFeature(value);
	const results = (0, import_react.useMemo)(() => searchFeatures(q, { kind: "survey" }).slice(0, 80), [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "min-w-0 max-w-full justify-between font-normal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate font-mono text-xs",
					children: selected ? `${selected.alphas[0] ?? "—"}  ${selected.name}` : placeholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "ml-2 h-3.5 w-3.5 shrink-0 opacity-50" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-80 p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, {
				shouldFilter: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
					placeholder: "Search alpha, name, description…",
					value: q,
					onValueChange: setQ
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No INDOT code matches." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Survey feature codes",
					children: results.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: f.id,
						onSelect: () => {
							onChange(f.id);
							setOpen(false);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("h-3.5 w-3.5", selected?.id === f.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureLine, { f })]
					}, f.id))
				})] })]
			})
		})]
	});
}
function FeatureLine({ f }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-baseline gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs font-medium",
				children: f.alphas[0] ?? "—"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-sm",
				children: f.desc || f.name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block truncate font-mono text-[0.6875rem] text-muted-foreground",
			children: f.name
		})]
	});
}
var SURVEY_NAME = /\.(csv|txt|asc|xyz|pnezd|penzd|fbk|rw5|raw|gsi|jxl|dc|job)$/i;
function isSurveyName(name) {
	return SURVEY_NAME.test(name);
}
async function ingestFiles(fileList, append = false) {
	const files = Array.from(fileList);
	const out = {
		errors: [],
		warnings: [],
		append
	};
	if (!files.length) {
		out.errors.push("No file selected");
		return out;
	}
	for (const file of files) {
		const name = file.name;
		try {
			if (/\.(las|laz)$/i.test(name)) {
				out.errors.push(`${name}: LiDAR is parked. Open a PNEZD / RW5 / FBK / CSV field book.`);
				continue;
			}
			if (isSurveyName(name) || /csv|text|plain|xml/.test(file.type) || !file.type) {
				const raw = await file.text();
				if (!/\d/.test(raw)) {
					out.errors.push(`${name}: empty file`);
					continue;
				}
				if (detectFieldbookFormat(raw, name) === "csv") out.csv = {
					raw,
					name
				};
				else {
					const book = parseFieldbook(raw, name);
					if (!book.shots.length) {
						out.errors.push(`${name}: no shots reduced`);
						continue;
					}
					out.csv = {
						raw,
						name
					};
					out.warnings.push(...book.warnings);
				}
			} else {
				const raw = await file.text();
				if (/\d{3,}[,\s]+\d{3,}/.test(raw)) out.csv = {
					raw,
					name
				};
				else out.errors.push(`${name}: use .csv / .rw5 / .fbk / .pnezd field book`);
			}
		} catch (err) {
			out.errors.push(`${name}: ${err instanceof Error ? err.message : "failed to read"}`);
		}
	}
	if (!out.csv && !out.errors.length) out.errors.push("Nothing loaded");
	return out;
}
var TOOL_PROMPT = {
	select: "Element Selection",
	move: "Move Element",
	line: "Place SmartLine",
	shape: "Place Shape",
	recode: "Recode Feature",
	place: "Place Point",
	measure: "Measure Distance",
	inverse: "Inverse — click two points",
	offset: "Offset — click an extract line",
	join: "Join — click two extract lines",
	split: "Split — click a vertex"
};
async function openSurveyFiles(fileList, append = false) {
	if (!fileList || fileList.length === 0) return;
	const result = await ingestFiles(fileList, append);
	const st = useBook.getState();
	if (result.csv) {
		if (append && st.shots.length) {
			const { added, warnings } = st.appendText(result.csv.raw, result.csv.name);
			toast.success(`Appended ${added} shots`);
			for (const w of warnings) toast.message(w);
		} else {
			st.loadText(result.csv.raw, result.csv.name);
			const n = useBook.getState().shots.length;
			const skip = useBook.getState().skipped;
			toast.success(`Loaded ${n} shots${skip ? ` · ${skip} skipped` : ""}`);
		}
	}
	for (const err of result.errors) toast.error(err);
	for (const w of result.warnings) toast.message(w);
}
function Workspace() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CadShell, {}) });
}
function CadShell() {
	const shots = useBook((s) => s.shots);
	const fileName = useBook((s) => s.fileName);
	const skipped = useBook((s) => s.skipped);
	const remaps = useBook((s) => s.remaps);
	const userLines = useBook((s) => s.userLines);
	const leftOpen = useBook((s) => s.leftOpen);
	const rightOpen = useBook((s) => s.rightOpen);
	const shotsOpen = useBook((s) => s.shotsOpen);
	const setLeftOpen = useBook((s) => s.setLeftOpen);
	const setRightOpen = useBook((s) => s.setRightOpen);
	const setRemap = useBook((s) => s.setRemap);
	const filter = useBook((s) => s.filter);
	const setFilter = useBook((s) => s.setFilter);
	const tool = useBook((s) => s.tool);
	const activeCode = useBook((s) => s.activeCode);
	const cursor = useBook((s) => s.cursor);
	const selectedUid = useBook((s) => s.selectedUid);
	const draft = useBook((s) => s.draft);
	const survey = useBook((s) => s.survey);
	const raw = useBook((s) => s.raw);
	const crsId = useBook((s) => s.crsId);
	const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
	const origin = (0, import_react.useMemo)(() => detectGeoOrigin(shots, {
		crsId,
		county: job?.county,
		crs: job?.crs
	}), [
		shots,
		crsId,
		job?.county,
		job?.crs
	]);
	const [remapOpen, setRemapOpen] = (0, import_react.useState)(false);
	const [isMd, setIsMd] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const codesRef = fn();
	const levelsRef = fn();
	const qa = (0, import_react.useMemo)(() => runQa(shots, remaps, userLines, skipped), [
		shots,
		remaps,
		userLines,
		skipped
	]);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		const sync = () => {
			setIsMd(mq.matches);
			if (!mq.matches) {
				useBook.getState().setLeftOpen(false);
				useBook.getState().setRightOpen(false);
			}
		};
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isMd) return;
		if (leftOpen) codesRef.current?.expand();
		else codesRef.current?.collapse();
	}, [
		leftOpen,
		isMd,
		codesRef
	]);
	(0, import_react.useEffect)(() => {
		if (!isMd) return;
		if (rightOpen) levelsRef.current?.expand();
		else levelsRef.current?.collapse();
	}, [
		rightOpen,
		isMd,
		levelsRef
	]);
	(0, import_react.useEffect)(() => {
		const onOpen = (e) => {
			const url = e.detail?.url;
			if (!url) return;
			(async () => {
				setBusy("Reading file…");
				try {
					const name = url.split("/").pop() || "file";
					if (/\.(las|laz)$/i.test(name)) {
						toast.error("LiDAR is parked. Open a PNEZD / CSV field book.");
						return;
					}
					const res = await fetch(url);
					if (!res.ok) throw new Error(`Could not read ${name}`);
					useBook.getState().loadText(await res.text(), name);
					toast.success(`Loaded ${useBook.getState().shots.length} shots`);
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Load failed");
				} finally {
					setBusy(null);
				}
			})();
		};
		window.addEventListener("breakline-open", onOpen);
		return () => window.removeEventListener("breakline-open", onOpen);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			const st = useBook.getState();
			if (e.key === "Escape") {
				st.cancelDraft();
				st.setTool("select");
				e.preventDefault();
			} else if (e.key === "Enter") {
				st.commitDraft();
				e.preventDefault();
			} else if (e.key === "Backspace" && st.draft.length) {
				st.undoDraft();
				e.preventDefault();
			} else if (e.key === "Delete") st.deleteSelected();
			else if (e.key === "v" || e.key === "V") st.setTool("select");
			else if (e.key === "m" || e.key === "M") st.setTool("move");
			else if (e.key === "l" || e.key === "L") st.setTool("line");
			else if (e.key === "s" || e.key === "S") st.setTool("shape");
			else if (e.key === "r" || e.key === "R") st.setTool("recode");
			else if (e.key === "p" || e.key === "P") st.setTool("place");
			else if (e.key === "i" || e.key === "I") st.setTool("inverse");
			else if (e.key === "j" || e.key === "J") st.setTool("join");
			else if (e.key === "q" || e.key === "Q") st.setRightTab("qa");
			else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
				document.getElementById("cad-keyin")?.focus();
				e.preventDefault();
			} else if ((e.key === "e" || e.key === "E") && (e.ctrlKey || e.metaKey)) {
				const n = st.extractAll();
				toast.success(n ? `Extracted ${n}` : "Extract layer up to date");
				e.preventDefault();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		const id = useJobs.getState().activeId;
		if (!id) return;
		const t = window.setTimeout(() => {
			const job = useJobs.getState().jobs.find((j) => j.id === id);
			if (!job) return;
			const book = useBook.getState();
			useJobs.getState().updateJob(id, {
				csvText: book.raw,
				csvName: book.fileName || job.csvName,
				remaps: book.remaps,
				userLines: book.userLines,
				coordOrder: book.order,
				survey: book.survey,
				files: book.fileName ? [{
					name: book.fileName,
					kind: "csv",
					size: book.raw.length
				}] : job.files
			});
		}, 900);
		return () => window.clearTimeout(t);
	}, [
		raw,
		remaps,
		userLines,
		fileName,
		survey,
		shots.length
	]);
	const stats = (0, import_react.useMemo)(() => {
		let matched = 0;
		const unmatchedCodes = /* @__PURE__ */ new Map();
		for (const s of shots) if (resolveFeature(s, remaps)) matched += 1;
		else {
			const k = (s.codeToken || "(blank)").toUpperCase();
			unmatchedCodes.set(k, (unmatchedCodes.get(k) ?? 0) + 1);
		}
		return {
			total: shots.length,
			matched,
			unmatched: shots.length - matched,
			unmatchedCodes: [...unmatchedCodes.entries()].sort((a, b) => b[1] - a[1])
		};
	}, [shots, remaps]);
	async function onFiles(files) {
		if (!files?.length) return;
		setBusy("Reading file…");
		try {
			await openSurveyFiles(files);
		} finally {
			setBusy(null);
		}
	}
	const align = (0, import_react.useMemo)(() => projectAlignment(shots, allChains(shots, remaps, userLines).map((c) => ({
		code: c.code,
		pts: chainVertices(c)
	}))), [
		shots,
		remaps,
		userLines
	]);
	const held = selectedUid ? shots.find((sh) => sh.uid === selectedUid) : void 0;
	const readout = cursor ?? (held ? {
		n: held.northing,
		e: held.easting,
		z: held.elevation
	} : null);
	const sta = readout && align ? stationOffset(align.pts, readout) : null;
	const feat = activeCode ? lookupCode(activeCode) : void 0;
	const prompt = `${TOOL_PROMPT[tool] ?? tool}${activeCode ? ` · ${activeCode}${feat ? "  " + (feat.desc || feat.name) : ""}` : ""}${draft.length ? ` · ${draft.length} vtx` : ""}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh min-h-0 flex-col overflow-hidden bg-background",
		onDragOver: (e) => e.preventDefault(),
		onDrop: (e) => {
			e.preventDefault();
			onFiles(e.dataTransfer.files);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleBar, { fileName }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ribbon, {
				onOpenFiles: onFiles,
				onAppendFiles: (files) => void openSurveyFiles(files, true)
			}),
			stats.unmatchedCodes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-b border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRemapOpen((v) => !v),
					className: "flex w-full items-center gap-2 px-3 py-1 text-left text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "bad",
							children: stats.unmatched
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "Unmatched"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-muted-foreground",
							children: stats.unmatchedCodes.map(([c]) => c).join("  ")
						})
					]
				}), remapOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-2 px-3 pb-2",
					children: stats.unmatchedCodes.map(([code, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs font-medium",
								children: code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "bad",
								children: n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturePicker, {
								value: remaps[code] ?? null,
								onChange: (id) => setRemap(code, id)
							})
						]
					}, code))
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
						orientation: "horizontal",
						className: "h-full",
						id: "cad-layout",
						children: [
							isMd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								id: "codes",
								panelRef: codesRef,
								defaultSize: 280,
								minSize: 240,
								maxSize: 560,
								collapsible: true,
								collapsedSize: 0,
								groupResizeBehavior: "preserve-pixel-size",
								className: "min-h-0 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyExplorer, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "cad-split" })] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								id: "view",
								minSize: "40%",
								className: "min-h-0 min-w-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex h-full min-h-0 flex-col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "min-h-0 flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanMap, {})
									}), shotsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "h-[min(38vh,18rem)] shrink-0 overflow-auto border-t border-border bg-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2 border-b border-border px-3 py-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium",
												children: "Field book"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex rounded-md border border-border p-0.5",
												children: [
													"all",
													"matched",
													"unmatched"
												].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setFilter(f),
													className: cn("rounded-sm px-2.5 py-1 text-xs font-medium capitalize", filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"),
													children: f
												}, f))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PointsTable, {})]
									}) : null]
								})
							}),
							isMd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "cad-split" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								id: "levels",
								panelRef: levelsRef,
								defaultSize: 280,
								minSize: 240,
								maxSize: 560,
								collapsible: true,
								collapsedSize: 0,
								groupResizeBehavior: "preserve-pixel-size",
								className: "min-h-0 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyDock, {})
							})] }) : null
						]
					}),
					leftOpen && !isMd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-30 bg-foreground/40",
						onClick: () => setLeftOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full w-[min(22rem,92vw)] bg-card shadow-lg",
							onClick: (e) => e.stopPropagation(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyExplorer, {})
						})
					}) : null,
					rightOpen && !isMd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-30 flex justify-end bg-foreground/40",
						onClick: () => setRightOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full w-[min(22rem,92vw)] bg-card shadow-lg",
							onClick: (e) => e.stopPropagation(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyDock, {})
						})
					}) : null,
					busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-40 flex items-center justify-center bg-background/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md border border-border bg-card px-4 py-2 text-sm",
							children: busy
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-ribbon px-2 py-1 font-mono text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyIn, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: prompt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-foreground",
						children: [stats.total, " pts"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ok",
						children: stats.matched
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: stats.unmatched ? "text-destructive" : "",
						children: [stats.unmatched, " um"]
					}),
					skipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [skipped, " skip"] }) : null,
					qa.errors + qa.warns > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "text-warn",
						onClick: () => useBook.getState().setRightTab("qa"),
						children: [
							"QA ",
							qa.errors,
							"/",
							qa.warns
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ok",
						children: "QA clear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-foreground",
						children: [
							"N ",
							readout ? readout.n.toFixed(3) : "—",
							" \xA0 E ",
							readout ? readout.e.toFixed(3) : "—",
							" \xA0 Z",
							" ",
							readout ? readout.z.toFixed(2) : "—",
							" ",
							gridUnit(origin)
						]
					}),
					cursor?.lat != null && cursor.lon != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden md:inline",
						children: formatLatLon(cursor.lat, cursor.lon)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden lg:inline",
						children: [
							align ? align.name : "STA",
							" ",
							sta ? formatStation(sta.station) : "—",
							" \xA0 ",
							sta ? formatOffset(sta.offset) : "—"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto hidden xl:inline",
						children: origin.crs
					})
				]
			})
		]
	});
}
function TitleBar({ fileName }) {
	const job = useJobs((s) => s.jobs.find((j) => j.id === s.activeId));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex shrink-0 items-center gap-3 border-b border-border bg-title px-3 py-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "truncate text-sm font-medium",
					children: [
						COMPANY.name,
						" · ",
						job?.name || (fileName ? fileName.replace(/\.(csv|txt)$/i, ".dgn") : "Extract")
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "hidden font-mono text-xs text-muted-foreground lg:inline",
				children: ["Des. ", job?.des || SR67_SITE.des]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, { compact: true })
		]
	});
}
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 16 16",
		className: "h-3.5 w-3.5",
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
	});
}
function ExtractPage() {
	const activeId = useJobs((s) => s.activeId);
	const jobs = useJobs((s) => s.jobs);
	const booted = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (booted.current) return;
		const job = jobs.find((j) => j.id === activeId) ?? (jobs.length === 1 ? jobs[0] : void 0);
		if (!job?.csvText) return;
		booted.current = true;
		const book = useBook.getState();
		const lines = job.userLines?.length ?? 0;
		if (book.raw !== job.csvText || book.userLines.length !== lines) loadJobBook(job);
	}, [activeId, jobs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workspace, {});
}
//#endregion
export { ExtractPage as component };
