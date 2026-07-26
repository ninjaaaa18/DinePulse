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
    const { data: existingByUser, error: fetchErr } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr) {
      console.warn("[Auth Sync] Failed to query restaurant by user_id:", fetchErr.message);
    }

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

    // 3. Create default restaurant profile for new user
    const userFullName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "DinePulse Partner";

    const restaurantName = userFullName.toLowerCase().endsWith("restaurant")
      ? userFullName
      : `${userFullName}'s Kitchen`;

    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newRestaurant = {
      user_id: user.id,
      name: restaurantName,
      email: user.email ?? null,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      cuisine: "Multi-Cuisine",
      description: "Smart AI-driven restaurant powered by DinePulse.",
      delivery_time: "20–30 min",
      logo: "🍴",
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
 * Sign in / Sign up using Google OAuth.
 */
export async function signInWithGoogle() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
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
