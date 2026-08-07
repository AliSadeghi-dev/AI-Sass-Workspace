"use server";

import {
  assertChatOwner,
  assertWorkspaceOwner,
  getAuthenticatedUser,
} from "@/lib/actions/ownership";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getChats(workspaceId: string) {
  try {
    const user = await getAuthenticatedUser();
    await assertWorkspaceOwner(user.id, workspaceId);

    const workspaceChats = await db.query.chats.findMany({
      where: eq(chats.workspaceId, workspaceId),
      orderBy: (chats, { desc }) => [desc(chats.created_at)],
    });

    return workspaceChats;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createChat(
  workspaceId: string,
  title: string = "New Chat session",
) {
  try {
    const user = await getAuthenticatedUser();
    if (!workspaceId) throw new Error("Workspace ID is required");
    await assertWorkspaceOwner(user.id, workspaceId);

    const [newChat] = await db
      .insert(chats)
      .values({
        title,
        workspaceId,
        isPinned: false,
      })
      .returning();

    revalidatePath("/dashboard");
    return { success: true, data: newChat };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create chat";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function updateChat(id: string, newTitle: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!newTitle.trim()) throw new Error("Title is required");

    await assertChatOwner(user.id, id);

    const [updatedChat] = await db
      .update(chats)
      .set({ title: newTitle })
      .where(eq(chats.id, id))
      .returning();

    if (!updatedChat) return { success: false, error: "Chat not found" };

    revalidatePath("/dashboard");

    return { success: true, data: updatedChat };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update chat";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function togglePinChat(id: string, isPinned: boolean) {
  try {
    const user = await getAuthenticatedUser();

    await assertChatOwner(user.id, id);

    const [updatedChat] = await db
      .update(chats)
      .set({ isPinned })
      .where(eq(chats.id, id))
      .returning();

    if (!updatedChat) return { success: false, error: "Chat not found" };

    revalidatePath("/dashboard");

    return { success: true, data: updatedChat };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update chat";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function deleteChat(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await assertChatOwner(user.id, id);

    const [deletedChat] = await db
      .delete(chats)
      .where(eq(chats.id, id))
      .returning();

    if (!deletedChat) return { success: false, error: "chat not found" };

    revalidatePath("/dashboard");

    return { success: true, data: deletedChat };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete chat";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}
