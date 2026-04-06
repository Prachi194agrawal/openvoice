"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CreateCommentForm({ postId, parentId }: { postId: string; parentId?: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body, parentId }),
    });
    setLoading(false);
    if (!res.ok) return toast.error("Comment failed");
    setBody("");
    toast.success("Comment added");
    window.location.reload();
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your comment..."
        className="rounded-xl border-white/10 bg-slate-900/60"
      />
      <Button type="submit" size="sm" disabled={loading} className="rounded-xl">
        {loading ? "Posting..." : parentId ? "Reply" : "Comment"}
      </Button>
    </form>
  );
}
