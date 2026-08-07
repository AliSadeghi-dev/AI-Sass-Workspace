import {
  getInvoiceSubscriptionId,
  getSubscriptionPeriodEnd,
} from "@/lib/stripe/utils";
import Stripe from "stripe";

describe("getInvoiceSubscriptionId", () => {
  it("returns subscription id from legacy invoice field", () => {
    const invoice = {
      subscription: "sub_legacy",
    } as unknown as Stripe.Invoice;

    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_legacy");
  });

  it("returns subscription id from expanded subscription object", () => {
    const invoice = {
      subscription: { id: "sub_parent" },
    } as unknown as Stripe.Invoice;

    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_parent");
  });

  it("return null when invoice has no subscription refrences ", () => {
    const invoice = {} as unknown as Stripe.Invoice;

    expect(getInvoiceSubscriptionId(invoice)).toBeNull();
  });
});

describe("getSubscriptionPeriodEnd", () => {
  it("uses subscription current_period_end when available", () => {
    const subscription = {
      current_period_end: 1_700_000_000,
      items: { data: [] },
    } as unknown as Stripe.Subscription;

    expect(getSubscriptionPeriodEnd(subscription)).toEqual(
      new Date(1_700_000_000 * 1000),
    );
  });

  it("falls back to first subscription item period end", () => {
    const subscription = {
      items: {
        data: [{ current_period_end: 1_800_000_000 }],
      },
    } as unknown as Stripe.Subscription;

    expect(getSubscriptionPeriodEnd(subscription)).toEqual(
      new Date(1_800_000_000 * 1000),
    );
  });

  it("returns null when no period end is available", () => {
    const subscription = {
      items: { data: [{}] },
    } as unknown as Stripe.Subscription;

    expect(getSubscriptionPeriodEnd(subscription)).toBeNull();
  });
});
