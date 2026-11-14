import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { getAllBooks, getLastAdded } from "@/lib/books";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, lastAdded] = await Promise.all([getAllBooks(), getLastAdded()]);

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: lastAdded, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/books"), lastModified: lastAdded, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
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

  return [...pages, ...bookPages];
}
