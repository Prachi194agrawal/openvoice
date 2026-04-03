import { NextResponse } from "next/server";
import { z } from "zod";
import { ReportStatus } from "@prisma/client";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";

const updateSchema = z.object({
  status: z.nativeEnum(ReportStatus),
});

export async function PATCH(req: Request, { params }: { params: { reportId: string } }) {
  try {
    const user = await getRequiredUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const parsed = updateSchema.parse(await req.json());
    const report = await db.report.findUnique({ where: { id: params.reportId } });
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx) => {
      const next = await tx.report.update({
        where: { id: params.reportId },
        data: { status: parsed.status },
      });

      if (parsed.status === "REJECTED") {
        if (report.postId) {
          await tx.post.delete({ where: { id: report.postId } });
        }
        if (report.commentId) {
          await tx.comment.delete({ where: { id: report.commentId } });
        }
      }

      return next;
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }
}
