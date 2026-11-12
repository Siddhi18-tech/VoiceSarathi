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
} from "lucide-react";

export interface RiderSettings {
  language: "bn-IN" | "hi-IN" | "en-IN";
  speedLimit: number;
  emergencyContact: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RiderSettings;
  onSave: (s: RiderSettings) => void;
}

const LANGUAGES: { value: RiderSettings["language"]; label: string; flag: string }[] = [
  { value: "bn-IN", label: "বাংলা — Bengali (India)", flag: "🇮🇳" },
  { value: "hi-IN", label: "हिन्दी — Hindi (India)",  flag: "🇮🇳" },
  { value: "en-IN", label: "English (India)",          flag: "🇮🇳" },
];

const SPEED_PRESETS = [30, 40, 50, 60, 80];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const { data: session } = useSession();

  // Local draft — only commit to parent on "Save"
  const [draft, setDraft] = React.useState<RiderSettings>({ ...settings });

  // Keep draft in sync if parent settings change while modal is closed
  React.useEffect(() => {
    if (!isOpen) setDraft({ ...settings });
  }, [isOpen, settings]);

  const dialogRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

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
        className="w-full max-w-md bg-neutral-950 border-2 border-neutral-700 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-black text-white tracking-wide">Rider Settings</h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">Personalise your HUD</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Active Rider Session Badge */}
          {session?.user && (
            <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00ff88]/20 text-[#00ff88] flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {session.user.name || "Authenticated Rider"}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">{session.user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="py-1.5 px-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* ── Voice Language ──────────────────────────────────── */}
          <section>
            <label className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest mb-3">
              <Globe className="w-4 h-4 text-[#00f0ff]" />
              Voice Recognition Language
            </label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    draft.language === lang.value
                      ? "border-[#00f0ff] bg-[#00f0ff]/10 text-white"
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-600"
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
                    <div className="text-sm font-bold">{lang.label}</div>
                    <div className="text-[11px] font-mono text-neutral-500">{lang.value}</div>
                  </div>
                  {draft.language === lang.value && (
                    <div className="ml-auto w-3 h-3 rounded-full bg-[#00f0ff]" />
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* ── Speed Limit ─────────────────────────────────────── */}
          <section>
            <label
              htmlFor="speed-limit-input"
              className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest mb-3"
            >
              <Gauge className="w-4 h-4 text-[#ffee00]" />
              Speed Limit (km/h)
            </label>

            {/* Preset buttons */}
            <div className="flex gap-2 flex-wrap mb-3">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, speedLimit: preset }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-black font-mono border-2 transition-all cursor-pointer ${
                    draft.speedLimit === preset
                      ? "bg-[#ffee00] border-[#ffee00] text-black"
                      : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500"
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
                className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#ffee00] transition-colors"
                placeholder="Enter custom limit"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">
                km/h
              </span>
            </div>
          </section>

          {/* ── Emergency Contact ────────────────────────────────── */}
          <section>
            <label
              htmlFor="emergency-contact-input"
              className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest mb-3"
            >
              <Phone className="w-4 h-4 text-rose-400" />
              Emergency Contact Number
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-mono">
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
                className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-neutral-500">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <span>
                Used for auto-SOS crash alerts. Format: +91 followed by 10 digits.
              </span>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-neutral-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-neutral-900 border-2 border-neutral-700 text-neutral-300 font-bold text-sm uppercase tracking-wider hover:border-neutral-500 active:scale-95 transition-transform cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 flex-grow-[2] py-3 px-6 rounded-xl bg-[#00ff88] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:bg-[#00e57a] active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

