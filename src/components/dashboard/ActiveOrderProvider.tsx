"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  loadPersistedOrderAnalysisContext,
  persistOrderAnalysisContext,
  type OrderAnalysisContext,
} from "@/lib/orderAnalysis";

type ActiveOrderContextValue = {
  activeOrder: OrderAnalysisContext | null;
  setActiveOrder: (order: OrderAnalysisContext) => void;
};

const ActiveOrderContext = createContext<ActiveOrderContextValue | null>(null);

export function ActiveOrderProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<OrderAnalysisContext | null>(null);

  useEffect(() => {
    setActiveOrderState(loadPersistedOrderAnalysisContext());
  }, []);

  const setActiveOrder = useCallback((order: OrderAnalysisContext) => {
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
