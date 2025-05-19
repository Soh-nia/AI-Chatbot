import { auth } from '@/auth';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!session) {
        return NextResponse.json([]);
    }

    // Use fetch with tagged cache
    const chats = await fetch(`http://localhost:3000/api/chats/data?userId=${session.user.id}&limit=${limit}`, {
        next: { tags: ["chats"] },
    }).then((res) => res.json());

    return NextResponse.json(chats, {
        headers: {
            "Cache-Control": "s-maxage=3600, stale-while-revalidate",
        },
    });
}

// Internal endpoint for data fetching (not exposed)
export async function GET_DATA(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!userId) {
        return NextResponse.json([]);
    }

    const chats = await prisma.chatMessage.groupBy({
        by: ["sessionId"],
        where: { userId },
        _max: { timestamp: true, content: true },
        orderBy: { _max: { timestamp: "desc" } },
        take: limit,
    });

    const recentChats = chats.map((chat, index) => ({
        id: chat.sessionId,
        title: chat._max.content?.slice(0, 30) || `Chat ${index + 1}`,
        timestamp: chat._max.timestamp?.toLocaleDateString() || "Today",
    }));

    return NextResponse.json(recentChats);
}