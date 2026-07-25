import HealthScoreOverview from "@/components/dashboard/restaurant-health/HealthScoreOverview";
import HealthParameterCard from "@/components/dashboard/restaurant-health/HealthParameterCard";
import HealthInsightsPanel from "@/components/dashboard/restaurant-health/HealthInsightsPanel";
import ImprovementSuggestions from "@/components/dashboard/restaurant-health/ImprovementSuggestions";
import WeeklyTrendChart from "@/components/dashboard/restaurant-health/WeeklyTrendChart";
import HealthBreakdown from "@/components/dashboard/restaurant-health/HealthBreakdown";
import { healthParameters } from "@/components/dashboard/restaurant-health/restaurantHealthData";

export default function RestaurantHealthDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurant Health
        </h1>
        <p className="mt-1 text-muted">
          AI-powered health monitoring for your restaurant operations
        </p>
      </header>

      <section aria-label="Overall health score">
        <HealthScoreOverview />
      </section>

      <section aria-label="Health parameters">
        <h2 className="mb-4 text-lg font-semibold text-white">Health Parameters</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {healthParameters.map((param) => (
            <HealthParameterCard key={param.id} {...param} />
          ))}
        </div>
      </section>

      <section aria-label="Health insights">
        <HealthInsightsPanel />
      </section>

      <section
        aria-label="Trends and breakdown"
        className="grid gap-6 lg:grid-cols-2"
      >
        <WeeklyTrendChart />
        <HealthBreakdown />
      </section>

      <section aria-label="Improvement suggestions">
        <ImprovementSuggestions />
      </section>
    </div>
  );
}
