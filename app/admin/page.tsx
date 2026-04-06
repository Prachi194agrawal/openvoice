import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { AdminReportsTable } from "@/components/admin-reports-table";
import { isPreviewMode } from "@/lib/preview";
import { mockReports, mockUser } from "@/lib/mock-data";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role ?? (isPreviewMode ? mockUser.role : undefined);
  if (role !== "ADMIN") {
    redirect("/");
  }

  const reports = isPreviewMode
    ? mockReports
    : await db.report.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          post: { select: { id: true, title: true } },
          comment: { select: { id: true, body: true } },
        },
      });

  return (
    <PageShell>
      <div className="glass-card mb-4 rounded-3xl p-5">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Moderate reported content, resolve abuse reports, and block users.</p>
      </div>
      <div className="glass-card rounded-3xl p-4">
        <AdminReportsTable reports={reports} />
      </div>
    </PageShell>
  );
}
