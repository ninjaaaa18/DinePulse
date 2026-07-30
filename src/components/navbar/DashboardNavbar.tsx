"use client";

import { useState } from "react";
import SearchBar from "@/components/navbar/SearchBar";
import NotificationDrawer from "@/components/navbar/NotificationDrawer";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleIcon, getRoleLabel } from "@/lib/userRole";
import Avatar from "@/components/ui/Avatar";

type Props = {
  onMenuToggle: () => void;
};

export default function DashboardNavbar({ onMenuToggle }: Props) {
  const [search, setSearch] = useState("");
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, restaurant, role, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-glass px-4 shadow-lg shadow-black/10 sm:px-6">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
        onClick={onMenuToggle}
      >
        ☰
      </button>

      <SearchBar
        value={search}
        onChange={setSearch}
        className="hidden flex-1 max-w-md sm:block"
      />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all duration-200 hover:border-emerald/30 hover:bg-emerald/10"
          aria-label={`${unreadCount} notifications`}
          onClick={() => setNotificationDrawerOpen(true)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-1.5 transition-all duration-200 hover:border-emerald/30 hover:bg-emerald/10"
            aria-label="Profile menu"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Avatar
              src={user?.user_metadata?.avatar_url}
              name={displayName}
              size="sm"
              className="rounded-lg"
            />
            <span className="hidden sm:block">
              <span className="block max-w-[140px] truncate text-sm font-medium text-white">
                {displayName}
              </span>
              {role ? (
                <span className="block text-[11px] text-emerald-light">
                  {getRoleIcon(role)} {getRoleLabel(role)}
                </span>
              ) : null}
            </span>
          </button>

          {profileOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-xl backdrop-blur-xl z-50">
              <div className="px-3 py-2 text-xs border-b border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar src={user?.user_metadata?.avatar_url} name={displayName} size="sm" />
                  <p className="font-semibold text-white truncate">{displayName}</p>
                </div>
                {role ? (
                  <p className="mt-1 text-emerald-light">
                    {getRoleIcon(role)} {getRoleLabel(role)}
                  </p>
                ) : null}
                {role === "owner" && restaurant?.name ? (
                  <p className="mt-1 text-muted truncate">{restaurant.name}</p>
                ) : null}
                <p className="mt-1 text-muted truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                🚪 Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <NotificationDrawer open={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
    </header>
  );
}
