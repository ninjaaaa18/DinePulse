import Card from "@/components/cards/Card";
import { weeklyTrendData } from "@/components/dashboard/restaurant-health/restaurantHealthData";

export default function WeeklyTrendChart() {
  const width = 400;
  const height = 160;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const scores = weeklyTrendData.map((d) => d.score);
  const minScore = Math.min(...scores) - 5;
  const maxScore = Math.max(...scores) + 5;

  const points = weeklyTrendData.map((item, index) => {
    const x =
      padding.left + (index / (weeklyTrendData.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((item.score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, ...item };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Weekly Trend</h2>
          <p className="mt-1 text-sm text-muted">Health score over the past 7 days</p>
        </div>
        <span className="rounded-lg bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
          +6 pts this week
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height + 24}`}
          className="w-full"
          aria-label="Weekly health score trend chart"
          role="img"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + chartHeight * ratio}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath} fill="url(#areaGradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.day}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#09090b"
                stroke="#34d399"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={height + 18}
                textAnchor="middle"
                fill="#a1a1aa"
                fontSize="11"
              >
                {point.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-muted">Week Average</p>
          <p className="text-lg font-bold text-white">89.3</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Peak Day</p>
          <p className="text-lg font-bold text-emerald-light">Sun — 92</p>
        </div>
      </div>
    </Card>
  );
}
