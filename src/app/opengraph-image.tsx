import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = siteConfig.name;

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Free books to read online"
        title="Whole books, freely given."
        footer="Read · Download · Share"
        from="#1b2a52"
        to="#070c18"
        glow="#dab86e"
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
