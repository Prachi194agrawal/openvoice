import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { isPreviewMode } from "@/lib/preview";

const ADMIN_EMAIL = "img_2023041@iiitm.ac.in";
const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase().replace(/^@+/, "") || "iiitm.ac.in";
const ALLOW_ANY_EMAIL_DOMAIN = ALLOWED_EMAIL_DOMAIN === "*";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (isPreviewMode) return NextResponse.next();
  const { nextUrl } = req;
  const isAuthed = !!req.auth?.user;
  const email = req.auth?.user?.email?.toLowerCase().trim();
  const isAdminAuthed = email === ADMIN_EMAIL;
  const isAllowedDomainAuthed = !!email && (ALLOW_ANY_EMAIL_DOMAIN || email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`));
  const isAllowedAuthed = isAdminAuthed || isAllowedDomainAuthed;
  const isSigninPage = nextUrl.pathname === "/signin";

  if (!isAuthed && !isSigninPage) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  if (isAuthed && !isAllowedAuthed && !isSigninPage) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  if (isAllowedAuthed && isSigninPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
