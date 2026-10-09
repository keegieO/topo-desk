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
          ? "text-xs font-medium text-[#8fa3b8] hover:text-[#c8d8e8] underline-offset-4 hover:underline"
          : "rounded px-3 py-1.5 text-sm font-medium text-[#8fa3b8] hover:bg-[rgb(255_255_255/0.07)] hover:text-[#c8d8e8] transition-colors"
      }
    >
      Sign in
    </Link>
  );
}
