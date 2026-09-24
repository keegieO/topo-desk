import type { ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { JobsHydrator } from "@/components/jobs-hydrator";

export function AccountGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="h-14 border-b border-border bg-title" />
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="mt-6 grid gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <>
      <JobsHydrator />
      {children}
    </>
  );
}
