
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/app/api/auth/[...nextauth]/oldroute"
// import AuthStatus from "@/components/auth-status"
// import { Button } from "@/components/ui/button"
import FuturisticAIChatbot from "./ChatClient"
// import Link from "next/link"

export default async function ChatPage() {
  // const session = await getServerSession(authOptions)
  // const isAuthenticated = !!session?.user

  return (
    // <div className="flex flex-col min-h-screen">
    //   <header className="border-b">
    //     <div className="container flex h-16 items-center justify-between">
    //       <div className="flex items-center gap-2">
    //         <h1 className="text-xl font-bold">AI Chatbot</h1>
    //       </div>
    //       <div className="flex items-center gap-4">
    //         <AuthStatus />
    //       </div>
    //     </div>
    //   </header>
    //   <main className="flex-1 container py-8">
    //     <div className="max-w-4xl mx-auto text-center">
    //       {/* {!isAuthenticated && (
    //         <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
    //           <p className="text-amber-800">
    //             You&apos;re using the chatbot in guest mode. Your conversations won&apos;t be saved.{" "}
    //             <Link href="/auth/signin" className="font-medium underline">
    //               Sign in
    //             </Link>{" "}
    //             to access all features.
    //           </p>
    //         </div>
    //       )} */}

    //       <h1 className="text-3xl font-bold mb-4">Chat with AI</h1>
    //       <p className="text-muted-foreground mb-8">
    //         Ask questions, get insights, and explore topics with our AI chatbot.
    //       </p>

    //       <div className="border rounded-lg p-4 h-[500px] flex flex-col">
    //         <div className="flex-1 overflow-y-auto mb-4 flex flex-col items-center justify-center text-muted-foreground">
    //           <p>Your conversation will appear here</p>
    //           <p className="text-sm">Start by typing a message below</p>
    //         </div>

    //         <div className="border-t pt-4">
    //           <div className="flex gap-2">
    //             <input
    //               type="text"
    //               placeholder="Type your message..."
    //               className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    //             />
    //             <Button>Send</Button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </main>
    // </div>
    <FuturisticAIChatbot />
  )
}
