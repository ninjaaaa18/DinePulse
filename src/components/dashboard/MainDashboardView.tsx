"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatCard from "@/components/cards/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
  type AnalyticsSnapshot,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import { loadAnalyticsWithFallback, loadInventoryWithFallback } from "@/lib/supabase";
import { fallbackRestaurants } from "@/lib/supabase/menu";
import { getRestaurantDashboardMetrics } from "@/lib/restaurantDashboardData";

function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-2xl border border-white/5 p-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, cta, href }: {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 text-3xl">
        {icon}
      </div>
      <div className="max-w-xs">
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Link href={href}>
        <Button type="button" variant="secondary" size="sm" className="rounded-xl">{cta}</Button>
      </Link>
    </Card>
  );
}

function CustomerDashboard() {
  const { user } = useAuth();
  const { setSelectedRestaurant } = useActiveOrder();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState(fallbackRestaurants);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { loadRestaurantsWithFallback } = await import("@/lib/supabase");
      const fetched = await loadRestaurantsWithFallback();
      setRestaurants(fetched);
      setLoading(false);
    }
    load();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const healthyPicks = useMemo(() => {
    return restaurants
      .flatMap((r) => (r.items || []).filter((item) => (item.wellnessScore ?? 0) >= 80).map((item) => ({ ...item, restaurant: r })))
      .slice(0, 4);
  }, [restaurants]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-shimmer rounded bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-muted">Here&apos;s your personalized food experience today.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-lg">🥗</span>
              <div>
                <h2 className="text-lg font-bold text-white">Today&apos;s Healthy Recommendation</h2>
                <p className="text-xs text-muted">AI-curated nutritious pick for you</p>
              </div>
            </div>
          </div>
          {healthyPicks.length > 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-emerald/20 bg-emerald/[0.03] p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-2xl">
                {healthyPicks[0].restaurant.logo}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-white">{healthyPicks[0].name}</p>
                <p className="text-xs text-muted">{healthyPicks[0].restaurant.name} • {healthyPicks[0].calories} cal</p>
                <p className="mt-1 text-xs text-emerald-light">Wellness Score {healthyPicks[0].wellnessScore}%</p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="ml-auto shrink-0 rounded-xl"
                onClick={() => {
                  setSelectedRestaurant(healthyPicks[0].restaurant);
                  router.push("/dashboard/order-food");
                }}
              >
                Order Now
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted">No recommendations yet. Start exploring restaurants!</p>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h2 className="text-base font-bold text-white">Nutrition Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🔥", label: "Calories", value: "0" },
              { icon: "💪", label: "Protein", value: "0g" },
              { icon: "🥦", label: "Meals", value: "0" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] py-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-lg font-bold text-white">{item.value}</p>
                <p className="text-[10px] text-muted">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted text-center">Start ordering to track your nutrition.</p>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🍽️</span>
            <h2 className="text-lg font-bold text-white">Recommended Restaurants</h2>
          </div>
          <Link href="/dashboard/browse-restaurants" className="text-xs font-medium text-emerald-light hover:text-emerald transition-colors">View All</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {restaurants.slice(0, 6).map((restaurant, i) => (
            <Card key={restaurant.id} hover className={`flex flex-col gap-4 animate-fade-in stagger-${i + 1}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/15 text-2xl">{restaurant.logo}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{restaurant.name}</h3>
                    <p className="text-sm text-muted">{restaurant.cuisine}</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald-light whitespace-nowrap">{restaurant.healthScore ?? 90}% health</span>
              </div>
              <p className="text-sm text-muted line-clamp-2">{restaurant.description || "Fresh meals with nutrition and allergy insights."}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>🕒 {restaurant.deliveryTime || "20–30 min"}</span>
                <span>{(restaurant.items || []).length} items</span>
              </div>
              <Button type="button" variant="primary" className="mt-auto w-full rounded-xl" onClick={() => { setSelectedRestaurant(restaurant); router.push("/dashboard/order-food"); }}>
                View Menu & Order
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span>
            <h2 className="text-lg font-bold text-white">Recently Ordered</h2>
          </div>
          <Link href="/dashboard/my-orders" className="text-xs font-medium text-emerald-light hover:text-emerald transition-colors">Order History</Link>
        </div>
        <EmptyState icon="🛵" title="No orders yet" description="Start ordering from your favorite restaurants and they'll appear here." cta="Browse Restaurants" href="/dashboard/browse-restaurants" />
      </section>
    </div>
  );
}

export default function MainDashboardView() {
  const { role } = useAuth();

  if (role === "customer") {
    return <CustomerDashboard />;
  }

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
    return () => { isMounted = false; };
  }, [activeOrder]);

  const metrics = useMemo(() => {
    return getRestaurantDashboardMetrics(
      selectedRestaurant.id || selectedRestaurant.slug || selectedRestaurant.name,
      analytics.totalOrders > 0 ? analytics : null,
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

  const lowStockCount = inventory.filter((i) => i.status === "Critical" || i.status === "Low").length;
  const topSelling = analytics.topSellingFoods?.[0];
  const aiRec = metrics.aiRecommendations?.[0];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedRestaurant.logo}</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{selectedRestaurant.name}</h1>
              <p className="text-sm text-muted">{selectedRestaurant.cuisine} • Today&apos;s overview</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="restaurant-select" className="text-xs font-medium text-muted">Switch:</label>
          <select
            id="restaurant-select"
            value={selectedRestaurant.id}
            onChange={(e) => {
              const found = fallbackRestaurants.find((r) => r.id === e.target.value || r.slug === e.target.value);
              if (found) setSelectedRestaurant(found);
            }}
            className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm font-medium text-white focus:border-emerald focus:outline-none"
          >
            {fallbackRestaurants.map((r) => (
              <option key={r.id} value={r.id} className="bg-surface text-white">{r.logo} {r.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={stat.title} className={`animate-fade-in stagger-${i + 1}`}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Revenue Trend</h2>
              <p className="text-xs text-muted">Weekly overview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Total</p>
              <p className="text-xl font-bold text-white">₹{metrics.revenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <RevenueChart
            data={metrics.revenueTrend}
            title=""
            subtitle=""
            highlight={`${metrics.ordersToday} orders logged`}
            totalLabel=""
            totalValue=""
            secondaryLabel=""
            secondaryValue=""
          />
        </Card>

        <div className="space-y-4">
          <Card className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="text-sm font-bold text-white">Pending Orders</h3>
            </div>
            <p className="text-2xl font-bold text-white">{Math.max(0, Math.round(metrics.ordersToday * 0.3))}</p>
            <p className="text-xs text-muted">{metrics.ordersToday} total today</p>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <h3 className="text-sm font-bold text-white">Inventory Alerts</h3>
            </div>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-rose-400" : "text-emerald"}`}>
              {lowStockCount > 0 ? lowStockCount : "✓"}
            </p>
            <p className="text-xs text-muted">{lowStockCount > 0 ? "items need attention" : "all stocked up"}</p>
          </Card>

          {topSelling ? (
            <Card className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">★</span>
                <h3 className="text-sm font-bold text-white">Top Selling</h3>
              </div>
              <p className="font-semibold text-white truncate">{typeof topSelling === "string" ? topSelling : topSelling.label}</p>
              <p className="text-xs text-muted">Leading item today</p>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentActivity items={metrics.recentActivity} />
        </div>
        <div className="lg:col-span-2">
          <AIRecommendations items={metrics.aiRecommendations} />
        </div>
      </div>
    </div>
  );
}
