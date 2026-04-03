"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setLoading(false);
    if (!res.ok) return toast.error("Could not create post");
    setTitle("");
    setBody("");
    toast.success("Post created");
    window.location.reload();
  };

  return (
    <form onSubmit={submit} className="mb-4 space-y-2 rounded-xl border bg-card p-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share with IIITM..." />
      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Create Post"}
      </Button>
    </form>
  );
}
