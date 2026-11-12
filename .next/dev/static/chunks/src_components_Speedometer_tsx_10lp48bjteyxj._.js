(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/Speedometer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Speedometer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.mjs [app-client] (ecmascript) <export default as Gauge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$exclamation$2d$point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-exclamation-point.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/navigation.mjs [app-client] (ecmascript) <export default as Navigation>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const WARNING_COOLDOWN_MS = 60_000; // 60 seconds debounce
function Speedometer({ speedLimit = 40, onSpeedUpdate, className = "", overlayMode = false }) {
    _s();
    const [speedKmh, setSpeedKmh] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [maxSpeedSeen, setMaxSpeedSeen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [gpsStatus, setGpsStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("acquiring");
    const [isOverLimit, setIsOverLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSpeaking, setIsSpeaking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const watchIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastWarnedAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0); // React ref to avoid speech spamming within 60s
    const isMockedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ----------------------------------------------------------------
    // Speech Synthesis: Warning only once per 60 seconds
    // ----------------------------------------------------------------
    const triggerVoiceSpeedWarning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Speedometer.useCallback[triggerVoiceSpeedWarning]": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !("speechSynthesis" in window)) return;
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
                utterance.onstart = ({
                    "Speedometer.useCallback[triggerVoiceSpeedWarning]": ()=>setIsSpeaking(true)
                })["Speedometer.useCallback[triggerVoiceSpeedWarning]"];
                utterance.onend = ({
                    "Speedometer.useCallback[triggerVoiceSpeedWarning]": ()=>setIsSpeaking(false)
                })["Speedometer.useCallback[triggerVoiceSpeedWarning]"];
                utterance.onerror = ({
                    "Speedometer.useCallback[triggerVoiceSpeedWarning]": ()=>setIsSpeaking(false)
                })["Speedometer.useCallback[triggerVoiceSpeedWarning]"];
                window.speechSynthesis.speak(utterance);
                console.log("[Speedometer] TTS Warning triggered: Speed limit exceeded.");
            } catch (e) {
                console.warn("[Speedometer] TTS voice warning error:", e);
                setIsSpeaking(false);
            }
        }
    }["Speedometer.useCallback[triggerVoiceSpeedWarning]"], []);
    // ----------------------------------------------------------------
    // Convert m/s to km/h and apply speed updates
    // ----------------------------------------------------------------
    const handleSpeedUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Speedometer.useCallback[handleSpeedUpdate]": (speedMps)=>{
            // Convert coords.speed (m/s) to km/h: speed * 3.6
            const kmh = speedMps !== null && speedMps >= 0 ? Math.round(speedMps * 3.6) : 0;
            setSpeedKmh(kmh);
            setMaxSpeedSeen({
                "Speedometer.useCallback[handleSpeedUpdate]": (prev)=>Math.max(prev, kmh)
            }["Speedometer.useCallback[handleSpeedUpdate]"]);
            const exceeded = kmh > speedLimit;
            setIsOverLimit(exceeded);
            if (exceeded) {
                triggerVoiceSpeedWarning();
            }
            if (onSpeedUpdate) {
                onSpeedUpdate(kmh);
            }
        }
    }["Speedometer.useCallback[handleSpeedUpdate]"], [
        speedLimit,
        triggerVoiceSpeedWarning,
        onSpeedUpdate
    ]);
    // ----------------------------------------------------------------
    // Live GPS Tracking with navigator.geolocation.watchPosition
    // ----------------------------------------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Speedometer.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            if (!("geolocation" in navigator)) {
                setGpsStatus("unavailable");
                startMockTelemetry();
                return;
            }
            const watchId = navigator.geolocation.watchPosition({
                "Speedometer.useEffect.watchId": (position)=>{
                    setGpsStatus("active");
                    handleSpeedUpdate(position.coords.speed);
                }
            }["Speedometer.useEffect.watchId"], {
                "Speedometer.useEffect.watchId": (error)=>{
                    console.warn("[Speedometer] Geolocation warning:", error.message);
                    if (error.code === error.PERMISSION_DENIED) {
                        setGpsStatus("denied");
                    } else {
                        setGpsStatus("unavailable");
                    }
                    if (!isMockedRef.current) {
                        startMockTelemetry();
                    }
                }
            }["Speedometer.useEffect.watchId"], {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            });
            watchIdRef.current = watchId;
            return ({
                "Speedometer.useEffect": ()=>{
                    if (watchIdRef.current !== null && watchIdRef.current >= 0) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                    }
                    if (("TURBOPACK compile-time value", "object") !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                    }
                }
            })["Speedometer.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["Speedometer.useEffect"], []);
    // Update over-limit state when limit prop changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Speedometer.useEffect": ()=>{
            const exceeded = speedKmh > speedLimit;
            setIsOverLimit(exceeded);
            if (exceeded) {
                triggerVoiceSpeedWarning();
            }
        }
    }["Speedometer.useEffect"], [
        speedLimit,
        speedKmh,
        triggerVoiceSpeedWarning
    ]);
    // Dev simulation for desktop testing
    function startMockTelemetry() {
        isMockedRef.current = true;
        setGpsStatus("mock");
        let simulatedMps = 10; // ~36 km/h
        const timer = setInterval(()=>{
            const delta = (Math.random() - 0.45) * 1.8;
            simulatedMps = Math.max(0, Math.min(15.5, simulatedMps + delta));
            handleSpeedUpdate(simulatedMps);
        }, 2000);
        watchIdRef.current = -1;
        return timer;
    }
    // Dynamic sunlight-safe contrast colors
    const speedColor = isOverLimit ? "#FF2A55" // Alert Red
     : speedKmh / speedLimit > 0.8 ? "#FFEE00" // Caution Yellow
     : "#00FF88"; // High-visibility Neon Green
    // Compact Overlay Mode (Directly floating on the Map)
    if (overlayMode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-black/90 backdrop-blur-md border-2 rounded-2xl p-3 shadow-2xl transition-all duration-300 ${isOverLimit ? "border-[#FF2A55] shadow-[0_0_25px_rgba(255,42,85,0.6)]" : "border-neutral-700"} ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"], {
                                            className: "w-3 h-3 text-[#00F0FF]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Speedometer.tsx",
                                            lineNumber: 198,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "LIVE SPEED"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Speedometer.tsx",
                                            lineNumber: 199,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Speedometer.tsx",
                                    lineNumber: 197,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-baseline gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-4xl sm:text-5xl font-black font-mono tracking-tighter",
                                            style: {
                                                color: speedColor
                                            },
                                            children: speedKmh
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Speedometer.tsx",
                                            lineNumber: 202,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-mono font-bold text-neutral-400 uppercase",
                                            children: "km/h"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Speedometer.tsx",
                                            lineNumber: 208,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Speedometer.tsx",
                                    lineNumber: 201,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Speedometer.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-end gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[10px] font-mono text-neutral-400",
                                    children: [
                                        "LIMIT: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-bold text-white",
                                            children: speedLimit
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Speedometer.tsx",
                                            lineNumber: 214,
                                            columnNumber: 22
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Speedometer.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${gpsStatus === "active" ? "border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10" : "border-neutral-600 text-neutral-400 bg-neutral-900"}`,
                                    children: gpsStatus === "active" ? "GPS LIVE" : "GPS MOCK"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Speedometer.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this),
                                isSpeaking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-mono text-[#FFEE00] animate-pulse",
                                    children: "Slow Down!"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Speedometer.tsx",
                                    lineNumber: 226,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Speedometer.tsx",
                            lineNumber: 212,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Speedometer.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this),
                isOverLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-2 text-[10px] font-mono font-black uppercase text-center bg-[#FF2A55] text-black py-0.5 rounded",
                    children: "LIMIT EXCEEDED"
                }, void 0, false, {
                    fileName: "[project]/src/components/Speedometer.tsx",
                    lineNumber: 234,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Speedometer.tsx",
            lineNumber: 188,
            columnNumber: 7
        }, this);
    }
    // Full HUD Speedometer Card
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isOverLimit ? "border-[#FF2A55] shadow-[0_0_30px_rgba(255,42,85,0.6)]" : "border-neutral-800"} bg-black ${className}`,
        children: [
            isOverLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[#FF2A55]/10 pointer-events-none animate-pulse"
            }, void 0, false, {
                fileName: "[project]/src/components/Speedometer.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 text-xs font-mono uppercase text-neutral-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"], {
                                        className: "w-3.5 h-3.5 text-[#00F0FF]"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "GPS Speedometer"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 258,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${gpsStatus === "active" ? "border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10" : gpsStatus === "mock" ? "border-amber-500 text-amber-300 bg-amber-950/50" : "border-neutral-700 text-neutral-400"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `w-1.5 h-1.5 rounded-full ${gpsStatus === "active" ? "bg-[#00FF88] animate-ping" : "bg-amber-400"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 272,
                                        columnNumber: 13
                                    }, this),
                                    gpsStatus === "active" ? "GPS SATELLITE LOCK" : "GPS SIMULATED"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 263,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between pt-1 pb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-baseline gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-6xl sm:text-7xl font-black font-mono tracking-tighter leading-none",
                                        style: {
                                            color: speedColor
                                        },
                                        children: speedKmh
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono font-bold text-neutral-400 uppercase",
                                                children: "KM/H"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 291,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-mono text-neutral-500",
                                                children: "GROUND SPEED"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 292,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-end gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[9px] font-mono text-neutral-400 uppercase",
                                                children: "SPEED ZONE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 298,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-end gap-1 text-white font-mono font-black text-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"], {
                                                        className: "w-4 h-4 text-[#FFEE00]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: speedLimit
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-neutral-400 font-normal",
                                                        children: "km/h"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 302,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 299,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 297,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[11px] font-mono text-neutral-400",
                                        children: [
                                            "PEAK: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-[#00F0FF]",
                                                children: [
                                                    maxSpeedSeen,
                                                    " km/h"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 307,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 306,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 296,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this),
                    isOverLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FF2A55] text-black text-xs font-black uppercase tracking-wider animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$exclamation$2d$point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "w-4 h-4 stroke-[3]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 315,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Speed limit exceeded, please slow down"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 314,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Speedometer.tsx",
                lineNumber: 255,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Speedometer.tsx",
        lineNumber: 244,
        columnNumber: 5
    }, this);
}
_s(Speedometer, "RsSU1sfInSxQ4sq3smns0Zbp4YY=");
_c = Speedometer;
var _c;
__turbopack_context__.k.register(_c, "Speedometer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Speedometer.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/Speedometer.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_Speedometer_tsx_10lp48bjteyxj._.js.map