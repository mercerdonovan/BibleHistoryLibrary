import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookBody } from "@/components/book/book-body";
import { BookContents } from "@/components/book/book-contents";
import { BookProgress } from "@/components/book/book-progress";
import { bookAccentStyle } from "@/components/book/book-style";
import { ContentsDrawer } from "@/components/book/contents-drawer";
import { HeroFade } from "@/components/home/hero-copy";
import { ReaderActions } from "@/components/reader/reader-actions";
import { JsonLd } from "@/components/seo/json-ld";
import { SharingNoticeBrief } from "@/components/sharing-notice";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getAdjacentChapters, getAllBooks, getBook, getChapterBody } from "@/lib/books";
import { padNumber } from "@/lib/utils";

const BODY_ID = "chapter-body";

interface ChapterPageProps {
  params: Promise<{ book: string; chapter: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const books = await getAllBooks();
  return books.flatMap((book) => book.chapters.map((chapter) => ({ book: book.slug, chapter: chapter.slug })));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const book = await getBook(bookSlug);
  const chapter = book?.chapters.find((item) => item.slug === chapterSlug);
  if (!book || !chapter) return {};

  const title = `${chapter.title} · ${book.title}`;
  const description = `${chapter.label} of ${book.title}: “${chapter.title}”. Read the complete chapter online, as printed.`;
  return {
    title,
    description,
    alternates: { canonical: chapter.href },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title,
      description,
      url: absoluteUrl(chapter.href),
      section: book.title,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const book = await getBook(bookSlug);
  if (!book) notFound();
  const chapter = book.chapters.find((item) => item.slug === chapterSlug);
  const body = await getChapterBody(book, chapterSlug);
  if (!chapter || !body) notFound();

  const { previous, next } = getAdjacentChapters(book, chapterSlug);
  const url = absoluteUrl(chapter.href);
  const actions = {
    title: `${chapter.title} — ${book.title}`,
    text: `${chapter.title}, from ${book.title} (${siteConfig.name})`,
    url,
    pdfHref: book.pdfHref,
    pdfFileName: book.pdfFileName,
    showPrint: false,
  };

  return (
    <article className="accent-scope" style={bookAccentStyle(book)}>
      {/* ── Reader bar: way back, place in the book, contents ───────────── */}
      <div className="no-print sticky top-16 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="container-page flex h-12 items-center justify-between gap-3">
          <Link
            href={book.href}
            className="inline-flex min-h-10 min-w-0 items-center gap-2 text-[0.84rem] font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{book.title}</span>
          </Link>
          <p className="hidden min-w-0 flex-1 truncate text-center text-[0.82rem] text-ink-muted md:block">
            {chapter.label}
            <span aria-hidden="true" className="mx-2 text-line-strong">/</span>
            {chapter.title}
          </p>
          <div className="flex items-center gap-3 text-[0.8rem] text-ink-muted">
            <BookProgress
              bookSlug={book.slug}
              chapterSlug={chapter.slug}
              targetId={BODY_ID}
              wordsBefore={chapter.wordsBefore}
              chapterWords={chapter.wordCount}
              totalWords={book.wordCount}
            />
            <ContentsDrawer title={book.title}>
              <BookContents chapters={book.chapters} currentSlug={chapter.slug} compact className="border-t-0" />
              <div className="mt-6">
                <ReaderActions {...actions} title={book.title} url={absoluteUrl(book.href)} shareVariant="outline" />
                <SharingNoticeBrief href={`${book.href}#sharing`} className="mt-4 text-ink-muted" />
              </div>
            </ContentsDrawer>
          </div>
        </div>
      </div>

      {/* Printed running head */}
      <header className="print-only mb-6 border-b border-black pb-3">
        <p style={{ fontSize: "9pt", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {book.title} · {siteConfig.name}
        </p>
        <p style={{ fontSize: "9pt", marginTop: "4pt" }}>
          For an exact copy of the printed book, download the PDF: {absoluteUrl(book.pdfHref)}
        </p>
      </header>

      {/* ── Chapter opening ─────────────────────────────────────────────── */}
      <header className="atmosphere overflow-hidden">
        <div className="container-page pb-10 pt-14 text-center sm:pb-14 sm:pt-24">
          <HeroFade>
            <p className="eyebrow text-accent">{body.label}</p>
          </HeroFade>
          <HeroFade delay={0.1}>
            <h1 className="display mx-auto mt-6 max-w-4xl text-[clamp(2.7rem,9vw,6rem)] leading-[0.98]">
              {body.titleLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </HeroFade>
          <HeroFade delay={0.25} className="no-print">
            <span aria-hidden="true" className="mx-auto mt-9 block h-px w-24 bg-accent" />
            <p className="mt-6 text-[0.82rem] text-ink-muted">
              {chapter.readingMinutes} min read
              <span aria-hidden="true" className="mx-2 text-line-strong">/</span>
              {chapter.startPage === chapter.endPage
                ? `Page ${chapter.startPage}`
                : `Pages ${chapter.startPage}–${chapter.endPage}`}{" "}
              of the printed book
            </p>
          </HeroFade>
        </div>
      </header>

      {/* ── Text ────────────────────────────────────────────────────────── */}
      <div className="container-page pt-6 sm:pt-10">
        <div className="mx-auto max-w-[41rem]">
          <BookBody id={BODY_ID} blocks={body.blocks} imageAlt={book.imageAlt} />

          <footer className="no-print mt-16 border-t border-line-strong pt-8 sm:mt-24">
            <p className="text-[0.9rem] text-ink-muted">
              End of {body.label.toLowerCase()}
              {next ? "." : `, and of ${book.title}.`}
            </p>
            <ReaderActions {...actions} shareVariant="outline" className="mt-5" />
            <SharingNoticeBrief href={`${book.href}#sharing`} className="mt-5 text-ink-muted" />
          </footer>
        </div>
      </div>

      {/* ── Onward ──────────────────────────────────────────────────────── */}
      <nav aria-label="Chapters" className="no-print container-page mt-14 sm:mt-20">
        <hr className="rule-gold" />
        {next ? (
          <Link href={next.href} rel="next" className="group block py-12 text-center sm:py-16">
            <span className="eyebrow text-accent">Next · {next.label}</span>
            <span className="display mx-auto mt-4 block max-w-3xl text-[clamp(2rem,6vw,4rem)] leading-[1] text-ink transition-colors group-hover:text-accent">
              {next.title}
            </span>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              Continue reading
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
            </span>
          </Link>
        ) : (
          <div className="py-12 text-center sm:py-16">
            <p className="display text-[clamp(2rem,6vw,3.4rem)]">You have reached the end.</p>
            <Link href={book.href} className="link-underline mt-5 inline-block text-sm font-semibold">
              Back to {book.title}
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-line py-5 text-[0.86rem]">
          {previous ? (
            <Link href={previous.href} rel="prev" className="group inline-flex min-h-10 items-center gap-2 font-semibold text-ink-soft hover:text-ink">
              <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
              <span>
                <span className="sr-only">Previous: </span>
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <span className="font-display tabular-nums text-ink-muted">
            {padNumber(chapter.number)} / {padNumber(book.chapters.length)}
          </span>
        </div>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Chapter",
              name: chapter.title,
              position: chapter.number,
              url,
              inLanguage: "en",
              pageStart: chapter.startPage,
              pageEnd: chapter.endPage,
              wordCount: chapter.wordCount,
              isAccessibleForFree: true,
              isPartOf: { "@type": "Book", "@id": `${absoluteUrl(book.href)}#book`, name: book.title, url: absoluteUrl(book.href) },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Books", item: absoluteUrl("/books") },
                { "@type": "ListItem", position: 2, name: book.title, item: absoluteUrl(book.href) },
                { "@type": "ListItem", position: 3, name: chapter.title, item: url },
              ],
            },
          ],
        }}
      />
    </article>
  );
}
