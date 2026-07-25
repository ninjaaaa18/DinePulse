import Card from "@/components/cards/Card";
import { revenueChartData } from "@/components/dashboard/dashboardData";

export default function RevenueChart() {
  const maxValue = Math.max(...revenueChartData.map((d) => d.value));

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Revenue Chart</h2>
          <p className="mt-1 text-sm text-muted">Weekly revenue overview</p>
        </div>
        <span className="rounded-lg bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
          +12.5% this week
        </span>
      </div>

      <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-4">
        {revenueChartData.map((item) => (
          <div
            key={item.day}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <div className="relative flex w-full justify-center">
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-dark to-emerald transition-all duration-300 group-hover:from-emerald to-emerald-light"
                style={{ height: `${(item.value / maxValue) * 160}px` }}
              />
            </div>
            <span className="text-xs text-muted">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-muted">Total Revenue</p>
          <p className="text-xl font-bold text-white">$12,480</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Avg. Daily</p>
          <p className="text-xl font-bold text-white">$1,783</p>
        </div>
      </div>
    </Card>
  );
}
