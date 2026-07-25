import Card from "@/components/cards/Card";
import { selectedMeal } from "@/components/dashboard/customer-health/customerHealthData";

export default function SelectedMealCard() {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald">
              Selected Meal
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">Your Order</h2>
          </div>
          <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-light">
            Analyzed
          </span>
        </div>

        <ul className="space-y-3">
          {selectedMeal.items.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-emerald/20 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-emerald/5 text-xl">
                {item.emoji}
              </span>
              <span className="font-medium text-white">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-6 sm:grid-cols-3">
          {[
            { label: "Total Calories", value: `${selectedMeal.totalCalories} kcal` },
            { label: "Protein", value: selectedMeal.protein },
            { label: "Fat", value: selectedMeal.fat },
            { label: "Sugar", value: selectedMeal.sugar },
            { label: "Fiber", value: selectedMeal.fiber },
            {
              label: "Meal Cost",
              value: selectedMeal.cost,
              highlight: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl px-3 py-2.5 ${
                stat.highlight
                  ? "border border-emerald/20 bg-emerald/5 sm:col-span-1"
                  : "bg-white/[0.02]"
              }`}
            >
              <p className="text-xs text-muted">{stat.label}</p>
              <p
                className={`mt-0.5 font-semibold ${
                  stat.highlight ? "text-emerald-light" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
