"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogOut, Settings, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

interface SidebarFooterProps {
  user: {
    email: string | undefined;
    fullName: string;
    avatarUrl: string;
  };
  creditsLeft: number;
  creditsAllowed: number;
  currentPlan: {
    label: string;
    color: string;
    icon: React.ReactNode;
  };
}

export function SidebarFooter({
  user,
  creditsLeft,
  creditsAllowed,
  currentPlan,
}: SidebarFooterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = user.fullName
    ? user.fullName.slice(0, 2).toUpperCase()
    : "US";

  const handleLogout = async () => {
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-border space-y-2 px-1">
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          <span>Usage Limit</span>
        </div>
        <span className="font-mono font-semibold text-foreground">
          {creditsLeft} / {creditsAllowed} Credits
        </span>
      </div>

      <div className="flex items-center gap-3 p-2 rounded-xl border border-border/40 bg-background/40">
        <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border bg-muted items-center justify-center select-none">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl.split("?")[0]}
              alt={user.fullName}
              className="h-full w-full object-cover"
              width={32}
              height={32}
            />
          ) : (
            <span className="text-xs font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="flex flex-col overflow-hidden text-left flex-1">
          <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
            {user.fullName}
            {currentPlan.icon}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-none">
            {user.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors h-9",
            pathname === "/dashboard/settings"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <div className="text-muted-foreground hover:text-foreground [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-xl [&>button]:border-border [&>button]:bg-transparent hover:[&>button]:bg-accent/40">
          <ThemeToggle />
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-popover border border-border rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-base font-semibold">
              Confirm Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              Are you sure you want to log out of your Codevia account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="rounded-xl border-border bg-transparent text-muted-foreground hover:bg-accent text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-9"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
