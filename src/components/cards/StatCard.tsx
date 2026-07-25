import Card from "@/components/cards/Card";

type Trend = "up" | "down" | "neutral";

type Props = {
  title: string;
  value: string;
  change?: string;
  trend?: Trend;
  icon: string;
};

const trendStyles: Record<Trend, string> = {
  up: "text-emerald-light",
  down: "text-red-400",
  neutral: "text-muted",
};

const trendIcons: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export default function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
}: Props) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-xl">
          {icon}
        </div>
        {change && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${trendStyles[trend]}`}
          >
            {trendIcons[trend]} {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
    </Card>
  );
}
