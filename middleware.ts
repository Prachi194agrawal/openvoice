import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isPreviewMode } from "@/lib/preview";

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
  matcher: ["/((?!_next|api/auth|favicon.ico).*)"],
};
