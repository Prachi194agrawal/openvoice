import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getRequiredUser();
    const parsed = createCommentSchema.parse(await req.json());

    const comment = await db.comment.create({
      data: {
        body: parsed.body,
        postId: parsed.postId,
        parentId: parsed.parentId,
        authorId: user.id,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create comment." }, { status: 500 });
  }
}
