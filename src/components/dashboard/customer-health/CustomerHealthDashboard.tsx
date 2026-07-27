"use client";

import { useEffect, useState } from "react";
import MealHealthScoreOverview from "@/components/dashboard/customer-health/MealHealthScoreOverview";
import SelectedMealCard from "@/components/dashboard/customer-health/SelectedMealCard";
import NutritionBreakdownCard from "@/components/dashboard/customer-health/NutritionBreakdownCard";
import HealthWarningsPanel from "@/components/dashboard/customer-health/HealthWarningsPanel";
import HealthierAlternatives from "@/components/dashboard/customer-health/HealthierAlternatives";
import AIMealAnalysis from "@/components/dashboard/customer-health/AIMealAnalysis";
import NutritionRadarChart from "@/components/dashboard/customer-health/NutritionRadarChart";
import DailyNutritionSummary from "@/components/dashboard/customer-health/DailyNutritionSummary";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { buildCustomerHealthAnalysisPayload } from "@/lib/orderAnalysis";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { callAIAPI } from "@/lib/aiClient";

type AnalysisPayload = {
  summary: string;
  positives: string[];
  risks: string[];
  recommendations: string[];
  improvedScore: number | null;
};

const defaultAnalysis: AnalysisPayload = {
  summary: "",
  positives: [],
  risks: [],
  recommendations: [],
  improvedScore: null,
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeAnalysisPayload(payload: unknown): AnalysisPayload {
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const analysis = root.analysis && typeof root.analysis === "object" ? (root.analysis as Record<string, unknown>) : root;

    const summary = typeof analysis.summary === "string" ? analysis.summary : "";
    const positives = normalizeStringArray(
      analysis.positives ?? analysis.positivePoints ?? analysis.positives,
    );
    const risks = normalizeStringArray(analysis.risks ?? analysis.healthRisks ?? []);
    const recommendations = normalizeStringArray(
      analysis.recommendations ?? analysis.aiRecommendations ?? [],
    );
    const improvedScore =
      typeof analysis.improvedScore === "number"
        ? analysis.improvedScore
        : typeof analysis.score === "number"
          ? analysis.score
          : null;

    return {
      summary,
      positives,
      risks,
      recommendations,
      improvedScore,
    };
  }

  return defaultAnalysis;
}

export default function CustomerHealthDashboard() {
  const { activeOrder: orderContext } = useActiveOrder();
  const { notify } = useNotifications();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisPayload | null>(null);

  // Reset AI state when a new order is received
  useEffect(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
  }, [orderContext?.orderId]);

  useEffect(() => {
    if (!orderContext || isAnalyzing || analysisResult || analysisError) {
      return;
    }

    void handleAnalyzeWithAI();
  }, [analysisError, analysisResult, isAnalyzing, orderContext]);

  async function handleAnalyzeWithAI() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const requestPayload = orderContext
        ? buildCustomerHealthAnalysisPayload(orderContext)
        : {
            meal: ["Chicken Burger", "French Fries", "Coke"],
            nutrition: {
              calories: 842,
              protein: 38,
              carbohydrates: 96,
              fat: 34,
              sugar: 42,
              sodium: 1240,
              fiber: 6,
            },
          };

      const rawAnalysis = await callAIAPI<Record<string, unknown>>({
        type: "meal-analysis",
        prompt:
          "Analyze this meal using the provided nutrition values. Keep the response concise and actionable.",
        data: requestPayload,
      });

      const analysis = normalizeAnalysisPayload({ success: true, analysis: rawAnalysis });
      setAnalysisResult(analysis);
      notify({
        icon: "✦",
        title: "AI meal analysis generated",
        description: analysis.recommendations[0] ?? "Your meal health insights are ready to review.",
        category: "AI Insights",
        severity: "ai-generated",
        dedupeKey: `meal-analysis-${orderContext?.orderId ?? "sample"}`,
      });
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to analyze the meal right now.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Customer Meal Health
        </h1>
        <p className="mt-1 text-muted">
          AI-powered nutritional analysis for your selected meal
        </p>
      </header>

      <section aria-label="Meal health score">
        <MealHealthScoreOverview />
      </section>

      <section
        aria-label="Meal details and daily summary"
        className="grid gap-6 lg:grid-cols-2"
      >
        <SelectedMealCard />
        <DailyNutritionSummary />
      </section>

      <section aria-label="Nutrition breakdown">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Nutrition Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(orderContext
            ? [
                {
                  id: "calories",
                  label: "Calories",
                  icon: "🔥",
                  current: orderContext.totalCalories,
                  recommended: 650,
                  unit: "kcal",
                  status: orderContext.totalCalories > 800 ? ("warning" as const) : ("good" as const),
                  gradient: "from-orange-500/20 to-amber-500/10",
                  accent: "text-orange-400",
                  bar: "bg-gradient-to-r from-orange-500 to-amber-400",
                },
                {
                  id: "protein",
                  label: "Protein",
                  icon: "💪",
                  current: orderContext.items.reduce((acc, i) => acc + i.protein * i.quantity, 0),
                  recommended: 35,
                  unit: "g",
                  status: "good" as const,
                  gradient: "from-emerald/20 to-green-500/10",
                  accent: "text-emerald-light",
                  bar: "bg-gradient-to-r from-emerald to-emerald-light",
                },
                {
                  id: "carbs",
                  label: "Carbs",
                  icon: "🌾",
                  current: orderContext.items.reduce((acc, i) => acc + i.carbohydrates * i.quantity, 0),
                  recommended: 80,
                  unit: "g",
                  status: "moderate" as const,
                  gradient: "from-blue-500/20 to-cyan-500/10",
                  accent: "text-blue-400",
                  bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
                },
                {
                  id: "fat",
                  label: "Fat",
                  icon: "🥑",
                  current: orderContext.items.reduce((acc, i) => acc + i.fat * i.quantity, 0),
                  recommended: 30,
                  unit: "g",
                  status: "moderate" as const,
                  gradient: "from-yellow-500/20 to-lime-500/10",
                  accent: "text-yellow-400",
                  bar: "bg-gradient-to-r from-yellow-500 to-lime-400",
                },
                {
                  id: "sugar",
                  label: "Sugar",
                  icon: "🍬",
                  current: orderContext.items.reduce((acc, i) => acc + i.sugar * i.quantity, 0),
                  recommended: 25,
                  unit: "g",
                  status: orderContext.items.reduce((acc, i) => acc + i.sugar * i.quantity, 0) > 25 ? ("warning" as const) : ("good" as const),
                  gradient: "from-pink-500/20 to-rose-500/10",
                  accent: "text-pink-400",
                  bar: "bg-gradient-to-r from-pink-500 to-rose-400",
                },
                {
                  id: "sodium",
                  label: "Sodium",
                  icon: "🧂",
                  current: orderContext.items.reduce((acc, i) => acc + i.sodium * i.quantity, 0),
                  recommended: 800,
                  unit: "mg",
                  status: orderContext.items.reduce((acc, i) => acc + i.sodium * i.quantity, 0) > 1000 ? ("warning" as const) : ("good" as const),
                  gradient: "from-red-500/20 to-orange-500/10",
                  accent: "text-red-400",
                  bar: "bg-gradient-to-r from-red-500 to-orange-400",
                },
                {
                  id: "fiber",
                  label: "Fiber",
                  icon: "🥬",
                  current: orderContext.items.reduce((acc, i) => acc + (i.carbohydrates > 30 ? 6 : 3) * i.quantity, 0),
                  recommended: 15,
                  unit: "g",
                  status: "critical" as const,
                  gradient: "from-emerald-dark/20 to-emerald/10",
                  accent: "text-emerald-light",
                  bar: "bg-gradient-to-r from-emerald-dark to-emerald",
                },
              ]
            : []
          ).map((nutrient) => (
            <NutritionBreakdownCard key={nutrient.id} {...nutrient} />
          ))}
          {!orderContext ? (
            <div className="col-span-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center text-sm text-muted">
              No active order selected. Place an order on the Order Food page to view your live nutrition breakdown.
            </div>
          ) : null}
        </div>
      </section>

      <section aria-label="AI guided analysis">
        <Card hover className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
              <p className="text-sm text-muted">
                Send the selected meal to Gemini for a structured health review.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? "Analyzing..." : "✨ Analyze with AI"}
            </Button>
          </div>

          {analysisError ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {analysisError}
            </div>
          ) : null}

          {analysisResult ? (
            <div className="space-y-4 animate-fade-in-up">
              <Card className="border border-emerald/20 bg-gradient-to-br from-emerald/10 to-transparent p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">
                      Overall Summary
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      {analysisResult.summary || "No summary was returned by the AI service."}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                    AI Insight
                  </span>
                </div>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="border border-emerald/15 bg-background/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                      Positive Points
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {analysisResult.positives.length > 0 ? (
                      analysisResult.positives.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 rounded-xl border border-emerald/15 bg-emerald/10 px-3 py-2 text-sm text-white/90"
                        >
                          <span className="mt-0.5 text-emerald">✓</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted">No positive points were identified.</li>
                    )}
                  </ul>
                </Card>

                <Card className="border border-rose-500/20 bg-background/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
                      Health Risks
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {analysisResult.risks.length > 0 ? (
                      analysisResult.risks.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100/90"
                        >
                          <span className="mt-0.5 text-rose-300">⚠</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted">No major health risks were flagged.</li>
                    )}
                  </ul>
                </Card>
              </div>

              <Card className="border border-white/10 bg-background/60 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                    AI Recommendations
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {analysisResult.recommendations.length > 0 ? (
                    analysisResult.recommendations.map((item) => (
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
                      Improved Meal Score
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Estimated improvement after applying AI suggestions.
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald/20 bg-emerald/10 px-4 py-2 text-lg font-semibold text-emerald">
                    {analysisResult.improvedScore ?? "—"}/100
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-background/40 p-6 text-sm text-muted">
              Click the button to generate a fresh AI review for this meal.
            </div>
          )}
        </Card>
      </section>

      <section
        aria-label="Warnings and alternatives"
        className="grid gap-6 lg:grid-cols-2"
      >
        <HealthWarningsPanel />
        <HealthierAlternatives />
      </section>

      <section aria-label="AI meal analysis">
        <AIMealAnalysis />
      </section>

      <section aria-label="Nutrition chart">
        <NutritionRadarChart />
      </section>
    </div>
  );
}
