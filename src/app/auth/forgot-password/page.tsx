import { AuthLayout } from "@/components/shared/auth/auth-layout";
import ForgotPasswordForm from "./_components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email and we will send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
