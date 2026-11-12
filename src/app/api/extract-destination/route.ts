import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    console.log("[API /api/extract-destination] Received transcript:", transcript);

    // Simple heuristic parser for demo & testing with bn-IN or English transcripts
    let destination = "Mock Destination";

    if (transcript && typeof transcript === "string") {
      const lower = transcript.toLowerCase();
      if (lower.includes("howrah") || lower.includes("হাওড়া")) {
        destination = "Howrah Railway Station";
      } else if (lower.includes("airport") || lower.includes("বিমানবন্দর")) {
        destination = "Netaji Subhash Chandra Bose Airport (CCU)";
      } else if (lower.includes("salt lake") || lower.includes("সল্টলেক")) {
        destination = "Salt Lake Sector V, Kolkata";
      } else if (lower.includes("park street") || lower.includes("পার্ক স্ট্রিট")) {
        destination = "Park Street, Kolkata";
      } else if (lower.includes("victoria") || lower.includes("ভিক্টোরিয়া")) {
        destination = "Victoria Memorial, Kolkata";
      } else if (transcript.trim().length > 0) {
        destination = `Extracted: ${transcript.trim()}`;
      }
    }

    return NextResponse.json({
      destination: destination || "Mock Destination",
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API Error] Failed to parse request payload:", error);
    return NextResponse.json(
      { destination: "Mock Destination", error: "Failed to parse transcript" },
      { status: 400 }
    );
  }
}

