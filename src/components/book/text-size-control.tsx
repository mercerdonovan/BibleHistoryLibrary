"use client";

import { ALargeSmall, Minus, Plus } from "lucide-react";
import { useId, useSyncExternalStore } from "react";

import { DEFAULT_TEXT_SIZE, readTextSize, subscribeTextSize, TEXT_SIZES, writeTextSize } from "@/components/book/text-size";

/** The block nearest the top of the screen, so a size change can keep it in place. */
function topBlock(): HTMLElement | undefined {
  for (const block of document.querySelectorAll<HTMLElement>(".b-block")) {
    if (block.getBoundingClientRect().bottom > 140) return block;
  }
  return undefined;
}

/** Reader text size: a small popover with smaller / larger / reset. */
export function TextSizeControl() {
  const index = useSyncExternalStore(subscribeTextSize, readTextSize, () => DEFAULT_TEXT_SIZE);
  const popoverId = useId();
  const last = TEXT_SIZES.length - 1;
  const percent = Math.round((TEXT_SIZES[index] ?? 1) * 100);

  const change = (next: number) => {
    const anchor = topBlock();
    const before = anchor?.getBoundingClientRect().top;
    writeTextSize(next);
    if (anchor && before !== undefined) {
      window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: "instant" });
    }
  };

  const step =
    "grid size-11 place-items-center rounded-md border border-line text-ink transition-colors hover:border-ink disabled:opacity-35 disabled:hover:border-line";

  return (
    <>
      <button
        type="button"
        popoverTarget={popoverId}
        aria-label={`Text size, ${percent} percent`}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line px-2.5 text-[0.84rem] font-semibold text-ink transition-colors hover:border-line-strong"
      >
        <ALargeSmall aria-hidden="true" className="size-[1.1rem]" />
        <span className="hidden sm:inline">Text</span>
      </button>

      <div id={popoverId} popover="auto" className="text-size-pop">
        <p className="eyebrow text-[0.64rem] text-ink-muted">Text size</p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" aria-label="Smaller text" disabled={index === 0} onClick={() => change(index - 1)} className={step}>
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <output aria-live="polite" className="min-w-16 text-center font-display text-[1.35rem] tabular-nums text-ink">
            {percent}%
          </output>
          <button type="button" aria-label="Larger text" disabled={index === last} onClick={() => change(index + 1)} className={step}>
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div aria-hidden="true" className="mt-4 flex items-end justify-between gap-1">
          {TEXT_SIZES.map((size, sizeIndex) => (
            <span
              key={size}
              className={sizeIndex === index ? "h-1 flex-1 rounded-full bg-accent" : "h-1 flex-1 rounded-full bg-line"}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => change(DEFAULT_TEXT_SIZE)}
          disabled={index === DEFAULT_TEXT_SIZE}
          className="mt-4 text-[0.8rem] font-semibold text-ink-soft underline decoration-gold-bright underline-offset-4 disabled:no-underline disabled:opacity-40"
        >
          Reset to default
        </button>
      </div>
    </>
  );
}
