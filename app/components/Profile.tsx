import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/oldroute"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AuthStatus from "@/components/auth-status"
import { Award, Calendar, MessageSquare } from "lucide-react"

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email || "" },
    include: {
      messages: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const badges = JSON.parse(user.badges.toString())
  const messageCount = user.messages.length

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">AI Chatbot</h1>
          </div>
          <div className="flex items-center gap-4">
            <AuthStatus />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messageCount}</div>
                <p className="text-xs text-muted-foreground">Messages exchanged with the AI</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.streak} days</div>
                <p className="text-xs text-muted-foreground">
                  {user.streak > 0 ? "Keep it going!" : "Start chatting to build your streak"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{badges.length}</div>
                <p className="text-xs text-muted-foreground">
                  {badges.length > 0 ? "Great achievements!" : "Earn badges by using the chatbot"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements you&apos;ve earned through your interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      <Award className="h-4 w-4 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You haven&apos;t earned any badges yet. Start chatting to earn your first badge!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Your preferences and account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Response Tone</h3>
                  <p className="text-muted-foreground capitalize">{user.tone}</p>
                </div>
                <div>
                  <h3 className="font-medium">Theme Preference</h3>
                  <p className="text-muted-foreground capitalize">{user.theme}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
