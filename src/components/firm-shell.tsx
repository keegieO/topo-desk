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
        <header className="border-b border-border bg-title">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 2.2v11.6M2.2 8h11.6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-medium leading-tight">{firm.name}</span>
                <span className="block text-[0.6875rem] text-muted-foreground">{firmCityLine(firm)}</span>
              </span>
            </Link>
            <nav className="flex flex-wrap gap-1 sm:ml-6">
              {NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
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
        <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </AccountGate>
  );
}
