#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations (and ../migrations/auth/) to DATABASE_URL. Each file is
 * applied in one transaction and recorded in a `_migrations` table, so it runs
 * once and is safe to re-run.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { pendingMigrations } from "./migration-plan.mjs";

const databaseUrl = process.env.DATABASE_URL;

// On Vercel a missing DATABASE_URL is fatal, not skippable: the deployed app has
// no PGLite fallback, so skipping here ships a build whose every query fails at
// runtime. Fail the build instead, with the fix in the message.
if (!databaseUrl && process.env.VERCEL) {
  console.error(
    "[migrate] DATABASE_URL is not set, but this is a Vercel build.\n" +
      "[migrate] The deployed app cannot fall back to PGLite — it needs a real Postgres.\n" +
      "[migrate] Fix: Vercel -> Project -> Settings -> Environment Variables -> add\n" +
      "[migrate]   DATABASE_URL = <your Neon connection string>\n" +
      "[migrate] then redeploy.",
  );
  process.exit(1);
}

if (!databaseUrl) {
  console.log(
    "[migrate] DATABASE_URL not set — skipping (the PGLite fallback migrates itself).",
  );
  process.exit(0);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function main() {
  // migrations/*.sql is the single schema source, matching the import.meta.glob
  // in src/lib/db.ts that the PGLite fallback uses. Keep them identical: a
  // subdirectory here would apply on Vercel but not in local dev.
  let allEntries;
  try {
    allEntries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }

  if (pendingMigrations(allEntries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(allEntries, applied)) {
      const filePath = join(migrationsDir, name);
      const text = await readFile(filePath, "utf8");
      try {
        await client.query("BEGIN");
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  // pg errors carry the context needed to debug a bad SQL file.
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
