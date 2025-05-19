"use client";

import { useSession } from "next-auth/react";
import ChatLayoutClient from "./ChatLayoutClient";

export default function ChatLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <span className="animate-pulse text-slate-300">Loading...</span>
      </div>
    );
  }

  return <ChatLayoutClient session={session}>{children}</ChatLayoutClient>;
}