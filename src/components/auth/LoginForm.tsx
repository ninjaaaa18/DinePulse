"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await signInWithEmail(email, password);
      if (authError) {
        setError(authError.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@restaurant.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
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
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        <span aria-hidden="true">G</span>
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
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
