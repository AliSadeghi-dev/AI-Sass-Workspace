"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getPrompts } from "@/lib/actions/prompts";
import { BookMarked, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PromptPickerProps {
  workspaceId: string;
  onSelect: (content: string) => void;
  disabled?: boolean;
}

interface PromptItem {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
}

export function PromptPicker({
  workspaceId,
  onSelect,
  disabled,
}: PromptPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [promptsList, setPromptsList] = React.useState<PromptItem[]>([]);
  const [prevOpen, setPrevOpen] = React.useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsLoading(true);
    }
  }

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void (async () => {
      try {
        const data = await getPrompts(workspaceId);
        if (cancelled) return;
        setPromptsList(data);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("Failed to load prompts.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="absolute left-2.5 bottom-2.5 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40"
          aria-label="Insert prompt"
        >
          <BookMarked className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-0 bg-popover border-border rounded-xl overflow-hidden"
      >
        <div className="px-3 py-2 border-b border-border/60">
          <p className="text-xs font-semibold text-foreground">
            Prompt Library
          </p>
          <p className="text-[10px] text-muted-foreground">
            Insert a saved prompt into your message
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
            </div>
          ) : promptsList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              No prompts available for this workspace yet.
            </p>
          ) : (
            promptsList.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => {
                  onSelect(prompt.content);
                  setOpen(false);
                  toast.success(`Inserted "${prompt.title}"`);
                }}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-accent/40 transition-colors"
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {prompt.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                  {prompt.content}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
