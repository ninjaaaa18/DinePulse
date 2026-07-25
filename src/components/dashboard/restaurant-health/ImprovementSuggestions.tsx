import Card from "@/components/cards/Card";
import {
  improvementSuggestions,
  priorityStyles,
} from "@/components/dashboard/restaurant-health/restaurantHealthData";

export default function ImprovementSuggestions() {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Improvement Suggestions</h2>
        <p className="mt-1 text-sm text-muted">
          Actionable recommendations to boost your health score
        </p>
      </div>

      <ul className="space-y-3">
        {improvementSuggestions.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-emerald/20 hover:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-lg">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles[item.priority]}`}
                >
                  {item.priority}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
