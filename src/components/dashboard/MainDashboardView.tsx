"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/cards/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity, { type ActivityItem } from "@/components/dashboard/RecentActivity";
import AIRecommendations, { type RecommendationItem } from "@/components/dashboard/AIRecommendations";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import {
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
  type AnalyticsSnapshot,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import { recentActivity, aiRecommendations } from "@/components/dashboard/dashboardData";

export default function MainDashboardView() {
  const { activeOrder } = useActiveOrder();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => getStoredAnalyticsSnapshot());
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() => getStoredInventoryState());

  useEffect(() => {
    setAnalytics(getStoredAnalyticsSnapshot());
    setInventory(getStoredInventoryState());
  }, [activeOrder]);

  const restaurantHealthScore = useMemo(() => {
    if (analytics.totalOrders === 0) return 92;
    return Math.round(analytics.averageMealHealthScore * 0.5 + analytics.averageCustomerSatisfaction * 0.5);
  }, [analytics]);

  const foodWastePercent = useMemo(() => {
    const lowOrCritical = inventory.filter((i) => i.status === "Critical" || i.status === "Low").length;
    if (analytics.totalOrders === 0) return "3.2%";
    const val = Math.min(12, Math.max(1.8, Math.round(((100 - analytics.healthyMealPercent) * 0.1 + lowOrCritical * 0.8) * 10) / 10));
    return `${val}%`;
  }, [analytics, inventory]);

  const stats = useMemo(() => [
    {
      title: "Restaurant Health Score",
      value: `${restaurantHealthScore}%`,
      change: analytics.totalOrders > 0 ? `${analytics.totalOrders > 1 ? "+" : ""}${(analytics.totalOrders * 0.8).toFixed(1)}%` : "+4.2%",
      trend: "up" as const,
      icon: "🏥",
    },
    {
      title: "Customer Meal Health",
      value: analytics.totalOrders > 0 ? `${analytics.averageMealHealthScore}%` : "87%",
      change: analytics.totalOrders > 0 ? `${analytics.healthyMealPercent}% healthy` : "+2.1%",
      trend: "up" as const,
      icon: "🥗",
    },
    {
      title: "Orders Today",
      value: analytics.totalOrders > 0 ? `${analytics.totalOrders}` : "248",
      change: analytics.totalOrders > 0 ? `+${analytics.totalOrders} today` : "+18%",
      trend: "up" as const,
      icon: "📋",
    },
    {
      title: "Revenue",
      value: analytics.totalOrders > 0 ? `₹${analytics.revenue.toLocaleString("en-IN")}` : "₹12,480",
      change: analytics.totalOrders > 0 ? `₹${Math.round(analytics.revenue / analytics.totalOrders).toLocaleString("en-IN")} avg` : "+12.5%",
      trend: "up" as const,
      icon: "💰",
    },
    {
      title: "Customer Satisfaction",
      value: analytics.totalOrders > 0 ? `${(analytics.averageCustomerSatisfaction / 20).toFixed(1)}/5` : "4.8/5",
      change: analytics.totalOrders > 0 ? `${analytics.averageCustomerSatisfaction}% score` : "+0.3",
      trend: "up" as const,
      icon: "⭐",
    },
    {
      title: "Food Waste",
      value: foodWastePercent,
      change: analytics.totalOrders > 0
        ? `${inventory.filter((i) => i.status === "Critical" || i.status === "Low").length} stock alert(s)`
        : "1.1% less",
      trend: "up" as const,
      icon: "♻️",
    },
  ], [analytics, inventory, restaurantHealthScore, foodWastePercent]);

  const liveActivity = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    if (activeOrder) {
      list.push({
        id: `order-${activeOrder.orderId ?? "1"}`,
        action: "New order placed",
        detail: `${activeOrder.selectedRestaurantName} — ${activeOrder.items.map((i) => i.name).join(", ")}`,
        time: "Just now",
        icon: "🛒",
      });

      list.push({
        id: `health-${activeOrder.orderId ?? "1"}`,
        action: "Meal health evaluated",
        detail: `Average health score: ${activeOrder.averageMealScore}/100 (${activeOrder.totalCalories} kcal)`,
        time: "Just now",
        icon: "🥗",
      });

      list.push({
        id: `inventory-${activeOrder.orderId ?? "1"}`,
        action: "Inventory auto-updated",
        detail: `Stock adjusted for ${activeOrder.items.length} ordered dish types`,
        time: "Just now",
        icon: "📦",
      });

      list.push({
        id: `revenue-${activeOrder.orderId ?? "1"}`,
        action: "Revenue updated",
        detail: `+₹${activeOrder.subtotal.toLocaleString("en-IN")} added to daily total`,
        time: "Just now",
        icon: "💰",
      });
    }

    return list.length > 0 ? list : recentActivity;
  }, [activeOrder]);

  const liveRecommendations = useMemo<RecommendationItem[]>(() => {
    const list: RecommendationItem[] = [];

    const lowStock = inventory.filter((i) => i.status === "Critical" || i.status === "Low");
    if (lowStock.length > 0) {
      list.push({
        id: "rec-stock",
        title: `Restock ${lowStock[0].name}`,
        description: `${lowStock[0].name} stock is at ${lowStock[0].remainingPercent}% (${lowStock[0].currentStock} ${lowStock[0].unit} left). Reorder soon.`,
        priority: lowStock[0].status === "Critical" ? "High" : "Medium",
        icon: "📦",
      });
    }

    if (activeOrder && activeOrder.averageMealScore < 80) {
      list.push({
        id: "rec-health",
        title: "Optimize meal nutrition balance",
        description: `Latest order health score is ${activeOrder.averageMealScore}/100. Promote healthier sides or lower-sodium options.`,
        priority: "High",
        icon: "🥗",
      });
    }

    if (analytics.popularDish && analytics.popularDish !== "No orders yet") {
      list.push({
        id: "rec-popular",
        title: `Promote ${analytics.popularDish}`,
        description: `${analytics.popularDish} is currently leading customer demand. Feature it as today's special.`,
        priority: "Medium",
        icon: "⭐",
      });
    }

    return list.length > 0 ? list : (aiRecommendations as RecommendationItem[]);
  }, [activeOrder, analytics, inventory]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted">
          Welcome back! Here&apos;s your restaurant overview for today.
        </p>
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
            data={analytics.revenueTrend}
            title="Revenue Chart"
            subtitle="Weekly revenue overview"
            highlight={
              analytics.totalOrders > 0
                ? `Live (${analytics.totalOrders} order${analytics.totalOrders === 1 ? "" : "s"})`
                : "+12.5% this week"
            }
            totalLabel="Total Revenue"
            totalValue={
              analytics.totalOrders > 0
                ? `₹${analytics.revenue.toLocaleString("en-IN")}`
                : "₹12,480"
            }
            secondaryLabel="Avg. Per Order"
            secondaryValue={
              analytics.totalOrders > 0
                ? `₹${Math.round(analytics.revenue / Math.max(1, analytics.totalOrders)).toLocaleString("en-IN")}`
                : "₹1,783"
            }
          />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity items={liveActivity} />
        </div>
      </section>

      <section aria-label="AI recommendations">
        <AIRecommendations items={liveRecommendations} />
      </section>
    </div>
  );
}
