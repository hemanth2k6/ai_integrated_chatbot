"use client";

import Link from "next/link";
import { MessageSquare, Settings, PlusCircle, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Extract content to wrap in Suspense for useSearchParams
function SidebarContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("c");
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/chats")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setChats(data);
          }
        })
        .catch(() => {});
    }
  }, [session, currentChatId]); // Refetch if session or chat changes (new chat created)

  return (
    <>
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 mb-8 text-blue-400 font-bold text-xl tracking-tight">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        Kai
      </div>

      {/* Primary Action */}
      <Link href="/" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl mb-6 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5">
        <PlusCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">New Chat</span>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2.5 overflow-y-auto pr-2 no-scrollbar">
        
        {chats.length > 0 && <div className="text-xs font-semibold text-slate-500 pt-4 pb-1 uppercase tracking-wider">Your Chats</div>}
        
        {chats.map((chat) => (
          <Link key={chat.id} href={`/?c=${chat.id}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors truncate ${currentChatId === chat.id ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700/50'}`}>
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate text-sm">{chat.title}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / Account */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 mt-4">
        {session && session.user ? (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden shadow-inner">
              {session.user.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{session.user.name || "User"}</div>
              <div className="text-slate-400 text-xs truncate">{session.user.email}</div>
            </div>
            <Link href="/account/security" className="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10" title="Account Security">
              <Settings className="w-4 h-4" />
            </Link>
            <button onClick={() => signOut()} className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all border border-transparent">
            <LogIn className="w-5 h-5" />
            <span className="font-medium text-sm">Sign In</span>
          </Link>
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl h-screen flex flex-col p-5 z-20">
      <Suspense fallback={<div className="text-slate-500 animate-pulse">Loading navigation...</div>}>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}
