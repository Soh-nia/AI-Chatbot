"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSideBar";
import BackgroundAnimation from "@/app/components/BackgroundAnimation";
import { Session } from "next-auth";
import { ChatHeader } from "../components/Header";

export default function ChatLayoutClient({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-slate-900 text-white relative overflow-hidden flex">
      <BackgroundAnimation />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/95"></div>

      {session ? (
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 z-10 sm:hidden">
              <SidebarTrigger className="text-slate-400 hover:text-white" />
            </header>
            <main className="flex-1 p-4 sm:p-6 overflow-auto text-slate-300">{children}</main>
          </div>
        </SidebarProvider>
      ) : (
        <div className="flex flex-col flex-1">
          <ChatHeader />
          <main className="flex-1 p-4 sm:p-6 overflow-auto text-slate-300">{children}</main>
        </div>
      )}
    </div>
  );
}