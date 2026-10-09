import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Plan" },
  { to: "/codes", label: "Code library" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-title">
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-[0.625rem] font-semibold text-primary-foreground">
            OR
          </span>
          <p className="text-sm font-medium text-[#e8edf2]">INDOT feature codes</p>
          <nav className="ml-4 flex gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
