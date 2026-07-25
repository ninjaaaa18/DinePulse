import Card from "@/components/cards/Card";
import {
  getNutrientProgress,
  statusColors,
  statusDots,
  statusLabels,
  type NutrientStatus,
} from "@/components/dashboard/customer-health/customerHealthData";

type Props = {
  label: string;
  icon: string;
  current: number;
  recommended: number;
  unit: string;
  status: NutrientStatus;
  gradient: string;
  accent: string;
  bar: string;
};

export default function NutritionBreakdownCard({
  label,
  icon,
  current,
  recommended,
  unit,
  status,
  gradient,
  accent,
  bar,
}: Props) {
  const progress = getNutrientProgress(current, recommended);

  return (
    <Card
      hover
      className={`relative overflow-hidden bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <p className="text-sm font-semibold text-white">{label}</p>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusDots[status]}`}
          aria-label={statusLabels[status]}
        />
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <p className={`text-2xl font-bold ${accent}`}>
          {current.toLocaleString()}
        </p>
        <p className="text-sm text-muted">{unit}</p>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">Recommended</span>
          <span className="text-muted">
            {recommended.toLocaleString()} {unit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className={`mt-3 text-xs font-medium ${statusColors[status]}`}>
        {statusLabels[status]}
      </p>
    </Card>
  );
}
