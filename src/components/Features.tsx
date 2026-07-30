const features = [
  {
    icon: "📊",
    title: "Restaurant Health Score",
    description:
      "Real-time health scoring based on hygiene standards, food safety compliance, and operational metrics — giving owners actionable insights at a glance.",
  },
  {
    icon: "🥗",
    title: "Customer Meal Health",
    description:
      "AI analyzes every meal for nutritional value, calorie content, and wellness impact — empowering customers to make informed dining choices.",
  },
  {
    icon: "🛡️",
    title: "Allergy & Dietary Safety",
    description:
      "Automatic detection of allergens and dietary restrictions with instant alerts — keeping every customer safe and every meal compliant.",
  },
  {
    icon: "🤖",
    title: "AI Business Insights",
    description:
      "Predictive analytics and smart recommendations help restaurant owners optimize menus, reduce waste, and boost customer satisfaction.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.03] via-transparent to-emerald/[0.02]" />
        <div className="absolute inset-0 bg-grid-lg opacity-40" />
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/20 blur-[160px] animate-glow-pulse" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald/10 blur-[140px]" />
        <div className="absolute bottom-1/3 left-0 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Everything you need to run a healthier restaurant
          </h2>
          <p className="mt-4 text-lg text-muted">
            Powerful tools for restaurant owners and wellness-focused diners,
            unified in one intelligent platform.
          </p>
        </header>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative rounded-2xl border border-white/[0.06] bg-surface p-8 shadow-lg shadow-black/10 transition-all duration-500 hover:-translate-y-2 hover:border-emerald/30 hover:shadow-2xl hover:shadow-emerald/20 overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald/20 via-transparent to-emerald/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-emerald/15 blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald/[0.12] text-2xl shadow-inner shadow-emerald/5 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald/20 group-hover:shadow-lg group-hover:shadow-emerald/10">
                {feature.icon}
              </div>
              <h3 className="relative text-xl font-semibold text-white transition-colors duration-300 group-hover:text-emerald-light">
                {feature.title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
