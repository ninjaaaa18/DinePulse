import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
};

export default function Card({ children, className = "", hover = false, glow = false, glass = false }: Props) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        glass
          ? "border-white/[0.12] bg-glass shadow-xl shadow-black/15"
          : "border-white/[0.06] bg-surface card-premium shadow-lg shadow-black/15"
      } ${
        hover
          ? "transition-all duration-500 hover:-translate-y-2 hover:border-emerald/30 hover:shadow-2xl hover:shadow-emerald/20"
          : ""
      } ${
        glow ? "hover:shadow-2xl hover:shadow-emerald/20" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
