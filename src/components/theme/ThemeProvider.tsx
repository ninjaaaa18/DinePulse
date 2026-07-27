"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "system" | "dark" | "light";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
};

const STORAGE_KEY = "dinepulse.theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
        setThemeState(stored);
      }
    } catch {
      // Fallback
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const computedResolved: "dark" | "light" =
      theme === "system" ? getSystemTheme() : theme;

    setResolvedTheme(computedResolved);

    root.classList.remove("light", "dark");
    root.classList.add(computedResolved);
    root.setAttribute("data-theme", computedResolved);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextResolved = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(nextResolved);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextResolved);
      document.documentElement.setAttribute("data-theme", nextResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
