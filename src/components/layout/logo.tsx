import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Wordmark with a small "shelf" mark: three spines of differing height. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <svg viewBox="0 0 28 28" aria-hidden="true" className="size-7 shrink-0">
        <rect x="3" y="6" width="5.5" height="18" rx="1.2" className="fill-burgundy transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
        <rect x="11.25" y="3" width="5.5" height="21" rx="1.2" className="fill-ink transition-transform delay-75 duration-500 ease-out-expo group-hover:-translate-y-0.5" />
        <rect x="19.5" y="8.5" width="5.5" height="15.5" rx="1.2" className="fill-gold-bright transition-transform delay-150 duration-500 ease-out-expo group-hover:-translate-y-0.5" />
        <rect x="1.5" y="25" width="25" height="1.4" rx="0.7" className="fill-ink-muted" />
      </svg>
      <span className="font-display text-[1.06rem] leading-none tracking-[-0.01em] text-ink">
        Bible History <span className="italic text-ink-soft">Library</span>
      </span>
    </Link>
  );
}
