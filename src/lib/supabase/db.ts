import { supabase } from "./client";
import type {
  RestaurantRow,
  RestaurantInsert,
  RestaurantUpdate,
  PartnerApplicationRow,
  PartnerApplicationInsert,
  MenuItemRow,
  MenuItemInsert,
  CustomerRow,
  CustomerInsert,
  OrderRow,
  OrderInsert,
  OrderItemRow,
  OrderItemInsert,
  InventoryRow,
  InventoryInsert,
  InventoryUpdate,
  RecipeRow,
  RecipeInsert,
  AnalyticsRow,
  AnalyticsInsert,
  NotificationRow,
  NotificationInsert,
} from "./types";

// ==================== RESTAURANTS ====================

export async function getRestaurants(): Promise<{ data: RestaurantRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getRestaurantById(id: string): Promise<{ data: RestaurantRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getRestaurantBySlug(slug: string): Promise<{ data: RestaurantRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();
  return { data, error };
}

export async function upsertRestaurant(restaurant: RestaurantInsert): Promise<{ data: RestaurantRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("restaurants")
    .upsert(restaurant)
    .select()
    .single();
  return { data, error };
}

export async function updateRestaurant(
  id: string,
  updates: RestaurantUpdate,
): Promise<{ data: RestaurantRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("restaurants")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ==================== MENU ITEMS ====================

export async function getMenuItems(restaurantId?: string): Promise<{ data: MenuItemRow[] | null; error: Error | null }> {
  let query = supabase.from("menu_items").select("*");
  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId);
  }
  const { data, error } = await query.order("name", { ascending: true });
  return { data, error };
}

export async function getMenuItemById(id: string): Promise<{ data: MenuItemRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function upsertMenuItem(item: MenuItemInsert): Promise<{ data: MenuItemRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("menu_items")
    .upsert(item)
    .select()
    .single();
  return { data, error };
}

export async function deleteMenuItem(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  return { error };
}

// ==================== CUSTOMERS ====================

export async function getCustomerById(id: string): Promise<{ data: CustomerRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getCustomerByUserId(userId: string): Promise<{ data: CustomerRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

export async function getCustomerByEmail(email: string): Promise<{ data: CustomerRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .single();
  return { data, error };
}

export async function upsertCustomer(customer: CustomerInsert): Promise<{ data: CustomerRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("customers")
    .upsert(customer)
    .select()
    .single();
  return { data, error };
}

// ==================== ORDERS & ORDER ITEMS ====================

export async function getOrders(filters?: {
  restaurantId?: string;
  customerId?: string;
  status?: string;
}): Promise<{ data: OrderRow[] | null; error: Error | null }> {
  let query = supabase.from("orders").select("*");
  if (filters?.restaurantId) {
    query = query.eq("restaurant_id", filters.restaurantId);
  }
  if (filters?.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error };
}

export async function getOrderWithItems(id: string): Promise<{
  data: (OrderRow & { order_items: OrderItemRow[] }) | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  return { data: data as (OrderRow & { order_items: OrderItemRow[] }) | null, error };
}

export async function createOrder(
  order: OrderInsert,
  items: Omit<OrderItemInsert, "order_id">[]
): Promise<{ data: OrderRow | null; error: Error | null }> {
  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (orderError || !createdOrder) {
    return { data: null, error: orderError };
  }

  if (items.length > 0) {
    const formattedItems: OrderItemInsert[] = items.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(formattedItems);

    if (itemsError) {
      return { data: createdOrder, error: itemsError };
    }
  }

  return { data: createdOrder, error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ data: OrderRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();
  return { data, error };
}

export async function getOrderItems(orderId: string): Promise<{ data: OrderItemRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  return { data, error };
}

// ==================== INVENTORY ====================

export async function getInventory(restaurantId?: string): Promise<{ data: InventoryRow[] | null; error: Error | null }> {
  let query = supabase.from("inventory").select("*");
  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId);
  }
  const { data, error } = await query.order("name", { ascending: true });
  return { data, error };
}

export async function upsertInventoryItem(item: InventoryInsert): Promise<{ data: InventoryRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("inventory")
    .upsert(item)
    .select()
    .single();
  return { data, error };
}

export async function updateInventoryStock(
  id: string,
  currentStock: number,
  status?: string,
  warning?: string | null
): Promise<{ data: InventoryRow | null; error: Error | null }> {
  const updates: InventoryUpdate = {
    current_stock: currentStock,
    updated_at: new Date().toISOString(),
  };
  if (status !== undefined) updates.status = status;
  if (warning !== undefined) updates.warning = warning;

  const { data, error } = await supabase
    .from("inventory")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ==================== RECIPES ====================

export async function getRecipes(menuItemId?: string): Promise<{ data: RecipeRow[] | null; error: Error | null }> {
  let query = supabase.from("recipes").select("*");
  if (menuItemId) {
    query = query.eq("menu_item_id", menuItemId);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function upsertRecipe(recipe: RecipeInsert): Promise<{ data: RecipeRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("recipes")
    .upsert(recipe)
    .select()
    .single();
  return { data, error };
}

// ==================== ANALYTICS ====================

export async function getLatestAnalytics(restaurantId?: string, limit = 30): Promise<{ data: AnalyticsRow[] | null; error: Error | null }> {
  let query = supabase.from("analytics").select("*");
  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId);
  }
  const { data, error } = await query.order("date", { ascending: false }).limit(limit);
  return { data, error };
}

export async function recordAnalyticsSnapshot(snapshot: AnalyticsInsert): Promise<{ data: AnalyticsRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("analytics")
    .upsert(snapshot)
    .select()
    .single();
  return { data, error };
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(filters?: {
  restaurantId?: string;
  customerId?: string;
  unreadOnly?: boolean;
}): Promise<{ data: NotificationRow[] | null; error: Error | null }> {
  let query = supabase.from("notifications").select("*");
  if (filters?.restaurantId) {
    query = query.eq("restaurant_id", filters.restaurantId);
  }
  if (filters?.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }
  if (filters?.unreadOnly) {
    query = query.eq("is_read", false);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error };
}

export async function createNotification(notification: NotificationInsert): Promise<{ data: NotificationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();
  return { data, error };
}

export async function markNotificationAsRead(id: string): Promise<{ data: NotificationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ==================== PARTNER APPLICATIONS ====================

export async function createPartnerApplication(
  application: PartnerApplicationInsert
): Promise<{ data: PartnerApplicationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("partner_applications")
    .insert(application)
    .select()
    .single();
  return { data, error };
}

export async function getPartnerApplicationByUserId(
  userId: string
): Promise<{ data: PartnerApplicationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("partner_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

export async function updatePartnerApplicationStatus(
  id: string,
  status: PartnerApplicationRow["status"]
): Promise<{ data: PartnerApplicationRow | null; error: Error | null }> {
  const updates: Partial<PartnerApplicationRow> = {
    status,
    reviewed_at: status !== "pending_review" ? new Date().toISOString() : undefined,
  };
  const { data, error } = await supabase
    .from("partner_applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}
