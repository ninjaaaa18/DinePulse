const steps = [
  {
    icon: "🛒",
    title: "Customer Orders",
    description: "A customer places an order through your menu or app.",
  },
  {
    icon: "🔬",
    title: "Meal Analysis",
    description: "AI instantly analyzes ingredients, nutrition, and allergens.",
  },
  {
    icon: "💚",
    title: "Health Score",
    description: "Each meal receives a real-time wellness and safety score.",
  },
  {
    icon: "📈",
    title: "Restaurant Dashboard",
    description: "Owners view performance metrics and health trends live.",
  },
  {
    icon: "✨",
    title: "AI Recommendations",
    description: "Smart suggestions to improve menus, safety, and satisfaction.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header id="about" className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            From order to insight in seconds
          </h2>
          <p className="mt-4 text-lg text-muted">
            A seamless flow that connects customer wellness with restaurant
            intelligence.
          </p>
        </header>

        <div className="mt-16 hidden lg:block">
          <div className="relative flex items-start justify-between">
            <div
              className="absolute top-10 right-[10%] left-[10%] h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent"
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative flex w-[18%] flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-surface text-3xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald/30 group-hover:shadow-lg group-hover:shadow-emerald/10">
                  {step.icon}
                </div>
                <span className="mt-3 text-xs font-medium text-emerald">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 lg:hidden">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-surface p-5 transition-all duration-300 hover:border-emerald/20 hover:bg-surface-hover"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-xl">
                {step.icon}
              </div>
              <div>
                <span className="text-xs font-medium text-emerald">
                  Step {index + 1}
                </span>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <span
                  className="ml-auto hidden self-center text-emerald/40 sm:block"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
