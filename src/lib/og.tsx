import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { siteConfig } from "@/config/site";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(path.join(process.cwd(), "src", "assets", "fonts", file));

export async function ogFonts() {
  const [display, displayBold, sans] = await Promise.all([
    font("fraunces-400.ttf"),
    font("fraunces-600.ttf"),
    font("hanken-grotesk-500.ttf"),
  ]);
  return [
    { name: "Fraunces", data: display, weight: 400 as const, style: "normal" as const },
    { name: "Fraunces", data: displayBold, weight: 600 as const, style: "normal" as const },
    { name: "Hanken", data: sans, weight: 500 as const, style: "normal" as const },
  ];
}

interface OgCardProps {
  eyebrow: string;
  title: string;
  footer: string;
  from: string;
  to: string;
  glow: string;
}

/** Shared social card: a typographic "cover" used until artwork exists. */
export function OgCard({ eyebrow, title, footer, from, to, glow }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `linear-gradient(140deg, ${from}, ${to})`,
        color: "#f4ecdc",
        fontFamily: "Hanken",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            right: -220 + ring * -46,
            top: -260 + ring * -46,
            width: 620 + ring * 92,
            height: 620 + ring * 92,
            borderRadius: 9999,
            border: `1px solid ${glow}`,
            opacity: 0.5 - ring * 0.06,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 28, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 18 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "76px 84px", width: "100%" }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: glow }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 72, height: 2, background: glow, marginBottom: 34 }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: title.length > 22 ? 96 : 118,
              lineHeight: 1,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600 }}>{siteConfig.name}</div>
          <div style={{ display: "flex", opacity: 0.75 }}>{footer}</div>
        </div>
      </div>
    </div>
  );
}
