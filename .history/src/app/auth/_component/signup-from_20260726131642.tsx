"use client";

import { createZodResolver } from "@/lib/resolvers";
import { singupSchema, type SignupFormValues } from "@/lib/validation/auth";
import { useForm } from "react-hook-form";

export function SignupForm() {
  const {} = useForm<SignupFormValues>({
    resolver: createZodResolver(signupSchema),
  });
}
