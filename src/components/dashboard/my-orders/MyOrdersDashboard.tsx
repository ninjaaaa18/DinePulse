"use client";

import Link from "next/link";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function MyOrdersDashboard() {
  const { activeOrder } = useActiveOrder();

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
        <div className="grid gap-6 xl:grid-cols-2">
          <Card hover className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
                  Active Order
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {activeOrder.selectedRestaurantName}
                </h2>
                <p className="text-sm text-muted">{activeOrder.restaurantCuisine}</p>
              </div>
              <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald-light">
                In progress
              </span>
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
          </Card>

          <Card hover className="space-y-4">
            <h2 className="text-lg font-bold text-white">Order Insights</h2>
            <p className="text-sm text-muted">
              Review nutrition and allergy safety for your current order using DinePulse health
              tools.
            </p>
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
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-4xl">📋</span>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No active orders yet</h2>
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
      )}
    </div>
  );
}
