import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        name?: string | null
        email?: string | null
        picture?: string | null
    }
}

declare module "next/server" {
    interface ResponseInit {
        next?: {
            tags?: string[];
        };
    }
}