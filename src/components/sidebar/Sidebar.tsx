"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SidebarItem from "@/components/sidebar/SidebarItem";
import { getSidebarLinks } from "@/components/sidebar/sidebarLinks";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleIcon, getRoleLabel } from "@/lib/userRole";
import Avatar from "@/components/ui/Avatar";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { role, user, restaurant } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!role || !mounted) return null;

  const links = getSidebarLinks(role);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-white/[0.06] bg-surface/95 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-sm opacity-30" aria-hidden="true" />
        <div
          className={`relative flex h-16 items-center border-b border-white/5 px-4 ${
            collapsed ? "justify-center" : "gap-2"
          }`}
        >
          <Link
            href={links[0]?.href ?? "/dashboard"}
            className="flex items-center gap-2 font-semibold text-white"
            onClick={onMobileClose}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald text-sm">
              🍽️
            </span>
            {!collapsed && <span>DinePulse</span>}
          </Link>
        </div>

        {!collapsed ? (
          <div className="border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <Avatar src={user?.user_metadata?.avatar_url} name={displayName} size="md" className="rounded-xl" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-emerald-light">
                  {getRoleIcon(role)} {getRoleLabel(role)}
                </p>
              </div>
            </div>
            {role === "owner" && restaurant?.name ? (
              <p className="truncate text-xs text-muted border-t border-white/5 pt-2 mt-1">{restaurant.name}</p>
            ) : null}
          </div>
        ) : null}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard">
          {links.map((link) => (
            <SidebarItem
              key={link.href}
              {...link}
              collapsed={collapsed}
              onNavigate={onMobileClose}
            />
          ))}
        </nav>

        <div className="hidden border-t border-white/5 p-3 lg:block">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "← Collapse"}
          </button>
        </div>
      </aside>
    </>
  );
}
