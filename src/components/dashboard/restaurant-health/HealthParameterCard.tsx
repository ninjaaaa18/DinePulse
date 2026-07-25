import Card from "@/components/cards/Card";
import {
  colorClasses,
  trendIcons,
  trendStyles,
  type ScoreColor,
  type Trend,
} from "@/components/dashboard/restaurant-health/restaurantHealthData";

type Props = {
  title: string;
  icon: string;
  score: number;
  trend: string;
  trendDirection: Trend;
  color: ScoreColor;
};

export default function HealthParameterCard({
  title,
  icon,
  score,
  trend,
  trendDirection,
  color,
}: Props) {
  const colors = colorClasses[color];

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-lg">
            {icon}
          </span>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className={`mt-0.5 text-2xl font-bold ${colors.text}`}>{score}</p>
          </div>
        </div>
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
          aria-label={`Status: ${color}`}
        />
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p
        className={`mt-3 flex items-center gap-0.5 text-xs font-medium ${trendStyles[trendDirection]}`}
      >
        {trendDirection !== "neutral" && (
          <span>{trendIcons[trendDirection]}</span>
        )}
        {trend}
      </p>
    </Card>
  );
}
