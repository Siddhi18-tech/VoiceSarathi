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
import SettingsModal, { type RiderSettings, type SavedPlaces } from "@/components/SettingsModal";
import SetPlaceModal from "@/components/SetPlaceModal";
import type { CrashMonitorHandle } from "@/components/CrashMonitor";
import {
  ShieldAlert,
  Headphones,
  Check,
  X,
  Power,
  Navigation,
  Zap,
  Clock,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Settings,
  Phone,
  Siren,
  Satellite,
  Home,
  Briefcase,
  GraduationCap,
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
  savedPlaces: {
    home: "",
    work: "",
    college: "",
  },
};

type RouteApiResponse = {
  polyline?: string;
  steps?: Array<{ instruction: string; distance: number }>;
  distance?: number;
  distanceText?: string;
  duration?: number;
  durationText?: string;
  origin?: { lat: number; lng: number };
  via?: { lat: number; lng: number; name: string } | null;
  destination?: { lat: number; lng: number; name: string };
  error?: string;
};

function distanceBetweenPoints(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speakNavigationInstruction(text: string, language: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language || "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function RiderDashboard() {
  const { data: session } = useSession();

  // ── Pre-ride state ───────────────────────────────────────────────
  const [isRideActive, setIsRideActive] = useState(false);
  const [ambientModeConfirmed, setAmbientModeConfirmed] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // ── HUD & Route state ────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState("");
  const [currentDestination, setCurrentDestination] = useState("Tap earphone button to set route");
  const [viaWaypoint, setViaWaypoint] = useState<string | null>(null);
  const [viaCoords, setViaCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [highContrastMode, setHighContrastMode] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<string>();
  const [routeSteps, setRouteSteps] = useState<RouteApiResponse["steps"]>([]);
  const [distanceText, setDistanceText] = useState<string>("");
  const [durationText, setDurationText] = useState<string>("");
  const [etaText, setEtaText] = useState<string>("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 22.5726,
    lng: 88.3639,
  });
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [tripLogMessage, setTripLogMessage] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<{
    destination: string | null;
    displayTitle?: string;
    via?: string | null;
    transcript?: string;
  } | null>(null);

  // ── Theme & Settings state ───────────────────────────────────────
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isLight = theme === "light";
  const [settings, setSettings] = useState<RiderSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [placeModalType, setPlaceModalType] = useState<"home" | "work" | "college" | null>(null);

  const handleSavePlaceModal = (
    placeType: "home" | "work" | "college",
    address: string,
    startRouteImmediately: boolean
  ) => {
    const updatedPlaces: SavedPlaces = {
      home: placeType === "home" ? address : settings.savedPlaces?.home || "",
      work: placeType === "work" ? address : settings.savedPlaces?.work || "",
      college: placeType === "college" ? address : settings.savedPlaces?.college || "",
    };
    const updatedSettings: RiderSettings = {
      ...settings,
      savedPlaces: updatedPlaces,
    };
    setSettings(updatedSettings);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("voicesarathi_settings", JSON.stringify(updatedSettings));
      } catch (err) {
        console.warn("[Settings] Error saving to localStorage:", err);
      }
    }

    if (startRouteImmediately) {
      void handleDestinationFound(address, `Navigate to ${address}`);
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setSettings((prev) => ({ ...prev, theme: next }));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("voicesarathi_theme", next);
        localStorage.setItem("voicesarathi_settings", JSON.stringify({ ...settings, theme: next }));
      } catch { }
    }
  };

  // Load saved settings & theme from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("voicesarathi_theme") as "dark" | "light" | null;
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
        const saved = localStorage.getItem("voicesarathi_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.theme === "light" || parsed.theme === "dark") {
            setTheme(parsed.theme);
          }
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            savedPlaces: {
              home: parsed.savedPlaces?.home || "",
              work: parsed.savedPlaces?.work || "",
              college: parsed.savedPlaces?.college || "",
            },
          }));
        }
      } catch (err) {
        console.warn("[Settings] Error loading localStorage settings:", err);
      }
    }
  }, []);

  // Synchronize theme with HTML / DOM root and body
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        document.body.classList.add("light");
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = "#f8fafc";
        document.body.style.color = "#0f172a";
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("dark");
        document.body.classList.remove("light");
        document.body.style.backgroundColor = "#090d16";
        document.body.style.color = "#f8fafc";
      }
    }
  }, [theme]);

  // ── Refs ─────────────────────────────────────────────────────────
  const wakeLockSentinelRef = useRef<any>(null);
  const crashMonitorRef = useRef<CrashMonitorHandle>(null);
  const rideStartedAtRef = useRef<Date | null>(null);
  const rideDistanceMetersRef = useRef(0);
  const previousRidePositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const maxRideSpeedRef = useRef(0);
  const navigationStepsRef = useRef<RouteApiResponse["steps"]>([]);
  const navigationStepIndexRef = useRef(0);
  const navigationDistanceIntoStepRef = useRef(0);
  const previousNavigationPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const navigationActiveRef = useRef(false);
  const navigationLanguageRef = useRef(DEFAULT_SETTINGS.language);

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
    } catch { }
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

  // Acquire rider location initially on load
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => { },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    if (!isRideActive || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition((position) => {
      const current = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCurrentLocation(current);
      const previous = previousRidePositionRef.current;
      if (previous) {
        const toRadians = (degrees: number) => degrees * Math.PI / 180;
        const dLat = toRadians(current.lat - previous.lat);
        const dLng = toRadians(current.lng - previous.lng);
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(toRadians(previous.lat)) * Math.cos(toRadians(current.lat)) * Math.sin(dLng / 2) ** 2;
        rideDistanceMetersRef.current += 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }
      previousRidePositionRef.current = current;

      if (navigationActiveRef.current) {
        const navigationPrevious = previousNavigationPositionRef.current;
        if (navigationPrevious) {
          navigationDistanceIntoStepRef.current += distanceBetweenPoints(navigationPrevious, current);
          const steps = navigationStepsRef.current || [];
          const currentStep = steps[navigationStepIndexRef.current];
          const nextStep = steps[navigationStepIndexRef.current + 1];

          if (currentStep && nextStep) {
            const stepDistance = Math.max(0, currentStep.distance || 0);
            const announceWithin = Math.min(250, Math.max(50, stepDistance * 0.25));
            const remaining = stepDistance - navigationDistanceIntoStepRef.current;

            if (remaining <= announceWithin) {
              navigationStepIndexRef.current += 1;
              navigationDistanceIntoStepRef.current = 0;
              const distanceAhead = Math.max(0, Math.round(remaining / 50) * 50);
              const distancePrompt = distanceAhead > 0 ? `In about ${distanceAhead} meters, ` : "";
              speakNavigationInstruction(
                `${distancePrompt}${nextStep.instruction}`,
                navigationLanguageRef.current
              );
            }
          }
        }
        previousNavigationPositionRef.current = current;
      }
    }, () => { }, { enableHighAccuracy: true, maximumAge: 1000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRideActive]);

  // ── Ride start / end ─────────────────────────────────────────────
  const handleStartRide = async () => {
    if (!ambientModeConfirmed) return;
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    await requestScreenWakeLock();
    rideStartedAtRef.current = new Date();
    rideDistanceMetersRef.current = 0;
    previousRidePositionRef.current = null;
    maxRideSpeedRef.current = 0;
    setTripLogMessage(null);
    setIsRideActive(true);
  };

  const handleEndRide = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
    const startedAt = rideStartedAtRef.current;
    if (startedAt) {
      void (async () => {
        try {
          const response = await fetch("/api/log-trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              distance_km: rideDistanceMetersRef.current / 1000,
              max_speed: maxRideSpeedRef.current,
              language_used: settings.language,
              timestamp: new Date().toISOString(),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Trip could not be saved.");
          setTripLogMessage("Trip saved to your safety impact log.");
        } catch {
          setTripLogMessage("Trip ended, but could not be saved. Check your connection and sign-in.");
        }
      })();
    }
    rideStartedAtRef.current = null;
    releaseScreenWakeLock();
    setIsRideActive(false);
    setAmbientModeConfirmed(false);
    setShowRoute(false);
    setRoutePolyline(undefined);
    setRouteSteps([]);
    navigationStepsRef.current = [];
    navigationActiveRef.current = false;
    previousNavigationPositionRef.current = null;
    setDistanceText("");
    setDurationText("");
    setEtaText("");
    setDestinationCoords(null);
    setViaWaypoint(null);
    setViaCoords(null);
    setRouteError(null);
    setPendingRoute(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentDestination("Tap earphone button to set route");
  };

  const handleSpeedUpdate = useCallback((speedKmh: number) => {
    if (isRideActive) maxRideSpeedRef.current = Math.max(maxRideSpeedRef.current, speedKmh);
  }, [isRideActive]);

  const speakConfirmation = (
    dest: string,
    dist?: string,
    dur?: string,
    lang = "bn-IN",
    via?: string | null
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      let text = "";
      const viaTextBn = via ? `${via} হয়ে ` : "";
      const viaTextHi = via ? `${via} होकर ` : "";
      const viaTextEn = via ? ` via ${via}` : "";

      if (lang.startsWith("bn")) {
        text = `${dest} এর রুট ${viaTextBn}তৈরি হয়েছে। দূরত্ব ${dist || ""}। আনুমানিক সময় ${dur || ""}।`;
      } else if (lang.startsWith("hi")) {
        text = `${dest} का रास्ता ${viaTextHi}सेट किया गया है। दूरी ${dist || ""}, अनुमानित समय ${dur || ""}।`;
      } else {
        text = `Route set to ${dest}${viaTextEn}. Distance is ${dist || ""}, approximate travel time is ${dur || ""}.`;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("[VoiceAgent] Speech synthesis failed:", e);
    }
  };

  const handleCancelPendingRoute = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }
    setPendingRoute(null);
    setRouteError(null);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleDeselectActiveRoute = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }
    setShowRoute(false);
    setRoutePolyline(undefined);
    setRouteSteps([]);
    navigationStepsRef.current = [];
    navigationActiveRef.current = false;
    previousNavigationPositionRef.current = null;
    setDistanceText("");
    setDurationText("");
    setEtaText("");
    setDestinationCoords(null);
    setViaWaypoint(null);
    setViaCoords(null);
    setCurrentDestination("Tap earphone button to set route");
    setPendingRoute(null);
    setRouteError(null);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 50]);
    }
  }, []);

  const confirmAndStartRoute = async (dest: string | null, via?: string | null) => {
    if (!dest) return;

    navigationActiveRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setShowRoute(false);
    setRoutePolyline(undefined);
    setRouteSteps([]);
    setRouteError(null);
    setIsRouting(true);

    try {
      let lat = currentLocation.lat;
      let lng = currentLocation.lng;

      if (typeof window !== "undefined" && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 4_000,
              maximumAge: 10_000,
            });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
        } catch {
          console.warn("[RiderDashboard] Using current recorded coordinates for routing.");
        }
      }

      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLat: lat,
          currentLng: lng,
          destination: dest,
          via: via || null,
        }),
      });
      const data: RouteApiResponse = await response.json();
      if (!response.ok || !data.polyline) {
        throw new Error(data.error || "Could not create a route to that destination.");
      }

      const resolvedDestName = data.destination?.name || dest;
      const resolvedViaName = data.via?.name || via || null;

      setCurrentDestination(resolvedDestName);
      setViaWaypoint(resolvedViaName);
      setRoutePolyline(data.polyline);
      const steps = data.steps || [];
      setRouteSteps(steps);
      navigationStepsRef.current = steps;
      navigationStepIndexRef.current = 0;
      navigationDistanceIntoStepRef.current = 0;
      previousNavigationPositionRef.current = { lat, lng };
      navigationActiveRef.current = steps.length > 0;
      navigationLanguageRef.current = settings.language;
      setDistanceText(data.distanceText || "");
      setDurationText(data.durationText || "");

      if (data.destination) {
        setDestinationCoords({ lat: data.destination.lat, lng: data.destination.lng });
      }

      if (data.via) {
        setViaCoords({ lat: data.via.lat, lng: data.via.lng });
      } else {
        setViaCoords(null);
      }

      if (data.duration) {
        const eta = new Date(Date.now() + data.duration * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setEtaText(eta);
      } else {
        setEtaText("");
      }

      setShowRoute(true);
      setPendingRoute(null);

      speakConfirmation(
        resolvedDestName,
        data.distanceText,
        data.durationText,
        settings.language,
        resolvedViaName
      );
      const firstStep = steps[0];
      if (firstStep) {
        const distanceText = firstStep.distance > 0
          ? firstStep.distance >= 1000
            ? ` Continue for about ${(firstStep.distance / 1000).toFixed(1)} kilometers.`
            : ` Continue for about ${Math.max(10, Math.round(firstStep.distance / 10) * 10)} meters.`
          : "";
        speakNavigationInstruction(
          `${firstStep.instruction}.${distanceText}`,
          settings.language
        );
      }
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "Could not create a route.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleDestinationFound = async (
    destination: string | null,
    transcript?: string,
    via?: string | null,
    isRerouteOnly?: boolean
  ) => {
    // Stop any existing text-to-speech synthesis immediately so microphone stays available
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }

    const clean = (transcript || "").trim().toLowerCase();
    const isConfirmWord = /^(confirm|yes|yeah|yup|ok|okay|chalo|start|हाँ|হাঁ|হ্যাঁ|চলো|ঠিক আছে|হাঁ চলো|चल)$/i.test(clean);
    const isCancelWord = /^(cancel|no|nope|stop|deselect|clear|wrong|না|নাহ|বাতিল|गलत|नहीं|रोको)$/i.test(clean);

    if (pendingRoute && isConfirmWord) {
      void confirmAndStartRoute(pendingRoute.destination, pendingRoute.via);
      return;
    }

    if (pendingRoute && isCancelWord) {
      handleCancelPendingRoute();
      return;
    }

    // Determine candidate destination
    const targetDest = destination
      ? destination
      : currentDestination !== "Tap earphone button to set route"
        ? currentDestination
        : null;

    if (!targetDest) {
      setRouteError("Please speak or enter a destination (e.g. 'Howrah Station via Howrah Bridge').");
      return;
    }

    // Resolve saved place shortcuts (Home, Work, College)
    let candidateDest = targetDest;
    let displayTitle = targetDest;
    const lowerDest = targetDest.trim().toLowerCase();

    if (
      lowerDest === "home" ||
      lowerDest === "house" ||
      lowerDest === "বাড়ি" ||
      lowerDest === "ঘর" ||
      lowerDest === "घर" ||
      lowerDest === "ghar"
    ) {
      const savedHome = settings.savedPlaces?.home?.trim();
      if (!savedHome) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            let text = "Please set your Home location first.";
            if (settings.language?.startsWith("bn")) {
              text = "অনুগ্রহ করে প্রথমে আপনার বাড়ির ঠিকানা সেট করুন।";
            } else if (settings.language?.startsWith("hi")) {
              text = "कृपया पहले अपने घर का पता सेट करें।";
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = settings.language || "en-IN";
            window.speechSynthesis.speak(utterance);
          } catch { }
        }
        setPlaceModalType("home");
        return;
      }
      candidateDest = savedHome;
      displayTitle = `🏠 Home (${candidateDest})`;
    } else if (
      lowerDest === "work" ||
      lowerDest === "office" ||
      lowerDest === "অফিস" ||
      lowerDest === "দপ্তর" ||
      lowerDest === "काम" ||
      lowerDest === "दफ्तर"
    ) {
      const savedWork = settings.savedPlaces?.work?.trim();
      if (!savedWork) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            let text = "Please set your Work location first.";
            if (settings.language?.startsWith("bn")) {
              text = "অনুগ্রহ করে প্রথমে আপনার অফিসের ঠিকানা সেট করুন।";
            } else if (settings.language?.startsWith("hi")) {
              text = "कृपया पहले अपने ऑफिस का पता सेट करें।";
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = settings.language || "en-IN";
            window.speechSynthesis.speak(utterance);
          } catch { }
        }
        setPlaceModalType("work");
        return;
      }
      candidateDest = savedWork;
      displayTitle = `💼 Work / Office (${candidateDest})`;
    } else if (
      lowerDest === "college" ||
      lowerDest === "campus" ||
      lowerDest === "university" ||
      lowerDest === "কলেজ" ||
      lowerDest === "कॉलेज"
    ) {
      const savedCollege = settings.savedPlaces?.college?.trim();
      if (!savedCollege) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            let text = "Please set your College location first.";
            if (settings.language?.startsWith("bn")) {
              text = "অনুগ্রহ করে প্রথমে আপনার কলেজের ঠিকানা সেট করুন।";
            } else if (settings.language?.startsWith("hi")) {
              text = "कृपया पहले अपने कॉलेज का पता सेट करें।";
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = settings.language || "en-IN";
            window.speechSynthesis.speak(utterance);
          } catch { }
        }
        setPlaceModalType("college");
        return;
      }
      candidateDest = savedCollege;
      displayTitle = `🎓 College / Campus (${candidateDest})`;
    }

    // Store in pending confirmation state — DO NOT lock route or speak until confirmed!
    setRouteError(null);
    setPendingRoute({
      destination: candidateDest,
      displayTitle,
      via: via || null,
      transcript,
    });

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([60, 40, 60]);
    }
  };

  const handleSaveSettings = (s: RiderSettings) => {
    setSettings(s);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("voicesarathi_settings", JSON.stringify(s));
      } catch (err) {
        console.warn("[Settings] Error saving to localStorage:", err);
      }
    }
    console.log("[Settings] Saved:", s);
  };

  const callHref = settings.emergencyContact
    ? `tel:${settings.emergencyContact}`
    : "tel:+919999999999";

  return (
    <main
      className={`min-h-screen w-full flex flex-col transition-colors duration-200 ${isLight
        ? "bg-slate-50 text-slate-900"
        : highContrastMode
          ? "bg-slate-950 text-slate-100"
          : "bg-[#070b12] text-slate-200"
        }`}
    >
      {/* =========================================================== */}
      {/* PHASE 1: MANDATORY PRE-RIDE SAFETY ONBOARDING               */}
      {/* =========================================================== */}
      {!isRideActive ? (
        <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full p-5 sm:p-7">
          <div>
            {/* Brand header */}
            <div className={`flex items-center justify-between pt-2 pb-6 border-b ${isLight ? "border-slate-200" : "border-slate-800/80"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md">
                  VS
                </div>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                    VoiceSarathi
                  </h1>
                  <span className="text-xs text-slate-400 font-medium tracking-wide">
                    Smart Helmet Audio HUD • Kolkata
                  </span>
                  {session?.user && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Rider: <span className="text-slate-200 font-medium">{session.user.name || session.user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${isLight ? "bg-white border-slate-200 text-slate-700 shadow-sm" : "bg-slate-900 border-slate-800 text-slate-300"}`}>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTime || "00:00"}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  className={`p-2 rounded-xl border active:scale-95 transition-all cursor-pointer ${isLight ? "bg-white border-slate-200 text-amber-600 hover:bg-slate-50 shadow-sm" : "bg-slate-900 border-slate-800 text-amber-400 hover:text-white"}`}
                >
                  {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Rider Settings"
                  className={`p-2 rounded-xl border active:scale-95 transition-all cursor-pointer ${isLight ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Safety callout */}
            <div className={`mt-5 p-4 rounded-2xl border transition-colors ${isLight ? "bg-amber-50 border-amber-200 text-amber-900 shadow-sm" : "bg-slate-900/90 border-amber-500/40 text-amber-200"}`}>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-300 tracking-wide uppercase">
                    Zero-Touch Audio Protocol
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    VoiceSarathi keeps your eyes and hands completely on the road. Control navigation
                    via earphone buttons or voice. Confirm earphone ambient mode below.
                  </p>
                </div>
              </div>
            </div>

            {/* Current settings summary */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Language", value: settings.language, color: "text-emerald-400" },
                { label: "Speed Limit", value: `${settings.speedLimit} km/h`, color: "text-sky-400" },
                {
                  label: "Emergency SOS",
                  value: settings.emergencyContact ? "Configured ✓" : "Not set",
                  color: settings.emergencyContact ? "text-emerald-400" : "text-rose-400",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`p-2.5 rounded-2xl border cursor-pointer active:scale-95 transition-all ${isLight ? "bg-white border-slate-200 shadow-sm hover:border-slate-300" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{label}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Saved Places Quick Status Banner */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className={`mt-3 p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${isLight ? "bg-white border-slate-200 shadow-sm hover:border-slate-300" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"}`}
              title="Click to customize your Home, Work, and College locations"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className={`text-[11px] font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Saved Places Configured</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    🏠 {settings.savedPlaces?.home || "Salt Lake"} • 💼 {settings.savedPlaces?.work || "Sector V"}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex-shrink-0 ml-2">
                Edit ⚙
              </span>
            </div>

            {/* Feature chips */}
            <div className="mt-4 space-y-2">
              {[
                {
                  icon: <Satellite className="w-4 h-4" />,
                  color: "text-emerald-400",
                  title: "ISRO Bhuvan Maps & OSM Routing",
                  desc: "Sovereign India-first mapping with live motorbike routes.",
                },
                {
                  icon: <Headphones className="w-4 h-4" />,
                  color: "text-sky-400",
                  title: "Earphone Hardware Trigger",
                  desc: "Single earphone click triggers Bengali, Hindi, or English speech.",
                },
                {
                  icon: <Zap className="w-4 h-4" />,
                  color: "text-amber-400",
                  title: "Screen Wake Lock",
                  desc: "Keeps display visible on your motorcycle mount without sleeping.",
                },
                {
                  icon: <Siren className="w-4 h-4" />,
                  color: "text-rose-400",
                  title: "Live Crash Guard & SOS",
                  desc: "Continuous accelerometer impact detection with auto-SOS beacon.",
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className={`p-3 rounded-2xl border flex items-center gap-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/70 border-slate-800/80"}`}>
                  <div className={`w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center ${color} flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="text-xs">
                    <div className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{title}</div>
                    <div className="text-slate-400 text-[11px]">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* MANDATORY CHECKBOX */}
            <div className="mt-4">
              <label
                htmlFor="ambient-checkbox"
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${ambientModeConfirmed
                  ? "bg-emerald-950/30 border-emerald-500/80 text-white shadow-sm"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
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
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${ambientModeConfirmed
                      ? "bg-emerald-500 border-emerald-500 text-slate-950"
                      : "border-slate-600 bg-slate-950"
                      }`}
                  >
                    {ambientModeConfirmed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-xs font-medium leading-snug">
                  <span className={isLight ? "text-slate-900" : "text-white"}>
                    I have enabled Transparency/Ambient mode on my earphones to hear traffic.
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Required to hear approaching vehicles, horns, and emergency sirens.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 pb-2">
            <button
              onClick={handleStartRide}
              disabled={!ambientModeConfirmed}
              type="button"
              className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 ${ambientModeConfirmed
                ? "bg-emerald-500 text-slate-950 shadow-lg active:scale-98 hover:bg-emerald-400 cursor-pointer"
                : "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60"
                }`}
            >
              <Power className="w-4 h-4 stroke-[2.5]" />
              <span>Start Ride</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="text-center mt-2.5 text-[11px] text-slate-500 font-medium">
              VoiceSarathi • Bhuvan WMS • {settings.language}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================== */
        /* PHASE 2: ACTIVE RIDER DASHBOARD — SLEEK AUTOMOTIVE HUD      */
        /* =========================================================== */
        <div className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4 sm:p-5 gap-3.5">
          {/* Top Status Strip */}
          <header className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800/80"}`}>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>RIDE ACTIVE</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-medium border ${isLight ? "bg-white border-slate-200 text-slate-700 shadow-sm" : "bg-slate-900 border-slate-800 text-slate-300"}`}>
                {currentTime}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border hidden sm:block ${wakeLockActive
                  ? "bg-emerald-950 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
              >
                {wakeLockActive ? "⚡ WAKE" : "SLEEP"}
              </span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
                className={`p-1.5 rounded-xl border active:scale-95 transition-all cursor-pointer ${isLight ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
                className={`p-1.5 rounded-xl border active:scale-95 transition-all cursor-pointer ${isLight
                  ? "bg-white border-slate-200 text-amber-600 hover:bg-slate-50 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-amber-400 hover:text-white"
                  }`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Destination Waypoint Strip */}
          <div className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-colors shadow-lg ${isLight ? "bg-white border-slate-200" : "bg-slate-900/90 border-slate-800"}`}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium flex items-center gap-2">
                <span>Target Waypoint</span>
                {viaWaypoint && (
                  <span className="text-sky-300 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    via {viaWaypoint}
                  </span>
                )}
              </div>
              <div className={`text-sm font-semibold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                {currentDestination}
              </div>
            </div>
            {showRoute && (
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full whitespace-nowrap font-semibold">
                  {viaWaypoint ? "REROUTED" : "ACTIVE"}
                </span>
                <button
                  type="button"
                  onClick={handleDeselectActiveRoute}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/80 border border-slate-700/80 text-slate-300 hover:text-rose-300 active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                  title="Deselect active route"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Saved Places Triggers (Home, Work, College) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                if (!settings.savedPlaces?.home?.trim()) {
                  setPlaceModalType("home");
                } else {
                  handleDestinationFound("Home", "Take me home");
                }
              }}
              className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm ${isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-emerald-600" : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400"}`}
              title={`Home: ${settings.savedPlaces?.home || "Click to configure"}`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!settings.savedPlaces?.work?.trim()) {
                  setPlaceModalType("work");
                } else {
                  handleDestinationFound("Work", "Take me to work");
                }
              }}
              className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm ${isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-sky-600" : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-sky-500/50 text-slate-200 hover:text-sky-400"}`}
              title={`Work: ${settings.savedPlaces?.work || "Click to configure"}`}
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="truncate">Work</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!settings.savedPlaces?.college?.trim()) {
                  setPlaceModalType("college");
                } else {
                  handleDestinationFound("College", "Take me to college");
                }
              }}
              className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm ${isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-amber-600" : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-400"}`}
              title={`College: ${settings.savedPlaces?.college || "Click to configure"}`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">College</span>
            </button>
          </div>

          {/* Pending Destination Confirmation Card */}
          {pendingRoute && (
            <div className={`p-4 rounded-2xl border shadow-xl animate-in fade-in duration-200 transition-colors ${isLight ? "bg-white border-amber-400 text-slate-900" : "bg-slate-900/95 border-amber-500/60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                      Location Detected — Confirm to Route
                    </div>
                    <div className={`text-sm sm:text-base font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                      {pendingRoute.displayTitle || pendingRoute.destination || "Target Location"}
                    </div>
                    {pendingRoute.via && (
                      <div className="text-xs text-sky-400 font-medium mt-0.5">
                        ↳ via {pendingRoute.via}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPendingRoute}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  title="Deselect location"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => confirmAndStartRoute(pendingRoute.destination, pendingRoute.via)}
                  disabled={isRouting}
                  className="py-3 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isRouting ? "Calculating..." : "Confirm Route"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelPendingRoute}
                  disabled={isRouting}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Deselect (✕)</span>
                </button>
              </div>
            </div>
          )}

          {/* Prominent High-Contrast Route Telemetry HUD Cards (Distance & Approx Time) */}
          {showRoute && (distanceText || durationText) && (
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-2xl border shadow-md flex flex-col items-center justify-center text-center transition-colors ${isLight ? "bg-white border-slate-200" : "bg-slate-900/90 border-slate-800"}`}>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Distance</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {distanceText}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border shadow-md flex flex-col items-center justify-center text-center transition-colors ${isLight ? "bg-white border-slate-200" : "bg-slate-900/90 border-slate-800"}`}>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Travel Time</span>
                </div>
                <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                  {durationText}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border shadow-md flex flex-col items-center justify-center text-center transition-colors ${isLight ? "bg-white border-slate-200" : "bg-slate-900/90 border-slate-800"}`}>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>ETA</span>
                </div>
                <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                  {etaText || "--:--"}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Main Dashboard Map with Speedometer Prominently Overlaid      */}
          {/* ------------------------------------------------------------- */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${isLight ? "border-slate-200 shadow-md bg-white" : "border-slate-800 bg-black"}`}>
            <RiderMap
              apiKey={googleMapsApiKey}
              routePolyline={showRoute ? routePolyline : undefined}
              originCoords={currentLocation}
              viaCoords={showRoute && viaCoords ? viaCoords : undefined}
              viaName={showRoute && viaWaypoint ? viaWaypoint : undefined}
              destinationCoords={showRoute && destinationCoords ? destinationCoords : undefined}
              destinationName={currentDestination}
              distanceText={showRoute ? distanceText : undefined}
              durationText={showRoute ? durationText : undefined}
              etaText={showRoute ? etaText : undefined}
              center={currentLocation}
              height="380px"
              theme={theme}
            >
              <Speedometer
                speedLimit={settings.speedLimit}
                overlayMode={true}
                onSpeedUpdate={handleSpeedUpdate}
                theme={theme}
              />
            </RiderMap>
          </div>
          {isRouting && <p className="text-xs text-sky-400 font-medium">Calculating motorbike route…</p>}
          {routeError && <p role="alert" className="text-xs text-rose-300 font-medium">{routeError}</p>}
          {showRoute && <p className="text-[11px] text-slate-400">Motorbike routes are optimized for local road conditions.</p>}
          {tripLogMessage && <p role="status" className="text-xs text-slate-300">{tripLogMessage}</p>}
          {showRoute && routeSteps && routeSteps.length > 0 && (
            <ol aria-label="Route directions" className={`space-y-1.5 rounded-2xl border p-3.5 ${isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900/90 border-slate-800 text-slate-200"}`}>
              {routeSteps.slice(0, 4).map((step, index) => (
                <li key={`${index}-${step.instruction}`} className={`flex gap-2.5 text-xs ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  <span className="font-mono text-emerald-400 font-semibold">{step.distance} m</span>
                  <span>{step.instruction}</span>
                </li>
              ))}
            </ol>
          )}

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
            onDeselect={handleCancelPendingRoute}
            pendingDestination={pendingRoute?.destination || null}
            theme={theme}
          />

          {/* Footer Controls: Simulate Crash + End Ride + Call Home */}
          <footer className="space-y-2.5 pb-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => crashMonitorRef.current?.simulateCrash()}
                className={`py-3 px-3 rounded-xl border font-semibold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${isLight ? "bg-white border-amber-300 text-amber-700 shadow-sm hover:bg-amber-50" : "bg-slate-900 border-amber-600/50 text-amber-300"}`}
              >
                <Siren className="w-4 h-4 text-amber-400" />
                <span>Simulate Crash</span>
              </button>

              <button
                type="button"
                onClick={handleEndRide}
                className={`py-3 px-3 rounded-xl border font-semibold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${isLight ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"}`}
              >
                <Power className="w-4 h-4 text-rose-500" />
                <span>End Ride</span>
              </button>
            </div>

            {/* CALL HOME BUTTON */}
            <a
              href={callHref}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 active:scale-98 transition-all shadow-md"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={`Call emergency contact ${settings.emergencyContact || "home"}`}
            >
              <Phone className="w-5 h-5 text-white" />
              <span>Emergency Call Home</span>
              {settings.emergencyContact && (
                <span className="text-xs text-rose-100/80 font-normal ml-auto font-mono">
                  {settings.emergencyContact.slice(-4).padStart(settings.emergencyContact.length, "•")}
                </span>
              )}
            </a>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>VoiceSarathi Mobility HUD • ISRO Bhuvan</span>
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
        theme={theme}
      />

      {/* Set Place Modal (Home / Work / College) */}
      <SetPlaceModal
        isOpen={placeModalType !== null}
        onClose={() => setPlaceModalType(null)}
        placeType={placeModalType}
        currentValue={
          placeModalType === "home"
            ? settings.savedPlaces?.home
            : placeModalType === "work"
              ? settings.savedPlaces?.work
              : placeModalType === "college"
                ? settings.savedPlaces?.college
                : ""
        }
        onSave={handleSavePlaceModal}
        theme={theme}
        language={settings.language}
      />
    </main>
  );
}
