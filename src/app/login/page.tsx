import AuthLayout from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login — DinePulse",
  description: "Sign in to your DinePulse account",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your restaurant dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
}
