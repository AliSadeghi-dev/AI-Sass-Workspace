import { assertChatOwner, getAuthenticatedUser } from "@/lib/actions/ownership";
import { getUserMetadata } from "@/lib/actions/user";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatInterface } from "./_components/chat-interface";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

interface FormattedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;

  if (!chatId) {
    notFound();
  }

  let currentChat;

  try {
    const user = await getAuthenticatedUser();
    currentChat = await assertChatOwner(user.id, chatId);
  } catch (error) {
    notFound();
  }

  const initialMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: [asc(messages.created_at)],
  });

  const formattedMessages: FormattedMessage[] = initialMessages.map((msg) => {
    const safeRole: "user" | "assistant" =
      msg.role === "user" || msg.role === "assistant" ? msg.role : "user";

    return {
      id: msg.id,
      role: safeRole,
      content: msg.content,
    };
  });

  const userMetadata = await getUserMetadata();

  return (
    <div className="flex flex-1 flex-col bg-transparent h-full overflow-hidden">
      <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 sm:px-8 shrink-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/dashboard?workspace=${currentChat.workspaceId}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Back to workspace chats"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pluse shrink-0" />
          <h2 className="text-xs font-semibold text-foreground truncate max-w-md">
            {currentChat.title}
          </h2>
        </div>
      </div>

      <ChatInterface
        chatId={chatId}
        workspaceId={currentChat.workspaceId}
        initialMessages={formattedMessages}
        userAvatarUrl={userMetadata?.avatarUrl ?? ""}
        userFullName={userMetadata?.fullName ?? "user"}
      />
    </div>
  );
}
