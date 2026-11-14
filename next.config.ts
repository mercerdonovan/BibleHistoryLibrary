import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Book text is read from disk at build time; make sure it ships with any
  // route that is rendered on demand.
  outputFileTracingIncludes: {
    "/": ["./content/books/**/*.json"],
    "/books": ["./content/books/**/*.json"],
    "/search-index.json": ["./content/books/**/*.json"],
    "/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/books/[book]": ["./content/books/**/*.json"],
    "/books/[book]/read": ["./content/books/**/*.json"],
    "/books/[book]/read/[chapter]": ["./content/books/**/*.json"],
    "/books/[book]/opengraph-image": ["./src/assets/fonts/*.ttf", "./content/books/**/*.json", "./public/book-assets/*/cover.jpg"],
    "/books/[book]/read/[chapter]/opengraph-image": [
      "./src/assets/fonts/*.ttf",
      "./content/books/**/*.json",
      "./public/book-assets/*/cover.jpg",
    ],
  },
  async redirects() {
    // The library page now lives at /books.
    return [{ source: "/library", destination: "/books", permanent: true }];
  },
};

export default nextConfig;
