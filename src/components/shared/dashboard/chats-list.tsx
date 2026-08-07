"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useMemo, useOptimistic, useState } from "react";
import { ChatItemRow } from "./chat-item-row";

interface Chat {
  id: string;
  title: string;
  workspaceId: string;
  created_at: string;
  isPinned: boolean;
}

interface ChatsListProps {
  initialChats: Chat[];
  onChatDeleted: (id: string) => void;
  onChatUpdated: (id: string, newTitle: string) => void;
  onChatPinToggled: (id: string, isPinned: boolean) => void;
}

type OptimisticAction =
  | { type: "delete"; id: string }
  | { type: "update_title"; id: string; title: string }
  | { type: "toggle_pin"; id: string; isPinned: boolean };

export function ChatsList({
  initialChats,
  onChatDeleted,
  onChatUpdated,
  onChatPinToggled,
}: ChatsListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "pinned" | "recent">(
    "all",
  );

  const [opmitmisticChats, setOptimisticChats] = useOptimistic<
    Chat[],
    OptimisticAction
  >(initialChats, (state, action) => {
    switch (action.type) {
      case "delete":
        return state.filter((chat) => chat.id !== action.id);
      case "update_title":
        return state.map((chat) =>
          chat.id === action.id ? { ...chat, title: action.title } : chat,
        );
      case "toggle_pin":
        return state.map((chat) =>
          chat.id === action.id ? { ...chat, isPinned: action.isPinned } : chat,
        );
      default:
        return state;
    }
  });

  const { pinnedChats, groupedRecentChats } = useMemo(() => {
    const filtered = opmitmisticChats.filter((chat) =>
      chat.title.toLocaleLowerCase().includes(searchQuery.toLowerCase().trim()),
    );

    const pinned = filtered.filter((chat) => chat.isPinned);
    const unpinned = filtered.filter((chat) => !chat.isPinned);

    const groups: { [key: string]: Chat[] } = {
      Today: [],
      Yesterday: [],
      "Last 7 Days": [],
      Older: [],
    };

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const severnDaysAgo = new Date(todayStart);
    severnDaysAgo.setDate(severnDaysAgo.getDate() - 7);

    unpinned.forEach((chat) => {
      const chatDate = new Date(chat.created_at);
      if (chatDate >= todayStart) {
        groups["Today"].push(chat);
      } else if (chatDate >= yesterdayStart) {
        groups["Yesterday"].push(chat);
      } else if (chatDate >= severnDaysAgo) {
        groups["Last 7 Days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return {
      pinnedChats: filterType === "recent" ? [] : pinned,
      groupedRecentChats: filterType === "pinned" ? {} : groups,
    };
  }, [opmitmisticChats, searchQuery, filterType]);

  const hasRecentChats = Object.values(groupedRecentChats).some(
    (g) => g.length > 0,
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between w-full border-b border-border/20 pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/80 shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-1 border border-border/40 bg-muted/20 p-1 rounded-lg self-end sm:self-auto shadow-inner">
          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => setFilterType("all")}
            className={`h-7 px-3 text-[11px] font-medium rounded-md transition-all ${
              filterType === "all"
                ? "bg-background shadow-sm text-foreground border border-border/40"
                : "text-muted-foreground"
            }`}
          >
            All
          </Button>

          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => setFilterType("pinned")}
            className={`h-7 px-3 text-[11px] font-medium rounded-md transition-all ${
              filterType === "pinned"
                ? "bg-background shadow-sm text-foreground border border-border/40"
                : "text-muted-foreground"
            }`}
          >
            Pinned
          </Button>

          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => setFilterType("recent")}
            className={`h-7 px-3 text-[11px] font-medium rounded-md transition-all ${
              filterType === "recent"
                ? "bg-background shadow-sm text-foreground border border-border/40"
                : "text-muted-foreground"
            }`}
          >
            Recent
          </Button>
        </div>
      </div>

      {pinnedChats.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 px-1 select-none">
            Pinned Threads
          </h4>

          <div className="border border-border/40 rounded-xl bg-background overflow-hidden shadow-sm">
            {pinnedChats.map((chat) => (
              <ChatItemRow
                key={chat.id}
                chat={chat}
                onChatDeleted={onChatDeleted}
                onChatUpdated={onChatUpdated}
                onChatPinToggled={onChatPinToggled}
                setOptimistic={setOptimisticChats}
              />
            ))}
          </div>
        </div>
      )}
      {hasRecentChats
        ? Object.entries(groupedRecentChats).map(([groupName, chats]) => {
            if (chats.length === 0) return null;
            return (
              <div key={groupName} className="space-y-2">
                <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 px-1 select-none">
                  {groupName}
                </h4>
                <div className="border border-border/40 rounded-xl bg-background overflow-hidden shadow-sm">
                  {chats.map((chat) => (
                    <ChatItemRow
                      key={chat.id}
                      chat={chat}
                      onChatDeleted={onChatDeleted}
                      onChatUpdated={onChatUpdated}
                      onChatPinToggled={onChatPinToggled}
                      setOptimistic={setOptimisticChats}
                    />
                  ))}
                </div>
              </div>
            );
          })
        : pinnedChats.length === 0 && (
            <div className="text-center py-12 text-xs text-muted-foreground/60 border border-dashed border-border/60 rounded-xl bg-muted/5">
              No threads found matching your criteria.
            </div>
          )}
    </div>
  );
}
