import { AuthLayout } from "@/components/shared/auth/auth-layout";
import { SignupForm } from "./_components/signup-from";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start organizing your AI work in minutes"
    >
      <SignupForm />
    </AuthLayout>
  );
}
