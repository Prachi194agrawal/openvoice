import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

/** Single-token hashtag-style match (alphanumeric + _-), no spaces. */
function singleSearchToken(query: string): string | null {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length !== 1) return null;
  const token = words[0].replace(/^#+/, "").replace(/[^a-z0-9_-]/g, "");
  return token.length > 0 ? token : null;
}

export async function searchPostIds(query: string): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];
  const sw = singleSearchToken(q);
  const likeQuery = `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;

  const rows = await db.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT id
      FROM "Post"
      WHERE (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
          @@ plainto_tsquery('english', ${q})
      )
      OR title ILIKE ${likeQuery}
      OR body ILIKE ${likeQuery}
      OR EXISTS (
        SELECT 1 FROM unnest("tags") AS t WHERE t ILIKE ${likeQuery}
      )
      OR EXISTS (
        SELECT 1 FROM unnest("hashtags") AS h WHERE h ILIKE ${likeQuery}
      )
      ${sw ? Prisma.sql`OR ${sw} = ANY("hashtags")` : Prisma.sql``}
      ORDER BY "createdAt" DESC
      LIMIT 30
    `
  );

  return rows.map((r) => r.id);
}
