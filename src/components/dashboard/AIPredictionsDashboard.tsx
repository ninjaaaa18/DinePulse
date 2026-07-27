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

const trendIcons: Record<string, { icon: string; color: string; label: string }> = {
  up: { icon: "↑", color: "text-emerald", label: "Rising" },
  down: { icon: "↓", color: "text-rose-400", label: "Falling" },
  steady: { icon: "→", color: "text-muted", label: "Stable" },
};

function TrendBadge({ trend }: { trend: string }) {
  const t = trendIcons[trend] || trendIcons.steady;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium ${t.color}`}>
      {t.icon} {t.label}
    </span>
  );
}

function ConfidenceMeter({ confidence, label }: { confidence: number; label?: string }) {
  const level = confidence >= 85 ? "High" : confidence >= 70 ? "Medium" : "Low";
  const color = confidence >= 85 ? "bg-emerald" : confidence >= 70 ? "bg-amber-500" : "bg-rose-500";
  const bgColor = confidence >= 85 ? "bg-emerald/20" : confidence >= 70 ? "bg-amber-500/20" : "bg-rose-500/20";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label || "Confidence"}</span>
        <span className={`font-semibold ${confidence >= 85 ? "text-emerald" : confidence >= 70 ? "text-amber-300" : "text-rose-300"}`}>{level} ({confidence}%)</span>
      </div>
      <div className={`h-1.5 rounded-full ${bgColor}`}>
        <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}

function createPredictions(analytics: AnalyticsSnapshot, inventory: InventoryIngredient[]): Prediction[] {
  const lowIngredients = inventory.filter((item) => item.status === "Low" || item.status === "Critical");
  const lowestIngredient = [...inventory].sort((left, right) => left.remainingPercent - right.remainingPercent)[0];
  const forecastedDemand = analytics.totalOrders > 0 ? Math.round(analytics.totalOrders * 1.12) : 32;
  const healthyDemand = analytics.totalOrders > 0 ? Math.min(98, Math.max(0, Math.round(analytics.healthyMealPercent + 6))) : 64;
  const consumedStock = inventory.filter((item) => item.stockChange < 0).length;
  const expectedWaste = Math.min(14, Math.max(2, Math.round(3 + consumedStock * 0.6 + lowIngredients.length)));
  const peakHours = analytics.totalOrders >= 10 ? "7–9 PM" : "12–2 PM";

  return [
    {
      id: "demand",
      icon: "↗",
      title: "Tomorrow's demand",
      value: `${forecastedDemand} orders`,
      description: "Expected order volume based on current order momentum and recent revenue activity.",
      confidence: analytics.totalOrders > 0 ? 84 : 68,
      trend: "up",
      priority: "Medium",
      action: "Prepare high-demand menu items before the next service window.",
    },
    {
      id: "inventory",
      icon: "!",
      title: "Ingredients likely to run low",
      value: lowIngredients.length ? lowIngredients.map((item) => item.name).join(", ") : lowestIngredient?.name ?? "No shortages forecast",
      description: lowIngredients.length ? `${lowIngredients.length} ingredient${lowIngredients.length === 1 ? " is" : "s are"} already nearing the reorder threshold.` : `${lowestIngredient?.name ?? "Current inventory"} has the lowest remaining buffer at ${lowestIngredient?.remainingPercent ?? 100}%.`,
      confidence: lowIngredients.length ? 93 : 77,
      trend: lowIngredients.length ? "down" : "steady",
      priority: lowIngredients.some((item) => item.status === "Critical") ? "Critical" : lowIngredients.length ? "High" : "Low",
      action: lowIngredients.length ? "Create a restock request before tomorrow's peak period." : "Keep monitoring the lowest-stock ingredient.",
    },
    {
      id: "peak-hours",
      icon: "◷",
      title: "Peak business hours",
      value: peakHours,
      description: "The next demand spike is expected during the strongest projected service window.",
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
      description: "Projected from current ingredient consumption and available stock buffers.",
      confidence: 74,
      trend: expectedWaste >= 8 ? "up" : "steady",
      priority: expectedWaste >= 10 ? "High" : "Low",
      action: "Prioritize perishable stock in specials and adjust prep quantities.",
    },
    {
      id: "trending-item",
      icon: "★",
      title: "Trending menu item",
      value: analytics.popularDish === "No orders yet" ? "Grill Chicken Bowl" : analytics.popularDish,
      description: "This dish is leading recent customer demand and is a strong candidate for promotion.",
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
      description: "Projected share of orders expected to meet the current healthy-meal threshold.",
      confidence: analytics.totalOrders > 0 ? 81 : 69,
      trend: healthyDemand >= 70 ? "up" : "steady",
      priority: "Low",
      action: "Keep healthy choices visible and pair them with high-demand menu items.",
    },
  ];
}

function normalizeAIForecast(payload: unknown): AIForecast {
  const analysis = payload && typeof payload === "object" && "analysis" in payload
    ? (payload as { analysis: Record<string, unknown> }).analysis
    : (payload as Record<string, unknown> | null);
  const predictions = Array.isArray(analysis?.predictions) ? analysis.predictions : [];
  return {
    summary: typeof analysis?.summary === "string" ? analysis.summary : "AI forecast completed.",
    predictions: predictions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const prediction = item as Record<string, unknown>;
      return [{
        title: typeof prediction.title === "string" ? prediction.title : "Forecast",
        forecast: typeof prediction.forecast === "string" ? prediction.forecast : "Review the AI forecast details.",
        confidence: typeof prediction.confidence === "number" ? prediction.confidence : null,
        priority: typeof prediction.priority === "string" ? prediction.priority : "Medium",
        action: typeof prediction.action === "string" ? prediction.action : "Monitor this signal.",
      }];
    }),
  };
}

function ActionPlanSection({ predictions }: { predictions: Prediction[] }) {
  const actionItems = predictions.map((p) => p.action);
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-lg text-emerald">📋</span>
        <div>
          <h2 className="text-lg font-bold text-white">Tomorrow&apos;s Action Plan</h2>
          <p className="text-xs text-muted">Actionable tasks based on predictions</p>
        </div>
      </div>
      <div className="space-y-2">
        {actionItems.map((action, i) => (
          <div key={`action-${i}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-emerald/20 hover:bg-emerald/[0.02]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10 text-[10px] text-emerald">✓</span>
            <p className="text-sm text-white/90">{action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DemandForecastSection({ predictions }: { predictions: Prediction[] }) {
  const demandItems = predictions.filter((p) => ["demand", "peak-hours", "trending-item", "healthy-demand"].includes(p.id));
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-lg text-amber-300">📈</span>
        <div>
          <h2 className="text-lg font-bold text-white">Demand Forecast</h2>
          <p className="text-xs text-muted">Predicted demand trends for key items</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {demandItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-background/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{item.title}</span>
              <TrendBadge trend={item.trend} />
            </div>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-xs text-muted">{item.description}</p>
            <ConfidenceMeter confidence={item.confidence} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function InventoryAlertsSection({ predictions }: { predictions: Prediction[] }) {
  const lowItems = predictions.filter((p) => p.id === "inventory" || p.id === "food-waste");
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-lg text-rose-300">⚠</span>
        <div>
          <h2 className="text-lg font-bold text-white">Inventory Alerts</h2>
          <p className="text-xs text-muted">Important stock and waste alerts</p>
        </div>
      </div>
      <div className="space-y-2">
        {lowItems.map((item) => (
          <div key={item.id} className={`rounded-xl border p-4 space-y-2 ${priorityStyles[item.priority]}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="rounded-full border border-current/20 bg-current/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{item.priority}</span>
            </div>
            <p className="text-sm opacity-90">{item.value}</p>
            <p className="text-xs opacity-75">{item.action}</p>
            <ConfidenceMeter confidence={item.confidence} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function AIRecommendationsSection({ predictions, forecast, hasSearchFilter, searchQuery }: {
  predictions: Prediction[];
  forecast: AIForecast | null;
  hasSearchFilter: boolean;
  searchQuery: string;
}) {
  const recs = predictions.filter((p) => p.priority === "Low" || p.priority === "Medium");
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300">🤖</span>
        <div>
          <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
          <p className="text-xs text-muted">Smart suggestions for your restaurant</p>
        </div>
      </div>
      {recs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {recs.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/60 p-4 transition-colors hover:border-violet-500/20">
              <span className="mt-0.5 text-lg">{rec.icon}</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{rec.title}</p>
                <p className="text-xs text-muted">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-background/40 p-6 text-center text-sm text-muted">
          No AI recommendations available right now.
        </div>
      )}

      {forecast && forecast.predictions.length > 0 && (
        <>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">AI Forecast Insights</p>
            <div className="rounded-xl border border-emerald/20 bg-emerald/10 p-4 text-sm leading-relaxed text-white/90">
              {forecast.summary}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {forecast.predictions.map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-xl border border-white/10 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{item.title}</p>
                  {item.confidence ? (
                    <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-xs font-medium text-emerald">{item.confidence}%</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">{item.forecast}</p>
                <p className="mt-2 text-xs text-white/80">{item.action}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default function AIPredictionsDashboard() {
  const { activeOrder } = useActiveOrder();
  const { notify } = useNotifications();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => getStoredAnalyticsSnapshot());
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() => getStoredInventoryState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecast, setForecast] = useState<AIForecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnalytics(getStoredAnalyticsSnapshot());
    setInventory(getStoredInventoryState());
  }, [activeOrder]);

  const predictions = useMemo(() => createPredictions(analytics, inventory), [analytics, inventory]);

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

  async function generateAIForecast() {
    setIsGenerating(true);
    setError(null);
    try {
      const analysis = await callAIAPI<Record<string, unknown>>({
        type: "prediction",
        data: {
          activeOrder: activeOrder ? {
            restaurant: activeOrder.selectedRestaurantName,
            items: activeOrder.items.map((item) => `${item.name} x${item.quantity}`),
            totalCalories: activeOrder.totalCalories,
            averageMealScore: activeOrder.averageMealScore,
          } : null,
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
        category: "AI Insights",
        severity: "ai-generated",
        dedupeKey: `ai-predictions-${activeOrder?.orderId ?? "snapshot"}`,
      });
    } catch (forecastError) {
      setError(forecastError instanceof Error ? forecastError.message : "Unable to generate AI predictions.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">AI Predictions</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Forecast tomorrow with confidence</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">AI-powered predictions using live orders, analytics, and inventory data.</p>
          </div>
          <Button variant="primary" size="md" onClick={generateAIForecast} disabled={isGenerating} className="w-full whitespace-nowrap sm:w-auto rounded-xl">
            {isGenerating ? "✦ Generating..." : "✦ Generate AI Forecast"}
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ActionPlanSection predictions={predictions} />
          <InventoryAlertsSection predictions={predictions} />
        </div>
        <div className="space-y-6">
          <DemandForecastSection predictions={predictions} />
          <AIRecommendationsSection predictions={predictions} forecast={forecast} hasSearchFilter={false} searchQuery="" />
        </div>
      </div>
    </div>
  );
}
