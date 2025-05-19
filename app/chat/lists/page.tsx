import { auth } from '@/auth';
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, MessagesSquare, Trash2, X } from "lucide-react";
import { Lusitana } from "next/font/google";
import { deleteChat } from "@/app/lib/action";

const lusitana = Lusitana({ subsets: ["latin"], weight: ["400", "700"] });

interface Chat {
  sessionId: string;
  title: string;
  timestamp: Date | null;
}

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ search?: string | string[]; page?: string }> }) {
  const session = await auth();

  if (!session) {
    return notFound();
  }

  const resolvedParams = await searchParams;
  const search = Array.isArray(resolvedParams.search)
    ? resolvedParams.search[0] || ""
    : resolvedParams.search || "";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = 10;

  const chats = await prisma.chatMessage.groupBy({
    by: ["sessionId"],
    where: { userId: session.user.id },
    _max: { timestamp: true, content: true },
    orderBy: { _max: { timestamp: "desc" } },
  });

  const formattedChats: Chat[] = chats.map((chat, index) => ({
    sessionId: chat.sessionId,
    title: chat._max.content?.slice(0, 50) || `Chat ${index + 1}`,
    timestamp: chat._max.timestamp,
  }));

  const filteredChats = search
    ? formattedChats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()))
    : formattedChats;

  const totalChats = filteredChats.length;
  const totalPages = Math.ceil(totalChats / limit);
  const paginatedChats = filteredChats.slice((page - 1) * limit, page * limit);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className={`text-2xl font-bold text-white mb-6 ${lusitana.className}`}>Your Chat History</h1>
      {/* Search Form */}
      <form method="GET" className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            name="search"
            placeholder="Search chats by title..."
            defaultValue={search}
            className="w-full bg-slate-800/70 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 pr-10"
          />
          {search && (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
            >
              <X size={16} />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </form>
      <ScrollArea className="h-[calc(100vh-250px)] custom-scroll">
        {paginatedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessagesSquare size={48} className="mb-4" />
            <p className="text-lg">
              {search ? "No chats match your search." : "No chats yet. Start a new conversation!"}
            </p>
            <Link href="/chat" className="mt-4 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg">
              New Chat
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-md text-slate-100">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedChats.map((chat) => (
                  <tr
                    key={chat.sessionId}
                    className="border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/chat/${chat.sessionId}`}
                        className="text-sm text-white truncate block max-w-[200px] sm:max-w-[400px]"
                      >
                        {chat.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {chat.timestamp ? chat.timestamp.toLocaleDateString() : "Today"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteChat}>
                        <input type="hidden" name="sessionId" value={chat.sessionId} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 hover:bg-slate-600/50"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete chat</span>
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <Link
                  href={`/chat/lists?search=${encodeURIComponent(search)}&page=${Math.max(1, page - 1)}`}
                  className={`px-4 py-2 rounded-lg text-white ${
                    page === 1 ? "bg-slate-600 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500"
                  }`}
                >
                  <ArrowLeft />
                </Link>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/chat/lists?search=${encodeURIComponent(search)}&page=${p}`}
                      className={`px-3 py-1 rounded-lg text-white ${
                        p === page ? "bg-sky-600" : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/chat/lists?search=${encodeURIComponent(search)}&page=${Math.min(totalPages, page + 1)}`}
                  className={`px-4 py-2 rounded-lg text-white ${
                    page === totalPages ? "bg-slate-600 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500"
                  }`}
                >
                  <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}