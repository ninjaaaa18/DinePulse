import Card from "@/components/cards/Card";
import { revenueChartData } from "@/components/dashboard/dashboardData";

type RevenueChartProps = {
  data?: Array<{ label: string; value: number }>;
  title?: string;
  subtitle?: string;
  highlight?: string;
  totalLabel?: string;
  totalValue?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
};

export default function RevenueChart({
  data,
  title = "Revenue Chart",
  subtitle = "Weekly revenue overview",
  highlight = "+12.5% this week",
  totalLabel = "Total Revenue",
  totalValue = "$12,480",
  secondaryLabel = "Avg. Daily",
  secondaryValue = "$1,783",
}: RevenueChartProps) {
  const chartData = data ?? revenueChartData.map((item) => ({ label: item.day, value: item.value }));
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <span className="rounded-lg bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
          {highlight}
        </span>
      </div>

      <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-4">
        {chartData.map((item) => (
          <div key={item.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full justify-center">
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-dark to-emerald transition-all duration-300 group-hover:from-emerald to-emerald-light"
                style={{ height: `${(item.value / maxValue) * 160}px` }}
              />
            </div>
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-muted">{totalLabel}</p>
          <p className="text-xl font-bold text-white">{totalValue}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">{secondaryLabel}</p>
          <p className="text-xl font-bold text-white">{secondaryValue}</p>
        </div>
      </div>
    </Card>
  );
}
