import { getInventory, getRecipes, upsertRecipe } from "./db";
import type { RecipeRow } from "./types";

export type RecipeIngredientUsage = {
  ingredientId: string; // Maps to inventory ingredient_key or id
  quantity: number;
};

// Standard Recipe Mappings for Seed & Fallback
export const fallbackRecipeMap: Record<string, Array<{ id: string; quantity: number }>> = {
  burger: [
    { id: "chicken-patty", quantity: 1 },
    { id: "burger-bun", quantity: 1 },
    { id: "cheese-slice", quantity: 1 },
    { id: "lettuce", quantity: 1 },
    { id: "sauce", quantity: 1 },
  ],
  fries: [
    { id: "potato", quantity: 1 },
    { id: "cooking-oil", quantity: 1 },
    { id: "salt", quantity: 1 },
  ],
  salad: [
    { id: "lettuce", quantity: 1 },
    { id: "tomato", quantity: 1 },
    { id: "cucumber", quantity: 1 },
  ],
  wrap: [
    { id: "lettuce", quantity: 1 },
    { id: "sauce", quantity: 1 },
    { id: "cheese-slice", quantity: 1 },
  ],
  drink: [{ id: "soft-drink-bottle", quantity: 1 }],
  beverage: [{ id: "soft-drink-bottle", quantity: 1 }],
  lemonade: [{ id: "soft-drink-bottle", quantity: 1 }],
  smoothie: [{ id: "soft-drink-bottle", quantity: 1 }],
};

/**
 * Resolves recipe ingredients for an item name using fallback pattern matching.
 */
export function getFallbackRecipe(itemName: string, itemId: string): Array<{ id: string; quantity: number }> {
  const normalizedKey = `${itemName} ${itemId}`.toLowerCase();

  if (normalizedKey.includes("burger")) return fallbackRecipeMap.burger;
  if (normalizedKey.includes("fries")) return fallbackRecipeMap.fries;
  if (normalizedKey.includes("salad")) return fallbackRecipeMap.salad;
  if (normalizedKey.includes("wrap")) return fallbackRecipeMap.wrap;
  if (
    normalizedKey.includes("drink") ||
    normalizedKey.includes("lemonade") ||
    normalizedKey.includes("smoothie") ||
    normalizedKey.includes("coke") ||
    normalizedKey.includes("lassi")
  ) {
    return fallbackRecipeMap.drink;
  }

  return [];
}

/**
 * Fetches recipe ingredients from Supabase for a list of ordered menu items.
 * Falls back to hardcoded pattern recipes if database recipes are missing or unavailable.
 */
export async function getRecipeIngredientsForOrder(
  items: Array<{ id: string; name: string; quantity: number }>
): Promise<Map<string, number>> {
  const usageMap = new Map<string, number>();

  try {
    // 1. Attempt fetching all recipes and inventory from Supabase
    const [{ data: dbRecipes }, { data: dbInventory }] = await Promise.all([
      getRecipes(),
      getInventory(),
    ]);

    // Create a lookup table for inventory id -> ingredient_key
    const inventoryIdToKey = new Map<string, string>();
    if (dbInventory) {
      dbInventory.forEach((inv) => {
        inventoryIdToKey.set(inv.id, inv.ingredient_key || inv.id);
        if (inv.ingredient_key) {
          inventoryIdToKey.set(inv.ingredient_key, inv.ingredient_key);
        }
      });
    }

    let usedDbRecipes = false;

    if (dbRecipes && dbRecipes.length > 0) {
      for (const item of items) {
        // Find matching recipes for menu item ID or slug
        const matchingRecipes = dbRecipes.filter(
          (r) => r.menu_item_id === item.id
        );

        if (matchingRecipes.length > 0) {
          usedDbRecipes = true;
          for (const recipe of matchingRecipes) {
            const ingredientKey =
              inventoryIdToKey.get(recipe.inventory_id) || recipe.inventory_id;
            const requiredQty = Number(recipe.quantity_required ?? 1) * item.quantity;
            usageMap.set(ingredientKey, (usageMap.get(ingredientKey) ?? 0) + requiredQty);
          }
        } else {
          // If no specific DB recipe for this menu item, use fallback recipe
          const fallback = getFallbackRecipe(item.name, item.id);
          for (const ing of fallback) {
            const requiredQty = ing.quantity * item.quantity;
            usageMap.set(ing.id, (usageMap.get(ing.id) ?? 0) + requiredQty);
          }
        }
      }
    }

    if (usedDbRecipes && usageMap.size > 0) {
      return usageMap;
    }
  } catch (err) {
    console.warn("[Supabase Recipes] Fetch failed, fallback active:", err);
  }

  // 2. Fallback: Generate usage map using hardcoded fallback recipes
  items.forEach((item) => {
    const fallback = getFallbackRecipe(item.name, item.id);
    fallback.forEach((ing) => {
      usageMap.set(ing.id, (usageMap.get(ing.id) ?? 0) + ing.quantity * item.quantity);
    });
  });

  return usageMap;
}
