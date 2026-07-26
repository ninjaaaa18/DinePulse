import Card from "@/components/cards/Card";
import { aiRecommendations } from "@/components/dashboard/dashboardData";

export type RecommendationItem = {
  id: string | number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | string;
  icon: string;
};

type AIRecommendationsProps = {
  items?: RecommendationItem[];
};

const priorityStyles: Record<string, string> = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-emerald/10 text-emerald-light",
};

export default function AIRecommendations({ items }: AIRecommendationsProps) {
  const displayItems = items && items.length > 0 ? items : aiRecommendations;

  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🤖
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
          <p className="mt-0.5 text-sm text-muted">
            Smart suggestions to improve your restaurant
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {displayItems.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-emerald/20 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles[item.priority] || priorityStyles.Medium}`}
              >
                {item.priority}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

