export function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/**
 * True when running in a production deployment (NODE_ENV=production and
 * DATABASE_URL is set). Used to gate audience identifiers and endpoint
 * resolution. In local dev and Claude Code sessions this returns false,
 * which is the safe default — auth falls back to PGLite dev mode.
 */
export function isDeployed(): boolean {
  return process.env.NODE_ENV === "production" && Boolean(env("DATABASE_URL"));
}

/**
 * @deprecated Use isDeployed() — kept for any remaining callers until cleaned.
 */
export function isWorkspacePreview(): boolean {
  return !isDeployed();
}
