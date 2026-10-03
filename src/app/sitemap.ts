import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { getAllBooks } from "@/lib/books";
import { getAllTracts } from "@/lib/tracts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tracts, books] = await Promise.all([getAllTracts(), getAllBooks()]);
  const newest = tracts.reduce((latest, tract) => (tract.addedAt > latest ? tract.addedAt : latest), "");

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/library"), lastModified: newest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/books"), changeFrequency: "monthly", priority: 0.7 },
  ];

  const bookPages: MetadataRoute.Sitemap = books.flatMap((book) => [
    { url: absoluteUrl(book.href), lastModified: book.addedAt, changeFrequency: "yearly" as const, priority: 0.9 },
    { url: absoluteUrl(book.readHref), lastModified: book.addedAt, changeFrequency: "yearly" as const, priority: 0.7 },
    ...book.chapters.map((chapter) => ({
      url: absoluteUrl(chapter.href),
      lastModified: book.addedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ]);

  return [
    ...pages,
    ...bookPages,
    ...tracts.map((tract) => ({
      url: absoluteUrl(tract.href),
      lastModified: tract.addedAt,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
