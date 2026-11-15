"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Home,
  Briefcase,
  GraduationCap,
  MapPin,
  Mic,
  Check,
  Navigation,
  Loader2,
} from "lucide-react";

export interface SetPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeType: "home" | "work" | "college" | null;
  currentValue?: string;
  onSave: (
    placeType: "home" | "work" | "college",
    address: string,
    startRouteImmediately: boolean
  ) => void;
  theme?: "dark" | "light";
  language?: string;
}

const PLACE_CONFIG = {
  home: {
    title: "Set Your Home Location",
    bengaliTitle: "আপনার বাড়ির ঠিকানা সেট করুন",
    hindiTitle: "अपना घर का पता सेट करें",
    icon: Home,
    color: "text-emerald-500",
    accentBg: "bg-emerald-500/15",
    placeholder: "e.g. Behala Chowrasta, Jadavpur 8B, New Town, Garia...",
    speechPrompt: "Where is your home? Speak or enter your home address.",
    suggestions: [
      "Behala Chowrasta",
      "Jadavpur 8B Bus Stand",
      "Garia Metro",
      "Salt Lake Sector 1",
      "New Town Action Area 1",
      "Howrah Maidan",
      "Dum Dum Junction",
      "Ballygunge Circular Road",
      "Kasba",
    ],
  },
  work: {
    title: "Set Your Work / Office Location",
    bengaliTitle: "আপনার অফিসের ঠিকানা সেট করুন",
    hindiTitle: "अपने ऑफिस का पता सेट करें",
    icon: Briefcase,
    color: "text-sky-500",
    accentBg: "bg-sky-500/15",
    placeholder: "e.g. Salt Lake Sector V, BBD Bagh, Park Street, New Town...",
    speechPrompt: "Where is your office? Speak or enter your work address.",
    suggestions: [
      "Salt Lake Sector V",
      "BBD Bagh / Dalhousie",
      "Park Street",
      "Camac Street",
      "New Town Financial Hub",
      "Chowringhee",
      "Rajarhat IT Park",
      "Kankurgachi",
    ],
  },
  college: {
    title: "Set Your College / Campus Location",
    bengaliTitle: "আপনার কলেজের ঠিকানা সেট করুন",
    hindiTitle: "अपने कॉलेज का पता सेट करें",
    icon: GraduationCap,
    color: "text-amber-500",
    accentBg: "bg-amber-500/15",
    placeholder: "e.g. Jadavpur University, College Street, St. Xavier's...",
    speechPrompt: "Which college or campus do you go to? Speak or enter your campus.",
    suggestions: [
      "College Street (Calcutta University)",
      "Jadavpur University Main Campus",
      "St. Xavier's College, Park Street",
      "Presidency University",
      "IIEST Shibpur, Howrah",
      "IEM / UEM, Salt Lake",
      "Heritage Institute of Technology",
    ],
  },
};

export default function SetPlaceModal({
  isOpen,
  onClose,
  placeType,
  currentValue = "",
  onSave,
  theme = "dark",
  language = "bn-IN",
}: SetPlaceModalProps) {
  const [address, setAddress] = useState(currentValue);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isLight = theme === "light";

  useEffect(() => {
    if (isOpen) {
      setAddress(currentValue || "");
    }
  }, [isOpen, currentValue]);

  if (!isOpen || !placeType) return null;

  const config = PLACE_CONFIG[placeType];
  const IconComponent = config.icon;

  const handleStartSpeech = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (e: any) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setAddress(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("[SetPlaceModal] Speech error:", err);
      setIsListening(false);
    }
  };

  const handleSaveAndRoute = () => {
    const trimmed = address.trim();
    if (!trimmed) {
      alert("Please enter a location or landmark name.");
      return;
    }
    onSave(placeType, trimmed, true);
    onClose();
  };

  const handleSaveOnly = () => {
    const trimmed = address.trim();
    if (!trimmed) {
      alert("Please enter a location or landmark name.");
      return;
    }
    onSave(placeType, trimmed, false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[8500] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border flex flex-col transition-colors ${
          isLight
            ? "bg-slate-50 border-slate-200 text-slate-900"
            : "bg-slate-950 border-slate-800 text-slate-100"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${config.accentBg} ${config.color} flex items-center justify-center flex-shrink-0 font-bold`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {config.title}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {config.bengaliTitle} • {config.hindiTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border active:scale-90 transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            VoiceSarathi remembers this location. Whenever you say{" "}
            <strong className={config.color}>
              &quot;Take me {placeType === "home" ? "home" : `to ${placeType}`}&quot;
            </strong>{" "}
            or tap the {placeType} button, it will automatically navigate here without asking again.
          </p>

          {/* Input field with voice mic button */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              <MapPin className={`w-3.5 h-3.5 ${config.color}`} />
              <span>Location / Landmark / Area in Kolkata</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAndRoute();
                }}
                placeholder={config.placeholder}
                className={`w-full border rounded-xl pl-4 pr-11 py-3 text-xs font-medium focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-sm placeholder-slate-400"
                    : "bg-slate-900 border-slate-700 text-white focus:border-emerald-500 placeholder-slate-500"
                }`}
              />
              <button
                type="button"
                onClick={handleStartSpeech}
                title="Speak your location"
                className={`absolute right-2.5 p-2 rounded-lg transition-all active:scale-90 cursor-pointer ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : isLight
                    ? "text-slate-500 hover:text-slate-900 bg-slate-100"
                    : "text-slate-400 hover:text-white bg-slate-800"
                }`}
              >
                {isListening ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
            {isListening && (
              <p className="text-[11px] text-emerald-500 font-medium animate-pulse flex items-center gap-1">
                <span>Listening for location... Speak now</span>
              </p>
            )}
          </div>

          {/* Quick Kolkata Suggestions */}
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Quick Suggestions:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {config.suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setAddress(sug)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all active:scale-95 cursor-pointer ${
                    address === sug
                      ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                      : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className={`px-6 py-4 border-t flex flex-col sm:flex-row gap-2.5 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl border text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveOnly}
            disabled={!address.trim()}
            className={`py-2.5 px-4 rounded-xl border text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            }`}
          >
            Save for Later
          </button>

          <button
            type="button"
            onClick={handleSaveAndRoute}
            disabled={!address.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Navigation className="w-4 h-4 stroke-[2.5]" />
            <span>Save & Navigate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
