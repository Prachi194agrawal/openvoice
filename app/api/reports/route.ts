import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

const reportSchema = z.object({
  reason: z.string().min(4).max(300),
  postId: z.string().optional(),
  commentId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getRequiredUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const reports = await db.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, title: true } },
        comment: { select: { id: true, body: true } },
      },
    });
    return NextResponse.json(reports);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getRequiredUser();
    const parsed = reportSchema.parse(await req.json());
    if (!parsed.postId && !parsed.commentId) {
      return NextResponse.json({ error: "Missing target content." }, { status: 400 });
    }

    const report = await db.report.create({
      data: {
        reason: parsed.reason,
        userId: user.id,
        postId: parsed.postId,
        commentId: parsed.commentId,
      },
    });
    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}
