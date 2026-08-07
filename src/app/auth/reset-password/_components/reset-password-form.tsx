"use client";

import { AuthCard } from "@/components/shared/auth/auth-card";
import { PasswordInput } from "@/components/shared/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const { error } = await createClient().auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully");
      setDone(true);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  if (done) {
    return (
      <AuthCard>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your password has been updated successfully. You can now login with
            your new password.
          </p>

          <Button className={"w-full"}>
            <Link href={"/auth/login"}>Sign in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              placeholder="********"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="reset-confirm-password">
              Confirm New Password
            </FieldLabel>
            <PasswordInput
              id="reset-confirm-password"
              autoComplete="new-password"
              placeholder="********"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button type="submit" className={"w-full"} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating Password....
              </>
            ) : (
              <>Reset Password</>
            )}
          </Button>

          <Button variant={"ghost"} className={"w-full"}>
            <Link
              href={"/auth/login"}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Sign in
            </Link>
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
