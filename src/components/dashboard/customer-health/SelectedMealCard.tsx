"use client";

import Card from "@/components/cards/Card";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";

export default function SelectedMealCard() {
  const { activeOrder } = useActiveOrder();

  if (!activeOrder || activeOrder.items.length === 0) {
    return (
      <Card className="relative overflow-hidden">
        <div className="py-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald">
            Selected Meal
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">No Active Order</h2>
          <p className="mt-2 text-sm text-muted">
            Place an order on the Order Food page to view your live meal analysis.
          </p>
        </div>
      </Card>
    );
  }

  const items = activeOrder.items.map((item) => ({
    name: `${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ""}`,
    emoji: item.name.toLowerCase().includes("burger")
      ? "🍔"
      : item.name.toLowerCase().includes("fries")
      ? "🍟"
      : item.name.toLowerCase().includes("salad")
      ? "🥗"
      : item.name.toLowerCase().includes("pizza")
      ? "🍕"
      : item.name.toLowerCase().includes("soda") || item.name.toLowerCase().includes("coke")
      ? "🥤"
      : "🍱",
  }));

  const orderTitle =
    activeOrder.items.length <= 2
      ? activeOrder.items.map((i) => i.name).join(" & ")
      : `${activeOrder.items[0].name} & ${activeOrder.items.length - 1} more items`;

  const totalCalories = activeOrder.totalCalories;
  const protein = `${activeOrder.items.reduce((acc, i) => acc + i.protein * i.quantity, 0)}g`;
  const fat = `${activeOrder.items.reduce((acc, i) => acc + i.fat * i.quantity, 0)}g`;
  const sugar = `${activeOrder.items.reduce((acc, i) => acc + i.sugar * i.quantity, 0)}g`;
  const fiber = `${activeOrder.items.reduce((acc, i) => acc + (i.carbohydrates > 30 ? 6 : 3) * i.quantity, 0)}g`;
  const cost = `₹${activeOrder.subtotal.toLocaleString("en-IN")}`;

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald">
              Selected Meal
            </p>
            <h2 className="mt-1 text-xl font-bold text-white max-w-xs sm:max-w-sm truncate">
              {orderTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              From {activeOrder.selectedRestaurantName}
            </p>
          </div>
          <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light shrink-0">
            Live Order
          </span>
        </div>

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`selected-meal-${item.name}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-emerald/20 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-emerald/5 text-xl">
                {item.emoji}
              </span>
              <span className="font-medium text-white">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-6 sm:grid-cols-3">
          {[
            { label: "Total Calories", value: `${totalCalories} kcal` },
            { label: "Protein", value: protein },
            { label: "Fat", value: fat },
            { label: "Sugar", value: sugar },
            { label: "Fiber", value: fiber },
            {
              label: "Meal Cost",
              value: cost,
              highlight: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl px-3 py-2.5 ${
                stat.highlight
                  ? "border border-emerald/20 bg-emerald/5 sm:col-span-1"
                  : "bg-white/[0.02]"
              }`}
            >
              <p className="text-xs text-muted">{stat.label}</p>
              <p
                className={`mt-0.5 font-semibold ${
                  stat.highlight ? "text-emerald-light" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
