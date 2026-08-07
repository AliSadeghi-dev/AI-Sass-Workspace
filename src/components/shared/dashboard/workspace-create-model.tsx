"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "@/lib/actions/workspaces";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface WorkspaceCreateModelProps {
  children?: React.ReactNode;
}

export function WorkspaceCreateModel({ children }: WorkspaceCreateModelProps) {
  const router = useRouter();
  const [isOpen, SetIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIscreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    try {
      setIscreating(true);
      const result = await createWorkspace(name);
      if (result.success && result.data) {
        setName("");
        SetIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create workspace");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIscreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={SetIsOpen}>
      <DialogTrigger>
        {children ? (
          children
        ) : (
          <Button
            variant={"ghost"}
            size={"icon"}
            className={
              "h-5 w-5 text-muted-foreground hover:text-foreground rounded-md"
            }
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={"bg-popover border border-border rounded-2xl max-w-sm"}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className={"text-foreground text-base font-semibold"}>
              create workspace
            </DialogTitle>
            <DialogDescription className={"text-muted-foreground text-xs"}>
              create a new space to organize your AI chats and projects.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="workspace-name"
                className="text-xs text-muted-foreground font-medium"
              >
                workspace name
              </label>
              <Input
                id="workspace-name"
                placeholder="e.g., Nextjs saas, German study"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-border h-9 text-xs"
                maxLength={30}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => SetIsOpen(false)}
              className={"rounded-xl border-border text-xs h-9"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={
                "rounded-xl text-xs h-9 bg-primary text-primary-foreground font-medium"
              }
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating....
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
