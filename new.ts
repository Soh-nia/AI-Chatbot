import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import sendgrid from "@sendgrid/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (user) {
            // Generate a reset token
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

            // Store the token in VerificationToken
            await prisma.verificationToken.create({
                data: {
                    id: crypto.randomUUID(),
                    identifier: email.toLowerCase(),
                    token: resetToken,
                    expires: resetTokenExpiry,
                },
            });

            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

            // Configure email transport
            if (process.env.EMAIL_PROVIDER === "sendgrid") {
                if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
                    throw new Error("SendGrid API key or sender email is missing");
                }

                sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

                const msg = {
                    to: email,
                    from: process.env.EMAIL_FROM,
                    subject: "NOVA AI Chatbot - Password Reset Request",
                    html: `
            <p>Hello,</p>
            <p>You requested a password reset for your NOVA AI Chatbot account.</p>
            <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn’t request this, please ignore this email.</p>
            <p>Best regards,<br>NOVA AI Team</p>
          `,
                };

                await sendgrid.send(msg);
                console.log(`Password reset email sent to ${email} via SendGrid`);
            } else {
                // Log a warning if no email provider is configured
                console.warn(`No email provider configured for ${email}. Reset link: ${resetLink}`);
            }

            // Log the link in development for testing
            if (process.env.NODE_ENV === "development") {
                console.log(`Password reset requested for ${email}`);
                console.log(`Reset link: ${resetLink}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ success: true });
    }
}