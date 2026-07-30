import { type ReactNode } from "react";
import Link from "next/link";

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-surface to-background p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <Link href="/" className="relative z-10 flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-sm">
            🍽️
          </span>
          DinePulse
        </Link>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div
            className="absolute inset-0 animate-pulse-glow"
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/20 blur-[140px]" />
          </div>
          <div className="relative text-center">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-3xl border border-white/[0.12] bg-glass text-7xl shadow-2xl shadow-black/20">
              🍽️
            </div>
            <p className="mt-8 text-xl font-medium text-white">
              Smarter dining starts here
            </p>
            <p className="mt-2 max-w-sm text-muted">
              Monitor health scores, track customer wellness, and keep every meal
              allergy-safe — powered by AI.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-sm text-muted">
          Trusted by 500+ restaurants worldwide
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-sm">
                🍽️
              </span>
              DinePulse
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-muted">{subtitle}</p>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
