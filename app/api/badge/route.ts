import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const prisma = new PrismaClient();

const BADGE_THRESHOLDS = [
    { count: 1, name: 'First Chat' },
    { count: 10, name: 'Curious Mind' },
    { count: 25, name: 'Regular Chatter' },
    { count: 50, name: 'Conversation Pro' },
    { count: 100, name: 'Chat Master' }
];

export async function POST(req: NextRequest) {
    try {
        // For now, we'll use the guest user
        const guestUserId = 'guest';

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: guestUserId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get total query count
        const totalQueries = await prisma.chatMessage.count({
            where: {
                userId: guestUserId,
                role: 'user'
            }
        });

        // Check for new badges
        const currentBadges = user.badges as string[];
        const newBadges: string[] = [];

        for (const threshold of BADGE_THRESHOLDS) {
            if (totalQueries >= threshold.count && !currentBadges.includes(threshold.name)) {
                newBadges.push(threshold.name);
            }
        }

        // If there are new badges, update user and generate celebration message
        if (newBadges.length > 0) {
            const updatedBadges = [...currentBadges, ...newBadges];

            await prisma.user.update({
                where: { id: guestUserId },
                data: { badges: updatedBadges }
            });

            // Generate celebration message for the newest badge
            const newestBadge = newBadges[newBadges.length - 1];
            const { text: celebrationMessage } = await generateText({
                model: google('gemini-2.0-flash'),
                prompt: `Write a short, enthusiastic message (1-2 sentences) celebrating that the user earned the "${newestBadge}" badge for reaching ${totalQueries} chat messages.`,
            });

            return NextResponse.json({
                success: true,
                newBadges,
                celebrationMessage,
                allBadges: updatedBadges
            });
        }

        return NextResponse.json({
            success: true,
            newBadges: [],
            allBadges: currentBadges
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        return NextResponse.json({ error: 'Failed to check badges' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}