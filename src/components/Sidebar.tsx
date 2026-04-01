import Link from "next/link";
import { MessageSquare, Settings, PlusCircle, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl h-screen flex flex-col p-5 z-20">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 mb-8 text-blue-400 font-bold text-xl tracking-tight">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        Kai
      </div>

      {/* Primary Action */}
      <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl mb-8 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5">
        <PlusCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">New Chat</span>
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2.5">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium transition-colors">
          <MessageSquare className="w-5 h-5" />
          Chat
        </Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all border border-transparent hover:border-slate-700/50">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
      </nav>

      {/* Footer / Account */}
      <div className="pt-6 border-t border-slate-800/80">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all border border-transparent hover:border-slate-700/50">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
