import { NextResponse } from "next/server";

const KOLKATA_QUICK_LANDMARKS: Record<string, string> = {
  // Common Saved Places
  "home": "Home",
  "take me home": "Home",
  "take me to home": "Home",
  "navigate to home": "Home",
  "navigate home": "Home",
  "go to home": "Home",
  "go home": "Home",
  "going home": "Home",
  "heading home": "Home",
  "ghar": "Home",
  "ghar chalo": "Home",
  "ghar le chalo": "Home",
  "ghar jao": "Home",
  "barite jabo": "Home",
  "bari jabo": "Home",
  "bari cholo": "Home",
  "barite cholo": "Home",
  "barite niye cholo": "Home",
  "বাড়ি": "Home",
  "বাড়ি চলো": "Home",
  "বাড়িতে যাব": "Home",
  "বাড়ি যাব": "Home",
  "বাড়ি নিয়ে চলো": "Home",
  "ঘর": "Home",
  "ঘর চলো": "Home",
  "घर": "Home",
  "घर चलो": "Home",
  "घर ले चलो": "Home",
  "घर जाओ": "Home",

  "work": "Work",
  "office": "Work",
  "take me to work": "Work",
  "take me to office": "Work",
  "take me work": "Work",
  "take me office": "Work",
  "go to work": "Work",
  "go to office": "Work",
  "office chalo": "Work",
  "office le chalo": "Work",
  "office jao": "Work",
  "doptor": "Work",
  "doptore jabo": "Work",
  "অফিস": "Work",
  "অফিস চলো": "Work",
  "অফিসে যাব": "Work",
  "দপ্তর": "Work",
  "काम": "Work",
  "काम पर चलो": "Work",
  "ऑफिस": "Work",
  "ऑफिस चलो": "Work",
  "दफ्तर": "Work",

  "college": "College",
  "campus": "College",
  "university": "College",
  "take me to college": "College",
  "take me to campus": "College",
  "take me to university": "College",
  "go to college": "College",
  "college chalo": "College",
  "college jao": "College",
  "কলেজ": "College",
  "কলেজ চলো": "College",
  "কলেজে যাব": "College",
  "कॉलेज": "College",
  "कॉलेज चलो": "College",
  "कैंपस": "College",

  // Iconic Kolkata Landmarks
  "south city": "South City Mall, Kolkata",
  "south city mall": "South City Mall, Kolkata",
  "साउथ सिटी": "South City Mall, Kolkata",
  "साउथ सिटी मॉल": "South City Mall, Kolkata",
  "সাউথ সিটি": "South City Mall, Kolkata",
  "সাউথ সিটি মল": "South City Mall, Kolkata",
  "howrah": "Howrah Railway Station, Kolkata",
  "howrah station": "Howrah Railway Station, Kolkata",
  "হাওড়া": "Howrah Railway Station, Kolkata",
  "হাওড়া স্টেশন": "Howrah Railway Station, Kolkata",
  "হাবড়া": "Howrah Railway Station, Kolkata",
  "हावड़ा": "Howrah Railway Station, Kolkata",
  "हावड़ा स्टेशन": "Howrah Railway Station, Kolkata",
  "sealdah": "Sealdah Railway Station, Kolkata",
  "sealdah station": "Sealdah Railway Station, Kolkata",
  "শিয়ালদহ": "Sealdah Railway Station, Kolkata",
  "सियालदह": "Sealdah Railway Station, Kolkata",
  "airport": "Netaji Subhash Chandra Bose Airport, Kolkata",
  "kolkata airport": "Netaji Subhash Chandra Bose Airport, Kolkata",
  "বিমানবন্দর": "Netaji Subhash Chandra Bose Airport, Kolkata",
  "एयरपोर्ट": "Netaji Subhash Chandra Bose Airport, Kolkata",
  "victoria": "Victoria Memorial, Kolkata",
  "victoria memorial": "Victoria Memorial, Kolkata",
  "ভিক্টোরিয়া": "Victoria Memorial, Kolkata",
  "ভিক্টোরিয়া মেমোরিয়াল": "Victoria Memorial, Kolkata",
  "विक्टोरिया": "Victoria Memorial, Kolkata",
  "विक्टोरिया मेमोरियल": "Victoria Memorial, Kolkata",
  "science city": "Science City, Kolkata",
  "সায়েন্স সিটি": "Science City, Kolkata",
  "साइंस सिटी": "Science City, Kolkata",
  "eco park": "Eco Park, Kolkata",
  "ইকো পার্ক": "Eco Park, Kolkata",
  "इको पार्क": "Eco Park, Kolkata",
  "kalighat": "Kalighat Kali Temple, Kolkata",
  "কালীঘাট": "Kalighat Kali Temple, Kolkata",
  "कालीघाट": "Kalighat Kali Temple, Kolkata",
  "dakshineswar": "Dakshineswar Kali Temple, Kolkata",
  "দক্ষিণেশ্বর": "Dakshineswar Kali Temple, Kolkata",
  "दक्षिणेश्वर": "Dakshineswar Kali Temple, Kolkata",
  "park street": "Park Street, Kolkata",
  "পার্ক স্ট্রিট": "Park Street, Kolkata",
  "पार्क स्ट्रीट": "Park Street, Kolkata",
  "quest mall": "Quest Mall, Kolkata",
  "কোয়েস্ট মল": "Quest Mall, Kolkata",
  "क्वेस्ट मॉल": "Quest Mall, Kolkata",
  "salt lake": "Salt Lake Sector V, Kolkata",
  "সল্টলেক": "Salt Lake Sector V, Kolkata",
  "साल्ट लेक": "Salt Lake Sector V, Kolkata",
  "ruby": "Ruby General Hospital, Kolkata",
  "রুবি": "Ruby General Hospital, Kolkata",
  "रुबी": "Ruby General Hospital, Kolkata",

  // Proximity & Nearest Facilities
  "nearest metro": "Nearest Metro Station",
  "nearest metro station": "Nearest Metro Station",
  "nearest metro station near my location": "Nearest Metro Station",
  "nearest metro station of my location": "Nearest Metro Station",
  "nearest metro of my location": "Nearest Metro Station",
  "metro near me": "Nearest Metro Station",
  "metro station near me": "Nearest Metro Station",
  "কাছের মেট্রো": "Nearest Metro Station",
  "কাছের মেট্রো স্টেশন": "Nearest Metro Station",
  "আমার কাছের মেট্রো": "Nearest Metro Station",
  "আমার কাছের মেট্রো স্টেশন": "Nearest Metro Station",
  "पास का मेट्रो": "Nearest Metro Station",
  "पास का मेट्रो स्टेशन": "Nearest Metro Station",
  "नजदीकी मेट्रो": "Nearest Metro Station",

  "nearest fine dine cafe": "Nearest Fine Dine Cafe",
  "nearest fine dine cafe near my location": "Nearest Fine Dine Cafe",
  "nearest fine dine cafe of my location": "Nearest Fine Dine Cafe",
  "fine dine cafe near my location": "Nearest Fine Dine Cafe",
  "fine dine cafe of my location": "Nearest Fine Dine Cafe",
  "nearest cafe": "Nearest Fine Dine Cafe",
  "nearest cafe near my location": "Nearest Fine Dine Cafe",
  "nearest cafe of my location": "Nearest Fine Dine Cafe",
  "cafe near me": "Nearest Fine Dine Cafe",
  "fine dine cafe near me": "Nearest Fine Dine Cafe",
  "fine dine cafe": "Nearest Fine Dine Cafe",
  "কাছের ক্যাফে": "Nearest Fine Dine Cafe",
  "কাছের ফাইন ডাইন ক্যাফে": "Nearest Fine Dine Cafe",
  "पास का कैफ़े": "Nearest Fine Dine Cafe",
  "नजदीकी कैफे": "Nearest Fine Dine Cafe",

  "nearest petrol pump": "Nearest Petrol Pump",
  "nearest petrol pump near my location": "Nearest Petrol Pump",
  "nearest fuel station": "Nearest Petrol Pump",
  "petrol pump near me": "Nearest Petrol Pump",
  "কাছের পেট্রোল পাম্প": "Nearest Petrol Pump",
  "पास का पेट्रोल पंप": "Nearest Petrol Pump",

  "nearest hospital": "Nearest Hospital",
  "nearest hospital near my location": "Nearest Hospital",
  "hospital near me": "Nearest Hospital",
  "কাছের হাসপাতাল": "Nearest Hospital",
  "पास का अस्पताल": "Nearest Hospital",
};

function quickMatchLandmark(text: string): string | null {
  const clean = text
    .trim()
    .toLowerCase()
    .replace(/[,\.\-\_]/g, " ")
    .replace(/\s+/g, " ");

  if (KOLKATA_QUICK_LANDMARKS[clean]) {
    return KOLKATA_QUICK_LANDMARKS[clean];
  }
  for (const [key, val] of Object.entries(KOLKATA_QUICK_LANDMARKS)) {
    if (clean.includes(key)) {
      return val;
    }
  }
  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const rawTranscript = (body as { transcript?: unknown } | null)?.transcript;
  if (typeof rawTranscript !== "string" || rawTranscript.trim().length === 0) {
    return NextResponse.json({ error: "transcript must be a non-empty string." }, { status: 400 });
  }

  const transcript = rawTranscript.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  let destination: string | null = null;
  let via: string | null = null;
  let isRerouteOnly = false;

  // 1. Check quick landmark match
  const quickMatch = quickMatchLandmark(transcript);
  if (quickMatch && !/via|ভায়া|वाया|হয়ে|होकर/i.test(transcript)) {
    return NextResponse.json({
      destination: quickMatch,
      via: null,
      isRerouteOnly: false,
    });
  }

  // 2. Use Gemini AI for intelligent natural language extraction & translation
  if (apiKey) {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    try {
      const prompt = `You are an expert motorcycle navigation agent in Kolkata, India.
Analyze the user's speech in English, Bengali, or Hindi.
Extract:
1. "destination": The final destination in Kolkata in clean English (e.g. "South City Mall, Kolkata", "Howrah Railway Station, Kolkata", "Eco Park, Kolkata").
   - If the user asks to go home (e.g. "take me home", "take me to home", "ghar chalo", "ghar le chalo", "barite jabo", "barite niye cholo", "বাড়ি চলো", "घर ले चलो"), set "destination" to "Home".
   - If the user asks to go to work or office (e.g. "take me to work", "take me to office", "office chalo", "office jao", "অফিস চলো", "काम पर चलो"), set "destination" to "Work".
   - If the user asks to go to college or campus (e.g. "take me to college", "college chalo", "college jao", "কলেজ চলো", "कॉलेज चलो"), set "destination" to "College".
   - If the user asks for a nearest/closest facility or category (e.g. "nearest metro station", "nearest fine dine cafe", "nearest petrol pump", "nearest hospital", "কাছের মেট্রো", "কাছের ক্যাফে", "पास का पेट्रोल पंप"), set "destination" to "Nearest Metro Station", "Nearest Fine Dine Cafe", "Nearest Petrol Pump", or "Nearest Hospital".
   - If the user ONLY asked to reroute via a waypoint without stating a new destination (e.g. "take via EM Bypass", "via Vidyasagar Setu", "মা ফ্লাইওভার দিয়ে চলো", "वाया हावड़ा ब्रिज चलो"), set "destination": null and "isRerouteOnly": true.
2. "via": Intermediate waypoint or bridge/road if requested (e.g. "Howrah Bridge, Kolkata", "Vidyasagar Setu, Kolkata", "EM Bypass, Kolkata", "Maa Flyover, Kolkata"). Otherwise null.
3. "isRerouteOnly": boolean (true if the speech only asks for a via/reroute).

Reply strictly with JSON matching:
{"destination": string | null, "via": string | null, "isRerouteOnly": boolean}

User speech: "${transcript}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 120,
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(8_000),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const jsonText = result?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join(" ")
          .trim();

        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          destination = parsed.destination || null;
          via = parsed.via || null;
          isRerouteOnly = Boolean(parsed.isRerouteOnly);
        }
      }
    } catch (e) {
      console.warn("[extract-destination] Gemini extraction error, falling back:", e);
    }
  }

  // 3. Fallback: If no destination was extracted, use the cleaned transcript as destination!
  if (!destination && !via) {
    if (quickMatch) {
      destination = quickMatch;
    } else {
      const cleaned = transcript
        .replace(/^(go to|navigate to|take me to|যাব|চলো|লে चलो|जाना है)\s*/i, "")
        .replace(/[\.\,\?\!]/g, "")
        .trim();
      destination = cleaned || transcript;
    }
  }

  return NextResponse.json({
    destination,
    via,
    isRerouteOnly,
  });
}
