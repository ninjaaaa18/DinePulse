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
