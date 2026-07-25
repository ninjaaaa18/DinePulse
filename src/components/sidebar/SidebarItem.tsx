"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarLink } from "@/components/sidebar/sidebarLinks";

type Props = SidebarLink & {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export default function SidebarItem({
  label,
  href,
  icon,
  collapsed = false,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-emerald/15 text-emerald-light"
          : "text-muted hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
