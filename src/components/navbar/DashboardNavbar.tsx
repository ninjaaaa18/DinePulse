"use client";

import { useState } from "react";
import SearchBar from "@/components/navbar/SearchBar";

type Props = {
  onMenuToggle: () => void;
};

export default function DashboardNavbar({ onMenuToggle }: Props) {
  const [search, setSearch] = useState("");
  const [notifications] = useState(3);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
        onClick={onMenuToggle}
      >
        ☰
      </button>

      <SearchBar
        value={search}
        onChange={setSearch}
        className="hidden flex-1 max-w-md sm:block"
      />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all duration-200 hover:border-emerald/30 hover:bg-emerald/10"
          aria-label={`${notifications} notifications`}
        >
          🔔
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-[10px] font-bold text-white">
              {notifications}
            </span>
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-1.5 transition-all duration-200 hover:border-emerald/30 hover:bg-emerald/10"
          aria-label="Profile menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald/20 text-sm">
            👤
          </span>
          <span className="hidden text-sm font-medium text-white sm:block">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
}
