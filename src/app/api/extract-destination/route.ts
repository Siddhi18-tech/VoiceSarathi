import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const transcript = (body as { transcript?: unknown } | null)?.transcript;
  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json({ error: "transcript must be a non-empty string." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Destination extraction is not configured." }, { status: 503 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract ONLY the final geographical destination from this user's speech. Ignore conversational filler words in any Indian language. Reply with JUST the destination name.\n\nUser speech: ${transcript}` }] }],
          generationConfig: { maxOutputTokens: 80 },
        }),
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!response.ok) {
      console.error("[extract-destination] Gemini request failed:", response.status, await response.text());
      return NextResponse.json({ error: "Could not extract a destination." }, { status: 502 });
    }

    const result = await response.json();
    const rawDestination = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join(" ");
    const destination = typeof rawDestination === "string"
      ? rawDestination.trim().replace(/^['"`]+|['"`]+$/g, "").replace(/^destination:\s*/i, "").trim()
      : "";

    if (!destination) {
      return NextResponse.json({ error: "No destination was found in the transcript." }, { status: 422 });
    }

    return NextResponse.json({ destination });
  } catch (error) {
    console.error("[extract-destination] Gemini request error:", error);
    return NextResponse.json({ error: "Destination extraction is temporarily unavailable." }, { status: 502 });
  }
}

