"use server";

import { getAuthenticatedUser } from "@/lib/actions/ownership";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { profileSchema } from "@/lib/validation/profile";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserMetadata() {
  try {
    const user = await getAuthenticatedUser();

    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    const metadataAvatar =
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : typeof user.user_metadata?.picture === "string"
          ? user.user_metadata.picture
          : "";

    return {
      id: user.id,
      email: user.email,
      fullName:
        userProfile?.fullName || user.user_metadata?.full_name || "User",
      avatarUrl: userProfile?.avatarUrl || metadataAvatar || "",
    };
  } catch (error) {
    console.error("Error in getUserMetaData:", error);
    return null;
  }
}

export async function updateProfile(input: {
  fullName: string;
  avatarUrl?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = profileSchema.safeParse({ fullName: input.fullName });

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid profile data",
      };
    }

    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    const nextAvatarUrl =
      input.avatarUrl !== undefined
        ? input.avatarUrl
        : (existingProfile?.avatarUrl ?? null);

    if (existingProfile) {
      await db
        .update(profiles)
        .set({
          fullName: parsed.data.fullName,
          avatarUrl: nextAvatarUrl,
        })
        .where(eq(profiles.id, user.id));
    } else {
      await db.insert(profiles).values({
        id: user.id,
        fullName: parsed.data.fullName,
        avatarUrl: nextAvatarUrl,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true as const };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "failed to update the profile";
    console.error("Error in updateProfile:", error);
    return { success: false as const, error: errorMessage };
  }
}
