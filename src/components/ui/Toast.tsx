"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (message: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-md ${
              t.type === "success"
                ? "border-emerald/30 bg-emerald/20 text-emerald-light"
                : t.type === "error"
                  ? "border-rose-500/30 bg-rose-500/20 text-rose-200"
                  : "border-white/10 bg-surface/80 text-white"
            }`}
          >
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="ml-2 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
