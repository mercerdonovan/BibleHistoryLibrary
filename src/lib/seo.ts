import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/config/site";

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

/** Per-page metadata with canonical URL and matching social cards. */
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: `${title} — ${siteConfig.name}`,
      description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${siteConfig.name}`,
      description,
    },
  };
}
