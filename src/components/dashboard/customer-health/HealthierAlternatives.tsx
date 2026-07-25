import Card from "@/components/cards/Card";
import { healthierAlternatives } from "@/components/dashboard/customer-health/customerHealthData";

export default function HealthierAlternatives() {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Healthier Alternatives</h2>
        <p className="mt-1 text-sm text-muted">
          Smart swaps to boost your meal health score
        </p>
      </div>

      <ul className="space-y-4">
        {healthierAlternatives.map((alt) => (
          <li
            key={alt.id}
            className="rounded-xl border border-white/5 bg-gradient-to-r from-emerald/5 to-transparent p-5 transition-all duration-200 hover:border-emerald/25 hover:shadow-lg hover:shadow-emerald/5"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <span className="text-xl">{alt.replaceEmoji}</span>
                  <span className="text-sm font-medium text-white line-through opacity-60">
                    {alt.replace}
                  </span>
                </div>

                <span className="text-emerald-light" aria-hidden="true">
                  ↓
                </span>

                <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald/10 px-4 py-2.5">
                  <span className="text-xl">{alt.alternativeEmoji}</span>
                  <span className="text-sm font-medium text-emerald-light">
                    {alt.alternative}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <span className="text-xs text-muted">Health Score</span>
                <span className="text-sm font-bold text-muted">{alt.scoreBefore}</span>
                <span className="text-emerald-light">→</span>
                <span className="text-sm font-bold text-emerald-light">
                  {alt.scoreAfter}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
