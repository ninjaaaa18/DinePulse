import { Suspense } from "react";
import RestaurantHealthDashboard from "@/components/dashboard/restaurant-health/RestaurantHealthDashboard";

export const metadata = {
  title: "Restaurant Health — DinePulse",
  description: "AI-powered restaurant health monitoring and insights",
};

export default function RestaurantHealthPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-surface p-6 text-sm text-muted">Loading restaurant insights…</div>}>
      <RestaurantHealthDashboard />
    </Suspense>
  );
}
