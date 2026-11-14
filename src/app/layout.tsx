import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, Newsreader } from "next/font/google";

import { textSizeBootScript } from "@/components/book/text-size";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, siteConfig } from "@/config/site";

import "./globals.css";

// Display: a soft, high-contrast old-style serif for titles and questions.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Reading: a text serif drawn for long passages on screen.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Interface: a quiet grotesque that stays out of the way.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1120" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${hanken.variable}`}
    >
      <head>
        {/* Applies the reader's saved text size before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: textSizeBootScript }} />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-bg"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
          </MotionProvider>
        </ThemeProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            description: siteConfig.description,
            url: siteConfig.url,
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </body>
    </html>
  );
}
