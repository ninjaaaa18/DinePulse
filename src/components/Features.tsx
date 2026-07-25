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
    <section id="features" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
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
              className="group rounded-2xl border border-white/5 bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/20 hover:bg-surface-hover hover:shadow-lg hover:shadow-emerald/5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-2xl transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
