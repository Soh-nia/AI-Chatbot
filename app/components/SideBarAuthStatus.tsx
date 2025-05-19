"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NavUser() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const { isMobile } = useSidebar();

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        <span className="animate-pulse">Loading...</span>
      </Button>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/signin" className="text-slate-300 hover:text-white transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-slate-500/50 border"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                <AvatarFallback className="rounded-lg">{session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight text-slate-300">
                <span className="truncate font-semibold">{session.user?.name || "User"}</span>
                <span className="truncate text-xs">{session.user?.email || "user@email.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg text-slate-300 border-slate-700/50 bg-slate-900/50 backdrop-blur-md"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={2}
          >
            {/* <DropdownMenuLabel>{session.user?.name || "User"}</DropdownMenuLabel>
            <DropdownMenuSeparator /> */}
            {/* <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex w-full" onClick={() => setOpenMobile(false)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex w-full" onClick={() => setOpenMobile(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}