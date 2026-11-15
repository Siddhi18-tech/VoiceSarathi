"use client";

import React, { useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  Globe,
  Gauge,
  Phone,
  Save,
  Info,
  LogOut,
  UserCheck,
  Home,
  Briefcase,
  GraduationCap,
  MapPin,
  Moon,
  Sun,
} from "lucide-react";

export interface SavedPlaces {
  home: string;
  work: string;
  college: string;
}

export interface RiderSettings {
  language: "bn-IN" | "hi-IN" | "en-IN";
  speedLimit: number;
  emergencyContact: string;
  theme?: "dark" | "light";
  savedPlaces?: SavedPlaces;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RiderSettings;
  onSave: (s: RiderSettings) => void;
  theme?: "dark" | "light";
}

const LANGUAGES: { value: RiderSettings["language"]; label: string; flag: string }[] = [
  { value: "bn-IN", label: "বাংলা — Bengali (India)", flag: "🇮🇳" },
  { value: "hi-IN", label: "हिन्दी — Hindi (India)", flag: "🇮🇳" },
  { value: "en-IN", label: "English (India)", flag: "🇮🇳" },
];

const SPEED_PRESETS = [30, 40, 50, 60, 80];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  theme,
}: SettingsModalProps) {
  const { data: session } = useSession();

  const activeTheme = theme || settings.theme || "dark";

  // Local draft — only commit to parent on "Save"
  const [draft, setDraft] = React.useState<RiderSettings>({
    ...settings,
    theme: activeTheme,
    savedPlaces: {
      home: settings.savedPlaces?.home || "",
      work: settings.savedPlaces?.work || "",
      college: settings.savedPlaces?.college || "",
    },
  });

  // Keep draft in sync if parent settings change while modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setDraft({
        ...settings,
        theme: theme || settings.theme || "dark",
        savedPlaces: {
          home: settings.savedPlaces?.home || "",
          work: settings.savedPlaces?.work || "",
          college: settings.savedPlaces?.college || "",
        },
      });
    }
  }, [isOpen, settings, theme]);

  const dialogRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isLight = draft.theme === "light";

  const handleSave = () => {
    // Validate emergency number: allow +91XXXXXXXXXX or 10 digits
    const rawNum = draft.emergencyContact.replace(/\s/g, "");
    if (rawNum && !/^(\+91)?\d{10}$/.test(rawNum)) {
      alert("Please enter a valid 10-digit Indian mobile number, e.g. +919876543210");
      return;
    }
    onSave({ ...draft, emergencyContact: rawNum });
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[8000] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Rider settings"
    >
      {/* Modal panel */}
      <div
        ref={dialogRef}
        className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border transition-colors ${isLight
          ? "bg-slate-50 border-slate-200 text-slate-900"
          : "bg-slate-950 border-slate-800 text-slate-100"
          }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isLight
            ? "bg-white border-slate-200"
            : "bg-slate-900/60 border-slate-800"
            }`}
        >
          <div>
            <h2 className={`text-base font-bold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
              Rider Settings & Preferences
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Day/Night Theme • Saved Places • Language
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border active:scale-90 transition-all cursor-pointer ${isLight
              ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Active Rider Session Badge */}
          {session?.user && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${isLight
                ? "bg-white border-slate-200"
                : "bg-slate-900/90 border-slate-800"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {session.user.name || "Authenticated Rider"}
                  </div>
                  <div className={`text-[11px] font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {session.user.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="py-1.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* ── Display Theme (Dark / Light) ────────────────────────── */}
          <section className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-900/70 border-slate-800"
            }`}>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-slate-300"
              }`}>
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
              <span>Cockpit HUD Theme (Day / Night Mode)</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, theme: "dark" }))}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${!isLight
                  ? "bg-slate-900 border-emerald-500 text-emerald-400 shadow-md"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Moon className="w-4 h-4 text-sky-400" />
                <span>🌙 Dark (Night Ride)</span>
              </button>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, theme: "light" }))}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${isLight
                  ? "bg-slate-100 border-emerald-600 text-emerald-700 shadow-md"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>☀️ Light (Day Sun)</span>
              </button>
            </div>
          </section>

          {/* ── Saved Quick Places (Home, Work, College) ───────────── */}
          <section className={`border rounded-2xl p-4 space-y-3.5 ${isLight ? "bg-white border-slate-200" : "bg-slate-900/70 border-slate-800"
            }`}>
            <div className={`flex items-center justify-between border-b pb-2.5 ${isLight ? "border-slate-100" : "border-slate-800"
              }`}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Saved Common Places (Voice Triggers)</span>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                Zero-Touch
              </span>
            </div>

            <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Saying <span className="text-emerald-500 font-semibold">&quot;Take me home&quot;</span>,{" "}
              <span className="text-sky-500 font-semibold">&quot;Take me to work&quot;</span>, or{" "}
              <span className="text-amber-500 font-semibold">&quot;Take me to college&quot;</span> in English, Bengali, or Hindi routes directly to these locations.
            </p>

            {/* Home */}
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                <Home className="w-3.5 h-3.5 text-emerald-500" />
                <span>Home Location (বাড়ি / घर)</span>
              </label>
              <input
                type="text"
                value={draft.savedPlaces?.home || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    savedPlaces: {
                      home: e.target.value,
                      work: d.savedPlaces?.work || "",
                      college: d.savedPlaces?.college || "",
                    },
                  }))
                }
                placeholder="e.g. Salt Lake Sector 1, Kolkata or Behala Chowrasta"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs placeholder-slate-400 focus:outline-none transition-colors ${isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                  }`}
              />
            </div>

            {/* Work */}
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                <span>Work / Office (অফিস / काम)</span>
              </label>
              <input
                type="text"
                value={draft.savedPlaces?.work || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    savedPlaces: {
                      home: d.savedPlaces?.home || "",
                      work: e.target.value,
                      college: d.savedPlaces?.college || "",
                    },
                  }))
                }
                placeholder="e.g. Salt Lake Sector V, Kolkata or BBD Bagh"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs placeholder-slate-400 focus:outline-none transition-colors ${isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-sky-500"
                  }`}
              />
            </div>

            {/* College */}
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                <span>College / Campus (কলেজ / कॉलेज)</span>
              </label>
              <input
                type="text"
                value={draft.savedPlaces?.college || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    savedPlaces: {
                      home: d.savedPlaces?.home || "",
                      work: d.savedPlaces?.work || "",
                      college: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. College Street, Kolkata or Jadavpur University"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs placeholder-slate-400 focus:outline-none transition-colors ${isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                  }`}
              />
            </div>
          </section>

          {/* ── Voice Language ──────────────────────────────────── */}
          <section>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2.5 ${isLight ? "text-slate-700" : "text-slate-300"
              }`}>
              <Globe className="w-4 h-4 text-sky-500" />
              <span>Voice Recognition Language</span>
            </label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${draft.language === lang.value
                    ? isLight
                      ? "border-sky-500 bg-sky-50 text-slate-900 font-semibold"
                      : "border-sky-500/80 bg-sky-950/40 text-white font-semibold"
                    : isLight
                      ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={draft.language === lang.value}
                    onChange={() => setDraft((d) => ({ ...d, language: lang.value }))}
                    className="sr-only"
                  />
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-bold">{lang.label}</div>
                    <div className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                      {lang.value}
                    </div>
                  </div>
                  {draft.language === lang.value && (
                    <div className="ml-auto w-2.5 h-2.5 rounded-full bg-sky-500" />
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* ── Speed Limit ─────────────────────────────────────── */}
          <section>
            <label
              htmlFor="speed-limit-input"
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2.5 ${isLight ? "text-slate-700" : "text-slate-300"
                }`}
            >
              <Gauge className="w-4 h-4 text-amber-500" />
              <span>Speed Limit (km/h)</span>
            </label>

            {/* Preset buttons */}
            <div className="flex gap-2 flex-wrap mb-2.5">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, speedLimit: preset }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${draft.speedLimit === preset
                    ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom number input */}
            <div className="relative">
              <input
                id="speed-limit-input"
                type="number"
                min={10}
                max={120}
                value={draft.speedLimit}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    speedLimit: Math.max(10, Math.min(120, Number(e.target.value))),
                  }))
                }
                className={`w-full border rounded-xl px-4 py-2.5 font-mono font-bold text-xs focus:outline-none transition-colors ${isLight
                  ? "bg-white border-slate-200 text-slate-900 focus:border-amber-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                  }`}
                placeholder="Enter custom limit"
              />
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono ${isLight ? "text-slate-400" : "text-slate-500"
                }`}>
                km/h
              </span>
            </div>
          </section>

          {/* ── Emergency Contact ────────────────────────────────── */}
          <section>
            <label
              htmlFor="emergency-contact-input"
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2.5 ${isLight ? "text-slate-700" : "text-slate-300"
                }`}
            >
              <Phone className="w-4 h-4 text-rose-500" />
              <span>Emergency Contact Number</span>
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                📞
              </span>
              <input
                id="emergency-contact-input"
                type="tel"
                value={draft.emergencyContact}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, emergencyContact: e.target.value }))
                }
                placeholder="+919876543210"
                className={`w-full border rounded-xl pl-9 pr-4 py-2.5 font-mono font-medium text-xs focus:outline-none transition-colors ${isLight
                  ? "bg-white border-slate-200 text-slate-900 focus:border-rose-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                  }`}
              />
            </div>

            <div className={`mt-2 flex items-start gap-1.5 text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px text-slate-400" />
              <span>
                Used for auto-SOS crash alerts. Format: +91 followed by 10 digits.
              </span>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div
          className={`px-6 py-4 border-t flex gap-3 ${isLight
            ? "bg-white border-slate-200"
            : "bg-slate-900/60 border-slate-800"
            }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl border font-semibold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer ${isLight
              ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 flex-grow-[2] py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
