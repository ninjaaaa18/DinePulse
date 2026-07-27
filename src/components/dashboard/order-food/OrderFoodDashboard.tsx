"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import {
  applyOrderToInventory,
  type OrderAnalysisContext,
} from "@/lib/orderAnalysis";
import {
  fallbackRestaurants,
  loadMenuItemsWithFallback,
  loadRestaurantsWithFallback,
  saveOrderToSupabase,
  type MenuItem,
  type Restaurant,
} from "@/lib/supabase";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";

type CartItem = MenuItem & {
  quantity: number;
};

const analysisSteps = [
  { label: "Order received", description: "Your basket is ready for review" },
  { label: "Menu items identified", description: "Restaurant selections mapped" },
  { label: "Calculating nutrition", description: "Macro and calorie totals are being estimated" },
  { label: "Checking allergies", description: "Potential allergen risks are being flagged" },
  { label: "Checking medical conditions", description: "Health-sensitive preferences are being reviewed" },
  { label: "Estimating meal health score", description: "A balanced score is being prepared" },
  { label: "Updating restaurant health", description: "Restaurant context is being incorporated" },
  { label: "Generating AI recommendations", description: "Insights are being synthesized" },
  { label: "Finalizing analysis", description: "Your review is almost ready" },
] as const;

function getEstimatedMealScore(item: MenuItem) {
  const proteinBonus = Math.min(20, item.protein * 0.4);
  const sugarPenalty = Math.min(25, item.sugar * 1.6);
  const sodiumPenalty = Math.min(20, item.sodium / 45);
  const fatPenalty = Math.min(18, item.fat * 0.7);
  const score = 100 - sugarPenalty - sodiumPenalty - fatPenalty + proteinBonus;

  return Math.max(65, Math.min(96, Math.round(score)));
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function OrderFoodDashboard() {
  const router = useRouter();
  const { setActiveOrder } = useActiveOrder();
  const { notify } = useNotifications();
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>(fallbackRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(fallbackRestaurants[0].id);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackRestaurants[0].items);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processingContext, setProcessingContext] = useState<OrderAnalysisContext | null>(null);

  // Load restaurants on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const fetched = await loadRestaurantsWithFallback();
      if (!isMounted) return;

      setRestaurantsList(fetched);
      if (fetched.length > 0) {
        setSelectedRestaurant((prev) =>
          fetched.some((r) => r.id === prev || r.slug === prev) ? prev : fetched[0].id
        );
      }
      setLoadingRestaurants(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load menu items when selectedRestaurant changes
  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      setLoadingMenu(true);
      const matchingFallback =
        fallbackRestaurants.find((r) => r.id === selectedRestaurant || r.slug === selectedRestaurant)?.items ||
        fallbackRestaurants[0].items;

      const items = await loadMenuItemsWithFallback(selectedRestaurant, matchingFallback);
      if (!isMounted) return;

      setMenuItems(items);
      setLoadingMenu(false);
    }

    loadMenu();
    return () => {
      isMounted = false;
    };
  }, [selectedRestaurant]);

  const restaurant =
    restaurantsList.find((item) => item.id === selectedRestaurant || item.slug === selectedRestaurant) ??
    restaurantsList[0];

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const totalCalories = useMemo(
    () => cart.reduce((sum, item) => sum + item.calories * item.quantity, 0),
    [cart],
  );

  const averageMealScore = useMemo(() => {
    if (!cart.length) return 0;
    const average =
      cart.reduce((sum, item) => sum + getEstimatedMealScore(item), 0) / cart.length;

    return Math.round(average);
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  useEffect(() => {
    if (!isProcessing || !processingContext) {
      return;
    }

    let stepCount = 0;
    setCompletedSteps(0);

    const intervalId = window.setInterval(() => {
      stepCount += 1;
      setCompletedSteps(stepCount);

      if (stepCount >= analysisSteps.length) {
        window.clearInterval(intervalId);
        window.setTimeout(() => {
          router.push("/dashboard/customer-health");
        }, 600);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isProcessing, processingContext, router]);

  const handleProceed = async () => {
    if (!cart.length) {
      setAnalysisMessage("Add a few dishes to build your order summary first.");
      return;
    }

    const context: OrderAnalysisContext = {
      orderId: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      selectedRestaurantId: selectedRestaurant,
      selectedRestaurantName: restaurant.name,
      restaurantCuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliveryTime,
      items: cart.map((item) => ({ ...item })),
      subtotal,
      totalCalories,
      averageMealScore,
    };

    setActiveOrder(context);

    // Save order & order_items to Supabase PostgreSQL (Phase 1) with graceful fallback
    try {
      await saveOrderToSupabase(context);
    } catch (err) {
      console.warn("[Order Sync Fallback] Failed to save order to Supabase, continuing with sessionStorage:", err);
    }

    const updatedInventory = applyOrderToInventory(context);
    const lowStockItems = updatedInventory.filter((item) => item.warning);
    notify({
      icon: "✓",
      title: "Order completed",
      description: `${context.items.length} dish${context.items.length === 1 ? "" : "es"} from ${restaurant.name} is ready for analysis.`,
      category: "Orders",
      severity: "success",
      dedupeKey: `order-completed-${context.orderId}`,
    });
    notify({
      icon: "₹",
      title: "Analytics updated",
      description: `Revenue increased by ₹${subtotal.toLocaleString("en-IN")} from the latest order.`,
      category: "AI Insights",
      severity: "information",
      dedupeKey: `analytics-update-${context.orderId}`,
    });
    notify({
      icon: "□",
      title: "Inventory updated",
      description: "Ingredient stock has been adjusted for the completed order.",
      category: "Inventory",
      severity: "information",
      dedupeKey: `inventory-update-${context.orderId}`,
    });
    lowStockItems.forEach((item) => {
      notify({
        icon: "!",
        title: `${item.name} stock is low`,
        description: item.warning ?? "Restock this ingredient soon.",
        category: "Inventory",
        severity: item.status === "Critical" ? "critical" : "warning",
        dedupeKey: `low-stock-${context.orderId}-${item.id}`,
      });
    });
    if (averageMealScore < 80) {
      notify({
        icon: "!",
        title: "High-calorie meal detected",
        description: `This order has a meal health score of ${averageMealScore}/100 and may need a healthier swap.`,
        category: "Customer Activity",
        severity: "warning",
        dedupeKey: `meal-score-${context.orderId}`,
      });
    }
    const detectedAllergens = Array.from(
      new Set(context.items.flatMap((item) => item.allergens.filter((allergen) => allergen !== "None"))),
    );
    if (detectedAllergens.length > 0) {
      notify({
        icon: "!",
        title: "Dietary safety risk detected",
        description: `This order contains: ${detectedAllergens.join(", ")}. Review the dietary safety guidance before serving.`,
        category: "Customer Activity",
        severity: "warning",
        dedupeKey: `dietary-risk-${context.orderId}`,
      });
    }
    setProcessingContext(context);
    setCompletedSteps(0);
    setIsProcessing(true);
    setAnalysisMessage("");
  };

  const progressPercent = Math.round((completedSteps / analysisSteps.length) * 100);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      {isProcessing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
          <div className="animate-fade-in-up w-full max-w-2xl rounded-[32px] border border-emerald/20 bg-surface/95 p-6 shadow-2xl shadow-emerald/10 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald">
                  AI processing
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  🤖 DinePulse AI is analyzing your order...
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Your selected dishes are being translated into a nutrition-aware review with restaurant and allergy context.
                </p>
              </div>

              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-24 w-24 -rotate-90">
                  <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-white">{progressPercent}%</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted">running</span>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {analysisSteps.map((step, index) => {
                const completed = index < completedSteps;
                const active = index === completedSteps && completedSteps < analysisSteps.length;

                return (
                  <div
                    key={step.label}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 ${
                      completed
                        ? "border-emerald/20 bg-emerald/10"
                        : active
                          ? "border-emerald/20 bg-emerald/5"
                          : "border-white/10 bg-background/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                          completed || active
                            ? "border-emerald/30 bg-emerald/15 text-emerald"
                            : "border-white/10 text-muted"
                        }`}
                      >
                        {completed ? "✓" : step.label.includes("Order") ? "🍽" : step.label.includes("Menu") ? "✅" : step.label.includes("nutrition") ? "🥗" : step.label.includes("allergies") ? "🩺" : step.label.includes("medical") ? "❤️" : step.label.includes("score") ? "📊" : step.label.includes("restaurant") ? "🏥" : step.label.includes("recommendations") ? "🤖" : "✨"}
                      </div>
                      <div>
                        <p className={`font-medium ${completed || active ? "text-white" : "text-muted"}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-muted">{step.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium uppercase tracking-[0.25em] ${completed || active ? "text-emerald" : "text-muted"}`}>
                      {completed ? "Done" : active ? "Active" : "Queued"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">
          Order Food
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurant ordering experience
        </h1>
        <p className="max-w-3xl text-sm text-muted sm:text-base">
          Pick a restaurant, build your basket, and review your order with a polished SaaS-ready flow.
        </p>
      </header>

      <Card hover className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Restaurant Selector</h2>
            <p className="text-sm text-muted">Choose a kitchen and explore its menu.</p>
          </div>
          <div className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
            {restaurant.deliveryTime}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {restaurantsList.map((option) => {
            const active = selectedRestaurant === option.id || selectedRestaurant === option.slug;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedRestaurant(option.id)}
                className={`rounded-[22px] border p-4 text-left transition-all duration-300 ${
                  active
                    ? "border-emerald/30 bg-emerald/10 shadow-lg shadow-emerald/10"
                    : "border-white/10 bg-background/60 hover:-translate-y-0.5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-surface/70 text-lg">
                      {option.logo}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{option.name}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald">{option.cuisine}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{option.description}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card hover className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Dynamic Menu Grid</h2>
                <p className="text-sm text-muted">Browse the featured dishes below.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted">
                {restaurant.name}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {loadingMenu ? (
                <div className="col-span-2 flex items-center justify-center p-8 text-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
                    <span>Loading menu items...</span>
                  </div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-dashed border-white/10 p-8 text-center text-muted">
                  No menu items available for this restaurant.
                </div>
              ) : (
                menuItems.map((item) => {
                  const inCart = cart.find((entry) => entry.id === item.id);
                  return (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-[24px] border border-white/10 bg-background/60 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/25 hover:shadow-xl hover:shadow-emerald/10"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-sm text-muted">{item.calories} kcal • {item.protein}g protein</p>
                        </div>
                        <div className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-[11px] text-emerald">
                          {item.badgeIcon} {item.badge}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          Carbs {item.carbohydrates}g
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          Fat {item.fat}g
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          Sugar {item.sugar}g
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          Sodium {item.sodium}mg
                        </span>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-muted">Allergens</p>
                        <p className="mt-1 text-sm text-white">{item.allergens.join(", ")}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted">
                          {inCart ? `${inCart.quantity} in cart` : item.badge}
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card hover className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Shopping Cart</h2>
                <p className="text-sm text-muted">Adjust quantity and remove items.</p>
              </div>
              <div className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-sm text-emerald">
                {cart.reduce((count, item) => count + item.quantity, 0)} items
              </div>
            </div>

            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-background/40 p-4 text-sm text-muted">
                  Your cart is empty. Add a few dishes to start building your order.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-background/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-muted">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-sm text-rose-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white"
                      >
                        −
                      </button>
                      <div className="min-w-10 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card hover className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Order Summary</h2>
              <p className="text-sm text-muted">A quick estimate of your basket.</p>
            </div>

            <div className="rounded-2xl border border-emerald/20 bg-emerald/10 p-4">
              <div className="flex items-center justify-between text-sm text-emerald">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-emerald">
                <span>Total Calories</span>
                <span>{totalCalories} kcal</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-emerald">
                <span>Average Meal Score</span>
                <span>{averageMealScore || "—"}</span>
              </div>
            </div>

            <Button variant="primary" size="md" onClick={handleProceed} className="w-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
              Proceed to Analysis
            </Button>

            {analysisMessage ? (
              <div className="rounded-2xl border border-white/10 bg-background/60 p-3 text-sm text-muted">
                {analysisMessage}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
