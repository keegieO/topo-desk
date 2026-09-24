import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { BillingDesk } from "@/components/billing-desk";

export const Route = createFileRoute("/billing")({ component: BillingPage });

function BillingPage() {
  return (
    <FirmShell>
      <BillingDesk />
    </FirmShell>
  );
}
