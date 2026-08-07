"use client";

import { PromptPicker } from "@/components/shared/dashboard/prompt-picker";
import { Button } from "@/components/ui/button";
import { CREDITS_CONSUMED_EVENT } from "@/constants";
import { cn } from "@/lib/utils";
import { ArrowUp, Check, Copy, Loader2, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";
import type { Components, ExtraProps } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatId: string;
  workspaceId: string;
  initialMessages: LocalMessage[];
  userAvatarUrl: string;
  userFullName: string;
}

interface CustomCodeBlockProps {
  children: string;
  className?: string;
}

function CustomCodeBlock({ children, className }: CustomCodeBlockProps) {
  const [copied, setCopied] = React.useState<boolean>(false);
  const lang = className ? className.replace("language-", "") : "javascript";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-border/50 bg-[#282c34] font-mono text-[11px] shadow-md">
      <div className="flex h-8 items-center justify-between border-b border-[#1e222b] bg-[#21252b] px-4 text-[10px] text-muted-foreground/80 select-none">
        <span className="font-sans uppercase text-[9px] tracking-wider font-semibold text-muted-foreground/60">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 transition-colors hover:text-foreground text-muted-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <div className="overflow-x-auto text-xs">
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "11px",
            lineHeight: "1.6",
          }}
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function UserMessageAvatar({
  avatarUrl,
  fullName,
}: {
  avatarUrl: string;
  fullName: string;
}) {
  if (avatarUrl) {
    return (
      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted shadow-inner mt-1">
        <Image
          src={avatarUrl.split("?")[0]}
          alt={fullName}
          width={24}
          height={24}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="h-6 w-6 rounded-md border border-border/60 bg-muted flex items-center justify-center text-muted-foreground shadow-inner shrink-0 mt-1">
      <User className="h-3 w-3" />
    </div>
  );
}

const markdownRenderers: Components = {
  code({
    className,
    children,
    ...props
  }: ComponentPropsWithoutRef<"code"> & ExtraProps) {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <CustomCodeBlock className={className}>
        {String(children)}
      </CustomCodeBlock>
    ) : (
      <code
        className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-pink-600 dark:text-pink-400"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }: ComponentPropsWithoutRef<"p"> & ExtraProps) {
    return <p className="mb-2 leading-relaxed">{children}</p>;
  },
  strong({ children }: ComponentPropsWithoutRef<"strong"> & ExtraProps) {
    return (
      <strong className="font-semibold text-foreground">{children}</strong>
    );
  },
  ul({ children }: ComponentPropsWithoutRef<"ul"> & ExtraProps) {
    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
  },
  ol({ children }: ComponentPropsWithoutRef<"ol"> & ExtraProps) {
    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
  },
  li({ children }: ComponentPropsWithoutRef<"li"> & ExtraProps) {
    return <li className="leading-relaxed">{children}</li>;
  },
};

export function ChatInterface({
  chatId,
  workspaceId,
  initialMessages,
  userAvatarUrl,
  userFullName,
}: ChatInterfaceProps) {
  const router = useRouter();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollRafRef = React.useRef<number | null>(null);
  const streamRafRef = React.useRef<number | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] =
    React.useState<LocalMessage[]>(initialMessages);
  const [input, setInput] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [streamingMessageId, setStreamingMessageId] = React.useState<
    string | null
  >(null);

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (behavior === "auto") {
        container.scrollTop = container.scrollHeight;
        return;
      }

      container.scrollTo({ top: container.scrollHeight, behavior });
    },
    [],
  );

  const scheduleScrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }

      scrollRafRef.current = requestAnimationFrame(() => {
        scrollToBottom(behavior);
        scrollRafRef.current = null;
      });
    },
    [scrollToBottom],
  );

  React.useEffect(() => {
    scheduleScrollToBottom("auto");
  }, [scheduleScrollToBottom]);

  React.useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (streamRafRef.current !== null) {
        cancelAnimationFrame(streamRafRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    const previousMessages = messages;
    setInput("");
    setIsLoading(true);

    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessageContent,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    scheduleScrollToBottom("smooth");

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: LocalMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.status === 402) {
        setMessages(previousMessages);
        setInput(userMessageContent);
        toast.error("You have used all your message credits.", {
          description: "Upgrade your plan in Settings to continue chatting.",
        });
        return;
      }

      if (!response.ok || !response.body) {
        setMessages(previousMessages);
        setInput(userMessageContent);
        toast.error("Failed to send message. Please try again.");
        return;
      }

      window.dispatchEvent(new CustomEvent(CREDITS_CONSUMED_EVENT));

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessageId);
      scheduleScrollToBottom("auto");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      const flushStreamUpdate = () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText }
              : msg,
          ),
        );
        scheduleScrollToBottom("auto");
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        if (streamRafRef.current === null) {
          streamRafRef.current = requestAnimationFrame(() => {
            flushStreamUpdate();
            streamRafRef.current = null;
          });
        }
      }

      if (streamRafRef.current !== null) {
        cancelAnimationFrame(streamRafRef.current);
        streamRafRef.current = null;
      }

      flushStreamUpdate();
      setStreamingMessageId(null);
      scheduleScrollToBottom("auto");

      window.setTimeout(() => router.refresh(), 300);
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(previousMessages);
      setInput(userMessageContent);
      setStreamingMessageId(null);
      toast.error("Something went wrong while streaming the response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const fakeEvent = {
          preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>;
        void handleChatSubmit(fakeEvent);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-transparent">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin overscroll-contain"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {messages.map((msg: LocalMessage) => {
            const isUser = msg.role === "user";
            const isStreamingThis =
              !isUser && isLoading && msg.id === streamingMessageId;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-4 animate-in fade-in duration-200",
                  isUser ? "justify-end" : "justify-start",
                )}
              >
                {!isUser && (
                  <div className="h-6 w-6 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground shadow-sm shrink-0 mt-1">
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed transition-all",
                    isUser
                      ? "bg-accent text-accent-foreground border border-border/40 shadow-sm"
                      : "text-foreground font-normal w-full",
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : isStreamingThis ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 text-foreground/90 selection:bg-accent/50">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownRenderers}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <UserMessageAvatar
                    avatarUrl={userAvatarUrl}
                    fullName={userFullName}
                  />
                )}
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-4 max-w-3xl mx-auto animate-pulse">
              <div className="h-6 w-6 rounded-md border border-border/40 bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
              <span className="text-[11px] text-muted-foreground/60 italic">
                Codevia AI is generating response...
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-6 px-8 z-10 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <form
            onSubmit={(e) => void handleChatSubmit(e)}
            className="relative flex items-center border border-border/50 bg-background rounded-xl p-1.5 shadow-sm focus-within:border-border transition-all"
          >
            <PromptPicker
              workspaceId={workspaceId}
              disabled={isLoading}
              onSelect={(content) => {
                setInput(content);
                textareaRef.current?.focus();
              }}
            />
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Codevia AI anything..."
              disabled={isLoading}
              className="w-full resize-none bg-transparent pl-10 pr-12 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[32px] max-h-[160px] leading-relaxed"
            />

            <div className="absolute right-2.5 bottom-2.5">
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-7 w-7 rounded-lg bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-colors flex items-center justify-center disabled:opacity-30"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </form>
          <p className="text-[10px] text-center text-muted-foreground/40 mt-2">
            Codevia AI can make mistakes. Verify important code blocks.
          </p>
        </div>
      </div>
    </div>
  );
}
