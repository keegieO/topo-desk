import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />;
  }
  if (user) return <UserButton />;
  return (
    <Link
      to="/login"
      className={
        compact
          ? "text-xs font-medium text-foreground underline-offset-4 hover:underline"
          : "rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
      }
    >
      Sign in
    </Link>
  );
}
