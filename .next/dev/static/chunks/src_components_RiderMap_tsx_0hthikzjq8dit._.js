(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/RiderMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RiderMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$chunks$2f$use$2d$map$2d$3d$2d$Bc_q95nK$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__APIProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@vis.gl/react-google-maps/dist/chunks/use-map-3d-Bc_q95nK.mjs [app-client] (ecmascript) <export t as APIProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$index$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@vis.gl/react-google-maps/dist/index.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$chunks$2f$use$2d$map$2d$3d$2d$Bc_q95nK$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__useMapsLibrary$3e$__ = __turbopack_context__.i("[project]/node_modules/@vis.gl/react-google-maps/dist/chunks/use-map-3d-Bc_q95nK.mjs [app-client] (ecmascript) <export p as useMapsLibrary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$satellite$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Satellite$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/satellite.mjs [app-client] (ecmascript) <export default as Satellite>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$exclamation$2d$point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-exclamation-point.mjs [app-client] (ecmascript) <export default as AlertCircle>");
;
var _s = __turbopack_context__.k.signature();
/// <reference types="google.maps" />
"use client";
;
;
;
const DEFAULT_KOLKATA = {
    lat: 22.5726,
    lng: 88.3639
};
const DEFAULT_API_KEY = ("TURBOPACK compile-time value", "YOUR_GOOGLE_MAPS_API_KEY_HERE") || "YOUR_GOOGLE_MAPS_API_KEY_HERE";
const DEFAULT_BHUVAN_KEY = ("TURBOPACK compile-time value", "YOUR_BHUVAN_API_KEY_HERE") || "";
/**
 * Child controller component that accesses native google.maps.Map instance,
 * attaches ISRO Bhuvan WMS overlay, and draws the decoded route polyline.
 */ function BhuvanAndRouteController({ routePolyline, center, bhuvanApiKey }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$index$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useMap"])();
    const geometryLib = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$chunks$2f$use$2d$map$2d$3d$2d$Bc_q95nK$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__useMapsLibrary$3e$__["useMapsLibrary"])("geometry");
    const polylineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startMarkerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // -------------------------------------------------------------
    // 1. ISRO Bhuvan WMS Tile Layer Integration
    // -------------------------------------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BhuvanAndRouteController.useEffect": ()=>{
            if (!map) return;
            try {
                const tokenQuery = bhuvanApiKey ? `&token=${encodeURIComponent(bhuvanApiKey)}` : "";
                // Calculate Web Mercator (EPSG:900913 / EPSG:3857) BBOX for each tile
                const bhuvanWmsType = new google.maps.ImageMapType({
                    getTileUrl: {
                        "BhuvanAndRouteController.useEffect": function(coord, zoom) {
                            const numTiles = 1 << zoom;
                            const worldWidth = 20037508.34 * 2;
                            const tileWidth = worldWidth / numTiles;
                            const minX = -20037508.34 + coord.x * tileWidth;
                            const maxX = -20037508.34 + (coord.x + 1) * tileWidth;
                            const maxY = 20037508.34 - coord.y * tileWidth;
                            const minY = 20037508.34 - (coord.y + 1) * tileWidth;
                            // ISRO Bhuvan GWC WMS endpoint for India thematic basemap
                            return `https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/?service=WMS&request=GetMap&version=1.1.1&layers=india3&styles=&format=image/png&transparent=true&srs=EPSG:900913&width=256&height=256&bbox=${minX},${minY},${maxX},${maxY}${tokenQuery}`;
                        }
                    }["BhuvanAndRouteController.useEffect"],
                    tileSize: new google.maps.Size(256, 256),
                    name: "ISRO Bhuvan",
                    maxZoom: 19,
                    minZoom: 1,
                    opacity: 0.85
                });
                // Overlay ISRO Bhuvan tiles on top of the base Google Map
                map.overlayMapTypes.setAt(0, bhuvanWmsType);
                console.log("[RiderMap] ISRO Bhuvan WMS layer attached to Google Maps.");
                // Position rider origin marker
                if (!startMarkerRef.current && window.google?.maps?.Marker) {
                    startMarkerRef.current = new google.maps.Marker({
                        position: center,
                        map: map,
                        title: "VoiceSarathi Rider Position",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#00FF88",
                            fillOpacity: 1,
                            strokeColor: "#000000",
                            strokeWeight: 2
                        }
                    });
                }
            } catch (e) {
                console.warn("[RiderMap] Could not attach Bhuvan WMS layer:", e);
            }
            return ({
                "BhuvanAndRouteController.useEffect": ()=>{
                    try {
                        if (map && map.overlayMapTypes) {
                            map.overlayMapTypes.removeAt(0);
                        }
                        if (startMarkerRef.current) {
                            startMarkerRef.current.setMap(null);
                            startMarkerRef.current = null;
                        }
                    } catch  {}
                }
            })["BhuvanAndRouteController.useEffect"];
        }
    }["BhuvanAndRouteController.useEffect"], [
        map,
        center
    ]);
    // -------------------------------------------------------------
    // 2. Decode and Render Route Polyline
    // -------------------------------------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BhuvanAndRouteController.useEffect": ()=>{
            if (!map) return;
            // Clean up previous polyline
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            if (!routePolyline) return;
            // Ensure geometry library is available
            const encoding = geometryLib?.encoding || window.google?.maps?.geometry?.encoding;
            if (!encoding) {
                console.warn("[RiderMap] Google Maps Geometry library not loaded yet.");
                return;
            }
            try {
                const decodedPath = encoding.decodePath(routePolyline);
                if (decodedPath && decodedPath.length > 0) {
                    const polyline = new google.maps.Polyline({
                        path: decodedPath,
                        geodesic: true,
                        strokeColor: "#00F0FF",
                        strokeOpacity: 0.95,
                        strokeWeight: 6,
                        map: map
                    });
                    polylineRef.current = polyline;
                    // Auto-fit map viewport to route bounds
                    const bounds = new google.maps.LatLngBounds();
                    decodedPath.forEach({
                        "BhuvanAndRouteController.useEffect": (pt)=>bounds.extend(pt)
                    }["BhuvanAndRouteController.useEffect"]);
                    map.fitBounds(bounds, {
                        top: 60,
                        right: 30,
                        bottom: 60,
                        left: 30
                    });
                    console.log(`[RiderMap] Route polyline rendered (${decodedPath.length} points).`);
                }
            } catch (err) {
                console.error("[RiderMap] Failed to decode route polyline:", err);
            }
            return ({
                "BhuvanAndRouteController.useEffect": ()=>{
                    if (polylineRef.current) {
                        polylineRef.current.setMap(null);
                        polylineRef.current = null;
                    }
                }
            })["BhuvanAndRouteController.useEffect"];
        }
    }["BhuvanAndRouteController.useEffect"], [
        map,
        geometryLib,
        routePolyline
    ]);
    return null;
}
_s(BhuvanAndRouteController, "pBy1w+aqcX4lZRwocYIHGj+O1I4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$index$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useMap"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$chunks$2f$use$2d$map$2d$3d$2d$Bc_q95nK$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__useMapsLibrary$3e$__["useMapsLibrary"]
    ];
});
_c = BhuvanAndRouteController;
function RiderMap({ routePolyline, apiKey = DEFAULT_API_KEY, bhuvanApiKey = DEFAULT_BHUVAN_KEY, center = DEFAULT_KOLKATA, zoom = 14, height = "380px", children }) {
    const isPlaceholderKey = !apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE" || apiKey.trim().length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full overflow-hidden rounded-2xl border-2 border-neutral-800 shadow-2xl bg-black",
        style: {
            height
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$chunks$2f$use$2d$map$2d$3d$2d$Bc_q95nK$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__APIProvider$3e$__["APIProvider"], {
                apiKey: apiKey,
                libraries: [
                    "geometry"
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vis$2e$gl$2f$react$2d$google$2d$maps$2f$dist$2f$index$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Map"], {
                    id: "rider-map",
                    defaultCenter: center,
                    defaultZoom: zoom,
                    disableDefaultUI: true,
                    gestureHandling: "greedy",
                    colorScheme: "DARK",
                    className: "w-full h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BhuvanAndRouteController, {
                        routePolyline: routePolyline,
                        center: center,
                        bhuvanApiKey: bhuvanApiKey
                    }, void 0, false, {
                        fileName: "[project]/src/components/RiderMap.tsx",
                        lineNumber: 227,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/RiderMap.tsx",
                    lineNumber: 218,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RiderMap.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-neutral-700 rounded-full px-3 py-1 text-[11px] font-mono font-bold text-[#00FF88] shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$satellite$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Satellite$3e$__["Satellite"], {
                                className: "w-3.5 h-3.5 text-[#00FF88] animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/src/components/RiderMap.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "ISRO Bhuvan WMS • Kolkata"
                            }, void 0, false, {
                                fileName: "[project]/src/components/RiderMap.tsx",
                                lineNumber: 239,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RiderMap.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    isPlaceholderKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/80 rounded-full px-2.5 py-0.5 text-[10px] font-mono text-amber-200 shadow",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$exclamation$2d$point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                className: "w-3 h-3 text-amber-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/RiderMap.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Maps Key: Placeholder in .env.local"
                            }, void 0, false, {
                                fileName: "[project]/src/components/RiderMap.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RiderMap.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RiderMap.tsx",
                lineNumber: 236,
                columnNumber: 7
            }, this),
            routePolyline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-3 right-3 z-10 bg-black/85 backdrop-blur-md border border-[#00F0FF] rounded-full px-3 py-1 text-[11px] font-mono font-bold text-[#00F0FF] shadow-lg pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "ACTIVE ROUTE"
                }, void 0, false, {
                    fileName: "[project]/src/components/RiderMap.tsx",
                    lineNumber: 253,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RiderMap.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this),
            children && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-x-3 bottom-3 z-20 pointer-events-auto",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/RiderMap.tsx",
                lineNumber: 259,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/RiderMap.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
_c1 = RiderMap;
var _c, _c1;
__turbopack_context__.k.register(_c, "BhuvanAndRouteController");
__turbopack_context__.k.register(_c1, "RiderMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RiderMap.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/RiderMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_RiderMap_tsx_0hthikzjq8dit._.js.map