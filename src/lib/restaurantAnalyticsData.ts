import type { AnalyticsSnapshot } from "@/lib/orderAnalysis";
import type { Restaurant } from "@/lib/supabase/menu";

export const restaurantAnalyticsCatalog: Record<string, AnalyticsSnapshot> = {
  "urban-burger": {
    totalOrders: 142,
    revenue: 18400,
    averageMealHealthScore: 82,
    caloriesServed: 92400,
    popularDish: "Classic Burger",
    healthyMealPercent: 78,
    unhealthyMealPercent: 22,
    averageCustomerSatisfaction: 96,
    revenueTrend: [
      { label: "Mon", value: 14200 },
      { label: "Tue", value: 15800 },
      { label: "Wed", value: 16400 },
      { label: "Thu", value: 17100 },
      { label: "Fri", value: 19500 },
      { label: "Sat", value: 21800 },
      { label: "Sun", value: 18400 },
    ],
    ordersTrend: [
      { label: "Mon", value: 110 },
      { label: "Tue", value: 122 },
      { label: "Wed", value: 128 },
      { label: "Thu", value: 132 },
      { label: "Fri", value: 150 },
      { label: "Sat", value: 168 },
      { label: "Sun", value: 142 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 110 },
      { label: "Standard Meals (60–79)", value: 24 },
      { label: "High Calorie Meals (<60)", value: 8 },
    ],
    topSellingFoods: [
      { label: "Classic Burger", value: 58 },
      { label: "Peri Peri Fries", value: 42 },
      { label: "Double Cheese Burger", value: 28 },
      { label: "Veg Burger", value: 24 },
      { label: "Cola", value: 36 },
    ],
    insights: [
      "Classic Burger led demand with 58 orders completed today.",
      "78% of customer orders included balanced side combinations.",
      "Peak order volume occurred during the 7–9 PM dinner rush.",
    ],
    lastOrderSignature: null,
  },
  "firegrill-kitchen": {
    totalOrders: 118,
    revenue: 24600,
    averageMealHealthScore: 86,
    caloriesServed: 74300,
    popularDish: "Grilled Chicken",
    healthyMealPercent: 84,
    unhealthyMealPercent: 16,
    averageCustomerSatisfaction: 94,
    revenueTrend: [
      { label: "Mon", value: 18500 },
      { label: "Tue", value: 20100 },
      { label: "Wed", value: 21400 },
      { label: "Thu", value: 22800 },
      { label: "Fri", value: 26200 },
      { label: "Sat", value: 28900 },
      { label: "Sun", value: 24600 },
    ],
    ordersTrend: [
      { label: "Mon", value: 88 },
      { label: "Tue", value: 96 },
      { label: "Wed", value: 102 },
      { label: "Thu", value: 108 },
      { label: "Fri", value: 126 },
      { label: "Sat", value: 138 },
      { label: "Sun", value: 118 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 99 },
      { label: "Standard Meals (60–79)", value: 14 },
      { label: "High Calorie Meals (<60)", value: 5 },
    ],
    topSellingFoods: [
      { label: "Grilled Chicken", value: 48 },
      { label: "BBQ Wings", value: 34 },
      { label: "Steak Sandwich", value: 26 },
      { label: "Garlic Bread", value: 30 },
      { label: "Lemon Soda", value: 22 },
    ],
    insights: [
      "High demand for high-protein Grilled Chicken meal (48g protein).",
      "84% healthy meal ratio achieved across dinner rush.",
      "Peak order volume occurred during the 8–10 PM grill rush.",
    ],
    lastOrderSignature: null,
  },
  "green-garden-cafe": {
    totalOrders: 86,
    revenue: 9300,
    averageMealHealthScore: 94,
    caloriesServed: 31800,
    popularDish: "Caesar Salad",
    healthyMealPercent: 95,
    unhealthyMealPercent: 5,
    averageCustomerSatisfaction: 98,
    revenueTrend: [
      { label: "Mon", value: 7200 },
      { label: "Tue", value: 8100 },
      { label: "Wed", value: 8600 },
      { label: "Thu", value: 8900 },
      { label: "Fri", value: 10400 },
      { label: "Sat", value: 11200 },
      { label: "Sun", value: 9300 },
    ],
    ordersTrend: [
      { label: "Mon", value: 66 },
      { label: "Tue", value: 74 },
      { label: "Wed", value: 78 },
      { label: "Thu", value: 82 },
      { label: "Fri", value: 96 },
      { label: "Sat", value: 104 },
      { label: "Sun", value: 86 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 82 },
      { label: "Standard Meals (60–79)", value: 3 },
      { label: "High Calorie Meals (<60)", value: 1 },
    ],
    topSellingFoods: [
      { label: "Caesar Salad", value: 38 },
      { label: "Avocado Toast", value: 26 },
      { label: "Veg Wrap", value: 20 },
      { label: "Fresh Lime Juice", value: 24 },
      { label: "Fruit Bowl", value: 18 },
    ],
    insights: [
      "Caesar Salad & Avocado Toast generated 65% of lunch revenue.",
      "95% superfood meal health compliance rating.",
      "Peak order volume occurred during the 12–2 PM lunch hours.",
    ],
    lastOrderSignature: null,
  },
  "pizza-forge": {
    totalOrders: 98,
    revenue: 14900,
    averageMealHealthScore: 79,
    caloriesServed: 84200,
    popularDish: "Margherita Pizza",
    healthyMealPercent: 74,
    unhealthyMealPercent: 26,
    averageCustomerSatisfaction: 92,
    revenueTrend: [
      { label: "Mon", value: 11400 },
      { label: "Tue", value: 12800 },
      { label: "Wed", value: 13200 },
      { label: "Thu", value: 14100 },
      { label: "Fri", value: 16800 },
      { label: "Sat", value: 18500 },
      { label: "Sun", value: 14900 },
    ],
    ordersTrend: [
      { label: "Mon", value: 74 },
      { label: "Tue", value: 82 },
      { label: "Wed", value: 86 },
      { label: "Thu", value: 92 },
      { label: "Fri", value: 110 },
      { label: "Sat", value: 122 },
      { label: "Sun", value: 98 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 73 },
      { label: "Standard Meals (60–79)", value: 18 },
      { label: "High Calorie Meals (<60)", value: 7 },
    ],
    topSellingFoods: [
      { label: "Margherita Pizza", value: 36 },
      { label: "Farmhouse Pizza", value: 28 },
      { label: "BBQ Chicken Pizza", value: 22 },
      { label: "Cheese Sticks", value: 30 },
      { label: "Garlic Bread", value: 24 },
    ],
    insights: [
      "Margherita Pizza & Farmhouse Pizza generated 60% of sales.",
      "74% meal health ratio with growing low-sodium crust interest.",
      "Peak order volume occurred during 6–9 PM weekend evening.",
    ],
    lastOrderSignature: null,
  },
  "spice-route": {
    totalOrders: 134,
    revenue: 21800,
    averageMealHealthScore: 88,
    caloriesServed: 78600,
    popularDish: "Paneer Butter Masala",
    healthyMealPercent: 89,
    unhealthyMealPercent: 11,
    averageCustomerSatisfaction: 96,
    revenueTrend: [
      { label: "Mon", value: 16500 },
      { label: "Tue", value: 18200 },
      { label: "Wed", value: 19400 },
      { label: "Thu", value: 20100 },
      { label: "Fri", value: 23600 },
      { label: "Sat", value: 25800 },
      { label: "Sun", value: 21800 },
    ],
    ordersTrend: [
      { label: "Mon", value: 102 },
      { label: "Tue", value: 112 },
      { label: "Wed", value: 118 },
      { label: "Thu", value: 124 },
      { label: "Fri", value: 144 },
      { label: "Sat", value: 158 },
      { label: "Sun", value: 134 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 119 },
      { label: "Standard Meals (60–79)", value: 11 },
      { label: "High Calorie Meals (<60)", value: 4 },
    ],
    topSellingFoods: [
      { label: "Paneer Butter Masala", value: 46 },
      { label: "Chicken Biryani", value: 40 },
      { label: "Garlic Naan", value: 68 },
      { label: "Veg Biryani", value: 26 },
      { label: "Mango Shake", value: 32 },
    ],
    insights: [
      "Paneer Butter Masala & Garlic Naan led dinner thali combos.",
      "89% customer satisfaction score across authentic curries.",
      "Peak order volume occurred during the 7–9:30 PM dinner rush.",
    ],
    lastOrderSignature: null,
  },
  "fresh-bowl": {
    totalOrders: 92,
    revenue: 12100,
    averageMealHealthScore: 93,
    caloriesServed: 41200,
    popularDish: "Buddha Bowl",
    healthyMealPercent: 94,
    unhealthyMealPercent: 6,
    averageCustomerSatisfaction: 98,
    revenueTrend: [
      { label: "Mon", value: 9100 },
      { label: "Tue", value: 10200 },
      { label: "Wed", value: 11000 },
      { label: "Thu", value: 11800 },
      { label: "Fri", value: 13400 },
      { label: "Sat", value: 14600 },
      { label: "Sun", value: 12100 },
    ],
    ordersTrend: [
      { label: "Mon", value: 70 },
      { label: "Tue", value: 78 },
      { label: "Wed", value: 84 },
      { label: "Thu", value: 90 },
      { label: "Fri", value: 102 },
      { label: "Sat", value: 112 },
      { label: "Sun", value: 92 },
    ],
    healthDistribution: [
      { label: "Healthy Meals (80+ Score)", value: 86 },
      { label: "Standard Meals (60–79)", value: 5 },
      { label: "High Calorie Meals (<60)", value: 1 },
    ],
    topSellingFoods: [
      { label: "Buddha Bowl", value: 36 },
      { label: "Paneer Bowl", value: 28 },
      { label: "Quinoa Bowl", value: 22 },
      { label: "Orange Juice", value: 30 },
      { label: "Protein Bowl", value: 18 },
    ],
    insights: [
      "Buddha Bowl & Quinoa Bowl led fitness post-workout sales.",
      "94% clean nutritional balance rating.",
      "Peak order volume occurred during 11:30 AM–2 PM lunch hours.",
    ],
    lastOrderSignature: null,
  },
};

export function getRestaurantSpecificAnalytics(
  restaurantOrSlug: Restaurant | string,
  liveAnalytics?: AnalyticsSnapshot | null
): AnalyticsSnapshot {
  const key = (
    typeof restaurantOrSlug === "string"
      ? restaurantOrSlug
      : restaurantOrSlug?.slug || restaurantOrSlug?.id || restaurantOrSlug?.name || ""
  ).toLowerCase();

  const matchedKey =
    Object.keys(restaurantAnalyticsCatalog).find(
      (k) =>
        k === key ||
        restaurantAnalyticsCatalog[k].lastOrderSignature === key ||
        k.includes(key) ||
        key.includes(k)
    ) || "urban-burger";

  const base = restaurantAnalyticsCatalog[matchedKey];

  if (!liveAnalytics || liveAnalytics.totalOrders === 0) {
    return base;
  }

  return {
    ...base,
    totalOrders: base.totalOrders + liveAnalytics.totalOrders,
    revenue: base.revenue + liveAnalytics.revenue,
    caloriesServed: base.caloriesServed + liveAnalytics.caloriesServed,
    averageMealHealthScore: Math.round((base.averageMealHealthScore + liveAnalytics.averageMealHealthScore) / 2),
    averageCustomerSatisfaction: Math.round((base.averageCustomerSatisfaction + liveAnalytics.averageCustomerSatisfaction) / 2),
  };
}
