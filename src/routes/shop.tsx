import { createFileRoute } from "@tanstack/react-router";
import { FirmShell } from "@/components/firm-shell";
import { ShopDesk } from "@/components/shop-desk";

export const Route = createFileRoute("/shop")({ component: ShopPage });

function ShopPage() {
  return (
    <FirmShell>
      <ShopDesk />
    </FirmShell>
  );
}
