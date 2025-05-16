"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Sparkles, MessagesSquare } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Lusitana } from 'next/font/google';

const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'], });

interface Chat {
  id: number;
  title: string;
  timestamp: string;
}

export function AppSidebar() {
  const { state, openMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, title: "Data Analysis Task", timestamp: "10:04 AM" },
    { id: 2, title: "Project Planning", timestamp: "Yesterday" },
    { id: 3, title: "Code Review", timestamp: "2 days ago" },
    { id: 4, title: "Team Meeting", timestamp: "3 days ago" },
    { id: 5, title: "Bug Fix", timestamp: "4 days ago" },
    { id: 6, title: "Feature Request", timestamp: "5 days ago" },
  ]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: chats.length + 1,
      title: `New Chat ${chats.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat.id);
  };

  // Limit to 5 recent chats
  const recentChats = chats.slice(0, 5);

  return (
    <Sidebar
      collapsible="icon"
      className={`bg-slate-900/50 backdrop-blur-md border-r border-slate-700/50 text-white [--background:30_41_59] [--popover:30_41_59] fixed inset-y-0 inset-x-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        openMobile ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 sm:static sm:w-[160px] ${isCollapsed ? "sm:w-16" : "sm:w-64"}`}
    >
      <SidebarHeader className="my-2 p-4 bg-slate-900/50 backdrop-blur-md min-h-0">
        {isCollapsed ? (
          <SidebarTrigger className="text-slate-400 hover:text-white"  />
        ) : (
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Sparkles size={18} className="text-sky-400" />
            </div>
            <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>NOVA AI</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="bg-slate-900/50 backdrop-blur-md">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleNewChat}
              className="mx-2 mb-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white overflow-hidden"
              asChild
            >
              <div>
                <Plus size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>New Chat</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="mx-2 mb-2 text-slate-300 hover:bg-slate-800/50 hover:text-white overflow-hidden">
              <Link href="/chats">
                <MessagesSquare size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>Chats</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!isCollapsed && (
          <>
            <Separator className="bg-slate-700/50" />
            <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="p-4 text-xs font-medium text-slate-300 my-2">
                Recents
              </div>
              <SidebarMenu>
                {recentChats.length === 0 ? (
                  <div className="p-4 text-slate-400 text-sm">No chats yet</div>
                ) : (
                  recentChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => setSelectedChat(chat.id)}
                        className={`mx-2 w-full justify-start text-slate-300 hover:bg-slate-800/50 hover:text-white ${
                          selectedChat === chat.id ? "bg-slate-800/70 text-white" : ""
                        } overflow-hidden`}
                      >
                        <span className="truncate">{chat.title}</span>
                        <span className="ml-auto text-xs text-slate-500">{chat.timestamp}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}