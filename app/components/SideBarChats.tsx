import { auth } from '@/auth';

interface Chat {
  id: string;
  title: string;
  timestamp: string;
}

export async function SidebarChats() {
  const session = await auth();

  if (!session) {
    return { chats: [] };
  }

  const chats = await fetch(`http://localhost:3000/api/chats/data?userId=${session.user.id}&limit=5`, {
    next: { tags: ["chats"] },
  }).then((res) => res.json());

  return { chats: chats as Chat[] };
}