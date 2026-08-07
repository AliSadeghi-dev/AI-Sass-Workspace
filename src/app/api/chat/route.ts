import { assertChatOwner, getAuthenticatedUser } from "@/lib/actions/ownership";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { AuthError, ForbiddenError } from "@/lib/error";
import {
  consumeMessageCredit,
  CreditsExhaustedError,
} from "@/lib/subscription/credits";
import { eq } from "drizzle-orm";

interface ValidStreamMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ValidStreamMessage[];
  chatId: string;
}

export async function POST(req: Request) {
  try {
    const { messages: messageHistory, chatId } =
      (await req.json()) as ChatRequestBody;

    if (!chatId || !messageHistory || messageHistory.length === 0) {
      return new Response("Missing required fields", { status: 400 });
    }

    const user = await getAuthenticatedUser();
    await assertChatOwner(user.id, chatId);
    await consumeMessageCredit(user.id);

    const lastUserMessage = messageHistory[messageHistory.length - 1];

    const userContent =
      typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : JSON.stringify(lastUserMessage.content);

    await db.insert(messages).values({
      chatId,
      role: "user",
      content: userContent,
    });

    if (messageHistory.length === 1) {
      void (async () => {
        try {
          let cleanTitle = userContent.trim();
          if (cleanTitle.length > 40) {
            cleanTitle = cleanTitle.substring(0, 37) + "...";
          }

          await db
            .update(chats)
            .set({ title: cleanTitle })
            .where(eq(chats.id, chatId));
        } catch (error) {
          console.error("Failed to update chat title", error);
        }
      })();
    }

    const filteredMessages = messageHistory.filter(
      (msg) => msg.content && msg.content.trim() !== "",
    );

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are Codevia AI, an elite software engineering assistant. provide crisp, high-end, premium structured responses.",
            },
            ...filteredMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        }),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq Raw Error:", errorText);
      return new Response(`Groq Error: ${groqResponse.statusText}`, {
        status: groqResponse.status,
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let accumulatedAIResponse = "";

    const stream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine || cleanedLine === "data: [DONE]") continue;

          if (cleanedLine.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(cleanedLine.slice(6));
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                accumulatedAIResponse += content;
                controller.enqueue(encoder.encode(content));
              }
            } catch (error) {
              console.error("Error parsing Groq response:", error);
            }
          }
        }
      },
      async flush(controller) {
        try {
          if (accumulatedAIResponse.trim()) {
            await db.insert(messages).values({
              chatId,
              role: "assistant",
              content: accumulatedAIResponse,
            });
          }
        } catch (error) {
          console.error("Error flushing Groq response:", error);
        }
      },
    });

    const responseStream = groqResponse.body?.pipeThrough(stream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return new Response("Forbidden", { status: 403 });
    }

    if (error instanceof CreditsExhaustedError) {
      return new Response(
        JSON.stringify({ error: "You have used all your messages credits" }),
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.error("Native fetch chat Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
