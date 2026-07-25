import Card from "@/components/cards/Card";
import {
  healthWarnings,
  warningStyles,
} from "@/components/dashboard/customer-health/customerHealthData";

export default function HealthWarningsPanel() {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Health Warnings</h2>
        <p className="mt-1 text-sm text-muted">
          Issues detected in your current meal selection
        </p>
      </div>

      <ul className="space-y-3">
        {healthWarnings.map((warning) => (
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
        ))}
      </ul>
    </Card>
  );
}
