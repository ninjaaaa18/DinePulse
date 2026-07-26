"use client";

import { useEffect, useState } from "react";
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
import { buildDietarySafetyAnalysisPayload } from "@/lib/orderAnalysis";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";

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
  const { activeOrder: orderContext } = useActiveOrder();
  const { notify } = useNotifications();
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["Diabetes"]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Vegetarian"]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Peanut"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisPayload | null>(null);

  // Reset AI state when a new order is received
  useEffect(() => {
    setAnalysisData(null);
    setAnalysisError(null);
  }, [orderContext?.orderId]);

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
      const basePayload = orderContext
        ? buildDietarySafetyAnalysisPayload(orderContext)
        : {
            customer: {
              name: "John",
              age: 28,
              diet: selectedDiets.join(", ") || "Balanced",
              medicalConditions: selectedConditions,
              allergies: selectedAllergies.map((item) =>
                item === "Peanut" ? "Peanuts" : item,
              ),
            },
            meal: {
              name: "Veg Combo Meal",
              items: ["Veg Burger", "French Fries", "Chocolate Milkshake"],
            },
            nutrition: {
              calories: 820,
              sugar: 42,
              sodium: 1240,
            },
          };

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "dietary-safety",
          data: {
            ...basePayload,
            customer: {
              ...basePayload.customer,
              diet: selectedDiets.join(", ") || basePayload.customer.diet,
              medicalConditions: selectedConditions.length
                ? selectedConditions
                : basePayload.customer.medicalConditions,
              allergies: Array.from(
                new Set([
                  ...basePayload.customer.allergies.filter((item) => item !== "None"),
                  ...selectedAllergies.map((item) => (item === "Peanut" ? "Peanuts" : item)),
                ]),
              ),
            },
            meal: {
              ...basePayload.meal,
              name: orderContext?.selectedRestaurantName ?? basePayload.meal.name,
              items: orderContext
                ? orderContext.items.map((item) => item.name)
                : basePayload.meal.items,
            },
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to analyze dietary safety.");
      }

      const analysis = normalizeAIAnalysisPayload(payload);
      setAnalysisData(analysis);
      notify({
        icon: "✦",
        title: "AI dietary review generated",
        description: analysis.safeAlternatives[0] ?? "Dietary safety recommendations are ready.",
        category: "AI",
        severity: "ai-generated",
        dedupeKey: `dietary-ai-${orderContext?.orderId ?? "sample"}`,
      });
      if (analysis.warnings.length > 0 || (analysis.riskLevel && analysis.riskLevel.toLowerCase() !== "low")) {
        notify({
          icon: "!",
          title: "Dietary safety risk detected",
          description: analysis.warnings[0] ?? `Risk level: ${analysis.riskLevel}.`,
          category: "Health",
          severity: "critical",
          dedupeKey: `dietary-risk-${orderContext?.orderId ?? "sample"}`,
        });
      }
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

      {orderContext ? (
        <Card className="border border-emerald/20 bg-emerald/10 p-4 text-sm text-emerald">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Order-driven review for {orderContext.selectedRestaurantName} • {orderContext.items.length} items
            </span>
            <span>{orderContext.totalCalories} kcal • ₹{orderContext.subtotal.toLocaleString("en-IN")}</span>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card hover className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
                  Health Profile
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Diet & Condition Alignments
                </h2>
              </div>
              <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
                Interactive Filters
              </span>
            </div>
            <p className="text-sm text-muted">
              Select active conditions, diets, and allergens to simulate how DinePulse protects diners in real time.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Medical Conditions
              </p>
              <div className="flex flex-wrap gap-2">
                {profileOptions.conditions.map((item) => {
                  const selected = selectedConditions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          item.id,
                          selectedConditions,
                          setSelectedConditions,
                        )
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                        selected
                          ? "border-emerald/40 bg-emerald/15 text-emerald-light shadow-sm shadow-emerald/10"
                          : "border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Dietary Preferences
              </p>
              <div className="flex flex-wrap gap-2">
                {profileOptions.diets.map((item) => {
                  const selected = selectedDiets.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(item.id, selectedDiets, setSelectedDiets)
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                        selected
                          ? "border-emerald/40 bg-emerald/15 text-emerald-light shadow-sm shadow-emerald/10"
                          : "border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Allergen Profile
              </p>
              <div className="flex flex-wrap gap-2">
                {profileOptions.allergies.map((item) => {
                  const selected = selectedAllergies.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          item.id,
                          selectedAllergies,
                          setSelectedAllergies,
                        )
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                        selected
                          ? "border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-500/10"
                          : "border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Run AI Allergy Safety Assessment
              </p>
              <p className="text-xs text-muted">
                Generate live safety checks and safer alternative recommendations for this order.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void handleAnalyzeWithAI()}
              disabled={isAnalyzing}
              className="whitespace-nowrap"
            >
              {isAnalyzing ? "Analyzing..." : "✦ Run Safety Review"}
            </Button>
          </div>
        </Card>

        <Card hover className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Live Safety Status
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Order Ingredient Screening
            </h2>
            <p className="mt-1 text-sm text-muted">
              Real-time cross-check of ordered items against customer health preferences.
            </p>
          </div>

          <div className="space-y-3">
            {ingredientCards.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.note}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusStyles[item.status]
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {analysisError ? (
        <Card className="border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="font-semibold">Analysis Notice</p>
          <p className="mt-1">{analysisError}</p>
        </Card>
      ) : null}

      {analysisData?.summary ? (
        <section className="space-y-4">
          <Card hover className="border border-emerald/30 bg-emerald/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h2 className="text-lg font-bold text-white">AI Safety Assessment</h2>
              </div>
              {analysisData.riskLevel ? (
                <span className="rounded-full border border-emerald/30 bg-emerald/15 px-3 py-1 text-xs font-semibold text-emerald-light">
                  Risk Level: {analysisData.riskLevel}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-emerald-light/90">
              {analysisData.summary}
            </p>

            {analysisData.warnings.length > 0 ? (
              <div className="space-y-2 border-t border-emerald/20 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Warnings & Cross-Contact Alerts
                </p>
                <ul className="space-y-1 text-sm text-amber-200">
                  {analysisData.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {analysisData.safeAlternatives.length > 0 ? (
              <div className="space-y-2 border-t border-emerald/20 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-light">
                  Recommended Safe Alternatives
                </p>
                <ul className="space-y-1 text-sm text-emerald-200">
                  {analysisData.safeAlternatives.map((alt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>✓</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
            Meal Composition
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Current Order Dish Breakdown
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mealItems.map((item) => (
            <Card key={item} hover className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{item}</h3>
                <span className="text-xs font-medium text-emerald-light">
                  Active Dish
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card hover className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Recommended Alternatives
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Healthier & Safer Substitutes
            </h2>
          </div>

          <div className="space-y-3">
            {alternativeCards.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted">{item.from}</span>
                    <span className="text-xs text-muted">→</span>
                    <span className="font-semibold text-emerald-light">
                      {item.to}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </div>
                <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
                  Score {item.scoreBefore} → {item.scoreAfter}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card hover className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Operational Guidance
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Kitchen Protocols & Advice
            </h2>
          </div>

          <div className="space-y-3">
            {adviceCards.map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border p-4 transition-all ${
                  adviceToneStyles[item.tone]
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    {item.tone}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card hover className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Audit Trail
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Safety Verification Timeline
            </h2>
          </div>

          <div className="space-y-4">
            {safetyTimeline.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/20 text-sm font-semibold text-emerald-light">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{step}</p>
                    <span className="text-xs text-emerald-light font-medium uppercase tracking-wider">Verified</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Safety check stage completed successfully.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
