import Link from "next/link";
import { Clock3, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactionBar } from "@/components/reaction-bar";
import { ReportDialog } from "@/components/report-dialog";
import { reactionCounts, timeAgo } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type PostData = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  tags?: string[];
  hashtags?: string[];
  createdAt: Date;
  author: { name: string | null };
  reactions: Array<{ value: "UPVOTE" | "DOWNVOTE" | string; userId?: string }>;
  _count?: { comments: number };
};

function highlightText(text: string, query?: string) {
  if (!query?.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-cyan-400/25 px-1 text-cyan-100">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export function PostCard({ post, currentUserId, highlightQuery }: { post: PostData; currentUserId?: string; highlightQuery?: string }) {
  const counts = reactionCounts(post.reactions);
  const rawSelected = post.reactions.find((r) => r.userId === currentUserId)?.value ?? null;
  const selected =
    rawSelected === "UPVOTE" || rawSelected === "DOWNVOTE"
      ? rawSelected
      : rawSelected === "LIKE"
        ? "UPVOTE"
        : rawSelected === "DISLIKE"
          ? "DOWNVOTE"
          : null;
  const name = post.author.name ?? "Anonymous";
  const initials = name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="glass-card mb-3 rounded-3xl border-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_18px_35px_rgba(2,6,23,0.65)]">
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-cyan-400/25">
            <AvatarFallback className="bg-slate-800 text-xs text-cyan-200">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" />
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <CardTitle className="text-xl leading-tight">
          <Link
            href={`/posts/${post.id}`}
            className="text-foreground transition-colors hover:text-primary"
          >
            {highlightText(post.title, highlightQuery)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {(post.tags?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags!.map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full border border-white/10 bg-white/5 text-xs font-normal text-muted-foreground">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
        {(post.hashtags?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags!.map((h) => (
              <Link
                key={h}
                href={`/search?q=${encodeURIComponent(`#${h}`)}`}
                className="text-xs font-medium text-cyan-300/90 hover:text-cyan-200 hover:underline"
              >
                #{h}
              </Link>
            ))}
          </div>
        ) : null}
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            className="max-h-80 w-full rounded-2xl border border-white/10 object-cover object-center"
          />
        ) : null}
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{highlightText(post.body, highlightQuery)}</p>
      </CardContent>
      <Separator className="mx-6 bg-white/10" />
      <CardFooter className="justify-between pt-4">
        <div className="flex items-center gap-2">
          <ReactionBar
            likes={counts.likes}
            dislikes={counts.dislikes}
            endpoint={`/api/posts/${post.id}/react`}
            selected={selected}
          />
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="size-4" /> {post._count?.comments ?? 0}
          </Link>
        </div>
        <ReportDialog postId={post.id} />
      </CardFooter>
    </Card>
  );
}
