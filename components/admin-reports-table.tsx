"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type Report = {
  id: string;
  reason: string;
  status: string;
  reporter: { id: string; name: string | null; email: string | null };
  post?: { id: string; title: string } | null;
  comment?: { id: string; body: string } | null;
};

export function AdminReportsTable({ reports }: { reports: Report[] }) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        const haystack = `${report.reporter.email ?? ""} ${report.reason} ${report.post?.title ?? ""} ${report.comment?.body ?? ""}`;
        return haystack.toLowerCase().includes(filter.toLowerCase());
      }),
    [reports, filter]
  );

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
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter by reporter, reason, or content..."
          className="max-w-md rounded-xl border-white/10 bg-slate-900/60"
        />
      </div>
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
        {filtered.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.reporter.email}</TableCell>
            <TableCell>{r.reason}</TableCell>
            <TableCell>{r.post?.title ?? r.comment?.body?.slice(0, 60)}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell className="space-x-1">
              <Button size="sm" className="rounded-xl" onClick={() => update(r.id, "RESOLVED")}>Resolve</Button>
              <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => update(r.id, "REJECTED")}>Delete</Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => block(r.reporter.id)}>Ban User</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  );
}
