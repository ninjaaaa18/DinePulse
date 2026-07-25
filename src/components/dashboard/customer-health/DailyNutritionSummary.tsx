import Card from "@/components/cards/Card";
import { dailyNutritionSummary } from "@/components/dashboard/customer-health/customerHealthData";

export default function DailyNutritionSummary() {
  const { caloriesConsumed, caloriesGoal, proteinGoal, waterGoal } =
    dailyNutritionSummary;

  const caloriesRemaining = caloriesGoal - caloriesConsumed;
  const caloriesProgress = Math.round((caloriesConsumed / caloriesGoal) * 100);
  const proteinProgress = Math.round(
    (proteinGoal.current / proteinGoal.target) * 100,
  );
  const waterProgress = Math.round(
    (waterGoal.current / waterGoal.target) * 100,
  );

  return (
    <Card className="relative h-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald/10 via-transparent to-emerald/5"
        aria-hidden="true"
      />

      <div className="relative">
        <h2 className="text-lg font-semibold text-white">Daily Nutrition Summary</h2>
        <p className="mt-1 text-sm text-muted">Your progress toward daily goals</p>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Calories Consumed
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {caloriesConsumed.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-muted">kcal</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Remaining</p>
                <p className="text-lg font-bold text-emerald-light">
                  {caloriesRemaining.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald-light transition-all duration-700"
                style={{ width: `${caloriesProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {caloriesProgress}% of {caloriesGoal.toLocaleString()} kcal daily goal
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💪</span>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Protein Goal
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {proteinGoal.current}
                <span className="text-sm font-normal text-muted">
                  {" "}
                  / {proteinGoal.target}
                  {proteinGoal.unit}
                </span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-light"
                  style={{ width: `${proteinProgress}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💧</span>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Water Goal
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {waterGoal.current}
                <span className="text-sm font-normal text-muted">
                  {" "}
                  / {waterGoal.target} {waterGoal.unit}
                </span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${waterProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
