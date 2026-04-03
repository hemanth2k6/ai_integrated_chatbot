"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Bot, User } from "lucide-react";

export function ChatArea() {
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, id: "chat-" + Date.now() }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");
      
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + text };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `\nError connecting to AI service.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1121] relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Bot className="w-16 h-16 text-blue-500" />
            <p className="text-lg">Send a message to start chatting.</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role !== 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`rounded-2xl px-5 py-3.5 max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'} whitespace-pre-wrap`}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 pb-6">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            rows={1}
            placeholder="Message..."
            className="flex-1 bg-slate-900 text-slate-200 rounded-2xl px-4 py-3 resize-none outline-none"
          />
          <button type="submit" disabled={isLoading || !input || !input.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-full p-3">
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}