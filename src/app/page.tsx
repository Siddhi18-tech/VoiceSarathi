"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import VoiceAgent from "@/components/VoiceAgent";
import SettingsModal, { type RiderSettings } from "@/components/SettingsModal";
import type { CrashMonitorHandle } from "@/components/CrashMonitor";
import {
  ShieldAlert,
  Headphones,
  Check,
  Power,
  Navigation,
  Zap,
  Clock,
  Sun,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Settings,
  Phone,
  Siren,
  Satellite,
} from "lucide-react";

// ── Browser-only components via next/dynamic ssr:false ───────────────────────
const RiderMap = dynamic(() => import("@/components/RiderMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl border-2 border-neutral-800 bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 text-xs font-mono animate-pulse gap-2"
      style={{ height: "380px" }}
    >
      <Satellite className="w-6 h-6 text-[#00FF88]" />
      <span>Loading ISRO Bhuvan Map…</span>
    </div>
  ),
});

const Speedometer = dynamic(() => import("@/components/Speedometer"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl border-2 border-neutral-800 bg-black h-28 flex items-center justify-center text-neutral-400 text-xs font-mono animate-pulse">
      Acquiring Live Speed…
    </div>
  ),
});

const CrashMonitor = dynamic(() => import("@/components/CrashMonitor"), {
  ssr: false,
});

// ── Default rider settings ────────────────────────────────────────────────────
const DEFAULT_SETTINGS: RiderSettings = {
  language: "bn-IN",
  speedLimit: 40,
  emergencyContact: "",
};

// Encoded Polyline: Kolkata Park Street / Esplanade to Howrah Station via Howrah Bridge
const DEMO_ENCODED_ROUTE = "wuwhCkqizO_Nzc@g^~p@ka@vj@oFbQ";

export default function RiderDashboard() {
  const { data: session } = useSession();

  // ── Pre-ride state ───────────────────────────────────────────────
  const [isRideActive, setIsRideActive] = useState(false);
  const [ambientModeConfirmed, setAmbientModeConfirmed] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // ── HUD state ────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState("");
  const [currentDestination, setCurrentDestination] = useState("Tap earphone button to set route");
  const [highContrastMode, setHighContrastMode] = useState(true);
  const [showRoute, setShowRoute] = useState(false);

  // ── Settings state ───────────────────────────────────────────────
  const [settings, setSettings] = useState<RiderSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────
  const wakeLockSentinelRef = useRef<any>(null);
  const crashMonitorRef = useRef<CrashMonitorHandle>(null);

  // Google Maps API key placeholder
  const googleMapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  // ── Clock ────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Wake Lock ────────────────────────────────────────────────────
  const requestScreenWakeLock = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("wakeLock" in navigator) || !navigator.wakeLock) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinelRef.current = sentinel;
      setWakeLockActive(true);
      sentinel.addEventListener("release", () => setWakeLockActive(false));
    } catch (err) {
      console.warn("[WakeLock] Could not acquire:", err);
    }
  }, []);

  const releaseScreenWakeLock = useCallback(() => {
    try {
      wakeLockSentinelRef.current?.release();
    } catch {}
    wakeLockSentinelRef.current = null;
    setWakeLockActive(false);
  }, []);

  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === "visible" && isRideActive) {
        await requestScreenWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isRideActive, requestScreenWakeLock]);

  useEffect(() => () => releaseScreenWakeLock(), [releaseScreenWakeLock]);

  // ── Ride start / end ─────────────────────────────────────────────
  const handleStartRide = async () => {
    if (!ambientModeConfirmed) return;
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    await requestScreenWakeLock();
    setIsRideActive(true);
  };

  const handleEndRide = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
    releaseScreenWakeLock();
    setIsRideActive(false);
    setAmbientModeConfirmed(false);
    setShowRoute(false);
    setCurrentDestination("Tap earphone button to set route");
  };

  const handleDestinationFound = (destination: string) => {
    setCurrentDestination(destination);
    setShowRoute(true);
  };

  const handleSaveSettings = (s: RiderSettings) => {
    setSettings(s);
    console.log("[Settings] Saved:", s);
  };

  const callHref = settings.emergencyContact
    ? `tel:${settings.emergencyContact}`
    : "tel:+919999999999";

  return (
    <main
      className={`min-h-screen w-full flex flex-col transition-colors duration-200 ${
        highContrastMode ? "bg-black text-white" : "bg-neutral-950 text-neutral-100"
      }`}
    >
      {/* =========================================================== */}
      {/* PHASE 1: MANDATORY PRE-RIDE SAFETY ONBOARDING               */}
      {/* =========================================================== */}
      {!isRideActive ? (
        <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full p-5 sm:p-7">
          <div>
            {/* Brand header */}
            <div className="flex items-center justify-between pt-2 pb-6 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88] text-black font-black flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                  VS
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                    VoiceSarathi
                  </h1>
                  <span className="text-[11px] font-mono text-[#00ff88] tracking-widest uppercase">
                    Smart Helmet HUD
                  </span>
                  {session?.user && (
                    <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                      Rider: <span className="text-white font-bold">{session.user.name || session.user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentTime || "00:00"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Rider Settings"
                  className="p-2 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Safety callout */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/80 text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-amber-300 uppercase tracking-wide">
                    Mandatory Rider Protocol
                  </h2>
                  <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                    VoiceSarathi is a zero-touch audio HUD. Never look at or touch your phone
                    while in traffic. Confirm earphone transparency mode is enabled below.
                  </p>
                </div>
              </div>
            </div>

            {/* Current settings summary */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Language", value: settings.language, color: "text-[#00f0ff]" },
                { label: "Speed Limit", value: `${settings.speedLimit} km/h`, color: "text-[#ffee00]" },
                {
                  label: "SOS Contact",
                  value: settings.emergencyContact ? "Set ✓" : "Not set",
                  color: settings.emergencyContact ? "text-[#00ff88]" : "text-rose-400",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer hover:border-neutral-600 active:scale-95 transition-transform"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">{label}</div>
                  <div className={`text-xs font-black mt-0.5 ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Feature chips */}
            <div className="mt-5 space-y-2.5">
              {[
                {
                  icon: <Satellite className="w-4 h-4" />,
                  color: "text-[#00ff88]",
                  title: "ISRO Bhuvan WMS Overlay",
                  desc: "Sovereign India-first geospatial tiles via Google Maps JS API.",
                },
                {
                  icon: <Headphones className="w-4 h-4" />,
                  color: "text-[#00f0ff]",
                  title: "Zero-Touch Voice Control",
                  desc: "Single earphone click triggers Bengali/Hindi speech recognition.",
                },
                {
                  icon: <Zap className="w-4 h-4" />,
                  color: "text-[#ffee00]",
                  title: "Screen Wake Lock",
                  desc: "Screen stays illuminated on your motorcycle mount.",
                },
                {
                  icon: <Siren className="w-4 h-4" />,
                  color: "text-rose-400",
                  title: "Crash Guard & Auto-SOS",
                  desc: "Live accelerometer impact detection with auto-SOS beacon.",
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center ${color} flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">{title}</div>
                    <div className="text-neutral-400">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* MANDATORY CHECKBOX */}
            <div className="mt-5">
              <label
                htmlFor="ambient-checkbox"
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] ${
                  ambientModeConfirmed
                    ? "bg-[#00ff88]/15 border-[#00ff88] text-white shadow-[0_0_25px_rgba(0,255,136,0.2)]"
                    : "bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                <div className="relative flex items-center mt-0.5">
                  <input
                    id="ambient-checkbox"
                    type="checkbox"
                    checked={ambientModeConfirmed}
                    onChange={(e) => setAmbientModeConfirmed(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                      ambientModeConfirmed
                        ? "bg-[#00ff88] border-[#00ff88] text-black"
                        : "border-neutral-500 bg-neutral-900"
                    }`}
                  >
                    {ambientModeConfirmed && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-sm font-semibold leading-snug">
                  <span className="text-white">
                    I have enabled Transparency/Ambient mode on my earphones to hear traffic.
                  </span>
                  <div className="text-xs font-normal text-neutral-400 mt-1">
                    Required to hear approaching vehicles, horns, and emergency sirens.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-5 pb-2">
            <button
              onClick={handleStartRide}
              disabled={!ambientModeConfirmed}
              type="button"
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg tracking-wider uppercase transition-all flex items-center justify-center gap-3 ${
                ambientModeConfirmed
                  ? "bg-[#00ff88] text-black shadow-[0_0_35px_rgba(0,255,136,0.6)] active:scale-95 hover:bg-[#00e57a] cursor-pointer"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60"
              }`}
            >
              <Power className="w-6 h-6 stroke-[2.5]" />
              <span>Start Ride</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
            <div className="text-center mt-3 text-[11px] font-mono text-neutral-500">
              VoiceSarathi • Bhuvan WMS • {settings.language}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================== */
        /* PHASE 2: ACTIVE RIDER DASHBOARD — HIGH CONTRAST OUTDOOR HUD */
        /* =========================================================== */
        <div className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4 sm:p-5 gap-4">
          {/* Top Status Strip */}
          <header className="flex items-center justify-between border-b-2 border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]" />
              </span>
              <span className="text-xs font-black tracking-widest text-[#00ff88] uppercase">
                RIDE ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-300 border border-neutral-700 bg-neutral-900 px-2 py-0.5 rounded-full">
                {currentTime}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border hidden sm:block ${
                  wakeLockActive
                    ? "bg-emerald-950 border-[#00ff88] text-[#00ff88]"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                {wakeLockActive ? "⚡ WAKE" : "SLEEP"}
              </span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHighContrastMode(!highContrastMode)}
                title="Toggle sunlight contrast"
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700"
              >
                <Sun className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </header>

          {/* Destination Waypoint Strip */}
          <div className="flex items-center gap-3 p-3 bg-black border-2 border-neutral-800 rounded-2xl">
            <Navigation className="w-5 h-5 text-[#ffee00] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Target Waypoint
              </div>
              <div className="text-base font-black text-[#ffee00] truncate">
                {currentDestination}
              </div>
            </div>
            {showRoute && (
              <span className="ml-auto text-[10px] font-mono bg-cyan-500/20 border border-[#00F0FF] text-[#00F0FF] px-2.5 py-1 rounded-full whitespace-nowrap font-bold">
                ROUTE ACTIVE
              </span>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Main Dashboard Map with Speedometer Prominently Overlaid      */}
          {/* ------------------------------------------------------------- */}
          <RiderMap
            apiKey={googleMapsApiKey}
            routePolyline={showRoute ? DEMO_ENCODED_ROUTE : undefined}
            height="380px"
          >
            {/* Speedometer prominently displayed as a bold HUD overlay on top of the dashboard map */}
            <Speedometer
              speedLimit={settings.speedLimit}
              overlayMode={true}
            />
          </RiderMap>

          {/* Crash Monitor Status & Emergency Overlay */}
          <CrashMonitor
            ref={crashMonitorRef}
            threshold={25}
            emergencyContact={settings.emergencyContact}
            countdownSeconds={15}
          />

          {/* Zero-Touch Voice Agent */}
          <VoiceAgent
            defaultLanguage={settings.language}
            onDestinationExtracted={handleDestinationFound}
            isRideActive={isRideActive}
          />

          {/* Footer Controls: Simulate Crash + End Ride + Call Home */}
          <footer className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => crashMonitorRef.current?.simulateCrash()}
                className="py-3 px-3 rounded-xl bg-orange-950/80 border-2 border-orange-500 text-orange-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Siren className="w-4 h-4 text-orange-400" />
                <span>Simulate Crash</span>
              </button>

              <button
                type="button"
                onClick={handleEndRide}
                className="py-3 px-3 rounded-xl bg-neutral-900 border-2 border-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-neutral-500 active:scale-95 cursor-pointer"
              >
                <Power className="w-4 h-4 text-rose-500" />
                <span>End Ride</span>
              </button>
            </div>

            {/* CALL HOME BUTTON */}
            <a
              href={callHref}
              className="w-full py-4 px-6 rounded-2xl bg-rose-900/80 border-2 border-rose-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,42,85,0.3)]"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={`Call emergency contact ${settings.emergencyContact || "home"}`}
            >
              <Phone className="w-6 h-6 text-rose-300 stroke-[2.5]" />
              <span>Call Home</span>
              {settings.emergencyContact && (
                <span className="text-xs font-mono text-rose-300/70 font-normal ml-auto">
                  {settings.emergencyContact.slice(-4).padStart(settings.emergencyContact.length, "•")}
                </span>
              )}
            </a>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>VoiceSarathi Software Helmet Active • ISRO Bhuvan</span>
            </div>
          </footer>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </main>
  );
}
