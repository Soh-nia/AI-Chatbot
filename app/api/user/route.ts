import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

        // Get usage data
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usage = await prisma.userUsage.findFirst({
            where: {
                userId: guestUserId,
                timestamp: {
                    gte: today
                }
            }
        });

        // Return user data
        return NextResponse.json({
            id: user.id,
            email: user.email,
            tone: user.tone,
            theme: user.theme,
            badges: user.badges,
            streak: user.streak,
            queryCount: usage?.queryCount || 0,
            imageCount: usage?.imageCount || 0
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}