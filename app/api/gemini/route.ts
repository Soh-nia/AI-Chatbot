import { google } from "@ai-sdk/google";
import { type CoreMessage, streamText } from "ai";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { auth } from '@/auth';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, sessionId }: { messages: CoreMessage[]; sessionId?: string } = await req.json();
    const session = await auth();
    const chatSessionId = sessionId || nanoid();

    const result = await streamText({
        model: google("gemini-2.0-flash"),
        system: "You are a helpful assistant",
        messages,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            // Save user message for signed-in users
            if (session && messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.role === "user") {
                    await prisma.chatMessage.create({
                        data: {
                            userId: session.user.id,
                            sessionId: chatSessionId,
                            role: lastMessage.role,
                            content: lastMessage.content as string,
                        },
                    });
                }
            }

            // Stream response
            controller.enqueue(encoder.encode(`data: {"sessionId":"${chatSessionId}"}\n\n`));
            for await (const text of result.textStream) {
                controller.enqueue(encoder.encode(`data: {"text":"${text.replace(/\n/g, "\\n")}"}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));

            // Save assistant response
            if (session) {
                await prisma.chatMessage.create({
                    data: {
                        userId: session.user.id,
                        sessionId: chatSessionId,
                        role: "assistant",
                        content: await result.text,
                    },
                });
            }

            controller.close();
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
    });
}