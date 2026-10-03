"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/library") return pathname.startsWith("/library") || pathname.startsWith("/tracts");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1">
      {siteConfig.nav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-[0.9rem] font-medium transition-colors",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gold-bright transition-transform duration-500 ease-out-expo",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
