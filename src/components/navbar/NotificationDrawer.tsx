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

const categoryTabs: Array<"All" | NotificationCategory> = [
  "All",
  "Orders",
  "Inventory",
  "AI Insights",
  "Customer Activity",
];

const severityStyles: Record<NotificationSeverity, string> = {
  success: "border-emerald/25 bg-emerald/10",
  warning: "border-amber-500/25 bg-amber-500/10",
  critical: "border-rose-500/25 bg-rose-500/10",
  information: "border-sky-500/25 bg-sky-500/10",
  "ai-generated": "border-violet-500/25 bg-violet-500/10",
};

function formatRelativeTime(timestamp: string): string {
  const diff = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function NotificationDrawer({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"All" | NotificationCategory>("All");
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  useEffect(() => { setMounted(true); }, []);

  const visibleNotifications = useMemo(
    () => filter === "All" ? notifications : notifications.filter((item) => item.category === filter),
    [filter, notifications],
  );

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof notifications> = {};
    for (const n of visibleNotifications) {
      const cat = n.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(n);
    }
    return groups;
  }, [visibleNotifications]);

  if (!mounted) return null;

  const drawerContent = (
    <>
      {open ? (
        <button type="button" aria-label="Close notifications overlay" onClick={onClose} className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" />
      ) : null}

      <aside
        aria-label="Notifications"
        className={`fixed top-0 right-0 bottom-0 z-[9999] flex h-screen w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-surface shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-white/10 bg-surface/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-emerald/20 px-2 py-0.5 text-[11px] font-semibold text-emerald">{unreadCount} new</span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted">Stay updated on your activity</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-lg text-muted transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 pb-4 no-scrollbar">
            {categoryTabs.map((tab) => {
              const count = tab === "All" ? unreadCount : notifications.filter((n) => n.category === tab && !n.read).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab as "All" | NotificationCategory)}
                  className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    filter === tab
                      ? "border-emerald/40 bg-emerald/20 text-emerald-light shadow-sm"
                      : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
                  }`}
                >
                  {tab}
                  {count > 0 && filter !== tab ? (
                    <span className="ml-1.5 rounded-full bg-emerald/30 px-1.5 py-0.5 text-[10px] text-emerald-light">{count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 px-5 py-2.5 text-xs">
            <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0} className="font-medium text-emerald-light transition-colors hover:text-emerald disabled:opacity-40">
              ✓ Mark all read
            </button>
            <button type="button" onClick={clearNotifications} className="font-medium text-rose-300 transition-colors hover:text-rose-200">
              🗑️ Clear all
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {visibleNotifications.length > 0 ? (
            Object.entries(groupedByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{category}</p>
                <div className="space-y-2">
                  {items.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:border-emerald/40 ${
                        severityStyles[notification.severity]
                      } ${notification.read ? "opacity-60" : "shadow-md"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{notification.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-white">{notification.title}</p>
                            {!notification.read ? (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald shadow-sm shadow-emerald/50" aria-label="Unread" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted">{notification.description}</p>
                          <div className="mt-2 text-[11px] text-muted">
                            {formatRelativeTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 text-3xl mb-4">
                🔔
              </div>
              <p className="text-sm font-medium text-white">All caught up!</p>
              <p className="mt-1 text-xs text-muted max-w-xs">
                {filter === "All"
                  ? "No notifications yet. They'll appear here when something needs your attention."
                  : `No ${filter.toLowerCase()} notifications.`}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  return createPortal(drawerContent, document.body);
}
