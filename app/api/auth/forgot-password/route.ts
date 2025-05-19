import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        // Always return success to prevent email enumeration attacks
        if (user) {
            // Generate a reset token
            const resetToken = crypto.randomBytes(32).toString("hex")
            const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

            // Store the token in VerificationToken
            await prisma.verificationToken.create({
                data: {
                    identifier: email.toLowerCase(),
                    token: resetToken,
                    expires: resetTokenExpiry,
                },
            })

            // In production, send an email with the reset link
            // For now, log it for testing
            // const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
            console.log(`Password reset requested for ${email}`)
            // console.log(`Reset link: ${resetLink}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
    }
}