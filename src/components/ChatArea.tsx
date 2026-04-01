"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Bot, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChatArea() {
  const { messages, append, isLoading } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    append({ role: "user", content: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1121] relative animate-in fade-in duration-500">
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 animate-in zoom-in duration-500 fade-in delay-200">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-lg shadow-blue-900/10">
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg tracking-wide font-light">Send a message to start chatting with Kai.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role !== 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div 
                className={`rounded-2xl px-5 py-3.5 max-w-[85%] sm:max-w-[75%] shadow-md leading-relaxed text-[15px] ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                }`}
              >
                {/* Basic rendering. For bold/markdown, we would typically use react-markdown here */}
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}
        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent pb-6">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end bg-slate-900 border border-slate-700 focus-within:border-slate-500 transition-colors rounded-[2rem] p-2 shadow-2xl"
          >
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Submit form on Enter (but allow Shift+Enter for new line)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Cast event to FormEvent so React handles it cleanly
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
              rows={1}
              placeholder="Message Kai..."
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 resize-none outline-none py-3 px-4 max-h-32 min-h-[44px]"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors rounded-full p-2.5 m-1 text-white shrink-0 shadow-md"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4 font-medium tracking-wide">
          Kai can make mistakes. Consider verifying critical information.
        </p>
      </div>
    </div>
  );
}
