# VoiceSarathi backend setup

## Environment

Copy `.env.example` to `.env.local` and supply:

- `DATABASE_URL`: Neon pooled Postgres connection string.
- `NEXTAUTH_SECRET`: generate a random secret for NextAuth JWT signing.
- `NEXTAUTH_URL`: the app's canonical URL.
- `GEMINI_API_KEY`: server-side Gemini API key. `GEMINI_MODEL` defaults to `gemini-2.5-flash`; `gemini-1.5-flash` has been shut down and cannot serve requests.
- `GOOGLE_MAPS_API_KEY`: server-side key with Geocoding API and Routes API enabled. Keep this separate from the browser key and restrict it to the deployed server where possible.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`: bot token and destination chat ID for SOS messages. The destination must start a conversation with the bot first, or be a group where the bot is a member.

Keep server secrets out of `NEXT_PUBLIC_*` variables. The Google Maps JavaScript key remains a separate browser key.

## Neon schema and authentication

Create a Neon project in the Neon console, copy its pooled connection string into `DATABASE_URL`, then run [`db/schema.sql`](db/schema.sql) against that database. Registration stores profile records and bcrypt password hashes. NextAuth's Credentials provider checks those records directly; it does not send verification email, so there is no email-confirmation toggle for this configuration. The app's `profiles.emergency_contact` is available for rider contact details.

This repository does not provision cloud projects or change dashboard settings. The actual Neon project, API keys, and Telegram bot/chat need to be created and configured outside this codebase.

## API contract

- `POST /api/extract-destination` — `{ "transcript": "Salt lake sector 5 le cholo" }` returns `{ "destination": "..." }` from Gemini.
- `POST /api/route` — `{ "currentLat": 22.57, "currentLng": 88.36, "destination": "Salt Lake Sector 5" }` geocodes the destination, requests a `TWO_WHEELER` route, and returns `{ "polyline": "...", "steps": [{ "instruction": "...", "distance": 200 }] }`. Step distance is in meters.
- `POST /api/sos` — `{ "lat": 22.57, "lng": 88.36, "type": "crash" }` or `type: "voice"`; sends a Telegram message and returns `{ "success": true }` when Telegram accepts it.
- `POST /api/log-trip` — authenticated JSON `{ "distance_km": 3.4, "max_speed": 42, "language_used": "bn-IN" }`, with optional ISO `timestamp`. The API takes the owner from the NextAuth session, never from the submitted body.

Trip ownership is enforced in the API: unauthenticated requests are rejected and inserts use the signed-in user's database ID from the server-verified session. The `DATABASE_URL` must remain server-only. Do not expose the database credential to frontend clients.

The aggregation query in `db/schema.sql` produces per-rider trip count, total distance, and maximum recorded speed for impact reporting.
