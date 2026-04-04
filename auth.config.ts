import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
