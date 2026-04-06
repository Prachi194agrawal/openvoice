import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { CreateCommentForm } from "@/components/create-comment-form";
import { CommentThread } from "@/components/comment-thread";
import { PostCard } from "@/components/post-card";
import { isPreviewMode } from "@/lib/preview";
import { mockComments, mockPosts, mockUser } from "@/lib/mock-data";

export default async function PostDetailPage({ params }: { params: { postId: string } }) {
  const session = await auth();
  const post = isPreviewMode
    ? {
        ...mockPosts.find((p) => p.id === params.postId) ?? mockPosts[0],
        comments: mockComments,
      }
    : await db.post.findUnique({
        where: { id: params.postId },
        include: {
          author: { select: { name: true } },
          reactions: { select: { value: true, userId: true } },
          comments: {
            include: {
              author: { select: { name: true } },
              reactions: { select: { value: true, userId: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { comments: true } },
        },
      });

  if (!post) notFound();

  return (
    <PageShell>
      <PostCard post={post} currentUserId={session?.user?.id ?? (isPreviewMode ? mockUser.id : undefined)} />
      <div className="glass-card rounded-3xl p-4">
        <h2 className="mb-2 font-semibold">Comments</h2>
        <CreateCommentForm postId={post.id} />
        <CommentThread
          comments={post.comments}
          currentUserId={session?.user?.id ?? (isPreviewMode ? mockUser.id : undefined)}
        />
      </div>
    </PageShell>
  );
}
