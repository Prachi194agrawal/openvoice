"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, Search, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Navbar({ name, isAdmin }: { name?: string | null; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (name ?? "Student")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger
            render={<Button size="icon" variant="ghost" className="md:hidden" />}
          >
            <Menu className="size-5" />
          </DialogTrigger>
          <DialogContent className="glass-card max-w-xs rounded-3xl border-white/20 p-5">
            <nav className="mt-3 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm",
                    pathname === link.href ? "bg-primary/15 text-cyan-200" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
                >
                  <ShieldAlert className="size-4" />
                  Admin
                </Link>
              )}
            </nav>
          </DialogContent>
        </Dialog>

        <Link href="/" className="shrink-0 text-sm font-semibold tracking-wide text-cyan-300">
          OpenVoice IIITM
        </Link>

        <form action="/search" className="mx-auto hidden w-full max-w-xl md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search discussions, tags, people..."
              className="h-10 rounded-xl border-white/15 bg-slate-900/70 pl-10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Avatar className="size-9 ring-2 ring-cyan-400/30">
            <AvatarFallback className="bg-slate-800 text-xs font-semibold text-cyan-200">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">{name ?? "Student"}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-white/15" onClick={() => signOut({ callbackUrl: "/signin" })}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
