/// <reference types="google.maps" />
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin, Satellite, ShieldCheck, AlertCircle } from "lucide-react";

export interface RiderMapProps {
  /**
   * Encoded polyline string (e.g. from Google Directions API or backend route engine).
   * Decoded via google.maps.geometry.encoding.decodePath and drawn on the map.
   */
  routePolyline?: string;
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
 * attaches ISRO Bhuvan WMS overlay, and draws the decoded route polyline.
 */
function BhuvanAndRouteController({
  routePolyline,
  center,
  bhuvanApiKey,
}: {
  routePolyline?: string;
  center: { lat: number; lng: number };
  bhuvanApiKey?: string;
}) {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);

  // -------------------------------------------------------------
  // 1. ISRO Bhuvan WMS Tile Layer Integration
  // -------------------------------------------------------------
  useEffect(() => {
    if (!map) return;

    try {
      const tokenQuery = bhuvanApiKey ? `&token=${encodeURIComponent(bhuvanApiKey)}` : "";

      // Calculate Web Mercator (EPSG:900913 / EPSG:3857) BBOX for each tile
      const bhuvanWmsType = new google.maps.ImageMapType({
        getTileUrl: function (coord: google.maps.Point, zoom: number): string | null {
          const numTiles = 1 << zoom;
          const worldWidth = 20037508.34 * 2;
          const tileWidth = worldWidth / numTiles;

          const minX = -20037508.34 + coord.x * tileWidth;
          const maxX = -20037508.34 + (coord.x + 1) * tileWidth;
          const maxY = 20037508.34 - coord.y * tileWidth;
          const minY = 20037508.34 - (coord.y + 1) * tileWidth;

          // ISRO Bhuvan GWC WMS endpoint for India thematic basemap
          return `https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/?service=WMS&request=GetMap&version=1.1.1&layers=india3&styles=&format=image/png&transparent=true&srs=EPSG:900913&width=256&height=256&bbox=${minX},${minY},${maxX},${maxY}${tokenQuery}`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: "ISRO Bhuvan",
        maxZoom: 19,
        minZoom: 1,
        opacity: 0.85,
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
            strokeWeight: 2,
          },
        });
      }
    } catch (e) {
      console.warn("[RiderMap] Could not attach Bhuvan WMS layer:", e);
    }

    return () => {
      try {
        if (map && map.overlayMapTypes) {
          map.overlayMapTypes.removeAt(0);
        }
        if (startMarkerRef.current) {
          startMarkerRef.current.setMap(null);
          startMarkerRef.current = null;
        }
      } catch {}
    };
  }, [map, center]);

  // -------------------------------------------------------------
  // 2. Decode and Render Route Polyline
  // -------------------------------------------------------------
  useEffect(() => {
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
          strokeColor: "#00F0FF", // High-contrast cyan/blue
          strokeOpacity: 0.95,
          strokeWeight: 6, // Thick polyline for sunlight visibility
          map: map,
        });

        polylineRef.current = polyline;

        // Auto-fit map viewport to route bounds
        const bounds = new google.maps.LatLngBounds();
        decodedPath.forEach((pt: any) => bounds.extend(pt));
        map.fitBounds(bounds, { top: 60, right: 30, bottom: 60, left: 30 });

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
  }, [map, geometryLib, routePolyline]);

  return null;
}

export default function RiderMap({
  routePolyline,
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

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border-2 border-neutral-800 shadow-2xl bg-black"
      style={{ height }}
    >
      <APIProvider apiKey={apiKey} libraries={["geometry"]}>
        <Map
          id="rider-map"
          defaultCenter={center}
          defaultZoom={zoom}
          disableDefaultUI={true} // Clean mobile look: hide zoom, street view, etc.
          gestureHandling="greedy"
          colorScheme="DARK"
          className="w-full h-full"
        >
          <BhuvanAndRouteController
            routePolyline={routePolyline}
            center={center}
            bhuvanApiKey={bhuvanApiKey}
          />
        </Map>
      </APIProvider>

      {/* Top Left: India-First ISRO Bhuvan & Location Pill */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-neutral-700 rounded-full px-3 py-1 text-[11px] font-mono font-bold text-[#00FF88] shadow-lg">
          <Satellite className="w-3.5 h-3.5 text-[#00FF88] animate-pulse" />
          <span>ISRO Bhuvan WMS • Kolkata</span>
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
        <div className="absolute top-3 right-3 z-10 bg-black/85 backdrop-blur-md border border-[#00F0FF] rounded-full px-3 py-1 text-[11px] font-mono font-bold text-[#00F0FF] shadow-lg pointer-events-none">
          <span>ACTIVE ROUTE</span>
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
