import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export default function Card({ children, className = "", hover = false }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-surface p-6 ${
        hover
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/20 hover:shadow-lg hover:shadow-emerald/5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
