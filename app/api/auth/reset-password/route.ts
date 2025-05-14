import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, token, password } = await req.json()

        if (!email || !token || !password) {
            return NextResponse.json({ error: "Email, token, and password are required" }, { status: 400 })
        }

        // Find the verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: email.toLowerCase(),
                    token,
                },
            },
        })

        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
        }

        // Check if token is expired
        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: email.toLowerCase(),
                        token,
                    },
                },
            })
            return NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update the user's password
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { password: hashedPassword },
        })

        // Delete the used token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email.toLowerCase(),
                    token,
                },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: "An error occurred while resetting your password" }, { status: 500 })
    }
}