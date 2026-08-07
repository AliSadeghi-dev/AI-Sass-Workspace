import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe/client";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/utils";
import { FREE_PLAN_CREDITS } from "@/lib/subscription/credits";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

function getCreditsFromProduct(product: Stripe.Product) {
  const credits = Number.parseInt(product.metadata.credits_allowed ?? "", 10);
  return Number.isFinite(credits) && credits > 0 ? credits : 100;
}

function getPlanTypeFromProduct(product: Stripe.Product) {
  return product.metadata.plan_type ?? "pro";
}

async function resolveProduct(
  price: Stripe.Price,
): Promise<Stripe.Product | null> {
  const product = price.product;
  if (!product) {
    return null;
  }

  if (typeof product === "string") {
    const stripe = getStripe();
    const retrieved = await stripe.products.retrieve(product);
    if ("deleted" in retrieved) return null;

    return retrieved;
  }
  if ("deleted" in product) {
    return null;
  }

  return product;
}

async function getPriceWithProduct(
  priceOrId: string | Stripe.Price,
): Promise<Stripe.Price> {
  const stripe = getStripe();

  if (typeof priceOrId === "string") {
    return stripe.prices.retrieve(priceOrId, { expand: ["product"] });
  }

  if (typeof priceOrId.product === "string") {
    return stripe.prices.retrieve(priceOrId.id, { expand: ["product"] });
  }

  return priceOrId;
}

export async function syncSubscriptionFromStripe(
  profileId: string,
  stripeSubscription: Stripe.Subscription,
  options?: { resetCreditsUsed?: boolean },
) {
  const item = stripeSubscription.items.data[0];

  if (!item) {
    throw new Error("Stripe subscription has no price item");
  }

  const price = await getPriceWithProduct(item.price);
  const product = await resolveProduct(price);
  if (!product) {
    throw new Error("Stripe product could not be resolved");
  }

  const planType = getPlanTypeFromProduct(product);
  const creditsAllowed = getCreditsFromProduct(product);

  const stripeCustomerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.profileId, profileId),
  });

  const updateData = {
    planType,
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    status: stripeSubscription.status,
    creditsAllowed,
    currentPeriodEnd: getSubscriptionPeriodEnd(stripeSubscription),
    ...(options?.resetCreditsUsed ? { creditUsed: 0 } : {}),
  };

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.profileId, profileId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      profileId,
      ...updateData,
      creditsUsed: 0,
    })
    .returning();

  return created;
}

export async function resetToFreePlan(profileId: string) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.profileId, profileId),
  });

  const updateData = {
    planType: "free",
    stripeSubscriptionId: null,
    status: "active",
    creditsAllowed: FREE_PLAN_CREDITS,
    creditsUsed: 0,
    currentPeriodEnd: null,
  };

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.profileId, profileId))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      profileId,
      ...updateData,
    })
    .returning();

  return created;
}

export async function ensureStripeCustomer(
  profileId: string,
  email?: string | null,
) {
  const stripe = getStripe();
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.profileId, profileId),
  });

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { profileId },
  });

  if (existing) {
    await db
      .update(subscriptions)
      .set({ stripeCustomerId: customer.id })
      .where(eq(subscriptions.profileId, profileId));
  } else {
    await db.insert(subscriptions).values({
      profileId,
      stripeCustomerId: customer.id,
      planType: "free",
      status: "active",
      creditsAllowed: FREE_PLAN_CREDITS,
      creditsUsed: 0,
    });
  }

  return customer.id;
}
