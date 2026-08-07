import { CREDITS_CONSUMED_EVENT, PLAN_TIER_ORDER } from "@/constants";

describe("constants", () => {
  it("orders subscription tiers from lowest to highest", () => {
    expect(PLAN_TIER_ORDER.free).toBeLessThan(PLAN_TIER_ORDER.pro);
    expect(PLAN_TIER_ORDER.pro).toBeLessThan(PLAN_TIER_ORDER.pro_plus);
    expect(PLAN_TIER_ORDER.pro_plus).toBeLessThan(PLAN_TIER_ORDER.enterprise);
  });

  it("exposes the credits consumed browser event name", () => {
    expect(CREDITS_CONSUMED_EVENT).toBe("credits:consumed");
  });
});
