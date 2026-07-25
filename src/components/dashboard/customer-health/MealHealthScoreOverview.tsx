import Card from "@/components/cards/Card";
import {
  mealHealthScore,
  macroSummary,
} from "@/components/dashboard/customer-health/customerHealthData";

export default function MealHealthScoreOverview() {
  const { score, maxScore, status, statusEmoji } = mealHealthScore;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald/5 via-transparent to-emerald/10"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-8 xl:flex-row xl:items-center">
        <div className="relative flex shrink-0 items-center justify-center">
          <svg
            width="220"
            height="220"
            viewBox="0 0 200 200"
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="url(#mealScoreGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="mealScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted">Meal Health Score</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-white">
              {score}
              <span className="text-2xl font-normal text-muted">/{maxScore}</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-light">
              {statusEmoji} {status}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:flex-1">
          {macroSummary.map((macro) => (
            <div
              key={macro.label}
              className="rounded-xl border border-white/5 bg-white/[0.03] bg-gradient-to-br from-white/[0.04] to-transparent px-4 py-3.5 transition-colors hover:border-emerald/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{macro.icon}</span>
                <p className="text-xs font-medium text-muted">{macro.label}</p>
              </div>
              <p className="mt-1.5 text-lg font-bold text-white">
                {macro.value}
                {macro.unit && (
                  <span className="ml-0.5 text-xs font-normal text-muted">
                    {macro.unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
