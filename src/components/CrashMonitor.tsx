"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ShieldAlert, PhoneCall, X, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CrashMonitorState =
  | "idle"
  | "crash_suspected"
  | "sos_sent"
  | "cancelled";

export interface CrashMonitorProps {
  /** Acceleration magnitude threshold in m/s² that triggers "Crash Suspected". Default: 25. */
  threshold?: number;
  /** Emergency contact number to include in SOS beacon. */
  emergencyContact?: string;
  /** Countdown seconds before SOS auto-fires. Default: 15. */
  countdownSeconds?: number;
  /** Called when SOS is successfully sent or cancelled. */
  onStatusChange?: (status: CrashMonitorState) => void;
}

export interface CrashMonitorHandle {
  /** Programmatically trigger a simulated crash — useful for hackathon demos. */
  simulateCrash: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCEL_WINDOW_MS = 200; // debounce: spike must persist briefly

function mag(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

// ─── Component ───────────────────────────────────────────────────────────────

function CrashMonitorInner(
  {
    threshold = 25,
    emergencyContact = "",
    countdownSeconds = 15,
    onStatusChange,
  }: CrashMonitorProps,
  ref: React.Ref<CrashMonitorHandle>
) {
  const [monitorStatus, setMonitorStatus] = useState<CrashMonitorState>("idle");
  const [countdown, setCountdown]         = useState<number>(countdownSeconds);
  const [sosSent, setSosSent]             = useState<boolean>(false);
  const [deviceMotionSupported, setDeviceMotionSupported] = useState<boolean>(true);
  const [lastMagnitude, setLastMagnitude] = useState<number>(0);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashDebounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsRef               = useRef<SpeechSynthesisUtterance | null>(null);
  const statusRef            = useRef<CrashMonitorState>("idle");

  // Keep statusRef in sync so event listeners read the latest value
  const setStatus = useCallback(
    (s: CrashMonitorState) => {
      statusRef.current = s;
      setMonitorStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange]
  );

  // ── TTS helper ───────────────────────────────────────────────────
  const speakAlert = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang    = "en-IN";
    u.rate    = 0.85;
    u.pitch   = 1.1;
    u.volume  = 1.0;
    ttsRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  // ── Send SOS POST ────────────────────────────────────────────────
  const dispatchSOS = useCallback(async () => {
    if (sosSent) return;
    setSosSent(true);

    // Gather rough GPS coords if available
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation?.getCurrentPosition(
          (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve(); },
          () => resolve(),
          { timeout: 3000, maximumAge: 10000 }
        );
      });
    } catch {}

    const payload = {
      timestamp: new Date().toISOString(),
      lat,
      lng,
      emergencyContact: emergencyContact || "Not provided",
      accelerationMagnitude: lastMagnitude,
      riderStatus: "UNRESPONSIVE",
    };

    console.error("[CrashMonitor] 🚨 Auto-dispatching SOS:", payload);

    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("[CrashMonitor] SOS response:", data);
    } catch (err) {
      console.error("[CrashMonitor] SOS dispatch network error:", err);
    }

    setStatus("sos_sent");
    speakAlert("SOS sent. Emergency services have been notified.");
  }, [sosSent, emergencyContact, lastMagnitude, setStatus, speakAlert]);

  // ── Stop countdown ───────────────────────────────────────────────
  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // ── Cancel SOS ───────────────────────────────────────────────────
  const cancelSOS = useCallback(() => {
    stopCountdown();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
    setStatus("cancelled");
    setCountdown(countdownSeconds);
    setSosSent(false);
    // Return to idle after a brief "cancelled" flash
    setTimeout(() => setStatus("idle"), 2500);
  }, [stopCountdown, countdownSeconds, setStatus]);

  // ── Start crash sequence ─────────────────────────────────────────
  const triggerCrash = useCallback(
    (magnitude: number) => {
      if (statusRef.current !== "idle") return; // already handling

      setLastMagnitude(magnitude);
      setStatus("crash_suspected");
      setCountdown(countdownSeconds);
      setSosSent(false);

      // Haptic burst
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([300, 100, 300, 100, 600]);
      }

      // TTS alert
      speakAlert(
        "Crash detected. Are you okay? Say yes or tap Cancel SOS to cancel."
      );

      // Listen for voice "yes" response
      const SpeechClass =
        typeof window !== "undefined"
          ? window.SpeechRecognition || window.webkitSpeechRecognition
          : null;

      if (SpeechClass) {
        try {
          const rec = new SpeechClass();
          rec.lang           = "en-IN";
          rec.continuous     = false;
          rec.interimResults = false;
          rec.onresult = (e: any) => {
            const spoken = e.results[0]?.[0]?.transcript?.toLowerCase() ?? "";
            if (spoken.includes("yes") || spoken.includes("okay") || spoken.includes("ok")) {
              cancelSOS();
            }
          };
          // Start listening after TTS has had a moment
          setTimeout(() => { try { rec.start(); } catch {} }, 2000);
        } catch {}
      }

      // Start 15-second countdown
      let remaining = countdownSeconds;
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          stopCountdown();
          dispatchSOS();
        }
      }, 1000);
    },
    [countdownSeconds, speakAlert, cancelSOS, stopCountdown, dispatchSOS, setStatus]
  );

  // ── devicemotion listener ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("DeviceMotionEvent" in window)) {
      setDeviceMotionSupported(false);
      console.warn("[CrashMonitor] DeviceMotionEvent not supported.");
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = mag(x, y, z);

      if (magnitude > threshold && statusRef.current === "idle") {
        // Debounce: only trigger if the spike persists for ACCEL_WINDOW_MS
        if (!crashDebounceRef.current) {
          crashDebounceRef.current = setTimeout(() => {
            crashDebounceRef.current = null;
            if (statusRef.current === "idle") {
              console.warn("[CrashMonitor] Impact detected! Magnitude:", magnitude.toFixed(2));
              triggerCrash(parseFloat(magnitude.toFixed(2)));
            }
          }, ACCEL_WINDOW_MS);
        }
      } else {
        // Magnitude fell back below threshold — clear debounce
        if (crashDebounceRef.current) {
          clearTimeout(crashDebounceRef.current);
          crashDebounceRef.current = null;
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion as EventListener);

    return () => {
      window.removeEventListener("devicemotion", handleMotion as EventListener);
      if (crashDebounceRef.current) clearTimeout(crashDebounceRef.current);
      stopCountdown();
    };
  }, [threshold, triggerCrash, stopCountdown]);

  // ── Expose simulateCrash() to parent via ref ─────────────────────
  useImperativeHandle(ref, () => ({
    simulateCrash: () => {
      console.log("[CrashMonitor] Simulated crash triggered by demo button.");
      triggerCrash(99.9); // clearly over-threshold for demo
    },
  }));

  // ── Countdown colour ─────────────────────────────────────────────
  const countdownPct = countdown / countdownSeconds;
  const countdownColor =
    countdownPct > 0.5 ? "#ff2a55" : countdownPct > 0.25 ? "#ff8800" : "#ffee00";

  // ── Idle status pill (always rendered, overlay is conditional) ───
  return (
    <>
      {/* ── Status pill (shown in normal HUD) ── */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-200 ${
          monitorStatus === "idle"
            ? "bg-neutral-900 border-neutral-700 text-neutral-400"
            : monitorStatus === "cancelled"
            ? "bg-emerald-950 border-[#00ff88] text-[#00ff88]"
            : "bg-rose-950 border-rose-500 text-rose-300 animate-pulse"
        }`}
      >
        {monitorStatus === "idle" && (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />
            <span>Crash Guard: Active</span>
          </>
        )}
        {monitorStatus === "crash_suspected" && (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Crash Suspected!</span>
          </>
        )}
        {monitorStatus === "sos_sent" && (
          <>
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>SOS Sent</span>
          </>
        )}
        {monitorStatus === "cancelled" && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>SOS Cancelled — Safe</span>
          </>
        )}
        {!deviceMotionSupported && (
          <span className="ml-1 text-amber-400 font-normal">(no gyro)</span>
        )}
      </div>

      {/* ── Full-screen crash overlay ── */}
      {(monitorStatus === "crash_suspected" || monitorStatus === "sos_sent") && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ff0a2a] select-none"
          role="alertdialog"
          aria-modal="true"
          aria-label="Crash Alert SOS countdown"
        >
          {/* Background pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-72 h-72 rounded-full border-4 border-white/20 animate-ping"
              style={{ animationDuration: "1.5s" }}
            />
          </div>

          {/* Top status chip */}
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-5 py-1.5">
              <Zap className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-xs font-black tracking-widest uppercase">
                VoiceSarathi Crash Guard
              </span>
            </div>
          </div>

          {/* Central icon */}
          <div className="mb-6">
            {monitorStatus === "sos_sent" ? (
              <PhoneCall className="w-20 h-20 text-white drop-shadow-2xl" />
            ) : (
              <AlertTriangle className="w-20 h-20 text-white animate-pulse drop-shadow-2xl" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center px-4">
            {monitorStatus === "sos_sent" ? "SOS SENT" : "CRASH DETECTED"}
          </h1>

          <p className="mt-3 text-white/80 text-sm font-semibold text-center px-8">
            {monitorStatus === "sos_sent"
              ? `Emergency beacon dispatched to ${emergencyContact || "emergency contact"}.`
              : "Say \"Yes\" or tap Cancel SOS if you are okay."}
          </p>

          {/* Countdown ring */}
          {monitorStatus === "crash_suspected" && (
            <div className="mt-8 relative flex items-center justify-center w-36 h-36">
              <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={countdownColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - countdownPct)}`}
                  style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                />
              </svg>
              <div className="text-center">
                <span
                  className="text-5xl font-black font-mono leading-none"
                  style={{ color: countdownColor }}
                >
                  {countdown}
                </span>
                <div className="text-white/70 text-xs font-mono mt-0.5">seconds</div>
              </div>
            </div>
          )}

          {/* Cancel SOS button */}
          {monitorStatus === "crash_suspected" && (
            <button
              type="button"
              onClick={cancelSOS}
              className="mt-8 py-5 px-12 rounded-2xl bg-white text-[#ff0a2a] font-black text-xl uppercase tracking-wider shadow-2xl active:scale-95 transition-transform cursor-pointer border-4 border-white"
              style={{ minWidth: "280px" }}
            >
              <div className="flex items-center justify-center gap-3">
                <X className="w-7 h-7 stroke-[3]" />
                <span>Cancel SOS</span>
              </div>
            </button>
          )}

          {monitorStatus === "sos_sent" && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="py-3 px-8 rounded-2xl bg-white/20 border border-white/40 text-white font-bold text-lg">
                📡 SOS Beacon Active
              </div>
              <button
                type="button"
                onClick={() => { setStatus("idle"); setSosSent(false); setCountdown(countdownSeconds); }}
                className="text-white/60 text-sm underline underline-offset-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Emergency contact display */}
          {emergencyContact && (
            <div className="absolute bottom-8 flex items-center gap-2 text-white/60 text-xs font-mono">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Alerting: {emergencyContact}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const CrashMonitor = forwardRef<CrashMonitorHandle, CrashMonitorProps>(CrashMonitorInner);
CrashMonitor.displayName = "CrashMonitor";

export default CrashMonitor;

