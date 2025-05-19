"use server";

import { auth } from '@/auth';
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteChat(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const sessionId = formData.get("sessionId") as string;
    if (!sessionId) {
        throw new Error("Session ID is required");
    }

    await prisma.chatMessage.deleteMany({
        where: {
            sessionId,
            userId: session.user.id,
        },
    });

    revalidatePath("/chat/lists");
    revalidateTag("chats");
}