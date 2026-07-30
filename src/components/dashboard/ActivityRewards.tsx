"use client";

import { memo, useEffect, useState } from "react";
import { computeActivityData, type ActivityData } from "@/lib/activityRewards";

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

const AnimatedProgressBar = memo(function AnimatedProgressBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald-light transition-[width] duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
});

export default function ActivityRewards() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setData(computeActivityData());
  }, []);

  if (!mounted || !data) {
    return (
      <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-surface p-3 shadow-lg">
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="mt-3 h-6 w-24 rounded bg-white/10" />
        <div className="mt-2 h-1.5 w-full rounded bg-white/10" />
      </div>
    );
  }

  const { steps, goal, progress, tier, motivationalText, isRewardUnlocked } = data;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-3 shadow-lg">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald/5 blur-[30px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-cyan-500/5 blur-[20px]" aria-hidden="true" />

      <div className="relative space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald/10 text-sm">🏃</span>
            <p className="text-sm font-semibold text-white">Activity Rewards</p>
          </div>
          <span className="rounded border border-emerald/30 bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald leading-none">
            Beta
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Today&apos;s Steps</span>
          <span className="text-sm font-bold text-white">
            {formatNumber(steps)}
            <span className="text-xs font-normal text-muted"> / {formatNumber(goal)}</span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Progress</span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
          <AnimatedProgressBar value={progress} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-emerald/20 bg-emerald/[0.04] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{tier.discount > 0 ? "🎉" : "😴"}</span>
            <div>
              <p className={`text-xs font-semibold ${isRewardUnlocked ? "text-emerald" : "text-white"}`}>
                {tier.discount > 0 ? `${tier.discount}% Discount` : "No reward yet"}
              </p>
              {tier.badge ? (
                <p className={`text-[10px] ${tier.color}`}>{tier.badge} {tier.label}</p>
              ) : null}
            </div>
          </div>
          {progress >= 100 ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald/20 text-xs">🎯</span>
          ) : null}
        </div>

        <p className="text-[11px] leading-relaxed text-muted">{motivationalText}</p>

        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
          <span className="text-xs">🚧</span>
          <p className="text-[10px] text-muted">
            Coming Soon: Sync your daily activity using Google Health Connect.
          </p>
        </div>
      </div>
    </div>
  );
}
