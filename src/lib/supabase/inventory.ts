import { getInventory, upsertInventoryItem } from "./db";
import { supabase } from "./client";
import { getOrCreateRestaurantForUser } from "./auth";
import {
  baseInventoryState,
  getInventoryStatus,
  getInventoryWarning,
  getStoredInventoryState,
  persistInventoryState,
  type InventoryIngredient,
} from "@/lib/orderAnalysis";
import type { InventoryInsert, InventoryRow } from "./types";

/**
 * Maps a Supabase InventoryRow to the application's InventoryIngredient model.
 */
function mapRowToIngredient(row: InventoryRow): InventoryIngredient {
  const currentStock = Number(row.current_stock ?? 0);
  const initialStock = Number(row.initial_stock ?? 100);
  const threshold = Number(row.threshold ?? 20);
  const stockChange = currentStock - initialStock;
  const remainingPercent =
    initialStock > 0 ? Math.round((currentStock / initialStock) * 100) : 0;
  const status =
    (row.status as InventoryIngredient["status"]) ||
    getInventoryStatus(currentStock, threshold, remainingPercent);
  const warning =
    row.warning ?? getInventoryWarning(status, currentStock, threshold);

  return {
    id: row.ingredient_key || row.id,
    name: row.name,
    currentStock,
    threshold,
    unit: row.unit,
    initialStock,
    stockChange,
    remainingPercent,
    status,
    warning,
  };
}

/**
 * Maps an InventoryIngredient model to a Supabase InventoryInsert object.
 */
function mapIngredientToInsert(
  ingredient: InventoryIngredient,
  restaurantId?: string | null
): InventoryInsert {
  return {
    restaurant_id: restaurantId || null,
    ingredient_key: ingredient.id,
    name: ingredient.name,
    current_stock: ingredient.currentStock,
    threshold: ingredient.threshold,
    initial_stock: ingredient.initialStock,
    unit: ingredient.unit,
    status: ingredient.status,
    warning: ingredient.warning,
  };
}

async function getActiveRestaurantId(): Promise<string | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data: userRest } = await getOrCreateRestaurantForUser(authData.user);
      return userRest?.id || null;
    }
  } catch {
    // Ignore auth error in fallback
  }
  return null;
}

/**
 * Fetches inventory from Supabase. Seeds base inventory if table is empty.
 * Returns null if Supabase is unavailable or fails.
 */
export async function fetchInventoryFromSupabase(): Promise<InventoryIngredient[] | null> {
  try {
    const restaurantId = await getActiveRestaurantId();
    const { data, error } = await getInventory(restaurantId || undefined);
    if (error) {
      console.warn("[Supabase Inventory] Fetch failed, fallback active:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapRowToIngredient);
    }

    // If database table is empty, seed with initial base inventory
    const seedPromises = baseInventoryState.map((item) =>
      upsertInventoryItem(mapIngredientToInsert(item, restaurantId))
    );
    await Promise.all(seedPromises);
    return baseInventoryState;
  } catch (err) {
    console.warn("[Supabase Inventory] Exception on fetch, fallback active:", err);
    return null;
  }
}

/**
 * Syncs updated inventory state to Supabase database table.
 */
export async function syncInventoryToSupabase(
  inventory: InventoryIngredient[]
): Promise<{ success: boolean; error?: Error }> {
  try {
    const restaurantId = await getActiveRestaurantId();
    const upsertPromises = inventory.map((item) =>
      upsertInventoryItem(mapIngredientToInsert(item, restaurantId))
    );
    const results = await Promise.all(upsertPromises);
    const hasError = results.some((res) => res.error);

    if (hasError) {
      console.warn("[Supabase Inventory] Stock update failed for some items.");
      return { success: false, error: new Error("Failed to update inventory in database") };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn("[Supabase Inventory] Stock sync exception:", error.message);
    return { success: false, error };
  }
}

/**
 * Loads inventory from Supabase with fallback to sessionStorage.
 */
export async function loadInventoryWithFallback(): Promise<InventoryIngredient[]> {
  const remoteInventory = await fetchInventoryFromSupabase();
  if (remoteInventory && remoteInventory.length > 0) {
    // Keep sessionStorage pre-warmed for offline fallback
    persistInventoryState(remoteInventory);
    return remoteInventory;
  }

  return getStoredInventoryState();
}

/**
 * Persists inventory to sessionStorage immediately and syncs to Supabase in background.
 */
export async function saveInventoryWithFallback(
  inventory: InventoryIngredient[]
): Promise<void> {
  persistInventoryState(inventory);
  await syncInventoryToSupabase(inventory);
}
