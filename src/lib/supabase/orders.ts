import { createOrder } from "./db";
import { supabase } from "./client";
import { getOrCreateRestaurantForUser } from "./auth";
import type { OrderAnalysisContext } from "@/lib/orderAnalysis";
import type { OrderInsert, OrderItemInsert } from "./types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string | undefined): boolean {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Persist an Order and its Order Items to Supabase PostgreSQL.
 * Associates record with current authenticated restaurant.
 * Falls back gracefully if Supabase is unavailable.
 */
export async function saveOrderToSupabase(
  context: OrderAnalysisContext
): Promise<{ success: boolean; orderId?: string; error?: Error }> {
  try {
    const orderId = isUUID(context.orderId)
      ? (context.orderId as string)
      : typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : undefined;

    const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : Date.now().toString().slice(-6);
    const orderNumber = `ORD-${shortId}`;

    let restaurantId = isUUID(context.selectedRestaurantId)
      ? context.selectedRestaurantId
      : null;

    if (!restaurantId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: userRest } = await getOrCreateRestaurantForUser(authData.user);
        if (userRest) {
          restaurantId = userRest.id;
        }
      }
    }

    const orderPayload: OrderInsert = {
      id: orderId,
      order_number: orderNumber,
      customer_id: null,
      restaurant_id: restaurantId,
      status: "completed",
      subtotal: context.subtotal,
      tax: 0,
      delivery_fee: 0,
      total_amount: context.subtotal,
      total_calories: context.totalCalories,
      average_meal_score: context.averageMealScore,
      delivery_address: null,
      delivery_time_estimate: context.deliveryTime,
      notes: `Order placed for ${context.selectedRestaurantName} (${context.restaurantCuisine})`,
    };

    const itemsPayload: Omit<OrderItemInsert, "order_id">[] = context.items.map((item) => ({
      menu_item_id: isUUID(item.id) ? item.id : null,
      item_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbohydrates: item.carbohydrates,
      fat: item.fat,
      sugar: item.sugar,
      sodium: item.sodium,
      allergens: item.allergens,
    }));

    const { data, error } = await createOrder(orderPayload, itemsPayload);

    if (error) {
      console.warn(
        "[Supabase Order Sync] DB operation failed, falling back to sessionStorage:",
        error.message
      );
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, orderId: data?.id };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn(
      "[Supabase Order Sync] Exception encountered, falling back to sessionStorage:",
      error.message
    );
    return { success: false, error };
  }
}

/**
 * Load the latest completed order with items from Supabase PostgreSQL.
 * Converts Supabase DB models to OrderAnalysisContext format.
 * Returns null if no orders exist or if database query fails.
 */
export async function loadLatestOrderFromSupabase(): Promise<OrderAnalysisContext | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();

    let restaurantId: string | null = null;
    if (authData?.user) {
      const { data: userRest } = await getOrCreateRestaurantForUser(authData.user);
      restaurantId = userRest?.id ?? null;
    }

    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(1);

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    let { data, error } = await query;

    // Fallback: If no order for specific restaurantId, query overall latest order in DB
    if ((!data || data.length === 0) && restaurantId) {
      console.log("[Supabase Order Fetch] No order found for restaurant_id:", restaurantId, "— querying overall latest order...");
      const fallbackRes = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(1);

      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error || !data || data.length === 0) {
      console.log("[Supabase Order Fetch] No orders exist in database table.");
      return null;
    }

    const latest = data[0] as unknown as {
      id: string;
      restaurant_id: string | null;
      subtotal: number;
      total_calories: number;
      average_meal_score: number;
      delivery_time_estimate: string | null;
      notes: string | null;
      created_at: string;
      order_items: Array<{
        id: string;
        menu_item_id: string | null;
        item_name: string;
        unit_price: number;
        quantity: number;
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        sugar: number;
        sodium: number;
        allergens: string[];
      }>;
    };

    const items = (latest.order_items || []).map((item) => ({
      id: item.menu_item_id || item.id,
      name: item.item_name,
      price: Number(item.unit_price) || 0,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbohydrates: item.carbohydrates || 0,
      fat: item.fat || 0,
      sugar: item.sugar || 0,
      sodium: item.sodium || 0,
      allergens: Array.isArray(item.allergens) ? item.allergens : [],
      quantity: item.quantity || 1,
    }));

    let restName = "DinePulse Kitchen";
    let restCuisine = "Multi-Cuisine";

    if (latest.notes && latest.notes.includes("Order placed for ")) {
      const parts = latest.notes.replace("Order placed for ", "").split(" (");
      restName = parts[0] || restName;
      if (parts[1]) {
        restCuisine = parts[1].replace(")", "") || restCuisine;
      }
    }

    const result: OrderAnalysisContext = {
      orderId: latest.id,
      selectedRestaurantId: latest.restaurant_id || "",
      selectedRestaurantName: restName,
      restaurantCuisine: restCuisine,
      deliveryTime: latest.delivery_time_estimate || "25 mins",
      items,
      subtotal: Number(latest.subtotal) || 0,
      totalCalories: latest.total_calories || items.reduce((acc, i) => acc + i.calories * i.quantity, 0),
      averageMealScore: latest.average_meal_score || 85,
    };

    console.log(
      "[Supabase Order Fetch] Successfully loaded newest order from Supabase:",
      result.orderId,
      "created_at:",
      latest.created_at,
      "dishes:",
      items.map((i) => `${i.name} (x${i.quantity})`),
    );

    return result;
  } catch (err) {
    console.warn("[Supabase Order Fetch] Exception when loading latest order:", err);
    return null;
  }
}
