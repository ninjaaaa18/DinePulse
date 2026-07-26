export type SidebarLink = {
  label: string;
  href: string;
  icon: string;
};

export const sidebarLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Order Food", href: "/dashboard/order-food", icon: "🍽️" },
  { label: "Restaurant Health", href: "/dashboard/restaurant-health", icon: "🏥" },
  { label: "Customer Health", href: "/dashboard/customer-health", icon: "🥗" },
  { label: "Allergy Safety", href: "/dashboard/allergy-safety", icon: "🛡️" },
  { label: "Inventory", href: "/dashboard/inventory", icon: "📦" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📈" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];
