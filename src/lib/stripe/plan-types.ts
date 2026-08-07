export interface StripePlan {
  priceId: string;
  name: string;
  description: string | null;
  amount: number | null;
  currency: string;
  interval: string | null;
  planType: string;
  creditsAllowed: number;
}
