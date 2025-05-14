import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Define protected routes that require authentication
  const protectedRoutes = ["/profile", "/settings", "/analytics"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Allow access to all other routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*", "/analytics/:path*", "/chat/:path*"],
}
