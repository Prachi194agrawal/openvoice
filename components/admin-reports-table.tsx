"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Report = {
  id: string;
  reason: string;
  status: string;
  reporter: { id: string; name: string | null; email: string | null };
  post?: { id: string; title: string } | null;
  comment?: { id: string; body: string } | null;
};

export function AdminReportsTable({ reports }: { reports: Report[] }) {
  const update = async (id: string, status: "RESOLVED" | "REJECTED") => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return toast.error("Action failed");
    toast.success("Updated");
    window.location.reload();
  };

  const block = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}/block`, { method: "PATCH" });
    if (!res.ok) return toast.error("Unable to block user");
    toast.success("User blocked");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reporter</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.reporter.email}</TableCell>
            <TableCell>{r.reason}</TableCell>
            <TableCell>{r.post?.title ?? r.comment?.body?.slice(0, 60)}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell className="space-x-1">
              <Button size="sm" onClick={() => update(r.id, "RESOLVED")}>Resolve</Button>
              <Button size="sm" variant="destructive" onClick={() => update(r.id, "REJECTED")}>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => block(r.reporter.id)}>Block User</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
