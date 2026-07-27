"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getOrCreateRestaurantForUser, signOut as supabaseSignOut, supabase } from "@/lib/supabase";
import type { RestaurantRow } from "@/lib/supabase";
import { loadUserRole, saveUserRole, type UserRole } from "@/lib/userRole";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  restaurant: RestaurantRow | null;
  role: UserRole | null;
  roleLoading: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRestaurant: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
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

  const syncUserRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRoleState(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    try {
      const savedRole = await loadUserRole(currentUser.id);
      setRoleState(savedRole);
    } catch (err) {
      console.warn("[AuthProvider] Failed to load user role:", err);
      setRoleState(null);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  const refreshRestaurant = useCallback(async () => {
    if (user) {
      await syncUserRestaurant(user);
    }
  }, [user, syncUserRestaurant]);

  const setRole = useCallback(async (nextRole: UserRole) => {
    if (!user) return;

    await saveUserRole(user.id, nextRole);
    setRoleState(nextRole);
  }, [user]);

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
          await Promise.all([
            syncUserRestaurant(currentUser),
            syncUserRole(currentUser),
          ]);
        } else {
          setRoleLoading(false);
        }
      } catch (err) {
        console.warn("[AuthProvider] Session fetch error:", err);
        if (isMounted) {
          setRoleLoading(false);
        }
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
        await Promise.all([
          syncUserRestaurant(nextUser),
          syncUserRole(nextUser),
        ]);
      } else {
        setRestaurant(null);
        setRoleState(null);
        setRoleLoading(false);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncUserRestaurant, syncUserRole]);

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setRestaurant(null);
    setRoleState(null);
    setRoleLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        restaurant,
        role,
        roleLoading,
        loading,
        signOut,
        refreshRestaurant,
        setRole,
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
