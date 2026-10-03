"use client";

import { List, X } from "lucide-react";
import { useRef } from "react";

interface ContentsDrawerProps {
  title: string;
  /** Server-rendered table of contents and actions. */
  children: React.ReactNode;
}

/** Opens the table of contents in a native modal dialog (focus-trapped, Esc to close). */
export function ContentsDrawer({ title, children }: ContentsDrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line px-3 text-[0.84rem] font-semibold text-ink transition-colors hover:border-line-strong"
      >
        <List aria-hidden="true" className="size-4" />
        Contents
      </button>

      <dialog
        ref={ref}
        aria-label={`${title}: contents`}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === ref.current) ref.current?.close();
        }}
        className="contents-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
            <p className="display text-[1.4rem]">{title}</p>
            <button
              type="button"
              aria-label="Close contents"
              onClick={() => ref.current?.close()}
              className="grid size-10 place-items-center rounded-md border border-line text-ink hover:border-line-strong"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          {/* Close when a chapter link is followed: the reader stays mounted between chapters. */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2 sm:px-7"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) ref.current?.close();
            }}
          >
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}
