"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCustomerByUserId, getOrCreateCustomerForUser, getOrders, updateOrderStatus } from "@/lib/supabase";
import type { OrderRow } from "@/lib/supabase/types";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "border-amber/20 bg-amber/10 text-amber" },
  accepted: { label: "Accepted", color: "border-sky/20 bg-sky/10 text-sky" },
  preparing: { label: "Preparing", color: "border-indigo/20 bg-indigo/10 text-indigo" },
  ready: { label: "Ready", color: "border-emerald/20 bg-emerald/10 text-emerald" },
  completed: { label: "Completed", color: "border-emerald/20 bg-emerald/10 text-emerald" },
  cancelled: { label: "Cancelled", color: "border-rose/20 bg-rose/10 text-rose" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, color: "border-white/10 bg-white/5 text-muted" };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

const statusMessages: Record<string, string> = {
  pending: "Awaiting restaurant confirmation",
  accepted: "Restaurant has accepted your order",
  preparing: "Your food is being prepared",
  ready: "Your order is ready!",
  completed: "Delivered",
  cancelled: "Order cancelled",
};

export default function MyOrdersDashboard() {
  const { activeOrder } = useActiveOrder();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    let mounted = true;
    async function init() {
      const { data: existing } = await getCustomerByUserId(currentUser.id);
      if (existing) {
        if (mounted) setCustomerId(existing.id);
        return;
      }
      const { data: created } = await getOrCreateCustomerForUser(currentUser);
      if (created && mounted) setCustomerId(created.id);
    }
    init();
    return () => { mounted = false; };
  }, [user]);

  const loadOrders = useCallback(async () => {
    if (!customerId) return;
    const { data } = await getOrders({ customerId });
    if (data) setOrders(data);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      await loadOrders();
      if (mounted) setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [customerId, loadOrders]);

  useEffect(() => {
    if (!customerId) return;
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [customerId, loadOrders]);

  const activeOrderId = activeOrder?.orderId;
  const matchedOrder = orders.find((o) => o.id === activeOrderId);
  const activeStatus = matchedOrder?.status || (activeOrderId ? "pending" : null);

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "cancelled");
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
          Customer Experience
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Orders
        </h1>
        <p className="max-w-3xl text-sm text-muted">
          Track your current order, review meal health scores, and revisit allergy safety details.
        </p>
      </header>

      {activeOrder && activeStatus ? (
        <Card hover className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
                Current Order
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                {activeOrder.selectedRestaurantName}
              </h2>
              <p className="text-sm text-muted">{activeOrder.restaurantCuisine}</p>
            </div>
            <StatusBadge status={activeStatus} />
          </div>

          <div className="space-y-2">
            {activeOrder.items.map((item) => (
              <div
                key={`${item.name}-${item.quantity}`}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"
              >
                <span className="text-white">
                  {item.name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="font-medium text-emerald-light">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted">Subtotal</p>
              <p className="text-lg font-bold text-white">{formatPrice(activeOrder.subtotal)}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted">Meal Health</p>
              <p className="text-lg font-bold text-emerald-light">
                {activeOrder.averageMealScore}%
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted">Calories</p>
              <p className="text-lg font-bold text-white">{activeOrder.totalCalories}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {statusMessages[activeStatus] || activeStatus}
            </p>
            <div className="flex gap-2">
              {activeStatus === "pending" && matchedOrder ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCancelOrder(matchedOrder.id)}
                >
                  Cancel Order
                </Button>
              ) : null}
              <Link href="/dashboard/order-food">
                <Button variant="primary" size="sm">
                  Modify Order
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card className="flex items-center justify-center py-8 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
            Loading orders...
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-4xl">📋</span>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No orders yet</h2>
            <p className="max-w-md text-sm text-muted">
              Browse restaurants and place your first order to track meal health, allergens, and
              delivery progress here.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/browse-restaurants">
              <Button type="button" variant="primary" className="rounded-xl">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/dashboard/order-food">
              <Button type="button" variant="secondary" className="rounded-xl">
                Order Food
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <section>
          <h2 className="mb-4 text-lg font-bold text-white">Order History</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} hover className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{order.order_number}</p>
                    <p className="text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-muted">
                  {order.notes?.replace(/^Order placed for /, "") || `${order.total_calories ?? "—"} kcal`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(order.total_amount)}
                  </span>
                  <span className="text-xs text-muted">
                    {statusMessages[order.status] || order.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
