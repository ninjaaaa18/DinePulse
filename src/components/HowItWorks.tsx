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
    <section id="how-it-works" className="relative px-6 py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald/[0.03] via-transparent to-emerald/[0.02]" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-emerald/15 blur-[140px] animate-glow-drift" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/10 blur-[100px] animate-breathe" />
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
              className="absolute top-10 right-[8%] left-[8%] h-0.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative flex w-[18%] flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/[0.12] bg-surface text-4xl shadow-xl shadow-black/20 ring-1 ring-white/[0.04] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald/40 group-hover:shadow-2xl group-hover:shadow-emerald/20 group-hover:ring-emerald/20">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-emerald/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
                  <span className="relative">{step.icon}</span>
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald">
                  Step {index + 1}
                </span>
                <h3 className="mt-2 text-base font-semibold text-white transition-colors duration-300 group-hover:text-emerald-light">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
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
              className="group relative flex items-start gap-5 rounded-2xl border border-white/[0.06] bg-surface p-6 shadow-lg shadow-black/10 transition-all duration-500 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-xl hover:shadow-emerald/10 overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald/15 blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald/[0.12] text-2xl shadow-inner shadow-emerald/5 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald/20 group-hover:shadow-lg group-hover:shadow-emerald/10">
                {step.icon}
              </div>
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald">
                  Step {index + 1}
                </span>
                <h3 className="font-semibold text-white transition-colors duration-300 group-hover:text-emerald-light">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <span
                  className="ml-auto hidden self-center text-emerald/50 sm:block"
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
