"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Reply, Trash2 } from "lucide-react";
import { ReactionBar } from "@/components/reaction-bar";
import { ReportDialog } from "@/components/report-dialog";
import { CreateCommentForm } from "@/components/create-comment-form";
import { reactionCounts, timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommentData = {
  id: string;
  body: string;
  createdAt: Date;
  parentId: string | null;
  postId: string;
  author: { id?: string; name: string | null };
  reactions: Array<{ value: "UPVOTE" | "DOWNVOTE"; userId: string }>;
};

function Node({ comment, tree, currentUserId, currentUserRole = "USER", depth = 0 }: { comment: CommentData; tree: CommentData[]; currentUserId?: string; currentUserRole?: string; depth?: number }) {
  const router = useRouter();
  const children = useMemo(() => tree.filter((item) => item.parentId === comment.id), [tree, comment.id]);
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const counts = reactionCounts(comment.reactions);
  const selected = comment.reactions.find((r) => r.userId === currentUserId)?.value ?? null;
  const canDelete = Boolean(
    currentUserId &&
      (currentUserRole === "ADMIN" || currentUserId === comment.author.id)
  );

  const deleteComment = async () => {
    if (!window.confirm("Permanently delete this comment and all of its replies?")) {
      return;
    }

    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return window.alert(data.error || "Failed to delete comment.");
    }
    router.refresh();
  };

  return (
    <div className={cn("mt-3 border-l border-white/10 pl-3", depth > 0 && "ml-3")}>
      <div className={cn("rounded-2xl border border-transparent p-3 transition", replying && "border-cyan-400/30 bg-cyan-500/5")}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {comment.author.name ?? "Student"} · {timeAgo(comment.createdAt)}
          </p>
          {children.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-xs" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? <ChevronRight className="mr-1 size-3" /> : <ChevronDown className="mr-1 size-3" />}
              {collapsed ? "Expand" : "Collapse"} ({children.length})
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm leading-6">{comment.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ReactionBar
            likes={counts.likes}
            dislikes={counts.dislikes}
            endpoint={`/api/comments/${comment.id}/react`}
            selected={selected}
          />
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={() => setReplying((v) => !v)}>
            <Reply className="mr-1 size-4" />
            Reply
          </Button>
          <ReportDialog commentId={comment.id} />
          {canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={deleteComment}
            >
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          ) : null}
        </div>
        {replying && (
          <div className="mt-3 max-w-xl">
            <CreateCommentForm postId={comment.postId} parentId={comment.id} />
          </div>
        )}
      </div>
      {!collapsed &&
        children.map((child) => (
          <Node
            key={child.id}
            comment={child}
            tree={tree}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export function CommentThread({ comments, currentUserId, currentUserRole = "USER" }: { comments: CommentData[]; currentUserId?: string; currentUserRole?: string }) {
  const roots = comments.filter((comment) => !comment.parentId);
  return (
    <div>
      {roots.map((root) => (
        <Node key={root.id} comment={root} tree={comments} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      ))}
    </div>
  );
}
