import { supabase } from "./client";
import { upsertRestaurant } from "./db";
import type { RestaurantRow } from "./types";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures an authenticated user has a linked Restaurant profile.
 * Automatically creates one if it does not exist yet.
 */
export async function getOrCreateRestaurantForUser(
  user: User
): Promise<{ data: RestaurantRow | null; error: Error | null }> {
  try {
    // 1. Try finding existing restaurant by user_id
    const { data: existingByUser } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingByUser) {
      return { data: existingByUser, error: null };
    }

    // 2. Fall back to email lookup if created prior to auth link
    if (user.email) {
      const { data: existingByEmail } = await supabase
        .from("restaurants")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (existingByEmail) {
        // Link user_id to existing profile
        const { data: updated } = await supabase
          .from("restaurants")
          .update({ user_id: user.id })
          .eq("id", existingByEmail.id)
          .select()
          .single();

        return { data: updated || existingByEmail, error: null };
      }
    }

    // 3. Link user to primary production restaurant ("Urban Burger")
    const { data: primaryRest } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", "urban-burger")
      .maybeSingle();

    if (primaryRest) {
      const { data: updated } = await supabase
        .from("restaurants")
        .update({ user_id: user.id })
        .eq("id", primaryRest.id)
        .select()
        .single();

      return { data: updated || primaryRest, error: null };
    }

    // Fallback: Create Urban Burger with deterministic UUID if missing
    const newRestaurant = {
      id: "11111111-1111-4111-a111-111111111111",
      user_id: user.id,
      name: "Urban Burger",
      slug: "urban-burger",
      email: user.email ?? null,
      cuisine: "Burgers & Fast Food",
      description: "Gourmet handcrafted burgers with crispy sides and signature dips.",
      delivery_time: "15–22 min",
      logo: "🍔",
      health_score: 92,
      is_active: true,
    };

    const { data: created, error: createErr } = await upsertRestaurant(newRestaurant);
    if (createErr) {
      console.warn("[Auth Sync] Failed to create restaurant profile:", createErr.message);
      return { data: null, error: new Error(createErr.message) };
    }

    return { data: created, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

/**
 * Sign in with Email and Password.
 */
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with Email, Password, and Name.
 */
export async function signUpWithEmail(email: string, password: string, name: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        name,
      },
    },
  });
}

/**
 * Resolve the base URL for OAuth redirects.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL (explicitly set for production)
 *  2. window.location.origin (works in both dev and prod)
 *  3. Empty string fallback
 */
function getOAuthRedirectOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/**
 * Sign in / Sign up using Google OAuth.
 */
export async function signInWithGoogle() {
  const origin = getOAuthRedirectOrigin();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
}

/**
 * Sign out current user session.
 */
export async function signOut() {
  return await supabase.auth.signOut();
}
