import { auth } from '@/auth';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: unknown) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = context as { params: { sessionId: string } };
    const { sessionId } = params.params;

    const messages = await prisma.chatMessage.findMany({
        where: { sessionId, userId: session.user.id },
        orderBy: { timestamp: "asc" },
        select: { id: true, role: true, content: true, timestamp: true },
    });

    return NextResponse.json(messages, {
        headers: {
            "Cache-Control": "s-maxage=3600, stale-while-revalidate",
        },
    });
}