"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import { getStoredInventoryState, type InventoryIngredient } from "@/lib/orderAnalysis";
import { loadInventoryWithFallback } from "@/lib/supabase";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";

function getStatusClasses(status: InventoryIngredient["status"]) {
  switch (status) {
    case "Critical":
      return "border-rose-500/20 bg-rose-500/10 text-rose-200";
    case "Low":
      return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    case "Medium":
      return "border-sky-500/20 bg-sky-500/10 text-sky-200";
    default:
      return "border-emerald/20 bg-emerald/10 text-emerald";
  }
}

function getProgressColor(status: InventoryIngredient["status"]) {
  switch (status) {
    case "Critical":
      return "from-rose-500 to-rose-400";
    case "Low":
      return "from-amber-500 to-amber-400";
    case "Medium":
      return "from-sky-500 to-sky-400";
    default:
      return "from-emerald to-emerald-light";
  }
}

export default function InventoryDashboard() {
  const { activeOrder } = useActiveOrder();
  const { notify } = useNotifications();
  const [inventory, setInventory] = useState<InventoryIngredient[]>(() => getStoredInventoryState());
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const nextInventory = await loadInventoryWithFallback();
      if (!isMounted) return;

      setInventory(nextInventory);

      if (!activeOrder) {
        return;
      }

      notify({
        icon: "□",
        title: "Inventory updated",
        description: "Ingredient stock has been adjusted for the completed order.",
        category: "Inventory",
        severity: "information",
        dedupeKey: `inventory-update-${activeOrder.orderId}`,
      });
      nextInventory.filter((item) => item.warning).forEach((item) => {
        notify({
          icon: "!",
          title: `${item.name} stock is low`,
          description: item.warning ?? "Restock this ingredient soon.",
          category: "Inventory",
          severity: item.status === "Critical" ? "critical" : "warning",
          dedupeKey: `low-stock-${activeOrder.orderId}-${item.id}`,
        });
      });
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeOrder, notify]);

  useEffect(() => {
    setWarningCount(inventory.filter((item) => item.warning).length);
  }, [inventory]);
  const summary = useMemo(() => {
    const consumedItems = inventory.filter((item) => item.stockChange < 0).length;
    const healthyItems = inventory.filter((item) => item.status === "Healthy").length;
    const averageRemaining = Math.round(
      inventory.reduce((sum, item) => sum + item.remainingPercent, 0) / inventory.length,
    );

    if (warningCount > 0) {
      const criticalItem = inventory.find((item) => item.status === "Critical");
      return criticalItem
        ? `• ${criticalItem.name} is becoming critical.`
        : `• ${warningCount} ingredients need attention.`;
    }

    return `• ${consumedItems} ingredients consumed\n• Stock health ${averageRemaining}%\n• No urgent shortages`;
  }, [inventory, warningCount]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald">Inventory</p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dynamic inventory overview</h1>
        <p className="max-w-3xl text-sm text-muted sm:text-base">
          Stock levels update automatically from the selected order and highlight shortages with AI-style guidance.
        </p>
      </header>

      <Card className="border border-emerald/20 bg-gradient-to-br from-emerald/10 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">Inventory Summary</p>
            <div className="mt-2 space-y-1 text-sm text-white/90">
              {summary.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-muted">
            <p className="font-semibold text-white">Watchlist</p>
            <p>{warningCount} ingredient{warningCount === 1 ? "" : "s"} need attention</p>
          </div>
        </div>
      </Card>

      {warningCount > 0 ? (
        <Card className="border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">⚠ Low Stock</p>
              <p className="mt-2 text-sm text-white/90">
                {inventory.find((item) => item.warning)?.name ?? "Selected ingredients"} is running low.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-background/50 px-3 py-2 text-sm text-amber-100">
              Recommended Action
              <p className="mt-1 text-amber-50">
                {inventory.find((item) => item.warning)?.warning ?? "Restock soon."}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {inventory.map((ingredient) => (
          <Card key={ingredient.id} hover className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{ingredient.name}</p>
                <p className="mt-1 text-sm text-muted">{ingredient.unit}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusClasses(ingredient.status)}`}>
                {ingredient.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Current Stock</span>
                <span className="font-semibold text-white">{ingredient.currentStock}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Stock Change</span>
                <span className={`${ingredient.stockChange < 0 ? "text-rose-300" : "text-emerald"}`}>
                  {ingredient.stockChange > 0 ? `+${ingredient.stockChange}` : ingredient.stockChange}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Remaining %</span>
                <span className="font-semibold text-white">{ingredient.remainingPercent}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(ingredient.status)}`}
                  style={{ width: `${Math.max(8, ingredient.remainingPercent)}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {ingredient.warning ?? "Inventory remains within target range."}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
