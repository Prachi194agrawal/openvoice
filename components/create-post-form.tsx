"use client";

import { useState } from "react";
import { ImageIcon, Tags } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data.error || "Could not create post");
    }
    setTitle("");
    setBody("");
    toast.success("Post created");
    window.location.reload();
  };

  return (
    <form
      onSubmit={submit}
      className="glass-card mb-4 rounded-3xl p-4 transition-all duration-200 hover:border-cyan-400/30"
      onFocus={() => setExpanded(true)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-10 ring-2 ring-cyan-400/30">
          <AvatarFallback className="bg-slate-800 text-xs text-cyan-200">OV</AvatarFallback>
        </Avatar>
        <div className="w-full space-y-3">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-left text-sm text-muted-foreground transition hover:border-cyan-400/30"
            >
              What&apos;s happening in IIITM?
            </button>
          ) : null}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="rounded-2xl border-white/10 bg-slate-900/60"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your thoughts with IIITM..."
                  className="min-h-28 rounded-2xl border-white/10 bg-slate-900/60"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Button type="button" size="sm" variant="ghost" className="rounded-xl">
                      <ImageIcon className="mr-1 size-4" />
                      Image
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="rounded-xl">
                      <Tags className="mr-1 size-4" />
                      Tags
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-[0_0_20px_rgba(59,130,246,0.45)]"
                    >
                      {loading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}
