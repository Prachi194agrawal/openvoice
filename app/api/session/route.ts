import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isPreviewMode } from "@/lib/preview";
import { mockUser } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);

  return NextResponse.json({ user: user ?? null, preview: isPreviewMode });
}
