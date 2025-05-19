import { auth } from '@/auth';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// import { revalidateTag } from 'next/cache'

export async function GET(req: Request) {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!session) {
        return NextResponse.json([]);
    }

    const chats = await prisma.chatMessage.groupBy({
        by: ["sessionId"],
        where: { userId: session.user.id },
        _max: { timestamp: true, content: true },
        orderBy: { _max: { timestamp: "desc" } },
        take: limit,
    });

    const recentChats = chats.map((chat, index) => ({
        id: chat.sessionId,
        title: chat._max.content?.slice(0, 30) || `Chat ${index + 1}`,
        timestamp: chat._max.timestamp?.toLocaleDateString() || "Today",
    }));

    return NextResponse.json(recentChats, {
        headers: {
            "Cache-Control": "no-store",
        },
    });


}