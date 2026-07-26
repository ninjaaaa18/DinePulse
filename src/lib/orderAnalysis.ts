import { syncAnalyticsToSupabase, syncInventoryToSupabase } from "./supabase";

export type OrderAnalysisItem = {
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
  quantity: number;
};

export type OrderAnalysisContext = {
  orderId?: string;
  selectedRestaurantId: string;
  selectedRestaurantName: string;
  restaurantCuisine: string;
  deliveryTime: string;
  items: OrderAnalysisItem[];
  subtotal: number;
  totalCalories: number;
  averageMealScore: number;
};

export type InventoryIngredientStatus = "Healthy" | "Medium" | "Low" | "Critical";

export type InventoryIngredient = {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  unit: string;
  initialStock: number;
  stockChange: number;
  remainingPercent: number;
  status: InventoryIngredientStatus;
  warning: string | null;
};

export type AnalyticsChartPoint = {
  label: string;
  value: number;
};

export type AnalyticsSnapshot = {
  totalOrders: number;
  revenue: number;
  averageMealHealthScore: number;
  caloriesServed: number;
  popularDish: string;
  healthyMealPercent: number;
  unhealthyMealPercent: number;
  averageCustomerSatisfaction: number;
  revenueTrend: AnalyticsChartPoint[];
  ordersTrend: AnalyticsChartPoint[];
  healthDistribution: AnalyticsChartPoint[];
  topSellingFoods: AnalyticsChartPoint[];
  insights: string[];
  lastOrderSignature: string | null;
};

const ORDER_STORAGE_KEY = "dinepulse.order-context";
const INVENTORY_STORAGE_KEY = "dinepulse.inventory";
const ANALYTICS_STORAGE_KEY = "dinepulse.analytics";
const INVENTORY_APPLIED_ORDERS_STORAGE_KEY = "dinepulse.inventory-applied-orders";

export const baseInventoryState: InventoryIngredient[] = [
  { id: "chicken-patty", name: "Chicken Patty", currentStock: 120, threshold: 20, unit: "servings", initialStock: 120, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "burger-bun", name: "Burger Bun", currentStock: 80, threshold: 15, unit: "units", initialStock: 80, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "cheese-slice", name: "Cheese Slice", currentStock: 65, threshold: 10, unit: "slices", initialStock: 65, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "lettuce", name: "Lettuce", currentStock: 45, threshold: 12, unit: "heads", initialStock: 45, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "sauce", name: "Sauce", currentStock: 40, threshold: 8, unit: "bottles", initialStock: 40, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "potato", name: "Potato", currentStock: 90, threshold: 18, unit: "kg", initialStock: 90, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "cooking-oil", name: "Cooking Oil", currentStock: 35, threshold: 8, unit: "liters", initialStock: 35, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "salt", name: "Salt", currentStock: 28, threshold: 6, unit: "bags", initialStock: 28, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "soft-drink-bottle", name: "Soft Drink Bottle", currentStock: 60, threshold: 10, unit: "bottles", initialStock: 60, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "tomato", name: "Tomato", currentStock: 50, threshold: 10, unit: "kg", initialStock: 50, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
  { id: "cucumber", name: "Cucumber", currentStock: 30, threshold: 8, unit: "kg", initialStock: 30, stockChange: 0, remainingPercent: 100, status: "Healthy", warning: null },
];

export function getInventoryStatus(currentStock: number, threshold: number, remainingPercent: number): InventoryIngredientStatus {
  if (currentStock <= threshold / 2 || remainingPercent <= 20) {
    return "Critical";
  }

  if (currentStock <= threshold || remainingPercent <= 40) {
    return "Low";
  }

  if (remainingPercent <= 70) {
    return "Medium";
  }

  return "Healthy";
}

export function getInventoryWarning(status: InventoryIngredientStatus, currentStock: number, threshold: number): string | null {
  if (status === "Critical") {
    return `Restock immediately. ${currentStock} servings remain.`;
  }

  if (status === "Low") {
    return `Restock within 24 hours. ${currentStock} servings remain.`;
  }

  return null;
}

function cloneInventoryState(state: InventoryIngredient[] = baseInventoryState): InventoryIngredient[] {
  return state.map((item) => ({ ...item }));
}

function getOrderSignature(context: OrderAnalysisContext) {
  return context.orderId ?? `${context.selectedRestaurantId}:${context.items
    .map((item) => `${item.id}:${item.quantity}`)
    .join("|")}`;
}

function getAppliedInventoryOrderKeys(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const persistedValue = window.sessionStorage.getItem(INVENTORY_APPLIED_ORDERS_STORAGE_KEY);
    const parsed = persistedValue ? JSON.parse(persistedValue) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function markInventoryOrderApplied(orderKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  const appliedOrderKeys = getAppliedInventoryOrderKeys();
  if (appliedOrderKeys.includes(orderKey)) {
    return;
  }

  window.sessionStorage.setItem(
    INVENTORY_APPLIED_ORDERS_STORAGE_KEY,
    JSON.stringify([...appliedOrderKeys, orderKey].slice(-100)),
  );
}

function getIngredientRecipe(itemName: string, itemId: string) {
  const normalizedName = `${itemName} ${itemId}`.toLowerCase();

  if (normalizedName.includes("burger")) {
    return [
      { id: "chicken-patty", quantity: 1 },
      { id: "burger-bun", quantity: 1 },
      { id: "cheese-slice", quantity: 1 },
      { id: "lettuce", quantity: 1 },
      { id: "sauce", quantity: 1 },
    ];
  }

  if (normalizedName.includes("fries")) {
    return [
      { id: "potato", quantity: 1 },
      { id: "cooking-oil", quantity: 1 },
      { id: "salt", quantity: 1 },
    ];
  }

  if (normalizedName.includes("coke") || normalizedName.includes("cola") || normalizedName.includes("drink")) {
    return [{ id: "soft-drink-bottle", quantity: 1 }];
  }

  if (normalizedName.includes("salad")) {
    return [
      { id: "lettuce", quantity: 1 },
      { id: "tomato", quantity: 1 },
      { id: "cucumber", quantity: 1 },
    ];
  }

  return [];
}

function buildTrendSeries(previousSeries: AnalyticsChartPoint[], nextValue: number, fallbackLabel: string) {
  const nextSeries = previousSeries.slice(-6);
  nextSeries.push({ label: fallbackLabel, value: nextValue });
  return nextSeries;
}

export function getDefaultAnalyticsSnapshot(): AnalyticsSnapshot {
  return {
    totalOrders: 0,
    revenue: 0,
    averageMealHealthScore: 0,
    caloriesServed: 0,
    popularDish: "No orders yet",
    healthyMealPercent: 0,
    unhealthyMealPercent: 0,
    averageCustomerSatisfaction: 0,
    revenueTrend: [
      { label: "Mon", value: 0 },
      { label: "Tue", value: 0 },
      { label: "Wed", value: 0 },
      { label: "Thu", value: 0 },
      { label: "Fri", value: 0 },
      { label: "Sat", value: 0 },
      { label: "Sun", value: 0 },
    ],
    ordersTrend: [
      { label: "Mon", value: 0 },
      { label: "Tue", value: 0 },
      { label: "Wed", value: 0 },
      { label: "Thu", value: 0 },
      { label: "Fri", value: 0 },
      { label: "Sat", value: 0 },
      { label: "Sun", value: 0 },
    ],
    healthDistribution: [
      { label: "Healthy", value: 0 },
      { label: "Unhealthy", value: 0 },
    ],
    topSellingFoods: [],
    insights: [],
    lastOrderSignature: null,
  };
}

export function serializeOrderAnalysisContext(context: OrderAnalysisContext): string {
  return encodeURIComponent(JSON.stringify(context));
}

export function parseOrderAnalysisContext(value: string | null): OrderAnalysisContext | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === "object" ? (parsed as OrderAnalysisContext) : null;
  } catch {
    return null;
  }
}

export function persistOrderAnalysisContext(context: OrderAnalysisContext) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ORDER_STORAGE_KEY, serializeOrderAnalysisContext(context));
}

export function loadPersistedOrderAnalysisContext(): OrderAnalysisContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const persistedValue = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
  return parseOrderAnalysisContext(persistedValue);
}

export function getDefaultInventoryState(): InventoryIngredient[] {
  return cloneInventoryState(baseInventoryState);
}

export function getStoredInventoryState(): InventoryIngredient[] {
  if (typeof window === "undefined") {
    return getDefaultInventoryState();
  }

  try {
    const persistedValue = window.sessionStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!persistedValue) {
      return getDefaultInventoryState();
    }

    const parsed = JSON.parse(persistedValue);
    return Array.isArray(parsed) ? (parsed as InventoryIngredient[]) : getDefaultInventoryState();
  } catch {
    return getDefaultInventoryState();
  }
}

export function persistInventoryState(state: InventoryIngredient[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
}

export function getStoredAnalyticsSnapshot(): AnalyticsSnapshot {
  if (typeof window === "undefined") {
    return getDefaultAnalyticsSnapshot();
  }

  try {
    const persistedValue = window.sessionStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!persistedValue) {
      return getDefaultAnalyticsSnapshot();
    }

    const parsed = JSON.parse(persistedValue);
    return parsed && typeof parsed === "object"
      ? ({ ...getDefaultAnalyticsSnapshot(), ...(parsed as AnalyticsSnapshot) })
      : getDefaultAnalyticsSnapshot();
  } catch {
    return getDefaultAnalyticsSnapshot();
  }
}

export function persistAnalyticsSnapshot(snapshot: AnalyticsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(snapshot));
}

export function buildAnalyticsSnapshotFromOrderContext(
  context: OrderAnalysisContext,
  previousSnapshot: AnalyticsSnapshot | null = getStoredAnalyticsSnapshot(),
): AnalyticsSnapshot {
  const currentSnapshot = previousSnapshot ?? getDefaultAnalyticsSnapshot();
  const orderSignature = getOrderSignature(context);

  if (currentSnapshot.lastOrderSignature === orderSignature) {
    return currentSnapshot;
  }

  const totalOrders = currentSnapshot.totalOrders + 1;
  const revenue = currentSnapshot.revenue + context.subtotal;
  const averageMealHealthScore = Math.round(
    (currentSnapshot.averageMealHealthScore * currentSnapshot.totalOrders + context.averageMealScore) /
      totalOrders,
  );
  const caloriesServed = currentSnapshot.caloriesServed + context.totalCalories;
  const healthyOrderCount = currentSnapshot.healthyMealPercent > 0 || currentSnapshot.totalOrders === 0
    ? (currentSnapshot.totalOrders === 0 ? 0 : Math.round((currentSnapshot.healthyMealPercent / 100) * currentSnapshot.totalOrders))
    : 0;
  const unhealthyOrderCount = currentSnapshot.totalOrders - healthyOrderCount;
  const nextHealthyOrderCount = context.averageMealScore >= 80 ? healthyOrderCount + 1 : healthyOrderCount;
  const nextUnhealthyOrderCount = context.averageMealScore >= 80 ? unhealthyOrderCount : unhealthyOrderCount + 1;
  const healthyMealPercent = Math.round((nextHealthyOrderCount / totalOrders) * 100);
  const unhealthyMealPercent = Math.round((nextUnhealthyOrderCount / totalOrders) * 100);
  const averageCustomerSatisfaction = Math.round(
    Math.max(72, Math.min(98, averageMealHealthScore * 0.92 + 4)),
  );

  const dishCounts = new Map<string, number>();
  const previousTopFoods = currentSnapshot.topSellingFoods ?? [];
  previousTopFoods.forEach((item) => dishCounts.set(item.label, item.value));

  context.items.forEach((item) => {
    dishCounts.set(item.name, (dishCounts.get(item.name) ?? 0) + item.quantity);
  });

  const topSellingFoods = Array.from(dishCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({ label, value }));

  const popularDish = topSellingFoods[0]?.label ?? "No orders yet";
  const revenueTrend = buildTrendSeries(currentSnapshot.revenueTrend, context.subtotal, `Order ${totalOrders}`);
  const ordersTrend = buildTrendSeries(currentSnapshot.ordersTrend, 1, `Order ${totalOrders}`);
  const healthDistribution = [
    { label: "Healthy", value: nextHealthyOrderCount },
    { label: "Unhealthy", value: nextUnhealthyOrderCount },
  ];

  const insights = [
    `${popularDish} led today's orders with strong demand.`,
    `Healthy meals account for ${healthyMealPercent}% of today's sales.`,
    context.averageMealScore >= 80
      ? "Customers are responding well to the current meal mix."
      : "Average calories per order increased today.",
  ];

  const snapshot: AnalyticsSnapshot = {
    totalOrders,
    revenue,
    averageMealHealthScore,
    caloriesServed,
    popularDish,
    healthyMealPercent,
    unhealthyMealPercent,
    averageCustomerSatisfaction,
    revenueTrend,
    ordersTrend,
    healthDistribution,
    topSellingFoods,
    insights,
    lastOrderSignature: orderSignature,
  };

  persistAnalyticsSnapshot(snapshot);
  syncAnalyticsToSupabase(snapshot).catch((err) => {
    console.warn("[Analytics Sync] Background sync to Supabase failed:", err);
  });
  return snapshot;
}

export function buildInventoryStateFromOrderContext(
  context: OrderAnalysisContext,
  previousInventory: InventoryIngredient[] = getStoredInventoryState(),
): InventoryIngredient[] {
  const orderKey = getOrderSignature(context);
  if (getAppliedInventoryOrderKeys().includes(orderKey)) {
    return cloneInventoryState(previousInventory);
  }

  const baseState = cloneInventoryState(previousInventory.length > 0 ? previousInventory : baseInventoryState);
  const ingredientUsage = new Map<string, number>();

  context.items.forEach((item) => {
    const recipe = getIngredientRecipe(item.name, item.id);
    recipe.forEach((ingredient) => {
      ingredientUsage.set(
        ingredient.id,
        (ingredientUsage.get(ingredient.id) ?? 0) + ingredient.quantity * item.quantity,
      );
    });
  });

  const nextInventory = baseState.map((ingredient) => {
    const consumedQuantity = ingredientUsage.get(ingredient.id) ?? 0;
    const currentStock = Math.max(0, ingredient.currentStock - consumedQuantity);
    const remainingPercent = ingredient.initialStock > 0 ? Math.round((currentStock / ingredient.initialStock) * 100) : 0;
    const status = getInventoryStatus(currentStock, ingredient.threshold, remainingPercent);

    return {
      ...ingredient,
      currentStock,
      stockChange: -consumedQuantity,
      remainingPercent,
      status,
      warning: getInventoryWarning(status, currentStock, ingredient.threshold),
    };
  });

  persistInventoryState(nextInventory);
  syncInventoryToSupabase(nextInventory).catch((err) => {
    console.warn("[Inventory Sync] Background sync to Supabase failed:", err);
  });
  markInventoryOrderApplied(orderKey);
  return nextInventory;
}

export function applyOrderToInventory(context: OrderAnalysisContext): InventoryIngredient[] {
  buildAnalyticsSnapshotFromOrderContext(context);
  return buildInventoryStateFromOrderContext(context);
}

export function buildCustomerHealthAnalysisPayload(context: OrderAnalysisContext) {
  const totals = context.items.reduce(
    (accumulator, item) => ({
      calories: accumulator.calories + item.calories * item.quantity,
      protein: accumulator.protein + item.protein * item.quantity,
      carbohydrates: accumulator.carbohydrates + item.carbohydrates * item.quantity,
      fat: accumulator.fat + item.fat * item.quantity,
      sugar: accumulator.sugar + item.sugar * item.quantity,
      sodium: accumulator.sodium + item.sodium * item.quantity,
    }),
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
    },
  );

  return {
    meal: context.items.map((item) => `${item.name} x${item.quantity}`),
    nutrition: {
      calories: totals.calories,
      protein: Math.round(totals.protein),
      carbohydrates: Math.round(totals.carbohydrates),
      fat: Math.round(totals.fat),
      sugar: Math.round(totals.sugar),
      sodium: Math.round(totals.sodium),
      fiber: 6,
    },
    restaurant: context.selectedRestaurantName,
    orderSummary: {
      subtotal: context.subtotal,
      deliveryTime: context.deliveryTime,
      averageMealScore: context.averageMealScore,
    },
  };
}

export function buildDietarySafetyAnalysisPayload(context: OrderAnalysisContext) {
  const allergens = Array.from(
    new Set(context.items.flatMap((item) => item.allergens.filter((entry) => entry !== "None"))),
  );

  return {
    customer: {
      name: "Guest",
      allergies: allergens.length > 0 ? allergens : ["None"],
      medicalConditions: ["General Wellness"],
      diet: "Balanced",
    },
    meal: {
      name: context.selectedRestaurantName,
      items: context.items.map((item) => item.name),
    },
    nutrition: {
      calories: context.totalCalories,
      sugar: Math.round(context.items.reduce((sum, item) => sum + item.sugar * item.quantity, 0)),
      sodium: Math.round(context.items.reduce((sum, item) => sum + item.sodium * item.quantity, 0)),
    },
  };
}

export function buildRestaurantHealthAnalysisPayload(context: OrderAnalysisContext) {
  return {
    restaurant: {
      name: context.selectedRestaurantName,
      cuisine: context.restaurantCuisine,
      deliveryTime: context.deliveryTime,
      orderVolume: context.items.length,
      averageTicket: context.subtotal,
    },
    order: {
      items: context.items.map((item) => item.name),
      totalCalories: context.totalCalories,
      averageMealScore: context.averageMealScore,
    },
  };
}
