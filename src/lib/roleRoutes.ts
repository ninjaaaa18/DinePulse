import type { UserRole } from "./userRole";

const OWNER_PATHS = new Set([
  "/dashboard",
  "/dashboard/inventory",
  "/dashboard/analytics",
  "/dashboard/restaurant-health",
  "/dashboard/ai-predictions",
  "/dashboard/ai-copilot",
  "/dashboard/settings",
]);

const CUSTOMER_PATHS = new Set([
  "/dashboard",
  "/dashboard/browse-restaurants",
  "/dashboard/order-food",
  "/dashboard/my-orders",
  "/dashboard/customer-health",
  "/dashboard/allergy-safety",
  "/dashboard/settings",
]);

const SHARED_PATHS = new Set<string>();

export function getDefaultPathForRole(role: UserRole): string {
  return role === "owner" ? "/dashboard" : "/dashboard";
}

export function isPathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (SHARED_PATHS.has(pathname)) return true;

  if (role === "owner") {
    return OWNER_PATHS.has(pathname);
  }

  return CUSTOMER_PATHS.has(pathname);
}

export function getRedirectForUnauthorizedPath(pathname: string, role: UserRole): string | null {
  if (isPathAllowedForRole(pathname, role)) {
    return null;
  }

  return getDefaultPathForRole(role);
}
