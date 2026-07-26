"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { applyOrderToInventory, persistOrderAnalysisContext, serializeOrderAnalysisContext, type OrderAnalysisContext } from "@/lib/orderAnalysis";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar: number;
  sodium: number;
  allergens: string[];
  image: string;
  badge: string;
  badgeIcon: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  deliveryTime: string;
  logo: string;
  items: MenuItem[];
};

type CartItem = MenuItem & {
  quantity: number;
};

const restaurants: Restaurant[] = [
  {
    id: "burger-hub",
    name: "Burger Hub",
    cuisine: "American Grill",
    description: "Classic burgers with balanced sides and premium toppings.",
    deliveryTime: "18–25 min",
    logo: "🍔",
    items: [
      {
        id: "smoke-burger",
        name: "Smoky Stack Burger",
        price: 249,
        calories: 740,
        protein: 34,
        carbohydrates: 58,
        fat: 36,
        sugar: 12,
        sodium: 920,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "avocado-blt",
        name: "Avocado Crunch Burger",
        price: 279,
        calories: 690,
        protein: 31,
        carbohydrates: 54,
        fat: 33,
        sugar: 9,
        sodium: 860,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "loaded-fries",
        name: "Crispy Loaded Fries",
        price: 149,
        calories: 520,
        protein: 12,
        carbohydrates: 62,
        fat: 24,
        sugar: 2,
        sodium: 730,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1576107232684-2f0f8d0456f1?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "grill-chicken-bowl",
        name: "Grill Chicken Bowl",
        price: 219,
        calories: 610,
        protein: 41,
        carbohydrates: 49,
        fat: 21,
        sugar: 8,
        sodium: 760,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "mint-lemonade",
        name: "Mint Lemonade",
        price: 89,
        calories: 170,
        protein: 1,
        carbohydrates: 41,
        fat: 0,
        sugar: 35,
        sodium: 85,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1523374228107-6e44bd2b524e?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "double-stack",
        name: "Double Stack Combo",
        price: 329,
        calories: 930,
        protein: 46,
        carbohydrates: 76,
        fat: 44,
        sugar: 13,
        sodium: 1020,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
    ],
  },
  {
    id: "healthy-bites",
    name: "Healthy Bites",
    cuisine: "Fresh Wellness",
    description: "Bright bowls, protein-packed plates, and light sides.",
    deliveryTime: "15–20 min",
    logo: "🥗",
    items: [
      {
        id: "green-protein-bowl",
        name: "Green Protein Bowl",
        price: 199,
        calories: 560,
        protein: 37,
        carbohydrates: 42,
        fat: 22,
        sugar: 7,
        sodium: 680,
        allergens: ["Sesame"],
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "super-salad-wrap",
        name: "Super Salad Wrap",
        price: 179,
        calories: 480,
        protein: 24,
        carbohydrates: 38,
        fat: 20,
        sugar: 6,
        sodium: 590,
        allergens: ["Gluten", "Sesame"],
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "harvest-soup",
        name: "Harvest Soup Cup",
        price: 129,
        calories: 260,
        protein: 9,
        carbohydrates: 30,
        fat: 10,
        sugar: 8,
        sodium: 540,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "sea-salt-kale",
        name: "Sea Salt Kale Chips",
        price: 119,
        calories: 220,
        protein: 4,
        carbohydrates: 18,
        fat: 14,
        sugar: 3,
        sodium: 420,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "berry-boost",
        name: "Berry Boost Smoothie",
        price: 149,
        calories: 290,
        protein: 11,
        carbohydrates: 44,
        fat: 8,
        sugar: 28,
        sodium: 120,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "grain-power-plate",
        name: "Grain Power Plate",
        price: 229,
        calories: 640,
        protein: 29,
        carbohydrates: 71,
        fat: 24,
        sugar: 9,
        sodium: 710,
        allergens: ["Sesame"],
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
    ],
  },
  {
    id: "italian-kitchen",
    name: "Italian Kitchen",
    cuisine: "Mediterranean Pasta",
    description: "Comforting pasta dishes and artisan flatbreads.",
    deliveryTime: "20–30 min",
    logo: "🍝",
    items: [
      {
        id: "margherita-pasta",
        name: "Margherita Pasta",
        price: 239,
        calories: 720,
        protein: 26,
        carbohydrates: 94,
        fat: 28,
        sugar: 8,
        sodium: 860,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "pesto-penne",
        name: "Pesto Penne Bowl",
        price: 269,
        calories: 780,
        protein: 24,
        carbohydrates: 81,
        fat: 35,
        sugar: 7,
        sodium: 770,
        allergens: ["Gluten", "Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "caprese-flatbread",
        name: "Caprese Flatbread",
        price: 199,
        calories: 660,
        protein: 21,
        carbohydrates: 72,
        fat: 30,
        sugar: 6,
        sodium: 740,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "tomato-basil-soup",
        name: "Tomato Basil Soup",
        price: 129,
        calories: 230,
        protein: 7,
        carbohydrates: 30,
        fat: 9,
        sugar: 10,
        sodium: 610,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "tiramisu-cup",
        name: "Tiramisu Cup",
        price: 159,
        calories: 310,
        protein: 6,
        carbohydrates: 39,
        fat: 14,
        sugar: 23,
        sodium: 120,
        allergens: ["Gluten", "Egg", "Milk"],
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "truffle-gnocchi",
        name: "Truffle Gnocchi",
        price: 289,
        calories: 850,
        protein: 20,
        carbohydrates: 108,
        fat: 39,
        sugar: 9,
        sodium: 890,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
    ],
  },
  {
    id: "south-spice",
    name: "South Spice",
    cuisine: "Indian Street Food",
    description: "Spiced curries, rice plates, and vibrant appetizers.",
    deliveryTime: "22–28 min",
    logo: "🍛",
    items: [
      {
        id: "tandoori-platter",
        name: "Tandoori Platter",
        price: 269,
        calories: 710,
        protein: 39,
        carbohydrates: 52,
        fat: 32,
        sugar: 7,
        sodium: 780,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "coconut-curry",
        name: "Coconut Curry Bowl",
        price: 229,
        calories: 670,
        protein: 24,
        carbohydrates: 61,
        fat: 29,
        sugar: 9,
        sodium: 690,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "chili-naan",
        name: "Chili Garlic Naan",
        price: 119,
        calories: 280,
        protein: 8,
        carbohydrates: 42,
        fat: 8,
        sugar: 4,
        sodium: 560,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "mint-chutney-wrap",
        name: "Mint Chutney Wrap",
        price: 169,
        calories: 430,
        protein: 19,
        carbohydrates: 39,
        fat: 18,
        sugar: 5,
        sodium: 620,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "masala-fries",
        name: "Masala Fries",
        price: 129,
        calories: 500,
        protein: 8,
        carbohydrates: 58,
        fat: 24,
        sugar: 2,
        sodium: 760,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "mango-lassi",
        name: "Mango Lassi",
        price: 109,
        calories: 320,
        protein: 10,
        carbohydrates: 44,
        fat: 12,
        sugar: 31,
        sodium: 180,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
    ],
  },
];

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
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processingContext, setProcessingContext] = useState<OrderAnalysisContext | null>(null);

  const restaurant = restaurants.find((item) => item.id === selectedRestaurant) ?? restaurants[0];

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
          router.push(
            `/dashboard/customer-health?orderData=${serializeOrderAnalysisContext(processingContext)}`,
          );
        }, 600);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isProcessing, processingContext, router]);

  const handleProceed = () => {
    if (!cart.length) {
      setAnalysisMessage("Add a few dishes to build your order summary first.");
      return;
    }

    const context: OrderAnalysisContext = {
      selectedRestaurantId: selectedRestaurant,
      selectedRestaurantName: restaurant.name,
      restaurantCuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliveryTime,
      items: cart.map((item) => ({ ...item })),
      subtotal,
      totalCalories,
      averageMealScore,
    };

    persistOrderAnalysisContext(context);
    applyOrderToInventory(context);
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
          {restaurants.map((option) => {
            const active = selectedRestaurant === option.id;
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
              {restaurant.items.map((item) => {
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
              })}
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
