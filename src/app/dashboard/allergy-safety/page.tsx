import { Suspense } from "react";
import AllergySafetyDashboard from "@/components/dashboard/allergy-safety/AllergySafetyDashboard";

export const metadata = { title: "Allergy Safety — DinePulse" };

export default function AllergySafetyPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-surface p-6 text-sm text-muted">Loading allergy safety insights…</div>}>
      <AllergySafetyDashboard />
    </Suspense>
  );
}
