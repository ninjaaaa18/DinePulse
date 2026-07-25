export type NutrientStatus = "good" | "moderate" | "warning" | "critical";

export type InsightType = "positive" | "warning" | "info";

export const mealHealthScore = {
  score: 78,
  maxScore: 100,
  status: "Healthy Choice",
  statusEmoji: "🟢",
};

export const macroSummary = [
  { label: "Calories", value: "842", unit: "kcal", icon: "🔥" },
  { label: "Protein", value: "38g", unit: "", icon: "💪" },
  { label: "Carbohydrates", value: "96g", unit: "", icon: "🌾" },
  { label: "Fat", value: "34g", unit: "", icon: "🥑" },
  { label: "Sugar", value: "42g", unit: "", icon: "🍬" },
  { label: "Sodium", value: "1,240mg", unit: "", icon: "🧂" },
  { label: "Fiber", value: "6g", unit: "", icon: "🥬" },
];

export const selectedMeal = {
  items: [
    { name: "Chicken Burger", emoji: "🍔" },
    { name: "French Fries", emoji: "🍟" },
    { name: "Coke", emoji: "🥤" },
  ],
  totalCalories: 842,
  protein: "38g",
  fat: "34g",
  sugar: "42g",
  fiber: "6g",
  cost: "$14.99",
};

export const nutritionBreakdown = [
  {
    id: "calories",
    label: "Calories",
    icon: "🔥",
    current: 842,
    recommended: 650,
    unit: "kcal",
    status: "moderate" as NutrientStatus,
    gradient: "from-orange-500/20 to-amber-500/10",
    accent: "text-orange-400",
    bar: "bg-gradient-to-r from-orange-500 to-amber-400",
  },
  {
    id: "protein",
    label: "Protein",
    icon: "💪",
    current: 38,
    recommended: 35,
    unit: "g",
    status: "good" as NutrientStatus,
    gradient: "from-emerald/20 to-green-500/10",
    accent: "text-emerald-light",
    bar: "bg-gradient-to-r from-emerald to-emerald-light",
  },
  {
    id: "carbs",
    label: "Carbs",
    icon: "🌾",
    current: 96,
    recommended: 80,
    unit: "g",
    status: "moderate" as NutrientStatus,
    gradient: "from-blue-500/20 to-cyan-500/10",
    accent: "text-blue-400",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  {
    id: "fat",
    label: "Fat",
    icon: "🥑",
    current: 34,
    recommended: 30,
    unit: "g",
    status: "moderate" as NutrientStatus,
    gradient: "from-yellow-500/20 to-lime-500/10",
    accent: "text-yellow-400",
    bar: "bg-gradient-to-r from-yellow-500 to-lime-400",
  },
  {
    id: "sugar",
    label: "Sugar",
    icon: "🍬",
    current: 42,
    recommended: 25,
    unit: "g",
    status: "warning" as NutrientStatus,
    gradient: "from-pink-500/20 to-rose-500/10",
    accent: "text-pink-400",
    bar: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  {
    id: "sodium",
    label: "Sodium",
    icon: "🧂",
    current: 1240,
    recommended: 800,
    unit: "mg",
    status: "warning" as NutrientStatus,
    gradient: "from-red-500/20 to-orange-500/10",
    accent: "text-red-400",
    bar: "bg-gradient-to-r from-red-500 to-orange-400",
  },
  {
    id: "fiber",
    label: "Fiber",
    icon: "🥬",
    current: 6,
    recommended: 15,
    unit: "g",
    status: "critical" as NutrientStatus,
    gradient: "from-emerald-dark/20 to-emerald/10",
    accent: "text-emerald-light",
    bar: "bg-gradient-to-r from-emerald-dark to-emerald",
  },
];

export const healthWarnings = [
  {
    id: 1,
    title: "High Sugar",
    icon: "⚠",
    severity: "warning" as const,
    explanation:
      "This meal contains 42g of sugar — 68% above the recommended limit. Most comes from the soft drink and burger sauce.",
  },
  {
    id: 2,
    title: "High Sodium",
    icon: "⚠",
    severity: "warning" as const,
    explanation:
      "Sodium levels at 1,240mg exceed the daily recommended intake for a single meal. Processed ingredients are the main contributor.",
  },
  {
    id: 3,
    title: "Low Fiber",
    icon: "⚠",
    severity: "critical" as const,
    explanation:
      "Only 6g of fiber detected — well below the 15g target. Adding vegetables or whole grains would significantly improve this score.",
  },
];

export const healthierAlternatives = [
  {
    id: 1,
    replace: "Coke",
    replaceEmoji: "🥤",
    alternative: "Fresh Lime Soda",
    alternativeEmoji: "🍋",
    scoreBefore: 78,
    scoreAfter: 86,
  },
  {
    id: 2,
    replace: "French Fries",
    replaceEmoji: "🍟",
    alternative: "Garden Salad",
    alternativeEmoji: "🥗",
    scoreBefore: 86,
    scoreAfter: 94,
  },
];

export const aiMealInsights = [
  {
    id: 1,
    message: "Excellent protein intake.",
    type: "positive" as InsightType,
    icon: "💪",
  },
  {
    id: 2,
    message: "Sugar is slightly above the recommended limit.",
    type: "warning" as InsightType,
    icon: "🍬",
  },
  {
    id: 3,
    message: "Replacing soft drinks will improve nutrition.",
    type: "info" as InsightType,
    icon: "🥤",
  },
  {
    id: 4,
    message: "Meal suitable for gym enthusiasts.",
    type: "positive" as InsightType,
    icon: "🏋️",
  },
];

export const radarChartData = [
  { label: "Protein", value: 85 },
  { label: "Fiber", value: 40 },
  { label: "Calories", value: 72 },
  { label: "Sugar", value: 35 },
  { label: "Sodium", value: 38 },
  { label: "Fat", value: 68 },
  { label: "Carbs", value: 65 },
];

export const dailyNutritionSummary = {
  caloriesConsumed: 842,
  caloriesGoal: 2000,
  proteinGoal: { current: 38, target: 60, unit: "g" },
  waterGoal: { current: 4, target: 8, unit: "glasses" },
};

export const statusLabels: Record<NutrientStatus, string> = {
  good: "On Track",
  moderate: "Moderate",
  warning: "Above Limit",
  critical: "Below Target",
};

export const statusColors: Record<NutrientStatus, string> = {
  good: "text-emerald-light",
  moderate: "text-amber-400",
  warning: "text-orange-400",
  critical: "text-red-400",
};

export const statusDots: Record<NutrientStatus, string> = {
  good: "bg-emerald-light",
  moderate: "bg-amber-400",
  warning: "bg-orange-400",
  critical: "bg-red-400",
};

export const insightStyles: Record<InsightType, string> = {
  positive: "border-emerald/20 bg-emerald/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  info: "border-white/10 bg-white/[0.02]",
};

export const warningStyles: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/5",
  critical: "border-red-500/30 bg-red-500/5",
};

export function getNutrientProgress(current: number, recommended: number): number {
  return Math.min(Math.round((current / recommended) * 100), 100);
}
