"use client";

import { AuthCard } from "@/components/shared/auth/auth-card";
import { GoogleAuthbutton } from "@/components/shared/auth/google-auth-button";
import { PasswordInput } from "@/components/shared/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createZodResolver } from "@/lib/resolvers";
import { createClient } from "@/lib/supabase/client";
import { LoginFormValues, loginSchema } from "@/lib/validation/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: createZodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { data, error } = await createClient().auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes("Email not Confirmed")) {
          toast.error("Email verification pending.", {
            description:
              "Please check your inbox and verify your email before logging in",
          });
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Logged in successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Link
                href={"/auth/forgot-password"}
                className="
            text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline
              "
              >
                Forgot password?
              </Link>
            </div>

            <PasswordInput
              id="login-password"
              placeholder="*********"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" className={"w-full"} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>Login</>
            )}
          </Button>

          <FieldSeparator>or continue with</FieldSeparator>
          <GoogleAuthbutton label="Continue with Google" />
          <p className="text-center text-sm text-muted-foreground">
            Dont have an account?
            <Link
              href={"/auth/signup"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
