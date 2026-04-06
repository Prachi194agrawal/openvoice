import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";
import { auth } from "@/auth";
import { isPreviewMode } from "@/lib/preview";
import { mockPosts, mockUser } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const session = await auth();
  let hydrated: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    author: { name: string | null };
    reactions: Array<{ value: "LIKE" | "DISLIKE"; userId: string }>;
    _count: { comments: number };
  }> = [];
  if (isPreviewMode) {
    hydrated = mockPosts.filter(
      (p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.body.toLowerCase().includes(q.toLowerCase())
    );
  } else if (q.length > 0) {
    const posts =
      await db.$queryRaw<Array<{ id: string }>>`SELECT id FROM "Post"
      WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))
      @@ plainto_tsquery('english', ${q})
      ORDER BY "createdAt" DESC
      LIMIT 30`;
    hydrated =
      posts.length > 0
        ? await db.post.findMany({
            where: { id: { in: posts.map((p) => p.id) } },
            include: {
              author: { select: { name: true } },
              reactions: { select: { value: true, userId: true } },
              _count: { select: { comments: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : [];
  }
  const matches = hydrated.length;

  return (
    <PageShell>
      <form className="glass-card mb-4 rounded-3xl p-4">
        <Input
          name="q"
          placeholder="Search posts..."
          defaultValue={q}
          className="rounded-xl border-white/15 bg-slate-900/60"
        />
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/5">
            {matches} results
          </Badge>
          {q ? <p className="text-xs text-muted-foreground">Keyword: {q}</p> : null}
        </div>
      </form>
      {hydrated.length === 0 ? (
        <p className="glass-card rounded-2xl p-4 text-sm text-muted-foreground">No posts found.</p>
      ) : (
        hydrated.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            highlightQuery={q}
            currentUserId={session?.user?.id ?? (isPreviewMode ? mockUser.id : undefined)}
          />
        ))
      )}
    </PageShell>
  );
}
