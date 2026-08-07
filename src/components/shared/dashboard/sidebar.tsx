"use client";

import { CREDITS_CONSUMED_EVENT } from "@/constants";
import { cn } from "@/lib/utils";
import { BookMarked, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarFooter } from "./sidebar-footer";
import { WorkspaceSelector } from "./workspace-selector";

interface SidebarProps {
  user: {
    id: string;
    email: string | undefined;
    fullName: string;
    avatarUrl: string;
  };
  subscription:
    | {
        planType: string;
        status: string | null;
        creditsAllowed: number;
        creditsUsed: number;
        stripeCustomerId: string | null;
      }
    | undefined;
  workspaces: {
    id: string;
    name: string;
    profileId: string;
    created_at: Date | null;
  }[];
}

export function AppSidebar({ user, subscription, workspaces }: SidebarProps) {
  const pathname = usePathname();
  const planType = subscription?.planType ?? "free";
  const creditsAllowed = subscription?.creditsAllowed ?? 10;
  const searchParams = useSearchParams();
  const [creditsUsed, setCreditsUsed] = useState(
    subscription?.creditsUsed ?? 0,
  );

  useEffect(() => {
    const handleCreditsConsumed = () => {
      setCreditsUsed((prev) => prev + 1);
    };

    window.addEventListener(CREDITS_CONSUMED_EVENT, handleCreditsConsumed);

    return () => {
      window.removeEventListener(CREDITS_CONSUMED_EVENT, handleCreditsConsumed);
    };
  }, []);

  const queryWorkspaceId = searchParams.get("workspaceId") || "";

  const creditsLeft = creditsAllowed - creditsUsed;

  const planConfig = {
    free: {
      label: "Free",
      color: "bg-secondary text-secondary-foreground border border-border",
      icon: null,
    },
    pro: {
      label: "Pro",
      color: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      icon: (
        <Crown className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
      ),
    },
    pro_plus: {
      label: "Pro+",
      color: "bg-blue500/10 text-blue-500 border border-blue-500/20",
      icon: <Crown className="h-3 w-3 text-blue-500 fill-blue-500 shrink-0" />,
    },
  };

  const currentPlan =
    planConfig[planType as keyof typeof planConfig] || planConfig.free;
  const isSelectedValid = workspaces?.some((ws) => ws.id === queryWorkspaceId);
  const activeWorkspace = isSelectedValid ? queryWorkspaceId : "";

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card px-4 py-6 text-card-foreground selection:bg-accent shrink-0">
      <Link
        href={"/dashboard"}
        className="flex items-center gap-2.5 px-2 pb-6 border-b border-border/60 transition-opacity hover:opacity-80 cursor-pointer"
      >
        <div className="flex w-7 h-7 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
          <span className="text-xs font-black tracking-tighter">AS</span>
        </div>
        <span className="text-base font-bold tracking-tight text-foreground">
          Codevia Space
        </span>
      </Link>

      <WorkspaceSelector
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
      />

      <Link
        href={
          activeWorkspace
            ? `/dashboard/prompts?workspaceId=${activeWorkspace}`
            : "/dashboard/prompts"
        }
        className={cn(
          "mt-4 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors h-9 shrink-0",
          pathname === "/dashboard/prompts"
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
        )}
      >
        <BookMarked className="h-4 w-4" />
        <span>Prompts Library</span>
      </Link>

      <SidebarFooter
        user={user}
        creditsLeft={creditsLeft}
        creditsAllowed={creditsAllowed}
        currentPlan={currentPlan}
      />
    </div>
  );
}
