import StatCard from "@/components/cards/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import { dashboardStats } from "@/components/dashboard/dashboardData";

export const metadata = {
  title: "Dashboard — DinePulse",
  description: "Restaurant health and customer wellness dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted">
          Welcome back! Here&apos;s your restaurant overview for today.
        </p>
      </header>

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section
        aria-label="Analytics and activity"
        className="grid gap-6 lg:grid-cols-5"
      >
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </section>

      <section aria-label="AI recommendations">
        <AIRecommendations />
      </section>
    </div>
  );
}
