"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import {
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
  type AnalyticsSnapshot,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import { callAIAPI } from "@/lib/aiClient";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Prediction = {
  id: string;
  icon: string;
  title: string;
  value: string;
  description: string;
  confidence: number;
  trend: "up" | "down" | "steady";
  priority: Priority;
  action: string;
};
type AIForecast = {
  summary: string;
  predictions: Array<{
    title: string;
    forecast: string;
    confidence: number | null;
    priority: string;
    action: string;
  }>;
};

const priorityStyles: Record<Priority, string> = {
  Critical: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  High: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  Medium: "border-sky-500/25 bg-sky-500/10 text-sky-200",
  Low: "border-emerald/25 bg-emerald/10 text-emerald",
};

const trendLabels: Record<Prediction["trend"], string> = {
  up: "↑ Rising",
  down: "↓ Falling",
  steady: "→ Steady",
};

function HighlightText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed || !text) return <span>{text}</span>;

  const regex = new RegExp(`(${trimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  let matchCount = 0;
  let textCount = 0;

  return (
    <span>
      {parts.map((part) => {
        const isMatch = part.toLowerCase() === trimmed.toLowerCase();
        const key = isMatch
          ? `highlight-match-${part.slice(0, 8)}-${++matchCount}`
          : `highlight-text-${part.slice(0, 8)}-${++textCount}`;

        return isMatch ? (
          <mark
            key={key}
            className="rounded bg-emerald/25 px-0.5 py-0 font-semibold text-emerald-light"
          >
            {part}
          </mark>
        ) : (
          <span key={key}>{part}</span>
        );
      })}
    </span>
  );
}

function createPredictions(
  analytics: AnalyticsSnapshot,
  inventory: InventoryIngredient[],
): Prediction[] {
  const lowIngredients = inventory.filter(
    (item) => item.status === "Low" || item.status === "Critical",
  );
  const lowestIngredient = [...inventory].sort(
    (left, right) => left.remainingPercent - right.remainingPercent,
  )[0];
  const forecastedDemand =
    analytics.totalOrders > 0 ? Math.round(analytics.totalOrders * 1.12) : 32;
  const healthyDemand =
    analytics.totalOrders > 0
      ? Math.min(98, Math.max(0, Math.round(analytics.healthyMealPercent + 6)))
      : 64;
  const consumedStock = inventory.filter((item) => item.stockChange < 0).length;
  const expectedWaste = Math.min(
    14,
    Math.max(2, Math.round(3 + consumedStock * 0.6 + lowIngredients.length)),
  );
  const peakHours = analytics.totalOrders >= 10 ? "7–9 PM" : "12–2 PM";

  return [
    {
      id: "demand",
      icon: "↗",
      title: "Tomorrow's demand",
      value: `${forecastedDemand} orders`,
      description:
        "Expected order volume based on current order momentum and recent revenue activity.",
      confidence: analytics.totalOrders > 0 ? 84 : 68,
      trend: "up",
      priority: "Medium",
      action: "Prepare high-demand menu items before the next service window.",
    },
    {
      id: "inventory",
      icon: "!",
      title: "Ingredients likely to run low",
      value: lowIngredients.length
        ? lowIngredients.map((item) => item.name).join(", ")
        : lowestIngredient?.name ?? "No shortages forecast",
      description: lowIngredients.length
        ? `${lowIngredients.length} ingredient${lowIngredients.length === 1 ? " is" : "s are"} already nearing the reorder threshold.`
        : `${lowestIngredient?.name ?? "Current inventory"} has the lowest remaining buffer at ${lowestIngredient?.remainingPercent ?? 100}%.`,
      confidence: lowIngredients.length ? 93 : 77,
      trend: lowIngredients.length ? "down" : "steady",
      priority: lowIngredients.some((item) => item.status === "Critical")
        ? "Critical"
        : lowIngredients.length
        ? "High"
        : "Low",
      action: lowIngredients.length
        ? "Create a restock request before tomorrow's peak period."
        : "Keep monitoring the lowest-stock ingredient.",
    },
    {
      id: "peak-hours",
      icon: "◷",
      title: "Peak business hours",
      value: peakHours,
      description:
        "The next demand spike is expected during the strongest projected service window.",
      confidence: 79,
      trend: "up",
      priority: "Medium",
      action: "Schedule additional kitchen coverage and prep popular dishes in advance.",
    },
    {
      id: "food-waste",
      icon: "♻",
      title: "Expected food waste",
      value: `${expectedWaste}%`,
      description:
        "Projected from current ingredient consumption and available stock buffers.",
      confidence: 74,
      trend: expectedWaste >= 8 ? "up" : "steady",
      priority: expectedWaste >= 10 ? "High" : "Low",
      action: "Prioritize perishable stock in specials and adjust prep quantities.",
    },
    {
      id: "trending-item",
      icon: "★",
      title: "Trending menu item",
      value:
        analytics.popularDish === "No orders yet"
          ? "Grill Chicken Bowl"
          : analytics.popularDish,
      description:
        "This dish is leading recent customer demand and is a strong candidate for promotion.",
      confidence: analytics.totalOrders > 0 ? 88 : 70,
      trend: "up",
      priority: "Low",
      action: "Feature this item in tomorrow's special or recommend it at checkout.",
    },
    {
      id: "healthy-demand",
      icon: "♥",
      title: "Healthy meal demand",
      value: `${healthyDemand}%`,
      description:
        "Projected share of orders expected to meet the current healthy-meal threshold.",
      confidence: analytics.totalOrders > 0 ? 81 : 69,
      trend: healthyDemand >= 70 ? "up" : "steady",
      priority: "Low",
      action: "Keep healthy choices visible and pair them with high-demand menu items.",
    },
  ];
}

function normalizeAIForecast(payload: unknown): AIForecast {
  const analysis =
    payload && typeof payload === "object" && "analysis" in payload
      ? (payload as { analysis: Record<string, unknown> }).analysis
      : (payload as Record<string, unknown> | null);
  const predictions = Array.isArray(analysis?.predictions) ? analysis.predictions : [];
  return {
    summary: typeof analysis?.summary === "string" ? analysis.summary : "AI forecast completed.",
    predictions: predictions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const prediction = item as Record<string, unknown>;
      return [
        {
          title: typeof prediction.title === "string" ? prediction.title : "Forecast",
          forecast:
            typeof prediction.forecast === "string"
              ? prediction.forecast
              : "Review the AI forecast details.",
          confidence:
            typeof prediction.confidence === "number" ? prediction.confidence : null,
          priority:
            typeof prediction.priority === "string" ? prediction.priority : "Medium",
          action:
            typeof prediction.action === "string" ? prediction.action : "Monitor this signal.",
        },
      ];
    }),
  };
}

export default function AIPredictionsDashboard() {
  const { activeOrder } = useActiveOrder();
  const { notify } = useNotifications();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() =>
    getStoredAnalyticsSnapshot(),
  );
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() =>
    getStoredInventoryState(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecast, setForecast] = useState<AIForecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnalytics(getStoredAnalyticsSnapshot());
    setInventory(getStoredInventoryState());
  }, [activeOrder]);

  const predictions = useMemo(
    () => createPredictions(analytics, inventory),
    [analytics, inventory],
  );

  useEffect(() => {
    const inventoryPrediction = predictions.find((item) => item.id === "inventory");
    if (inventoryPrediction && inventoryPrediction.priority !== "Low") {
      notify({
        icon: "!",
        title: "Low stock forecast",
        description: `${inventoryPrediction.value} needs attention before tomorrow's service.`,
        category: "Inventory",
        severity: inventoryPrediction.priority === "Critical" ? "critical" : "warning",
        dedupeKey: `prediction-stock-${activeOrder?.orderId ?? "baseline"}`,
      });
    }
  }, [activeOrder?.orderId, notify, predictions]);

  // Real-time search filtering across predictions, items, inventory, and actions
  const filteredPredictions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return predictions;

    return predictions.filter((pred) => {
      const matchTitle = pred.title.toLowerCase().includes(q);
      const matchDesc = pred.description.toLowerCase().includes(q);
      const matchValue = pred.value.toLowerCase().includes(q);
      const matchAction = pred.action.toLowerCase().includes(q);
      const matchPriority = pred.priority.toLowerCase().includes(q);
      const matchPopularDish = analytics.popularDish.toLowerCase().includes(q);
      const matchTopFoods = analytics.topSellingFoods.some((f) =>
        (typeof f === "string" ? f : f.label).toLowerCase().includes(q),
      );
      const matchInventory = inventory.some((i) => i.name.toLowerCase().includes(q));

      return (
        matchTitle ||
        matchDesc ||
        matchValue ||
        matchAction ||
        matchPriority ||
        matchPopularDish ||
        matchTopFoods ||
        matchInventory
      );
    });
  }, [predictions, searchQuery, analytics, inventory]);

  // Real-time search filtering across Gemini AI forecast results
  const filteredForecastPredictions = useMemo(() => {
    if (!forecast) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return forecast.predictions;

    const summaryMatches = forecast.summary.toLowerCase().includes(q);
    if (summaryMatches) return forecast.predictions;

    return forecast.predictions.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.forecast.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.priority.toLowerCase().includes(q)
      );
    });
  }, [forecast, searchQuery]);

  async function generateAIForecast() {
    setIsGenerating(true);
    setError(null);
    try {
      const analysis = await callAIAPI<Record<string, unknown>>({
        type: "prediction",
        data: {
          activeOrder: activeOrder
            ? {
                restaurant: activeOrder.selectedRestaurantName,
                items: activeOrder.items.map((item) => `${item.name} x${item.quantity}`),
                totalCalories: activeOrder.totalCalories,
                averageMealScore: activeOrder.averageMealScore,
              }
            : null,
          analytics: {
            totalOrders: analytics.totalOrders,
            revenue: analytics.revenue,
            averageMealHealthScore: analytics.averageMealHealthScore,
            popularDish: analytics.popularDish,
            healthyMealPercent: analytics.healthyMealPercent,
            topSellingFoods: analytics.topSellingFoods,
          },
          inventory: inventory.map((item) => ({
            name: item.name,
            currentStock: item.currentStock,
            remainingPercent: item.remainingPercent,
            status: item.status,
          })),
        },
      });

      const nextForecast = normalizeAIForecast({ success: true, analysis });
      setForecast(nextForecast);
      notify({
        icon: "✦",
        title: "AI predictions generated",
        description: nextForecast.summary,
        category: "AI",
        severity: "ai-generated",
        dedupeKey: `ai-predictions-${activeOrder?.orderId ?? "snapshot"}`,
      });
    } catch (forecastError) {
      setError(
        forecastError instanceof Error
          ? forecastError.message
          : "Unable to generate AI predictions.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const hasSearchFilter = searchQuery.trim().length > 0;
  const noMatchesFound =
    hasSearchFilter &&
    filteredPredictions.length === 0 &&
    (!forecast || filteredForecastPredictions.length === 0);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">
          AI Predictions
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Forecast tomorrow with confidence
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">
              Predictions use the current active order, restaurant analytics, and inventory health.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Control */}
            <div className="relative min-w-[260px] sm:w-72">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              >
                🔍
              </span>
              <input
                type="search"
                placeholder="Search title, dish, action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-8 pl-10 text-sm text-white placeholder:text-muted outline-none transition-all duration-200 focus:border-emerald/50 focus:ring-2 focus:ring-emerald/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-white"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={generateAIForecast}
              disabled={isGenerating}
              className="w-full whitespace-nowrap sm:w-auto"
            >
              {isGenerating ? "Generating..." : "✦ Generate AI Forecast"}
            </Button>
          </div>
        </div>
      </header>

      {noMatchesFound ? (
        <Card className="p-8 text-center">
          <span className="text-3xl" aria-hidden="true">
            🔍
          </span>
          <h3 className="mt-3 text-lg font-semibold text-white">
            No matching predictions found.
          </h3>
          <p className="mt-1 text-sm text-muted">
            No cards, recommendations, or AI forecasts match &quot;{searchQuery}&quot;. Try searching for a different title, dish, or inventory item.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-emerald-light transition-colors hover:border-emerald/30 hover:bg-emerald/10"
          >
            Clear Search Filter
          </button>
        </Card>
      ) : (
        <>
          {filteredPredictions.length > 0 ? (
            <section
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              aria-label="Prediction cards"
            >
              {filteredPredictions.map((prediction) => (
                <Card key={prediction.id} hover className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald/20 bg-emerald/10 text-lg text-emerald">
                        {prediction.icon}
                      </span>
                      <div>
                        <p className="text-sm text-muted">
                          <HighlightText text={prediction.title} query={searchQuery} />
                        </p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          <HighlightText text={prediction.value} query={searchQuery} />
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        priorityStyles[prediction.priority]
                      }`}
                    >
                      {prediction.priority}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted">
                    <HighlightText text={prediction.description} query={searchQuery} />
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                    <span
                      className={
                        prediction.trend === "down" ? "text-rose-300" : "text-emerald"
                      }
                    >
                      {trendLabels[prediction.trend]}
                    </span>
                    <span className="text-muted">{prediction.confidence}% confidence</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-background/60 p-3 text-sm text-white/90">
                    <span className="text-emerald">Recommended action: </span>
                    <HighlightText text={prediction.action} query={searchQuery} />
                  </div>
                </Card>
              ))}
            </section>
          ) : null}

          <section aria-label="AI forecast results">
            <Card className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-lg text-violet-200">
                  ✦
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Gemini forecast</h2>
                  <p className="mt-1 text-sm text-muted">
                    Generate a focused operational prediction from the current dashboard signals.
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              {forecast ? (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4 text-sm leading-relaxed text-white/90">
                    <HighlightText text={forecast.summary} query={searchQuery} />
                  </div>

                  {filteredForecastPredictions.length > 0 ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {filteredForecastPredictions.map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="rounded-2xl border border-white/10 bg-background/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-white">
                              <HighlightText text={item.title} query={searchQuery} />
                            </p>
                            <span className="text-xs text-emerald">
                              {item.confidence ?? "—"}% confidence
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted">
                            <HighlightText text={item.forecast} query={searchQuery} />
                          </p>
                          <p className="mt-3 text-sm text-white/90">
                            <HighlightText text={item.action} query={searchQuery} />
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : hasSearchFilter ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-muted">
                      No Gemini predictions match &quot;{searchQuery}&quot;.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-background/40 p-6 text-sm text-muted">
                  Use the AI forecast button to turn the latest operational data into prediction guidance.
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
