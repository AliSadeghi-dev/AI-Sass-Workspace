"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import * as React from "react";
import { WorkspaceActions } from "./workspace-actions";
import { WorkspaceCreateModel } from "./workspace-create-model";

interface Workspace {
  id: string;
  name: string;
  profileId: string;
  created_at: Date | null;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspace: string;
}

export function WorkspaceSelector({
  workspaces,
  activeWorkspace,
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [targetId, setTargetId] = React.useState<string | null>(null);

  const handleNavigation = (id: string) => {
    setTargetId(id);
    startTransition(() => {
      router.push(`/dashboard?workspaceId=${id}`);
    });
  };

  return (
    <div className="mt-6 px-1 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
          Workspaces
        </p>
        <WorkspaceCreateModel />
      </div>

      <div className="mt-3 space-y-1 flex-1 overflow-y-auto pr-1 text-card-foreground scrollbar-thin">
        {workspaces?.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 px-3 py-2 italic">
            No workspaces yet.
          </p>
        ) : (
          workspaces?.map((ws) => {
            const isActive = activeWorkspace === ws.id;
            const isSwitching = isPending && targetId === ws.id;

            return (
              <div
                key={ws.id}
                className="relative group w-full flex items-center"
              >
                <button
                  onMouseEnter={() =>
                    router.prefetch(`/dashboard?workspaceId=${ws.id}`)
                  }
                  onClick={() => handleNavigation(ws.id)}
                  className={cn(
                    "w-full flex items-center justify-between pl-3 pr-8 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-left",
                    isActive
                      ? "bg-accent text-accent-foreground border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                    isSwitching && "opacity-70",
                  )}
                >
                  <span className="truncate text-xs">{ws.name}</span>
                </button>

                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                  <WorkspaceActions
                    workspace={ws}
                    isActive={isActive}
                    onClearActive={() => handleNavigation("")}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
