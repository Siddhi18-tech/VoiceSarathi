import { NextResponse } from "next/server";
import { isLatitude, isLongitude } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = body as { lat?: unknown; lng?: unknown; type?: unknown } | null;
  if (!input || !isLatitude(input.lat) || !isLongitude(input.lng) ||
      (input.type !== "crash" && input.type !== "voice")) {
    return NextResponse.json({ success: false, error: "lat, lng, and a valid type are required." }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json({ success: false, error: "SOS dispatch is not configured." }, { status: 503 });
  }

  const title = input.type === "crash" ? "🚨 CRASH DETECTED" : "🚨 RIDER SOS REQUESTED";
  const location = `https://www.google.com/maps?q=${input.lat},${input.lng}`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `${title}. Live location: ${location}` }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      console.error("[sos] Telegram dispatch failed:", response.status, result.description);
      return NextResponse.json({ success: false, error: "SOS dispatch failed." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sos] Telegram request error:", error);
    return NextResponse.json({ success: false, error: "SOS dispatch failed." }, { status: 502 });
  }
}

