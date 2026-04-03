import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);

  const rows = await db.$queryRaw<
    Array<{ id: string; title: string; body: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT id, title, body, "createdAt"
    FROM "Post"
    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
      @@ plainto_tsquery('english', ${query})
    ORDER BY "createdAt" DESC
    LIMIT 30
  `);

  return NextResponse.json(rows);
}
