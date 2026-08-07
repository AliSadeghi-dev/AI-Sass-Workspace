import Stripe from "stripe";

type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  parent?: {
    type?: string;
    subscription_details?: {
      subscription?: string | Stripe.Subscription | null;
    };
  };
};

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number;
};

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const extendedInvoice = invoice as InvoiceWithSubscription;

  if (extendedInvoice.subscription) {
    return typeof extendedInvoice.subscription === "string"
      ? extendedInvoice.subscription
      : extendedInvoice.subscription.id;
  }

  const subscription =
    extendedInvoice.parent?.subscription_details?.subscription;
  if (!subscription) return null;

  return typeof subscription === "string" ? subscription : subscription.id;
}

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const extendedSubscription = subscription as SubscriptionWithPeriod;

  if (extendedSubscription.current_period_end) {
    return new Date(extendedSubscription.current_period_end * 1000);
  }

  const itemPeriodEnd = subscription.items.data[0]?.current_period_end;

  if (itemPeriodEnd) {
    return new Date(itemPeriodEnd * 1000);
  }

  return null;
}
