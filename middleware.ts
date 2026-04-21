import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { isPreviewMode } from "@/lib/preview";

const ADMIN_EMAIL = "admin123@iiitm.ac.in";
const COLLEGE_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase().replace(/^@+/, "") || "iiitm.ac.in";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (isPreviewMode) return NextResponse.next();
  const { nextUrl } = req;
  const isAuthed = !!req.auth?.user;
  const email = req.auth?.user?.email?.toLowerCase().trim();
  const isAdminAuthed = email === ADMIN_EMAIL;
  const isCollegeAuthed = !!email && email.endsWith(`@${COLLEGE_EMAIL_DOMAIN}`);
  const isAllowedAuthed = isAdminAuthed || isCollegeAuthed;
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
