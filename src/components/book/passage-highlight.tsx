"use client";

import { useEffect } from "react";

/**
 * Marks the passage named in the address (#b24) so it is briefly highlighted.
 * CSS :target covers full page loads; this covers in-app navigation (from
 * search results or "Continue reading"), where browsers do not update :target.
 */
export function PassageHighlight() {
  useEffect(() => {
    const mark = () => {
      document.querySelectorAll("[data-flash]").forEach((element) => element.removeAttribute("data-flash"));
      const id = decodeURIComponent(window.location.hash.slice(1));
      const element = id ? document.getElementById(id) : null;
      if (element?.classList.contains("b-block")) element.setAttribute("data-flash", "");
    };
    mark();
    window.addEventListener("hashchange", mark);
    return () => window.removeEventListener("hashchange", mark);
  }, []);

  return null;
}
