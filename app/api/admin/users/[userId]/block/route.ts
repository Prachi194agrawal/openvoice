import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

export async function PATCH(_: Request, { params }: { params: { userId: string } }) {
  try {
    const user = await getRequiredUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const blocked = await db.user.update({
      where: { id: params.userId },
      data: { isBlocked: true },
    });

    return NextResponse.json(blocked);
  } catch {
    return NextResponse.json({ error: "Failed to block user." }, { status: 500 });
  }
}
