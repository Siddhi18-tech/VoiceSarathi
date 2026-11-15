import { neon } from "@neondatabase/serverless";

/** Create the Neon client lazily so pages that do not need the database can load without DATABASE_URL. */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}
