"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import {
  fallbackRestaurants,
  loadRestaurantsWithFallback,
  type Restaurant,
} from "@/lib/supabase";

export default function BrowseRestaurantsDashboard() {
  const router = useRouter();
  const { setSelectedRestaurant } = useActiveOrder();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(fallbackRestaurants);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const fetched = await loadRestaurantsWithFallback();
      if (!isMounted) return;
      setRestaurants(fetched);
      setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleBrowse(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    router.push("/dashboard/order-food");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
          Customer Experience
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Browse Restaurants
        </h1>
        <p className="max-w-3xl text-sm text-muted">
          Discover nearby restaurants, explore menus, and start an order with health and allergy
          insights built in.
        </p>
      </header>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald/20 border-t-emerald" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} hover className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/15 text-2xl">
                    {restaurant.logo}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">{restaurant.name}</h2>
                    <p className="text-sm text-muted">{restaurant.cuisine}</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald-light">
                  {restaurant.healthScore ?? 90}% health
                </span>
              </div>

              <p className="text-sm text-muted line-clamp-2">
                {restaurant.description || "Fresh meals with nutrition and allergy insights."}
              </p>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>🕒 {restaurant.deliveryTime || "20–30 min"}</span>
                <span>{restaurant.items.length} menu items</span>
              </div>

              <Button
                type="button"
                variant="primary"
                className="mt-auto w-full rounded-xl"
                onClick={() => handleBrowse(restaurant)}
              >
                View Menu & Order
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Ready to order?</h3>
          <p className="text-xs text-muted">
            Jump straight to the ordering flow with your last selected restaurant.
          </p>
        </div>
        <Link href="/dashboard/order-food">
          <Button type="button" variant="secondary" className="rounded-xl">
            Go to Order Food
          </Button>
        </Link>
      </Card>
    </div>
  );
}
