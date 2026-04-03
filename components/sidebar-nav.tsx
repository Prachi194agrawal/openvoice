import Link from "next/link";
import { Home, Search, UserCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="w-full border-r bg-card md:w-56">
      <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm no-underline text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ShieldAlert className="size-4" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  );
}
