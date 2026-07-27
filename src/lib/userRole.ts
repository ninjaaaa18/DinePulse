import { supabase } from "./supabase/client";

export type UserRole = "owner" | "customer";

const STORAGE_PREFIX = "dinepulse.userRole";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}.${userId}`;
}

export function getRoleLabel(role: UserRole): string {
  return role === "owner" ? "Restaurant Owner" : "Customer";
}

export function getRoleIcon(role: UserRole): string {
  return role === "owner" ? "🏢" : "🍽";
}

export function getStoredUserRole(userId: string): UserRole | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(getStorageKey(userId));
    if (value === "owner" || value === "customer") {
      return value;
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

export function setStoredUserRole(userId: string, role: UserRole): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(getStorageKey(userId), role);
  } catch {
    // Ignore storage errors
  }
}

export async function fetchUserRoleFromSupabase(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data?.role) return null;

    const role = data.role;
    if (role === "owner" || role === "customer") {
      return role;
    }
  } catch {
    // Profiles table may not exist yet — fall back to local storage
  }

  return null;
}

export async function saveUserRoleToSupabase(userId: string, role: UserRole): Promise<void> {
  try {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch {
    // Profiles table may not exist yet — local storage remains the source of truth
  }
}

export async function loadUserRole(userId: string): Promise<UserRole | null> {
  const fromDb = await fetchUserRoleFromSupabase(userId);
  if (fromDb) {
    setStoredUserRole(userId, fromDb);
    return fromDb;
  }

  return getStoredUserRole(userId);
}

export async function saveUserRole(userId: string, role: UserRole): Promise<void> {
  setStoredUserRole(userId, role);
  await saveUserRoleToSupabase(userId, role);
}
