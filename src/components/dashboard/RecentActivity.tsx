import Card from "@/components/cards/Card";
import { recentActivity } from "@/components/dashboard/dashboardData";

export default function RecentActivity() {
  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <p className="mt-1 text-sm text-muted">Latest updates from your restaurant</p>
      </div>

      <ul className="space-y-4">
        {recentActivity.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-base">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{item.action}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{item.detail}</p>
            </div>
            <time className="shrink-0 text-xs text-muted">{item.time}</time>
          </li>
        ))}
      </ul>
    </Card>
  );
}
