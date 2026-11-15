import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "rider@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        // Instant demo rider accounts for hackathon judge evaluations and offline review
        if (
          (email === "judge@voicesarathi.com" ||
            email === "demo@voicesarathi.com" ||
            email === "rider@voicesarathi.com") &&
          password === "smarthelmet123"
        ) {
          return {
            id: "demo-judge-rider",
            name: "Smart Helmet Judge / Rider",
            email: email,
          };
        }

        try {
          const sql = getDb();
          const rows = await sql`
            SELECT id, full_name, email, password_hash
            FROM profiles
            WHERE email = ${email}
            LIMIT 1
          `;
          const profile = rows[0];
          if (!profile || !(await bcrypt.compare(password, profile.password_hash))) return null;

          return {
            id: String(profile.id),
            name: String(profile.full_name),
            email: String(profile.email),
          };
        } catch (error) {
          console.error("[NextAuth] Credentials lookup failed:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as typeof session.user & { id?: string }).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "voicesarathi-production-auth-secret-key-32chars-min",
};
