/**
 * Central site configuration.
 *
 * TODO before launch: set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_CONTACT_EMAIL
 * (see .env.example). The fallbacks below are placeholders, not real details.
 */

const PLACEHOLDER_EMAIL = "contact@example.com";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Bible History Library",
  shortName: "BHL",
  tagline: "Whole books, freely given.",
  description:
    "Christian books from the Bible History Library, free to read online chapter by chapter, to download exactly as printed, and to share.",
  url: resolveSiteUrl(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? PLACEHOLDER_EMAIL,
  locale: "en_US",
  nav: [
    { href: "/books", label: "Books" },
    { href: "/search", label: "Search" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Order copies" },
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
