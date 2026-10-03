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
        eyebrow="A free library of Bible studies"
        title="Ask the question. Read the verse."
        footer="Read · Share · Print"
        from="#1b2a52"
        to="#070c18"
        glow="#dab86e"
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
