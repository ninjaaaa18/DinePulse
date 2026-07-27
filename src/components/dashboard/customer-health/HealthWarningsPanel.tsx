"use client";

import Card from "@/components/cards/Card";
import { warningStyles } from "@/components/dashboard/customer-health/customerHealthData";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";

export default function HealthWarningsPanel() {
  const { activeOrder } = useActiveOrder();

  const totalSugar = activeOrder
    ? activeOrder.items.reduce((acc, i) => acc + i.sugar * i.quantity, 0)
    : 0;
  const totalSodium = activeOrder
    ? activeOrder.items.reduce((acc, i) => acc + i.sodium * i.quantity, 0)
    : 0;
  const totalFiber = activeOrder
    ? activeOrder.items.reduce((acc, i) => acc + (i.carbohydrates > 30 ? 6 : 3) * i.quantity, 0)
    : 0;

  const allergensInOrder = activeOrder
    ? Array.from(new Set(activeOrder.items.flatMap((i) => i.allergens.filter((a) => a !== "None"))))
    : [];

  const warnings = activeOrder
    ? [
        ...(totalSugar > 25
          ? [
              {
                id: "sugar",
                title: "High Sugar",
                icon: "⚠",
                severity: "warning" as const,
                explanation: `This meal contains ${totalSugar}g of sugar — above the recommended 25g target limit.`,
              },
            ]
          : []),
        ...(totalSodium > 1000
          ? [
              {
                id: "sodium",
                title: "High Sodium",
                icon: "⚠",
                severity: "warning" as const,
                explanation: `Sodium levels at ${totalSodium}mg exceed single-meal intake guidance.`,
              },
            ]
          : []),
        ...(totalFiber < 10
          ? [
              {
                id: "fiber",
                title: "Low Fiber",
                icon: "⚠",
                severity: "critical" as const,
                explanation: `Only ${totalFiber}g of fiber detected in meal items — below the 15g target.`,
              },
            ]
          : []),
        ...(allergensInOrder.length > 0
          ? [
              {
                id: "allergen",
                title: "Allergen Flagged",
                icon: "🛡️",
                severity: "warning" as const,
                explanation: `Order contains allergens: ${allergensInOrder.join(", ")}. Verify dietary profile.`,
              },
            ]
          : []),
      ]
    : [];

  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Health Warnings</h2>
        <p className="mt-1 text-sm text-muted">
          {activeOrder ? `Issues detected in your ${activeOrder.items.map((i) => i.name).slice(0, 2).join(" & ")} selection` : "Issues detected in your current meal selection"}
        </p>
      </div>

      <ul className="space-y-3">
        {warnings.length > 0 ? (
          warnings.map((warning) => (
            <li
              key={warning.id}
              className={`rounded-xl border p-4 transition-colors duration-200 hover:border-opacity-60 ${warningStyles[warning.severity]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                    warning.severity === "critical"
                      ? "bg-red-500/10"
                      : "bg-amber-500/10"
                  }`}
                >
                  {warning.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{warning.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {warning.explanation}
                  </p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-emerald/20 bg-emerald/5 p-4 text-sm text-emerald">
            {activeOrder ? "No major health warnings flagged for this meal selection." : "No active order to screen for health warnings."}
          </li>
        )}
      </ul>
    </Card>
  );
}
