"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signUpWithEmail, signInWithGoogle } from "@/lib/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUpWithEmail(email, password, name);
      if (authError) {
        setError(authError.message);
      } else if (data?.user && !data.session) {
        setMessage("Account created! Please check your email to confirm your account.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
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

      {message ? (
        <div className="rounded-xl border border-emerald/20 bg-emerald/10 p-3 text-sm text-emerald-light">
          {message}
        </div>
      ) : null}

      <Input
        label="Name"
        type="text"
        name="name"
        placeholder="John Doe"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
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
