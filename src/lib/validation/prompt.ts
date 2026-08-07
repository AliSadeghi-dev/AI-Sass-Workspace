import { PROMPT_CATEGORIES } from "@/constants";
import { z } from "zod";

export const promptSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must be less than 80 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(4000, "Prompt must be less than 4000 characters"),
  category: z.enum(PROMPT_CATEGORIES),
  workspaceId: z.string().uuid().nullable().optional(),
});

export type promptFormValues = z.infer<typeof promptSchema>;
