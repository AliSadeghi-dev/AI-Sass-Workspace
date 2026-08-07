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
import { signupSchema, type SignupFormValues } from "@/lib/validation/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: createZodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { data, error } = await createClient().auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback",
        },
      });

      if (error) {
        console.log(error.message);
        return;
      }

      const userAlreadyExists =
        data?.user?.identities && data.user.identities.length === 0;

      if (userAlreadyExists) {
        toast.error("User already exists");
      } else {
        toast.success("Account created successfully", {
          description: "Please check your email for verify your account",
        });
        router.push("/auth/login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <PasswordInput
              id="signup-password"
              placeholder="********"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="signup-confirm-password">
              Confirm Password
            </FieldLabel>
            <PasswordInput
              id="signup-confirm-password"
              placeholder="********"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button type="submit" className={"w-full"} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                creating account...
              </>
            ) : (
              <>create account</>
            )}
          </Button>

          <FieldSeparator>or</FieldSeparator>
          <GoogleAuthbutton label="Continue with Google" />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?
            <Link
              href={"/auth/login"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
