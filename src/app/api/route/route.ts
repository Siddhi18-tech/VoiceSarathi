import { NextResponse } from "next/server";
import { isLatitude, isLongitude } from "@/lib/validation";

type Coordinate = { latitude: number; longitude: number };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = body as {
    currentLat?: unknown;
    currentLng?: unknown;
    destination?: unknown;
  } | null;

  if (!input || !isLatitude(input.currentLat) || !isLongitude(input.currentLng) ||
      typeof input.destination !== "string" || !input.destination.trim()) {
    return NextResponse.json({ error: "currentLat, currentLng, and destination are required." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Routing is not configured." }, { status: 503 });
  }

  try {
    const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    geocodeUrl.searchParams.set("address", input.destination.trim());
    geocodeUrl.searchParams.set("key", apiKey);
    const geocodeResponse = await fetch(geocodeUrl, { signal: AbortSignal.timeout(15_000) });
    const geocode = await geocodeResponse.json();
    const destination: Coordinate | undefined = geocode.status === "OK"
      ? geocode.results?.[0]?.geometry?.location && {
          latitude: geocode.results[0].geometry.location.lat,
          longitude: geocode.results[0].geometry.location.lng,
        }
      : undefined;

    if (!geocodeResponse.ok || !destination) {
      console.error("[route] Geocoding failed:", geocode.status, geocode.error_message);
      return NextResponse.json({ error: "Destination could not be located." }, { status: 422 });
    }

    const routesResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction.instructions,routes.legs.steps.distanceMeters",
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: input.currentLat, longitude: input.currentLng } } },
        destination: { location: { latLng: destination } },
        travelMode: "TWO_WHEELER",
        languageCode: "en-IN",
        units: "METRIC",
      }),
      signal: AbortSignal.timeout(20_000),
    });

    const result = await routesResponse.json();
    const route = result?.routes?.[0];
    if (!routesResponse.ok || !route?.polyline?.encodedPolyline) {
      console.error("[route] Routes API failed:", routesResponse.status, result?.error?.message);
      return NextResponse.json({ error: "A route could not be generated." }, { status: 502 });
    }

    const steps = (route.legs || []).flatMap((leg: { steps?: Array<{ navigationInstruction?: { instructions?: string }; distanceMeters?: number }> }) =>
      (leg.steps || []).map((step) => ({
        instruction: step.navigationInstruction?.instructions || "Continue",
        distance: step.distanceMeters || 0,
      }))
    );

    return NextResponse.json({ polyline: route.polyline.encodedPolyline, steps });
  } catch (error) {
    console.error("[route] Routing request error:", error);
    return NextResponse.json({ error: "Routing is temporarily unavailable." }, { status: 502 });
  }
}
