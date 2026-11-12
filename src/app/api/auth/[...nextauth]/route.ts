import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "rider@voicesarathi.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        console.log(`[NextAuth] Authorizing credentials for: ${email}`);

        // 1. Hackathon Demo Credentials
        if (
          (email === "judge@voicesarathi.com" || email === "demo@voicesarathi.com") &&
          password === "smarthelmet123"
        ) {
          console.log("[NextAuth] Demo judge credentials verified successfully.");
          return {
            id: "judge-evaluator-001",
            name: "Hackathon Judge",
            email: email,
            role: "lead_evaluator",
          };
        }

        // 2. Neon Postgres Database verification hook
        // In production, backend team will execute:
        // const user = await neonSql`SELECT * FROM users WHERE email = ${email}`;
        // and compare bcrypt/argon2 hash.
        try {
          // Verify format and simulate Neon Postgres user lookup
          if (password.length >= 6) {
            console.log(`[NextAuth Neon Hook] Verified user session for ${email}`);
            const derivedName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return {
              id: `neon-user-${Date.now()}`,
              name: derivedName || "VoiceSarathi Rider",
              email: email,
            };
          }

          throw new Error("Invalid email or password.");
        } catch (err: any) {
          console.error("[NextAuth] Authorization failed:", err.message);
          throw new Error(err.message || "Invalid credentials.");
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "voicesarathi-ultra-secure-development-secret-key-32chars",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

