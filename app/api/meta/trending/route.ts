import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview";

export async function GET() {
  if (isPreviewMode) {
    return NextResponse.json(["placement-prep", "hackathon-season", "hostel-updates"]);
  }

  try {
    const rows = await db.$queryRaw<Array<{ tag: string }>>`
      SELECT h AS tag
      FROM "Post", unnest("hashtags") AS h
      GROUP BY h
      ORDER BY COUNT(*) DESC
      LIMIT 8
    `;
    return NextResponse.json(rows.map((row) => row.tag));
  } catch {
    return NextResponse.json([]);
  }
}
