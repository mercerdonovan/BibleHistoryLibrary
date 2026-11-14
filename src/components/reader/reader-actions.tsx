"use client";

import { Check, Download, Printer, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { buttonClasses, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReaderActionsProps {
  title: string;
  /** Short supporting line passed to the native share sheet. */
  text: string;
  /** Canonical URL of the book or chapter. */
  url: string;
  pdfHref?: string;
  pdfFileName?: string;
  /** Offer the browser's print dialog for this page (a chapter prints cleanly; see the print styles). */
  showPrint?: boolean;
  showShare?: boolean;
  /** Override the Share button's style (it is the primary action by default). */
  shareVariant?: ButtonVariant;
  variant?: "stage" | "page";
  className?: string;
}

type ShareState = "idle" | "copied" | "failed";

/** Share via the native sheet where available; otherwise copy the canonical link. */
function useShare(title: string, text: string, url: string) {
  const [state, setState] = useState<ShareState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2600);
    return () => window.clearTimeout(timer);
  }, [state]);

  const share = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // The reader dismissed the sheet: nothing more to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
  }, [title, text, url]);

  return { state, share };
}

export function ReaderActions({ title, text, url, pdfHref, pdfFileName, showPrint = true, showShare = true, shareVariant, variant = "page", className }: ReaderActionsProps) {
  const { state, share } = useShare(title, text, url);

  const shareLabel = state === "copied" ? "Link copied" : state === "failed" ? "Copy failed" : "Share";
  const ShareIcon = state === "copied" ? Check : Share2;
  const status = (
    <span role="status" aria-live="polite" className="sr-only">
      {state === "copied" ? "Link copied to clipboard" : state === "failed" ? `Could not copy. The link is ${url}` : ""}
    </span>
  );

  const primary: ButtonVariant = variant === "stage" ? "stageSolid" : "primary";
  const secondary: ButtonVariant = variant === "stage" ? "stage" : "outline";

  return (
    <div className={cn("no-print flex flex-wrap items-center gap-2.5", className)}>
      {showShare ? (
        <button type="button" onClick={share} className={buttonClasses(shareVariant ?? primary)}>
          <ShareIcon aria-hidden="true" />
          {shareLabel}
        </button>
      ) : null}
      {showPrint ? (
        <button type="button" onClick={() => window.print()} className={buttonClasses(secondary)}>
          <Printer aria-hidden="true" />
          Print
        </button>
      ) : null}
      {pdfHref ? (
        <a href={pdfHref} download={pdfFileName} className={buttonClasses(secondary)}>
          <Download aria-hidden="true" />
          Download PDF
        </a>
      ) : null}
      {status}
    </div>
  );
}
