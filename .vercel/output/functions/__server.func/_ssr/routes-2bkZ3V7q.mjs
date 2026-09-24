import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as COMPANY } from "./company-D0owGUeH.mjs";
import { a as TIME_LABEL, c as invoiceNumber, d as quoteJob, f as quoteLines, i as STATUS_LABEL, n as KIND_LABEL, r as PIPE, t as INVOICE_LABEL } from "./job-types-DRBj8xWf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn, r as downloadBlob } from "./router-pTBIT-ZP.mjs";
import { t as Button } from "./button-DcHiRd58.mjs";
import { S as useJobs } from "./label-CD5-qmOw.mjs";
import { t as FirmShell } from "./firm-shell-CmsCnRoe.mjs";
import { t as Badge } from "./badge-CgPzfXcT.mjs";
import { _ as templateOf, y as useBook } from "./store-Bj7SGyFp.mjs";
import { t as loadJobBook } from "./open-job-DCawJpH5.mjs";
import { i as rollupClients } from "./clients-W2zo-EWX.mjs";
import { c as printHtml, i as htmlSow, n as htmlInvoice, r as htmlProposal } from "./paper-CvbkfkFR.mjs";
import { t as Input } from "./input-DxUPs7fi.mjs";
import { t as NativeSelect } from "./native-select-C9RyDdPV.mjs";
import { t as Label } from "./label-BY4xM6qU.mjs";
import { t as JobForm } from "./job-form-BwdthcYs.mjs";
import { s as buildOrdPackage } from "./ord-package-BBsDP27j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-2bkZ3V7q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JobTicket({ job }) {
	const setStatus = useJobs((s) => s.setStatus);
	const setInvoice = useJobs((s) => s.setInvoice);
	const addTime = useJobs((s) => s.addTime);
	const updateJob = useJobs((s) => s.updateJob);
	const setActive = useJobs((s) => s.setActive);
	const addChangeOrder = useJobs((s) => s.addChangeOrder);
	const navigate = useNavigate();
	const money = quoteJob(job);
	const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);
	const lines = quoteLines(job);
	function openExtract() {
		setActive(job.id);
		loadJobBook(job);
		if (job.status === "intake") setStatus(job.id, "extract");
		navigate({ to: "/extract" });
		toast.success(`Opened ${job.des || job.name}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 border-t border-border pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1fr_16rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: job.notes || "No scope notes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketNotes, { job }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeLog, {
							job,
							onAdd: (e) => addTime(job.id, e)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeOrders, {
							job,
							onAdd: (co) => addChangeOrder(job.id, co)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border bg-background p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kicker",
									children: "Quote"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xl tabular-nums",
									children: ["$", money.toLocaleString("en-US")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 flex flex-col gap-1 font-mono text-[0.6875rem] text-muted-foreground",
									children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: l.desc
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Math.round(l.amount).toLocaleString("en-US")] })]
									}, `${l.desc}-${i}`))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-2 font-mono text-[0.6875rem]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									k: "PM",
									v: job.pm || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									k: "Hours logged",
									v: `${logged}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									k: "CRS",
									v: job.crs,
									span: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									k: "Invoice",
									v: `${invoiceNumber(job)} · ${INVOICE_LABEL[job.invoiceStatus]}`,
									span: true
								})
							]
						}),
						job.files.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "font-mono text-[0.6875rem] text-muted-foreground",
							children: job.files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f.name }, f.name))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No files logged. Drop a PNEZD on the job form."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: openExtract,
						children: "Extract"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/deliver",
							onClick: () => {
								setActive(job.id);
								loadJobBook(job);
							},
							children: "Package"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/billing",
							onClick: () => setActive(job.id),
							children: "Billing"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => printHtml(`Proposal ${job.des || job.name}`, htmlProposal(job)),
						children: "Proposal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => printHtml(`Work order ${job.des || job.name}`, htmlSow(job)),
						children: "Work order"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => printHtml(invoiceNumber(job), htmlInvoice(job)),
						children: "Invoice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						className: "h-8 w-40 text-xs",
						value: job.status,
						onChange: (e) => setStatus(job.id, e.target.value),
						children: PIPE.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: st,
							children: STATUS_LABEL[st]
						}, st))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						className: "h-8 w-36 text-xs",
						value: job.invoiceStatus,
						onChange: (e) => setInvoice(job.id, e.target.value),
						children: [
							"none",
							"draft",
							"sent",
							"paid"
						].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: st,
							children: INVOICE_LABEL[st]
						}, st))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: KIND_LABEL[job.kind]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "self-start text-xs text-muted-foreground underline-offset-2 hover:underline",
				onClick: () => updateJob(job.id, { status: "delivered" }),
				children: "Mark delivered"
			})
		]
	});
}
function TicketNotes({ job }) {
	const updateJob = useJobs((s) => s.updateJob);
	const [text, setText] = (0, import_react.useState)(job.ticket);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: `ticket-${job.id}`,
			children: "Ticket"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			id: `ticket-${job.id}`,
			rows: 3,
			value: text,
			onChange: (e) => setText(e.target.value),
			onBlur: () => {
				if (text !== job.ticket) updateJob(job.id, { ticket: text });
			},
			className: "rounded-md border border-input bg-background px-3 py-2 text-sm",
			placeholder: "Classification notes, hold points, remap decisions…"
		})]
	});
}
function TimeLog({ job, onAdd }) {
	const [kind, setKind] = (0, import_react.useState)("extract");
	const [hours, setHours] = (0, import_react.useState)("2");
	const [note, setNote] = (0, import_react.useState)("");
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	function submit(e) {
		e.preventDefault();
		const h = Number(hours);
		if (!h) {
			toast.error("Hours required");
			return;
		}
		onAdd({
			date: today,
			hours: h,
			kind,
			note: note.trim()
		});
		setNote("");
		toast.success("Time logged");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: "Time log"
		}),
		job.timeLog.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-col gap-1 font-mono text-xs",
			children: job.timeLog.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					t.date,
					" · ",
					TIME_LABEL[t.kind],
					" · ",
					t.hours,
					"h"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: t.note || "—"
				})]
			}, t.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "No hours yet."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "mt-3 grid gap-2 sm:grid-cols-[7rem_6rem_1fr_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `kind-${job.id}`,
						children: "Kind"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						id: `kind-${job.id}`,
						value: kind,
						onChange: (e) => setKind(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "extract",
								children: "Extract"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "qa",
								children: "QA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "office",
								children: "Office"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `hrs-${job.id}`,
						children: "Hours"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `hrs-${job.id}`,
						value: hours,
						onChange: (e) => setHours(e.target.value),
						inputMode: "decimal"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `note-${job.id}`,
						children: "Note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `note-${job.id}`,
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "EP through the intersection"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					children: "Log"
				})
			]
		})
	] });
}
function ChangeOrders({ job, onAdd }) {
	const [desc, setDesc] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	function submit(e) {
		e.preventDefault();
		const n = Number(amount);
		if (!desc.trim() || !Number.isFinite(n) || n === 0) {
			toast.error("Change order needs a description and amount");
			return;
		}
		onAdd({
			date: today,
			desc: desc.trim(),
			amount: n
		});
		setDesc("");
		setAmount("");
		toast.success("Change order on the quote");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: "Change orders"
		}),
		job.changeOrders?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-col gap-1 font-mono text-xs",
			children: job.changeOrders.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					c.date,
					" · ",
					c.desc
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", c.amount.toLocaleString("en-US")] })]
			}, c.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "No extras yet. Extra miles or tiles go here before the work starts."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `co-desc-${job.id}`,
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `co-desc-${job.id}`,
						value: desc,
						onChange: (e) => setDesc(e.target.value),
						placeholder: "Extra 0.2 mi south of limits"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `co-amt-${job.id}`,
						children: "Amount"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `co-amt-${job.id}`,
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						inputMode: "decimal"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					children: "Add CO"
				})
			]
		})
	] });
}
function Meta({ k, v, span }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: span ? "col-span-2 min-w-0" : "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate",
			children: v
		})]
	});
}
function Desk() {
	const jobs = useJobs((s) => s.jobs);
	const activeId = useJobs((s) => s.activeId);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const counts = PIPE.map((st) => ({
		st,
		n: jobs.filter((j) => j.status === st).length
	}));
	const openValue = jobs.filter((j) => j.status !== "delivered").reduce((a, j) => a + quoteJob(j), 0);
	const ar = jobs.filter((j) => j.invoiceStatus === "sent").reduce((a, j) => a + quoteJob(j), 0);
	const weekHours = jobs.reduce((a, j) => a + j.timeLog.reduce((x, t) => x + t.hours, 0), 0);
	const clients = rollupClients(jobs);
	const dueSoon = (0, import_react.useMemo)(() => dueBoard(jobs), [jobs]);
	const live = jobs.find((j) => j.id === activeId) ?? jobs[0];
	function packageLive() {
		const book = useBook.getState();
		if (!book.shots.length) {
			toast.error("No field book on the drawing");
			return;
		}
		const pack = buildOrdPackage({
			stem: book.fileName || live?.des || "fieldbook",
			shots: book.shots,
			remaps: book.remaps,
			userLines: book.userLines,
			order: book.order,
			template: templateOf(book.templateId),
			job: live,
			fileName: book.fileName || live?.des || "fieldbook"
		});
		downloadBlob(pack.filename, pack.blob);
		toast.success(pack.filename);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl",
						children: COMPANY.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [
							COMPANY.city,
							" · ",
							COMPANY.phone,
							live ? ` · Des. ${live.des}` : ""
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/extract",
							children: "Open drawing"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: packageLive,
						disabled: !live,
						children: "ORD package"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
				children: counts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: STATUS_LABEL[c.st]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xl tabular-nums",
						children: c.n
					})]
				}, c.st))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Open book",
						value: `$${openValue.toLocaleString("en-US")}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Open AR",
						value: `$${ar.toLocaleString("en-US")}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Hours logged",
						value: String(weekHours)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Clients",
						value: String(clients.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-medium",
					children: "Due"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: dueSoon.length ? dueSoon.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DueCard, { job }, job.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: "Nothing due in the next two weeks."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-[1fr_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-baseline justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-medium",
							children: "Register"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobRow, {
							job,
							active: job.id === activeId,
							expanded: job.id === openId,
							onToggle: () => setOpenId((id) => id === job.id ? null : job.id)
						}, job.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "This job"
						}), live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 flex flex-col gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Status",
									v: STATUS_LABEL[live.status]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "CRS",
									v: live.crs
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Occupied",
									v: live.survey?.occupied || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Backsight",
									v: live.survey?.backsight || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Instrument",
									v: live.survey?.instrument || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Book",
									v: live.csvName || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Invoice",
									v: INVOICE_LABEL[live.invoiceStatus]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									k: "Hours",
									v: String(live.timeLog.reduce((a, t) => a + t.hours, 0))
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "No job on the register."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "Clients"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-col gap-2",
								children: clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-baseline justify-between gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-muted-foreground",
										children: c.jobs.length
									})]
								}, c.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "mt-3",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/billing",
									children: "Billing"
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobForm, {
				kicker: "New job",
				title: "Add a job",
				blurb: ""
			})
		]
	});
}
function Fact({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate text-right font-mono text-xs",
			children: v
		})]
	});
}
function dueBoard(jobs) {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const horizon = /* @__PURE__ */ new Date();
	horizon.setDate(horizon.getDate() + 14);
	const hi = horizon.toISOString().slice(0, 10);
	return jobs.filter((j) => j.status !== "delivered" && j.due && j.due <= hi).sort((a, b) => {
		const ao = a.due < today ? 0 : 1;
		const bo = b.due < today ? 0 : 1;
		if (ao !== bo) return ao - bo;
		return a.due.localeCompare(b.due);
	});
}
function DueCard({ job }) {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const overdue = job.due < today;
	const setActive = useJobs((s) => s.setActive);
	const setStatus = useJobs((s) => s.setStatus);
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: overdue ? "bad" : job.rush ? "warn" : "outline",
					children: overdue ? "Overdue" : job.due
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: STATUS_LABEL[job.status]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium",
				children: job.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 font-mono text-[0.6875rem] text-muted-foreground",
				children: [
					job.client,
					" · $",
					quoteJob(job).toLocaleString("en-US")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-3",
				onClick: () => {
					setActive(job.id);
					loadJobBook(job);
					if (job.status === "intake") setStatus(job.id, "extract");
					navigate({ to: "/extract" });
					toast.success(`Opened ${job.des || job.name}`);
				},
				children: "Extract"
			})
		]
	});
}
function JobRow({ job, active, expanded, onToggle }) {
	const setActive = useJobs((s) => s.setActive);
	const setStatus = useJobs((s) => s.setStatus);
	const navigate = useNavigate();
	const money = quoteJob(job);
	const logged = job.timeLog.reduce((a, t) => a + t.hours, 0);
	function openExtract() {
		setActive(job.id);
		loadJobBook(job);
		if (job.status === "intake") setStatus(job.id, "extract");
		navigate({ to: "/extract" });
		toast.success(`Opened ${job.des || job.name}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("rounded-lg border bg-card p-4", active ? "border-primary" : "border-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onToggle,
				className: "min-w-0 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: job.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: job.status === "delivered" ? "ok" : job.status === "qa" ? "warn" : "outline",
								children: STATUS_LABEL[job.status]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "muted",
								children: KIND_LABEL[job.kind]
							}),
							job.rush ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "bad",
								children: "Rush"
							}) : null,
							job.invoiceStatus !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: INVOICE_LABEL[job.invoiceStatus]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-muted-foreground",
						children: [
							"Des. ",
							job.des || "—",
							" · ",
							job.client,
							" · ",
							job.county,
							" Co. · due ",
							job.due || "—",
							logged ? ` · ${logged}h` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: job.notes
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-start gap-2 sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm",
					children: ["$", money.toLocaleString("en-US")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: openExtract,
						children: "Extract"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onToggle,
						children: expanded ? "Close ticket" : "Ticket"
					})]
				})]
			})]
		}), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobTicket, { job }) : null]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "kicker",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-xl tabular-nums",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {}) });
}
//#endregion
export { Home as component };
