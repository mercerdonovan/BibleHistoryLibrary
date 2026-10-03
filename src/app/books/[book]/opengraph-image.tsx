import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { getAllBooks, getBook } from "@/lib/books";
import { OG_SIZE, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Book cover";

export async function generateStaticParams() {
  return (await getAllBooks()).map((book) => ({ book: book.slug }));
}

export default async function Image({ params }: { params: Promise<{ book: string }> }) {
  const book = await getBook((await params).book);
  if (!book) return new Response("Not found", { status: 404 });

  const cover = await readFile(path.join(process.cwd(), "public", book.cover.image.src));
  const { from, to, glow } = book.theme.stage;
  const coverHeight = 520;
  const coverWidth = Math.round((coverHeight * book.cover.image.width) / book.cover.image.height);

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
        {/* eslint-disable-next-line jsx-a11y/alt-text -- rendered to a PNG by next/og */}
        <img
          src={`data:image/jpeg;base64,${cover.toString("base64")}`}
          width={coverWidth}
          height={coverHeight}
          style={{ borderRadius: 6, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 72, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: glow }}>
            A book to read online
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 104, lineHeight: 1, letterSpacing: -3, marginTop: 28 }}>
            {book.title}
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.8, marginTop: 30 }}>
            {book.chapters.length} chapters · {book.pageCount} pages · Free to read
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: 26, marginTop: 56 }}>
            {siteConfig.name}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
