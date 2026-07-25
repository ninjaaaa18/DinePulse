"use client";

import { useState } from "react";
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
import { nutritionBreakdown } from "@/components/dashboard/customer-health/customerHealthData";

type AnalysisSectionKey =
  | "overallSummary"
  | "positivePoints"
  | "healthRisks"
  | "aiRecommendations"
  | "improvedMealScore"
  | "suggestedMealChanges";

type AnalysisPayload = {
  overallSummary: string[];
  positivePoints: string[];
  healthRisks: string[];
  aiRecommendations: string[];
  improvedMealScore: string[];
  suggestedMealChanges: string[];
};

const sectionLabels: Record<AnalysisSectionKey, string> = {
  overallSummary: "Overall Summary",
  positivePoints: "Positive Points",
  healthRisks: "Health Risks",
  aiRecommendations: "AI Recommendations",
  improvedMealScore: "Improved Meal Score",
  suggestedMealChanges: "Suggested Meal Changes",
};

const defaultAnalysis: AnalysisPayload = {
  overallSummary: [],
  positivePoints: [],
  healthRisks: [],
  aiRecommendations: [],
  improvedMealScore: [],
  suggestedMealChanges: [],
};

function parseAIAnalysis(rawResponse: string): AnalysisPayload {
  const normalized = rawResponse.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\r/g, "");
  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: AnalysisPayload = { ...defaultAnalysis };
  let currentSection: AnalysisSectionKey | null = null;

  for (const line of lines) {
    const headingMatch = line.match(
      /^(Overall Summary|Positive Points|Health Risks|AI Recommendations|Improved Meal Score|Suggested Meal Changes)\s*[:\-]?$/i,
    );

    if (headingMatch) {
      const label = headingMatch[1].toLowerCase().replace(/\s+/g, "");
      const sectionKey =
        label === "overallsummary"
          ? "overallSummary"
          : label === "positivepoints"
            ? "positivePoints"
            : label === "healthrisks"
              ? "healthRisks"
              : label === "airecommendations"
                ? "aiRecommendations"
                : label === "improvedmealscore"
                  ? "improvedMealScore"
                  : "suggestedMealChanges";
      currentSection = sectionKey;
      continue;
    }

    const cleaned = line.replace(/^[-*•]\s*/, "");

    if (!cleaned) {
      continue;
    }

    if (!currentSection) {
      sections.overallSummary.push(cleaned);
      continue;
    }

    sections[currentSection].push(cleaned);
  }

  if (sections.overallSummary.length === 0 && normalized) {
    sections.overallSummary = [normalized];
  }

  return sections;
}

export default function CustomerHealthDashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisPayload | null>(null);

  async function handleAnalyzeWithAI() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "meal-analysis",
          prompt:
            "Analyze this meal using the provided nutrition values. Return the answer in sections with headings: Overall Summary, Positive Points, Health Risks, AI Recommendations, Improved Meal Score, and Suggested Meal Changes. Keep it concise and actionable.",
          data: {
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
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to analyze the meal right now.");
      }

      setAnalysisResult(parseAIAnalysis(payload.response || ""));
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
          {nutritionBreakdown.map((nutrient) => (
            <NutritionBreakdownCard key={nutrient.id} {...nutrient} />
          ))}
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
            <div className="grid gap-4 xl:grid-cols-2">
              {Object.entries(sectionLabels).map(([key, label]) => {
                const sectionKey = key as AnalysisSectionKey;
                const items = analysisResult[sectionKey];

                if (sectionKey === "improvedMealScore") {
                  return (
                    <div
                      key={sectionKey}
                      className="rounded-2xl border border-white/10 bg-background/60 p-4"
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                        {label}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <p key={item} className="text-sm text-white/90">
                              {item}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted">No score details available.</p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={sectionKey}
                    className="rounded-2xl border border-white/10 bg-background/60 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                      {label}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <li key={item} className="text-sm leading-relaxed text-white/90">
                            • {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted">No details available yet.</li>
                      )}
                    </ul>
                  </div>
                );
              })}
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
