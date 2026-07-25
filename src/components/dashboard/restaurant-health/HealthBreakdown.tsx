import Card from "@/components/cards/Card";
import {
  colorClasses,
  getScoreColor,
  healthBreakdown,
} from "@/components/dashboard/restaurant-health/restaurantHealthData";

export default function HealthBreakdown() {
  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Health Breakdown</h2>
        <p className="mt-1 text-sm text-muted">Score contribution by category</p>
      </div>

      <ul className="space-y-4">
        {healthBreakdown.map((item) => {
          const color = getScoreColor(item.score);
          const colors = colorClasses[color];

          return (
            <li key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-white">{item.label}</span>
                <span className="text-muted">
                  {item.percentage}%
                  <span className={`ml-2 font-semibold ${colors.text}`}>
                    ({item.score})
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-emerald/20 bg-emerald/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-light">
          Weighted Total
        </p>
        <p className="mt-1 text-2xl font-bold text-white">92 / 100</p>
        <p className="mt-1 text-xs text-muted">
          Calculated from weighted category contributions
        </p>
      </div>
    </Card>
  );
}
