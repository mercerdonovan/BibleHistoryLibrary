import { ImageResponse } from "next/og";

import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";
import { getAllTracts, getTract } from "@/lib/tracts";
import { padNumber } from "@/lib/utils";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Tract cover";

export async function generateStaticParams() {
  return (await getAllTracts()).map((tract) => ({ slug: tract.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tract = await getTract(slug);
  if (!tract) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <OgCard
        eyebrow={`No. ${padNumber(tract.order)} · ${tract.series.title}`}
        title={tract.title}
        footer={`${tract.questionCount} questions · ${tract.readingMinutes} min read`}
        {...tract.theme.cover}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
