import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { DeliverPack } from "@/components/deliver-pack";

export const Route = createFileRoute("/deliver")({ component: DeliverPage });

function DeliverPage() {
  return (
    <FirmShell>
      <DeliverPack />
    </FirmShell>
  );
}
