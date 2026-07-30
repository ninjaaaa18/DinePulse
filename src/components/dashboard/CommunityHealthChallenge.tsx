"use client";

import { useMemo } from "react";
import { getWeeklyChallenge, getCommunityStats, getEarnedBadge, getMotivationalMessage } from "@/lib/communityChallengeData";

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export default function CommunityHealthChallenge() {
  const challenge = useMemo(() => getWeeklyChallenge(), []);
  const stats = useMemo(() => getCommunityStats(), []);
  const badge = useMemo(() => getEarnedBadge(), []);
  const message = useMemo(() => getMotivationalMessage(), []);

  const progressPercent = Math.round((challenge.progress / challenge.goal) * 100);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface shadow-lg">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-bold text-white sm:text-base">Community Health Challenge</h3>
          </div>
          <span className="rounded border border-emerald/30 bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald leading-none">
            Beta
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-emerald/20 bg-emerald/[0.03] p-3 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald sm:text-xs">{challenge.weekLabel}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg sm:text-xl">{challenge.icon}</span>
            <p className="text-sm font-bold text-white sm:text-base">{challenge.title}</p>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Progress</span>
              <span className="font-semibold text-white">{challenge.progress} / {challenge.goal} {challenge.unit}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald-light transition-[width] duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <span>Reward:</span>
            <span className="flex items-center gap-1">
              <span>{challenge.rewardIcon}</span>
              <span className="font-medium text-white">{challenge.reward}</span>
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-muted sm:text-xs">
          <span className="flex items-center gap-1">👥 <span className="font-semibold text-white">{formatNumber(stats.usersJoined)}</span> joined</span>
          <span className="hidden sm:flex items-center gap-1">🥗 <span className="font-semibold text-white">{formatNumber(stats.usersCompleted)}</span> completed</span>
          <span className="flex items-center gap-1">🔥 <span className="font-semibold text-white">{formatNumber(stats.streakUsers)}</span> streak</span>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald/20 bg-emerald/[0.04] px-3 py-2">
          <span className="text-sm">💬</span>
          <p className="text-[11px] italic leading-relaxed text-muted sm:text-xs">&ldquo;{message}&rdquo;</p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-amber/20 bg-amber/[0.04] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{badge.icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-white sm:text-xs">Your Badge</p>
              <p className={`text-[10px] font-medium sm:text-[11px] ${badge.tier === "gold" ? "text-amber" : badge.tier === "silver" ? "text-slate-300" : "text-amber/70"}`}>
                {badge.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-3 sm:px-5 sm:py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-xs">🚧</span>
          <div>
            <p className="text-[11px] font-medium text-white sm:text-xs">Coming Soon</p>
            <p className="text-[10px] leading-relaxed text-muted sm:text-[11px]">
              Compete with friends, join city-wide wellness challenges, and earn exclusive healthy rewards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
