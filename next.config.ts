import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The tract bodies are read from disk at build time; make sure they ship
  // with any route that is rendered on demand.
  outputFileTracingIncludes: {
    "/tracts/[slug]": ["./content/tracts/*.json"],
    "/search-index.json": ["./content/tracts/*.json"],
    "/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/tracts/[slug]/opengraph-image": ["./src/assets/fonts/*.ttf", "./content/tracts/*.json"],
  },
};

export default nextConfig;
