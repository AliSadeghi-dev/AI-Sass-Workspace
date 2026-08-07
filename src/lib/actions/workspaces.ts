"use server";

import { getAuthenticatedUser } from "@/lib/actions/ownership";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

//Fetch All workspaces for each user
export async function getWorkspaces() {
  try {
    const user = await getAuthenticatedUser();

    const userWorkspaces = await db.query.workspaces.findMany({
      where: eq(workspaces.profileId, user.id),
    });

    return userWorkspaces;
  } catch (error) {
    console.error("Error fetching workspaces", error);
    return [];
  }
}

// Create workspace
export async function createWorkspace(name: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!name.trim()) throw new Error("Workspace name is required");

    const [newWorkspace] = await db
      .insert(workspaces)
      .values({
        name,
        profileId: user.id,
      })
      .returning();

    revalidatePath("/dashboard");

    return { success: true, data: newWorkspace };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create workspace";
    console.error("Error creating workspace:", error);
    return { success: false, error: errorMessage };
  }
}

//Edit workspace
export async function updateWorkspace(id: string, newName: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!newName.trim()) throw new Error("Workspace name is required");

    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({ name: newName })
      .where(and(eq(workspaces.id, id), eq(workspaces.profileId, user.id)))
      .returning();

    if (!updateWorkspace) {
      return { success: false, error: "Workspace not found or unauthorized" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: updatedWorkspace };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update workspace";
    console.error("Error updating workspace:", error);
    return { success: false, error: errorMessage };
  }
}

//Delete workspace
export async function deleteWorkspace(id: string) {
  try {
    const user = await getAuthenticatedUser();

    const [deletedWorkspace] = await db
      .delete(workspaces)
      .where(and(eq(workspaces.id, id), eq(workspaces.profileId, user.id)))
      .returning();

    if (!deletedWorkspace) {
      return { success: false, error: "Workspace not found or unauthorized" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete workspace";
    console.error("Error deleting workspace:", error);
    return { success: false, error: errorMessage };
  }
}
