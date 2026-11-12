(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/lucide-react/dist/esm/icons/gauge.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconData",
    ()=>__iconData,
    "default",
    ()=>Gauge
]);
/**
 * @license lucide-react v1.72.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconData = {
    name: "gauge",
    size: 24,
    node: [
        [
            "path",
            {
                d: "m12 14 4-4",
                key: "9kzdfg"
            }
        ],
        [
            "path",
            {
                d: "M3.34 19a10 10 0 1 1 17.32 0",
                key: "19p75a"
            }
        ]
    ]
};
__iconData.node;
const Gauge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__iconData);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/gauge.mjs [app-client] (ecmascript) <export default as Gauge>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Gauge",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.mjs [app-client] (ecmascript)");
}),
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
// Minimum ms between successive TTS speed-limit warnings (60 s)
const WARNING_COOLDOWN_MS = 60_000;
function Speedometer({ speedLimit = 40, onSpeedUpdate }) {
    _s();
    const [speedKmh, setSpeedKmh] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [maxSpeedSeen, setMaxSpeedSeen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [gpsStatus, setGpsStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("acquiring");
    const [isOverLimit, setIsOverLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSpeaking, setIsSpeaking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const watchIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastWarnedAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const isMockedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ----------------------------------------------------------------
    // TTS Speed Warning (fires at most once per 60 seconds)
    // ----------------------------------------------------------------
    const speakSpeedWarning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Speedometer.useCallback[speakSpeedWarning]": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            if (!("speechSynthesis" in window)) return;
            const now = Date.now();
            if (now - lastWarnedAtRef.current < WARNING_COOLDOWN_MS) return;
            lastWarnedAtRef.current = now;
            // Cancel any in-progress speech first
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("Speed limit exceeded, please slow down.");
            utterance.lang = "en-IN";
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;
            utterance.onstart = ({
                "Speedometer.useCallback[speakSpeedWarning]": ()=>setIsSpeaking(true)
            })["Speedometer.useCallback[speakSpeedWarning]"];
            utterance.onend = ({
                "Speedometer.useCallback[speakSpeedWarning]": ()=>setIsSpeaking(false)
            })["Speedometer.useCallback[speakSpeedWarning]"];
            utterance.onerror = ({
                "Speedometer.useCallback[speakSpeedWarning]": ()=>setIsSpeaking(false)
            })["Speedometer.useCallback[speakSpeedWarning]"];
            window.speechSynthesis.speak(utterance);
            console.log("[Speedometer] TTS warning: speed limit exceeded.");
        }
    }["Speedometer.useCallback[speakSpeedWarning]"], []);
    // ----------------------------------------------------------------
    // Update state whenever a new GPS speed arrives
    // ----------------------------------------------------------------
    const applySpeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Speedometer.useCallback[applySpeed]": (mps)=>{
            // GPS returns null speed when stationary or unavailable
            const kmh = mps != null && mps >= 0 ? Math.round(mps * 3.6) : 0;
            setSpeedKmh(kmh);
            setMaxSpeedSeen({
                "Speedometer.useCallback[applySpeed]": (prev)=>Math.max(prev, kmh)
            }["Speedometer.useCallback[applySpeed]"]);
            const over = kmh > speedLimit;
            setIsOverLimit(over);
            if (over) {
                speakSpeedWarning();
            }
            if (onSpeedUpdate) {
                onSpeedUpdate(kmh);
            }
        }
    }["Speedometer.useCallback[applySpeed]"], [
        speedLimit,
        speakSpeedWarning,
        onSpeedUpdate
    ]);
    // ----------------------------------------------------------------
    // Start navigator.geolocation.watchPosition
    // ----------------------------------------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Speedometer.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            if (!("geolocation" in navigator)) {
                setGpsStatus("unavailable");
                startMockGPS();
                return;
            }
            const watchId = navigator.geolocation.watchPosition({
                "Speedometer.useEffect.watchId": (position)=>{
                    setGpsStatus("active");
                    applySpeed(position.coords.speed);
                }
            }["Speedometer.useEffect.watchId"], {
                "Speedometer.useEffect.watchId": (error)=>{
                    console.warn("[Speedometer] Geolocation error:", error.code, error.message);
                    if (error.code === error.PERMISSION_DENIED) {
                        setGpsStatus("denied");
                    } else {
                        setGpsStatus("unavailable");
                    }
                    // Fall back to mock telemetry so the HUD stays useful during dev
                    if (!isMockedRef.current) {
                        startMockGPS();
                    }
                }
            }["Speedometer.useEffect.watchId"], {
                enableHighAccuracy: true,
                timeout: 10_000,
                maximumAge: 1_000
            });
            watchIdRef.current = watchId;
            return ({
                "Speedometer.useEffect": ()=>{
                    if (watchIdRef.current !== null) {
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
    // Update speed checks when speedLimit prop changes (e.g., dynamic zones)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Speedometer.useEffect": ()=>{
            setIsOverLimit(speedKmh > speedLimit);
        }
    }["Speedometer.useEffect"], [
        speedLimit,
        speedKmh
    ]);
    // ----------------------------------------------------------------
    // Mock GPS telemetry for dev / desktop environments
    // ----------------------------------------------------------------
    function startMockGPS() {
        isMockedRef.current = true;
        setGpsStatus("mock");
        let mockMps = 10; // start at ~36 km/h
        const interval = setInterval(()=>{
            const delta = (Math.random() - 0.4) * 1.5; // slight upward bias
            mockMps = Math.max(0, Math.min(16, mockMps + delta)); // 0–57.6 km/h
            applySpeed(mockMps);
        }, 1800);
        // Store cleanup in watchIdRef using negative sentinel
        watchIdRef.current = -1;
        return interval;
    }
    // ----------------------------------------------------------------
    // Colour logic: green → yellow → red based on speed vs limit
    // ----------------------------------------------------------------
    const getSpeedColour = ()=>{
        const pct = speedKmh / speedLimit;
        if (pct < 0.75) return "#00ff88"; // safe — neon green
        if (pct < 1.0) return "#ffee00"; // approaching — neon yellow
        return "#ff2a55"; // exceeded — alert crimson
    };
    const speedColour = getSpeedColour();
    // Arc calculation for the circular gauge (200° sweep)
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const maxDisplaySpeed = Math.max(speedLimit * 1.5, 80); // scale ceiling
    const arcFraction = Math.min(speedKmh / maxDisplaySpeed, 1);
    const dashOffset = circumference * (1 - arcFraction * (200 / 360));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isOverLimit ? "border-[#ff2a55] shadow-[0_0_28px_rgba(255,42,85,0.6)]" : "border-neutral-800"} bg-black`,
        children: [
            isOverLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[#ff2a55]/5 pointer-events-none animate-pulse"
            }, void 0, false, {
                fileName: "[project]/src/components/Speedometer.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 text-xs font-mono uppercase text-neutral-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Live Speed"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${gpsStatus === "active" ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10" : gpsStatus === "denied" ? "border-rose-600 text-rose-400 bg-rose-950/60" : gpsStatus === "mock" ? "border-amber-600 text-amber-400 bg-amber-950/60" : "border-neutral-600 text-neutral-400"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `w-1.5 h-1.5 rounded-full ${gpsStatus === "active" ? "bg-[#00ff88] animate-ping" : gpsStatus === "mock" ? "bg-amber-400" : "bg-neutral-500"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this),
                                    gpsStatus === "active" && "GPS LIVE",
                                    gpsStatus === "acquiring" && "ACQUIRING...",
                                    gpsStatus === "denied" && "GPS DENIED",
                                    gpsStatus === "unavailable" && "GPS N/A",
                                    gpsStatus === "mock" && "MOCK GPS"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative flex items-center justify-center w-36 h-36",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        viewBox: "0 0 120 120",
                                        className: "w-full h-full -rotate-[100deg]",
                                        "aria-hidden": "true",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "60",
                                                cy: "60",
                                                r: radius,
                                                fill: "none",
                                                stroke: "#1a1a1a",
                                                strokeWidth: "10",
                                                strokeDasharray: `${circumference * 0.556} ${circumference * 0.444}`,
                                                strokeLinecap: "round"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 244,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "60",
                                                cy: "60",
                                                r: radius,
                                                fill: "none",
                                                stroke: speedColour,
                                                strokeWidth: "10",
                                                strokeLinecap: "round",
                                                strokeDasharray: `${circumference * 0.556 * arcFraction} ${circumference * (1 - 0.556 * arcFraction)}`,
                                                style: {
                                                    transition: "stroke-dasharray 0.4s ease, stroke 0.3s ease"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 255,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 238,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 flex flex-col items-center justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-4xl font-black font-mono leading-none tracking-tighter transition-colors duration-300",
                                                style: {
                                                    color: speedColour
                                                },
                                                children: speedKmh
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 270,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-mono text-neutral-500 mt-0.5 uppercase",
                                                children: "km/h"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 276,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 269,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 237,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-mono text-neutral-500 uppercase tracking-widest",
                                                children: "Limit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"], {
                                                        className: "w-3.5 h-3.5 text-neutral-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 290,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-lg font-black font-mono text-white",
                                                        children: speedLimit
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 291,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-neutral-500 font-mono",
                                                        children: "km/h"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 289,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 285,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-mono text-neutral-500 uppercase tracking-widest",
                                                children: "Max"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 300,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-lg font-black font-mono text-[#00f0ff]",
                                                children: [
                                                    maxSpeedSeen,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-neutral-500 font-mono ml-0.5",
                                                        children: "km/h"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Speedometer.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 303,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 299,
                                        columnNumber: 13
                                    }, this),
                                    isSpeaking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 text-[10px] font-mono text-amber-400",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "animate-ping w-1.5 h-1.5 rounded-full bg-amber-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Speedometer.tsx",
                                                lineNumber: 314,
                                                columnNumber: 17
                                            }, this),
                                            "Speaking..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Speedometer.tsx",
                                        lineNumber: 313,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this),
                    isOverLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#ff2a55]/15 border border-[#ff2a55]/60 text-[#ff2a55] text-xs font-black uppercase tracking-widest animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$exclamation$2d$point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Speed Limit Exceeded — Slow Down!"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Speedometer.tsx",
                                lineNumber: 325,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Speedometer.tsx",
                        lineNumber: 323,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Speedometer.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Speedometer.tsx",
        lineNumber: 186,
        columnNumber: 5
    }, this);
}
_s(Speedometer, "h8H3E5u5f1J8GvsoB6vnlstDl3Y=");
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

//# sourceMappingURL=_17rvgxdeky_ab._.js.map