import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookContents } from "@/components/book/book-contents";
import { BookCover } from "@/components/book/book-cover";
import { bookAccentStyle } from "@/components/book/book-style";
import { ResumeLink } from "@/components/book/resume-link";
import { HeroFade } from "@/components/home/hero-copy";
import { ReaderActions } from "@/components/reader/reader-actions";
import { SharingNoticeBrief } from "@/components/sharing-notice";
import { absoluteUrl, siteConfig } from "@/config/site";
import { formatDuration, getAllBooks, getBook } from "@/lib/books";

interface ReadPageProps {
  params: Promise<{ book: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllBooks()).map((book) => ({ book: book.slug }));
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const book = await getBook((await params).book);
  if (!book) return {};
  const title = `Read ${book.title}`;
  const description = `The web edition of ${book.title}: ${book.chapters.length} chapters to read online, with the original pictures and quotations in place.`;
  return {
    title,
    description,
    alternates: { canonical: book.readHref },
    openGraph: {
      type: "book",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title,
      description,
      url: absoluteUrl(book.readHref),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ReadPage({ params }: ReadPageProps) {
  const book = await getBook((await params).book);
  const first = book?.chapters[0];
  if (!book || !first) notFound();

  return (
    <div className="accent-scope atmosphere" style={bookAccentStyle(book)}>
      <div className="container-page grid gap-x-16 gap-y-10 pb-8 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Link
            href={book.href}
            className="inline-flex min-h-10 items-center gap-2 text-[0.86rem] font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            About the book
          </Link>
          <div className="mt-6 hidden w-full max-w-[15rem] lg:block">
            <BookCover book={book} sizes="15rem" />
          </div>
          <div className="mt-8 hidden lg:block">
            <ReaderActions
              title={book.title}
              text={`${book.title} — a book from ${siteConfig.name}`}
              url={absoluteUrl(book.href)}
              pdfHref={book.pdfHref}
              pdfFileName={book.pdfFileName}
              showPrint={false}
              shareVariant="outline"
            />
            <SharingNoticeBrief href={`${book.href}#sharing`} className="mt-5 max-w-[17rem] text-ink-muted" />
          </div>
        </aside>

        <div className="max-w-3xl">
          <HeroFade>
            <p className="eyebrow text-accent">Web edition</p>
            <h1 className="display mt-4 text-[clamp(2.8rem,8vw,5.2rem)] leading-[0.96]">{book.title}</h1>
            <p className="mt-5 text-[0.95rem] text-ink-muted">
              {book.chapters.length} chapters
              <span aria-hidden="true" className="mx-2 text-line-strong">/</span>
              {formatDuration(book.readingMinutes)} of reading
              <span aria-hidden="true" className="mx-2 text-line-strong">/</span>
              {book.pageCount} printed pages
            </p>
            <div className="mt-7">
              <ResumeLink
                bookSlug={book.slug}
                startHref={first.href}
                chapters={book.chapters.map(({ slug, href, label }) => ({ slug, href, label }))}
              />
            </div>
          </HeroFade>

          <HeroFade delay={0.15}>
            <h2 className="eyebrow mt-14 text-ink-muted">Contents</h2>
            <BookContents chapters={book.chapters} className="mt-4" />
          </HeroFade>

          <div className="mt-10 lg:hidden">
            <ReaderActions
              title={book.title}
              text={`${book.title} — a book from ${siteConfig.name}`}
              url={absoluteUrl(book.href)}
              pdfHref={book.pdfHref}
              pdfFileName={book.pdfFileName}
              showPrint={false}
              shareVariant="outline"
            />
            <SharingNoticeBrief href={`${book.href}#sharing`} className="mt-5 text-ink-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
