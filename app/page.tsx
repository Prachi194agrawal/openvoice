import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { isPreviewMode } from "@/lib/preview";
import { mockPosts, mockUser } from "@/lib/mock-data";

export default function Home() {
  return <FeedPage />;
}

async function FeedPage() {
  const session = await auth();
  const posts = isPreviewMode
    ? mockPosts
    : await db.post
        .findMany({
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, name: true } },
            reactions: { select: { value: true, userId: true } },
            _count: { select: { comments: true } },
          },
        })
        .catch((err) => {
          console.error("Failed to load posts, showing empty feed:", err);
          return [];
        });
  const currentUserId = session?.user?.id ?? (isPreviewMode ? mockUser.id : undefined);
  const currentUserRole = session?.user?.role ?? (isPreviewMode ? mockUser.role : "USER");

  return (
    <PageShell>
      <CreatePostForm />
      {posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">No posts yet.</div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        ))
      )}
      <div className="hidden">
        <Skeleton className="h-16 w-full animate-pulse" />
      </div>
    </PageShell>
  );
}
