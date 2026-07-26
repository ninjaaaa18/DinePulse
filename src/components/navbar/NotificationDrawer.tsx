"use client";

import { useMemo, useState } from "react";
import { useNotifications, type NotificationCategory, type NotificationSeverity } from "@/components/dashboard/NotificationProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

const filters: Array<"All" | NotificationCategory> = ["All", "Inventory", "Health", "Analytics", "AI"];

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
  const [filter, setFilter] = useState<"All" | NotificationCategory>("All");
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const visibleNotifications = useMemo(
    () => filter === "All" ? notifications : notifications.filter((item) => item.category === filter),
    [filter, notifications],
  );

  return (
    <>
      {open ? <button type="button" aria-label="Close notifications" onClick={onClose} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" /> : null}
      <aside
        aria-label="Notifications"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-surface shadow-2xl shadow-black/40 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="mt-1 text-sm text-muted">Stay on top of your restaurant.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Close notification drawer">×</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === item ? "border-emerald/30 bg-emerald/15 text-emerald" : "border-white/10 bg-white/5 text-muted hover:text-white"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3 text-xs">
            <button type="button" onClick={markAllAsRead} className="text-emerald transition-colors hover:text-emerald-light">Mark all read</button>
            <button type="button" onClick={clearNotifications} className="text-rose-300 transition-colors hover:text-rose-200">Clear notifications</button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {visibleNotifications.length ? visibleNotifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => markAsRead(notification.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors hover:border-emerald/30 ${severityStyles[notification.severity]} ${notification.read ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">{notification.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-white">{notification.title}</p>
                    {!notification.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald" aria-label="Unread" /> : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{notification.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>{notification.category}</span>
                    <span>{formatTimestamp(notification.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-muted">No notifications in this category.</div>
          )}
        </div>
      </aside>
    </>
  );
}
