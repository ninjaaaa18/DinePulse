export const dashboardStats = [
  {
    title: "Restaurant Health Score",
    value: "92%",
    change: "+4.2%",
    trend: "up" as const,
    icon: "🏥",
  },
  {
    title: "Customer Meal Health",
    value: "87%",
    change: "+2.1%",
    trend: "up" as const,
    icon: "🥗",
  },
  {
    title: "Orders Today",
    value: "248",
    change: "+18%",
    trend: "up" as const,
    icon: "📋",
  },
  {
    title: "Revenue",
    value: "₹12,480",
    change: "+12.5%",
    trend: "up" as const,
    icon: "💰",
  },
  {
    title: "Customer Satisfaction",
    value: "4.8/5",
    change: "+0.3",
    trend: "up" as const,
    icon: "⭐",
  },
  {
    title: "Food Waste",
    value: "3.2%",
    change: "1.1% less",
    trend: "up" as const,
    icon: "♻️",
  },
];

export const recentActivity = [
  {
    id: 1,
    action: "Health score updated",
    detail: "Kitchen hygiene audit passed — score 94%",
    time: "2 min ago",
    icon: "✅",
  },
  {
    id: 2,
    action: "Allergy alert resolved",
    detail: "Peanut allergen flagged and removed from order #1842",
    time: "15 min ago",
    icon: "🛡️",
  },
  {
    id: 3,
    action: "New order placed",
    detail: "Table 12 — 3 items, wellness score 91%",
    time: "28 min ago",
    icon: "🛒",
  },
  {
    id: 4,
    action: "Inventory low",
    detail: "Organic spinach below threshold — reorder suggested",
    time: "1 hr ago",
    icon: "📦",
  },
  {
    id: 5,
    action: "AI recommendation applied",
    detail: "Menu item sodium levels optimized for 2 dishes",
    time: "2 hrs ago",
    icon: "🤖",
  },
];

export const aiRecommendations = [
  {
    id: 1,
    title: "Reduce sodium in pasta dishes",
    description:
      "AI detected 23% higher sodium than industry average. Consider alternative seasonings.",
    priority: "High",
    icon: "🧂",
  },
  {
    id: 2,
    title: "Promote high-wellness meals",
    description:
      "Grilled salmon bowl has 96% wellness score — feature it as today's special.",
    priority: "Medium",
    icon: "🐟",
  },
  {
    id: 3,
    title: "Schedule deep clean",
    description:
      "Health score trend suggests scheduling kitchen deep clean within 5 days.",
    priority: "Medium",
    icon: "🧹",
  },
];

export const revenueChartData = [
  { day: "Mon", value: 68 },
  { day: "Tue", value: 82 },
  { day: "Wed", value: 75 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 78 },
];
