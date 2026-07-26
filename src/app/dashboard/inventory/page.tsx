import { Suspense } from "react";
import InventoryDashboard from "@/components/dashboard/inventory/InventoryDashboard";

export const metadata = { title: "Inventory — DinePulse" };

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-surface p-6 text-sm text-muted">Loading inventory insights…</div>}>
      <InventoryDashboard />
    </Suspense>
  );
}
