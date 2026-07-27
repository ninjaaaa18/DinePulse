"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/cards/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import {
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
  type AnalyticsSnapshot,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import { loadAnalyticsWithFallback, loadInventoryWithFallback } from "@/lib/supabase";
import { fallbackRestaurants } from "@/lib/supabase/menu";
import { getRestaurantDashboardMetrics } from "@/lib/restaurantDashboardData";

export default function MainDashboardView() {
  const { activeOrder, selectedRestaurant, setSelectedRestaurant } = useActiveOrder();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => getStoredAnalyticsSnapshot());
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() => getStoredInventoryState());

  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      const [remoteAnalytics, remoteInventory] = await Promise.all([
        loadAnalyticsWithFallback(),
        loadInventoryWithFallback(),
      ]);
      if (!isMounted) return;

      setAnalytics(remoteAnalytics);
      setInventory(remoteInventory);
    }

    syncData();
    return () => {
      isMounted = false;
    };
  }, [activeOrder]);

  const metrics = useMemo(() => {
    return getRestaurantDashboardMetrics(
      selectedRestaurant.id || selectedRestaurant.slug || selectedRestaurant.name,
      analytics.totalOrders > 0 ? analytics : null
    );
  }, [selectedRestaurant, analytics]);

  const stats = useMemo(() => [
    {
      title: "Restaurant Health Score",
      value: `${metrics.healthScore}%`,
      change: "+4.2%",
      trend: "up" as const,
      icon: "🏥",
    },
    {
      title: "Customer Meal Health",
      value: `${metrics.customerMealHealth}%`,
      change: `${metrics.healthyMealPercent}% healthy`,
      trend: "up" as const,
      icon: "🥗",
    },
    {
      title: "Orders Today",
      value: `${metrics.ordersToday}`,
      change: `+${Math.round(metrics.ordersToday * 0.12)} today`,
      trend: "up" as const,
      icon: "📋",
    },
    {
      title: "Revenue",
      value: `₹${metrics.revenue.toLocaleString("en-IN")}`,
      change: `₹${Math.round(metrics.revenue / Math.max(1, metrics.ordersToday)).toLocaleString("en-IN")} avg`,
      trend: "up" as const,
      icon: "💰",
    },
    {
      title: "Customer Satisfaction",
      value: `${(metrics.averageCustomerSatisfaction / 20).toFixed(1)}/5`,
      change: `${metrics.averageCustomerSatisfaction}% score`,
      trend: "up" as const,
      icon: "⭐",
    },
    {
      title: "Food Waste",
      value: metrics.foodWastePercent,
      change: `${inventory.filter((i) => i.status === "Critical" || i.status === "Low").length} stock alert(s)`,
      trend: "up" as const,
      icon: "♻️",
    },
  ], [metrics, inventory]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xl font-semibold text-emerald-light">
            {selectedRestaurant.logo} {selectedRestaurant.name}
          </p>
          <p className="text-sm text-muted">Today&apos;s overview</p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="restaurant-select" className="text-sm font-medium text-muted">
            Select Restaurant:
          </label>
          <select
            id="restaurant-select"
            value={selectedRestaurant.id}
            onChange={(e) => {
              const found = fallbackRestaurants.find(
                (r) => r.id === e.target.value || r.slug === e.target.value
              );
              if (found) setSelectedRestaurant(found);
            }}
            className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm font-medium text-white transition-colors focus:border-emerald focus:outline-none"
          >
            {fallbackRestaurants.map((r) => (
              <option key={r.id} value={r.id} className="bg-surface text-white">
                {r.logo} {r.name} ({r.cuisine})
              </option>
            ))}
          </select>
        </div>
      </header>

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section
        aria-label="Analytics and activity"
        className="grid gap-6 lg:grid-cols-5"
      >
        <div className="lg:col-span-3">
          <RevenueChart
            data={metrics.revenueTrend}
            title={`${selectedRestaurant.name} Revenue`}
            subtitle="Weekly revenue overview"
            highlight={`${metrics.ordersToday} orders logged`}
            totalLabel="Total Revenue"
            totalValue={`₹${metrics.revenue.toLocaleString("en-IN")}`}
            secondaryLabel="Avg. Per Order"
            secondaryValue={`₹${Math.round(metrics.revenue / Math.max(1, metrics.ordersToday)).toLocaleString("en-IN")}`}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity items={metrics.recentActivity} />
        </div>
      </section>

      <section aria-label="AI recommendations">
        <AIRecommendations items={metrics.aiRecommendations} />
      </section>
    </div>
  );
}
