"use client";

import { StripePlan } from "@/lib/stripe/plan-types";
import { cn } from "@/lib/utils";
import { CreditCard, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BillingSection } from "./billing-section";
import { ProfileSettingsForm } from "./profile-settings-form";

type SettingsTab = "profile" | "billing";

interface SettingsTabProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
  };
  planType: string;
  planLabel: string;
  creditsLeft: number;
  creditsAllowed: number;
  plans: StripePlan[];
}

function getTabFromUrl(): SettingsTab {
  if (typeof window === "undefined") return "profile";
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") === "billing" ? "billing" : "profile";
}

function SettingsTabContent({
  user,
  planType,
  planLabel,
  creditsLeft,
  creditsAllowed,
  plans,
}: SettingsTabProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    searchParams.get("tab") === "billing" ? "billing" : "profile",
  );

  useEffect(() => {
    const onPopState = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setTab = (tab: SettingsTab) => {
    setActiveTab(tab);

    const params = new URLSearchParams(window.location.search);

    if (tab === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }

    params.delete("billing");

    const query = params.toString();

    const url = query ? `/dashboard/settings?${query}` : "/dashboard/settings";
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",

            activeTab === "profile"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setTab("billing")}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",

            activeTab === "billing"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Billing
        </button>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-border/80 bg-card p-5 shadow-sm",
          activeTab !== "profile" && "hidden",
        )}
      >
        <ProfileSettingsForm
          userId={user.id}
          initialFullName={user.fullName}
          initialEmail={user.email}
          initialAvatarUrl={user.avatarUrl}
        />
      </div>

      <div
        className={cn(
          "rounded-2xl border border-border/80 bg-card p-5 shadow-sm",
          activeTab !== "billing" && "hidden",
        )}
      >
        <BillingSection
          planType={planType}
          planLabel={planLabel}
          creditsLeft={creditsLeft}
          creditsAllowed={creditsAllowed}
          plans={plans}
        />
      </div>
    </div>
  );
}

export function SettingsTabs(props: SettingsTabProps) {
  return (
    <Suspense
      fallback={
        <p className="text-xs text-muted-foreground">Loading settings...</p>
      }
    >
      <SettingsTabContent {...props} />
    </Suspense>
  );
}
