import { getWorkspaces } from "@/lib/actions/workspaces";
import { PromptsLibrary } from "./_components/prompt-library";

export default async function PromptsPage() {
  const workspaces = await getWorkspaces();

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden px-8 pt-12 pb-6 max-w-4xl w-full mx-auto">
      <PromptsLibrary
        workspaces={workspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
        }))}
      />
    </div>
  );
}
