"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Gauge, AlertTriangle, Navigation, Zap } from "lucide-react";

export interface SpeedometerProps {
  /**
   * Speed limit in km/h. If live speed exceeds this, TTS warning fires.
   * Defaults to 40 km/h.
   */
  speedLimit?: number;
  /**
   * Optional callback to surface live speed reading to parent component.
   */
  onSpeedUpdate?: (speedKmh: number) => void;
  /**
   * Optional custom styling class
   */
  className?: string;
  /**
   * Whether to display in compact HUD overlay mode (for embedding directly on top of the map)
   */
  overlayMode?: boolean;
}

type GPSStatus = "acquiring" | "active" | "denied" | "unavailable" | "mock";

const WARNING_COOLDOWN_MS = 60_000; // 60 seconds debounce

export default function Speedometer({
  speedLimit = 40,
  onSpeedUpdate,
  className = "",
  overlayMode = false,
}: SpeedometerProps) {
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [maxSpeedSeen, setMaxSpeedSeen] = useState<number>(0);
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>("acquiring");
  const [isOverLimit, setIsOverLimit] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastWarnedAtRef = useRef<number>(0); // React ref to avoid speech spamming within 60s
  const isMockedRef = useRef<boolean>(false);

  // ----------------------------------------------------------------
  // Speech Synthesis: Warning only once per 60 seconds
  // ----------------------------------------------------------------
  const triggerVoiceSpeedWarning = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const now = Date.now();
    if (now - lastWarnedAtRef.current < WARNING_COOLDOWN_MS) {
      // Cooldown active - avoid spamming the rider
      return;
    }

    lastWarnedAtRef.current = now;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Speed limit exceeded, please slow down.");
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      console.log("[Speedometer] TTS Warning triggered: Speed limit exceeded.");
    } catch (e) {
      console.warn("[Speedometer] TTS voice warning error:", e);
      setIsSpeaking(false);
    }
  }, []);

  // ----------------------------------------------------------------
  // Convert m/s to km/h and apply speed updates
  // ----------------------------------------------------------------
  const handleSpeedUpdate = useCallback(
    (speedMps: number | null) => {
      // Convert coords.speed (m/s) to km/h: speed * 3.6
      const kmh = speedMps !== null && speedMps >= 0 ? Math.round(speedMps * 3.6) : 0;
      setSpeedKmh(kmh);
      setMaxSpeedSeen((prev) => Math.max(prev, kmh));

      const exceeded = kmh > speedLimit;
      setIsOverLimit(exceeded);

      if (exceeded) {
        triggerVoiceSpeedWarning();
      }

      if (onSpeedUpdate) {
        onSpeedUpdate(kmh);
      }
    },
    [speedLimit, triggerVoiceSpeedWarning, onSpeedUpdate]
  );

  // ----------------------------------------------------------------
  // Live GPS Tracking with navigator.geolocation.watchPosition
  // ----------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("geolocation" in navigator)) {
      setGpsStatus("unavailable");
      startMockTelemetry();
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsStatus("active");
        handleSpeedUpdate(position.coords.speed);
      },
      (error) => {
        console.warn("[Speedometer] Geolocation warning:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("unavailable");
        }
        if (!isMockedRef.current) {
          startMockTelemetry();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null && watchIdRef.current >= 0) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update over-limit state when limit prop changes
  useEffect(() => {
    const exceeded = speedKmh > speedLimit;
    setIsOverLimit(exceeded);
    if (exceeded) {
      triggerVoiceSpeedWarning();
    }
  }, [speedLimit, speedKmh, triggerVoiceSpeedWarning]);

  // Dev simulation for desktop testing
  function startMockTelemetry() {
    isMockedRef.current = true;
    setGpsStatus("mock");
    let simulatedMps = 10; // ~36 km/h

    const timer = setInterval(() => {
      const delta = (Math.random() - 0.45) * 1.8;
      simulatedMps = Math.max(0, Math.min(15.5, simulatedMps + delta));
      handleSpeedUpdate(simulatedMps);
    }, 2000);

    watchIdRef.current = -1;
    return timer;
  }

  // Dynamic sunlight-safe contrast colors
  const speedColor = isOverLimit
    ? "#FF2A55" // Alert Red
    : speedKmh / speedLimit > 0.8
    ? "#FFEE00" // Caution Yellow
    : "#00FF88"; // High-visibility Neon Green

  // Compact Overlay Mode (Directly floating on the Map)
  if (overlayMode) {
    return (
      <div
        className={`bg-black/90 backdrop-blur-md border-2 rounded-2xl p-3 shadow-2xl transition-all duration-300 ${
          isOverLimit
            ? "border-[#FF2A55] shadow-[0_0_25px_rgba(255,42,85,0.6)]"
            : "border-neutral-700"
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
              <Navigation className="w-3 h-3 text-[#00F0FF]" />
              <span>LIVE SPEED</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-4xl sm:text-5xl font-black font-mono tracking-tighter"
                style={{ color: speedColor }}
              >
                {speedKmh}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">km/h</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] font-mono text-neutral-400">
              LIMIT: <span className="font-bold text-white">{speedLimit}</span>
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                gpsStatus === "active"
                  ? "border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10"
                  : "border-neutral-600 text-neutral-400 bg-neutral-900"
              }`}
            >
              {gpsStatus === "active" ? "GPS LIVE" : "GPS MOCK"}
            </div>
            {isSpeaking && (
              <span className="text-[9px] font-mono text-[#FFEE00] animate-pulse">
                Slow Down!
              </span>
            )}
          </div>
        </div>

        {isOverLimit && (
          <div className="mt-2 text-[10px] font-mono font-black uppercase text-center bg-[#FF2A55] text-black py-0.5 rounded">
            LIMIT EXCEEDED
          </div>
        )}
      </div>
    );
  }

  // Full HUD Speedometer Card
  return (
    <div
      className={`relative w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isOverLimit
          ? "border-[#FF2A55] shadow-[0_0_30px_rgba(255,42,85,0.6)]"
          : "border-neutral-800"
      } bg-black ${className}`}
    >
      {isOverLimit && (
        <div className="absolute inset-0 bg-[#FF2A55]/10 pointer-events-none animate-pulse" />
      )}

      <div className="p-4">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-neutral-400">
            <Navigation className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>GPS Speedometer</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              gpsStatus === "active"
                ? "border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10"
                : gpsStatus === "mock"
                ? "border-amber-500 text-amber-300 bg-amber-950/50"
                : "border-neutral-700 text-neutral-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                gpsStatus === "active" ? "bg-[#00FF88] animate-ping" : "bg-amber-400"
              }`}
            />
            {gpsStatus === "active" ? "GPS SATELLITE LOCK" : "GPS SIMULATED"}
          </div>
        </div>

        {/* Speed Value & Limit */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-baseline gap-2">
            <span
              className="text-6xl sm:text-7xl font-black font-mono tracking-tighter leading-none"
              style={{ color: speedColor }}
            >
              {speedKmh}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">KM/H</span>
              <span className="text-[10px] font-mono text-neutral-500">GROUND SPEED</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-right">
              <div className="text-[9px] font-mono text-neutral-400 uppercase">SPEED ZONE</div>
              <div className="flex items-center justify-end gap-1 text-white font-mono font-black text-lg">
                <Gauge className="w-4 h-4 text-[#FFEE00]" />
                <span>{speedLimit}</span>
                <span className="text-[10px] text-neutral-400 font-normal">km/h</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-neutral-400">
              PEAK: <span className="font-bold text-[#00F0FF]">{maxSpeedSeen} km/h</span>
            </div>
          </div>
        </div>

        {/* Warning Indicator */}
        {isOverLimit && (
          <div className="mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FF2A55] text-black text-xs font-black uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-4 h-4 stroke-[3]" />
            <span>Speed limit exceeded, please slow down</span>
          </div>
        )}
      </div>
    </div>
  );
}
