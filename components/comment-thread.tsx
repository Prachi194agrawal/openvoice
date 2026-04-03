import { reactionCounts, timeAgo } from "@/lib/format";
import { ReactionBar } from "@/components/reaction-bar";
import { ReportDialog } from "@/components/report-dialog";
import { CreateCommentForm } from "@/components/create-comment-form";

type CommentData = {
  id: string;
  body: string;
  createdAt: Date;
  parentId: string | null;
  postId: string;
  author: { name: string | null };
  reactions: Array<{ value: "LIKE" | "DISLIKE"; userId: string }>;
};

function Node({
  comment,
  all,
  currentUserId,
}: {
  comment: CommentData;
  all: CommentData[];
  currentUserId?: string;
}) {
  const children = all.filter((item) => item.parentId === comment.id);
  const counts = reactionCounts(comment.reactions);
  const selected = comment.reactions.find((r) => r.userId === currentUserId)?.value ?? null;

  return (
    <div className="mt-3 border-l pl-3">
      <p className="text-xs text-muted-foreground">
        {comment.author.name ?? "Student"} · {timeAgo(comment.createdAt)}
      </p>
      <p className="mt-1 text-sm">{comment.body}</p>
      <div className="mt-2 flex items-center gap-2">
        <ReactionBar
          likes={counts.likes}
          dislikes={counts.dislikes}
          endpoint={`/api/comments/${comment.id}/react`}
          selected={selected}
        />
        <ReportDialog commentId={comment.id} />
      </div>
      <div className="mt-2 max-w-xl">
        <CreateCommentForm postId={comment.postId} parentId={comment.id} />
      </div>
      {children.map((child) => (
        <Node key={child.id} comment={child} all={all} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export function CommentThread({ comments, currentUserId }: { comments: CommentData[]; currentUserId?: string }) {
  const roots = comments.filter((comment) => !comment.parentId);
  return (
    <div>
      {roots.map((root) => (
        <Node key={root.id} comment={root} all={comments} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
