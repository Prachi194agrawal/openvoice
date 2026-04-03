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
      <h1 className="mb-4 text-xl font-semibold">Admin Dashboard</h1>
      <div className="rounded-xl border bg-card p-4">
        <AdminReportsTable reports={reports} />
      </div>
    </PageShell>
  );
}
