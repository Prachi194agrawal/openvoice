import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

const createPostSchema = z.object({
  title: z.string().min(4).max(180),
  body: z.string().min(10).max(4000),
});

export async function GET() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      reactions: { select: { value: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  try {
    const user = await getRequiredUser();
    const body = await req.json();
    const parsed = createPostSchema.parse(body);

    const post = await db.post.create({
      data: {
        title: parsed.title,
        body: parsed.body,
        authorId: user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
