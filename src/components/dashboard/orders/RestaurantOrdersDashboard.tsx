"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { getOrders, updateOrderStatus, getOrderWithItems } from "@/lib/supabase";
import { supabase } from "@/lib/supabase/client";
import type { OrderRow } from "@/lib/supabase/types";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "border-amber/20 bg-amber/10 text-amber", icon: "🕐" },
  accepted: { label: "Accepted", color: "border-sky/20 bg-sky/10 text-sky", icon: "✅" },
  preparing: { label: "Preparing", color: "border-indigo/20 bg-indigo/10 text-indigo", icon: "👨‍🍳" },
  ready: { label: "Ready", color: "border-emerald/20 bg-emerald/10 text-emerald", icon: "🍽️" },
  completed: { label: "Completed", color: "border-emerald/20 bg-emerald/10 text-emerald", icon: "✅" },
  cancelled: { label: "Cancelled", color: "border-rose/20 bg-rose/10 text-rose", icon: "❌" },
};

type OrderWithCustomer = OrderRow & { customer_name?: string };

const TABS = ["active", "completed", "cancelled", "all"] as const;
type Tab = (typeof TABS)[number];

export default function RestaurantOrdersDashboard() {
  const { restaurant: authRestaurant } = useAuth();
  const { notify } = useNotifications();
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const restaurantId = authRestaurant?.id;

  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data } = await getOrders({ restaurantId });
    if (data) {
      const customerIds = [...new Set(data.map((o) => o.customer_id).filter(Boolean))] as string[];
      let nameMap: Record<string, string> = {};
      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from("customers")
          .select("id, name")
          .in("id", customerIds);
        customers?.forEach((c) => { nameMap[c.id] = c.name; });
      }
      setOrders(data.map((o) => ({
        ...o,
        customer_name: o.customer_id ? nameMap[o.customer_id] || "Guest" : "Guest",
      })));
    }
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [restaurantId, loadOrders]);

  const activeStatuses = useMemo(() => ["pending", "accepted", "preparing", "ready"], []);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab === "active") {
      result = result.filter((o) => activeStatuses.includes(o.status));
    } else if (activeTab === "completed") {
      result = result.filter((o) => o.status === "completed");
    } else if (activeTab === "cancelled") {
      result = result.filter((o) => o.status === "cancelled");
    }
    if (selectedStatus !== "all") {
      result = result.filter((o) => o.status === selectedStatus);
    }
    return result;
  }, [orders, activeTab, selectedStatus, activeStatuses]);

  const notifyStatusChange = useCallback(async (orderId: string, newStatus: string, orderNumber: string) => {
    await updateOrderStatus(orderId, newStatus);
    const statusLabels: Record<string, string> = {
      accepted: "Order Accepted",
      preparing: "Preparing Order",
      ready: "Order Ready",
      completed: "Order Completed",
      cancelled: "Order Cancelled",
    };
    notify({
      icon: "✅",
      title: statusLabels[newStatus] || newStatus,
      description: `Order ${orderNumber} marked as ${newStatus}.`,
      category: "Orders",
      severity: newStatus === "cancelled" ? "warning" : "success",
      dedupeKey: `restaurant-order-${newStatus}-${orderId}`,
    });
    loadOrders();
  }, [notify, loadOrders]);

  const handleAccept = useCallback(async (orderId: string, orderNumber: string) => {
    await notifyStatusChange(orderId, "accepted", orderNumber);
  }, [notifyStatusChange]);

  const handlePrepare = useCallback(async (orderId: string, orderNumber: string) => {
    await notifyStatusChange(orderId, "preparing", orderNumber);
  }, [notifyStatusChange]);

  const handleReady = useCallback(async (orderId: string, orderNumber: string) => {
    await notifyStatusChange(orderId, "ready", orderNumber);
  }, [notifyStatusChange]);

  const handleComplete = useCallback(async (orderId: string, orderNumber: string) => {
    await notifyStatusChange(orderId, "completed", orderNumber);
  }, [notifyStatusChange]);

  const handleCancel = useCallback(async (orderId: string, orderNumber: string) => {
    await notifyStatusChange(orderId, "cancelled", orderNumber);
  }, [notifyStatusChange]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return orders
      .filter((o) => {
        const today = new Date();
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === today.toDateString();
      })
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [orders]);

  function OrderActions({ order }: { order: OrderWithCustomer }) {
    return (
      <div className="flex gap-2">
        {order.status === "pending" ? (
          <>
            <Button variant="primary" size="sm" className="rounded-xl" onClick={() => handleAccept(order.id, order.order_number)}>
              Accept
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => handleCancel(order.id, order.order_number)}>
              Cancel
            </Button>
          </>
        ) : order.status === "accepted" ? (
          <>
            <Button variant="primary" size="sm" className="rounded-xl" onClick={() => handlePrepare(order.id, order.order_number)}>
              Prepare
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => handleCancel(order.id, order.order_number)}>
              Cancel
            </Button>
          </>
        ) : order.status === "preparing" ? (
          <>
            <Button variant="primary" size="sm" className="rounded-xl" onClick={() => handleReady(order.id, order.order_number)}>
              Ready
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => handleCancel(order.id, order.order_number)}>
              Cancel
            </Button>
          </>
        ) : order.status === "ready" ? (
          <>
            <Button variant="primary" size="sm" className="rounded-xl" onClick={() => handleComplete(order.id, order.order_number)}>
              Complete
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => handleCancel(order.id, order.order_number)}>
              Cancel
            </Button>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
          Restaurant Orders
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Orders Management
        </h1>
        <p className="max-w-3xl text-sm text-muted">
          View and manage all orders for your restaurant. Update order statuses in real-time.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕐</span>
            <h3 className="text-sm font-bold text-white">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-amber">{statusCounts.pending || 0}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍🍳</span>
            <h3 className="text-sm font-bold text-white">Preparing</h3>
          </div>
          <p className="text-2xl font-bold text-indigo">{statusCounts.preparing || 0}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <h3 className="text-sm font-bold text-white">Ready</h3>
          </div>
          <p className="text-2xl font-bold text-emerald">{statusCounts.ready || 0}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <h3 className="text-sm font-bold text-white">Today&apos;s Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(todayRevenue)}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-emerald/30 bg-emerald/10 text-emerald"
                : "border-white/10 text-muted hover:border-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-muted">Filter by status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-surface px-3 py-1.5 text-sm text-white focus:border-emerald focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center py-8 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
            Loading orders...
          </div>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-4xl">📋</span>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No orders found</h2>
            <p className="max-w-md text-sm text-muted">
              {activeTab === "active"
                ? "No active orders. New orders will appear here when customers place them."
                : `No ${activeTab} orders to show.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            return (
              <Card key={order.id} hover className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{order.order_number}</p>
                      {order.customer_name ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted">
                          {order.customer_name}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted">Total: <span className="font-semibold text-white">{formatPrice(order.total_amount)}</span></span>
                  {order.total_calories ? (
                    <span className="text-muted">{order.total_calories} kcal</span>
                  ) : null}
                  {order.notes ? (
                    <span className="text-muted truncate max-w-xs">{order.notes.replace(/^Order placed for /, "")}</span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      order.status === "pending" ? "bg-amber" :
                      order.status === "accepted" ? "bg-sky" :
                      order.status === "preparing" ? "bg-indigo" :
                      order.status === "ready" ? "bg-emerald" :
                      order.status === "completed" ? "bg-emerald" : "bg-rose"
                    }`} />
                    <span className="text-xs text-muted">{cfg.label}</span>
                  </div>
                  <OrderActions order={order} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
