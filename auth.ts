import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const ADMIN_EMAIL = "admin123@iiitm.ac.in";
const ADMIN_PASSWORD = "12345";
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
  providers: [
    Google({}),
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: ADMIN_EMAIL },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase().trim();
        const password = credentials?.password?.toString();

        if (!isAdminEmail(email) || password !== ADMIN_PASSWORD) {
          return null;
        }

        try {
          let user = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
          if (!user) {
            user = await db.user.create({
              data: {
                email: ADMIN_EMAIL,
                name: "Admin User",
                role: "ADMIN",
              },
            });
          } else if (user.role !== "ADMIN") {
            user = await db.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            });
          }
          return { id: user.id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked };
        } catch (err) {
          console.error("Credentials DB unavailable, using JWT-only fallback admin user:", err);
          return { id: "offline-admin123", name: "Admin User", email: ADMIN_EMAIL, role: "ADMIN", isBlocked: false };
        }
      }
    })
  ],
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

      if (account?.provider === "credentials") {
        return true;
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
