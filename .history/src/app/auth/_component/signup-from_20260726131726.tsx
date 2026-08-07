"use client";

import { createZodResolver } from "@/lib/resolvers";
import { signupSchema, type SignupFormValues } from "@/lib/validation/auth";
import { useForm } from "react-hook-form";

export function SignupForm() {
  const {} = useForm<SignupFormValues>({
    resolver: createZodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
}
