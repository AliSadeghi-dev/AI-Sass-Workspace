import { mapPriceToPlan } from "@/lib/stripe/map-price-to-plan";
import Stripe from "stripe";

function createPrice(
  overrides: {
    product?: Partial<Stripe.Product> | string;
  } = {},
): Stripe.Price {
  const productOverride = overrides.product;

  const product =
    typeof productOverride === "string"
      ? productOverride
      : ({
          id: "prod_test",
          object: "product",
          active: true,
          name: "Pro",
          description: "Pro plan",
          metadata: {
            credits_allowed: "100",
            plan_type: "pro",
          },
          ...productOverride,
        } as Stripe.Product);

  return {
    id: "price_test",
    object: "price",
    active: true,
    currency: "usd",
    unit_amount: 1900,
    recurring: { interval: "month" },
    product,
  } as Stripe.Price;
}

describe("mapPricePlan", () => {
  it("maps an active recurring price to a plan", () => {
    const plan = mapPriceToPlan(createPrice());

    expect(plan).toEqual({
      priceId: "price_test",
      name: "Pro",
      description: "Pro plan",
      amount: 1900,
      currency: "usd",
      interval: "month",
      planType: "pro",
      creditsAllowed: 100,
    });
  });

  it("returns null when product is inactive", () => {
    const plan = mapPriceToPlan(
      createPrice({
        product: { active: false },
      }),
    );

    expect(plan).toBeNull();
  });

  it("returns null when product is only an id string", () => {
    const plan = mapPriceToPlan(
      createPrice({
        product: "prod_unexpanded",
      }),
    );

    expect(plan).toBeNull();
  });

  it("defaults plan type and credits when metadata is invalid", () => {
    const plan = mapPriceToPlan(
      createPrice({
        product: {
          metadata: {
            credits_allowed: "not-a-number",
          },
        },
      }),
    );

    expect(plan?.planType).toBe("pro");
    expect(plan?.creditsAllowed).toBe(100);
  });
});
