import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

function singleSearchToken(query: string): string | null {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length !== 1) return null;
  const token = words[0].replace(/^#+/, "").replace(/[^a-z0-9_-]/g, "");
  return token.length > 0 ? token : null;
}

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);

  const sw = singleSearchToken(query);

  const rows = await db.$queryRaw<
    Array<{
      id: string;
      title: string;
      body: string;
      createdAt: Date;
      imageUrl: string | null;
      tags: string[];
      hashtags: string[];
    }>
  >(Prisma.sql`
    SELECT id, title, body, "createdAt", "imageUrl", tags, hashtags
    FROM "Post"
    WHERE (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
        @@ plainto_tsquery('english', ${query})
    )
    OR (${sw} IS NOT NULL AND ${sw} = ANY("hashtags"))
    ORDER BY "createdAt" DESC
    LIMIT 30
  `);

  return NextResponse.json(rows);
}
