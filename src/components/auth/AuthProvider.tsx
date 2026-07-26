"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getOrCreateRestaurantForUser, signOut as supabaseSignOut, supabase } from "@/lib/supabase";
import type { RestaurantRow } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  restaurant: RestaurantRow | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRestaurant: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserRestaurant = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRestaurant(null);
      return;
    }

    try {
      const { data } = await getOrCreateRestaurantForUser(currentUser);
      setRestaurant(data);
    } catch (err) {
      console.warn("[AuthProvider] Failed to sync restaurant profile:", err);
    }
  }, []);

  const refreshRestaurant = useCallback(async () => {
    if (user) {
      await syncUserRestaurant(user);
    }
  }, [user, syncUserRestaurant]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(data.session);
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await syncUserRestaurant(currentUser);
        }
      } catch (err) {
        console.warn("[AuthProvider] Session fetch error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await syncUserRestaurant(nextUser);
      } else {
        setRestaurant(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncUserRestaurant]);

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setRestaurant(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        restaurant,
        loading,
        signOut,
        refreshRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
