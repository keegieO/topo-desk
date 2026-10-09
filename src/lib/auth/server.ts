/**
 * Self-hosted Better Auth for this app (server-only).
 *
 * Auth modes:
 *   - Production (`DATABASE_URL` + `BETTER_AUTH_SECRET` set): real sessions
 *     persisted in Neon via node-postgres. Email / password is the only
 *     sign-in method — no third-party OAuth broker.
 *   - Local dev (no `DATABASE_URL`): same config but persisted in the
 *     in-process PGLite fallback so `npm run dev` works without any infra.
 *   - Off (`VITE_AUTH_ENABLED=false`): no providers; `requireUserId` resolves
 *     a dev user when no database is configured, and throws fail-closed once
 *     `DATABASE_URL` is set (see `verify.server.ts`).
 *
 * NEVER import this from client code — it pulls in `pg` and server-only
 * Better Auth internals. Client code uses `@/lib/auth/client`; components
 * read the user via `@/lib/auth/use-current-user`; server functions get a
 * verified id via `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { pgliteDialect } from "./pglite-dialect";
import { PREVIEW_ALLOWED_HOSTS } from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __appAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__appAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__appAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch. Set VITE_AUTH_ENABLED=false to force auth off (dev user).
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** True when auth is active (real sessions enforced). */
export const authConfigured = !authDisabled;

// Local `npm run dev` (port 8080 contract).
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];

// Vercel injects VERCEL_URL (production) and VERCEL_BRANCH_URL (preview) automatically —
// no manual env var needed. BETTER_AUTH_URL can still override everything.
function vercelOrigins(): string[] {
  const origins: string[] = [];
  // VERCEL_URL is the canonical deployment URL (e.g. topo-desk-emfn.vercel.app)
  const vercelUrl = env("VERCEL_URL");
  if (vercelUrl) origins.push(`https://${vercelUrl}`);
  // VERCEL_BRANCH_URL covers preview deployments per branch
  const branchUrl = env("VERCEL_BRANCH_URL");
  if (branchUrl) origins.push(`https://${branchUrl}`);
  // VERCEL_PROJECT_PRODUCTION_URL is stable across deploys
  const prodUrl = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (prodUrl) origins.push(`https://${prodUrl}`);
  return origins;
}

const explicitBaseURL = env("BETTER_AUTH_URL");
const detectedVercelOrigins = vercelOrigins();

const baseURL = explicitBaseURL
  // Prefer explicit override
  ? explicitBaseURL
  // On Vercel, use the canonical URL so Better Auth knows its own base
  : detectedVercelOrigins[0] ?? {
      allowedHosts: [...previewAllowedHosts, "localhost", "127.0.0.1", "[::1]"],
      protocol: "auto" as const,
      fallback: "http://localhost:8080",
    };

const trustedOrigins: string[] = [
  // Always trust local dev
  ...LOCAL_DEV_ORIGINS,
  // Trust all Vercel deployment URLs (auto-injected, no manual config needed)
  ...detectedVercelOrigins,
  // Trust Grok sandbox preview hosts
  ...previewAllowedHosts,
  ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
  // Trust explicit override if set
  ...(explicitBaseURL ? [explicitBaseURL] : []),
];

const databaseUrl = env("DATABASE_URL");

const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name. */
export const SESSION_TOKEN_COOKIE = "__Host-app-auth.session_token";

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,
  trustedOrigins,

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: [GATE_PROVIDER_ID],
      requireLocalEmailVerified: false,
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-app-auth.session_data" },
      account_data: { name: "__Host-app-auth.account_data" },
      dont_remember: { name: "__Host-app-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),

    // Accept `Authorization: Bearer <session-token>` for live-preview partitioned
    // cookie environments. No-op for normal cookie auth in deployed apps.
    bearer(),

    // Bridges Better Auth's Set-Cookie into TanStack Start responses. Must be last.
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Re-exported for convenience — empty array, email/password only.
export { GROK_PROVIDERS } from "./providers";
