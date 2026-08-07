"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_TIER_ORDER } from "@/constants";
import {
  changePlan,
  syncSubscriptionAfterCheckout,
} from "@/lib/actions/stripe";
import { StripePlan } from "@/lib/stripe/plan-types";
import { cn } from "@/lib/utils";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface BillingSectionProps {
  planType: string;
  planLabel: string;
  creditsLeft: number;
  creditsAllowed: number;
  plans: StripePlan[];
}

function formatPrice(amount: number | null, currency: string) {
  if (amount === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function getPlanTier(planType: string) {
  return PLAN_TIER_ORDER[planType] ?? 0;
}

function cleanBillingQueryParams() {
  const params = new URLSearchParams(window.location.search);
  params.delete("billing");
  params.set("tab", "billing");
  window.history.replaceState(
    null,
    "",
    `/dashboard/settings?${params.toString()}`,
  );
}

export function BillingSection({
  planType,
  planLabel,
  creditsLeft,
  creditsAllowed,
  plans,
}: BillingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get("billing");
  const [pendingPriceId, setPendingPriceId] = React.useState<string | null>(
    null,
  );
  const [confirmPlan, setConfirmPlan] = React.useState<StripePlan | null>(null);
  const [isManualSyncing, setIsManualSyncing] = React.useState(false);
  const [hasSyncedCheckout, setHasSyncedCheckout] = React.useState(false);
  const hasHandledBillingRef = React.useRef(false);

  const isSyncingAfterCheckout =
    (billingStatus === "success" && !hasSyncedCheckout) || isManualSyncing;
  const currentTier = getPlanTier(planType);

  React.useEffect(() => {
    if (hasHandledBillingRef.current) return;

    if (billingStatus === "success") {
      hasHandledBillingRef.current = true;

      void (async () => {
        const result = await syncSubscriptionAfterCheckout();

        if (result.success) {
          toast.success("Subscription activated successfully.");
          cleanBillingQueryParams();
          router.refresh();
        } else {
          toast.error(
            result.error ??
              "Payment succeeded, but your plan could not be synced yet.",
          );
          cleanBillingQueryParams();
        }

        setHasSyncedCheckout(true);
      })();
    }

    if (billingStatus === "cancelled") {
      hasHandledBillingRef.current = true;
      toast.message("Checkout cancelled.");
      cleanBillingQueryParams();
    }
  }, [billingStatus, router]);

  const handlePlanChange = async (plan: StripePlan) => {
    try {
      setPendingPriceId(plan.priceId);
      const result = await changePlan(plan.priceId);

      if ("url" in result && result.url) {
        window.location.assign(result.url);
        return;
      }

      if ("upgraded" in result && result.upgraded) {
        setConfirmPlan(null);
        toast.success("Plan upgraded successfully.");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change plan.",
      );
    } finally {
      setPendingPriceId(null);
    }
  };

  const isPaidSubscriber = planType !== "free";

  if (isSyncingAfterCheckout) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Activating your subscription...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Current plan
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {planLabel}
            </p>
          </div>
          <Badge variant="secondary">{planLabel}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-border/40 pt-3">
          <p className="text-muted-foreground">Available message credits</p>
          <span className="font-mono font-bold text-foreground">
            {creditsLeft} / {creditsAllowed}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Available plans
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isPaidSubscriber
              ? "Upgrades apply instantly. Stripe charges the prorated difference to your saved card."
              : "Choose a plan to get started. You'll complete payment on Stripe checkout."}
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border/60 rounded-xl">
            No paid plans are configured in Stripe yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan) => {
              const isCurrent = plan.planType === planType;
              const planTier = getPlanTier(plan.planType);
              const canUpgrade = planTier > currentTier;
              const isPending = pendingPriceId === plan.priceId;

              return (
                <div
                  key={plan.priceId}
                  className={cn(
                    "rounded-xl border p-4 space-y-3 transition-colors",
                    isCurrent
                      ? "border-foreground/30 bg-accent/20"
                      : "border-border/60 bg-background",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-foreground">
                          {plan.name}
                        </h4>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {formatPrice(plan.amount, plan.currency)}
                      </p>
                      {plan.interval && (
                        <p className="text-[10px] text-muted-foreground">
                          per {plan.interval}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                      {plan.creditsAllowed} message credits / month
                    </p>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    ) : canUpgrade ? (
                      <Button
                        size="sm"
                        onClick={() => setConfirmPlan(plan)}
                        disabled={pendingPriceId !== null}
                        className="h-8 cursor-pointer rounded-lg text-xs px-3"
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            Upgrade
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          setIsManualSyncing(true);
          const result = await syncSubscriptionAfterCheckout();
          setIsManualSyncing(false);
          if (result.success) {
            toast.success("Subscription synced successfully.");
            router.refresh();
          } else {
            toast.error(result.error ?? "No active subscription found.");
          }
        }}
        className="w-full h-8 cursor-pointer rounded-xl text-[11px] text-muted-foreground"
      >
        Refresh plan status
      </Button>

      <AlertDialog
        open={confirmPlan !== null}
        onOpenChange={(open) => {
          if (!open && pendingPriceId === null) {
            setConfirmPlan(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPaidSubscriber
                ? "Confirm plan upgrade"
                : "Continue to checkout"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 text-left">
                {confirmPlan && (
                  <>
                    <p>
                      {isPaidSubscriber ? (
                        <>
                          Upgrade from <strong>{planLabel}</strong> to{" "}
                          <strong>{confirmPlan.name}</strong>?
                        </>
                      ) : (
                        <>
                          Subscribe to <strong>{confirmPlan.name}</strong>?
                        </>
                      )}
                    </p>
                    <p className="text-xs">
                      {formatPrice(confirmPlan.amount, confirmPlan.currency)}
                      {confirmPlan.interval ? ` / ${confirmPlan.interval}` : ""}
                      {" · "}
                      {confirmPlan.creditsAllowed} message credits / month
                    </p>
                    <p className="text-xs">
                      {isPaidSubscriber
                        ? "No checkout page. Stripe will charge the prorated difference to your saved payment method right away."
                        : "You'll be redirected to Stripe to enter your payment details."}
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={pendingPriceId !== null}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={pendingPriceId !== null || confirmPlan === null}
              className="cursor-pointer"
              onClick={() => {
                if (confirmPlan) {
                  void handlePlanChange(confirmPlan);
                }
              }}
            >
              {pendingPriceId !== null ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : isPaidSubscriber ? (
                "Confirm upgrade"
              ) : (
                "Continue to Stripe"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
