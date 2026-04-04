"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Password reset successfully! Redirecting...");
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 1500);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create New Password</h1>
        <p className="text-slate-400 text-sm">
          Enter the recovery code sent to your email along with your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!initialEmail && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit Recovery Code</label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
              className="w-full bg-slate-950/50 border border-slate-800 text-white px-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono tracking-[0.5em] text-lg placeholder:tracking-normal placeholder:font-sans"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
           <div className="relative">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
             <input
               type="password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               placeholder="At least 6 characters"
               minLength={6}
               required
               className="w-full bg-slate-950/50 border border-slate-800 text-white px-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
             />
           </div>
        </div>

        {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
        {msg && <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-xl border border-green-500/20">{msg}</div>}

        <button
          type="submit"
          disabled={isLoading || otp.length < 6 || newPassword.length < 6 || !email}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1121] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
