import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview";
import { mockComments, mockPosts, mockUser } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPreviewMode) {
    return NextResponse.json({
      user,
      posts: mockPosts,
      comments: mockComments.map((comment) => ({
        ...comment,
        post: {
          id: comment.postId,
          title: mockPosts.find((post) => post.id === comment.postId)?.title ?? "Demo post",
        },
      })),
    });
  }

  const [posts, comments] = await Promise.all([
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

  return NextResponse.json({ user, posts, comments });
}
