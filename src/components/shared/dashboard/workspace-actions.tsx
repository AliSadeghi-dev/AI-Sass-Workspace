"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteWorkspace, updateWorkspace } from "@/lib/actions/workspaces";
import { Edit2, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Workspace {
  id: string;
  name: string;
  profileId: string;
  created_at: Date | null;
}

interface WorkspaceActionsProps {
  workspace: Workspace;
  isActive: boolean;
  onClearActive: () => void;
}

export function WorkspaceActions({
  workspace,
  isActive,
  onClearActive,
}: WorkspaceActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(workspace.name);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSaveEdit = async () => {
    if (!editName.trim() || isPending) return;

    try {
      setIsPending(true);
      const res = await updateWorkspace(workspace.id, editName);

      if (res.success) {
        setIsEditOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isPending) return;
    try {
      setIsPending(true);
      const res = await deleteWorkspace(workspace.id);
      if (res.success) {
        setIsDeleteOpen(false);
        if (isActive) {
          onClearActive();
        }

        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={"bg-popover border-border rounded-xl w-32"}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
            className={"text-xs flex items-center gap-2 cursor-pointer"}
          >
            <Edit2 className="w-3 h-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
            className={
              "text-xs flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            }
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className={"bg-popover border-border rounded-2xl max-2-sm"}
        >
          <DialogHeader>
            <DialogTitle className={"text-sm font-semibold"}>
              Rename Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded-xl border-border h-9 text-xs"
              maxLength={30}
              disabled={isPending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setIsEditOpen(false)}
              className={"rounded-xl text-xs"}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size={"sm"}
              onClick={handleSaveEdit}
              className={"rounded-xl text-xs"}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className={"bg-popover border-border rounded-2xl max-w-sm"}
        >
          <DialogHeader>
            <DialogTitle className={"text-sm font-semibold text-destructive"}>
              Delete Workspace
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed py-2">
            Are you sure you want to deleteWorkspace
            <span className="font-bold text-foreground">{workspace.name}</span>?
            this action can not be undone.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant={"outline"}
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              className={"rounded-xl text-xs"}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              variant={"destructive"}
              size="sm"
              onClick={handleConfirmDelete}
              className={"rounded-xl text-xs"}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
