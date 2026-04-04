"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bot, Mail, KeyRound, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const router = useRouter();
  const { data: session, update, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).isVerified) {
      router.push("/");
    }
  }, [session, status, router]);

  const requestOtp = async () => {
    setIsSending(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg("A verification code has been sent to your email.");
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Verification successful! Redirecting...");
        // Update local session
        await update({ isVerified: true });
        router.push("/");
      } else {
        setError(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0b1121] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1121] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Verify Your Email</h1>
          <p className="text-slate-400 text-sm">
            To secure your account, please verify your email address.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit Code</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full bg-slate-950/50 border border-slate-800 text-white px-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-[0.5em] text-center text-xl placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
          {msg && <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-xl border border-green-500/20">{msg}</div>}

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-slate-400 text-sm mb-3">Didn't receive a code?</p>
          <button 
            onClick={requestOtp}
            disabled={isSending}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {isSending ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
