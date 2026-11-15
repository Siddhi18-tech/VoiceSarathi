module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/route/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Request body must be valid JSON."
        }, {
            status: 400
        });
    }
    const input = body;
    if (!input || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLatitude"])(input.currentLat) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLongitude"])(input.currentLng) || typeof input.destination !== "string" || !input.destination.trim()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "currentLat, currentLng, and destination are required."
        }, {
            status: 400
        });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Routing is not configured."
        }, {
            status: 503
        });
    }
    try {
        const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
        geocodeUrl.searchParams.set("address", input.destination.trim());
        geocodeUrl.searchParams.set("key", apiKey);
        const geocodeResponse = await fetch(geocodeUrl, {
            signal: AbortSignal.timeout(15_000)
        });
        const geocode = await geocodeResponse.json();
        const destination = geocode.status === "OK" ? geocode.results?.[0]?.geometry?.location && {
            latitude: geocode.results[0].geometry.location.lat,
            longitude: geocode.results[0].geometry.location.lng
        } : undefined;
        if (!geocodeResponse.ok || !destination) {
            console.error("[route] Geocoding failed:", geocode.status, geocode.error_message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Destination could not be located."
            }, {
                status: 422
            });
        }
        const routesResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction.instructions,routes.legs.steps.distanceMeters"
            },
            body: JSON.stringify({
                origin: {
                    location: {
                        latLng: {
                            latitude: input.currentLat,
                            longitude: input.currentLng
                        }
                    }
                },
                destination: {
                    location: {
                        latLng: destination
                    }
                },
                travelMode: "TWO_WHEELER",
                languageCode: "en-IN",
                units: "METRIC"
            }),
            signal: AbortSignal.timeout(20_000)
        });
        const result = await routesResponse.json();
        const route = result?.routes?.[0];
        if (!routesResponse.ok || !route?.polyline?.encodedPolyline) {
            console.error("[route] Routes API failed:", routesResponse.status, result?.error?.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "A route could not be generated."
            }, {
                status: 502
            });
        }
        const steps = (route.legs || []).flatMap((leg)=>(leg.steps || []).map((step)=>({
                    instruction: step.navigationInstruction?.instructions || "Continue",
                    distance: step.distanceMeters || 0
                })));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            polyline: route.polyline.encodedPolyline,
            steps
        });
    } catch (error) {
        console.error("[route] Routing request error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Routing is temporarily unavailable."
        }, {
            status: 502
        });
    }
}
}),
"[project]/src/lib/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isFiniteCoordinate",
    ()=>isFiniteCoordinate,
    "isLatitude",
    ()=>isLatitude,
    "isLongitude",
    ()=>isLongitude
]);
function isFiniteCoordinate(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function isLatitude(value) {
    return isFiniteCoordinate(value) && value >= -90 && value <= 90;
}
function isLongitude(value) {
    return isFiniteCoordinate(value) && value >= -180 && value <= 180;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0awo_mh2wgyyx._.js.map