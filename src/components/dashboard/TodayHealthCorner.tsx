"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { getRandomCard, getDailyTip, getDailyInsightChips } from "@/lib/healthContent";

const TodayHealthCorner = memo(function TodayHealthCorner() {
  const router = useRouter();
  const card = useMemo(() => getRandomCard(), []);
  const tip = useMemo(() => getDailyTip(), []);
  const chips = useMemo(() => getDailyInsightChips(), []);

  return (
    <div className="mt-3 flex flex-1 flex-col gap-2">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-emerald/[0.04] via-transparent to-emerald/[0.02] p-3 sm:p-4 shadow-sm">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-sm sm:h-10 sm:w-10 sm:text-base">
              {card.icon}
            </span>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-md bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald sm:px-2">
                {card.badge}
              </span>
              {card.myth ? (
                <div className="mt-1.5 space-y-1 sm:mt-2">
                  <p className="text-xs leading-relaxed text-rose-400/80 sm:text-sm">
                    ❌ <span className="font-medium text-rose-400">Myth:</span> {card.myth}
                  </p>
                  <p className="text-xs leading-relaxed sm:text-sm">
                    ✅ <span className="font-semibold text-emerald">Fact:</span>{" "}
                    <span className="text-muted">{card.fact}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-1.5 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
                  {card.fact}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-[35%] shrink-0 flex-col justify-center rounded-xl border border-emerald/20 bg-gradient-to-br from-emerald/[0.06] to-emerald/[0.02] p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
              <span className="absolute inset-0 animate-pulse rounded-full bg-emerald/30" />
              <span className="relative text-xs">💡</span>
            </span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald sm:text-xs">Today&apos;s Tip</p>
          </div>
          <p className="mt-1 text-xs leading-snug text-white sm:text-sm">{tip}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5"
          >
            <span className="text-xs sm:text-sm">{chip.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-white leading-tight sm:text-xs">{chip.label}</p>
              <p className="text-[9px] text-muted leading-tight sm:text-[10px] hidden sm:block">{chip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald/20 bg-gradient-to-br from-emerald/[0.06] to-emerald/[0.01] shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="mt-0.5 text-base sm:text-lg">🌱</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white sm:text-base">Small choices today, big results tomorrow!</p>
              <p className="mt-0.5 text-xs italic leading-relaxed text-muted sm:text-sm">
                &ldquo;Healthy eating isn&apos;t about perfection. It&apos;s about making better choices consistently.&rdquo;
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-emerald/20 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🍽️</span>
              <div>
                <p className="text-sm font-semibold text-white sm:text-base">Explore Healthy Restaurants</p>
                <p className="text-[10px] text-muted sm:text-xs">Discover nutritious meals prepared with fresh ingredients.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full whitespace-nowrap rounded-xl transition-transform duration-300 hover:scale-[1.01] sm:w-auto"
              onClick={() => router.push("/dashboard/browse-restaurants")}
            >
              Explore Restaurants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TodayHealthCorner;
