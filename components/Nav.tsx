"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Today" },
  { href: "/month", label: "Month" },
  { href: "/scores", label: "Scores" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] md:static md:border-t-0 md:bg-transparent">
      <div className="flex justify-around gap-1 py-2 md:flex-row md:items-center md:gap-4 md:py-0">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
