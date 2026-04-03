"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = { postId?: string; commentId?: string };

export function ReportDialog({ postId, commentId }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, postId, commentId }),
    });
    setLoading(false);
    if (!res.ok) return toast.error("Could not submit report");
    setReason("");
    toast.success("Report submitted");
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Report</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason..." />
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={submit} disabled={loading || reason.length < 4}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
