"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function SearchBar({ value, onChange, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      >
        🔍
      </span>
      <input
        type="search"
        placeholder="Search restaurants, menu items..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-4 pl-10 text-sm text-white placeholder:text-muted outline-none transition-all duration-200 focus:border-emerald/50 focus:ring-2 focus:ring-emerald/20"
      />
    </div>
  );
}
