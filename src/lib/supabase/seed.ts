import { supabase } from "./client";
import { fallbackRestaurants } from "./menu";
import { baseInventoryState } from "@/lib/orderAnalysis";
import { getFallbackRecipe } from "./recipes";
import type { MenuItemInsert } from "./types";

let seedingPromise: Promise<void> | null = null;

/**
 * Automatically seeds initial production data (Restaurants, Menu Items, Inventory, Recipes)
 * into Supabase PostgreSQL when tables are missing production data.
 * Guarantees zero duplicate records via count checks and unique key matching.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  if (seedingPromise) {
    return seedingPromise;
  }

  seedingPromise = (async () => {
    try {
      // 1. Ensure all 6 production restaurants exist in Supabase
      const restaurantInserts = fallbackRestaurants.map((r) => ({
        id: r.id,
        slug: r.slug || r.id,
        name: r.name,
        cuisine: r.cuisine,
        description: r.description,
        delivery_time: r.deliveryTime,
        logo: r.logo,
        health_score: 92,
        is_active: true,
      }));

      await supabase.from("restaurants").upsert(restaurantInserts, { onConflict: "slug" });

      // Query active restaurants to get UUID mappings
      const { data: dbRestaurants } = await supabase
        .from("restaurants")
        .select("id, slug, name");

      const restMap = new Map<string, string>();
      dbRestaurants?.forEach((r) => {
        if (r.slug) restMap.set(r.slug, r.id);
        if (r.id) restMap.set(r.id, r.id);
        restMap.set(r.name.toLowerCase(), r.id);
      });

      const defaultRestId = dbRestaurants?.[0]?.id || null;

      // 2. Seed MENU ITEMS if missing
      const { count: menuCount } = await supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true });

      if ((menuCount === null || menuCount < 10) && dbRestaurants && dbRestaurants.length > 0) {
        console.log("[Supabase Seed] Seeding production menu items across all 6 restaurants...");
        const menuItemInserts: MenuItemInsert[] = [];

        fallbackRestaurants.forEach((rest) => {
          const restId = restMap.get(rest.slug || rest.id) || restMap.get(rest.id) || restMap.get(rest.name.toLowerCase()) || defaultRestId;
          if (!restId) return;

          rest.items.forEach((item) => {
            menuItemInserts.push({
              restaurant_id: restId,
              slug: item.id,
              name: item.name,
              price: item.price,
              calories: item.calories,
              protein: item.protein,
              carbohydrates: item.carbohydrates,
              fat: item.fat,
              sugar: item.sugar,
              sodium: item.sodium,
              allergens: item.allergens,
              image: item.image,
              badge: item.badge,
              badge_icon: item.badgeIcon,
              wellness_score: Math.min(99, Math.max(70, Math.round(100 - item.sugar * 0.4 - item.fat * 0.3))),
              is_available: true,
            });
          });
        });

        if (menuItemInserts.length > 0) {
          await supabase.from("menu_items").upsert(menuItemInserts, { onConflict: "restaurant_id,slug" });
        }
      }

      // 3. Seed INVENTORY if empty
      const { count: inventoryCount } = await supabase
        .from("inventory")
        .select("id", { count: "exact", head: true });

      if (inventoryCount === 0 || inventoryCount === null) {
        console.log("[Supabase Seed] Inventory table is empty. Seeding production ingredients...");
        const inventoryInserts = baseInventoryState.map((item) => ({
          restaurant_id: defaultRestId,
          ingredient_key: item.id,
          name: item.name,
          current_stock: item.currentStock,
          threshold: item.threshold,
          initial_stock: item.initialStock,
          unit: item.unit,
          status: item.status,
          warning: item.warning,
        }));

        await supabase.from("inventory").upsert(inventoryInserts, { onConflict: "ingredient_key" });
      }

      // 4. Seed RECIPES if empty
      const { count: recipeCount } = await supabase
        .from("recipes")
        .select("id", { count: "exact", head: true });

      if (recipeCount === 0 || recipeCount === null) {
        console.log("[Supabase Seed] Recipes table is empty. Generating recipe ingredient mappings...");
        const [{ data: dbMenuItems }, { data: dbInventoryItems }] = await Promise.all([
          supabase.from("menu_items").select("id, name, slug"),
          supabase.from("inventory").select("id, ingredient_key, name"),
        ]);

        if (dbMenuItems && dbMenuItems.length > 0 && dbInventoryItems && dbInventoryItems.length > 0) {
          const invKeyToId = new Map<string, string>();
          dbInventoryItems.forEach((inv) => {
            if (inv.ingredient_key) invKeyToId.set(inv.ingredient_key, inv.id);
            invKeyToId.set(inv.id, inv.id);
          });

          const recipeInserts: Array<{ menu_item_id: string; inventory_id: string; quantity_required: number }> = [];

          dbMenuItems.forEach((menuItem) => {
            const fallbackIngredients = getFallbackRecipe(menuItem.name, menuItem.slug || menuItem.id);
            fallbackIngredients.forEach((ing) => {
              const invId = invKeyToId.get(ing.id);
              if (invId) {
                recipeInserts.push({
                  menu_item_id: menuItem.id,
                  inventory_id: invId,
                  quantity_required: ing.quantity,
                });
              }
            });
          });

          if (recipeInserts.length > 0) {
            await supabase.from("recipes").upsert(recipeInserts, { onConflict: "menu_item_id,inventory_id" });
          }
        }
      }

      console.log("[Supabase Seed] Production seeding check completed.");
    } catch (err) {
      console.warn("[Supabase Seed] Exception during database seeding check:", err);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
}
