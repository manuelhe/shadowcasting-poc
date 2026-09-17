"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface ShowcaseNavLink {
  href: string;
  label: string;
}

export const SHOWCASE_NAV_LINKS: ShowcaseNavLink[] = [
  { href: "/", label: "← Playground" },
  { href: "/showcase", label: "Gallery" },
  { href: "/showcase/wood-header", label: "Wood Header" },
  { href: "/showcase/decayed-paint", label: "Decayed Paint" },
  { href: "/showcase/scroll-top", label: "Scroll Top" },
  { href: "/showcase/scroll-mid", label: "Scroll Mid" },
];

export function ShowcaseNav() {
  const pathname = usePathname();

  return (
    <header
      data-testid="showcase-nav-header"
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <nav
        aria-label="Showcase Navigation"
        data-testid="showcase-nav"
        className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-2xl shadow-black/50 text-xs overflow-x-auto max-w-full scrollbar-none"
      >
        {SHOWCASE_NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              data-active={isActive ? "true" : "false"}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 font-medium ${
                isActive
                  ? "bg-zinc-100 text-zinc-950 shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default ShowcaseNav;
