import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { postId: string } }) {
  const post = await db.post.findUnique({
    where: { id: params.postId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reactions: { select: { value: true, userId: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          reactions: { select: { value: true, userId: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function DELETE(_: Request, { params }: { params: { postId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await db.post.findUnique({
    where: { id: params.postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const commentIds = (await db.comment.findMany({
    where: { postId: params.postId },
    select: { id: true },
  })).map((comment) => comment.id);

  await db.$transaction([
    db.reaction.deleteMany({ where: { postId: params.postId } }),
    db.reaction.deleteMany({ where: { commentId: { in: commentIds } } }),
    db.report.deleteMany({ where: { postId: params.postId } }),
    db.report.deleteMany({ where: { commentId: { in: commentIds } } }),
    db.comment.deleteMany({ where: { postId: params.postId } }),
    db.post.delete({ where: { id: params.postId } }),
  ]);

  return NextResponse.json({ message: "Post deleted" }, { status: 200 });
}
