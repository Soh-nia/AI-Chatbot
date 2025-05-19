"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Sparkles, MessagesSquare, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Lusitana } from "next/font/google";
import { NavUser } from "./SideBarAuthStatus";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const lusitana = Lusitana({ subsets: ["latin"], weight: ["400", "700"] });

interface Chat {
  id: string;
  title: string;
  timestamp: string;
}

export function AppSidebar() {
  const { data: session } = useSession();
  const { state, openMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const pathname = usePathname();
  const currentChatId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  // Fetch recent chats
  const fetchChats = useCallback(() => {
    if (session) {
      setIsChatsLoading(true);
      fetch("/api/chats", { cache: "no-store" })
        .then((res) => res.json())
        .then((data: Chat[]) => {
          setChats(data);
          setIsChatsLoading(false);
        })
        .catch(() => {
          setChats([]);
          setIsChatsLoading(false);
        });
    }
  }, [session]);

  useEffect(() => {
    fetchChats();
  }, [session, fetchChats]);

  // Listen for new chat events
  useEffect(() => {
    const handleNewChat = () => {
      fetchChats();
    };
    window.addEventListener("newChat", handleNewChat);
    return () => window.removeEventListener("newChat", handleNewChat);
  }, [fetchChats]);

  return (
    <Sidebar
      collapsible="icon"
      className={`bg-slate-900/50 backdrop-blur-md border-r border-slate-700/50 text-white [--background:30_41_59] [--popover:30_41_59] h-screen fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        openMobile ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 sm:static sm:w-20 ${isCollapsed ? "sm:w-20" : "sm:w-80"}`}
    >
      <SidebarHeader className="my-3 p-4 bg-slate-900/50 backdrop-blur-md min-h-0">
        {isCollapsed ? (
          <SidebarTrigger className="text-slate-400 hover:text-white" />
        ) : (
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Sparkles size={18} className="text-sky-400" />
            </div>
            <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>
              NOVA AI
            </span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="bg-slate-900/50 backdrop-blur-md flex-1 py-2 px-1 overflow-x-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="mx-2 mb-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white overflow-hidden"
            >
              <Link href="/chat">
                <Plus size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>New Chat</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="mx-1 mb-2 text-slate-300 hover:bg-slate-800/50 hover:text-white overflow-hidden">
              <Link href="/chat/lists" className="max-w-full">
                <MessagesSquare size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>Chats</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!isCollapsed && (
          <>
            <Separator className="bg-slate-700/50" />
            <ScrollArea className="flex-1 mt-2">
              <div className="px-2 text-xs font-medium text-slate-300 my-2">Recents</div>
              {isChatsLoading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                  <p className="mt-2 text-slate-300 text-sm">Loading chats...</p>
                </div>
              ) : (
                <SidebarMenu>
                  {chats.length === 0 ? (
                    <div className="px-2 text-slate-400 text-sm">No chats yet</div>
                  ) : (
                    chats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          asChild
                          className={`mx-1 w-full justify-start text-slate-300 hover:bg-slate-800/50 hover:text-white ${
                            currentChatId === chat.id ? "bg-slate-800/70 text-white" : ""
                          } overflow-hidden`}
                        >
                          <Link href={`/chat/${chat.id}`}>
                            <span className="truncate">{chat.title}</span>
                            <span className="ml-auto text-xs text-slate-500">{chat.timestamp}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              )}
            </ScrollArea>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}