"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { type UserRole } from "@/lib/userRole";
import { getDefaultPathForRole } from "@/lib/roleRoutes";

type ExperienceOption = {
  role: UserRole;
  title: string;
  icon: string;
  description: string;
  features: string[];
};

const experienceOptions: ExperienceOption[] = [
  {
    role: "owner",
    title: "Restaurant Owner",
    icon: "🏢",
    description: "Manage restaurant operations",
    features: [
      "Inventory Management",
      "AI Predictions",
      "Analytics",
      "Restaurant Health",
    ],
  },
  {
    role: "customer",
    title: "Customer",
    icon: "🍽",
    description: "Discover and order from restaurants",
    features: [
      "Browse Restaurants",
      "Order Food",
      "Customer Health Analysis",
      "Allergy Safety",
      "Track Orders",
    ],
  },
];

export default function ChooseExperiencePage() {
  const router = useRouter();
  const { user, loading, roleLoading, role, setRole } = useAuth();
  const [savingRole, setSavingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!user && !loading && !roleLoading) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, loading, roleLoading, router]);

  useEffect(() => {
    if (role && !loading && !roleLoading) {
      setRedirecting(true);
      router.replace(getDefaultPathForRole(role));
    }
  }, [role, loading, roleLoading, router]);

  if (loading || roleLoading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald/20 border-t-emerald" />
          <p className="text-sm font-medium text-muted">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (role) {
    return null;
  }

  async function handleSelect(nextRole: UserRole) {
    setError(null);
    setSavingRole(nextRole);

    try {
      await setRole(nextRole);
      router.replace(getDefaultPathForRole(nextRole));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your experience choice.");
      setSavingRole(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald text-2xl shadow-lg shadow-emerald/20">
            🍽️
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
            Welcome to DinePulse
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose Your Experience
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted">
            How would you like to use DinePulse today? You can switch between owner and customer
            modes anytime from Settings.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {experienceOptions.map((option) => {
            const isSaving = savingRole === option.role;

            return (
              <button
                key={option.role}
                type="button"
                disabled={Boolean(savingRole)}
                onClick={() => void handleSelect(option.role)}
                className="group flex flex-col rounded-3xl border border-white/10 bg-surface p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-xl hover:shadow-emerald/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/15 text-3xl">
                    {option.icon}
                  </span>
                  <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald-light">
                    {isSaving ? "Setting up..." : "Select"}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <h2 className="text-2xl font-bold text-white">{option.title}</h2>
                  <p className="text-sm text-muted">{option.description}</p>
                </div>

                <ul className="mt-6 space-y-3">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/90">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-xs text-emerald">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted">
          Signed in as {user.email}. One Google account works for both experiences.
        </p>
      </div>
    </div>
  );
}
