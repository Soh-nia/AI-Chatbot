"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import BackgroundAnimation from "@/app/components/BackgroundAnimation"
import { Header } from "@/app/components/Header"
import { SimpleFooter } from "@/app/components/Footer"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setIsEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
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
                <CardTitle className="text-2xl font-bold text-center text-white">Reset Your Password</CardTitle>
                <CardDescription className="text-center text-slate-300">
                  Enter your email address to receive password reset instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isEmailSent ? (
                  <div className="text-center p-4">
                    <h3 className="font-medium text-lg">Check your email</h3>
                    <p className="text-slate-300 mt-2">
                      If an account exists for {email}, we’ve sent password reset instructions.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      (For testing, check the server console for the reset link.)
                    </p>
                    <Button asChild variant="link" className="mt-4 text-sky-400">
                      <Link href="/auth/signin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-slate-300">
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
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Instructions"
                      )}
                    </Button>
                    <Button asChild variant="link" className="w-full text-sky-400">
                      <Link href="/auth/signin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                      </Link>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SimpleFooter />
    </div>
  )
}