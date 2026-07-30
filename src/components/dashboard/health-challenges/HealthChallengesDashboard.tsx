"use client";

import CommunityHealthChallenge from "@/components/dashboard/CommunityHealthChallenge";

export default function HealthChallengesDashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-emerald/[0.08] via-surface to-emerald/[0.03] p-6 sm:p-8 shadow-lg">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald/10 blur-[60px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber/10 blur-[40px]" aria-hidden="true" />
        <div className="relative flex items-start gap-4 sm:gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-3xl shadow-lg shadow-amber/10 sm:h-16 sm:w-16 sm:text-4xl">
            🏆
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Community Health Challenges</h1>
              <span className="rounded border border-emerald/30 bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald leading-none shrink-0">
                Beta
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
              Complete weekly challenges, earn badges, and compete with the DinePulse community.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-[11px] font-medium text-emerald-light">
                🥗 Weekly Goals
              </span>
              <span className="flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-[11px] font-medium text-emerald-light">
                🏅 Earn Badges
              </span>
              <span className="flex items-center gap-1 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-[11px] font-medium text-emerald-light">
                👥 Community Stats
              </span>
            </div>
          </div>
        </div>
      </div>

      <CommunityHealthChallenge />
    </div>
  );
}
