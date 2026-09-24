import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { CodeLibrary } from "@/components/code-library";

export const Route = createFileRoute("/codes")({ component: CodesPage });

function CodesPage() {
  return (
    <FirmShell>
      <CodeLibrary />
    </FirmShell>
  );
}
