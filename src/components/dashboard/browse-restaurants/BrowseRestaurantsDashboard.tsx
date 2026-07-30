"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import RestaurantHeroImage from "@/components/ui/RestaurantHeroImage";
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
            <div
              key={restaurant.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:border-emerald/30 hover:shadow-2xl"
            >
              <div className="relative h-40 overflow-hidden sm:h-44">
                <RestaurantHeroImage
                  cuisine={restaurant.cuisine}
                  name={restaurant.name}
                  slug={restaurant.slug}
                  className="h-full w-full"
                />
                <div className="absolute top-3 right-3 z-10 rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald-light backdrop-blur-sm">
                  {restaurant.healthScore ?? 90}% health
                </div>
                <div className="absolute top-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-surface/80 text-xl shadow-lg backdrop-blur-sm">
                  {restaurant.logo}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h2 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-emerald-light">
                    {restaurant.name}
                  </h2>
                  <p className="text-sm text-muted">{restaurant.cuisine}</p>
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
                  className="mt-auto w-full rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                  onClick={() => handleBrowse(restaurant)}
                >
                  View Menu & Order
                </Button>
              </div>
            </div>
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
