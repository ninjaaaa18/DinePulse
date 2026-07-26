import { getLatestAnalytics, recordAnalyticsSnapshot } from "./db";
import { supabase } from "./client";
import { getOrCreateRestaurantForUser } from "./auth";
import {
  getDefaultAnalyticsSnapshot,
  getStoredAnalyticsSnapshot,
  persistAnalyticsSnapshot,
  type AnalyticsSnapshot,
} from "@/lib/orderAnalysis";
import type { AnalyticsInsert, AnalyticsRow } from "./types";

/**
 * Maps a Supabase AnalyticsRow to the application's AnalyticsSnapshot model.
 */
function mapRowToSnapshot(row: AnalyticsRow): AnalyticsSnapshot {
  const metrics = (row.metrics_payload as Record<string, any>) || {};
  const defaultSnap = getDefaultAnalyticsSnapshot();

  return {
    totalOrders: Number(row.total_orders ?? 0),
    revenue: Number(row.revenue ?? 0),
    averageMealHealthScore: Number(row.average_meal_health_score ?? 0),
    caloriesServed: Number(row.calories_served ?? 0),
    popularDish: row.popular_dish || "No orders yet",
    healthyMealPercent: Number(row.healthy_meal_percent ?? 0),
    unhealthyMealPercent: Number(row.unhealthy_meal_percent ?? 0),
    averageCustomerSatisfaction: Number(row.average_customer_satisfaction ?? 0),
    revenueTrend: Array.isArray(metrics.revenueTrend) ? metrics.revenueTrend : defaultSnap.revenueTrend,
    ordersTrend: Array.isArray(metrics.ordersTrend) ? metrics.ordersTrend : defaultSnap.ordersTrend,
    healthDistribution: Array.isArray(metrics.healthDistribution) ? metrics.healthDistribution : defaultSnap.healthDistribution,
    topSellingFoods: Array.isArray(metrics.topSellingFoods) ? metrics.topSellingFoods : defaultSnap.topSellingFoods,
    insights: Array.isArray(row.insights) ? (row.insights as string[]) : defaultSnap.insights,
    lastOrderSignature: metrics.lastOrderSignature || null,
  };
}

/**
 * Maps an AnalyticsSnapshot model to a Supabase AnalyticsInsert object.
 */
function mapSnapshotToInsert(
  snapshot: AnalyticsSnapshot,
  restaurantId?: string | null
): AnalyticsInsert {
  return {
    restaurant_id: restaurantId || null,
    date: new Date().toISOString().split("T")[0],
    total_orders: snapshot.totalOrders,
    revenue: snapshot.revenue,
    average_meal_health_score: snapshot.averageMealHealthScore,
    calories_served: snapshot.caloriesServed,
    popular_dish: snapshot.popularDish,
    healthy_meal_percent: snapshot.healthyMealPercent,
    unhealthy_meal_percent: snapshot.unhealthyMealPercent,
    average_customer_satisfaction: snapshot.averageCustomerSatisfaction,
    insights: snapshot.insights as any,
    metrics_payload: {
      revenueTrend: snapshot.revenueTrend,
      ordersTrend: snapshot.ordersTrend,
      healthDistribution: snapshot.healthDistribution,
      topSellingFoods: snapshot.topSellingFoods,
      lastOrderSignature: snapshot.lastOrderSignature,
    } as any,
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
 * Fetches the latest analytics snapshot from Supabase.
 * Returns null if Supabase is unavailable or encounters an error.
 */
export async function fetchAnalyticsFromSupabase(): Promise<AnalyticsSnapshot | null> {
  try {
    const restaurantId = await getActiveRestaurantId();
    const { data, error } = await getLatestAnalytics(restaurantId || undefined, 1);
    if (error) {
      console.warn("[Supabase Analytics] Fetch failed, fallback active:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return mapRowToSnapshot(data[0]);
    }

    // If table is empty, return default snapshot
    return getDefaultAnalyticsSnapshot();
  } catch (err) {
    console.warn("[Supabase Analytics] Exception on fetch, fallback active:", err);
    return null;
  }
}

/**
 * Syncs the current AnalyticsSnapshot to Supabase database.
 */
export async function syncAnalyticsToSupabase(
  snapshot: AnalyticsSnapshot
): Promise<{ success: boolean; error?: Error }> {
  try {
    const restaurantId = await getActiveRestaurantId();
    const payload = mapSnapshotToInsert(snapshot, restaurantId);
    const { error } = await recordAnalyticsSnapshot(payload);

    if (error) {
      console.warn("[Supabase Analytics] Record snapshot failed:", error.message);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn("[Supabase Analytics] Sync exception:", error.message);
    return { success: false, error };
  }
}

/**
 * Loads analytics from Supabase with fallback to sessionStorage.
 */
export async function loadAnalyticsWithFallback(): Promise<AnalyticsSnapshot> {
  const remoteSnapshot = await fetchAnalyticsFromSupabase();
  if (remoteSnapshot) {
    // Keep sessionStorage pre-warmed for offline fallback
    persistAnalyticsSnapshot(remoteSnapshot);
    return remoteSnapshot;
  }

  return getStoredAnalyticsSnapshot();
}

/**
 * Persists analytics snapshot to sessionStorage immediately and syncs to Supabase in background.
 */
export async function saveAnalyticsWithFallback(
  snapshot: AnalyticsSnapshot
): Promise<void> {
  persistAnalyticsSnapshot(snapshot);
  await syncAnalyticsToSupabase(snapshot);
}
