import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { isPreviewMode } from "@/lib/preview";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (isPreviewMode) return NextResponse.next();
  const { nextUrl } = req;
  const isAuthed = !!req.auth?.user;
  const isSigninPage = nextUrl.pathname === "/signin";

  if (!isAuthed && !isSigninPage) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  if (isAuthed && isSigninPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
