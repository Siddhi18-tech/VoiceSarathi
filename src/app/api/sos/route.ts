import { NextResponse } from "next/server";

interface SOSPayload {
  timestamp: string;
  lat?: number;
  lng?: number;
  emergencyContact?: string;
  accelerationMagnitude?: number;
  riderStatus?: string;
}

export async function POST(request: Request) {
  try {
    const body: SOSPayload = await request.json().catch(() => ({}));

    const payload: SOSPayload = {
      timestamp: new Date().toISOString(),
      lat: body.lat,
      lng: body.lng,
      emergencyContact: body.emergencyContact ?? "Not provided",
      accelerationMagnitude: body.accelerationMagnitude,
      riderStatus: body.riderStatus ?? "UNKNOWN",
    };

    console.error("[SOS ALERT] 🚨 Emergency SOS triggered:", JSON.stringify(payload, null, 2));

    // In production: integrate Twilio / FCM / backend notification here.

    return NextResponse.json(
      {
        success: true,
        message: "SOS beacon dispatched to emergency contact.",
        alertId: `SOS-${Date.now()}`,
        timestamp: payload.timestamp,
        emergencyContact: payload.emergencyContact,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[SOS API] Error:", err);
    return NextResponse.json(
      { success: false, message: "SOS dispatch failed." },
      { status: 500 }
    );
  }
}

