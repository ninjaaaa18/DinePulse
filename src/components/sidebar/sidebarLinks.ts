import type { UserRole } from "@/lib/userRole";

export type SidebarLink = {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
};

export const sidebarLinks: SidebarLink[] = [
  { label: "Home", href: "/dashboard", icon: "🏠", roles: ["customer"] },
  { label: "Dashboard", href: "/dashboard", icon: "📊", roles: ["owner"] },
  { label: "Browse Restaurants", href: "/dashboard/browse-restaurants", icon: "🔍", roles: ["customer"] },
  { label: "Order Food", href: "/dashboard/order-food", icon: "🍽️", roles: ["customer"] },
  { label: "My Orders", href: "/dashboard/my-orders", icon: "📋", roles: ["customer"] },
  { label: "Customer Health", href: "/dashboard/customer-health", icon: "🥗", roles: ["customer"] },
  { label: "Health Challenges", href: "/dashboard/health-challenges", icon: "🏆", roles: ["customer"] },
  { label: "Allergy Safety", href: "/dashboard/allergy-safety", icon: "🛡️", roles: ["customer"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: "📦", roles: ["owner"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📈", roles: ["owner"] },
  { label: "Restaurant Health", href: "/dashboard/restaurant-health", icon: "🏥", roles: ["owner"] },
  { label: "AI Predictions", href: "/dashboard/ai-predictions", icon: "✦", roles: ["owner"] },
  { label: "AI Copilot", href: "/dashboard/ai-copilot", icon: "🤖", roles: ["owner"] },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️", roles: ["owner", "customer"] },
];

export function getSidebarLinks(role: UserRole): SidebarLink[] {
  return sidebarLinks.filter((link) => link.roles.includes(role));
}
