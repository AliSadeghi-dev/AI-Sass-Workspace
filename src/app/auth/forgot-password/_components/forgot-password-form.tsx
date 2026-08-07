"use client";

import { AuthCard } from "@/components/shared/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        },
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset link sent to your email");
      setSent(true);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  if (sent) {
    return (
      <AuthCard>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            If an account exists for
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
            we sent a reset password link . check your inbox.
          </p>

          <Button variant={"outline"} className={"w-full"}>
            <Link href={"/auth/reset-password"}>
              Continue to reset password
            </Link>
          </Button>

          <Button variant={"ghost"} className={"w-full"}>
            <Link href={"/auth/login"}>
              <ArrowLeft className="size-4" />
              Back to Sign in
            </Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Button type="submit" className={"w-full"} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending Link....
              </>
            ) : (
              <>Send Reset Link</>
            )}
          </Button>

          <Button variant={"ghost"} className={"w-full flex"}>
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
