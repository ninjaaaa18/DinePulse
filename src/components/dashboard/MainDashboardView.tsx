"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import StatCard from "@/components/cards/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import RestaurantHeroImage from "@/components/ui/RestaurantHeroImage";
import TodayHealthCorner from "@/components/dashboard/TodayHealthCorner";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  applyOrderToInventory,
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
  type AnalyticsSnapshot,
  type InventoryIngredient,
  type OrderAnalysisContext,
} from "@/lib/orderAnalysis";
import { getOrders, getOrderWithItems, updateOrderStatus, loadAnalyticsWithFallback, loadInventoryWithFallback } from "@/lib/supabase";
import type { OrderRow } from "@/lib/supabase/types";
import { fallbackRestaurants } from "@/lib/supabase/menu";
import { getRestaurantDashboardMetrics } from "@/lib/restaurantDashboardData";

const ActivityRewards = dynamic(() => import("@/components/dashboard/ActivityRewards"), { ssr: false });

const SkeletonCard = memo(function SkeletonCard() {
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
});

const EmptyState = memo(function EmptyState({ icon, title, description, cta, href }: {
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
});

const nutritionStats = [
  { icon: "🔥", label: "Calories", value: "0" },
  { icon: "💪", label: "Protein", value: "0g" },
  { icon: "🥦", label: "Meals", value: "0" },
];

function CustomerDashboard() {
  const { user } = useAuth();
  const { setSelectedRestaurant } = useActiveOrder();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState(fallbackRestaurants);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { loadRestaurantsWithFallback } = await import("@/lib/supabase");
      const fetched = await loadRestaurantsWithFallback();
      if (!isMounted) return;
      setRestaurants(fetched);
      setLoading(false);
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const displayName = useMemo(() => user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest", [user]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const healthyPicks = useMemo(() => {
    return restaurants
      .flatMap((r) => (r.items || []).filter((item) => (item.wellnessScore ?? 0) >= 80).map((item) => ({ ...item, restaurant: r })))
      .slice(0, 4);
  }, [restaurants]);

  const handleOrderNow = useCallback(() => {
    if (healthyPicks.length > 0) {
      setSelectedRestaurant(healthyPicks[0].restaurant);
      router.push("/dashboard/order-food");
    }
  }, [healthyPicks, setSelectedRestaurant, router]);

  const handleViewMenu = useCallback((restaurant: typeof fallbackRestaurants[0]) => {
    setSelectedRestaurant(restaurant);
    router.push("/dashboard/order-food");
  }, [setSelectedRestaurant, router]);

  const handleExploreHealthy = useCallback(() => {
    router.push("/dashboard/browse-restaurants");
  }, [router]);

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
        <div className="xl:col-span-2 flex flex-col rounded-2xl border border-white/[0.06] bg-surface p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-lg">🥗</span>
              <div>
                <h2 className="text-lg font-bold text-white">Today&apos;s Health Corner</h2>
                <p className="text-xs text-muted">AI-curated nutritious pick for you</p>
              </div>
            </div>
          </div>

          {healthyPicks.length > 0 ? (
            <div className="mt-3 flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3 rounded-xl border border-emerald/20 bg-emerald/[0.03] p-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-xl">
                  {healthyPicks[0].restaurant.logo}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-white">{healthyPicks[0].name}</p>
                  <p className="text-xs text-muted">{healthyPicks[0].restaurant.name} • {healthyPicks[0].calories} cal</p>
                  <p className="mt-0.5 text-xs text-emerald-light">Wellness Score {healthyPicks[0].wellnessScore}%</p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="ml-auto shrink-0 rounded-xl"
                  onClick={handleOrderNow}
                >
                  Order Now
                </Button>
              </div>

              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] py-4">
                <p className="text-sm text-muted">More recommendations coming as you order more.</p>
              </div>
            </div>
          ) : (
            <TodayHealthCorner />
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-base font-bold text-white">Nutrition Summary</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {nutritionStats.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] py-3">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center">Start ordering to track your nutrition.</p>
          </Card>

          <ActivityRewards />
        </div>
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
            <div key={restaurant.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:border-emerald/30 hover:shadow-2xl animate-fade-in stagger-${i + 1}`}>
              <div className="relative h-36 overflow-hidden sm:h-40">
                <RestaurantHeroImage cuisine={restaurant.cuisine} name={restaurant.name} className="h-full w-full" />
                <div className="absolute top-3 right-3 z-10 rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald-light backdrop-blur-sm">
                  {restaurant.healthScore ?? 90}% health
                </div>
                <div className="absolute top-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-surface/80 text-xl shadow-lg backdrop-blur-sm">
                  {restaurant.logo}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-emerald-light">{restaurant.name}</h3>
                  <p className="text-sm text-muted">{restaurant.cuisine}</p>
                </div>
                <p className="text-sm text-muted line-clamp-2">{restaurant.description || "Fresh meals with nutrition and allergy insights."}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>🕒 {restaurant.deliveryTime || "20–30 min"}</span>
                  <span>{(restaurant.items || []).length} items</span>
                </div>
                <Button type="button" variant="primary" className="mt-auto w-full rounded-xl transition-transform duration-300 hover:scale-[1.02]" onClick={() => handleViewMenu(restaurant)}>
                  View Menu & Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-emerald/20 bg-gradient-to-r from-emerald/[0.05] to-emerald/[0.01] px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌱</span>
          <p className="text-sm text-muted">
            Small healthy choices today create big changes tomorrow.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-xl whitespace-nowrap"
          onClick={handleExploreHealthy}
        >
          Explore Healthy Options →
        </Button>
      </div>

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
  const { notify } = useNotifications();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => getStoredAnalyticsSnapshot());
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() => getStoredInventoryState());
  const [pendingOrders, setPendingOrders] = useState<OrderRow[]>([]);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(true);

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

  async function loadPendingOrders() {
    setPendingOrdersLoading(true);
    const { data } = await getOrders({
      restaurantId: selectedRestaurant.id,
      status: "pending",
    });
    setPendingOrders(data ?? []);
    setPendingOrdersLoading(false);
  }

  useEffect(() => {
    loadPendingOrders();
  }, [selectedRestaurant.id, activeOrder]);

  const handleAcceptOrder = useCallback(async (orderId: string) => {
    const { data: orderWithItems } = await getOrderWithItems(orderId);
    if (!orderWithItems) return;

    const context: OrderAnalysisContext = {
      orderId: orderWithItems.id,
      selectedRestaurantId: selectedRestaurant.id,
      selectedRestaurantName: selectedRestaurant.name,
      restaurantCuisine: selectedRestaurant.cuisine,
      deliveryTime: selectedRestaurant.deliveryTime,
      items: (orderWithItems.order_items ?? []).map((item) => ({
        id: item.menu_item_id || item.id,
        name: item.item_name,
        price: Number(item.unit_price) || 0,
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbohydrates: item.carbohydrates || 0,
        fat: item.fat || 0,
        sugar: item.sugar || 0,
        sodium: item.sodium || 0,
        allergens: Array.isArray(item.allergens) ? item.allergens : [],
        quantity: item.quantity || 1,
      })),
      subtotal: Number(orderWithItems.subtotal) || 0,
      totalCalories: orderWithItems.total_calories ?? 0,
      averageMealScore: orderWithItems.average_meal_score ?? 80,
    };

    applyOrderToInventory(context);
    await updateOrderStatus(orderId, "accepted");

    notify({
      icon: "✅",
      title: "Order Accepted",
      description: `Order ${orderWithItems.order_number} accepted. Inventory and analytics updated.`,
      category: "Orders",
      severity: "success",
      dedupeKey: `accept-${orderId}`,
    });

    loadPendingOrders();
  }, [selectedRestaurant, notify]);

  const handleCompleteOrder = useCallback(async (orderId: string) => {
    await updateOrderStatus(orderId, "completed");

    notify({
      icon: "✅",
      title: "Order Completed",
      description: `Order has been marked as completed.`,
      category: "Orders",
      severity: "success",
      dedupeKey: `complete-${orderId}`,
    });

    loadPendingOrders();
  }, [notify]);

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

      {pendingOrdersLoading ? (
        <Card className="flex items-center justify-center py-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
            Loading pending orders...
          </div>
        </Card>
      ) : pendingOrders.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-lg">🕐</span>
            <div>
              <h2 className="text-lg font-bold text-white">Pending Orders</h2>
              <p className="text-xs text-muted">{pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"} waiting for action</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{order.order_number}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-muted">{order.notes || `₹${order.total_amount.toLocaleString("en-IN")} — ${order.total_calories ?? "—"} kcal`}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleCompleteOrder(order.id)}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

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
            <p className={`text-2xl font-bold ${pendingOrders.length > 0 ? "text-amber" : "text-white"}`}>
              {pendingOrders.length}
            </p>
            <p className="text-xs text-muted">{pendingOrders.length === 1 ? "order" : "orders"} waiting</p>
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
