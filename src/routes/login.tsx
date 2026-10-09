import { useState, type FormEvent } from "react";
import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMPANY } from "@/lib/company";

/**
 * Probe whether the database is reachable. Returns null on success, or a
 * short user-facing message on failure. Runs server-side so the client
 * gets a clear banner instead of a cryptic auth error.
 */
const checkDb = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`select 1`;
    return null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("DATABASE_URL")) {
      return "DATABASE_URL is not set — add a Neon connection string and BETTER_AUTH_SECRET in Vercel → Settings → Environment Variables, then redeploy.";
    }
    return `Database unavailable: ${msg}`;
  }
});

export const Route = createFileRoute("/login")({
  component: Login,
  loader: async () => ({ dbError: await checkDb() }),
});

function Login() {
  const { dbError } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authEnabled) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "up" && password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (err) throw new Error(err.message || "Could not create the account.");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message || "Could not sign in.");
      }
      await authClient.getSession();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_28rem]">
      <section className="hidden flex-col justify-between border-r border-border bg-title px-10 py-10 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[rgb(255_255_255/0.1)] text-[#7eb8f0] ring-1 ring-[rgb(255_255_255/0.08)]">
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden fill="none">
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="8" cy="8" r="1.25" fill="currentColor" />
              <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-medium leading-tight text-[#e8edf2]">{COMPANY.name}</span>
            <span className="block text-[0.6875rem] text-[#8fa3b8]">{COMPANY.city}</span>
          </span>
        </Link>
        <div className="max-w-md">
          <p className="kicker">Survey tab · Field books</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance">
            Conventional extraction, coded for OpenRoads.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {COMPANY.line} Sign in to your shop — jobs, field books, QA, and ORD packages stay on your account.
          </p>
        </div>
        <p className="font-mono text-[0.6875rem] text-[#8fa3b8]">
          {COMPANY.hours} · {COMPANY.phone}
        </p>
      </section>

      <section className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary ring-1 ring-primary/20">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden fill="none">
                <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.25" />
                <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-medium">{COMPANY.name}</span>
          </div>
          <h2 className="font-display text-2xl font-medium tracking-tight">
            {mode === "in" ? "Sign in" : "Create account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in" ? "Shop floor, extract, and billing." : "Email and password, stored on this app."}
          </p>

          {dbError ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p className="font-medium">Database not configured</p>
              <p className="mt-1 text-destructive/80">{dbError}</p>
            </div>
          ) : null}

          {authEnabled ? (
            <div className="mt-6 flex flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">or email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onEmail} className="flex flex-col gap-3">
            {mode === "up" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" placeholder="Shop name or yours" />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                required
                minLength={mode === "up" ? 8 : undefined}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={busy || !authEnabled || Boolean(dbError)} className="mt-1 w-full">
              {busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            {mode === "in" ? "New shop?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError(null);
              }}
            >
              {mode === "in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
