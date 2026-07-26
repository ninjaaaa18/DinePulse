"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type NotificationCategory = "Inventory" | "Health" | "Analytics" | "Restaurant" | "AI" | "Orders";
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

function createId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<DinePulseNotification[]>([]);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        setNotifications(parsed as DinePulseNotification[]);
      }
    } catch {
      setNotifications([]);
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
