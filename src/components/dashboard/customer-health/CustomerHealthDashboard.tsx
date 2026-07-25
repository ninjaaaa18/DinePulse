import MealHealthScoreOverview from "@/components/dashboard/customer-health/MealHealthScoreOverview";
import SelectedMealCard from "@/components/dashboard/customer-health/SelectedMealCard";
import NutritionBreakdownCard from "@/components/dashboard/customer-health/NutritionBreakdownCard";
import HealthWarningsPanel from "@/components/dashboard/customer-health/HealthWarningsPanel";
import HealthierAlternatives from "@/components/dashboard/customer-health/HealthierAlternatives";
import AIMealAnalysis from "@/components/dashboard/customer-health/AIMealAnalysis";
import NutritionRadarChart from "@/components/dashboard/customer-health/NutritionRadarChart";
import DailyNutritionSummary from "@/components/dashboard/customer-health/DailyNutritionSummary";
import { nutritionBreakdown } from "@/components/dashboard/customer-health/customerHealthData";

export default function CustomerHealthDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Customer Meal Health
        </h1>
        <p className="mt-1 text-muted">
          AI-powered nutritional analysis for your selected meal
        </p>
      </header>

      <section aria-label="Meal health score">
        <MealHealthScoreOverview />
      </section>

      <section
        aria-label="Meal details and daily summary"
        className="grid gap-6 lg:grid-cols-2"
      >
        <SelectedMealCard />
        <DailyNutritionSummary />
      </section>

      <section aria-label="Nutrition breakdown">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Nutrition Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nutritionBreakdown.map((nutrient) => (
            <NutritionBreakdownCard key={nutrient.id} {...nutrient} />
          ))}
        </div>
      </section>

      <section
        aria-label="Warnings and alternatives"
        className="grid gap-6 lg:grid-cols-2"
      >
        <HealthWarningsPanel />
        <HealthierAlternatives />
      </section>

      <section aria-label="AI meal analysis">
        <AIMealAnalysis />
      </section>

      <section aria-label="Nutrition chart">
        <NutritionRadarChart />
      </section>
    </div>
  );
}
