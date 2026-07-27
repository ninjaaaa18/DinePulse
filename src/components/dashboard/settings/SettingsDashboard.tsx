"use client";

import { useEffect, useState } from "react";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { updateRestaurant } from "@/lib/supabase";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function SettingsDashboard() {
  const { user, restaurant, loading: authLoading, signOut, refreshRestaurant } = useAuth();
  const { notify } = useNotifications();
  const { theme, setTheme } = useTheme();

  // Editable restaurant state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [aiSummaries, setAiSummaries] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when restaurant loads
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setDescription(restaurant.description || "");
      setAddress(restaurant.address || "");
      setCuisine(restaurant.cuisine || "Multi-Cuisine");
      setDeliveryTime(restaurant.delivery_time || "20–30 min");
    }
  }, [restaurant]);

  // Load local settings preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinepulse.preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(parsed.theme);
        if (typeof parsed.emailAlerts === "boolean") setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.stockAlerts === "boolean") setStockAlerts(parsed.stockAlerts);
        if (typeof parsed.aiSummaries === "boolean") setAiSummaries(parsed.aiSummaries);
        if (typeof parsed.soundAlerts === "boolean") setSoundAlerts(parsed.soundAlerts);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const ownerName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Restaurant Owner";

  const email = user?.email || restaurant?.email || "owner@dinepulse.com";

  const isGoogleAccount =
    user?.app_metadata?.provider === "google" ||
    user?.identities?.some((id) => id.provider === "google");

  async function handleSaveChanges() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Save local preferences
      const preferences = {
        theme,
        emailAlerts,
        stockAlerts,
        aiSummaries,
        soundAlerts,
      };
      localStorage.setItem("dinepulse.preferences", JSON.stringify(preferences));

      // Save editable restaurant fields to Supabase if restaurant exists
      if (restaurant?.id) {
        const { error } = await updateRestaurant(restaurant.id, {
          name: name.trim(),
          description: description.trim(),
          address: address.trim(),
          cuisine: cuisine.trim(),
          delivery_time: deliveryTime.trim(),
        });

        if (error) {
          throw new Error(error.message || "Failed to update restaurant profile in Supabase.");
        }

        await refreshRestaurant();
      }

      setSaveSuccess(true);
      notify({
        icon: "✓",
        title: "Settings updated",
        description: "Your restaurant profile and preferences have been saved.",
        category: "Restaurant",
        severity: "success",
        dedupeKey: `settings-save-${Date.now()}`,
      });

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save changes.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-emerald">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
          <span className="text-sm font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
          Configuration
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurant Settings
        </h1>
        <p className="max-w-3xl text-sm text-muted">
          Manage your operational profile, owner account details, notification triggers, and interface preferences.
        </p>
      </header>

      {saveSuccess ? (
        <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-sm text-emerald-light flex items-center justify-between">
          <span>✓ Settings and restaurant profile saved successfully!</span>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 flex items-center justify-between">
          <span>⚠️ {saveError}</span>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Section 1: Restaurant Profile (Editable) */}
        <Card hover className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Profile
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Restaurant Information</h2>
            <p className="mt-1 text-xs text-muted">
              Update details displayed on your digital menu and order receipts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="restaurantName" className="block text-xs font-medium text-muted">
                Restaurant Name
              </label>
              <input
                id="restaurantName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North Harbor Kitchen"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="restaurantDesc" className="block text-xs font-medium text-muted">
                Restaurant Description
              </label>
              <textarea
                id="restaurantDesc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of your culinary concept..."
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="restaurantAddress" className="block text-xs font-medium text-muted">
                Restaurant Address
              </label>
              <input
                id="restaurantAddress"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 104 Harbour Way, Suite 2B, Seattle, WA"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="restaurantCuisine" className="block text-xs font-medium text-muted">
                  Cuisine Category
                </label>
                <input
                  id="restaurantCuisine"
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Modern Bistro"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-xs font-medium text-muted">
                  Delivery Time Estimate
                </label>
                <input
                  id="deliveryTime"
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="e.g. 20–30 min"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Account & Authentication Info */}
        <Card hover className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Account
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Owner & Auth Details</h2>
            <p className="mt-1 text-xs text-muted">
              Authenticated user credentials and identity providers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Owner Name</span>
                <span className="text-sm font-semibold text-white">{ownerName}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-muted">Email Address</span>
                <span className="text-sm font-medium text-white">{email}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted mb-2">Authentication Method</p>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-xl">
                    {isGoogleAccount ? "🌐" : "✉️"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {isGoogleAccount ? "Google OAuth Account" : "Email & Password Account"}
                    </p>
                    <p className="text-xs text-muted">
                      {isGoogleAccount ? "Signed in with Google Single Sign-On" : "Standard email credential authentication"}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isGoogleAccount
                      ? "border-emerald/30 bg-emerald/15 text-emerald-light"
                      : "border-sky-500/30 bg-sky-500/15 text-sky-300"
                  }`}
                >
                  {isGoogleAccount ? "Google Verified" : "Active"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-muted leading-relaxed">
                Your account is connected to Supabase Auth. Any profile changes made here persist directly to your PostgreSQL cloud instance.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: Notification Preferences */}
        <Card hover className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Notifications
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Alert Preferences</h2>
            <p className="mt-1 text-xs text-muted">
              Choose which operational alerts trigger real-time notifications.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "emailAlerts",
                label: "Email Order Alerts",
                detail: "Receive automated summary emails for new orders",
                checked: emailAlerts,
                setter: setEmailAlerts,
              },
              {
                id: "stockAlerts",
                label: "Low Stock Inventory Alerts",
                detail: "Notify when ingredient stock falls below reorder threshold",
                checked: stockAlerts,
                setter: setStockAlerts,
              },
              {
                id: "aiSummaries",
                label: "Daily AI Operational Summaries",
                detail: "Receive morning AI predictions and inventory forecasts",
                checked: aiSummaries,
                setter: setAiSummaries,
              },
              {
                id: "soundAlerts",
                label: "Sound Notifications",
                detail: "Play chime when a new customer order arrives",
                checked: soundAlerts,
                setter: setSoundAlerts,
              },
            ].map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{toggle.label}</p>
                  <p className="text-xs text-muted mt-0.5">{toggle.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle.setter(!toggle.checked)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggle.checked ? "bg-emerald" : "bg-white/10"
                  }`}
                  role="switch"
                  aria-checked={toggle.checked}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      toggle.checked ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 4: Interface & Theme Preference */}
        <Card hover className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
              Appearance
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Theme Preference</h2>
            <p className="mt-1 text-xs text-muted">
              Customize dashboard visual styling and contrast mode.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "dark", label: "Dark Mode", icon: "🌙" },
                { id: "system", label: "System Default", icon: "💻" },
                { id: "light", label: "Light Mode", icon: "☀️" },
              ].map((opt) => {
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as "system" | "dark" | "light")}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                      active
                        ? "border-emerald/40 bg-emerald/15 text-emerald-light shadow-lg shadow-emerald/10"
                        : "border-white/5 bg-white/[0.02] text-muted hover:border-white/15 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted text-center pt-2">
              DinePulse is optimized for Dark Mode with high-contrast accessibility.
            </p>
          </div>
        </Card>
      </div>

      {/* Section 5: Save & Sign Out Action Bar */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Save Changes & Profile Sync</h3>
          <p className="text-xs text-muted mt-0.5">
            Persist your updated restaurant profile, address, and alert settings to Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void signOut()}
            className="whitespace-nowrap border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          >
            🚪 Sign Out
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => void handleSaveChanges()}
            disabled={isSaving}
            className="whitespace-nowrap"
          >
            {isSaving ? "Saving..." : "✓ Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
