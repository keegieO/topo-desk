import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useFirm, firmCityLine } from "@/lib/firm";
import { AccountGate } from "@/components/account-gate";
import { AuthSlot } from "@/components/auth-slot";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Desk" },
  { to: "/crew", label: "Crew" },
  { to: "/extract", label: "Extract" },
  { to: "/deliver", label: "Deliver" },
  { to: "/billing", label: "Bills" },
  { to: "/codes", label: "Codes" },
  { to: "/shop", label: "Shop" },
] as const;

export function FirmShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firm = useFirm();

  return (
    <AccountGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="border-b border-b-[rgb(255_255_255/0.06)] bg-title shadow-[0_1px_8px_rgb(0_0_0/0.18)]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-2.5">
              {/* Survey crosshair mark */}
              <span className="flex h-8 w-8 items-center justify-center rounded bg-[rgb(255_255_255/0.1)] text-[#7eb8f0] ring-1 ring-[rgb(255_255_255/0.08)]">
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden fill="none">
                  <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.25" />
                  <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                  <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight text-[#e8edf2]">{firm.name}</span>
                <span className="block text-[0.6875rem] text-[#8fa3b8]">{firmCityLine(firm)}</span>
              </span>
            </Link>
            <nav className="flex flex-wrap gap-0.5 sm:ml-8">
              {NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#1a5490] text-white shadow-sm"
                        : "text-[#8fa3b8] hover:bg-[rgb(255_255_255/0.07)] hover:text-[#c8d8e8]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="sm:ml-auto">
              <AuthSlot />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10">{children}</main>
      </div>
    </AccountGate>
  );
}
