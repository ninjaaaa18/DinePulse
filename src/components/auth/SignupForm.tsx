"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupForm() {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <Input
        label="Name"
        type="text"
        name="name"
        placeholder="John Doe"
        autoComplete="name"
        required
      />
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
        autoComplete="new-password"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Button type="submit" className="w-full rounded-xl">
        Create Account
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-light transition-colors hover:text-emerald"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
