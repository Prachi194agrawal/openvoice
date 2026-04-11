import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";
import { auth } from "@/auth";
import { isPreviewMode } from "@/lib/preview";
import { mockPosts, mockUser } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { searchPostIds } from "@/lib/search-posts";

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
    imageUrl?: string | null;
    tags?: string[];
    hashtags?: string[];
    createdAt: Date;
    author: { name: string | null };
    reactions: Array<{ value: "UPVOTE" | "DOWNVOTE"; userId: string }>;
    _count: { comments: number };
  }> = [];
  if (isPreviewMode) {
    const needle = q.toLowerCase();
    const tagToken = q.replace(/^#+/, "").toLowerCase();
    hydrated = mockPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.body.toLowerCase().includes(needle) ||
        p.hashtags.some((h) => h.includes(tagToken)) ||
        p.tags.some((t) => t.includes(tagToken))
    );
  } else if (q.length > 0) {
    const ids = await searchPostIds(q);
    hydrated =
      ids.length > 0
        ? await db.post.findMany({
            where: { id: { in: ids } },
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
