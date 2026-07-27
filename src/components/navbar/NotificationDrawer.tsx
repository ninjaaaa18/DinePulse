"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  useNotifications,
  type NotificationCategory,
  type NotificationSeverity,
} from "@/components/dashboard/NotificationProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

const filters: Array<"All" | NotificationCategory> = [
  "All",
  "Inventory",
  "Health",
  "Analytics",
  "AI",
];

const severityStyles: Record<NotificationSeverity, string> = {
  success: "border-emerald/25 bg-emerald/10",
  warning: "border-amber-500/25 bg-amber-500/10",
  critical: "border-rose-500/25 bg-rose-500/10",
  information: "border-sky-500/25 bg-sky-500/10",
  "ai-generated": "border-violet-500/25 bg-violet-500/10",
};

function formatTimestamp(timestamp: string) {
  const difference = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationDrawer({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"All" | NotificationCategory>("All");
  const { notifications, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleNotifications = useMemo(
    () =>
      filter === "All"
        ? notifications
        : notifications.filter((item) => item.category === filter),
    [filter, notifications]
  );

  if (!mounted) return null;

  const drawerContent = (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close notifications overlay"
          onClick={onClose}
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      ) : null}

      <aside
        aria-label="Notifications Drawer"
        className={`fixed top-0 right-0 bottom-0 z-[9999] flex h-screen w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-surface shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header - Fixed Top */}
        <div className="shrink-0 border-b border-white/10 p-5 bg-surface/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="mt-0.5 text-xs text-muted">Stay updated on your restaurant platform</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-lg text-muted transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close notification drawer"
            >
              ✕
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  filter === item
                    ? "border-emerald/40 bg-emerald/20 text-emerald-light shadow-sm"
                    : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Drawer Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
            <button
              type="button"
              onClick={markAllAsRead}
              className="font-medium text-emerald-light transition-colors hover:text-emerald"
            >
              ✓ Mark all read
            </button>
            <button
              type="button"
              onClick={clearNotifications}
              className="font-medium text-rose-300 transition-colors hover:text-rose-200"
            >
              🗑️ Clear notifications
            </button>
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:border-emerald/40 ${
                  severityStyles[notification.severity]
                } ${notification.read ? "opacity-60" : "shadow-md"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0" aria-hidden="true">
                    {notification.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-white">
                        {notification.title}
                      </p>
                      {!notification.read ? (
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald shadow-sm shadow-emerald/50"
                          aria-label="Unread"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {notification.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-medium">
                        {notification.category}
                      </span>
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl">🔔</span>
              <p className="mt-2 text-sm font-medium text-white">No notifications</p>
              <p className="mt-1 text-xs text-muted">
                {filter === "All"
                  ? "You're all caught up!"
                  : `No notifications in the ${filter} category.`}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  return createPortal(drawerContent, document.body);
}
