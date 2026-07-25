"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import DashboardNavbar from "@/components/navbar/DashboardNavbar";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
