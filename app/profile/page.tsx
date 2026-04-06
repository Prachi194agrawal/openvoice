import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const initials = (user.name ?? "Student")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell>
      <Card className="glass-card mb-4 rounded-3xl border-white/15">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16 ring-2 ring-cyan-400/30">
            <AvatarFallback className="bg-slate-800 text-lg text-cyan-200">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
      </Card>
      <Tabs defaultValue="posts">
        <TabsList className="mb-3 rounded-2xl border border-white/10 bg-slate-900/70">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <Card className="glass-card rounded-3xl border-white/15">
            <CardHeader>
              <CardTitle>Your Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {posts.map((p) => (
                <Link key={p.id} href={`/posts/${p.id}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm hover:text-primary">
                  {p.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comments">
          <Card className="glass-card rounded-3xl border-white/15">
            <CardHeader>
              <CardTitle>Your Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {comments.map((c) => (
                <Link
                  key={c.id}
                  href={`/posts/${c.postId}`}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  {c.body.slice(0, 100)} on {c.post.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
