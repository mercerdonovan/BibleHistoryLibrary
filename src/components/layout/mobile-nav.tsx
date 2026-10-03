"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { isActivePath } from "@/components/layout/nav-links";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      // Keep focus inside the open menu (the toggle button plus the panel links).
      const focusable = [
        triggerRef.current,
        ...(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []),
      ].filter((element): element is HTMLElement => Boolean(element));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="relative z-[70] grid size-10 place-items-center rounded-md border border-line text-ink transition-colors hover:border-line-strong"
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="atmosphere fixed inset-0 z-[60] flex flex-col bg-bg px-6 pb-10 pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {siteConfig.nav.map((item, index) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.05 + index * 0.06 }}
                      className="border-b border-line"
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "display flex items-baseline justify-between py-5 text-[2.1rem]",
                          active ? "text-burgundy" : "text-ink",
                        )}
                      >
                        {item.label}
                        <span className="font-sans text-xs tracking-[0.2em] text-ink-muted">
                          0{index + 1}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <p className="mt-auto max-w-xs text-sm leading-relaxed text-ink-muted">{siteConfig.tagline}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
