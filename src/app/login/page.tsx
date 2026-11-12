"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShieldAlert,
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // -------------------------------------------------------------
  // Handle Standard Form Submission
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setErrorMessage("Unexpected authentication failure. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        setErrorMessage(
          result.error === "CredentialsSignin"
            ? "Invalid email or password. Please try again."
            : result.error
        );
        setIsLoading(false);
      } else {
        // Immediate redirect to dashboard
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error("[Login] Authentication exception:", err);
      setErrorMessage("Network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Quick Demo Credentials Button for Hackathon Judges
  // Auto-fills and automatically submits the form immediately
  // -------------------------------------------------------------
  const handleQuickDemoLogin = async () => {
    const demoEmail = "judge@voicesarathi.com";
    const demoPassword = "smarthelmet123";

    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
    setIsDemoSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage("Demo credentials verification error. Please retry.");
        setIsDemoSubmitting(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("[Demo Login Error]", err);
      setErrorMessage("Failed to sign in with demo credentials.");
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-neutral-950/90 border-2 border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#00ff88] text-black font-black flex items-center justify-center text-2xl mb-3 shadow-[0_0_30px_rgba(0,255,136,0.6)]">
          VS
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">VoiceSarathi</h1>
        <p className="text-xs font-mono text-[#00ff88] uppercase tracking-widest mt-1">
          Rider Cockpit Login
        </p>
      </div>

      {/* QUICK DEMO CREDENTIALS BUTTON (Highly Visible for Hackathon Judges) */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading || isDemoSubmitting}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-[#ffee00] text-amber-200 hover:border-yellow-400 active:scale-98 transition-all cursor-pointer group shadow-[0_0_20px_rgba(255,238,0,0.25)] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffee00] text-black flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              {isDemoSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 fill-black" />
              )}
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-[#ffee00] uppercase tracking-wider">
                Use Quick Demo Credentials
              </div>
              <div className="text-[11px] font-mono text-neutral-300">
                judge@voicesarathi.com (Instant Login)
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#ffee00] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-neutral-800 flex-1" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          Or Enter Rider Account
        </span>
        <div className="h-px bg-neutral-800 flex-1" />
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 text-xs font-mono flex items-start gap-2.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email-input"
            className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@voicesarathi.com"
              required
              disabled={isLoading || isDemoSubmitting}
              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-medium placeholder-neutral-500 focus:outline-none focus:border-[#00ff88] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password-input"
            className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading || isDemoSubmitting}
              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl pl-10 pr-11 py-3 text-white text-sm font-medium placeholder-neutral-500 focus:outline-none focus:border-[#00ff88] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isDemoSubmitting}
          className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#00ff88] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,136,0.4)] hover:bg-[#00e57a] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Cockpit</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Link to Register Page */}
      <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
        <p className="text-xs text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#00ff88] font-bold hover:underline underline-offset-4 ml-1"
          >
            Create Rider Account →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#00ff88]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#00f0ff]/10 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-white text-xs font-mono animate-pulse flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" />
            <span>Loading authentication gateway...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}

