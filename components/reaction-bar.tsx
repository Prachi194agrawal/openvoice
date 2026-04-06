"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  likes: number;
  dislikes: number;
  endpoint: string;
  selected?: "LIKE" | "DISLIKE" | null;
};

export function ReactionBar({ likes, dislikes, endpoint, selected }: Props) {
  const react = async (value: "LIKE" | "DISLIKE") => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) toast.error("Unable to react");
    else window.location.reload();
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={selected === "LIKE" ? "default" : "outline"}
        size="sm"
        className="rounded-xl border-white/15"
        onClick={() => react("LIKE")}
      >
        <ThumbsUp className="size-4" /> {likes}
      </Button>
      <Button
        variant={selected === "DISLIKE" ? "default" : "outline"}
        size="sm"
        className="rounded-xl border-white/15"
        onClick={() => react("DISLIKE")}
      >
        <ThumbsDown className="size-4" /> {dislikes}
      </Button>
    </div>
  );
}
