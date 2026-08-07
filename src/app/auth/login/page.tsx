import { AuthLayout } from "@/components/shared/auth/auth-layout";
import LoginForm from "./_components/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your workspace to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}
