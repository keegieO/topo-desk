import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { Desk } from "@/components/desk";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <FirmShell>
      <Desk />
    </FirmShell>
  );
}
