import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { getAllBooks, getBook } from "@/lib/books";
import { OG_SIZE, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Chapter title and book cover";

export async function generateStaticParams() {
  const books = await getAllBooks();
  return books.flatMap((book) => book.chapters.map((chapter) => ({ book: book.slug, chapter: chapter.slug })));
}

export default async function Image({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const book = await getBook(bookSlug);
  const chapter = book?.chapters.find((item) => item.slug === chapterSlug);
  if (!book || !chapter) return new Response("Not found", { status: 404 });

  const cover = await readFile(path.join(process.cwd(), "public", book.cover.image.src));
  const { from, to, glow } = book.theme.stage;
  const coverHeight = 470;
  const coverWidth = Math.round((coverHeight * book.cover.image.width) / book.cover.image.height);
  const titleSize = chapter.title.length > 28 ? 76 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          background: `linear-gradient(140deg, ${from}, ${to})`,
          color: "#f4ecdc",
          fontFamily: "Hanken",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: 64 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: glow }}>
            {chapter.label} · {book.title}
          </div>
          <div style={{ width: 72, height: 2, background: glow, marginTop: 34 }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -2.5,
              marginTop: 30,
            }}
          >
            {chapter.title}
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.8, marginTop: 34 }}>
            {chapter.readingMinutes} min read · Free to read online
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: 26, marginTop: 48 }}>
            {siteConfig.name}
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- rendered to a PNG by next/og */}
        <img
          src={`data:image/jpeg;base64,${cover.toString("base64")}`}
          width={coverWidth}
          height={coverHeight}
          style={{ borderRadius: 6, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
        />
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
