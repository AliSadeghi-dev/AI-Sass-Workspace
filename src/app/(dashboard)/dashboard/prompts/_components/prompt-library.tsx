"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROMPT_CATEGORIES } from "@/constants";
import {
  createPrompt,
  deletePrompt,
  getPrompts,
  toggleFavoritePrompt,
  updatePrompt,
} from "@/lib/actions/prompts";
import { createZodResolver } from "@/lib/resolvers";
import { promptSchema, type promptFormValues } from "@/lib/validation/prompt";
import {
  BookMarked,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  workspaceId: string | null;
  createdAt: Date;
}

interface PromptsLibraryProps {
  workspaces: { id: string; name: string }[];
}

export function PromptsLibrary({ workspaces }: PromptsLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeWorkspaceId = searchParams.get("workspaceId") || "";

  const [promptsList, setPromptsList] = React.useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadedWorkspaceId, setLoadedWorkspaceId] =
    React.useState(activeWorkspaceId);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [scopeWorkspaceId, setScopeWorkspaceId] = React.useState<string>("");

  if (loadedWorkspaceId !== activeWorkspaceId) {
    setLoadedWorkspaceId(activeWorkspaceId);
    setIsLoading(true);
    setPromptsList([]);
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<promptFormValues>({
    resolver: createZodResolver(promptSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "GENERAL",
      workspaceId: null,
    },
  });

  const mapPrompts = React.useCallback(
    (data: Awaited<ReturnType<typeof getPrompts>>) =>
      data.map((prompt) => ({
        ...prompt,
        createdAt: new Date(prompt.createdAt),
      })),
    [],
  );

  const loadPrompts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPrompts(activeWorkspaceId || null);
      setPromptsList(mapPrompts(data));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load prompts.");
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, mapPrompts]);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await getPrompts(activeWorkspaceId || null);
        if (cancelled) return;
        setPromptsList(mapPrompts(data));
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
  }, [activeWorkspaceId, mapPrompts]);

  const openCreateDialog = () => {
    setEditingPrompt(null);
    setScopeWorkspaceId(activeWorkspaceId);
    reset({
      title: "",
      content: "",
      category: "GENERAL",
      workspaceId: activeWorkspaceId || null,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setScopeWorkspaceId(prompt.workspaceId ?? "");
    reset({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category as promptFormValues["category"],
      workspaceId: prompt.workspaceId,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: promptFormValues) => {
    try {
      setIsSaving(true);
      const payload = {
        ...values,
        workspaceId: scopeWorkspaceId || null,
      };

      const result = editingPrompt
        ? await updatePrompt(editingPrompt.id, payload)
        : await createPrompt(payload);

      if (!result.success) {
        toast.error(result.error ?? "Failed to save prompt.");
        return;
      }

      toast.success(editingPrompt ? "Prompt updated." : "Prompt created.");
      setDialogOpen(false);
      await loadPrompts();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving the prompt.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePrompt(id);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete prompt.");
      return;
    }
    toast.success("Prompt deleted.");
    setPromptsList((prev) => prev.filter((prompt) => prompt.id !== id));
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    const result = await toggleFavoritePrompt(prompt.id, !prompt.isFavorite);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update favorite.");
      return;
    }
    setPromptsList((prev) =>
      prev.map((item) =>
        item.id === prompt.id
          ? { ...item, isFavorite: !prompt.isFavorite }
          : item,
      ),
    );
  };

  const filteredPrompts = promptsList.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || prompt.category === categoryFilter;
    const matchesFavorite = !showFavoritesOnly || prompt.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const workspaceNameById = (id: string | null) => {
    if (!id) return "All workspaces";
    return workspaces.find((ws) => ws.id === id)?.name ?? "Workspace";
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 border-b border-border/40 pb-6 shrink-0">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <BookMarked className="h-3.5 w-3.5 text-foreground/80" />
              Prompt Library
            </h1>
            <p className="text-xs text-muted-foreground/80">
              Save reusable prompts and insert them directly into chat.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="h-8 rounded-lg text-xs font-medium px-3 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Prompt
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/80 shadow-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-border/50 bg-background px-3 text-xs text-foreground"
          >
            <option value="all">All categories</option>
            {PROMPT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className="h-8 rounded-lg text-xs px-3"
          >
            <Star className="h-3.5 w-3.5 mr-1.5" />
            Favorites
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-10">
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-xl bg-muted/5">
            <BookMarked className="h-5 w-5 text-muted-foreground/50 mb-3" />
            <p className="text-xs font-medium text-foreground">
              No prompts yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Create your first reusable prompt to speed up your AI workflows.
            </p>
            <Button
              onClick={openCreateDialog}
              className="mt-4 h-8 rounded-lg text-xs px-4"
            >
              Create Prompt
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-xl border border-border/50 bg-background p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-semibold text-foreground truncate">
                        {prompt.title}
                      </h3>
                      <span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                        {prompt.category}
                      </span>
                      <span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                        {workspaceNameById(prompt.workspaceId)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {prompt.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleToggleFavorite(prompt)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 transition-colors"
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          prompt.isFavorite
                            ? "fill-amber-500 text-amber-500"
                            : ""
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditDialog(prompt)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Edit prompt"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(prompt.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete prompt"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-popover border border-border rounded-2xl max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingPrompt ? "Edit Prompt" : "Create Prompt"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="title"
                  className="h-9 rounded-xl text-xs"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-[11px] text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs">
                  Prompt content
                </Label>
                <textarea
                  id="content"
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-border/80 resize-none"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-[11px] text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs">
                    Category
                  </Label>
                  <select
                    id="category"
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs"
                    {...register("category")}
                  >
                    {PROMPT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="scope" className="text-xs">
                    Scope
                  </Label>
                  <select
                    id="scope"
                    value={scopeWorkspaceId}
                    onChange={(e) => setScopeWorkspaceId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs"
                  >
                    <option value="">All workspaces</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl text-xs h-9"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs h-9"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : editingPrompt ? (
                  "Save changes"
                ) : (
                  "Create prompt"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
