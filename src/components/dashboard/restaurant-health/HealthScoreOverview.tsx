"use client";

import Card from "@/components/cards/Card";
import {
  overallHealth,
  trendIcons,
  trendStyles,
} from "@/components/dashboard/restaurant-health/restaurantHealthData";
import {
  calculateRestaurantHealthScore,
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
} from "@/lib/orderAnalysis";

export default function HealthScoreOverview() {
  const analytics = getStoredAnalyticsSnapshot();
  const inventory = getStoredInventoryState();

  const healthyInvCount = inventory.filter(
    (i) => i.status === "Healthy" || i.status === "Medium",
  ).length;
  const inventoryHealth =
    inventory.length > 0
      ? Math.round((healthyInvCount / inventory.length) * 100)
      : 90;

  const averageMealHealth = analytics.averageMealHealthScore || 88;
  const customerSatisfaction = analytics.averageCustomerSatisfaction || 94;
  const foodWastePercent = 8;
  const orderCompletionRate = 98;

  const score = calculateRestaurantHealthScore({
    inventoryHealth,
    averageMealHealth,
    customerSatisfaction,
    foodWastePercent,
    orderCompletionRate,
  });

  const maxScore = 100;
  const status =
    score >= 90
      ? "Excellent"
      : score >= 80
      ? "Good"
      : score >= 70
      ? "Fair"
      : "Poor";
  const statusEmoji = score >= 90 ? "🟢" : score >= 80 ? "🟢" : score >= 70 ? "🟡" : "🔴";

  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex shrink-0 items-center justify-center">
          <svg
            width="220"
            height="220"
            viewBox="0 0 200 200"
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted">Restaurant Health Score</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-white">
              {score}
              <span className="text-2xl font-normal text-muted">/{maxScore}</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-light">
              {statusEmoji} {status}
            </p>
          </div>
        </div>

        <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-none lg:flex-1">
          {[
            { label: "Last Updated", value: overallHealth.lastUpdated },
            {
              label: "Today's Trend",
              value: overallHealth.todayTrend,
              trend: overallHealth.todayTrendDirection,
            },
            { label: "AI Confidence", value: overallHealth.aiConfidence },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                {item.label}
              </p>
              <p
                className={`mt-1 text-lg font-semibold text-white ${
                  item.trend ? trendStyles[item.trend] : ""
                }`}
              >
                {item.trend && (
                  <span className="mr-0.5">{trendIcons[item.trend]}</span>
                )}
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
