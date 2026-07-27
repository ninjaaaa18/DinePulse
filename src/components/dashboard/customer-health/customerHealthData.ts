export type NutrientStatus = "good" | "moderate" | "warning" | "critical";
export type InsightType = "positive" | "warning" | "info";

export const statusLabels: Record<NutrientStatus, string> = {
  good: "On Track",
  moderate: "Moderate",
  warning: "Above Limit",
  critical: "Below Target",
};

export const statusColors: Record<NutrientStatus, string> = {
  good: "text-emerald-light",
  moderate: "text-amber-400",
  warning: "text-orange-400",
  critical: "text-red-400",
};

export const statusDots: Record<NutrientStatus, string> = {
  good: "bg-emerald-light",
  moderate: "bg-amber-400",
  warning: "bg-orange-400",
  critical: "bg-red-400",
};

export const insightStyles: Record<InsightType, string> = {
  positive: "border-emerald/20 bg-emerald/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  info: "border-white/10 bg-white/[0.02]",
};

export const warningStyles: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/5",
  critical: "border-red-500/30 bg-red-500/5",
};

export function getNutrientProgress(current: number, recommended: number): number {
  return Math.min(Math.round((current / recommended) * 100), 100);
}
