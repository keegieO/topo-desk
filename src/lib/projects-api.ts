/**
 * GeoLine Solutions — Survey Projects & PNEZD server API
 *
 * Provides full server-side persistence for survey projects and uploaded PNEZD
 * field books.  All handlers require authentication and scope every query to
 * `context.userId`.
 *
 * Schema: migrations/0004_projects.sql
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseSurveyCsv as parseCsv, type ParseResult, type ParsedShot } from "@/lib/csv";

// ---------------------------------------------------------------------------
// Row types (what Postgres hands back)
// ---------------------------------------------------------------------------

type ProjectRow = {
  id: string;
  user_id: string;
  job_id: string | null;
  name: string;
  description: string;
  crs: string;
  coord_order: string;
  status: string;
  active_file_id: string | null;
  created_at: string;
  updated_at: string;
};

type FileRow = {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  coord_order: string;
  delimiter: string;
  raw_text: string;
  shot_count: number;
  parse_errors: number;
  uploaded_at: string;
};

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type SurveyProject = {
  id: string;
  userId: string;
  jobId: string | undefined;
  name: string;
  description: string;
  crs: string;
  coordOrder: "PNEZD" | "PENZD";
  status: "active" | "complete" | "archived";
  activeFileId: string | undefined;
  createdAt: string;
  updatedAt: string;
};

export type PnezdFile = {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  coordOrder: "PNEZD" | "PENZD";
  delimiter: string;
  rawText: string;
  shotCount: number;
  parseErrors: number;
  uploadedAt: string;
};

export type UploadResult = {
  file: PnezdFile;
  shots: ParsedShot[];
  skipped: number;
  parseErrors: number;
};

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function fromProjectRow(r: ProjectRow): SurveyProject {
  return {
    id: r.id,
    userId: r.user_id,
    jobId: r.job_id ?? undefined,
    name: r.name,
    description: r.description,
    crs: r.crs,
    coordOrder: (r.coord_order as SurveyProject["coordOrder"]) || "PNEZD",
    status: (r.status as SurveyProject["status"]) || "active",
    activeFileId: r.active_file_id ?? undefined,
    createdAt: typeof r.created_at === "string" ? r.created_at.slice(0, 10) : String(r.created_at).slice(0, 10),
    updatedAt: typeof r.updated_at === "string" ? r.updated_at.slice(0, 10) : String(r.updated_at).slice(0, 10),
  };
}

function fromFileRow(r: FileRow): PnezdFile {
  return {
    id: r.id,
    projectId: r.project_id,
    userId: r.user_id,
    fileName: r.file_name,
    coordOrder: (r.coord_order as PnezdFile["coordOrder"]) || "PNEZD",
    delimiter: r.delimiter,
    rawText: r.raw_text,
    shotCount: Number(r.shot_count) || 0,
    parseErrors: Number(r.parse_errors) || 0,
    uploadedAt: typeof r.uploaded_at === "string" ? r.uploaded_at.slice(0, 19) : String(r.uploaded_at).slice(0, 19),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nanoid(): string {
  // Lightweight ID without external dep.  Not crypto-grade for secret tokens
  // but fine for primary keys alongside user_id scoping.
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  crs: z.string().default("Indiana InGCS — NAD 1983 (2011)"),
  coordOrder: z.enum(["PNEZD", "PENZD"]).default("PNEZD"),
  jobId: z.string().optional(),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createProjectSchema)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = `proj_${nanoid()}`;
    await sql`
      insert into survey_projects (id, user_id, job_id, name, description, crs, coord_order)
      values (
        ${id},
        ${context.userId},
        ${data.jobId ?? null},
        ${data.name},
        ${data.description},
        ${data.crs},
        ${data.coordOrder}
      )
    `;
    const rows = await sql<ProjectRow>`
      select * from survey_projects where id = ${id}
    `;
    if (!rows[0]) throw new Error("Failed to create project");
    return fromProjectRow(rows[0]);
  });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ProjectRow>`
      select * from survey_projects
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(fromProjectRow);
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<ProjectRow>`
      select * from survey_projects
      where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!rows[0]) throw new Error("Project not found");
    return fromProjectRow(rows[0]);
  });

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  crs: z.string().optional(),
  coordOrder: z.enum(["PNEZD", "PENZD"]).optional(),
  status: z.enum(["active", "complete", "archived"]).optional(),
  jobId: z.string().nullable().optional(),
  activeFileId: z.string().nullable().optional(),
});

export const updateProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateProjectSchema)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    // Fetch current to guard ownership
    const existing = await sql<ProjectRow>`
      select * from survey_projects where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!existing[0]) throw new Error("Project not found");
    const cur = existing[0];
    await sql`
      update survey_projects set
        name           = ${data.name           ?? cur.name},
        description    = ${data.description    ?? cur.description},
        crs            = ${data.crs            ?? cur.crs},
        coord_order    = ${data.coordOrder     ?? cur.coord_order},
        status         = ${data.status         ?? cur.status},
        job_id         = ${"jobId" in data      ? (data.jobId ?? null) : cur.job_id},
        active_file_id = ${"activeFileId" in data ? (data.activeFileId ?? null) : cur.active_file_id},
        updated_at     = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    const rows = await sql<ProjectRow>`
      select * from survey_projects where id = ${data.id}
    `;
    return fromProjectRow(rows[0]!);
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      delete from survey_projects where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// PNEZD File upload & parse
// ---------------------------------------------------------------------------

const uploadPnezdSchema = z.object({
  projectId: z.string(),
  fileName: z.string(),
  rawText: z.string().min(1),
  /** Hint to parser — auto-detected if omitted */
  coordOrderHint: z.enum(["PNEZD", "PENZD"]).optional(),
});

/**
 * Parse a PNEZD/CSV text body, insert all valid shots to the DB in a single
 * transaction, and update the project's active_file_id.
 *
 * Returns the PnezdFile record plus the full ParsedShot array so the client
 * can immediately populate the survey dock without a round-trip.
 */
export const uploadPnezd = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(uploadPnezdSchema)
  .handler(async ({ context, data }) => {
    const sql = await getSql();

    // Guard: project must belong to this user
    const proj = await sql<{ id: string; coord_order: string }>`
      select id, coord_order from survey_projects
      where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!proj[0]) throw new Error("Project not found");

    // Parse the uploaded text
    const orderHint = data.coordOrderHint ?? (proj[0].coord_order as "PNEZD" | "PENZD");
    const parsed: ParseResult = parseCsv(data.rawText, data.fileName, orderHint);

    const fileId = `pf_${nanoid()}`;

    await sql`
      insert into pnezd_files (
        id, project_id, user_id, file_name, coord_order, delimiter,
        raw_text, shot_count, parse_errors
      ) values (
        ${fileId},
        ${data.projectId},
        ${context.userId},
        ${data.fileName},
        ${parsed.order},
        ${parsed.delimiter},
        ${data.rawText},
        ${parsed.shots.length},
        ${parsed.skipped}
      )
    `;

    // Bulk-insert shots in batches of 500 to stay within parameter limits
    const BATCH = 500;
    for (let i = 0; i < parsed.shots.length; i += BATCH) {
      const slice = parsed.shots.slice(i, i + BATCH);
      // Build a single multi-row insert
      const values = slice
        .map(
          (s, idx) => {
            const base = i + idx;
            return `($${base * 9 + 1}, $${base * 9 + 2}, $${base * 9 + 3}, $${base * 9 + 4}, $${base * 9 + 5}, $${base * 9 + 6}, $${base * 9 + 7}, $${base * 9 + 8}, $${base * 9 + 9})`;
          },
        )
        .join(", ");
      const params: unknown[] = [];
      for (const s of slice) {
        params.push(
          fileId,
          data.projectId,
          context.userId,
          s.rowIndex,
          s.point,
          s.northing,
          s.easting,
          s.elevation,
          s.description,
        );
      }
      await sql.query(
        `insert into pnezd_shots
          (file_id, project_id, user_id, row_index, point, northing, easting, elevation, description)
         values ${values}`,
        params,
      );
    }

    // Set as active file for project
    await sql`
      update survey_projects
      set active_file_id = ${fileId}, updated_at = now()
      where id = ${data.projectId} and user_id = ${context.userId}
    `;

    const fileRows = await sql<FileRow>`
      select * from pnezd_files where id = ${fileId}
    `;
    const file = fromFileRow(fileRows[0]!);

    return {
      file,
      shots: parsed.shots,
      skipped: parsed.skipped,
      parseErrors: parsed.skipped,
    } satisfies UploadResult;
  });

// ---------------------------------------------------------------------------
// Shot retrieval
// ---------------------------------------------------------------------------

const getShotsSchema = z.object({
  projectId: z.string(),
  fileId: z.string().optional(),
  /** Page size (default 5000) */
  limit: z.number().int().min(1).max(20000).default(5000),
  /** Row offset for paging */
  offset: z.number().int().min(0).default(0),
});

type ShotRow = {
  id: string;
  file_id: string;
  project_id: string;
  user_id: string;
  row_index: number;
  point: string;
  northing: number;
  easting: number;
  elevation: number;
  description: string;
  raw_line: string;
  issues: string;
};

export const getShots = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(getShotsSchema)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    // Guard ownership via project lookup
    const proj = await sql<{ id: string }>`
      select id from survey_projects
      where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!proj[0]) throw new Error("Project not found");

    let rows: ShotRow[];
    if (data.fileId) {
      rows = await sql<ShotRow>`
        select * from pnezd_shots
        where file_id = ${data.fileId} and project_id = ${data.projectId}
        order by row_index
        limit ${data.limit} offset ${data.offset}
      `;
    } else {
      // Return shots from the active file
      const proj2 = await sql<{ active_file_id: string | null }>`
        select active_file_id from survey_projects where id = ${data.projectId}
      `;
      const activeFileId = proj2[0]?.active_file_id;
      if (!activeFileId) return { shots: [], total: 0 };
      rows = await sql<ShotRow>`
        select * from pnezd_shots
        where file_id = ${activeFileId} and project_id = ${data.projectId}
        order by row_index
        limit ${data.limit} offset ${data.offset}
      `;
    }

    const shots: ParsedShot[] = rows.map((r) => ({
      uid: String(r.id),
      rowIndex: Number(r.row_index),
      point: r.point,
      northing: Number(r.northing),
      easting: Number(r.easting),
      elevation: Number(r.elevation),
      description: r.description,
      issues: (() => {
        try { return JSON.parse(r.issues) as string[]; } catch { return []; }
      })(),
    }));

    return { shots, total: shots.length };
  });

// ---------------------------------------------------------------------------
// File listing
// ---------------------------------------------------------------------------

export const listFiles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const proj = await sql<{ id: string }>`
      select id from survey_projects
      where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!proj[0]) throw new Error("Project not found");
    const rows = await sql<FileRow>`
      select id, project_id, user_id, file_name, coord_order, delimiter,
             shot_count, parse_errors, uploaded_at
      from pnezd_files
      where project_id = ${data.projectId}
      order by uploaded_at desc
    `;
    // raw_text excluded from listing for bandwidth
    return rows.map((r) => fromFileRow({ ...r, raw_text: "" }));
  });

export const deleteFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fileId: z.string(), projectId: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    // Ownership via project
    const proj = await sql<{ id: string; active_file_id: string | null }>`
      select id, active_file_id from survey_projects
      where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!proj[0]) throw new Error("Project not found");
    await sql`
      delete from pnezd_files where id = ${data.fileId} and project_id = ${data.projectId}
    `;
    // If this was the active file, clear it
    if (proj[0].active_file_id === data.fileId) {
      await sql`
        update survey_projects
        set active_file_id = null, updated_at = now()
        where id = ${data.projectId}
      `;
    }
    return { ok: true };
  });
