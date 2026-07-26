import { Suspense } from "react";
import CustomerHealthDashboard from "@/components/dashboard/customer-health/CustomerHealthDashboard";

export const metadata = {
  title: "Customer Meal Health — DinePulse",
  description: "AI-powered meal nutritional analysis and health scoring",
};

export default function CustomerHealthPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-surface p-6 text-sm text-muted">Loading analysis…</div>}>
      <CustomerHealthDashboard />
    </Suspense>
  );
}
