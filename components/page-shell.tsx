import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { SidebarNav } from "@/components/sidebar-nav";
import { isPreviewMode } from "@/lib/preview";
import { mockUser } from "@/lib/mock-data";

export async function PageShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <Navbar name={user?.name} isAdmin={isAdmin} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <SidebarNav isAdmin={isAdmin} />
        <main className="space-y-4 pb-8">{children}</main>
        <aside className="glass-card sticky top-20 hidden h-fit rounded-3xl p-4 xl:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Trending</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2">#placement-prep</p>
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2">#hackathon-season</p>
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2">#hostel-updates</p>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-cyan-300">Announcements</p>
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">
            Campus-only platform: use your `@iiitm.ac.in` account for verified discussions.
          </p>
        </aside>
      </div>
    </div>
  );
}
