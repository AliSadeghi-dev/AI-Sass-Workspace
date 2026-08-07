import { getUserSubscription } from "@/lib/actions/subscription";
import { getUserMetadata } from "@/lib/actions/user";
import { getStripePlans } from "@/lib/stripe/plans";
import { redirect } from "next/navigation";
import { SettingsTabs } from "./_components/settings-tabs";

const planLabels: Record<string, string> = {
  free: "Free Tier",
  pro: "Pro",
  pro_plus: "Pro Plus",
  enterprise: "Enterprise",
};

export default async function SettingsPage() {
  const [user, subscription, plans] = await Promise.all([
    getUserMetadata(),
    getUserSubscription(),
    getStripePlans(),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const creditsAllowed = subscription?.creditsAllowed ?? 0;
  const creditsUsed = subscription?.creditsUsed ?? 0;

  const creditsLeft = Math.max(creditsAllowed - creditsUsed, 0);
  const planType = subscription?.planType ?? "free";
  const planLabel = planLabels[planType] ?? "Free Tier";

  return (
    <div className="max-w-2xl space-y-6 pb-10 bg-background text-foreground animate-in fade-in duration-300">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your profile and subscription.
        </p>
      </div>

      <SettingsTabs
        user={{
          id: user.id,
          fullName: user.fullName,
          email: user.email ?? "",
          avatarUrl: user.avatarUrl,
        }}
        planType={planType}
        planLabel={planLabel}
        creditsLeft={creditsLeft}
        creditsAllowed={creditsAllowed}
        plans={plans}
      />
    </div>
  );
}
