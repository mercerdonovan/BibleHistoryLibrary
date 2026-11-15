import { Search } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search the library"
            className="grid size-10 place-items-center rounded-md border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <Search aria-hidden="true" className="size-[1.05rem]" />
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
