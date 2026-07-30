import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 pb-20"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Image
          src="/images/restaurants/spice-route.jpeg"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="absolute top-1/4 left-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/[0.15] blur-[180px] animate-glow-pulse" />
        <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-emerald/10 blur-[140px] animate-glow-drift" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
        <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-emerald-dark/10 blur-[100px] animate-breathe" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-emerald/10 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
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
          className="animate-fade-in-up mt-16 grid grid-cols-3 gap-8 rounded-2xl border border-emerald/10 bg-gradient-to-r from-emerald/[0.02] via-transparent to-emerald/[0.02] px-8 py-8"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "98%", label: "Health Accuracy" },
            { value: "500+", label: "Restaurants" },
            { value: "50K+", label: "Meals Analyzed" },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center ${i < 2 ? "border-r border-white/5" : ""}`}>
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
    </section>
  );
}
