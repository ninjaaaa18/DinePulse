"use client";

import { useState } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import HealthScoreOverview from "@/components/dashboard/restaurant-health/HealthScoreOverview";
import HealthParameterCard from "@/components/dashboard/restaurant-health/HealthParameterCard";
import HealthInsightsPanel from "@/components/dashboard/restaurant-health/HealthInsightsPanel";
import ImprovementSuggestions from "@/components/dashboard/restaurant-health/ImprovementSuggestions";
import WeeklyTrendChart from "@/components/dashboard/restaurant-health/WeeklyTrendChart";
import HealthBreakdown from "@/components/dashboard/restaurant-health/HealthBreakdown";
import { healthParameters } from "@/components/dashboard/restaurant-health/restaurantHealthData";
import { buildRestaurantHealthAnalysisPayload } from "@/lib/orderAnalysis";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { callAIAPI } from "@/lib/aiClient";

type AIInsightPayload = {
  summary: string;
  strengths: string[];
  issues: string[];
  recommendations: string[];
  predictedScore: number | null;
};

const defaultInsightPayload: AIInsightPayload = {
  summary: "",
  strengths: [],
  issues: [],
  recommendations: [],
  predictedScore: null,
};

function normalizeInsightPayload(payload: unknown): AIInsightPayload {
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const analysis = root.analysis && typeof root.analysis === "object" ? (root.analysis as Record<string, unknown>) : root;

    return {
      summary: typeof analysis.summary === "string" ? analysis.summary : "",
      strengths: Array.isArray(analysis.strengths)
        ? analysis.strengths.filter((item): item is string => typeof item === "string")
        : [],
      issues: Array.isArray(analysis.issues)
        ? analysis.issues.filter((item): item is string => typeof item === "string")
        : [],
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations.filter((item): item is string => typeof item === "string")
        : [],
      predictedScore:
        typeof analysis.predictedScore === "number"
          ? analysis.predictedScore
          : typeof analysis.predicted_health_score === "number"
            ? analysis.predicted_health_score
            : null,
    };
  }

  return defaultInsightPayload;
}

export default function RestaurantHealthDashboard() {
  const { activeOrder: orderContext } = useActiveOrder();
  const { notify } = useNotifications();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<AIInsightPayload | null>(null);

  async function handleGenerateAIInsights() {
    setIsGeneratingInsights(true);
    setInsightError(null);
    setInsightData(null);

    try {
      const basePayload = orderContext
        ? buildRestaurantHealthAnalysisPayload(orderContext)
        : {
            restaurant: {
              name: "North Harbor Kitchen",
              cuisine: "Modern Bistro",
              deliveryTime: "18–24 min",
              orderVolume: 324,
              averageTicket: 24.8,
            },
            order: {
              items: ["Signature Burger", "Truffle Fries"],
              totalCalories: 980,
              averageMealScore: 89,
            },
          };

      const rawInsight = await callAIAPI<Record<string, unknown>>({
        type: "restaurant-health",
        data: basePayload,
      });

      const insight = normalizeInsightPayload({ success: true, analysis: rawInsight });
      setInsightData(insight);
      notify({
        icon: "↗",
        title: "Restaurant health updated",
        description: insight.summary || "Restaurant health insights are ready to review.",
        category: "Orders",
        severity: "information",
        dedupeKey: `restaurant-health-${orderContext?.orderId ?? "sample"}`,
      });
      notify({
        icon: "✦",
        title: "AI recommendation generated",
        description: insight.recommendations[0] ?? "New operational guidance is available.",
        category: "AI Insights",
        severity: "ai-generated",
        dedupeKey: `restaurant-ai-${orderContext?.orderId ?? "sample"}`,
      });
    } catch (error) {
      setInsightError(
        error instanceof Error ? error.message : "Unable to generate AI insights right now.",
      );
    } finally {
      setIsGeneratingInsights(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurant Health
        </h1>
        <p className="mt-1 text-muted">
          AI-powered health monitoring for your restaurant operations
        </p>
      </header>

      {orderContext ? (
        <Card className="border border-emerald/20 bg-emerald/10 p-4 text-sm text-emerald">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Order-aware review for {orderContext.selectedRestaurantName} • {orderContext.items.length} items
            </span>
            <span>{orderContext.totalCalories} kcal • ${orderContext.subtotal.toFixed(1)}</span>
          </div>
        </Card>
      ) : null}

      <section aria-label="Overall health score" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Restaurant Health Score</h2>
            <p className="text-sm text-muted">A live snapshot of your restaurant's operations.</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerateAIInsights}
            disabled={isGeneratingInsights}
            className="w-full sm:w-auto"
          >
            {isGeneratingInsights ? "Generating..." : "✨ Generate AI Insights"}
          </Button>
        </div>
        <HealthScoreOverview />
      </section>

      <section aria-label="Health parameters">
        <h2 className="mb-4 text-lg font-semibold text-white">Health Parameters</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {healthParameters.map((param) => (
            <HealthParameterCard key={param.id} {...param} />
          ))}
        </div>
      </section>

      <section aria-label="AI insights" className="space-y-4">
        {insightError ? (
          <Card className="border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {insightError}
          </Card>
        ) : null}

        {isGeneratingInsights ? (
          <Card hover className="border border-emerald/20 bg-gradient-to-br from-emerald/10 to-transparent p-5">
            <div className="flex items-center gap-3 text-emerald">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-semibold">AI is analyzing restaurant performance...</p>
                <p className="mt-1 text-sm text-muted">
                  Checking customer satisfaction, inventory, sales, and staffing health.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>• Checking customer satisfaction...</p>
              <p>• Checking inventory...</p>
              <p>• Analyzing sales...</p>
              <p>• Generating recommendations...</p>
            </div>
          </Card>
        ) : null}

        {insightData ? (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="border border-emerald/20 bg-gradient-to-br from-emerald/10 to-transparent p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">
                🧠 Overall Summary
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                {insightData.summary || "No summary was returned by the AI service."}
              </p>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border border-emerald/15 bg-background/60 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">
                  ✅ Strengths
                </p>
                <div className="mt-4 space-y-2">
                  {insightData.strengths.length > 0 ? (
                    insightData.strengths.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-emerald/15 bg-emerald/10 px-3 py-2 text-sm text-white/90"
                      >
                        • {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No strengths were returned.</p>
                  )}
                </div>
              </Card>

              <Card className="border border-rose-500/20 bg-background/60 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
                  ⚠ Issues
                </p>
                <div className="mt-4 space-y-2">
                  {insightData.issues.length > 0 ? (
                    insightData.issues.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100/90"
                      >
                        • {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No issues were returned.</p>
                  )}
                </div>
              </Card>
            </div>

            <Card className="border border-white/10 bg-background/60 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">
                💡 AI Recommendations
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {insightData.recommendations.length > 0 ? (
                  insightData.recommendations.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-surface/70 p-3 text-sm leading-relaxed text-white/90"
                    >
                      • {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-muted">
                    No recommendations were generated.
                  </div>
                )}
              </div>
            </Card>

            <Card className="border border-emerald/15 bg-gradient-to-r from-emerald/10 to-transparent p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                    📈 Predicted Health Score
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Estimated after implementing the recommendations.
                  </p>
                </div>
                <div className="rounded-full border border-emerald/20 bg-emerald/10 px-4 py-2 text-lg font-semibold text-emerald">
                  {insightData.predictedScore ?? "—"}/100
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </section>

      <section aria-label="Health insights">
        <HealthInsightsPanel />
      </section>

      <section
        aria-label="Trends and breakdown"
        className="grid gap-6 lg:grid-cols-2"
      >
        <WeeklyTrendChart />
        <HealthBreakdown />
      </section>

      <section aria-label="Improvement suggestions">
        <ImprovementSuggestions />
      </section>
    </div>
  );
}
