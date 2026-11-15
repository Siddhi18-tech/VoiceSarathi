import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      emergencyContact?: unknown;
    };

    if (typeof body.name !== "string" || body.name.trim().length === 0 || body.name.trim().length > 120) {
      return NextResponse.json({ error: "Full Name is required (maximum 120 characters)." }, { status: 400 });
    }

    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (typeof body.password !== "string" || body.password.length < 6 || body.password.length > 128) {
      return NextResponse.json({ error: "Password must be 6 to 128 characters long." }, { status: 400 });
    }

    if (body.emergencyContact !== undefined && body.emergencyContact !== null &&
        (typeof body.emergencyContact !== "string" || body.emergencyContact.trim().length > 40)) {
      return NextResponse.json({ error: "Emergency contact must be 40 characters or fewer." }, { status: 400 });
    }

    const cleanEmail = body.email.trim().toLowerCase();
    const cleanName = body.name.trim();
    const emergencyContact = typeof body.emergencyContact === "string" && body.emergencyContact.trim()
      ? body.emergencyContact.trim()
      : null;
    const passwordHash = await bcrypt.hash(body.password, 12);
    const sql = getDb();

    const rows = await sql`
      INSERT INTO profiles (full_name, email, password_hash, emergency_contact)
      VALUES (${cleanName}, ${cleanEmail}, ${passwordHash}, ${emergencyContact})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, full_name, email
    `;
    if (!rows[0]) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Instant access granted.",
      user: { id: rows[0].id, name: rows[0].full_name, email: rows[0].email },
    }, { status: 201 });
  } catch (error) {
    console.error("[api/register] Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error && error.message === "DATABASE_URL is not configured."
        ? "Account registration is not configured."
        : "Failed to process registration. Please try again." },
      { status: 503 }
    );
  }
}

