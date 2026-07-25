import AuthLayout from "@/components/layout/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up — DinePulse",
  description: "Create your DinePulse account",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start monitoring restaurant health and customer wellness"
    >
      <SignupForm />
    </AuthLayout>
  );
}
