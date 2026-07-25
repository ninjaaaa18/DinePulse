"use client";

import { useState } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import {
  adviceCards,
  alternativeCards,
  ingredientCards,
  mealItems,
  profileOptions,
  safetyTimeline,
} from "@/components/dashboard/allergy-safety/allergySafetyData";

const statusStyles = {
  Safe: "bg-emerald/15 text-emerald border-emerald/30",
  Warning: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  Avoid: "bg-rose-500/15 text-rose-300 border-rose-500/20",
};

const adviceToneStyles = {
  danger: "border-rose-500/25 bg-rose-500/10",
  info: "border-sky-500/25 bg-sky-500/10",
  success: "border-emerald/25 bg-emerald/10",
};

type AIAnalysisPayload = {
  summary: string;
  warnings: string[];
  healthRisks: string[];
  safeAlternatives: string[];
  riskLevel: string;
  improvedScore: number | null;
};

const defaultAIAnalysis: AIAnalysisPayload = {
  summary: "",
  warnings: [],
  healthRisks: [],
  safeAlternatives: [],
  riskLevel: "",
  improvedScore: null,
};

function normalizeAIAnalysisPayload(payload: unknown): AIAnalysisPayload {
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const analysis = root.analysis && typeof root.analysis === "object" ? (root.analysis as Record<string, unknown>) : root;

    return {
      summary: typeof analysis.summary === "string" ? analysis.summary : "",
      warnings: Array.isArray(analysis.warnings)
        ? analysis.warnings.filter((item): item is string => typeof item === "string")
        : [],
      healthRisks: Array.isArray(analysis.healthRisks)
        ? analysis.healthRisks.filter((item): item is string => typeof item === "string")
        : [],
      safeAlternatives: Array.isArray(analysis.safeAlternatives)
        ? analysis.safeAlternatives.filter((item): item is string => typeof item === "string")
        : [],
      riskLevel: typeof analysis.riskLevel === "string" ? analysis.riskLevel : "",
      improvedScore:
        typeof analysis.improvedScore === "number"
          ? analysis.improvedScore
          : typeof analysis.score === "number"
            ? analysis.score
            : null,
    };
  }

  return defaultAIAnalysis;
}

export default function AllergySafetyDashboard() {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["Diabetes"]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Vegetarian"]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Peanut"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisPayload | null>(null);

  const toggleSelection = (
    value: string,
    current: string[],
    setCurrent: (value: string[]) => void,
  ) => {
    setCurrent(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  async function handleAnalyzeWithAI() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisData(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "dietary-safety",
          data: {
            customer: {
              name: "John",
              age: 28,
              diet: "Vegetarian",
              medicalConditions: ["Diabetes"],
              allergies: ["Peanuts", "Lactose"],
            },
            meal: {
              name: "Veg Combo Meal",
              items: ["Veg Burger", "French Fries", "Chocolate Milkshake"],
            },
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to analyze dietary safety.");
      }

      setAnalysisData(normalizeAIAnalysisPayload(payload));
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to analyze dietary safety.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">
          Dietary Safety
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Allergy Safety Module
        </h1>
        <p className="max-w-3xl text-sm text-muted sm:text-base">
          Build a safer dining experience by aligning meals with health needs,
          dietary preferences, and allergy alerts.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card hover className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Customer Health Profile
                </h2>
                <p className="text-sm text-muted">
                  Select conditions, preferences, and allergies that matter.
                </p>
              </div>
              <span className="rounded-full border border-emerald/25 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                Personalized
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                  Health Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileOptions.conditions.map((item) => {
                    const active = selectedConditions.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          toggleSelection(item.id, selectedConditions, setSelectedConditions)
                        }
                        className={`rounded-full border px-3 py-2 text-sm transition-all ${
                          active
                            ? "border-emerald/40 bg-emerald/15 text-emerald"
                            : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                  Diet Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileOptions.diets.map((item) => {
                    const active = selectedDiets.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelection(item.id, selectedDiets, setSelectedDiets)}
                        className={`rounded-full border px-3 py-2 text-sm transition-all ${
                          active
                            ? "border-emerald/40 bg-emerald/15 text-emerald"
                            : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileOptions.allergies.map((item) => {
                    const active = selectedAllergies.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          toggleSelection(item.id, selectedAllergies, setSelectedAllergies)
                        }
                        className={`rounded-full border px-3 py-2 text-sm transition-all ${
                          active
                            ? "border-emerald/40 bg-emerald/15 text-emerald"
                            : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card hover className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Selected Meal</h2>
              <p className="text-sm text-muted">A representative sample for analysis.</p>
            </div>
            <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
              Example
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Chicken Burger</h3>
                <p className="mt-1 text-sm text-muted">A classic comfort meal</p>
              </div>
              <div className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                Quick Scan
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {mealItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/70 px-3 py-2"
                >
                  <span className="text-sm text-white">{item}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted">
                    Item
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                Ingredient list
              </h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Chicken patty</li>
                <li>• Sesame bun</li>
                <li>• Cheese slice</li>
                <li>• Fried potato strips</li>
                <li>• Carbonated beverage</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card hover className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Safety Analysis</h2>
              <p className="text-sm text-muted">Health and allergy risk overview.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? "Analyzing..." : "🛡️ Analyze with AI"}
            </Button>
          </div>

          <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-emerald">Overall Safety Score</p>
                <p className="text-4xl font-semibold text-white">92/100</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald">Status</p>
                <p className="text-xl font-semibold text-white">Safe</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
              Warnings
            </h3>
            <div className="space-y-3">
              {[
                { title: "⚠ Contains Peanut", body: "Cross-contact risk from shared preparation surfaces." },
                { title: "⚠ High Sugar", body: "Soft drink contributes to a sharp sugar spike." },
                { title: "⚠ High Sodium", body: "Burger bun and fries increase salt intake." },
              ].map((warning) => (
                <div key={warning.title} className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="font-medium text-amber-300">{warning.title}</p>
                  <p className="mt-1 text-sm text-amber-100/90">{warning.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card hover className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Healthier Alternatives</h2>
            <p className="text-sm text-muted">Small swaps can yield a significantly safer score.</p>
          </div>

          <div className="space-y-4">
            {alternativeCards.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted">Swap</span>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted">{item.from}</p>
                    <p className="text-emerald">↓</p>
                    <p className="font-medium text-white">{item.to}</p>
                  </div>
                  <div className="rounded-xl border border-emerald/20 bg-emerald/10 px-3 py-2 text-sm text-emerald">
                    Meal Score {item.scoreBefore} → {item.scoreAfter}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card hover className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Health Advice</h2>
            <p className="text-sm text-muted">Concise recommendations powered by your profile.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {adviceCards.map((card) => (
              <div key={card.title} className={`rounded-2xl border p-4 ${adviceToneStyles[card.tone]}`}>
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-sm text-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card hover className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
            <p className="text-sm text-muted">Structured insights from the dietary safety model.</p>
          </div>

          {isAnalyzing ? (
            <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-5 text-sm text-emerald">
              <p className="font-medium">Checking ingredients…</p>
              <p className="mt-2 text-emerald/80">Checking allergies…</p>
              <p className="mt-2 text-emerald/80">Generating recommendations…</p>
            </div>
          ) : analysisError ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
              <p className="font-medium">Unable to produce AI analysis.</p>
              <p className="mt-2 text-rose-100/80">{analysisError}</p>
            </div>
          ) : analysisData ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4">
                <p className="text-sm text-emerald">Overall summary</p>
                <p className="mt-2 text-sm text-white">{analysisData.summary}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
                  <p className="text-sm font-semibold text-white">Allergy warnings</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    {analysisData.warnings.length > 0 ? (
                      analysisData.warnings.map((warning) => <li key={warning}>• {warning}</li>)
                    ) : (
                      <li>• No major allergy risks detected.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
                  <p className="text-sm font-semibold text-white">Health risks</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    {analysisData.healthRisks.length > 0 ? (
                      analysisData.healthRisks.map((risk) => <li key={risk}>• {risk}</li>)
                    ) : (
                      <li>• No major health concerns noted.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Risk level</p>
                    <p className="mt-1 text-sm text-muted">{analysisData.riskLevel}</p>
                  </div>
                  <div className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                    Score {analysisData.improvedScore ?? "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
                <p className="text-sm font-semibold text-white">Safe alternatives</p>
                <ul className="mt-2 space-y-2 text-sm text-muted">
                  {analysisData.safeAlternatives.length > 0 ? (
                    analysisData.safeAlternatives.map((alternative) => <li key={alternative}>• {alternative}</li>)
                  ) : (
                    <li>• No alternatives suggested.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-background/60 p-5 text-sm text-muted">
              <p>Use the analysis button to generate a tailored AI view of the selected meal.</p>
            </div>
          )}
        </Card>

        <Card hover className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Meal Ingredients</h2>
            <p className="text-sm text-muted">Each ingredient is labeled by safety level.</p>
          </div>
          <div className="grid gap-3">
            {ingredientCards.map((ingredient) => (
              <div key={ingredient.name} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{ingredient.name}</p>
                  <p className="mt-1 text-sm text-muted">{ingredient.note}</p>
                </div>
                <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm ${statusStyles[ingredient.status]}`}>
                  {ingredient.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card hover className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Safety Timeline</h2>
          <p className="text-sm text-muted">A simple view of how the decision path flows.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {safetyTimeline.map((step, index) => (
            <div key={step} className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10 text-sm font-semibold text-emerald">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white">{step}</p>
              </div>
              {index < safetyTimeline.length - 1 && (
                <div className="hidden h-px flex-1 bg-gradient-to-r from-emerald/70 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
