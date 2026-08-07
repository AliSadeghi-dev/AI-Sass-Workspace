"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat, togglePinChat, updateChat } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";
import {
  Check,
  Edit,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface Chat {
  id: string;
  title: string;
  workspaceId: string;
  created_at: string;
  isPinned: boolean;
}

type OptimisticAction =
  | { type: "delete"; id: string }
  | { type: "update_title"; id: string; title: string }
  | { type: "toggle_pin"; id: string; isPinned: boolean };

interface ChatItemRowProps {
  chat: Chat;
  onChatDeleted: (id: string) => void;
  onChatUpdated: (id: string, newTitle: string) => void;
  onChatPinToggled: (id: string, isPinned: boolean) => void;
  setOptimistic: (action: OptimisticAction) => void;
}

export function ChatItemRow({
  chat,
  onChatDeleted,
  onChatUpdated,
  onChatPinToggled,
  setOptimistic,
}: ChatItemRowProps) {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editTitle, setEditTitle] = React.useState<string>(chat.title);

  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<
    "delete" | "rename" | "pin" | null
  >(null);

  const handleUpdateTitle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editTitle.trim() || editTitle.trim() === chat.title || isPending) {
      setIsEditing(false);
      return;
    }
    const targetTitle = editTitle.trim();
    setIsEditing(false);
    setCurrentAction("rename");

    startTransition(async () => {
      setOptimistic({ type: "update_title", id: chat.id, title: targetTitle });
      try {
        const res = await updateChat(chat.id, targetTitle);
        if (res.success) {
          onChatUpdated(chat.id, targetTitle);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCurrentAction(null);
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    setCurrentAction("delete");

    startTransition(async () => {
      setOptimistic({ type: "delete", id: chat.id });

      try {
        const res = await deleteChat(chat.id);
        if (res.success) {
          onChatDeleted(chat.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCurrentAction(null);
      }
    });
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    const nextPinState = !chat.isPinned;
    setCurrentAction("pin");

    startTransition(async () => {
      setOptimistic({
        type: "toggle_pin",
        id: chat.id,
        isPinned: nextPinState,
      });
      try {
        const res = await togglePinChat(chat.id, nextPinState);
        if (res.success) {
          onChatPinToggled(chat.id, nextPinState);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCurrentAction(null);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-accent border-b border-border/30 last:border-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MessageSquare className="h-3.5 2-3.5 text-foreground shrink-0" />
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle(e)}
            autoFocus
            className="text-xs font-medium bg-transparent text-foreground border-b border-border focus:border-foreground focus:outline-none flex-1 min-w-0 py-0.5"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={(e) => handleUpdateTitle(e)}
            className={
              "h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
            }
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditTitle(chat.title);
              setIsEditing(false);
            }}
            className={"h-6 w-6 text-muted-foreground hover:text-foreground"}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/chat/${chat.id}`}
      className={cn(
        "flex items-center justify-between p-3.5 bg-transparent hover:bg-accent/40 transition-colors group relative border-b border-border/30 last:border-0",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-24">
        {isPending && currentAction === "rename" ? (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
        ) : (
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors truncate" />
        )}

        <span
          className={cn(
            "text-xs font-medium text-muted-foreground group-hover::text-foreground truncate transition-colors ",

            isPending &&
              currentAction === "rename" &&
              "text-muted-foreground/40",
          )}
        >
          {chat.title}
        </span>

        {chat.isPinned && (
          <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0 rotate-45 ml-1" />
        )}
      </div>

      <div
        className="flex items-center gap-1.5 absolute right-3"
        onClick={(e) => e.preventDefault()}
      >
        <Button
          size="icon"
          variant={"ghost"}
          onClick={handleTogglePin}
          disabled={isPending}
          className={cn(
            "h-6 w-6 rounded-md border border-transparent transition-all shadow-sm",
            chat.isPinned
              ? "opacity-100 border-border/40 bg-background text-amber-500"
              : "opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-foreground hover:bg-background hover:border-border/40",
          )}
        >
          {isPending && currentAction === "pin" ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <Pin className={cn("h-3 w-3", chat.isPinned && "fill-amber-500")} />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              size="icon"
              variant="ghost"
              disabled={isPending && currentAction === "delete"}
              className={
                "h-6 w-6 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity rounded-md border border-transparent hover:border-border/60 hover:bg-background shadow-sm"
              }
            >
              {isPending && currentAction === "delete" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
              ) : (
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={
              "w-32 rounded-lg border-border/60 bg-background p-1 shadow-sm"
            }
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className={
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium  text-muted-foreground focus:bg-accent cursor-pointer"
              }
            >
              <Edit className="h-3 w-3" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className={
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium  text-muted-foreground focus:bg-accent cursor-pointer"
              }
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}
