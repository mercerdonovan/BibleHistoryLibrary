import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import { ReaderActions } from "@/components/reader/reader-actions";
import { ReadingProgress } from "@/components/reader/reading-progress";
import { SectionNav, type SectionLink } from "@/components/reader/section-nav";
import { TractBody } from "@/components/reader/tract-body";
import { TractPager } from "@/components/reader/tract-pager";
import { JsonLd } from "@/components/seo/json-ld";
import { CoverMotif } from "@/components/tract/cover-motif";
import { TractCard, tractAccentStyle } from "@/components/tract/tract-card";
import { absoluteUrl, siteConfig } from "@/config/site";
import {
  blockText,
  getAdjacentTracts,
  getAllTracts,
  getRelatedTracts,
  getTract,
  getTractBody,
  getTractSections,
} from "@/lib/tracts";
import { padNumber } from "@/lib/utils";

const BODY_ID = "tract-body";

interface TractPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllTracts()).map((tract) => ({ slug: tract.slug }));
}

export async function generateMetadata({ params }: TractPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tract = await getTract(slug);
  if (!tract) return {};

  return {
    title: tract.title,
    description: tract.description,
    alternates: { canonical: tract.href },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: tract.title,
      description: tract.description,
      url: absoluteUrl(tract.href),
      section: tract.series.title,
      publishedTime: tract.addedAt,
    },
    twitter: { card: "summary_large_image", title: tract.title, description: tract.description },
  };
}

export default async function TractPage({ params }: TractPageProps) {
  const { slug } = await params;
  const tract = await getTract(slug);
  if (!tract) notFound();

  const [body, adjacent, related] = await Promise.all([
    getTractBody(slug),
    getAdjacentTracts(slug),
    getRelatedTracts(tract),
  ]);
  const sections = getTractSections(body);
  const sectionLinks: SectionLink[] = sections.map((section) => ({
    id: section.id,
    label: section.heading ? blockText(section.heading) : "Opening",
  }));

  const url = absoluteUrl(tract.href);
  const { cover } = tract.theme;
  const actions = {
    title: tract.title,
    text: `${tract.title} — a Bible study from ${siteConfig.name}`,
    url,
    pdfHref: tract.pdfHref,
    pdfFileName: `${tract.slug}.pdf`,
  };

  return (
    <article className="accent-scope pb-16 lg:pb-0" style={tractAccentStyle(tract)}>
      <ReadingProgress targetId={BODY_ID} />

      {/* ── Title stage ──────────────────────────────────────────────────── */}
      <header
        className="grain no-print relative overflow-hidden text-stage-ink"
        style={{
          background: `radial-gradient(70% 90% at 85% 0%, ${cover.glow}40, transparent 62%), linear-gradient(155deg, ${cover.from}, ${cover.to} 82%)`,
        }}
      >
        <CoverMotif
          motif={tract.theme.motif}
          color={cover.glow}
          className="scroll-parallax pointer-events-none absolute -right-[10%] top-0 h-[130%] w-[75%] opacity-40 sm:w-[55%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${cover.to}f2 12%, ${cover.to}99 48%, transparent 85%)` }}
        />

        <div className="container-page relative pb-12 pt-8 sm:pb-20 sm:pt-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.8rem] text-white/70">
              <li>
                <Link href="/library" className="link-underline hover:text-white">
                  Library
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/library#${tract.series.id}`} className="link-underline hover:text-white">
                  {tract.series.title}
                </Link>
              </li>
            </ol>
          </nav>

          <p className="mt-12 flex items-center gap-4 sm:mt-20">
            <span className="font-display text-[1.05rem] tabular-nums" style={{ color: cover.glow }}>
              No. {padNumber(tract.order)}
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-white/30" />
            <span className="eyebrow text-[0.68rem] text-white/75">Bible study tract</span>
          </p>
          <h1 className="display mt-5 max-w-[14ch] text-[clamp(3rem,11vw,7.5rem)] leading-[0.94]">
            {tract.title}
          </h1>

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.88rem] text-white/80">
            {[
              { term: "Questions", detail: tract.questionCount },
              { term: "Reading time", detail: `${tract.readingMinutes} min` },
              { term: "Printed length", detail: `${tract.pageCount} pages` },
            ].map(({ term, detail }) => (
              <div key={term} className="flex flex-col-reverse">
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-white/60">{term}</dt>
                <dd className="font-display text-[1.35rem] text-stage-ink">{detail}</dd>
              </div>
            ))}
          </dl>

          <ReaderActions {...actions} variant="stage" className="mt-9" />
        </div>
      </header>

      {/* Printed title block */}
      <header className="print-only mb-6 border-b border-black pb-4">
        <p style={{ fontSize: "9pt", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {siteConfig.name}
        </p>
        <p className="font-serif" style={{ fontSize: "26pt", fontWeight: 700, lineHeight: 1.1, marginTop: "6pt" }}>
          {tract.sourceTitle}
        </p>
      </header>

      {/* ── Reading column ───────────────────────────────────────────────── */}
      <div className="container-page grid gap-x-14 pt-10 sm:pt-16 lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_9rem]">
        <aside className="no-print hidden lg:block">
          <div className="sticky top-28">
            <SectionNav sections={sectionLinks} />
          </div>
        </aside>

        <div className="mx-auto w-full max-w-[43rem] lg:mx-0 lg:pl-10 xl:pl-14">
          <details className="no-print group mb-10 rounded-lg border border-line bg-raised lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[0.9rem] font-semibold [&::-webkit-details-marker]:hidden">
              In this tract
              <ChevronDown aria-hidden="true" className="size-4 text-ink-muted transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <ol className="border-t border-line px-4 py-2">
              {sectionLinks.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block py-2.5 text-[0.86rem] leading-snug text-ink-soft">
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <TractBody id={BODY_ID} sections={sections} />

          <footer className="mt-16 border-t border-line-strong pt-8 sm:mt-24">
            <p className="no-print text-[0.9rem] leading-relaxed text-ink-muted">
              This is the complete text of the printed tract <cite className="italic">{tract.sourceTitle}</cite>,
              reproduced word for word.
            </p>
            <ReaderActions {...actions} className="mt-6" />
            <p className="print-only" style={{ fontSize: "9pt", marginTop: "10pt" }}>
              {siteConfig.name} · {url}
            </p>
          </footer>
        </div>
      </div>

      {/* ── Onward ───────────────────────────────────────────────────────── */}
      <div className="no-print container-page mt-20 sm:mt-28">
        <hr className="rule-gold" />
        <Reveal className="pt-12 sm:pt-16">
          <h2 className="sr-only">Continue reading</h2>
          <TractPager previous={adjacent.previous} next={adjacent.next} />
        </Reveal>

        <section aria-labelledby="related-title" className="pt-20 sm:pt-24">
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-gold">Keep reading</p>
              <h2 id="related-title" className="display mt-3 text-[2.1rem] sm:text-[2.9rem]">
                Related tracts
              </h2>
            </div>
            <Link href="/library" className="link-underline pb-1 text-sm font-semibold">
              All tracts
            </Link>
          </Reveal>
          <ul className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:max-w-4xl">
            {related.map((item, index) => (
              <Reveal as="li" key={item.slug} delay={index * 0.08} className={index === 2 ? "hidden sm:block" : undefined}>
                <TractCard tract={item} />
              </Reveal>
            ))}
          </ul>
        </section>
      </div>

      <ReaderActions {...actions} variant="dock" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: tract.title,
              description: tract.description,
              url,
              mainEntityOfPage: url,
              inLanguage: "en",
              articleSection: tract.series.title,
              wordCount: tract.wordCount,
              datePublished: tract.addedAt,
              isAccessibleForFree: true,
              image: absoluteUrl(`${tract.href}/opengraph-image`),
              publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
              author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
              encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: absoluteUrl(tract.pdfHref) },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Library", item: absoluteUrl("/library") },
                { "@type": "ListItem", position: 2, name: tract.series.title, item: absoluteUrl(`/library#${tract.series.id}`) },
                { "@type": "ListItem", position: 3, name: tract.title, item: url },
              ],
            },
          ],
        }}
      />
    </article>
  );
}
