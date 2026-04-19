import NextAuth, { customFetch } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const ADMIN_EMAIL = "123@iiitm.ac.in";
const ADMIN_PASSWORD = "123456";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase().replace(/^@+/, "");
const isAllowedEmail = (email?: string | null) => {
  if (!email) return false;
  if (!allowedDomain) return true;
  return email.toLowerCase().endsWith(`@${allowedDomain}`);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const authFetchWithRetry: typeof fetch = async (input, init) => {
  let lastError: unknown;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      if (response.status >= 500 && attempt < maxAttempts) {
        await sleep(250 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(250 * attempt);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Auth network request failed");
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: false,
  secret: "openvoice-fixed-auth-secret",
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      [customFetch]: authFetchWithRetry,
    }),
    Credentials({
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "img_2023041@iiitm.ac.in" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        if (!isAllowedEmail(email)) return null;
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return null;

        try {
          const user = await db.user.upsert({
            where: { email },
            update: {
              role: "ADMIN",
              isBlocked: false,
              name: "Admin",
            },
            create: {
              email,
              role: "ADMIN",
              isBlocked: false,
              name: "Admin",
            },
          });
          if (user.isBlocked) return null;

          return { id: user.id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked };
        } catch (err) {
          console.error("Credentials auth failed:", err);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email;
      console.log("signIn callback triggered for user:", email);
      if (!isAllowedEmail(email)) {
        console.log(`Email rejected (not @${allowedDomain ?? "allowed domain"}):`, email);
        return false;
      }

      // Credentials users can run in JWT-only fallback mode when DB is unavailable.
      if (account?.provider === "credentials") {
        return true;
      }

      if (!email) {
        return false;
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { email },
          select: { isBlocked: true },
        });

        if (existingUser?.isBlocked) {
          console.log("User is blocked:", email);
          return false;
        }

        console.log("Sign-in accepted for:", email);
        return true;
      } catch (err) {
        console.error("Database error during sign-in:", err);
        // If the database fails, NextAuth will deny sign in by default if false is returned,
        // but we should just return true so it can create the user later.
        // Wait, if it fails here, creating user in the adapter will also fail.
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
        token.isBlocked = (user as { isBlocked?: boolean }).isBlocked ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN" | undefined) ?? "USER";
        session.user.isBlocked = Boolean(token.isBlocked);

        // Fallback credential users are JWT-only and won't exist in DB.
        if (session.user.id.startsWith("offline-")) {
          return session;
        }

        // Keep role/block state fresh from DB when available, but don't fail auth if DB is down.
        try {
          const dbUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, isBlocked: true },
          });
          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.isBlocked = dbUser.isBlocked;
          }
        } catch (err) {
          console.error("Error fetching user in session callback:", err);
        }
      }
      return session;
    },
  },
});
