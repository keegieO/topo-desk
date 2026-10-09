import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

/**
 * Nitro traces the PGLite JS but not `pglite.data`. Copy it into the bundle
 * so the production function can find it beside itself.
 */
function pgliteDataPlugin(): Plugin {
  return {
    name: "geoline:pglite-data",
    apply: "build",
    closeBundle() {
      const from = join(process.cwd(), "node_modules/@electric-sql/pglite/dist");
      const to = join(process.cwd(), ".vercel/output/functions/__server.func/_libs");
      if (!existsSync(to)) return;
      for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
        const src = join(from, name);
        if (existsSync(src)) copyFileSync(src, join(to, name));
      }
    },
  };
}

/** The files `src/lib/db.ts` globs — same directory, same non-recursive scope. */
function hasGlobbedMigrations(root: string): boolean {
  try {
    return readdirSync(join(root, "migrations")).some(isMigrationFile);
  } catch {
    return false;
  }
}

/**
 * Warm up PGLite during dev-server startup so the first page load doesn't
 * block on schema migration. Skipped when there are no migration files.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "geoline:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      if (!hasGlobbedMigrations(server.config.root)) return;
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[geoline] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/**
 * Handle /auth/popup OAuth callback in dev before TanStack Start's HTML
 * fallback intercepts it.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "geoline:auth-popup",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted
                ? "https"
                : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule(
            "/src/lib/auth/popup.server.ts",
          )) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[geoline] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// Port 8080 is the dev contract — Claude Code and local dev both use it.
// Gate the Nitro Vercel-preset plugin on build/preview only — left on in dev
// it opens a second dev-server port that breaks the single-port 8080 preview.
export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteBootstrapPlugin(),
    authPopupPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? nitro({ preset: "vercel", serverDir: "./server" })
      : []),
    pgliteDataPlugin(),
    viteReact(),
  ],
}));
