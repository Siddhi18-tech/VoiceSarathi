CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  distance_km DOUBLE PRECISION NOT NULL CHECK (distance_km >= 0),
  max_speed DOUBLE PRECISION NOT NULL CHECK (max_speed >= 0),
  language_used TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trips_user_timestamp_idx
  ON trips (user_id, "timestamp" DESC);

-- Impact query for the README: trips per rider, total distance, and recorded peak speed.
SELECT
  p.full_name,
  COUNT(t.id) AS trips,
  ROUND(COALESCE(SUM(t.distance_km), 0)::numeric, 2) AS distance_km,
  COALESCE(MAX(t.max_speed), 0) AS peak_speed
FROM profiles AS p
LEFT JOIN trips AS t ON t.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY distance_km DESC;
