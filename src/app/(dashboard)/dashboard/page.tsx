"use client";

import { ChatsList } from "@/components/shared/dashboard/chats-list";
import { WorkspaceCreateModel } from "@/components/shared/dashboard/workspace-create-model";
import { Button } from "@/components/ui/button";
import { createChat, getChats } from "@/lib/actions/chat";
import {
  LayoutGrid,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Chat {
  id: string;
  title: string;
  workspaceId: string;
  created_at: string;
  isPinned: boolean;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeWorkspaceId = searchParams.get("workspaceId") || "";
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingTop, setIsCreatingTop] = useState<boolean>(false);
  const [isCreatingCenter, setIsCreatingCenter] = useState<boolean>(false);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const loadWorkspaceChats = async () => {
      try {
        setIsLoading(true);
        const data = await getChats(activeWorkspaceId);

        const formattedData = data.map((c) => ({
          ...c,
          created_at: new Date(c.created_at).toISOString(),
          isPinned: c.isPinned || false,
        }));

        setChatsList(formattedData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceChats();
  }, [activeWorkspaceId]);

  const anyCreating = isCreatingTop || isCreatingCenter;

  if (activeWorkspaceId && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent h-full">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  if (activeWorkspaceId) {
    return (
      <div className="flex flex-1 justify-center bg-transparent h-full overflow-y-auto">
        <div className="max-w-4xl w-full flex flex-col pt-12 px-8 pb-16 animate-in fade-in duration-300">
          <div className="flex items-end justify-between pb-6 border-b border-border/40 mb-10 shrink-0">
            <div className="space-y-1">
              <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                Workspace Dashboard
              </h1>
              <p className="text-xs text-muted-foreground/80">
                Manage your ongoing thread, pinned reference contexts, and quick
                sessions
              </p>
            </div>

            {chatsList.length > 0 && (
              <Button
                onClick={async () => {
                  if (!activeWorkspaceId || anyCreating) return;
                  try {
                    setIsCreatingTop(true);
                    const res = await createChat(
                      activeWorkspaceId,
                      "Fresh Analytics Stream",
                    );
                    if (res.success && res.data) {
                      router.push(`/dashboard/chat/${res.data.id}`);
                    }
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsCreatingTop(false);
                  }
                }}
                disabled={anyCreating}
                variant="outline"
                className={
                  "h-8 rounded-lg border-border/60 font-medium text-xs shadow-sm flex items-center gap-1.5 px-3 transition-colors hover:bg-accent"
                }
              >
                {isCreatingTop ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquarePlus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                New AI Chat
              </Button>
            )}
          </div>

          <div className="w-full flex-1 flex flex-col min-h-0">
            {chatsList.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-16">
                <div className="max-w-md w-full text-center space-y-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-border/60 bg-background text-muted-foreground/70 shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-medium text-foreground tracking-tight">
                      No chats in this workspace yet
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Kickstart your agentic flow by creating you very first
                      conversational thread.
                    </p>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!activeWorkspaceId || anyCreating) return;
                      try {
                        setIsCreatingCenter(true);
                        const res = await createChat(
                          activeWorkspaceId,
                          "Fresh Analytics Stream",
                        );

                        if (res.success && res.data) {
                          router.push(`/dashboard/chat/${res.data.id}`);
                        }
                      } catch (error) {
                        console.error(error);
                      } finally {
                        setIsCreatingCenter(false);
                      }
                    }}
                    disabled={anyCreating}
                    className={
                      "h-8 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 shadow-sm flex items-center justify-center gap-1.5 mx-auto px-4"
                    }
                  >
                    {isCreatingCenter ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 " />
                    )}
                    Create Fresh Thread
                  </Button>
                </div>
              </div>
            ) : (
              <ChatsList
                key={activeWorkspaceId}
                initialChats={chatsList}
                onChatDeleted={(id) =>
                  setChatsList((p) => p.filter((i) => i.id !== id))
                }
                onChatUpdated={(id, t) =>
                  setChatsList((p) =>
                    p.map((i) => (i.id === id ? { ...i, title: t } : i)),
                  )
                }
                onChatPinToggled={(id, pin) =>
                  setChatsList((p) =>
                    p.map((i) => (i.id == id ? { ...i, isPinned: pin } : i)),
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-background h-full overflow-y-auto">
      <div className="max-w-md w-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background shadow-sm text-muted-foreground/80 mb-5">
          <LayoutGrid className="h-4 w-4" />
        </div>

        <div className="space-y-1.5 mb-6">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Welcome to Codevia
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Select an existing workspace from the sidebar or build a new agentic
            environment to start streaming chats.
          </p>
        </div>

        <WorkspaceCreateModel>
          <Button
            className={
              "h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 px-4"
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Create Workspace
          </Button>
        </WorkspaceCreateModel>
      </div>
    </div>
  );
}
