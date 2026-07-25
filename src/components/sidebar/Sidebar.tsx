"use client";

import { useState } from "react";
import Link from "next/link";
import SidebarItem from "@/components/sidebar/SidebarItem";
import { sidebarLinks } from "@/components/sidebar/sidebarLinks";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);

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
        className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-white/5 bg-surface transition-all duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <div
          className={`flex h-16 items-center border-b border-white/5 px-4 ${
            collapsed ? "justify-center" : "gap-2"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-white"
            onClick={onMobileClose}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald text-sm">
              🍽️
            </span>
            {!collapsed && <span>DinePulse</span>}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard">
          {sidebarLinks.map((link) => (
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
