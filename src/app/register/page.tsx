"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successStep, setSuccessStep] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend field validation
    if (!name.trim()) {
      setErrorMessage("Please enter your Full Name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Post registration details to Neon backend endpoint
      console.log("[Register] Dispatching POST to /api/register...");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account. Please try again.");
      }

      setSuccessStep(true);

      // 2. CRITICAL REQUIREMENT: Zero email verification flow.
      // Immediately sign in user with Credentials provider for instant access!
      console.log("[Register] Immediate automatic sign-in with NextAuth...");
      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
        callbackUrl: "/",
      });

      if (signInResult?.error) {
        console.warn("[Register Auto-Login] Warning during auto-signin:", signInResult.error);
        // Fallback: push to login if auto-login had an issue
        router.push("/login?registered=true");
      } else {
        // Immediate redirect to main dashboard
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("[Register Error]", err);
      setErrorMessage(err.message || "An error occurred during registration.");
      setIsLoading(false);
      setSuccessStep(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[#00ff88]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-[#00f0ff]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-6 sm:p-8 bg-neutral-950/90 border-2 border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00ff88] text-black font-black flex items-center justify-center text-2xl mb-3 shadow-[0_0_30px_rgba(0,255,136,0.6)]">
            VS
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs font-mono text-[#00ff88] uppercase tracking-widest mt-1">
            New Rider Setup • Instant Access
          </p>
        </div>

        {/* Instant Access Badge */}
        <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-[#00ff88]/40 flex items-center gap-2.5 text-xs text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-[#00ff88] flex-shrink-0" />
          <span>No email verification required. Jump straight into the HUD!</span>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 text-xs font-mono flex items-start gap-2.5 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name-input"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                required
                disabled={isLoading}
                className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-medium placeholder-neutral-500 focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="reg-email-input"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                required
                disabled={isLoading}
                className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-medium placeholder-neutral-500 focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="reg-password-input"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                disabled={isLoading}
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
            disabled={isLoading}
            className="w-full mt-3 py-4 px-6 rounded-2xl bg-[#00ff88] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,136,0.4)] hover:bg-[#00e57a] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {successStep ? "Launching Cockpit..." : "Registering Account..."}
                </span>
              </>
            ) : (
              <>
                <span>Complete Sign Up</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Link to Login Page */}
        <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-400">
            Already have a VoiceSarathi account?{" "}
            <Link
              href="/login"
              className="text-[#00ff88] font-bold hover:underline underline-offset-4 ml-1"
            >
              Log In to Cockpit →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

