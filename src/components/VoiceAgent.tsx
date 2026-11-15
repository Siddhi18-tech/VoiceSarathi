"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  Headphones,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Keyboard,
  Check,
  Navigation,
  X,
} from "lucide-react";

export type VoiceState = "idle" | "listening" | "processing" | "success" | "error";

interface VoiceAgentProps {
  defaultLanguage?: string;
  onDestinationExtracted?: (
    destination: string | null,
    transcript: string,
    via?: string | null,
    isRerouteOnly?: boolean
  ) => void;
  isRideActive?: boolean;
  onDeselect?: () => void;
  pendingDestination?: string | null;
  theme?: "dark" | "light";
}

interface DestinationApiResponse {
  destination?: string | null;
  via?: string | null;
  isRerouteOnly?: boolean;
  error?: string;
}

const QUICK_KOLKATA_CHIPS = [
  "🏠 Home",
  "💼 Work",
  "🎓 College",
  "Nearest Metro",
  "Nearest Fine Dine Cafe",
  "Nearest Petrol Pump",
  "South City Mall",
  "Howrah Station via Howrah Bridge",
  "Kolkata Airport",
  "Eco Park",
  "Victoria Memorial",
];

export default function VoiceAgent({
  defaultLanguage = "bn-IN",
  onDestinationExtracted,
  isRideActive = true,
  onDeselect,
  pendingDestination,
  theme = "dark",
}: VoiceAgentProps) {
  const isLight = theme === "light";
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [voiceStatus, setVoiceStatus] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");
  const [lastExtractedDestination, setLastExtractedDestination] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [mediaSessionActive, setMediaSessionActive] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestSpeechRef = useRef<string>("");

  // Sync default language if prop updates
  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  // Sync if pendingDestination was cleared or deselected from parent
  useEffect(() => {
    if (pendingDestination === null) {
      setLastExtractedDestination(null);
    }
  }, [pendingDestination]);

  // -------------------------------------------------------------
  // 1. Send captured speech/text to extraction API
  // -------------------------------------------------------------
  const sendTranscriptToApi = useCallback(
    async (capturedText: string) => {
      const query = capturedText.trim();
      if (!query) {
        setVoiceStatus("idle");
        return;
      }

      setVoiceStatus("processing");
      setErrorMessage(null);
      console.log("[VoiceAgent] Processing location query:", query);

      try {
        const response = await fetch("/api/extract-destination", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript: query }),
        });

        let data: DestinationApiResponse = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        // Even if extraction API returned empty or partial result, fallback to query directly
        const resolvedDest = data.destination || (!data.via ? query : null);
        const resolvedVia = data.via || null;
        const isReroute = Boolean(data.isRerouteOnly);

        if (!resolvedDest && !resolvedVia) {
          const fallbackDest = query;
          setLastExtractedDestination(fallbackDest);
          setVoiceStatus("success");
          if (onDestinationExtracted) {
            onDestinationExtracted(fallbackDest, query, null, false);
          }
        } else {
          const displayLabel = resolvedVia
            ? resolvedDest
              ? `${resolvedDest} (via ${resolvedVia})`
              : `Reroute via ${resolvedVia}`
            : resolvedDest || query;

          setLastExtractedDestination(displayLabel);
          setVoiceStatus("success");

          if (onDestinationExtracted) {
            onDestinationExtracted(resolvedDest, query, resolvedVia, isReroute);
          }
        }

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([80, 50, 80]);
        }

        setTimeout(() => {
          setVoiceStatus("idle");
        }, 4000);
      } catch (err: any) {
        console.warn("[VoiceAgent] Non-fatal extraction notice, fallback to raw query:", err?.message || err);
        setLastExtractedDestination(query);
        setVoiceStatus("success");
        if (onDestinationExtracted) {
          onDestinationExtracted(query, query, null, false);
        }
        setTimeout(() => {
          setVoiceStatus("idle");
        }, 4000);
      }
    },
    [onDestinationExtracted]
  );

  // -------------------------------------------------------------
  // 2. Commit Speech & Submit
  // -------------------------------------------------------------
  const commitSpeechAndSend = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
    }

    isListeningRef.current = false;
    isStartingRef.current = false;

    const textToSend = latestSpeechRef.current.trim();
    if (textToSend) {
      setTranscript(textToSend);
      setInterimText("");
      sendTranscriptToApi(textToSend);
    } else {
      setVoiceStatus("idle");
    }
  }, [sendTranscriptToApi]);

  // -------------------------------------------------------------
  // 3. Start Continuous Speech Recognition with Silence Buffer
  // -------------------------------------------------------------
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    // Immediately stop any text-to-speech so AI voice never talks over rider or blocks mic
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setErrorMessage("Speech Recognition is not supported on this browser. Please use the manual location entry below.");
      return;
    }

    // Prevent double-start if already initializing or listening
    if (isStartingRef.current || isListeningRef.current) {
      console.log("[VoiceAgent] Already initializing or listening.");
      return;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Safely remove listeners from existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch { }
      recognitionRef.current = null;
    }

    latestSpeechRef.current = "";
    setTranscript("");
    setInterimText("");
    setErrorMessage(null);
    isStartingRef.current = true;
    setVoiceStatus("listening");

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = selectedLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isStartingRef.current = false;
        isListeningRef.current = true;
        setVoiceStatus("listening");
        console.log(`[VoiceAgent] Speech recognition active (${selectedLanguage})`);
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(50);
        }
      };

      recognition.onresult = (event: any) => {
        let accumulatedFinal = "";
        let currentInterim = "";

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            accumulatedFinal += result[0].transcript + " ";
          } else {
            currentInterim += result[0].transcript;
          }
        }

        const fullSpeech = (accumulatedFinal + " " + currentInterim).trim();
        latestSpeechRef.current = fullSpeech;

        if (currentInterim) {
          setInterimText(currentInterim);
        }
        if (accumulatedFinal) {
          setTranscript(accumulatedFinal.trim());
        }

        // Wait 2200ms of comfortable silence before auto-submitting
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          console.log("[VoiceAgent] Silence detected. Committing speech:", latestSpeechRef.current);
          commitSpeechAndSend();
        }, 2200);
      };

      recognition.onerror = (event: any) => {
        isStartingRef.current = false;
        console.warn("[VoiceAgent] Speech notice event:", event.error);

        // 'aborted' is triggered during clean stop/restart - NOT an error!
        if (event.error === "aborted") {
          return;
        }

        // 'no-speech' is a normal timeout when no words were captured
        if (event.error === "no-speech") {
          if (!latestSpeechRef.current.trim()) {
            setVoiceStatus("idle");
            isListeningRef.current = false;
          }
          return;
        }

        isListeningRef.current = false;

        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access blocked. Click the lock/settings icon in your browser address bar to allow mic access.");
        } else if (event.error === "audio-capture") {
          setErrorMessage("No microphone detected. Please check your mic connection or use manual location entry below.");
        } else if (event.error === "network") {
          setErrorMessage("Network issue with speech recognition. Retrying or use manual entry.");
        } else {
          setErrorMessage(`Speech notice: ${event.error}. You can also type your destination below.`);
        }

        setVoiceStatus("error");
        setTimeout(() => setVoiceStatus("idle"), 3500);
      };

      recognition.onend = () => {
        isStartingRef.current = false;
        console.log("[VoiceAgent] Speech session onend.");
        if (latestSpeechRef.current.trim() && isListeningRef.current) {
          isListeningRef.current = false;
          commitSpeechAndSend();
        } else {
          isListeningRef.current = false;
          setVoiceStatus((prev) => (prev === "listening" ? "idle" : prev));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error: any) {
      console.warn("[VoiceAgent] Could not start recognition:", error?.message || error);
      isStartingRef.current = false;
      if (error?.message?.includes("already started")) {
        isListeningRef.current = true;
        setVoiceStatus("listening");
        return;
      }
      isListeningRef.current = false;
      setVoiceStatus("error");
      setErrorMessage("Could not activate microphone. Please tap again or use manual location entry below.");
      setTimeout(() => setVoiceStatus("idle"), 3000);
    }
  }, [selectedLanguage, commitSpeechAndSend]);

  // Ref to always provide the freshest startListening to background handlers
  const startListeningRef = useRef(startListening);
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // -------------------------------------------------------------
  // 4. Media Session Earphone Hardware Trigger
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSpeech = Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    setIsSupported(hasSpeech);

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "VoiceSarathi Earphone Listener",
          artist: "Zero-Touch Smart Helmet",
          album: "Multilingual Kolkata HUD",
          artwork: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
        });

        const handleEarphoneButtonTrigger = () => {
          if (isListeningRef.current) {
            commitSpeechAndSend();
          } else {
            startListeningRef.current();
          }
        };

        navigator.mediaSession.setActionHandler("play", handleEarphoneButtonTrigger);
        navigator.mediaSession.setActionHandler("pause", handleEarphoneButtonTrigger);
        navigator.mediaSession.setActionHandler("nexttrack", handleEarphoneButtonTrigger);
        navigator.mediaSession.setActionHandler("previoustrack", handleEarphoneButtonTrigger);

        setMediaSessionActive(true);
      } catch { }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch { }
        recognitionRef.current = null;
      }
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.setActionHandler("play", null);
          navigator.mediaSession.setActionHandler("pause", null);
          navigator.mediaSession.setActionHandler("nexttrack", null);
          navigator.mediaSession.setActionHandler("previoustrack", null);
        } catch { }
      }
    };
  }, [commitSpeechAndSend]);

  // -------------------------------------------------------------
  // 5. Mic Button Tap Handler
  // -------------------------------------------------------------
  const handleMicClick = () => {
    // If currently listening, tap commits speech immediately
    if (voiceStatus === "listening" || isListeningRef.current) {
      commitSpeechAndSend();
      return;
    }

    if (voiceStatus === "processing" || isStartingRef.current) {
      return;
    }

    startListening();
  };

  // -------------------------------------------------------------
  // 6. Manual Entry Handlers
  // -------------------------------------------------------------
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const query = manualInput.trim();
    setManualInput("");
    setTranscript(query);
    setInterimText("");
    sendTranscriptToApi(query);
  };

  const handleQuickChipSelect = (chipText: string) => {
    // Strip emoji prefixes if present
    const cleanText = chipText.replace(/^[\p{Emoji}\s]+/u, "").trim();
    setTranscript(chipText);
    setInterimText("");
    sendTranscriptToApi(cleanText || chipText);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!isSupported && (
        <div className="w-full mb-4 p-3 bg-amber-950/80 border-2 border-amber-500 rounded-xl flex items-center gap-3 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Browser Notice:</strong> Speech Recognition is unavailable in this browser. You can use the manual location entry below.
          </span>
        </div>
      )}

      {/* Main Voice & Entry Hub */}
      <div className={`w-full relative overflow-hidden border rounded-3xl p-5 shadow-2xl backdrop-blur-xl transition-colors ${isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900/90 border-slate-800 text-slate-200"}`}>
        {/* Header: Earphone Status + Language Selector */}
        <div className={`flex flex-wrap items-center justify-between border-b pb-3 mb-4 gap-2 ${isLight ? "border-slate-100" : "border-slate-800/80"}`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${mediaSessionActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                }`}
            />
            <Headphones
              className={`w-4 h-4 ${mediaSessionActive ? "text-emerald-400" : "text-slate-500"
                }`}
            />
            <span className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Earphone:{" "}
              {mediaSessionActive ? (
                <span className="text-emerald-400 font-semibold">Active (Zero-Touch)</span>
              ) : (
                <span className="text-slate-500">Standby</span>
              )}
            </span>
          </div>

          {/* Multilingual Speech Language Toggle (Segmented control) */}
          <div className={`flex items-center p-0.5 rounded-xl text-xs font-medium border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950/80 border-slate-800"}`}>
            {[
              { code: "bn-IN", label: "বাংলা" },
              { code: "hi-IN", label: "हिन्दी" },
              { code: "en-IN", label: "English" },
            ].map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSelectedLanguage(code);
                  console.log("[VoiceAgent] Language switched to:", code);
                }}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${selectedLanguage === code ? (isLight ? "bg-white text-slate-900 font-semibold shadow-sm" : "bg-slate-800 text-white font-semibold shadow-sm") : (isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-slate-200")
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Central interactive voice dial */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={handleMicClick}
            type="button"
            className={`relative flex items-center justify-center w-[84px] h-[84px] rounded-full transition-all duration-300 active:scale-95 cursor-pointer ${voiceStatus === "listening"
              ? "bg-gradient-to-b from-emerald-950/70 to-slate-900 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]"
              : voiceStatus === "processing"
                ? "bg-slate-800 border-2 border-sky-400/80 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.25)]"
                : voiceStatus === "success"
                  ? "bg-slate-800 border-2 border-emerald-400 text-emerald-400"
                  : isLight ? "bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 border border-slate-300 text-slate-700 hover:border-slate-400 shadow-md" : "bg-gradient-to-b from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700/80 text-slate-200 hover:border-slate-500 shadow-md"
              }`}
            aria-label="Tap to speak or tap while listening to finish"
          >
            {voiceStatus === "listening" ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-1 bg-emerald-400 rounded-full listening-bar-1" />
                  <div className="w-1 bg-emerald-400 rounded-full listening-bar-2" />
                  <div className="w-1 bg-emerald-400 rounded-full listening-bar-3" />
                  <div className="w-1 bg-emerald-400 rounded-full listening-bar-4" />
                  <div className="w-1 bg-emerald-400 rounded-full listening-bar-5" />
                </div>
                <span className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider">
                  Done
                </span>
              </div>
            ) : voiceStatus === "processing" ? (
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            ) : voiceStatus === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <Mic className={`w-8 h-8 ${isLight ? "text-slate-700" : "text-slate-200"}`} />
            )}
          </button>

          {/* Primary Status Text Badge */}
          <div className="mt-3.5 text-center">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-medium tracking-wide ${voiceStatus === "listening"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : voiceStatus === "processing"
                  ? "bg-sky-500/15 border border-sky-500/30 text-sky-300"
                  : voiceStatus === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : isLight
                      ? "bg-slate-100 border border-slate-300 text-slate-700 shadow-sm"
                      : "bg-slate-800/80 border border-slate-700/70 text-slate-300"
                }`}
            >
              {voiceStatus === "listening" && "Listening..."}
              {voiceStatus === "processing" && "Locating..."}
              {voiceStatus === "success" && "Location Ready"}
              {voiceStatus === "idle" && "Tap to Speak"}
              {voiceStatus === "error" && "Tap to Retry"}
            </span>

            <p className={`text-xs mt-1.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {voiceStatus === "listening" ? (
                <span>
                  Listening to voice... <strong className="text-emerald-300 font-semibold">Tap mic when done</strong>.
                </span>
              ) : (
                "Tap mic or click earphone button to speak"
              )}
            </p>
          </div>
        </div>

        {/* Live Audio Transcript Display Box */}
        {(interimText || transcript) && (
          <div className={`mt-4 p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-950/90 border-slate-800 text-white"}`}>
            <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
              <span>LIVE SPEECH</span>
              <span className="text-emerald-400 font-semibold">{selectedLanguage}</span>
            </div>
            <div className={`text-sm font-semibold leading-relaxed ${isLight ? "text-slate-900" : "text-white"}`}>
              {transcript || interimText}
              {interimText && <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse" />}
            </div>
            {voiceStatus === "listening" && (
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={commitSpeechAndSend}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Done Speaking</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Extracted Destination Display Card */}
        {lastExtractedDestination && (
          <div className={`mt-3.5 p-3.5 rounded-2xl border flex items-center justify-between ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Captured Voice Target
                </div>
                <div className={`text-sm font-semibold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  {lastExtractedDestination}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold px-2 py-0.5 rounded-md">
                Captured
              </span>
              <button
                type="button"
                onClick={() => {
                  setLastExtractedDestination(null);
                  setTranscript("");
                  setInterimText("");
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  if (onDeselect) onDeselect();
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-950/60 hover:text-rose-300 transition-colors cursor-pointer"
                title="Deselect location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 text-xs text-rose-300 bg-rose-950/50 p-2.5 rounded-xl border border-rose-900/60 text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* MANUAL LOCATION ENTRY SECTION                                */}
        {/* ----------------------------------------------------------- */}
        <div className={`mt-5 pt-4 border-t ${isLight ? "border-slate-100" : "border-slate-800"}`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              <Keyboard className="w-4 h-4 text-emerald-400" />
              <span>Search Destination</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Supports &quot;via&quot; reroutes
            </span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Navigation className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Search place, metro, cafe, or route (e.g. South City Mall via EM Bypass)..."
                className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium focus:outline-none transition-colors ${isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500" : "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-slate-600"}`}
              />
            </div>
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer flex-shrink-0"
            >
              <span>Set</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Kolkata Landmark Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_KOLKATA_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickChipSelect(chip)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900" : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white"}`}
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Earphone Button Quick Instruction Helper */}
      <div className={`mt-3 w-full border rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs ${isLight ? "bg-slate-100/80 border-slate-200 text-slate-600" : "bg-slate-900/60 border-slate-800/80 text-slate-400"}`}>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Earphone Button Trigger
        </span>
        <span className={`font-medium ${isLight ? "text-slate-800" : "text-slate-300"}`}>Single Click = Talk / Finish</span>
      </div>
    </div>
  );
}
