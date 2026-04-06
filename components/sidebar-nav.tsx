"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, UserCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function SidebarNav({ isAdmin, className }: { isAdmin: boolean; className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("glass-card sticky top-20 hidden h-[calc(100vh-5.5rem)] w-64 rounded-3xl p-3 md:block", className)}>
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm no-underline transition-all",
              pathname === link.href
                ? "bg-primary/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all",
              pathname === "/admin"
                ? "bg-primary/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <ShieldAlert className="size-4" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  );
}
