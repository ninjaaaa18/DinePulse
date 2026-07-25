import Card from "@/components/cards/Card";
import { radarChartData } from "@/components/dashboard/customer-health/customerHealthData";

export default function NutritionRadarChart() {
  const cx = 160;
  const cy = 160;
  const maxRadius = 100;
  const levels = 4;
  const angleStep = (2 * Math.PI) / radarChartData.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const dataPoints = radarChartData.map((d, i) => getPoint(i, d.value));
  const polygonPath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")
    .concat(" Z");

  return (
    <Card className="relative h-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald/5 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mb-4">
        <h2 className="text-lg font-semibold text-white">Nutrition Chart</h2>
        <p className="mt-1 text-sm text-muted">
          Visual comparison of nutrient levels vs. optimal range
        </p>
      </div>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 320 320"
          className="h-auto w-full max-w-[320px]"
          aria-label="Nutrition radar chart"
          role="img"
        >
          <defs>
            <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {Array.from({ length: levels }, (_, level) => {
            const r = ((level + 1) / levels) * maxRadius;
            const points = radarChartData
              .map((_, i) => {
                const angle = angleStep * i - Math.PI / 2;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              })
              .join(" ");
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {radarChartData.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x2 = cx + maxRadius * Math.cos(angle);
            const y2 = cy + maxRadius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          <path
            d={polygonPath}
            fill="url(#radarFill)"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {dataPoints.map((point, i) => (
            <circle
              key={radarChartData[i].label}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#09090b"
              stroke="#34d399"
              strokeWidth="2"
            />
          ))}

          {radarChartData.map((item, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const labelRadius = maxRadius + 22;
            const x = cx + labelRadius * Math.cos(angle);
            const y = cy + labelRadius * Math.sin(angle);
            return (
              <text
                key={item.label}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#a1a1aa"
                fontSize="10"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {radarChartData.map((item) => (
          <span
            key={item.label}
            className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted"
          >
            {item.label}:{" "}
            <span className="font-medium text-emerald-light">{item.value}%</span>
          </span>
        ))}
      </div>
    </Card>
  );
}
