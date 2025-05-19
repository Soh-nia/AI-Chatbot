import { auth } from '@/auth';
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Chatbot } from '@/app/components/ChatWindow';

export default async function ChatSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session) {
    return notFound();
  }

  const { sessionId } = await params;

  const chat = await prisma.chatMessage.findFirst({
    where: { sessionId, userId: session.user.id },
  });

  if (!chat) {
    return notFound();
  }

  return <Chatbot sessionId={sessionId} />;
}