"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { getOrders } from "@/lib/supabase";
import type { OrderRow } from "@/lib/supabase/types";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "border-amber/20 bg-amber/10 text-amber" },
  accepted: { label: "Accepted", color: "border-sky/20 bg-sky/10 text-sky" },
  completed: { label: "Completed", color: "border-emerald/20 bg-emerald/10 text-emerald" },
  rejected: { label: "Rejected", color: "border-rose/20 bg-rose/10 text-rose" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, color: "border-white/10 bg-white/5 text-muted" };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function MyOrdersDashboard() {
  const { activeOrder } = useActiveOrder();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await getOrders();
      if (mounted) {
        setOrders(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

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

      {activeOrder ? (
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
            <StatusBadge status="pending" />
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

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/customer-health">
              <Button type="button" variant="secondary" className="rounded-xl">
                Customer Health
              </Button>
            </Link>
            <Link href="/dashboard/allergy-safety">
              <Button type="button" variant="secondary" className="rounded-xl">
                Allergy Safety
              </Button>
            </Link>
            <Link href="/dashboard/order-food">
              <Button type="button" variant="primary" className="rounded-xl">
                Modify Order
              </Button>
            </Link>
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
                <p className="text-sm text-muted">{order.notes || `${order.total_calories ?? "—"} kcal`}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(order.total_amount)}
                  </span>
                  {order.status === "pending" ? (
                    <span className="text-xs text-amber">Awaiting restaurant confirmation</span>
                  ) : order.status === "accepted" ? (
                    <span className="text-xs text-sky">Being prepared</span>
                  ) : order.status === "completed" ? (
                    <span className="text-xs text-emerald">Delivered</span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
