import { google } from "@ai-sdk/google";
import { type CoreMessage, streamText } from "ai";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { auth } from "@/auth";
import {
  retrieveContext,
  buildContextBlock,
  RAG_SYSTEM_PROMPT,
  type RetrievedChunk,
} from "@/lib/rag/retrieve";

export const maxDuration = 60;

const BASE_SYSTEM_PROMPT = "You are a helpful assistant.";

type Body = {
  messages: CoreMessage[];
  sessionId?: string;
  /** Restrict retrieval to specific documents. Omit to search all of them. */
  documentIds?: string[];
  /** Set false to bypass retrieval for this turn. */
  useRag?: boolean;
};

export async function POST(req: Request) {
  const { messages, sessionId, documentIds, useRag = true }: Body =
    await req.json();

  const session = await auth();
  const userId = session?.user?.id;
  const chatSessionId = sessionId || nanoid();

  const lastMessage = messages[messages.length - 1];
  const lastUserText =
    lastMessage?.role === "user" && typeof lastMessage.content === "string"
      ? lastMessage.content
      : "";

  // ── Retrieval ────────────────────────────────────────────────────────────
  // Only for signed-in users: documents are scoped per user, and an anonymous
  // visitor has none. Failure here degrades to a normal chat, not a 500.
  let sources: RetrievedChunk[] = [];
  if (userId && useRag && lastUserText) {
    try {
      sources = await retrieveContext(userId, lastUserText, { documentIds });
    } catch (error) {
      console.error("[chat] retrieval failed, continuing without context:", error);
    }
  }

  const system =
    sources.length > 0
      ? `${RAG_SYSTEM_PROMPT}\n\nContext:\n\n${buildContextBlock(sources)}`
      : BASE_SYSTEM_PROMPT;

  let streamError: unknown = null;
  const result = streamText({
    model: google("gemini-flash-latest"),
    system,
    messages,
    onError: ({ error }) => {
      streamError = error;
      console.error("[chat] streamText error:", error);
    },
  });

  const encoder = new TextEncoder();
  // JSON.stringify the whole payload — the previous hand-built JSON string
  // broke on any quote or backslash in the model's output.
  const send = (payload: unknown) =>
    encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (userId && lastMessage?.role === "user") {
          await prisma.chatMessage.create({
            data: {
              userId,
              sessionId: chatSessionId,
              role: "user",
              content: lastUserText,
            },
          });
        }

        controller.enqueue(send({ sessionId: chatSessionId }));

        // Send citations up front so the UI can render them alongside the
        // answer rather than waiting for the stream to finish.
        if (sources.length > 0) {
          controller.enqueue(
            send({
              sources: sources.map((s, i) => ({
                index: i + 1,
                documentId: s.documentId,
                filename: s.filename,
                page: s.page,
                similarity: Number(Number(s.similarity).toFixed(3)),
                excerpt: s.content.slice(0, 240),
              })),
            })
          );
        }

        let full = "";
        for await (const text of result.textStream) {
          full += text;
          controller.enqueue(send({ text }));
        }

        if (streamError && !full) {
          const message =
            streamError instanceof Error
              ? streamError.message
              : "Something went wrong generating a response.";
          controller.enqueue(send({ error: message }));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        if (userId && full) {
          await prisma.chatMessage.create({
            data: {
              userId,
              sessionId: chatSessionId,
              role: "assistant",
              content: full,
            },
          });
        }
      } catch (error) {
        console.error("[chat] stream failed:", error);
        controller.enqueue(
          send({ error: "Something went wrong generating a response." })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
