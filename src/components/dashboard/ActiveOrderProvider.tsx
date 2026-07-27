"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  loadPersistedOrderAnalysisContext,
  persistOrderAnalysisContext,
  type OrderAnalysisContext,
} from "@/lib/orderAnalysis";
import { loadLatestOrderFromSupabase } from "@/lib/supabase";

type ActiveOrderContextValue = {
  activeOrder: OrderAnalysisContext | null;
  setActiveOrder: (order: OrderAnalysisContext) => void;
};

const ActiveOrderContext = createContext<ActiveOrderContextValue | null>(null);

export function ActiveOrderProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<OrderAnalysisContext | null>(null);

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
  }, []);

  return (
    <ActiveOrderContext.Provider value={{ activeOrder, setActiveOrder }}>
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
