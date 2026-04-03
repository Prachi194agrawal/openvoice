import { NextResponse } from "next/server";
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
