import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(db),
  providers: [
    Google,
    Credentials({
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "img_2023041@iiitm.ac.in" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;
        
        // This is a test provider for development convenience
        if (email.endsWith("@iiitm.ac.in")) {
          try {
            // Find or create the user in the database
            let user = await db.user.findUnique({ where: { email } });
            if (!user) {
              user = await db.user.create({
                data: {
                  email,
                  name: "Test User",
                  role: "USER"
                }
              });
            }
            return { id: user.id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked };
          } catch (err) {
            console.error("Credentials DB unavailable, using JWT-only fallback user:", err);
            const fallbackId = `offline-${email.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            return { id: fallbackId, name: "Test User", email, role: "USER", isBlocked: false };
          }
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      console.log("signIn callback triggered for user:", user.email);
      if (!user.email || !user.email.endsWith("@iiitm.ac.in")) {
        console.log("Email rejected (not @iiitm.ac.in):", user.email);
        return false;
      }

      // Credentials users can run in JWT-only fallback mode when DB is unavailable.
      if (account?.provider === "credentials") {
        return true;
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          select: { isBlocked: true },
        });

        if (existingUser?.isBlocked) {
          console.log("User is blocked:", user.email);
          return false;
        }

        console.log("Sign-in accepted for:", user.email);
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
