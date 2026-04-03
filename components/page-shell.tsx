import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { SidebarNav } from "@/components/sidebar-nav";
import { isPreviewMode } from "@/lib/preview";
import { mockUser } from "@/lib/mock-data";

export async function PageShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar name={user?.name} />
      <div className="mx-auto flex max-w-6xl items-start">
        <SidebarNav isAdmin={user?.role === "ADMIN"} />
        <main className="w-full p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
