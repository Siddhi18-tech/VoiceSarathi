# VoiceSarathi

VoiceSarathi is a transportation safety prototype for riders. It combines voice destination extraction, motorcycle routing, crash SOS dispatch, rider accounts, and trip-impact logging.

## Backend setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the credentials described in [BACKEND.md](BACKEND.md).
3. Create a Neon Postgres project and run [`db/schema.sql`](db/schema.sql) in its SQL Editor.
4. Enable the Google Geocoding API and Routes API for the server-side Maps key; create a Telegram bot and configure its chat destination.
5. Start the app with `npm run dev`.

The repository uses NextAuth Credentials backed by Neon profiles. It has no email-verification flow. Keep `DATABASE_URL`, `NEXTAUTH_SECRET`, and API tokens server-side. Never commit `.env.local` or send `DATABASE_URL` to browser code.

The specification named `gemini-1.5-flash`, which Google has shut down. The extraction endpoint defaults to `gemini-2.5-flash`; set `GEMINI_MODEL` to another currently supported model if needed. See [Gemini model deprecations](https://ai.google.dev/gemini-api/docs/deprecations).

## Shared API contract

### `POST /api/extract-destination`

Request:

```json
{ "transcript": "Salt lake sector 5 le cholo" }
```

Success response:

```json
{ "destination": "Salt Lake Sector 5" }
```

### `POST /api/route`

Request:

```json
{ "currentLat": 22.57, "currentLng": 88.36, "destination": "Salt Lake Sector 5" }
```

Success response:

```json
{
  "polyline": "...",
  "steps": [{ "instruction": "Turn left after petrol pump", "distance": 200 }]
}
```

`distance` is in meters. The endpoint geocodes the destination and requests a Google Routes `TWO_WHEELER` route. Google marks two-wheeler routes as beta; the app displays that caution with the directions.

### `POST /api/sos`

Request:

```json
{ "lat": 22.57, "lng": 88.36, "type": "crash" }
```

Use `"type": "voice"` for a rider-triggered SOS. Success response:

```json
{ "success": true }
```

Telegram only allows a bot to message a contact after the contact starts a conversation with it. Configure that destination's chat ID as `TELEGRAM_CHAT_ID`.

## Profiles and trip impact

`POST /api/register` creates a Neon profile with a bcrypt password hash and optional emergency contact. NextAuth issues a signed JWT session after credential verification. `POST /api/log-trip` accepts `{ "distance_km": 3.4, "max_speed": 42, "language_used": "bn-IN" }` and an optional ISO `timestamp`. The API takes `user_id` from the verified session, so clients cannot choose another user's owner ID.

Run this query in Neon to summarize impact for the GitHub README:

```sql
SELECT
  COUNT(t.id) AS trips,
  ROUND(COALESCE(SUM(t.distance_km), 0)::numeric, 2) AS total_distance_km,
  COALESCE(MAX(t.max_speed), 0) AS peak_speed,
  COUNT(DISTINCT t.user_id) AS riders
FROM trips AS t;
```

For per-rider totals, see the second query in [`db/schema.sql`](db/schema.sql). Trip insertion is restricted to authenticated users and uses the session's profile ID.

For local setup details and environment variables, see [BACKEND.md](BACKEND.md).
