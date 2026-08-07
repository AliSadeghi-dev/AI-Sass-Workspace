"use server";

import { getAuthenticatedUser } from "@/lib/actions/ownership";
import { getAppOrigin, getStripe } from "@/lib/stripe/client";
import {
  ensureStripeCustomer,
  syncSubscriptionFromStripe,
} from "@/lib/stripe/sync-subscriptions";
import { getOrCreateSubscription } from "@/lib/subscription/credits";
import { revalidatePath } from "next/cache";

const billingSettingsPath = "/dashboard/settings?tab=billing";

export async function changePlan(priceId: string) {
  const user = await getAuthenticatedUser();
  const stripe = getStripe();
  const origin = getAppOrigin();
  const currentSubscription = await getOrCreateSubscription(user.id);

  if (
    currentSubscription.stripeSubscriptionId &&
    currentSubscription.planType !== "free"
  ) {
    const subscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId,
    );

    const subscriptionItemId = subscription.items.data[0]?.id;

    if (!subscriptionItemId) {
      throw new Error("No Subscription item found to upgrade");
    }

    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId,
      {
        items: [{ id: subscriptionItemId, price: priceId }],
        proration_behavior: "create_prorations",
      },
    );

    await syncSubscriptionFromStripe(user.id, updatedSubscription);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { upgraded: true as const };
  }

  const customerId = await ensureStripeCustomer(user.id, user.email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${billingSettingsPath}&billing=success`,
    cancel_url: `${origin}${billingSettingsPath}&billing=cancelled`,
    metadata: {
      profileId: user.id,
    },
    subscription_data: {
      metadata: {
        profileId: user.id,
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create stripe checkout session");
  }

  return { url: session.url };
}

export async function createCheckoutSession(priceId: string) {
  return changePlan(priceId);
}

export async function syncSubscriptionAfterCheckout() {
  try {
    const user = await getAuthenticatedUser();
    const stripe = getStripe();

    const localSubscription = await getOrCreateSubscription(user.id);

    const customerId =
      localSubscription.stripeCustomerId ??
      (await ensureStripeCustomer(user.id, user.email));

    const subscriptionLists = await Promise.all(
      (["active", "trialing"] as const).map((status) =>
        stripe.subscriptions.list({
          customer: customerId,
          status,
          limit: 1,
        }),
      ),
    );

    const stripeSubscription =
      subscriptionLists.find((list) => list.data.length > 0)?.data[0] ?? null;

    if (!stripeSubscription) {
      return {
        success: false,
        error: "No active stripe subscription found for this account",
      };
    }

    const updated = await syncSubscriptionFromStripe(
      user.id,
      stripeSubscription,
      { resetCreditsUsed: true },
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return {
      success: true as const,
      planType: updated.planType,
      creditsAllowed: updated.creditsAllowed,
    };
  } catch (error) {
    console.error("Error syncing subscription after checkout", error);

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync subscription after checkout",
    };
  }
}
