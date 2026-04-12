import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { searchPostIds } from "@/lib/search-posts";

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);

  const ids = await searchPostIds(query);
  if (ids.length === 0) return NextResponse.json([]);

  const rows = await db.post.findMany({
    where: { id: { in: ids } },
    include: {
      author: { select: { name: true } },
      reactions: { select: { value: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(rows);
}
