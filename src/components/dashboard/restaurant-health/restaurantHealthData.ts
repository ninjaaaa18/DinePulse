export type HealthStatus = "Excellent" | "Good" | "Fair" | "Poor";

export type Trend = "up" | "down" | "neutral";

export type ScoreColor = "emerald" | "green" | "amber" | "red";

export const overallHealth = {
  score: 92,
  maxScore: 100,
  status: "Excellent" as HealthStatus,
  statusEmoji: "🟢",
  lastUpdated: "Today, 2:45 PM",
  todayTrend: "+3.2%",
  todayTrendDirection: "up" as Trend,
  aiConfidence: "96%",
};

export const healthParameters = [
  {
    id: "customer-satisfaction",
    title: "Customer Satisfaction",
    icon: "⭐",
    score: 94,
    trend: "+8%",
    trendDirection: "up" as Trend,
    color: "emerald" as ScoreColor,
  },
  {
    id: "service-speed",
    title: "Service Speed",
    icon: "⚡",
    score: 88,
    trend: "+2%",
    trendDirection: "up" as Trend,
    color: "green" as ScoreColor,
  },
  {
    id: "inventory-health",
    title: "Inventory Health",
    icon: "📦",
    score: 91,
    trend: "Stable",
    trendDirection: "neutral" as Trend,
    color: "emerald" as ScoreColor,
  },
  {
    id: "staff-performance",
    title: "Staff Performance",
    icon: "👨‍🍳",
    score: 87,
    trend: "+5%",
    trendDirection: "up" as Trend,
    color: "green" as ScoreColor,
  },
  {
    id: "food-waste",
    title: "Food Waste",
    icon: "🍽",
    score: 85,
    trend: "-4%",
    trendDirection: "up" as Trend,
    color: "green" as ScoreColor,
  },
  {
    id: "sales-performance",
    title: "Sales Performance",
    icon: "💰",
    score: 93,
    trend: "+12%",
    trendDirection: "up" as Trend,
    color: "emerald" as ScoreColor,
  },
];

export const healthInsights = [
  {
    id: 1,
    message: "Customer satisfaction increased by 8%.",
    type: "positive" as const,
    icon: "📈",
  },
  {
    id: 2,
    message: "Food waste decreased by 4%.",
    type: "positive" as const,
    icon: "♻️",
  },
  {
    id: 3,
    message: "Peak hour detected between 7–9 PM.",
    type: "info" as const,
    icon: "⏰",
  },
  {
    id: 4,
    message: "Inventory healthy for next 3 days.",
    type: "info" as const,
    icon: "📦",
  },
];

export const improvementSuggestions = [
  {
    id: 1,
    title: "Reduce kitchen waiting time",
    description:
      "Average ticket time is 18 min during peak hours. Consider prep-ahead workflows.",
    priority: "High",
    icon: "⏱️",
  },
  {
    id: 2,
    title: "Increase staff during weekends",
    description:
      "Saturday service scores drop 6% due to understaffing. Add 2 team members.",
    priority: "Medium",
    icon: "👥",
  },
  {
    id: 3,
    title: "Restock vegetables tomorrow",
    description:
      "Organic spinach and bell peppers below threshold. Reorder by 10 AM.",
    priority: "Medium",
    icon: "🥬",
  },
];

export const weeklyTrendData = [
  { day: "Mon", score: 86 },
  { day: "Tue", score: 88 },
  { day: "Wed", score: 87 },
  { day: "Thu", score: 90 },
  { day: "Fri", score: 91 },
  { day: "Sat", score: 89 },
  { day: "Sun", score: 92 },
];

export const healthBreakdown = [
  { label: "Customer Satisfaction", percentage: 25, score: 94 },
  { label: "Inventory", percentage: 20, score: 91 },
  { label: "Staff", percentage: 15, score: 87 },
  { label: "Food Waste", percentage: 15, score: 85 },
  { label: "Sales", percentage: 15, score: 93 },
  { label: "Speed", percentage: 10, score: 88 },
];

export function getScoreColor(score: number): ScoreColor {
  if (score >= 90) return "emerald";
  if (score >= 80) return "green";
  if (score >= 70) return "amber";
  return "red";
}

export const colorClasses: Record<
  ScoreColor,
  { bar: string; dot: string; text: string }
> = {
  emerald: {
    bar: "bg-emerald",
    dot: "bg-emerald-light",
    text: "text-emerald-light",
  },
  green: {
    bar: "bg-green-500",
    dot: "bg-green-400",
    text: "text-green-400",
  },
  amber: {
    bar: "bg-amber-500",
    dot: "bg-amber-400",
    text: "text-amber-400",
  },
  red: {
    bar: "bg-red-500",
    dot: "bg-red-400",
    text: "text-red-400",
  },
};

export const trendStyles: Record<Trend, string> = {
  up: "text-emerald-light",
  down: "text-red-400",
  neutral: "text-muted",
};

export const trendIcons: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export const priorityStyles: Record<string, string> = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-emerald/10 text-emerald-light",
};

export const insightStyles: Record<string, string> = {
  positive: "border-emerald/20 bg-emerald/5",
  info: "border-white/10 bg-white/[0.02]",
  warning: "border-amber-500/20 bg-amber-500/5",
};
