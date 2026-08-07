import z from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(80, "Full name must be less than 80 characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
