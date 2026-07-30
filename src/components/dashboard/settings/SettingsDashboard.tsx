"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import { useToast } from "@/components/ui/Toast";
import { updateRestaurant, createPartnerApplication, getPartnerApplicationByUserId } from "@/lib/supabase";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getDefaultPathForRole } from "@/lib/roleRoutes";
import { getRoleIcon, getRoleLabel, saveUserRole } from "@/lib/userRole";
import type { UserRole } from "@/lib/userRole";
import type { PartnerApplicationRow, PartnerApplicationStatus } from "@/lib/supabase/types";

function ToggleSwitch({ checked, onChange, label, detail }: { checked: boolean; onChange: () => void; label: string; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-muted mt-0.5">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-emerald" : "bg-white/10"}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ThemeSelector({ theme, setTheme }: { theme: string; setTheme: (t: "system" | "dark" | "light") => void }) {
  return (
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
  );
}

function RoleSwitchSection({ currentRole, onSwitch }: { currentRole: UserRole; onSwitch: (role: UserRole) => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const otherRole: UserRole = currentRole === "owner" ? "customer" : "owner";

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Experience</p>
        <h2 className="mt-1 text-lg font-bold text-white">Current Experience</h2>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/15 text-2xl">
          {getRoleIcon(currentRole)}
        </span>
        <div>
          <p className="text-lg font-bold text-white">{getRoleLabel(currentRole)}</p>
          <p className="text-xs text-muted">
            {currentRole === "owner" ? "Managing your restaurant operations" : "Exploring restaurants and ordering food"}
          </p>
        </div>
      </div>

      {!showConfirm ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-xl"
        >
          🔄 Switch to {getRoleLabel(otherRole)}
        </Button>
      ) : (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-200">
            Switch to {getRoleLabel(otherRole)} experience?
          </p>
          <p className="text-xs text-amber-200/70">
            {otherRole === "owner"
              ? "You'll need a restaurant to manage. If you haven't set one up yet, you can do that after switching."
              : "You'll be able to browse restaurants and order food as a customer."}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              size="sm"
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onSwitch(otherRole)}
              className="rounded-xl"
            >
              Switch Now
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ApplicationStatusCard({ application }: { application: PartnerApplicationRow }) {
  const statusColors: Record<PartnerApplicationStatus, string> = {
    pending_review: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    approved: "border-emerald/30 bg-emerald/10 text-emerald-light",
    rejected: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };

  const statusLabels: Record<PartnerApplicationStatus, string> = {
    pending_review: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  const statusIcons: Record<PartnerApplicationStatus, string> = {
    pending_review: "⏳",
    approved: "✅",
    rejected: "❌",
  };

  const formattedDate = new Date(application.submitted_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="relative overflow-hidden">
      <div className="space-y-5">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
          application.status === "pending_review" ? "bg-amber-500/20" :
          application.status === "approved" ? "bg-emerald/20" : "bg-rose-500/20"
        }`}>
          {statusIcons[application.status]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Application Status</h2>
          <p className="mt-1 text-sm text-muted">{application.restaurant_name}</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusColors[application.status]}`}>
          <span>{statusIcons[application.status]}</span>
          <span>{statusLabels[application.status]}</span>
        </div>
        <div className="space-y-2 text-sm text-muted">
          <p>Submitted: {formattedDate}</p>
          {application.cuisine ? <p>Cuisine: {application.cuisine}</p> : null}
          {application.address ? <p>Location: {application.address}</p> : null}
        </div>
        {application.status === "pending_review" ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
            Our team will review your application and notify you once approved.
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function PartnerApplicationSection({ user, onRefresh }: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!restaurantName.trim()) { setError("Restaurant name is required."); return; }
    setSubmitting(true);
    setError(null);

    try {
      const { error: createErr } = await createPartnerApplication({
        user_id: user.id,
        restaurant_name: restaurantName.trim(),
        description: description.trim() || null,
        cuisine: category.trim() || null,
        address: address.trim() || null,
        status: "pending_review",
      });

      if (createErr) throw new Error(createErr.message || "Failed to submit application.");

      toast("Application submitted successfully.", "success");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card hover className="relative overflow-hidden border-emerald/20 bg-gradient-to-br from-emerald/5 to-transparent">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald/10 blur-3xl" />
        <div className="relative space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/20 text-3xl">
            🚀
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Become a Restaurant Partner</h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Manage your own restaurant using AI-powered analytics, inventory management, restaurant health monitoring and intelligent business insights.
            </p>
          </div>
          <ul className="space-y-2">
            {[
              "AI Predictions",
              "Inventory Management",
              "Restaurant Analytics",
              "Restaurant Health",
              "AI Copilot",
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-emerald-light">✓</span> {benefit}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => setShowModal(true)}
            className="w-full rounded-xl"
          >
            Start My Restaurant
          </Button>
        </div>
      </Card>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">🚀 Start Your Restaurant</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="rest-name" className="block text-xs font-medium text-muted mb-1.5">Restaurant Name *</label>
                <input
                  id="rest-name"
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. North Harbor Kitchen"
                  className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="rest-desc" className="block text-xs font-medium text-muted mb-1.5">Restaurant Description</label>
                <textarea
                  id="rest-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your restaurant concept..."
                  className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="rest-category" className="block text-xs font-medium text-muted mb-1.5">Restaurant Category</label>
                <select
                  id="rest-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white focus:border-emerald/40 focus:outline-none"
                >
                  <option value="" className="bg-surface">Select a category</option>
                  <option value="Burgers & Fast Food" className="bg-surface">Burgers & Fast Food</option>
                  <option value="Italian & Pizza" className="bg-surface">Italian & Pizza</option>
                  <option value="Indian & Curry" className="bg-surface">Indian & Curry</option>
                  <option value="Chinese & Asian" className="bg-surface">Chinese & Asian</option>
                  <option value="Mexican & Tex-Mex" className="bg-surface">Mexican & Tex-Mex</option>
                  <option value="Healthy & Salads" className="bg-surface">Healthy & Salads</option>
                  <option value="Cafe & Bakery" className="bg-surface">Cafe & Bakery</option>
                  <option value="Multi-Cuisine" className="bg-surface">Multi-Cuisine</option>
                </select>
              </div>

              <div>
                <label htmlFor="rest-address" className="block text-xs font-medium text-muted mb-1.5">Address / Location</label>
                <input
                  id="rest-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 104 Harbour Way, Seattle, WA"
                  className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={() => void handleSubmit()} disabled={submitting} className="flex-1 rounded-xl">
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CustomerSettings() {
  const { user, signOut, setRole, refreshRestaurant } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [dietaryPrefs, setDietaryPrefs] = useState("");
  const [allergies, setAllergies] = useState("");
  const [application, setApplication] = useState<PartnerApplicationRow | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const loadApplication = useCallback(async () => {
    if (!user) return;
    setAppLoading(true);
    try {
      const { data } = await getPartnerApplicationByUserId(user.id);
      setApplication(data);
    } catch {
      setApplication(null);
    } finally {
      setAppLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinepulse.customerPreferences");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.emailAlerts === "boolean") setEmailAlerts(p.emailAlerts);
        if (typeof p.promoAlerts === "boolean") setPromoAlerts(p.promoAlerts);
        if (p.dietaryPrefs) setDietaryPrefs(p.dietaryPrefs);
        if (p.allergies) setAllergies(p.allergies);
      }
    } catch {}
  }, []);

  function savePreferences() {
    localStorage.setItem("dinepulse.customerPreferences", JSON.stringify({
      theme, emailAlerts, promoAlerts, dietaryPrefs, allergies,
    }));
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  async function handleRoleSwitch(nextRole: UserRole) {
    if (!user) return;
    await setRole(nextRole);
    router.replace(getDefaultPathForRole(nextRole));
  }

  async function handleApprovedSwitch() {
    if (!user) return;
    if (!application) return;
    try {
      await saveUserRole(user.id, "owner");
      await refreshRestaurant();
      router.replace("/dashboard");
    } catch {
      // handle error silently
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Settings</p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Customer Settings</h1>
        <p className="max-w-3xl text-sm text-muted">Manage your profile, preferences, and account.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Profile</p>
            <h2 className="mt-1 text-lg font-bold text-white">Your Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.user_metadata?.avatar_url}
                name={displayName}
                size="lg"
                className="rounded-2xl"
              />
              <div>
                <p className="text-lg font-bold text-white">{displayName}</p>
                <p className="text-sm text-muted">{email}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Preferences</p>
            <h2 className="mt-1 text-lg font-bold text-white">App Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted mb-2">Theme</p>
              <ThemeSelector theme={theme} setTheme={setTheme} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-2">Notifications</p>
              <div className="space-y-2">
                <ToggleSwitch checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} label="Email Notifications" detail="Receive order confirmations and updates via email" />
                <ToggleSwitch checked={promoAlerts} onChange={() => setPromoAlerts(!promoAlerts)} label="Promotional Offers" detail="Get notified about deals and discounts" />
              </div>
            </div>
            <div>
              <label htmlFor="dietary-prefs" className="block text-xs font-medium text-muted mb-1.5">Dietary Preferences</label>
              <input
                id="dietary-prefs"
                type="text"
                value={dietaryPrefs}
                onChange={(e) => setDietaryPrefs(e.target.value)}
                placeholder="e.g. Vegetarian, Vegan, Keto"
                className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="allergies-input" className="block text-xs font-medium text-muted mb-1.5">Allergies</label>
              <input
                id="allergies-input"
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Peanuts, Gluten, Dairy"
                className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Account</p>
            <h2 className="mt-1 text-lg font-bold text-white">Account Settings</h2>
          </div>
          <div className="space-y-3">
            <button type="button" onClick={() => router.push("/dashboard/my-orders")} className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 text-left">
              <div>
                <p className="text-sm font-semibold text-white">📋 Order History</p>
                <p className="text-xs text-muted mt-0.5">View your past orders</p>
              </div>
              <span className="text-muted">→</span>
            </button>
            <button type="button" onClick={() => router.push("/dashboard/browse-restaurants")} className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 text-left">
              <div>
                <p className="text-sm font-semibold text-white">❤️ Saved Restaurants</p>
                <p className="text-xs text-muted mt-0.5">Browse your favorite restaurants</p>
              </div>
              <span className="text-muted">→</span>
            </button>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-sm font-semibold text-white">🔒 Privacy Settings</p>
              <p className="text-xs text-muted mt-0.5">Your data is handled securely. Manage preferences above.</p>
            </div>
          </div>
        </Card>

        {appLoading ? (
          <Card className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-emerald">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </Card>
        ) : application ? (
          <ApplicationStatusCard application={application} />
        ) : (
          <PartnerApplicationSection
            user={user!}
            onRefresh={() => {
              loadApplication();
              router.refresh();
            }}
          />
        )}
      </div>

      <RoleSwitchSection currentRole="customer" onSwitch={handleRoleSwitch} />

      {application?.status === "approved" ? (
        <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-light">Your application has been approved</p>
              <p className="text-xs text-muted mt-1">You can now switch to Restaurant Owner mode to start managing your restaurant.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleApprovedSwitch()}
              className="rounded-xl whitespace-nowrap"
            >
              Switch to Owner Mode
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface p-6">
        <div>
          <p className="text-sm font-semibold text-white">Save Changes</p>
          <p className="text-xs text-muted mt-0.5">Persist your preferences locally.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => void signOut()} className="whitespace-nowrap border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl">
            🚪 Sign Out
          </Button>
          <Button type="button" variant="primary" onClick={savePreferences} className="whitespace-nowrap rounded-xl">
            ✓ Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

function OwnerSettings() {
  const { user, restaurant, signOut, refreshRestaurant, setRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notify } = useNotifications();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [logo, setLogo] = useState("");

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [aiSummaries, setAiSummaries] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setDescription(restaurant.description || "");
      setCuisine(restaurant.cuisine || "");
      setAddress(restaurant.address || "");
      setPhone(restaurant.phone || "");
      setDeliveryTime(restaurant.delivery_time || "");
      setLogo(restaurant.logo || "");
    }
  }, [restaurant]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinepulse.ownerPreferences");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.theme) setTheme(p.theme);
        if (typeof p.emailAlerts === "boolean") setEmailAlerts(p.emailAlerts);
        if (typeof p.stockAlerts === "boolean") setStockAlerts(p.stockAlerts);
        if (typeof p.aiSummaries === "boolean") setAiSummaries(p.aiSummaries);
        if (typeof p.soundAlerts === "boolean") setSoundAlerts(p.soundAlerts);
      }
    } catch {}
  }, []);

  async function handleSaveChanges() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const preferences = { theme, emailAlerts, stockAlerts, aiSummaries, soundAlerts };
      localStorage.setItem("dinepulse.ownerPreferences", JSON.stringify(preferences));

      if (restaurant?.id) {
        const { error } = await updateRestaurant(restaurant.id, {
          name: name.trim(),
          description: description.trim(),
          cuisine: cuisine.trim(),
          address: address.trim(),
          phone: phone.trim() || null,
          delivery_time: deliveryTime.trim(),
          logo: logo.trim() || null,
        });
        if (error) throw new Error(error.message || "Failed to update restaurant.");
        await refreshRestaurant();
      }

      setSaveSuccess(true);
      notify({
        icon: "✓",
        title: "Settings updated",
        description: "Your restaurant profile and preferences have been saved.",
        category: "Orders",
        severity: "success",
        dedupeKey: `settings-save-${Date.now()}`,
      });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleSwitch(nextRole: UserRole) {
    if (!user) return;
    await setRole(nextRole);
    router.replace(getDefaultPathForRole(nextRole));
  }

  const ownerName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Owner";
  const email = user?.email || "";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Configuration</p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Restaurant Settings</h1>
        <p className="max-w-3xl text-sm text-muted">Manage your restaurant profile, operations, and preferences.</p>
      </header>

      {saveSuccess ? (
        <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-sm text-emerald-light flex items-center justify-between">
          <span>✓ Settings saved successfully!</span>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-xs opacity-75 hover:opacity-100">✕</button>
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 flex items-center justify-between">
          <span>⚠️ {saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Restaurant</p>
            <h2 className="mt-1 text-lg font-bold text-white">Restaurant Information</h2>
            <p className="mt-1 text-xs text-muted">Details displayed on your digital menu and orders.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="rest-name" className="block text-xs font-medium text-muted mb-1.5">Restaurant Name</label>
              <input id="rest-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North Harbor Kitchen" className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="rest-desc" className="block text-xs font-medium text-muted mb-1.5">Restaurant Description</label>
              <textarea id="rest-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of your culinary concept..." className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="rest-cuisine" className="block text-xs font-medium text-muted mb-1.5">Restaurant Category</label>
              <select id="rest-cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white focus:border-emerald/40 focus:outline-none">
                <option value="" className="bg-surface">Select a category</option>
                <option value="Burgers & Fast Food" className="bg-surface">Burgers & Fast Food</option>
                <option value="Italian & Pizza" className="bg-surface">Italian & Pizza</option>
                <option value="Indian & Curry" className="bg-surface">Indian & Curry</option>
                <option value="Chinese & Asian" className="bg-surface">Chinese & Asian</option>
                <option value="Mexican & Tex-Mex" className="bg-surface">Mexican & Tex-Mex</option>
                <option value="Healthy & Salads" className="bg-surface">Healthy & Salads</option>
                <option value="Cafe & Bakery" className="bg-surface">Cafe & Bakery</option>
                <option value="Multi-Cuisine" className="bg-surface">Multi-Cuisine</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Details</p>
            <h2 className="mt-1 text-lg font-bold text-white">Additional Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="rest-logo" className="block text-xs font-medium text-muted mb-1.5">Restaurant Logo (emoji)</label>
              <input id="rest-logo" type="text" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="e.g. 🍔" className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="rest-address" className="block text-xs font-medium text-muted mb-1.5">Address / Location</label>
              <input id="rest-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 104 Harbour Way, Seattle, WA" className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="rest-phone" className="block text-xs font-medium text-muted mb-1.5">Contact Number</label>
              <input id="rest-phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +1 (555) 123-4567" className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="rest-delivery" className="block text-xs font-medium text-muted mb-1.5">Delivery Time Estimate</label>
              <input id="rest-delivery" type="text" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="e.g. 20–30 min" className="w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none" />
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Notifications</p>
            <h2 className="mt-1 text-lg font-bold text-white">Alert Preferences</h2>
            <p className="mt-1 text-xs text-muted">Choose which alerts trigger notifications.</p>
          </div>
          <div className="space-y-2">
            <ToggleSwitch checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} label="Email Order Alerts" detail="Receive summary emails for new orders" />
            <ToggleSwitch checked={stockAlerts} onChange={() => setStockAlerts(!stockAlerts)} label="Low Stock Inventory Alerts" detail="Notify when stock falls below threshold" />
            <ToggleSwitch checked={aiSummaries} onChange={() => setAiSummaries(!aiSummaries)} label="Daily AI Summaries" detail="Morning predictions and forecasts" />
            <ToggleSwitch checked={soundAlerts} onChange={() => setSoundAlerts(!soundAlerts)} label="Sound Notifications" detail="Play chime when new order arrives" />
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Appearance</p>
            <h2 className="mt-1 text-lg font-bold text-white">Theme</h2>
          </div>
          <ThemeSelector theme={theme} setTheme={setTheme} />
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Staff</p>
            <h2 className="mt-1 text-lg font-bold text-white">Manage Staff</h2>
            <p className="mt-1 text-xs text-muted">Staff management coming soon.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <span className="text-3xl">👥</span>
            <p className="text-sm text-muted">Staff management is not yet available.</p>
            <p className="text-xs text-muted">You'll be able to add, remove, and manage staff here.</p>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Account</p>
            <h2 className="mt-1 text-lg font-bold text-white">Owner Account</h2>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Name</span>
              <span className="text-sm font-semibold text-white">{ownerName}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-xs text-muted">Email</span>
              <span className="text-sm font-medium text-white">{email}</span>
            </div>
          </div>
        </Card>
      </div>

      <RoleSwitchSection currentRole="owner" onSwitch={handleRoleSwitch} />

      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface p-6">
        <div>
          <p className="text-sm font-semibold text-white">Save Changes</p>
          <p className="text-xs text-muted mt-0.5">Persist restaurant profile and preferences to Supabase.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => void signOut()} className="whitespace-nowrap border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl">
            🚪 Sign Out
          </Button>
          <Button type="button" variant="primary" onClick={() => void handleSaveChanges()} disabled={isSaving} className="whitespace-nowrap rounded-xl">
            {isSaving ? "Saving..." : "✓ Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsDashboard() {
  const { role, loading: authLoading } = useAuth();

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

  if (role === "customer") return <CustomerSettings />;
  return <OwnerSettings />;
}
