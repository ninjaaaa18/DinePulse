import Card from "@/components/cards/Card";
import {
  aiMealInsights,
  insightStyles,
} from "@/components/dashboard/customer-health/customerHealthData";

export default function AIMealAnalysis() {
  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🤖
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Meal Analysis</h2>
          <p className="text-sm text-muted">Intelligent nutrition insights for your meal</p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {aiMealInsights.map((insight) => (
          <li
            key={insight.id}
            className={`flex items-start gap-3 rounded-xl border p-4 transition-colors duration-200 hover:border-emerald/30 ${insightStyles[insight.type]}`}
          >
            <span className="text-lg">{insight.icon}</span>
            <p className="text-sm leading-relaxed text-white/90">{insight.message}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
