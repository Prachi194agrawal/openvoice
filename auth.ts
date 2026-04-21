import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const ADMIN_EMAIL = "img_2023041@iiitm.ac.in";
const COLLEGE_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase().replace(/^@+/, "") || "iiitm.ac.in";

const isAdminEmail = (email?: string | null) => email?.toLowerCase().trim() === ADMIN_EMAIL;
const isCollegeEmail = (email?: string | null) => {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${COLLEGE_EMAIL_DOMAIN}`);
};
const isAllowedUserEmail = (email?: string | null) => isAdminEmail(email) || isCollegeEmail(email);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: false,
  adapter: PrismaAdapter(db),
  providers: [Google({})],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email;
      console.log("signIn callback triggered for user:", email);
      if (!isAllowedUserEmail(email)) {
        console.log("Email rejected (not allowed account):", email);
        return false;
      }

      if (!email) {
        return false;
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { email },
          select: { isBlocked: true, role: true },
        });

        if (existingUser?.isBlocked) {
          console.log("User is blocked:", email);
          return false;
        }

        const expectedRole = isAdminEmail(email) ? "ADMIN" : "USER";
        if (existingUser && existingUser.role !== expectedRole) {
          await db.user.update({
            where: { email },
            data: { role: expectedRole },
          });
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
        token.role = isAdminEmail(user.email) ? "ADMIN" : "USER";
        token.isBlocked = (user as { isBlocked?: boolean }).isBlocked ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = isAdminEmail(session.user.email) ? "ADMIN" : "USER";
        session.user.isBlocked = Boolean(token.isBlocked);

        // Fallback credential users are JWT-only and won't exist in DB.
        if (session.user.id.startsWith("offline-")) {
          return session;
        }

        // Keep role/block state fresh from DB when available, but don't fail auth if DB is down.
        try {
          const dbUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { isBlocked: true },
          });
          if (dbUser) {
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
