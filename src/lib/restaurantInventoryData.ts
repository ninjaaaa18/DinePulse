import {
  getInventoryStatus,
  getInventoryWarning,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import type { Restaurant } from "@/lib/supabase/menu";

export const restaurantInventoryCatalog: Record<string, InventoryIngredient[]> = {
  "urban-burger": [
    {
      id: "burger-bun",
      name: "Burger Buns",
      currentStock: 80,
      initialStock: 100,
      threshold: 15,
      unit: "units",
      stockChange: 0,
      remainingPercent: 80,
      status: "Healthy",
      warning: null,
    },
    {
      id: "beef-patty",
      name: "Beef Patties",
      currentStock: 65,
      initialStock: 100,
      threshold: 15,
      unit: "servings",
      stockChange: 0,
      remainingPercent: 65,
      status: "Healthy",
      warning: null,
    },
    {
      id: "coke",
      name: "Coke",
      currentStock: 60,
      initialStock: 100,
      threshold: 10,
      unit: "bottles",
      stockChange: 0,
      remainingPercent: 60,
      status: "Healthy",
      warning: null,
    },
    {
      id: "fries",
      name: "Fries",
      currentStock: 85,
      initialStock: 100,
      threshold: 18,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 85,
      status: "Healthy",
      warning: null,
    },
  ],
  "firegrill-kitchen": [
    {
      id: "steaks",
      name: "Steaks",
      currentStock: 50,
      initialStock: 100,
      threshold: 12,
      unit: "cuts",
      stockChange: 0,
      remainingPercent: 50,
      status: "Healthy",
      warning: null,
    },
    {
      id: "bbq-sauce",
      name: "BBQ Sauce",
      currentStock: 35,
      initialStock: 80,
      threshold: 8,
      unit: "bottles",
      stockChange: 0,
      remainingPercent: 44,
      status: "Medium",
      warning: null,
    },
    {
      id: "wings",
      name: "Wings",
      currentStock: 75,
      initialStock: 100,
      threshold: 15,
      unit: "servings",
      stockChange: 0,
      remainingPercent: 75,
      status: "Healthy",
      warning: null,
    },
  ],
  "green-garden-cafe": [
    {
      id: "lettuce",
      name: "Lettuce",
      currentStock: 45,
      initialStock: 80,
      threshold: 10,
      unit: "heads",
      stockChange: 0,
      remainingPercent: 56,
      status: "Medium",
      warning: null,
    },
    {
      id: "avocado",
      name: "Avocado",
      currentStock: 30,
      initialStock: 60,
      threshold: 8,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 50,
      status: "Medium",
      warning: null,
    },
    {
      id: "olive-oil",
      name: "Olive Oil",
      currentStock: 25,
      initialStock: 50,
      threshold: 6,
      unit: "liters",
      stockChange: 0,
      remainingPercent: 50,
      status: "Medium",
      warning: null,
    },
  ],
  "pizza-forge": [
    {
      id: "pizza-dough",
      name: "Pizza Dough",
      currentStock: 55,
      initialStock: 100,
      threshold: 12,
      unit: "units",
      stockChange: 0,
      remainingPercent: 55,
      status: "Medium",
      warning: null,
    },
    {
      id: "mozzarella",
      name: "Mozzarella",
      currentStock: 45,
      initialStock: 80,
      threshold: 10,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 56,
      status: "Medium",
      warning: null,
    },
    {
      id: "pepperoni",
      name: "Pepperoni",
      currentStock: 35,
      initialStock: 70,
      threshold: 8,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 50,
      status: "Medium",
      warning: null,
    },
  ],
  "spice-route": [
    {
      id: "rice",
      name: "Rice",
      currentStock: 70,
      initialStock: 100,
      threshold: 15,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 70,
      status: "Healthy",
      warning: null,
    },
    {
      id: "paneer",
      name: "Paneer",
      currentStock: 40,
      initialStock: 80,
      threshold: 10,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 50,
      status: "Medium",
      warning: null,
    },
    {
      id: "masala",
      name: "Masala",
      currentStock: 30,
      initialStock: 60,
      threshold: 8,
      unit: "packs",
      stockChange: 0,
      remainingPercent: 50,
      status: "Medium",
      warning: null,
    },
  ],
  "fresh-bowl": [
    {
      id: "fruits",
      name: "Fruits",
      currentStock: 50,
      initialStock: 90,
      threshold: 10,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 56,
      status: "Medium",
      warning: null,
    },
    {
      id: "vegetables",
      name: "Vegetables",
      currentStock: 60,
      initialStock: 100,
      threshold: 12,
      unit: "kg",
      stockChange: 0,
      remainingPercent: 60,
      status: "Healthy",
      warning: null,
    },
    {
      id: "juices",
      name: "Juices",
      currentStock: 45,
      initialStock: 80,
      threshold: 10,
      unit: "liters",
      stockChange: 0,
      remainingPercent: 56,
      status: "Medium",
      warning: null,
    },
  ],
};

export function getRestaurantSpecificInventory(
  restaurantOrSlug: Restaurant | string
): InventoryIngredient[] {
  const key = (
    typeof restaurantOrSlug === "string"
      ? restaurantOrSlug
      : restaurantOrSlug?.slug || restaurantOrSlug?.id || restaurantOrSlug?.name || ""
  ).toLowerCase();

  const matchedKey =
    Object.keys(restaurantInventoryCatalog).find(
      (k) => k === key || k.includes(key) || key.includes(k)
    ) || "urban-burger";

  const rawList = restaurantInventoryCatalog[matchedKey];

  return rawList.map((item) => {
    const status = getInventoryStatus(item.currentStock, item.threshold, item.remainingPercent);
    const warning = getInventoryWarning(status, item.currentStock, item.threshold);
    return {
      ...item,
      status,
      warning,
    };
  });
}
