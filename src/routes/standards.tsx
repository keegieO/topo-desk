import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { StandardsCoverage } from "@/components/standards-coverage";

export const Route = createFileRoute("/standards")({ component: StandardsPage });

function StandardsPage() {
  return (
    <FirmShell>
      <StandardsCoverage />
    </FirmShell>
  );
}
