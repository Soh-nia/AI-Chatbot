"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Send, Sparkles, SquareIcon, ArrowDown, Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

function TypingAnimation() {
  return (
    <div className="flex items-center space-x-1 p-3 bg-slate-800/50 rounded-lg max-w-[70%]">
      <div className="h-2 w-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="h-2 w-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="h-2 w-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
}

export function Chatbot({ sessionId }: { sessionId?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load existing messages for specific chat
  useEffect(() => {
    if (sessionId && session) {
      setIsChatLoading(true);
      fetch(`/api/chats/${sessionId}`)
        .then((res) => res.json())
        .then((data: ChatMessage[]) => {
          setMessages(data);
          setIsChatLoading(false);
        })
        .catch(() => {
          setMessages([]);
          setIsChatLoading(false);
        });
    } else {
      setMessages([]);
      setIsChatLoading(false);
    }
  }, [sessionId, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (scrollAreaRef.current && !isChatLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, isChatLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], sessionId }),
        signal: abortControllerRef.current.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let newSessionId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.sessionId) {
                newSessionId = parsed.sessionId;
              } else if (parsed.text) {
                assistantMessage.content += parsed.text;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { ...assistantMessage, content: assistantMessage.content },
                ]);
                scrollToBottom();
              }
            } catch {}
          }
        }
      }

      if (newSessionId && session) {
        window.dispatchEvent(new CustomEvent("newChat", { detail: { sessionId: newSessionId } }));
        router.push(`/chat/${newSessionId}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Response stopped." },
        ]);
      } else {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong." },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative max-w-5xl mx-auto">
      <ScrollArea className="flex-1 py-4 px-4 custom-scroll" ref={scrollAreaRef}>
        {isChatLoading ? (
          <div className="flex flex-col items-center justify-center h-full my-20">
            <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            <p className="mt-2 text-slate-300">Loading chat...</p>
          </div>
        ) : (
          <div className="flex flex-col mx-auto">
            {messages.length === 0 && !sessionId ? (
              <>
                <Alert className="mb-4 bg-slate-800/70 border-sky-800 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  <AlertTitle className="text-sky-400">New Conversation</AlertTitle>
                </Alert>
                <div className="flex flex-col items-center justify-center my-10">
                  <p className="text-4xl font-bold mb-4 text-slate-300 text-center">How can I help you today?</p>
                </div>
              </>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[70%] ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800/50 text-slate-100 backdrop-blur-sm border border-slate-700"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <pre className="bg-slate-800 px-1 rounded text-slate-100 overflow-x-auto">
                              <code {...props} className={className}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code {...props} className="bg-slate-800 px-2 rounded overflow-x-auto">
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === "user" && <TypingAnimation />}
            <div ref={messagesEndRef} />
          </div>
        )}
        {messages.length > 0 && !isChatLoading && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-24 right-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white border-slate-700/50 z-50 shadow-lg opacity-100"
            onClick={scrollToBottom}
          >
            <ArrowDown size={16} />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </ScrollArea>
      <div className="sticky bottom-0 p-4 border-t border-slate-700/50 backdrop-blur-md bg-slate-900/50 z-10">
        <div className="relative flex items-center">
          <Textarea
            className="w-full bg-slate-800/70 border border-slate-700 shadow-lg shadow-sky-900/20 rounded-2xl py-3 pl-4 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-h-[64px]"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isChatLoading}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant..."
          />
          {!isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || isChatLoading}
              className="absolute bottom-3 right-3 rounded-full bg-sky-600 hover:bg-sky-500"
            >
              <Send size={14} className="text-white" />
              <span className="sr-only">Send</span>
            </Button>
          ) : messages[messages.length - 1]?.role === "user" ? (
            <Button
              type="button"
              size="icon"
              disabled={!isLoading}
              onClick={stop}
              variant="secondary"
              className="absolute bottom-3 right-3 rounded-full bg-sky-600 hover:bg-sky-500"
            >
              <SquareIcon size={14} className="text-white" fill="white" />
              <span className="sr-only">Stop</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              disabled
              className="absolute bottom-3 right-3 rounded-full bg-sky-600"
            >
              <Loader2 size={14} className="text-white animate-spin" />
              <span className="sr-only">Loading</span>
            </Button>
          )}
        </div>
        <div className="mt-2 text-xs text-center text-slate-500">
          AI Assistant may produce inaccurate information. Verify important info.
        </div>
      </div>
    </div>
  );
}