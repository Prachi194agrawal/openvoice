import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { parseHashtagsInput, parseTagsInput } from "@/lib/post-tags";

const createPostSchema = z
  .object({
    title: z.string().min(4).max(180),
    body: z.string().min(10).max(4000),
    imageUrl: z.string().max(2048).optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    hashtags: z.union([z.array(z.string()), z.string()]).optional(),
  })
  .superRefine((data, ctx) => {
    const u = data.imageUrl?.trim();
    if (u && !/^https?:\/\//i.test(u) && !u.startsWith("/")) {
      ctx.addIssue({ code: "custom", message: "Invalid image URL", path: ["imageUrl"] });
    }
  });

export async function GET() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      reactions: { select: { value: true, userId: true } },
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

    const tagsFromBody =
      typeof parsed.tags === "string" ? parseTagsInput(parsed.tags) : (parsed.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean);
    const hashtagsFromBody =
      typeof parsed.hashtags === "string"
        ? parseHashtagsInput(parsed.hashtags)
        : parseHashtagsInput((parsed.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "));

    const imageUrl = parsed.imageUrl?.trim() || undefined;

    const post = await db.post.create({
      data: {
        title: parsed.title,
        body: parsed.body,
        imageUrl,
        tags: tagsFromBody,
        hashtags: hashtagsFromBody,
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
