import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { CrewPortal } from "@/components/crew-portal";

export const Route = createFileRoute("/crew")({ component: CrewPage });

function CrewPage() {
  return (
    <FirmShell>
      <CrewPortal />
    </FirmShell>
  );
}
