"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import DashboardNavbar from "@/components/navbar/DashboardNavbar";
import { ActiveOrderProvider } from "@/components/dashboard/ActiveOrderProvider";
import { NotificationProvider } from "@/components/dashboard/NotificationProvider";
import { ToastProvider } from "@/components/ui/Toast";
import AICopilotWidget from "@/components/dashboard/AICopilotWidget";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRedirectForUnauthorizedPath } from "@/lib/roleRoutes";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading, roleLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || roleLoading || !user) return;

    if (!role) {
      router.replace("/onboarding/choose-experience");
      return;
    }

    const redirectTo = getRedirectForUnauthorizedPath(pathname, role);
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [loading, roleLoading, user, role, pathname, router]);

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald/20 border-t-emerald" />
          <p className="text-sm font-medium text-muted">Loading DinePulse Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  const unauthorizedRedirect = getRedirectForUnauthorizedPath(pathname, role);
  if (unauthorizedRedirect) {
    return null;
  }

  return (
    <NotificationProvider>
      <ActiveOrderProvider>
        <ToastProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardNavbar onMenuToggle={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in-up">{children}</main>
          </div>
          {role === "owner" ? <AICopilotWidget /> : null}
        </div>
        </ToastProvider>
      </ActiveOrderProvider>
    </NotificationProvider>
  );
}
