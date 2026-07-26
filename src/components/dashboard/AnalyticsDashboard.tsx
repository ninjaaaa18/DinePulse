"use client";

import { useEffect, useState } from "react";
import Card from "@/components/cards/Card";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { getStoredAnalyticsSnapshot, type AnalyticsSnapshot } from "@/lib/orderAnalysis";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function AnalyticsDashboard() {
  const { activeOrder } = useActiveOrder();
  const { notify } = useNotifications();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => getStoredAnalyticsSnapshot());

  useEffect(() => {
    setAnalytics(getStoredAnalyticsSnapshot());
    if (activeOrder) {
      notify({
        icon: "₹",
        title: "Analytics updated",
        description: `Revenue increased by ₹${activeOrder.subtotal.toLocaleString("en-IN")} from the latest order.`,
        category: "Analytics",
        severity: "information",
        dedupeKey: `analytics-update-${activeOrder.orderId}`,
      });
    }
  }, [activeOrder, notify]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">Analytics</p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dynamic restaurant analytics</h1>
        <p className="max-w-3xl text-sm text-muted sm:text-base">
          Performance is updated automatically from the shared order context across the dashboard.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-sm text-muted">Total Orders</p>
          <p className="text-2xl font-semibold text-white">{analytics.totalOrders}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted">Revenue</p>
          <p className="text-2xl font-semibold text-white">{formatCurrency(analytics.revenue)}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted">Avg. Meal Health Score</p>
          <p className="text-2xl font-semibold text-white">{analytics.averageMealHealthScore || "—"}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted">Calories Served Today</p>
          <p className="text-2xl font-semibold text-white">{analytics.caloriesServed}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Popular Dish</h2>
            <p className="text-sm text-muted">Most requested item from recent orders</p>
          </div>
          <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4 text-white">
            <p className="text-xl font-semibold">{analytics.popularDish}</p>
            <p className="mt-2 text-sm text-emerald-light">Demand is growing for this dish today.</p>
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Meal Health Split</h2>
            <p className="text-sm text-muted">Balanced vs. less balanced orders</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4 text-white">
              <p className="text-sm text-emerald-light">Healthy Meal %</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.healthyMealPercent}%</p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-white">
              <p className="text-sm text-rose-200">Unhealthy Meal %</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.unhealthyMealPercent}%</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RevenueChart
          data={analytics.revenueTrend}
          title="Revenue Chart"
          subtitle="Updated from recent orders"
          highlight={`${analytics.totalOrders > 0 ? "Live" : "Awaiting"} order activity`}
          totalLabel="Revenue"
          totalValue={formatCurrency(analytics.revenue)}
          secondaryLabel="Avg. Daily"
          secondaryValue={formatCurrency(Math.round(analytics.revenue / Math.max(1, analytics.totalOrders)))}
        />
        <RevenueChart
          data={analytics.ordersTrend}
          title="Orders Chart"
          subtitle="Order volume trend"
          highlight="Live update"
          totalLabel="Orders"
          totalValue={analytics.totalOrders.toString()}
          secondaryLabel="Avg. Per Day"
          secondaryValue={analytics.totalOrders.toString()}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Meal Health Distribution</h2>
            <p className="text-sm text-muted">Recent order balance</p>
          </div>
          <div className="space-y-3">
            {analytics.healthDistribution.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-background/60 p-3">
                <div className="flex items-center justify-between text-sm text-white">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Top Selling Foods</h2>
            <p className="text-sm text-muted">Most frequent dishes in recent orders</p>
          </div>
          <div className="space-y-3">
            {analytics.topSellingFoods.length > 0 ? analytics.topSellingFoods.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-background/60 p-3 text-sm text-white">
                <span>{item.label}</span>
                <span className="text-emerald">x{item.value}</span>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-muted">
                Orders will appear here once the flow is used.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
            <p className="text-sm text-muted">Dynamic signals generated from the current order flow</p>
          </div>
          <div className="space-y-3">
            {analytics.insights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-emerald/20 bg-emerald/10 p-3 text-sm text-emerald-light">
                {insight}
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Average Customer Satisfaction</h2>
            <p className="text-sm text-muted">Estimated from the recent meal health trend</p>
          </div>
          <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4 text-white">
            <p className="text-3xl font-semibold">{analytics.averageCustomerSatisfaction}/100</p>
            <p className="mt-2 text-sm text-emerald-light">Satisfaction is trending positively from the current orders.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
