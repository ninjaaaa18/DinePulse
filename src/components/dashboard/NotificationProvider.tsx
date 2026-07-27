"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type NotificationCategory = "Orders" | "Inventory" | "AI Insights" | "Customer Activity";
export type NotificationSeverity = "success" | "warning" | "critical" | "information" | "ai-generated";

export type DinePulseNotification = {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  dedupeKey?: string;
};

export type CreateNotification = Omit<DinePulseNotification, "id" | "timestamp" | "read">;

type NotificationContextValue = {
  notifications: DinePulseNotification[];
  unreadCount: number;
  notify: (notification: CreateNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const STORAGE_KEY = "dinepulse.notifications";
const NotificationContext = createContext<NotificationContextValue | null>(null);

const defaultInitialNotifications: DinePulseNotification[] = [
  {
    id: "notif-1",
    icon: "🛒",
    title: "New Order Received",
    description: "Order #1042 has been placed at Urban Burger. 3 items totaling ₹547.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    category: "Orders",
    severity: "success",
    read: false,
  },
  {
    id: "notif-2",
    icon: "⭐",
    title: "Customer Rated Burger 5★",
    description: "A customer rated the Classic Burger 5 stars with positive feedback.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    category: "Customer Activity",
    severity: "success",
    read: false,
  },
  {
    id: "notif-3",
    icon: "⚠",
    title: "Cheese Stock Low",
    description: "Cheese inventory is down to 15 servings. Reorder before tomorrow's peak.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: "Inventory",
    severity: "warning",
    read: false,
  },
  {
    id: "notif-4",
    icon: "📈",
    title: "Revenue Increased by 14%",
    description: "Today's revenue is up 14% compared to the same period last week.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: "AI Insights",
    severity: "ai-generated",
    read: true,
  },
];

function createId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<DinePulseNotification[]>(defaultInitialNotifications);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed as DinePulseNotification[]);
        }
      }
    } catch {
      setNotifications(defaultInitialNotifications);
    }
  }, []);

  const persist = useCallback((nextNotifications: DinePulseNotification[]) => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotifications));
  }, []);

  const notify = useCallback((notification: CreateNotification) => {
    setNotifications((current) => {
      if (notification.dedupeKey && current.some((item) => item.dedupeKey === notification.dedupeKey)) {
        return current;
      }

      const next = [{
        ...notification,
        id: createId(),
        timestamp: new Date().toISOString(),
        read: false,
      }, ...current].slice(0, 100);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) => {
      const next = current.map((item) => item.id === id ? { ...item, read: true } : item);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => {
      const next = current.map((item) => ({ ...item, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, notify, markAsRead, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider.");
  }

  return context;
}
