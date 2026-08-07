import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const FREE_PLAN_CREDITS = 10;

export class CreditsExhaustedError extends Error {
  constructor() {
    super("Credits exhausted");
    this.name = "CreditsExhaustedError";
  }
}

export async function getOrCreateSubscription(profileId: string) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.profileId, profileId),
    orderBy: [asc(subscriptions.id)],
  });
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      profileId,
      planType: "free",
      status: "active",
      creditsAllowed: FREE_PLAN_CREDITS,
      creditsUsed: 0,
    })
    .onConflictDoNothing({ target: subscriptions.profileId })
    .returning();

  if (created) {
    return created;
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.profileId, profileId),
    orderBy: [asc(subscriptions.id)],
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return subscription;
}

export async function canSendMessage(profileId: string) {
  const subscription = await getOrCreateSubscription(profileId);
  return subscription.creditsUsed < subscription.creditsAllowed;
}

export async function consumeMessageCredit(profileId: string) {
  await getOrCreateSubscription(profileId);

  const [updated] = await db
    .update(subscriptions)
    .set({
      creditsUsed: sql`${subscriptions.creditsUsed} + 1`,
    })
    .where(
      and(
        eq(subscriptions.profileId, profileId),
        sql`${subscriptions.creditsUsed} < ${subscriptions.creditsAllowed}`,
      ),
    )
    .returning();

  if (!updated) {
    throw new CreditsExhaustedError();
  }

  revalidatePath("/dashboard", "layout");

  return updated;
}

export async function assertCanSendMessage(profileId: string) {
  const allowed = await canSendMessage(profileId);
  if (!allowed) {
    throw new CreditsExhaustedError();
  }
}

export async function incrementCreditsUsed(profileId: string) {
  await consumeMessageCredit(profileId);
}
