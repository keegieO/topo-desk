import { SAMPLE_CSV, SAMPLE_NAME } from "./sample";
import { normalizeJob, type Job } from "./job-types";

/** Bump to wipe prior demo jobs and reseed a clean book. */
export const SEED_REV = "clean-5";

export function seedJobs(): Job[] {
  return [
    normalizeJob({
      id: "2501384",
      name: "S.R. 67 & C.R. 400 S topographic survey",
      client: "INDOT Greenfield District",
      pm: "Jordan Yaney",
      email: "greenfield@indot.in.gov",
      phone: "(317) 467-3430",
      des: "2501384",
      county: "Delaware",
      crs: "Delaware County InGCS — NAD 1983 (2011)",
      kind: "conventional",
      status: "intake",
      hours: 0,
      rush: false,
      due: "2026-10-02",
      notes: "Conventional topo. Delaware InGCS. Control 600–604.",
      ticket: "",
      files: [{ name: SAMPLE_NAME, kind: "csv", size: SAMPLE_CSV.length }],
      csvName: SAMPLE_NAME,
      csvText: SAMPLE_CSV,
      createdAt: "2026-09-22",
      timeLog: [],
      invoiceStatus: "none",
      survey: {
        crew: "Greenfield topo 2",
        instrument: "Trimble S7 / R12i",
        occupied: "600",
        backsight: "601",
        date: "2026-09-22",
        notes: "Occupied 600. Backsight 601. Prism constant 0.",
        hi: "5.21",
        ht: "5.00",
        weather: "Clear, 68°F",
      },
    }),
  ];
}
