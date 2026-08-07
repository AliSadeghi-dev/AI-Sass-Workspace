"use server";

import {
  assertWorkspaceOwner,
  getAuthenticatedUser,
} from "@/lib/actions/ownership";
import { db } from "@/lib/db";
import { prompts } from "@/lib/db/schema";
import { promptSchema } from "@/lib/validation/prompt";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function assertPromptOwner(userId: string, promptId: string) {
  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.profileId, userId)),
  });

  if (!prompt) {
    throw new Error("Prompt not found or unauthorized");
  }

  return prompt;
}

export async function getPrompts(workspaceId?: string | null) {
  try {
    const user = await getAuthenticatedUser();
    if (workspaceId) {
      await assertWorkspaceOwner(user.id, workspaceId);
    }

    const userPrompts = await db.query.prompts.findMany({
      where: workspaceId
        ? and(
            eq(prompts.profileId, user.id),
            or(
              isNull(prompts.workspaceId),
              eq(prompts.workspaceId, workspaceId),
            ),
          )
        : eq(prompts.profileId, user.id),
      orderBy: [desc(prompts.isFavorite), desc(prompts.createdAt)],
    });

    return userPrompts;
  } catch (error) {
    console.error("Error fetching prompts", error);
    return [];
  }
}

export async function createPrompt(input: {
  title: string;
  content: string;
  category: string;
  workspaceId?: string | null;
}) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = promptSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message ?? "Invalid prompt data",
      };
    }

    if (parsed.data.workspaceId) {
      await assertWorkspaceOwner(user.id, parsed.data.workspaceId);
    }

    const [newPrompt] = await db
      .insert(prompts)
      .values({
        profileId: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
        workspaceId: parsed.data.workspaceId ?? null,
      })
      .returning();

    revalidatePath("/dashboard/prompts");

    return { success: true as const, data: newPrompt };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create prompt";
    console.error("Error creating prompt", error);
    return { success: false as const, error: errorMessage };
  }
}

export async function updatePrompt(
  id: string,
  input: {
    title: string;
    content: string;
    category: string;
    workspaceId?: string | null;
  },
) {
  try {
    const user = await getAuthenticatedUser();
    await assertPromptOwner(user.id, id);

    const parsed = promptSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0].message ?? "Invalid prompt data",
      };
    }

    if (parsed.data.workspaceId) {
      await assertWorkspaceOwner(user.id, parsed.data.workspaceId);
    }

    const [updatedPrompt] = await db
      .update(prompts)
      .set({
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
        workspaceId: parsed.data.workspaceId ?? null,
      })
      .where(eq(prompts.id, id))
      .returning();

    revalidatePath("/dashboard/prompts");

    return { success: true as const, data: updatedPrompt };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update prompt";
    console.error("Error updating prompt", error);
    return { success: false as const, error: errorMessage };
  }
}

export async function deletePrompt(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await assertPromptOwner(user.id, id);

    await db.delete(prompts).where(eq(prompts.id, id));

    revalidatePath("/dashboard/prompts");

    return { success: true as const };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete prompt";
    console.error("Error deleting prompt", error);
    return { success: false as const, error: errorMessage };
  }
}

export async function toggleFavoritePrompt(id: string, isFavorite: boolean) {
  try {
    const user = await getAuthenticatedUser();
    await assertPromptOwner(user.id, id);

    const [updatedPrompt] = await db
      .update(prompts)
      .set({
        isFavorite,
      })
      .where(eq(prompts.id, id))
      .returning();

    revalidatePath("/dashboard/prompts");
    return { success: true as const, data: updatedPrompt };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to toggle favorite prompt";
    console.error("Error toggling favorite prompt", error);
    return { success: false as const, error: errorMessage };
  }
}
