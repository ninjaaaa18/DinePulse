"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

const iconSizeMap = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const first = parts[0] || "";
  return first.slice(0, 2).toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const avatarColors = [
  "bg-emerald/20 text-emerald-light",
  "bg-sky-500/20 text-sky-300",
  "bg-violet-500/20 text-violet-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-indigo-500/20 text-indigo-300",
  "bg-pink-500/20 text-pink-300",
];

function getColor(name: string): string {
  return avatarColors[hashCode(name) % avatarColors.length];
}

export default function Avatar({ src, alt = "", name, size = "md", className = "" }: Props) {
  const [imgError, setImgError] = useState(false);
  const resolvedName = name || alt || "User";
  const showImage = src && !imgError;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt || resolvedName}
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${sizeMap[size]} ${className}`}
      />
    );
  }

  return (
    <span
      className={`shrink-0 flex items-center justify-center rounded-full font-semibold ${sizeMap[size]} ${getColor(resolvedName)} ${className}`}
      aria-label={alt || resolvedName}
    >
      {getInitials(resolvedName)}
    </span>
  );
}
