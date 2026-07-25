"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginForm() {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@restaurant.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-end">
        <a
          href="#"
          className="text-sm text-emerald-light transition-colors hover:text-emerald"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full rounded-xl">
        Login
      </Button>

      <div className="relative flex items-center py-2">
        <div className="flex-1 border-t border-white/10" />
        <span className="px-4 text-xs text-muted">or</span>
        <div className="flex-1 border-t border-white/10" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full rounded-xl"
      >
        <span aria-hidden="true">G</span>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-emerald-light transition-colors hover:text-emerald"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
