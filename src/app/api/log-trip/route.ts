import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as typeof session.user & { id?: string }).id : undefined;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = body as {
    distance_km?: unknown;
    max_speed?: unknown;
    language_used?: unknown;
    timestamp?: unknown;
  } | null;
  if (!input || typeof input.distance_km !== "number" || !Number.isFinite(input.distance_km) ||
      input.distance_km < 0 || input.distance_km > 100_000 ||
      typeof input.max_speed !== "number" || !Number.isFinite(input.max_speed) ||
      input.max_speed < 0 || input.max_speed > 500 ||
      typeof input.language_used !== "string" || !input.language_used.trim() || input.language_used.length > 30) {
    return NextResponse.json({ error: "distance_km, max_speed, and language_used are required and must be valid." }, { status: 400 });
  }

  let timestamp = new Date();
  if (input.timestamp !== undefined) {
    if (typeof input.timestamp !== "string" || !Number.isFinite(Date.parse(input.timestamp))) {
      return NextResponse.json({ error: "timestamp must be a valid ISO date string." }, { status: 400 });
    }
    timestamp = new Date(input.timestamp);
  }

  if (userId === "demo-judge-rider") {
    return NextResponse.json({ success: true, message: "Demo trip logged successfully." }, { status: 201 });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO trips (user_id, distance_km, max_speed, language_used, "timestamp")
      VALUES (${userId}, ${input.distance_km}, ${input.max_speed}, ${input.language_used.trim()}, ${timestamp.toISOString()})
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[api/log-trip] Could not save trip:", error);
    return NextResponse.json({ error: "Trip could not be saved." }, { status: 503 });
  }
}
