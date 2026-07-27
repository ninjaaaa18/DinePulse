"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  loadPersistedOrderAnalysisContext,
  persistOrderAnalysisContext,
  type OrderAnalysisContext,
} from "@/lib/orderAnalysis";
import { loadLatestOrderFromSupabase } from "@/lib/supabase";
import { fallbackRestaurants, type Restaurant } from "@/lib/supabase/menu";

type ActiveOrderContextValue = {
  activeOrder: OrderAnalysisContext | null;
  setActiveOrder: (order: OrderAnalysisContext) => void;
  selectedRestaurant: Restaurant;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
};

const RESTAURANT_STORAGE_KEY = "dinepulse.selected-restaurant";

const ActiveOrderContext = createContext<ActiveOrderContextValue | null>(null);

export function ActiveOrderProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<OrderAnalysisContext | null>(null);
  const [selectedRestaurant, setSelectedRestaurantState] = useState<Restaurant>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(RESTAURANT_STORAGE_KEY);
      if (stored) {
        const found = fallbackRestaurants.find(
          (r) => r.id === stored || r.slug === stored || r.name === stored
        );
        if (found) return found;
      }
    }
    return fallbackRestaurants[0];
  });

  useEffect(() => {
    let isMounted = true;
    const localOrder = loadPersistedOrderAnalysisContext();
    if (localOrder) {
      console.log(
        "[ActiveOrderProvider] activeOrder populated from sessionStorage:",
        localOrder.orderId,
        "items:",
        localOrder.items.map((i) => `${i.name} (x${i.quantity})`),
      );
      setActiveOrderState(localOrder);

      const matchedRest = fallbackRestaurants.find(
        (r) =>
          r.id === localOrder.selectedRestaurantId ||
          r.slug === localOrder.selectedRestaurantId ||
          r.name === localOrder.selectedRestaurantName
      );
      if (matchedRest) {
        setSelectedRestaurantState(matchedRest);
      }
    }

    loadLatestOrderFromSupabase().then((remoteOrder) => {
      if (!isMounted || !remoteOrder) return;
      if (!localOrder || remoteOrder.orderId !== localOrder.orderId) {
        console.log(
          "[ActiveOrderProvider] activeOrder populated from Supabase latest order:",
          remoteOrder.orderId,
          "items:",
          remoteOrder.items.map((i) => `${i.name} (x${i.quantity})`),
        );
        setActiveOrderState(remoteOrder);
        persistOrderAnalysisContext(remoteOrder);

        const matchedRest = fallbackRestaurants.find(
          (r) =>
            r.id === remoteOrder.selectedRestaurantId ||
            r.slug === remoteOrder.selectedRestaurantId ||
            r.name === remoteOrder.selectedRestaurantName
        );
        if (matchedRest) {
          setSelectedRestaurantState(matchedRest);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const setActiveOrder = useCallback((order: OrderAnalysisContext) => {
    console.log(
      "[ActiveOrderProvider] setActiveOrder called with new order:",
      order.orderId,
      "items:",
      order.items.map((i) => `${i.name} (x${i.quantity})`),
    );
    persistOrderAnalysisContext(order);
    setActiveOrderState(order);

    const matchedRest = fallbackRestaurants.find(
      (r) =>
        r.id === order.selectedRestaurantId ||
        r.slug === order.selectedRestaurantId ||
        r.name === order.selectedRestaurantName
    );
    if (matchedRest) {
      setSelectedRestaurantState(matchedRest);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(RESTAURANT_STORAGE_KEY, matchedRest.id);
      }
    }
  }, []);

  const setSelectedRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurantState(restaurant);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(RESTAURANT_STORAGE_KEY, restaurant.id);
    }
  }, []);

  return (
    <ActiveOrderContext.Provider
      value={{ activeOrder, setActiveOrder, selectedRestaurant, setSelectedRestaurant }}
    >
      {children}
    </ActiveOrderContext.Provider>
  );
}

export function useActiveOrder() {
  const context = useContext(ActiveOrderContext);

  if (!context) {
    throw new Error("useActiveOrder must be used within ActiveOrderProvider.");
  }

  return context;
}
