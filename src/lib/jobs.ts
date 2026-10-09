import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  invoiceNumber,
  nid,
  normalizeJob,
  tid,
  type ChangeOrder,
  type InvoiceStatus,
  type Job,
  type JobStatus,
  type LineItem,
  type TimeEntry,
} from "./job-types";
import { saveJob, deleteJob } from "./jobs-api";

export type {
  ChangeOrder,
  InvoiceStatus,
  Job,
  JobFile,
  JobKind,
  JobStatus,
  LineItem,
  LineItemKind,
  QuoteLine,
  SurveyMeta,
  TimeEntry,
  TimeKind,
} from "./job-types";
export {
  INVOICE_LABEL,
  KIND_LABEL,
  PIPE,
  STATUS_LABEL,
  TIME_LABEL,
  emptySurvey,
  invoiceNumber,
  quoteJob,
  quoteLines,
} from "./job-types";

type JobsState = {
  jobs: Job[];
  activeId: string | null;
  hydrated: boolean;
  replaceAll: (jobs: Job[]) => void;
  addJob: (
    job: Omit<Job, "id" | "createdAt" | "status" | "ticket" | "timeLog" | "invoiceStatus" | "changeOrders"> &
      Partial<Job>,
  ) => string;
  updateJob: (id: string, patch: Partial<Job>) => void;
  setActive: (id: string | null) => void;
  setStatus: (id: string, status: JobStatus) => void;
  addTime: (id: string, entry: Omit<TimeEntry, "id">) => void;
  setInvoice: (id: string, status: InvoiceStatus) => void;
  addChangeOrder: (id: string, co: Omit<ChangeOrder, "id">) => void;
  addLineItem: (id: string, item: Omit<LineItem, "id">) => void;
  removeLineItem: (id: string, itemId: string) => void;
  removeJob: (id: string) => void;
  clearJobs: () => void;
};

function persistJob(job: Job | undefined) {
  if (!job) return;
  void saveJob({ data: job }).catch(() => {
    /* signed-out or network — desk still works locally until hydrate */
  });
}

export const useJobs = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: [],
      activeId: null,
      hydrated: false,
      replaceAll: (jobs) =>
        set((s) => ({
          jobs: jobs.map((j) => normalizeJob(j)),
          hydrated: true,
          activeId: jobs.some((j) => j.id === s.activeId) ? s.activeId : (jobs[0]?.id ?? null),
        })),
      addJob: (input) => {
        const id = nid();
        const job = normalizeJob({
          ...input,
          id,
          kind: "conventional",
          status: input.status ?? "intake",
          createdAt: new Date().toISOString().slice(0, 10),
          ticket: input.ticket ?? "",
          timeLog: input.timeLog ?? [],
          invoiceStatus: input.invoiceStatus ?? "none",
        });
        set({ jobs: [job, ...get().jobs], activeId: id });
        persistJob(job);
        return id;
      },
      updateJob: (id, patch) => {
        set({ jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      setActive: (id) => set({ activeId: id }),
      setStatus: (id, status) => {
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== id) return j;
            const next: Job = { ...j, status };
            if (status === "ready" && j.invoiceStatus === "none") {
              next.invoiceStatus = "draft";
              next.invoiceNo = invoiceNumber(next);
            }
            return next;
          }),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      addTime: (id, entry) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, timeLog: [...j.timeLog, { ...entry, id: tid() }] } : j,
          ),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      setInvoice: (id, status) => {
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== id) return j;
            const today = new Date().toISOString().slice(0, 10);
            const next: Job = { ...j, invoiceStatus: status, invoiceNo: j.invoiceNo || invoiceNumber(j) };
            if (status === "sent") next.sentAt = j.sentAt || today;
            if (status === "paid") {
              next.paidAt = j.paidAt || today;
              next.sentAt = j.sentAt || today;
              if (j.status !== "delivered") next.status = "delivered";
            }
            return next;
          }),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      addChangeOrder: (id, co) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, changeOrders: [...(j.changeOrders ?? []), { ...co, id: tid() }] } : j,
          ),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      addLineItem: (id, item) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, lineItems: [...(j.lineItems ?? []), { ...item, id: tid() }] } : j,
          ),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      removeLineItem: (id, itemId) => {
        set({
          jobs: get().jobs.map((j) =>
            j.id === id ? { ...j, lineItems: (j.lineItems ?? []).filter((x) => x.id !== itemId) } : j,
          ),
        });
        persistJob(get().jobs.find((j) => j.id === id));
      },
      removeJob: (id) => {
        const jobs = get().jobs.filter((j) => j.id !== id);
        set({
          jobs,
          activeId: get().activeId === id ? (jobs[0]?.id ?? null) : get().activeId,
        });
        void deleteJob({ data: id }).catch(() => {});
      },
      clearJobs: () => {
        const ids = get().jobs.map((j) => j.id);
        set({ jobs: [], activeId: null });
        for (const id of ids) void deleteJob({ data: id }).catch(() => {});
      },
    }),
    {
      name: "breakline-shop-v3",
      partialize: (s) => ({ activeId: s.activeId }),
    },
  ),
);

export function activeJob(): Job | undefined {
  const { jobs, activeId } = useJobs.getState();
  return jobs.find((j) => j.id === activeId);
}
