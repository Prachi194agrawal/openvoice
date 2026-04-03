import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactionBar } from "@/components/reaction-bar";
import { ReportDialog } from "@/components/report-dialog";
import { reactionCounts, timeAgo } from "@/lib/format";

type PostData = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  author: { name: string | null };
  reactions: Array<{ value: "LIKE" | "DISLIKE"; userId?: string }>;
  _count?: { comments: number };
};

export function PostCard({ post, currentUserId }: { post: PostData; currentUserId?: string }) {
  const counts = reactionCounts(post.reactions);
  const selected = post.reactions.find((r) => r.userId === currentUserId)?.value ?? null;

  return (
    <Card className="mb-3 transition hover:ring-primary/40">
      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/posts/${post.id}`}
            className="text-foreground transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {post.author.name ?? "Anonymous"} · {timeAgo(post.createdAt)}
        </p>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <ReactionBar likes={counts.likes} dislikes={counts.dislikes} endpoint={`/api/posts/${post.id}/react`} selected={selected} />
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-4" /> {post._count?.comments ?? 0}
          </Link>
        </div>
        <ReportDialog postId={post.id} />
      </CardFooter>
    </Card>
  );
}
