/// <reference types="google.maps" />
"use client";

import React, { useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Satellite, AlertCircle, Navigation, MapPin, Clock, CornerUpRight } from "lucide-react";

export interface RiderMapProps {
  /**
   * Encoded polyline string (e.g. from Google Directions API or backend route engine).
   * Decoded via google.maps.geometry.encoding.decodePath and drawn on the map.
   */
  routePolyline?: string;
  /**
   * Coordinates of the rider / origin.
   */
  originCoords?: { lat: number; lng: number };
  /**
   * Coordinates of intermediate waypoint (if rerouting via a specific bridge/road/flyover).
   */
  viaCoords?: { lat: number; lng: number };
  /**
   * Name of the intermediate waypoint (e.g. "Howrah Bridge").
   */
  viaName?: string;
  /**
   * Coordinates of the resolved destination.
   */
  destinationCoords?: { lat: number; lng: number };
  /**
   * Label of the destination (e.g. "Howrah Station").
   */
  destinationName?: string;
  /**
   * Human-formatted travel distance (e.g. "3.9 km").
   */
  distanceText?: string;
  /**
   * Human-formatted estimated travel duration (e.g. "17 mins").
   */
  durationText?: string;
  /**
   * Estimated arrival time string (e.g. "03:45 PM").
   */
  etaText?: string;
  /**
   * Day / Night Cockpit Theme mode.
   */
  theme?: "dark" | "light";
  /**
   * Google Maps JavaScript API key.
   * Defaults to NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or placeholder.
   */
  apiKey?: string;
  /**
   * Optional ISRO Bhuvan portal API key or token.
   * Defaults to NEXT_PUBLIC_BHUVAN_API_KEY if defined.
   */
  bhuvanApiKey?: string;
  /**
   * Center coordinates. Defaults to Kolkata (22.5726, 88.3639).
   */
  center?: { lat: number; lng: number };
  /**
   * Zoom level. Defaults to 14.
   */
  zoom?: number;
  /**
   * CSS height of the map. Defaults to "380px".
   */
  height?: string;
  /**
   * Optional child elements to overlay on top of the map (e.g. Speedometer HUD).
   */
  children?: React.ReactNode;
}

const DEFAULT_KOLKATA = { lat: 22.5726, lng: 88.3639 };
const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE";
const DEFAULT_BHUVAN_KEY =
  process.env.NEXT_PUBLIC_BHUVAN_API_KEY || "";

/**
 * Child controller component that accesses native google.maps.Map instance,
 * attaches ISRO Bhuvan WMS overlay, and draws origin, via waypoint, destination markers and route polyline.
 */
function BhuvanAndRouteController({
  routePolyline,
  originCoords,
  viaCoords,
  viaName,
  destinationCoords,
  destinationName,
  center,
  bhuvanApiKey,
}: {
  routePolyline?: string;
  originCoords?: { lat: number; lng: number };
  viaCoords?: { lat: number; lng: number };
  viaName?: string;
  destinationCoords?: { lat: number; lng: number };
  destinationName?: string;
  center: { lat: number; lng: number };
  bhuvanApiKey?: string;
}) {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const viaMarkerRef = useRef<google.maps.Marker | null>(null);
  const endMarkerRef = useRef<google.maps.Marker | null>(null);

  // -------------------------------------------------------------
  // 1. ISRO Bhuvan WMS Tile Layer Integration
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;

    try {
      const tokenQuery = bhuvanApiKey ? `&token=${encodeURIComponent(bhuvanApiKey)}` : "";

      const bhuvanWmsType = new google.maps.ImageMapType({
        getTileUrl: function (coord: google.maps.Point, zoom: number): string | null {
          const numTiles = 1 << zoom;
          const worldWidth = 20037508.34 * 2;
          const tileWidth = worldWidth / numTiles;

          const minX = -20037508.34 + coord.x * tileWidth;
          const maxX = -20037508.34 + (coord.x + 1) * tileWidth;
          const maxY = 20037508.34 - coord.y * tileWidth;
          const minY = 20037508.34 - (coord.y + 1) * tileWidth;

          return `https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/?service=WMS&request=GetMap&version=1.1.1&layers=india3&styles=&format=image/png&transparent=true&srs=EPSG:900913&width=256&height=256&bbox=${minX},${minY},${maxX},${maxY}${tokenQuery}`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: "ISRO Bhuvan",
        maxZoom: 19,
        minZoom: 1,
        opacity: 0.85,
      });

      map.overlayMapTypes.setAt(0, bhuvanWmsType);
      console.log("[RiderMap] ISRO Bhuvan WMS layer attached to Google Maps.");
    } catch (e) {
      console.warn("[RiderMap] Could not attach Bhuvan WMS layer:", e);
    }

    return () => {
      try {
        if (map && map.overlayMapTypes) {
          map.overlayMapTypes.removeAt(0);
        }
      } catch {}
    };
  }, [map, bhuvanApiKey]);

  // -------------------------------------------------------------
  // 2. Rider Origin Marker (Current Location)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;
    const currentPos = originCoords || center;

    if (!startMarkerRef.current && window.google?.maps?.Marker) {
      startMarkerRef.current = new google.maps.Marker({
        position: currentPos,
        map: map,
        title: "Current Location (You)",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#0f172a",
          strokeWeight: 2.5,
        },
      });
    } else if (startMarkerRef.current) {
      startMarkerRef.current.setPosition(currentPos);
    }

    if (!routePolyline) {
      map.panTo(currentPos);
    }
  }, [map, originCoords, center, routePolyline]);

  // -------------------------------------------------------------
  // 3. Via Waypoint Marker (If Rerouted via a Bridge/Road/Flyover)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;

    if (viaCoords) {
      if (!viaMarkerRef.current && window.google?.maps?.Marker) {
        viaMarkerRef.current = new google.maps.Marker({
          position: viaCoords,
          map: map,
          title: `Via Waypoint: ${viaName || "Reroute Point"}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#38bdf8",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });
      } else if (viaMarkerRef.current) {
        viaMarkerRef.current.setPosition(viaCoords);
        viaMarkerRef.current.setTitle(`Via Waypoint: ${viaName || "Reroute Point"}`);
        viaMarkerRef.current.setMap(map);
      }
    } else if (viaMarkerRef.current) {
      viaMarkerRef.current.setMap(null);
    }

    return () => {
      if (viaMarkerRef.current) {
        viaMarkerRef.current.setMap(null);
        viaMarkerRef.current = null;
      }
    };
  }, [map, viaCoords, viaName]);

  // -------------------------------------------------------------
  // 4. Destination Waypoint Marker
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;

    if (destinationCoords) {
      if (!endMarkerRef.current && window.google?.maps?.Marker) {
        endMarkerRef.current = new google.maps.Marker({
          position: destinationCoords,
          map: map,
          title: destinationName || "Target Destination",
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#FF3366",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });
      } else if (endMarkerRef.current) {
        endMarkerRef.current.setPosition(destinationCoords);
        endMarkerRef.current.setTitle(destinationName || "Target Destination");
        endMarkerRef.current.setMap(map);
      }
    } else if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
    }

    return () => {
      if (endMarkerRef.current) {
        endMarkerRef.current.setMap(null);
        endMarkerRef.current = null;
      }
    };
  }, [map, destinationCoords, destinationName]);

  // -------------------------------------------------------------
  // 5. Decode and Render Route Polyline & Auto-Fit Bounds
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!routePolyline) return;

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
          strokeColor: "#38bdf8",
          strokeOpacity: 0.95,
          strokeWeight: 6,
          map: map,
        });

        polylineRef.current = polyline;

        // Auto-fit map viewport to frame origin, via point, and destination
        const bounds = new google.maps.LatLngBounds();
        decodedPath.forEach((pt: any) => bounds.extend(pt));
        if (originCoords) bounds.extend(originCoords);
        if (viaCoords) bounds.extend(viaCoords);
        if (destinationCoords) bounds.extend(destinationCoords);

        map.fitBounds(bounds, { top: 75, right: 35, bottom: 85, left: 35 });
        console.log(`[RiderMap] Route polyline rendered (${decodedPath.length} points).`);
      }
    } catch (err) {
      console.error("[RiderMap] Failed to decode route polyline:", err);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, geometryLib, routePolyline, originCoords, viaCoords, destinationCoords]);

  return null;
}

export default function RiderMap({
  routePolyline,
  originCoords,
  viaCoords,
  viaName,
  destinationCoords,
  destinationName,
  distanceText,
  durationText,
  etaText,
  theme = "dark",
  apiKey = DEFAULT_API_KEY,
  bhuvanApiKey = DEFAULT_BHUVAN_KEY,
  center = DEFAULT_KOLKATA,
  zoom = 14,
  height = "380px",
  children,
}: RiderMapProps) {
  const isPlaceholderKey =
    !apiKey ||
    apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE" ||
    apiKey.trim().length === 0;

  const isLight = theme === "light";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border transition-colors shadow-xl ${
        isLight ? "border-slate-300 bg-slate-100" : "border-slate-800 bg-slate-950"
      }`}
      style={{ height }}
    >
      <APIProvider apiKey={apiKey} libraries={["geometry"]}>
        <Map
          id="rider-map"
          defaultCenter={originCoords || center}
          defaultZoom={zoom}
          disableDefaultUI={true}
          gestureHandling="greedy"
          colorScheme={isLight ? "LIGHT" : "DARK"}
          className="w-full h-full"
        >
          <BhuvanAndRouteController
            routePolyline={routePolyline}
            originCoords={originCoords}
            viaCoords={viaCoords}
            viaName={viaName}
            destinationCoords={destinationCoords}
            destinationName={destinationName}
            center={center}
            bhuvanApiKey={bhuvanApiKey}
          />
        </Map>
      </APIProvider>

      {/* Top Left: India-First ISRO Bhuvan & Location Pill */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div
          className={`flex items-center gap-1.5 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-mono font-semibold shadow-lg border ${
            isLight
              ? "bg-white/95 border-slate-200 text-emerald-600"
              : "bg-black/85 border-slate-700/80 text-emerald-400"
          }`}
        >
          <Satellite className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>ISRO Bhuvan WMS</span>
        </div>

        {isPlaceholderKey && (
          <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/80 rounded-full px-2.5 py-0.5 text-[10px] font-mono text-amber-200 shadow">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Maps Key: Placeholder in .env.local</span>
          </div>
        )}
      </div>

      {/* Top Right: Route Status Badge */}
      {routePolyline && (
        <div
          className={`absolute top-3 right-3 z-10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-mono font-semibold shadow-lg border pointer-events-none ${
            isLight
              ? "bg-white/95 border-sky-400/60 text-sky-700"
              : "bg-black/85 border-sky-500/40 text-sky-300"
          }`}
        >
          <span>{viaName ? "REROUTED" : "ACTIVE ROUTE"}</span>
        </div>
      )}

      {/* On-Map Route Telemetry Banner: Distance & Approx Time HUD */}
      {routePolyline && (distanceText || durationText) && (
        <div
          className={`absolute top-11 inset-x-3 z-10 backdrop-blur-md rounded-xl p-2.5 shadow-xl flex items-center justify-between pointer-events-none border ${
            isLight
              ? "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/40"
              : "bg-slate-900/95 border-slate-800 text-white"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 flex-shrink-0">
              {viaName ? <CornerUpRight className="w-4 h-4 text-sky-500" /> : <Navigation className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className={`text-[9px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                {viaName ? "Reroute Waypoint" : "To Waypoint"}
              </div>
              <div className={`text-xs font-bold truncate max-w-[130px] sm:max-w-[200px] ${isLight ? "text-slate-900" : "text-white"}`}>
                {destinationName || "Confirmed Location"}
              </div>
              {viaName && (
                <div className="text-[9px] font-mono text-sky-500 font-semibold truncate">
                  via {viaName}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {distanceText && (
              <div className="text-right">
                <div className={`text-[9px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Distance
                </div>
                <div className="text-xs font-bold text-emerald-500 font-mono">
                  {distanceText}
                </div>
              </div>
            )}

            {durationText && (
              <div className={`text-right border-l pl-2.5 ${isLight ? "border-slate-200" : "border-neutral-800"}`}>
                <div className={`text-[9px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Time
                </div>
                <div className="text-xs font-bold text-sky-500 font-mono">
                  {durationText}
                </div>
              </div>
            )}

            {etaText && (
              <div className={`text-right border-l pl-2.5 hidden sm:block ${isLight ? "border-slate-200" : "border-neutral-800"}`}>
                <div className={`text-[9px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  ETA
                </div>
                <div className="text-xs font-bold text-amber-500 font-mono">
                  {etaText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Children overlays (e.g. Speedometer floating HUD) */}
      {children && (
        <div className="absolute inset-x-3 bottom-3 z-20 pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}
