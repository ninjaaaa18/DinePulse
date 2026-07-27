"use client";

import Card from "@/components/cards/Card";
import { insightStyles } from "@/components/dashboard/customer-health/customerHealthData";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";

export default function AIMealAnalysis() {
  const { activeOrder } = useActiveOrder();

  const totalProtein = activeOrder
    ? activeOrder.items.reduce((acc, i) => acc + i.protein * i.quantity, 0)
    : 0;
  const totalSugar = activeOrder
    ? activeOrder.items.reduce((acc, i) => acc + i.sugar * i.quantity, 0)
    : 0;

  const insights = activeOrder
    ? [
        {
          id: 1,
          message: totalProtein > 25 ? `Excellent protein intake (${totalProtein}g) for muscle recovery.` : `Protein intake recorded at ${totalProtein}g.`,
          type: totalProtein > 25 ? ("positive" as const) : ("info" as const),
          icon: "💪",
        },
        {
          id: 2,
          message: totalSugar > 25 ? `Sugar (${totalSugar}g) is above the recommended 25g limit.` : `Sugar intake (${totalSugar}g) is within healthy bounds.`,
          type: totalSugar > 25 ? ("warning" as const) : ("positive" as const),
          icon: "🍬",
        },
        {
          id: 3,
          message: `Order placed with ${activeOrder.items.length} item${activeOrder.items.length === 1 ? "" : "s"} from ${activeOrder.selectedRestaurantName} (${activeOrder.restaurantCuisine}).`,
          type: "info" as const,
          icon: "🍱",
        },
        {
          id: 4,
          message: `Meal health score calculated at ${activeOrder.averageMealScore}/100.`,
          type: "positive" as const,
          icon: "🏋️",
        },
      ]
    : [];

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🤖
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Meal Analysis</h2>
          <p className="text-sm text-muted">
            {activeOrder ? `Intelligent nutrition insights for your ${activeOrder.items.map((i) => i.name).slice(0, 2).join(" & ")} order` : "Intelligent nutrition insights for your meal"}
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <li
              key={insight.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors duration-200 hover:border-emerald/30 ${insightStyles[insight.type]}`}
            >
              <span className="text-lg">{insight.icon}</span>
              <p className="text-sm leading-relaxed text-white/90">{insight.message}</p>
            </li>
          ))
        ) : (
          <li className="sm:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-muted">
            No active order loaded for AI meal analysis.
          </li>
        )}
      </ul>
    </Card>
  );
}
