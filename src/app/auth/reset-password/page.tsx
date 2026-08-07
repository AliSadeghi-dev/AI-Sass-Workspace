import { AuthLayout } from "@/components/shared/auth/auth-layout";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Choose a new password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
