import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isPreviewMode } from "@/lib/preview";
import { mockComments, mockPosts, mockUser } from "@/lib/mock-data";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);
  if (!user?.id) return null;

  const [posts, comments] = isPreviewMode
    ? [
        mockPosts,
        mockComments.map((c) => ({
          ...c,
          post: { id: c.postId, title: mockPosts.find((p) => p.id === c.postId)?.title ?? "Demo post" },
        })),
      ]
    : await Promise.all([
        db.post.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        db.comment.findMany({
          where: { authorId: user.id },
          include: { post: { select: { id: true, title: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);

  return (
    <PageShell>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {posts.map((p) => (
              <Link key={p.id} href={`/posts/${p.id}`} className="block text-sm hover:text-primary">
                {p.title}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comments.map((c) => (
              <Link key={c.id} href={`/posts/${c.postId}`} className="block text-sm text-muted-foreground hover:text-foreground">
                {c.body.slice(0, 100)} on {c.post.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
