import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSideBar";
import FuturisticAIChatbot from "./ChatClient";
import BackgroundAnimation from "@/app/components/BackgroundAnimation";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <BackgroundAnimation />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/95"></div>

      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full min-h-screen">
          <header className="p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 z-10 sm:hidden">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <FuturisticAIChatbot />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}