"use server";

import { getAuthenticatedUser } from "@/lib/actions/ownership";
import { getOrCreateSubscription } from "@/lib/subscription/credits";

export async function getUserSubscription() {
  try {
    const user = await getAuthenticatedUser();
    const subscription = await getOrCreateSubscription(user.id);

    return {
      planType: subscription.planType,
      status: subscription.status,
      creditsAllowed: subscription.creditsAllowed,
      creditsUsed: subscription.creditsUsed,
      stripeCustomerId: subscription.stripeCustomerId,
    };
  } catch (error) {
    console.error("Error in getUserSubscription", error);
    return;
  }
}
