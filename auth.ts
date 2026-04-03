import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  session: { strategy: "database" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !user.email.endsWith("@iiitm.ac.in")) {
        return false;
      }

      const existingUser = await db.user.findUnique({
        where: { email: user.email },
        select: { isBlocked: true },
      });

      if (existingUser?.isBlocked) {
        return false;
      }

      return true;
    },
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { role: true, isBlocked: true },
      });
      if (session.user) {
        session.user.id = user.id;
        session.user.role = dbUser?.role ?? "USER";
        session.user.isBlocked = dbUser?.isBlocked ?? false;
      }
      return session;
    },
  },
});
