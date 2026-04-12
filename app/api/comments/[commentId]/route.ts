import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

async function collectCommentTree(rootId: string) {
  const ids = [rootId];
  let queue = [rootId];

  while (queue.length > 0) {
    const children = await db.comment.findMany({
      where: { parentId: { in: queue } },
      select: { id: true },
    });

    queue = [];
    for (const child of children) {
      if (!ids.includes(child.id)) {
        ids.push(child.id);
        queue.push(child.id);
      }
    }
  }

  return ids;
}

export async function DELETE(_: Request, { params }: { params: { commentId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await db.comment.findUnique({
    where: { id: params.commentId },
    select: { authorId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const commentIds = await collectCommentTree(params.commentId);

  await db.$transaction([
    db.reaction.deleteMany({ where: { commentId: { in: commentIds } } }),
    db.report.deleteMany({ where: { commentId: { in: commentIds } } }),
    db.comment.deleteMany({ where: { id: { in: commentIds } } }),
  ]);

  return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
}
