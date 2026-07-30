import { Suspense } from "react";
import HealthChallengesDashboard from "@/components/dashboard/health-challenges/HealthChallengesDashboard";

export const metadata = {
  title: "Health Challenges — DinePulse",
  description: "Join weekly community health challenges and earn badges",
};

export default function HealthChallengesPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-surface p-6 text-sm text-muted">Loading challenges…</div>}>
      <HealthChallengesDashboard />
    </Suspense>
  );
}
