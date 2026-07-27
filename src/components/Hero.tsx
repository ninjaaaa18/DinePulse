import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 pb-20"
    >
      <div
        className="pointer-events-none absolute inset-0 animate-pulse-glow"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-emerald/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-4 py-1.5 text-sm text-emerald-light">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-light" />
          AI-Powered Wellness Platform
        </div>

        <h1
          className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          AI-Powered Restaurant Health &{" "}
          <span className="bg-gradient-to-r from-emerald-light to-emerald bg-clip-text text-transparent">
            Customer Wellness
          </span>{" "}
          Platform
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Monitor restaurant performance, improve customer satisfaction, provide
          healthy meal insights, and ensure allergy-safe dining — all from one
          intelligent platform.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <Button href="/login" size="lg">
            Get Started
          </Button>
          <Button href="#features" variant="secondary" size="lg">
            Live Demo
          </Button>
        </div>

        <div
          className="animate-fade-in-up mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-10"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "98%", label: "Health Accuracy" },
            { value: "500+", label: "Restaurants" },
            { value: "50K+", label: "Meals Analyzed" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
