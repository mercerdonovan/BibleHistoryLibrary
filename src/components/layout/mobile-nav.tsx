"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { isActivePath } from "@/components/layout/nav-links";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const subscribe = () => () => {};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The panel is portalled to <body>, which only exists in the browser.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

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

  // Rendered outside the header: the header's backdrop blur would otherwise
  // confine a fixed panel to the header's own 4rem strip. It sits just below
  // the header (z-50) so the logo and the close button stay on top.
  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="atmosphere fixed inset-0 z-[45] flex flex-col overflow-y-auto overscroll-contain bg-bg px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col border-t border-line">
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
                        "display flex items-baseline justify-between py-5 text-[2.1rem] transition-colors",
                        active ? "text-burgundy" : "text-ink active:text-burgundy",
                      )}
                    >
                      {item.label}
                      <span className="font-sans text-xs tracking-[0.2em] text-ink-muted">0{index + 1}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
          <motion.p
            className="mt-auto pt-10 font-display text-[1.25rem] italic text-ink-soft"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {siteConfig.tagline}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-md border border-line text-ink transition-colors hover:border-line-strong"
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>
      {mounted ? createPortal(panel, document.body) : null}
    </div>
  );
}
