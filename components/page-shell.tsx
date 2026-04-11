import Link from "next/link";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { SidebarNav } from "@/components/sidebar-nav";
import { isPreviewMode } from "@/lib/preview";
import { mockUser } from "@/lib/mock-data";
import { db } from "@/lib/prisma";

async function trendingHashtags(): Promise<string[]> {
  if (isPreviewMode) return ["placement-prep", "hackathon-season", "hostel-updates"];
  try {
    const rows = await db.$queryRaw<Array<{ tag: string }>>`
      SELECT h AS tag
      FROM "Post", unnest("hashtags") AS h
      GROUP BY h
      ORDER BY COUNT(*) DESC
      LIMIT 8
    `;
    return rows.map((r) => r.tag);
  } catch {
    return [];
  }
}

export async function PageShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? (isPreviewMode ? mockUser : undefined);
  const isAdmin = user?.role === "ADMIN";
  const trending = await trendingHashtags();

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[url('/campus-background.png')] bg-cover bg-[center_30%] bg-no-repeat"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-slate-950/72 backdrop-blur-[2px]" aria-hidden />
      <Navbar name={user?.name} isAdmin={isAdmin} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <SidebarNav isAdmin={isAdmin} />
        <main className="space-y-4 pb-8">{children}</main>
        <aside className="glass-card sticky top-20 hidden h-fit rounded-3xl p-4 xl:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Trending</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {trending.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs">Add hashtags to posts to see trends here.</p>
            ) : (
              trending.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-cyan-400/25 hover:text-foreground"
                >
                  #{tag}
                </Link>
              ))
            )}
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
