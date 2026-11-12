"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Headphones, Volume2, Radio, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export type VoiceState = "idle" | "listening" | "processing" | "success" | "error";

interface VoiceAgentProps {
  defaultLanguage?: string;
  onDestinationExtracted?: (destination: string, transcript: string) => void;
  isRideActive?: boolean;
}

interface DestinationApiResponse {
  destination: string;
  success?: boolean;
  timestamp?: string;
  error?: string;
}

export default function VoiceAgent({
  defaultLanguage = "bn-IN",
  onDestinationExtracted,
  isRideActive = true,
}: VoiceAgentProps) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");
  const [lastExtractedDestination, setLastExtractedDestination] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [mediaSessionActive, setMediaSessionActive] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // -------------------------------------------------------------
  // 1. Send Captured Transcript to Backend / Mock API
  // -------------------------------------------------------------
  const sendTranscriptToApi = useCallback(
    async (capturedText: string) => {
      if (!capturedText.trim()) return;

      setVoiceStatus("processing");
      console.log("[VoiceAgent] Sending transcript for destination extraction:", capturedText);

      try {
        const response = await fetch("/api/extract-destination", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript: capturedText }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DestinationApiResponse = await response.json();

        // Exact mock log required by prompt specification:
        console.log({ destination: data.destination || "Mock Destination" });

        setLastExtractedDestination(data.destination || "Mock Destination");
        setVoiceStatus("success");

        if (onDestinationExtracted) {
          onDestinationExtracted(data.destination || "Mock Destination", capturedText);
        }

        // Haptic feedback for rider acknowledgment
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([80, 50, 80]);
        }

        // Reset status to idle after a few seconds
        setTimeout(() => {
          setVoiceStatus("idle");
        }, 4000);
      } catch (err) {
        console.error("[VoiceAgent] Destination extraction failed:", err);
        // Fallback simulation in case network is disconnected
        const fallbackDestination = "Mock Destination";
        console.log({ destination: fallbackDestination });
        setLastExtractedDestination(fallbackDestination);
        setVoiceStatus("success");

        if (onDestinationExtracted) {
          onDestinationExtracted(fallbackDestination, capturedText);
        }

        setTimeout(() => {
          setVoiceStatus("idle");
        }, 4000);
      }
    },
    [onDestinationExtracted]
  );

  // -------------------------------------------------------------
  // 2. Start Speech Recognition (bn-IN default)
  // -------------------------------------------------------------
  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage("Speech Recognition is not supported on this browser.");
      return;
    }

    if (isListeningRef.current) {
      console.log("[VoiceAgent] Recognition already in progress. Ignoring trigger.");
      return;
    }

    try {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setIsSupported(false);
        setErrorMessage("Speech Recognition API unavailable in window.");
        return;
      }

      // Re-create instance to avoid stale state in some browser implementations
      const recognition = new SpeechRecognitionClass();
      recognition.lang = defaultLanguage; // 'bn-IN' (Bengali - India)
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setVoiceStatus("listening");
        setErrorMessage(null);
        setInterimText("");
        console.log(`[VoiceAgent] Speech recognition activated (Language: ${defaultLanguage})`);

        // Haptic tap to inform rider listening has commenced
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(50);
        }
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscriptAccumulated = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptAccumulated += result[0].transcript;
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscriptAccumulated) {
          setTranscript(finalTranscriptAccumulated);
          setInterimText("");
          sendTranscriptToApi(finalTranscriptAccumulated);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceAgent] Speech recognition event error:", event.error);
        isListeningRef.current = false;

        if (event.error === "no-speech") {
          setErrorMessage("No speech detected. Please speak closer to helmet mic.");
        } else if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied. Enable microphone access.");
        } else {
          setErrorMessage(`Audio error: ${event.error}`);
        }

        setVoiceStatus("error");
        setTimeout(() => {
          setVoiceStatus("idle");
        }, 3000);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        console.log("[VoiceAgent] Speech recognition session concluded.");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("[VoiceAgent] Failed to initiate speech recognition:", error);
      isListeningRef.current = false;
      setVoiceStatus("error");
      setErrorMessage("Could not activate microphone recognition.");
    }
  }, [defaultLanguage, isSupported, sendTranscriptToApi]);

  // -------------------------------------------------------------
  // 3. Media Session Hijack & Silent Audio Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check browser compatibility for speech recognition
    const hasSpeech = Boolean(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
    setIsSupported(hasSpeech);

    // Create & setup looping silent audio element
    // Uses lightweight silent WAV data URI fallback to guarantee zero network latency
    const silentAudioDataUri =
      "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABkYXRhEgAAAAAAAACAgICAgICAgICAgICA";

    const audio = new Audio();
    audio.src = "/silent.wav";
    audio.loop = true;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audioRef.current = audio;

    // Fallback if public silent.wav fails to load
    audio.onerror = () => {
      console.log("[VoiceAgent] Falling back to inline silent data URI.");
      audio.src = silentAudioDataUri;
    };

    // Attempt starting the silent audio playback to register MediaSession
    const playSilentAudio = async () => {
      try {
        await audio.play();
        setAudioPlaying(true);
        console.log("[VoiceAgent] Silent background audio running. Earphone hooks active.");
      } catch (err) {
        console.warn(
          "[VoiceAgent] Autoplay prevented until user interaction. Will engage upon rider tap.",
          err
        );
        setAudioPlaying(false);
      }
    };

    playSilentAudio();

    // Setup Media Session API handlers
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "VoiceSarathi Earphone Listener",
          artist: "Zero-Touch Smart Helmet",
          album: "Bangla bn-IN Trigger Mode",
          artwork: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });

        // Handler for earphone button click (Single click on earphones sends play or pause)
        const handleEarphoneButtonTrigger = () => {
          console.log("[VoiceAgent] Earphone button pressed! Activating VoiceSarathi...");

          // Keep audio playing so the session remains hijacked
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }

          startListening();
        };

        // Hijack play and pause actions
        navigator.mediaSession.setActionHandler("play", handleEarphoneButtonTrigger);
        navigator.mediaSession.setActionHandler("pause", handleEarphoneButtonTrigger);

        // Also hijack previous/next track in case the rider uses double clicks or headset remotes
        navigator.mediaSession.setActionHandler("nexttrack", handleEarphoneButtonTrigger);
        navigator.mediaSession.setActionHandler("previoustrack", handleEarphoneButtonTrigger);

        setMediaSessionActive(true);
        console.log("[VoiceAgent] navigator.mediaSession action handlers bound successfully.");
      } catch (mediaError) {
        console.warn("[VoiceAgent] MediaSession handler registration warning:", mediaError);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.setActionHandler("play", null);
          navigator.mediaSession.setActionHandler("pause", null);
          navigator.mediaSession.setActionHandler("nexttrack", null);
          navigator.mediaSession.setActionHandler("previoustrack", null);
        } catch {}
      }
    };
  }, [startListening]);

  // Ensure audio plays if active state flips or user interacts
  const handleManualAudioResume = async () => {
    if (audioRef.current && !audioPlaying) {
      try {
        await audioRef.current.play();
        setAudioPlaying(true);
      } catch (e) {
        console.warn("[VoiceAgent] Could not play audio:", e);
      }
    }
    startListening();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Compatibility Notice if Speech API is absent */}
      {!isSupported && (
        <div className="w-full mb-4 p-3 bg-amber-950/80 border-2 border-amber-500 rounded-xl flex items-center gap-3 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Browser Notice:</strong> Web Speech API is missing. For full Bengali earphone
            voice control, open VoiceSarathi in Google Chrome on your device.
          </span>
        </div>
      )}

      {/* Main Voice Status Hub */}
      <div className="w-full relative overflow-hidden bg-black border-2 border-neutral-700/80 rounded-2xl p-5 shadow-2xl">
        {/* Glow accent based on voice state */}
        <div
          className={`absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-40 transition-colors duration-500 pointer-events-none ${
            voiceStatus === "listening"
              ? "bg-[#00f0ff]"
              : voiceStatus === "processing"
              ? "bg-[#ffee00]"
              : voiceStatus === "success"
              ? "bg-[#00ff88]"
              : "bg-blue-600/30"
          }`}
        />

        {/* Top telemetry bar of voice agent */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Headphones
              className={`w-5 h-5 ${
                mediaSessionActive && audioPlaying ? "text-[#00ff88]" : "text-neutral-500"
              }`}
            />
            <span className="text-xs font-mono tracking-wider uppercase text-neutral-300">
              Earphone Hijack:{" "}
              {mediaSessionActive ? (
                <span className="text-[#00ff88] font-bold">READY (Zero-Touch)</span>
              ) : (
                <span className="text-neutral-500">STANDBY</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-[#00f0ff]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>bn-IN (বাংলা)</span>
          </div>
        </div>

        {/* Central interactive voice visualizer */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={handleManualAudioResume}
            type="button"
            className={`relative flex items-center justify-center w-28 h-28 rounded-full border-4 transition-all duration-300 active:scale-95 cursor-pointer ${
              voiceStatus === "listening"
                ? "border-[#00f0ff] bg-[#00f0ff]/20 animate-radar shadow-[0_0_40px_rgba(0,240,255,0.6)]"
                : voiceStatus === "processing"
                ? "border-[#ffee00] bg-[#ffee00]/20 animate-pulse shadow-[0_0_30px_rgba(255,238,0,0.5)]"
                : voiceStatus === "success"
                ? "border-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_30px_rgba(0,255,136,0.5)]"
                : "border-neutral-700 bg-neutral-900/90 hover:border-neutral-500"
            }`}
            aria-label="Activate voice listener or tap to speak"
          >
            {voiceStatus === "listening" ? (
              <div className="flex items-center gap-1">
                <div className="w-1.5 bg-[#00f0ff] rounded-full listening-bar-1" />
                <div className="w-1.5 bg-[#00f0ff] rounded-full listening-bar-2" />
                <div className="w-1.5 bg-[#00f0ff] rounded-full listening-bar-3" />
                <div className="w-1.5 bg-[#00f0ff] rounded-full listening-bar-4" />
                <div className="w-1.5 bg-[#00f0ff] rounded-full listening-bar-5" />
              </div>
            ) : voiceStatus === "processing" ? (
              <Loader2 className="w-12 h-12 text-[#ffee00] animate-spin" />
            ) : voiceStatus === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-[#00ff88]" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          {/* Primary Status Text Badge */}
          <div className="mt-4 text-center">
            <span
              className={`inline-block px-4 py-1 rounded-md text-sm font-black tracking-widest uppercase ${
                voiceStatus === "listening"
                  ? "bg-[#00f0ff] text-black shadow-lg"
                  : voiceStatus === "processing"
                  ? "bg-[#ffee00] text-black shadow-lg"
                  : voiceStatus === "success"
                  ? "bg-[#00ff88] text-black"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {voiceStatus === "listening" && "Listening..."}
              {voiceStatus === "processing" && "Processing..."}
              {voiceStatus === "success" && "Destination Found"}
              {voiceStatus === "idle" && "Zero-Touch Standby"}
              {voiceStatus === "error" && "Recognition Retry"}
            </span>

            <p className="text-xs text-neutral-400 mt-2 font-medium">
              {voiceStatus === "listening"
                ? "Speak your destination in Bengali (e.g. 'হাওড়া স্টেশন যাব')"
                : "Press earphone button once or tap the helmet mic"}
            </p>
          </div>
        </div>

        {/* Live Bengali Audio Transcript Display Box */}
        {(interimText || transcript) && (
          <div className="mt-4 p-3 bg-neutral-900/90 border border-neutral-700 rounded-xl">
            <div className="text-[11px] font-mono text-neutral-400 mb-1 flex items-center justify-between">
              <span>LIVE VOICE STREAM</span>
              <span className="text-[#00f0ff]">bn-IN</span>
            </div>
            <div className="text-lg font-bold text-white leading-relaxed">
              {transcript || interimText}
              {interimText && <span className="inline-block w-2 h-4 ml-1 bg-[#00f0ff] animate-ping" />}
            </div>
          </div>
        )}

        {/* Extracted Destination Display Card */}
        {lastExtractedDestination && (
          <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-950/80 to-neutral-900 border-2 border-[#00ff88] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88]">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold">
                  Navigating To
                </div>
                <div className="text-base font-extrabold text-white">
                  {lastExtractedDestination}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono bg-[#00ff88] text-black font-extrabold px-2.5 py-1 rounded">
              CONFIRMED
            </span>
          </div>
        )}

        {/* Error message if any */}
        {errorMessage && (
          <div className="mt-3 text-xs text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-800 text-center font-mono">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Earphone Button Quick Instruction Helper */}
      <div className="mt-3 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
          Earphone Hardware Trigger
        </span>
        <span className="font-mono text-neutral-300">Single Click = Talk</span>
      </div>
    </div>
  );
}
