"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const baseLinks = [
  { href: "/campaign", label: "Home" },
  { href: "/characters", label: "Party" },
  { href: "/npcs", label: "NPCs" },
  { href: "/lore", label: "Lore" },
  { href: "/map", label: "Map" },
];

const journalLink = { href: "/journal", label: "Journal" };
const dmLinks = [{ href: "/admin", label: "DM Admin" }];

export function Nav({ isDm, characterName }: { isDm: boolean; characterName?: string | null }) {
  const pathname = usePathname();
  const links = isDm ? [...baseLinks, ...dmLinks] : [...baseLinks, journalLink];

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/campaign" className="text-lg font-semibold text-foreground">
            The Wounds
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-accent-soft text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isDm ? (
            <span className="badge badge-specific">DM</span>
          ) : characterName ? (
            <span className="text-sm text-muted">{characterName}</span>
          ) : null}
          <form action={signOut}>
            <button type="submit" className="btn text-xs">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
