import { fallbackRestaurants, type Restaurant } from "@/lib/supabase/menu";
import type { AnalyticsChartPoint, AnalyticsSnapshot, InventoryIngredient } from "@/lib/orderAnalysis";
import type { ActivityItem } from "@/components/dashboard/RecentActivity";
import type { RecommendationItem } from "@/components/dashboard/AIRecommendations";

export type RestaurantDashboardMetrics = {
  restaurant: Restaurant;
  healthScore: number;
  customerMealHealth: number;
  healthyMealPercent: number;
  ordersToday: number;
  revenue: number;
  averageCustomerSatisfaction: number;
  foodWastePercent: string;
  revenueTrend: AnalyticsChartPoint[];
  recentActivity: ActivityItem[];
  aiRecommendations: RecommendationItem[];
};

export const restaurantDashboardCatalog: Record<string, RestaurantDashboardMetrics> = {
  "urban-burger": {
    restaurant: fallbackRestaurants[0],
    healthScore: 85,
    customerMealHealth: 82,
    healthyMealPercent: 78,
    ordersToday: 142,
    revenue: 18400,
    averageCustomerSatisfaction: 96,
    foodWastePercent: "3.4%",
    revenueTrend: [
      { label: "Mon", value: 14200 },
      { label: "Tue", value: 15800 },
      { label: "Wed", value: 16400 },
      { label: "Thu", value: 17100 },
      { label: "Fri", value: 19500 },
      { label: "Sat", value: 21800 },
      { label: "Sun", value: 18400 },
    ],
    recentActivity: [
      {
        id: "ub-act-1",
        action: "New order placed",
        detail: "Urban Burger — Classic Burger & Peri Peri Fries",
        time: "2 min ago",
        icon: "🛒",
      },
      {
        id: "ub-act-2",
        action: "Meal health evaluated",
        detail: "Average health score: 84/100 (620 kcal)",
        time: "5 min ago",
        icon: "🥗",
      },
      {
        id: "ub-act-3",
        action: "Inventory auto-updated",
        detail: "Stock adjusted for Chicken Patty & Burger Buns",
        time: "12 min ago",
        icon: "📦",
      },
      {
        id: "ub-act-4",
        action: "Revenue milestone",
        detail: "+₹18,400 daily total achieved",
        time: "30 min ago",
        icon: "💰",
      },
    ],
    aiRecommendations: [
      {
        id: "ub-rec-1",
        title: "Restock Peri Peri Spice",
        description: "Peri Peri spice mix stock is at 22%. Reorder by 5 PM.",
        priority: "Medium",
        icon: "📦",
      },
      {
        id: "ub-rec-2",
        title: "Promote Veg Burger Combo",
        description: "Highlight plant-based Veg Burger for low-sodium lunch orders.",
        priority: "High",
        icon: "🥗",
      },
      {
        id: "ub-rec-3",
        title: "Double Cheese Burger Surge",
        description: "High evening demand detected. Feature as weekend special.",
        priority: "Medium",
        icon: "⭐",
      },
    ],
  },
  "firegrill-kitchen": {
    restaurant: fallbackRestaurants[1],
    healthScore: 88,
    customerMealHealth: 86,
    healthyMealPercent: 84,
    ordersToday: 118,
    revenue: 24600,
    averageCustomerSatisfaction: 94,
    foodWastePercent: "2.8%",
    revenueTrend: [
      { label: "Mon", value: 18500 },
      { label: "Tue", value: 20100 },
      { label: "Wed", value: 21400 },
      { label: "Thu", value: 22800 },
      { label: "Fri", value: 26200 },
      { label: "Sat", value: 28900 },
      { label: "Sun", value: 24600 },
    ],
    recentActivity: [
      {
        id: "fg-act-1",
        action: "New order placed",
        detail: "FireGrill Kitchen — Grilled Chicken & Garlic Bread",
        time: "3 min ago",
        icon: "🛒",
      },
      {
        id: "fg-act-2",
        action: "High protein meal prepped",
        detail: "Grilled Chicken meal score: 88/100 (48g protein)",
        time: "8 min ago",
        icon: "🥩",
      },
      {
        id: "fg-act-3",
        action: "Grill safety check",
        detail: "Flame grill temperature verified at 450°F",
        time: "15 min ago",
        icon: "🔥",
      },
      {
        id: "fg-act-4",
        action: "Peak rush logged",
        detail: "34 dinner orders completed seamlessly",
        time: "45 min ago",
        icon: "💰",
      },
    ],
    aiRecommendations: [
      {
        id: "fg-rec-1",
        title: "Promote Grilled Chicken Pack",
        description: "High fitness customer demand. Feature lean protein meal.",
        priority: "High",
        icon: "🥩",
      },
      {
        id: "fg-rec-2",
        title: "Low stock alert: BBQ Sauce",
        description: "BBQ sauce inventory down to 15 bottles. Restock within 24h.",
        priority: "High",
        icon: "📦",
      },
      {
        id: "fg-rec-3",
        title: "Prep Wings early for surge",
        description: "Expect +30% BBQ Wings demand during evening hours.",
        priority: "Medium",
        icon: "🔥",
      },
    ],
  },
  "green-garden-cafe": {
    restaurant: fallbackRestaurants[2],
    healthScore: 96,
    customerMealHealth: 94,
    healthyMealPercent: 95,
    ordersToday: 86,
    revenue: 9300,
    averageCustomerSatisfaction: 98,
    foodWastePercent: "1.5%",
    revenueTrend: [
      { label: "Mon", value: 7200 },
      { label: "Tue", value: 8100 },
      { label: "Wed", value: 8600 },
      { label: "Thu", value: 8900 },
      { label: "Fri", value: 10400 },
      { label: "Sat", value: 11200 },
      { label: "Sun", value: 9300 },
    ],
    recentActivity: [
      {
        id: "gg-act-1",
        action: "New order placed",
        detail: "Green Garden Café — Caesar Salad & Fresh Lime Juice",
        time: "1 min ago",
        icon: "🛒",
      },
      {
        id: "gg-act-2",
        action: "Superfood meal evaluated",
        detail: "Avocado Toast wellness score: 96/100 (410 kcal)",
        time: "4 min ago",
        icon: "🥗",
      },
      {
        id: "gg-act-3",
        action: "Organic shipment received",
        detail: "Fresh spinach & crisp lettuce restocked",
        time: "20 min ago",
        icon: "📦",
      },
      {
        id: "gg-act-4",
        action: "Customer Wellness top score",
        detail: "98% satisfaction rating achieved today",
        time: "1 hr ago",
        icon: "⭐",
      },
    ],
    aiRecommendations: [
      {
        id: "gg-rec-1",
        title: "Highlight Greek Salad",
        description: "Low-calorie Greek Salad is trending among wellness diners.",
        priority: "Medium",
        icon: "🥗",
      },
      {
        id: "gg-rec-2",
        title: "Restock Organic Avocados",
        description: "Avocado inventory approaching threshold. Reorder by 10 AM.",
        priority: "High",
        icon: "🥑",
      },
      {
        id: "gg-rec-3",
        title: "Launch Fruit Cup Smoothie Combo",
        description: "Pair Fruit Bowl with Fresh Lime Juice for breakfast boost.",
        priority: "Low",
        icon: "🍓",
      },
    ],
  },
  "pizza-forge": {
    restaurant: fallbackRestaurants[3],
    healthScore: 82,
    customerMealHealth: 79,
    healthyMealPercent: 74,
    ordersToday: 98,
    revenue: 14900,
    averageCustomerSatisfaction: 92,
    foodWastePercent: "3.9%",
    revenueTrend: [
      { label: "Mon", value: 11400 },
      { label: "Tue", value: 12800 },
      { label: "Wed", value: 13200 },
      { label: "Thu", value: 14100 },
      { label: "Fri", value: 16800 },
      { label: "Sat", value: 18500 },
      { label: "Sun", value: 14900 },
    ],
    recentActivity: [
      {
        id: "pf-act-1",
        action: "New order placed",
        detail: "Pizza Forge — Farmhouse Pizza & Cheese Sticks",
        time: "4 min ago",
        icon: "🛒",
      },
      {
        id: "pf-act-2",
        action: "Mozzarella stock updated",
        detail: "Cheese inventory deducted for 3 pizzas",
        time: "10 min ago",
        icon: "🧀",
      },
      {
        id: "pf-act-3",
        action: "Wood-fired oven status",
        detail: "Oven pre-heated for artisan thin crust prep",
        time: "18 min ago",
        icon: "🍕",
      },
      {
        id: "pf-act-4",
        action: "Afternoon combo deal",
        detail: "22 pizza combo orders logged during lunch",
        time: "40 min ago",
        icon: "💰",
      },
    ],
    aiRecommendations: [
      {
        id: "pf-rec-1",
        title: "Introduce Whole-Wheat Crust",
        description: "Boost meal health score by offering whole-grain pizza bases.",
        priority: "High",
        icon: "🥦",
      },
      {
        id: "pf-rec-2",
        title: "Feature Veg Supreme Lunch Special",
        description: "High margin on Veg Supreme. Feature in lunch promotions.",
        priority: "Medium",
        icon: "🍕",
      },
      {
        id: "pf-rec-3",
        title: "Restock Pizza Dough Base",
        description: "24 dough units remaining. Restock before dinner peak.",
        priority: "High",
        icon: "📦",
      },
    ],
  },
  "spice-route": {
    restaurant: fallbackRestaurants[4],
    healthScore: 90,
    customerMealHealth: 88,
    healthyMealPercent: 89,
    ordersToday: 134,
    revenue: 21800,
    averageCustomerSatisfaction: 96,
    foodWastePercent: "2.2%",
    revenueTrend: [
      { label: "Mon", value: 16500 },
      { label: "Tue", value: 18200 },
      { label: "Wed", value: 19400 },
      { label: "Thu", value: 20100 },
      { label: "Fri", value: 23600 },
      { label: "Sat", value: 25800 },
      { label: "Sun", value: 21800 },
    ],
    recentActivity: [
      {
        id: "sr-act-1",
        action: "New order placed",
        detail: "Spice Route — Paneer Butter Masala & Garlic Naan",
        time: "2 min ago",
        icon: "🛒",
      },
      {
        id: "sr-act-2",
        action: "Royal Biryani prepped",
        detail: "Chicken Biryani meal score: 91/100 (610 kcal)",
        time: "6 min ago",
        icon: "🍚",
      },
      {
        id: "sr-act-3",
        action: "Tandoor oven calibrated",
        detail: "Naan clay tandoor temperature verified",
        time: "14 min ago",
        icon: "🫓",
      },
      {
        id: "sr-act-4",
        action: "Royal Thali feast order",
        detail: "+₹2,400 order subtotal logged",
        time: "35 min ago",
        icon: "👑",
      },
    ],
    aiRecommendations: [
      {
        id: "sr-rec-1",
        title: "Feature Royal Paneer Feast",
        description: "Top vegetarian item. Pair Paneer Butter Masala with Garlic Naan.",
        priority: "Medium",
        icon: "👑",
      },
      {
        id: "sr-rec-2",
        title: "Basmati Rice Stock Healthy",
        description: "70 kg Basmati Rice available for weekend biryani demand.",
        priority: "Low",
        icon: "🍚",
      },
      {
        id: "sr-rec-3",
        title: "Optimize Naan Dough Prep",
        description: "Expect +40 Naan orders during 7–9 PM peak hours.",
        priority: "High",
        icon: "🫓",
      },
    ],
  },
  "fresh-bowl": {
    restaurant: fallbackRestaurants[5],
    healthScore: 95,
    customerMealHealth: 93,
    healthyMealPercent: 94,
    ordersToday: 92,
    revenue: 12100,
    averageCustomerSatisfaction: 98,
    foodWastePercent: "1.8%",
    revenueTrend: [
      { label: "Mon", value: 9100 },
      { label: "Tue", value: 10200 },
      { label: "Wed", value: 11000 },
      { label: "Thu", value: 11800 },
      { label: "Fri", value: 13400 },
      { label: "Sat", value: 14600 },
      { label: "Sun", value: 12100 },
    ],
    recentActivity: [
      {
        id: "fb-act-1",
        action: "New order placed",
        detail: "Fresh Bowl — Buddha Bowl & Fresh Orange Juice",
        time: "3 min ago",
        icon: "🛒",
      },
      {
        id: "fb-act-2",
        action: "Protein bowl evaluated",
        detail: "Quinoa Bowl nutrition score: 95/100 (390 kcal)",
        time: "7 min ago",
        icon: "🌾",
      },
      {
        id: "fb-act-3",
        action: "Quinoa grain auto-replenished",
        detail: "Stock updated for 30 kg quinoa inventory",
        time: "16 min ago",
        icon: "📦",
      },
      {
        id: "fb-act-4",
        action: "Post-workout surge",
        detail: "Fitness bowl orders increased by 24% today",
        time: "50 min ago",
        icon: "⚡",
      },
    ],
    aiRecommendations: [
      {
        id: "fb-rec-1",
        title: "Highlight Quinoa Superfood Bowl",
        description: "Top gluten-free choice. Feature for post-workout diners.",
        priority: "High",
        icon: "🌾",
      },
      {
        id: "fb-rec-2",
        title: "Cold Pressed Orange Juice Alert",
        description: "Reorder organic oranges to meet morning juice demand.",
        priority: "Medium",
        icon: "🍊",
      },
      {
        id: "fb-rec-3",
        title: "Promote Paneer Protein Bowl",
        description: "26g protein per bowl. Feature in lunch fitness menu.",
        priority: "Low",
        icon: "⚡",
      },
    ],
  },
};

export function getRestaurantDashboardMetrics(
  restaurantIdOrSlug: string,
  liveAnalytics?: AnalyticsSnapshot | null
): RestaurantDashboardMetrics {
  const normalizedKey = (restaurantIdOrSlug || "").toLowerCase();

  const matchedKey =
    Object.keys(restaurantDashboardCatalog).find(
      (key) =>
        key === normalizedKey ||
        restaurantDashboardCatalog[key].restaurant.id === restaurantIdOrSlug ||
        restaurantDashboardCatalog[key].restaurant.slug === restaurantIdOrSlug ||
        restaurantDashboardCatalog[key].restaurant.name.toLowerCase() === normalizedKey
    ) || "urban-burger";

  const baseMetrics = restaurantDashboardCatalog[matchedKey];

  if (!liveAnalytics || liveAnalytics.totalOrders === 0) {
    return baseMetrics;
  }

  // Merge live active order analytics into base metrics
  const mergedRevenue = baseMetrics.revenue + liveAnalytics.revenue;
  const mergedOrders = baseMetrics.ordersToday + liveAnalytics.totalOrders;

  return {
    ...baseMetrics,
    ordersToday: mergedOrders,
    revenue: mergedRevenue,
    customerMealHealth: Math.round(
      (baseMetrics.customerMealHealth + liveAnalytics.averageMealHealthScore) / 2
    ),
    averageCustomerSatisfaction: Math.round(
      (baseMetrics.averageCustomerSatisfaction + liveAnalytics.averageCustomerSatisfaction) / 2
    ),
  };
}
