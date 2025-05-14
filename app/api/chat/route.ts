import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { messages, sessionId } = await req.json();
        console.log('Received messages:', messages);
        console.log('Session ID:', sessionId);

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('Invalid or empty messages array');
        }

        const lastMessage = messages[messages.length - 1].content;
        if (!lastMessage) {
            throw new Error('Last message content is empty');
        }

        // Ensure guest user exists
        const guestUserId = 'guest';
        let user = await prisma.user.findUnique({
            where: { id: guestUserId },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: guestUserId,
                    email: 'guest@example.com',
                    tone: 'casual',
                    theme: 'light',
                    badges: [],
                    streak: 0,
                },
            });
            console.log('Created guest user:', user);
        }

        // === RATE LIMITING LOGIC ===
        // Get current hour usage
        const hourAgo = new Date();
        hourAgo.setHours(hourAgo.getHours() - 1);

        const hourlyUsage = await prisma.chatMessage.count({
            where: {
                userId: guestUserId,
                role: 'user',
                timestamp: {
                    gte: hourAgo
                }
            }
        });

        // Get current day usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyUsage = await prisma.chatMessage.count({
            where: {
                userId: guestUserId,
                role: 'user',
                timestamp: {
                    gte: today
                }
            }
        });

        // Check rate limits
        if (hourlyUsage >= 50) {
            return NextResponse.json(
                { error: 'Hourly limit reached (50 queries). Please try again later.' },
                { status: 429 }
            );
        }

        if (dailyUsage >= 100) {
            return NextResponse.json(
                { error: 'Daily limit reached (100 queries). Please try again tomorrow.' },
                { status: 429 }
            );
        }
        // === END RATE LIMITING LOGIC ===

        // Clean messages by removing parts
        const cleanedMessages = messages.map(({ role, content }) => ({ role, content }));
        console.log('Cleaned messages:', cleanedMessages);

        // Save user message to Prisma
        await prisma.chatMessage.create({
            data: {
                userId: guestUserId,
                sessionId,
                role: 'user',
                content: lastMessage,
            },
        });

        // Stream AI response using Google Gemini
        let response;
        try {
            response = await streamText({
                model: google('gemini-2.0-flash'),
                messages: cleanedMessages,
                system: 'You are a helpful assistant with a casual tone.',
            });
        } catch (geminiError) {
            console.error('Google Gemini streamText error:', geminiError);
            throw new Error(`Google Gemini error: ${geminiError.message}`);
        }

        // Log stream completion
        response.onFinish = async (result) => {
            console.log('AI response:', result.text);
            await prisma.chatMessage.create({
                data: {
                    userId: guestUserId,
                    sessionId,
                    role: 'assistant',
                    content: result.text,
                },
            });

            // Update user usage statistics
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingUsage = await prisma.userUsage.findFirst({
                where: {
                    userId: guestUserId,
                    timestamp: {
                        gte: today
                    }
                }
            });

            if (existingUsage) {
                await prisma.userUsage.update({
                    where: { id: existingUsage.id },
                    data: { queryCount: existingUsage.queryCount + 1 }
                });
            } else {
                await prisma.userUsage.create({
                    data: {
                        userId: guestUserId,
                        queryCount: 1,
                        imageCount: 0,
                        timestamp: today
                    }
                });
            }

            // Update streak if needed
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (user.lastActive) {
                const lastActiveDate = new Date(user.lastActive);
                lastActiveDate.setHours(0, 0, 0, 0);

                if (lastActiveDate.getTime() === yesterday.getTime()) {
                    // User was active yesterday, increment streak
                    await prisma.user.update({
                        where: { id: guestUserId },
                        data: {
                            streak: user.streak + 1,
                            lastActive: new Date()
                        }
                    });
                } else if (lastActiveDate.getTime() < yesterday.getTime()) {
                    // User wasn't active yesterday, reset streak
                    await prisma.user.update({
                        where: { id: guestUserId },
                        data: {
                            streak: 1,
                            lastActive: new Date()
                        }
                    });
                } else {
                    // User was already active today, just update lastActive
                    await prisma.user.update({
                        where: { id: guestUserId },
                        data: { lastActive: new Date() }
                    });
                }
            } else {
                // First activity
                await prisma.user.update({
                    where: { id: guestUserId },
                    data: {
                        streak: 1,
                        lastActive: new Date()
                    }
                });
            }
        };

        return response.toDataStreamResponse();
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to get response', details: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}