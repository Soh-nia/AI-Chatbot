"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import BackgroundAnimation from "@/app/components/BackgroundAnimation"
import { Header } from "@/app/components/Header"
import { SimpleFooter } from "@/app/components/Footer"
import { Lusitana } from "next/font/google"
import { useRouter, useSearchParams } from "next/navigation"

const lusitana = Lusitana({ subsets: ["latin"], weight: ["400", "700"] })

export const dynamic = "force-dynamic";

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const result = await signIn("google", { callbackUrl, redirect: false })
      if (result?.url) {
        window.location.href = result.url // Manually navigate to Google OAuth URL
      } else {
        throw new Error("No redirect URL returned")
      }
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.")
      console.error("Google sign-in error:", err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <BackgroundAnimation />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/80 to-slate-900"></div>

      <Header />

      <section className="relative z-10 pt-10 pb-16 md:pt-10 md:pb-14">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-white">
                  Welcome to{" "}
                  <span
                    className={`bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}
                  >
                    NOVA AI
                  </span>{" "}
                  Chatbot
                </CardTitle>
                <CardDescription className="text-center text-slate-300">
                  Sign in to access all features including saved chats and personalization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleCredentialsSignIn} className="space-y-4 mt-4 text-slate-300">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-sky-400 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium"
                    disabled={isLoading || googleLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm text-slate-300">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup" className="text-sky-400 hover:underline">
                    Sign up
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-300">Or</p>
                  <div className="mt-4">
                    <Button
                      onClick={handleGoogleSignIn}
                      variant="outline"
                      className="w-full bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                      disabled={isLoading || googleLoading}
                    >
                      {googleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                      )}
                      {googleLoading ? "Signing in..." : "Sign in with Google"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-slate-300">
                  By signing in, you agree to our{" "}
                  <Link href="/" className="text-sky-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/" className="text-sky-400 hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <SimpleFooter />
    </div>
  )
}