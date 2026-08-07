import { AppSidebar } from "@/components/shared/dashboard/sidebar";
import { getUserSubscription } from "@/lib/actions/subscription";
import { getUserMetadata } from "@/lib/actions/user";
import { getWorkspaces } from "@/lib/actions/workspaces";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, subscription, workspacesList] = await Promise.all([
    getUserMetadata(),
    getUserSubscription(),
    getWorkspaces(),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen w-full bg-transparent text-foreground overflow-hidden antialiased">
      <AppSidebar
        user={user}
        subscription={subscription}
        workspaces={workspacesList}
      />

      <main className="flex-1 flex flex-col h-full bg-muted/20 p-6 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
