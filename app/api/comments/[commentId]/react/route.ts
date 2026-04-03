import { NextResponse } from "next/server";
import { z } from "zod";
import { ReactionType } from "@prisma/client";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

const reactionSchema = z.object({
  value: z.nativeEnum(ReactionType),
});

export async function POST(req: Request, { params }: { params: { commentId: string } }) {
  try {
    const user = await getRequiredUser();
    const parsed = reactionSchema.parse(await req.json());

    const existing = await db.reaction.findUnique({
      where: { userId_commentId: { userId: user.id, commentId: params.commentId } },
    });

    if (existing?.value === parsed.value) {
      await db.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ toggledOff: true });
    }

    const reaction = await db.reaction.upsert({
      where: { userId_commentId: { userId: user.id, commentId: params.commentId } },
      update: { value: parsed.value },
      create: { value: parsed.value, userId: user.id, commentId: params.commentId },
    });

    return NextResponse.json(reaction);
  } catch {
    return NextResponse.json({ error: "Could not react to comment." }, { status: 500 });
  }
}
