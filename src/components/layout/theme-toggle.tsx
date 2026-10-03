"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const subscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known in the browser; render a neutral state on the server.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark theme"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative grid size-10 place-items-center overflow-hidden rounded-md border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute size-[1.05rem] transition-all duration-500 ease-out-expo",
          isDark ? "translate-y-6 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100",
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-[1.05rem] transition-all duration-500 ease-out-expo",
          isDark ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-6 -rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
