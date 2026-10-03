import { ArrowRight, Download, Printer, Share2 } from "lucide-react";
import Link from "next/link";

import { HeroFade, HeroHeadline } from "@/components/home/hero-copy";
import { HeroStage } from "@/components/home/hero-stage";
import { Reveal } from "@/components/motion/reveal";
import { TractCard, TractMetaLine, tractAccentStyle } from "@/components/tract/tract-card";
import { TractCover } from "@/components/tract/tract-cover";
import { TractIndexList } from "@/components/tract/tract-index-list";
import { TractRail } from "@/components/tract/tract-rail";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getAllTracts, getFeaturedTracts, getNewestTracts, getTractsBySeries } from "@/lib/tracts";
import { padNumber } from "@/lib/utils";

export default async function HomePage() {
  const [tracts, featured, newest, groups] = await Promise.all([
    getAllTracts(),
    getFeaturedTracts(),
    getNewestTracts(5),
    getTractsBySeries(),
  ]);

  const first = tracts[0];
  const [lead, ...restFeatured] = featured;
  const totalQuestions = tracts.reduce((total, tract) => total + tract.questionCount, 0);
  if (!first || !lead) return null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="atmosphere grain relative overflow-hidden border-b border-line">
        <div className="container-page grid items-center gap-10 pb-14 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <HeroFade>
              <p className="eyebrow text-gold">A free library of Bible studies</p>
            </HeroFade>
            <div className="mt-5">
              <HeroHeadline id="hero-title" lines={["Ask the question.", "Read the verse."]} />
            </div>
            <HeroFade delay={0.5}>
              <p className="mt-6 max-w-[34rem] text-[1.08rem] leading-relaxed text-ink-soft sm:text-[1.18rem]">
                {tracts.length} short studies, each built from plain questions and the Bible passages
                that answer them. Read them here, pass them on, or print them at home.
              </p>
            </HeroFade>
            <HeroFade delay={0.65} className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/library">
                Browse the library <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href={first.href} variant="outline">
                Start with {first.title}
              </ButtonLink>
            </HeroFade>
            <HeroFade delay={0.8}>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line-strong pt-5">
                {[
                  { value: tracts.length, label: "tracts" },
                  { value: totalQuestions, label: "questions answered" },
                  { value: "Free", label: "to read & print" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-1 text-[0.78rem] leading-snug text-ink-muted">{stat.label}</dt>
                    <dd className="display text-[2rem] tabular-nums text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </HeroFade>
          </div>

          <HeroStage tracts={[tracts[3] ?? first, first, tracts[7] ?? first]} />
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="featured-title" className="container-page pt-20 sm:pt-28">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">Start here</p>
            <h2 id="featured-title" className="display mt-3 text-[2.3rem] sm:text-[3.4rem]">
              Featured tracts
            </h2>
          </div>
          <Link href="/library" className="link-underline hidden pb-1 text-sm font-semibold text-ink sm:inline-block">
            See all {tracts.length}
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
          <Reveal>
            <Link
              href={lead.href}
              style={{
                ...tractAccentStyle(lead),
                background: `radial-gradient(90% 120% at 100% 0%, ${lead.theme.cover.glow}33, transparent 60%), linear-gradient(140deg, ${lead.theme.cover.from}, ${lead.theme.cover.to})`,
              }}
              className="tract-card grain group relative grid h-full overflow-hidden rounded-xl text-stage-ink shadow-card sm:grid-cols-[1fr_0.8fr]"
            >
              <div className="flex flex-col justify-between gap-10 p-7 sm:p-10">
                <p className="eyebrow text-white/70">
                  No. {padNumber(lead.order)} · {lead.series.title}
                </p>
                <div>
                  <h3 className="display text-[2.6rem] leading-[0.98] sm:text-[3.6rem]">{lead.title}</h3>
                  <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-white/80">{lead.description}</p>
                  <p className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">
                    Read the tract
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
                  </p>
                </div>
              </div>
              <div className="relative hidden items-center justify-center p-8 sm:flex">
                <TractCover tract={lead} className="w-full max-w-[15rem] rotate-3 shadow-lift transition-transform duration-700 ease-out-expo group-hover:rotate-0" />
              </div>
            </Link>
          </Reveal>

          <ul className="grid content-start gap-4">
            {restFeatured.slice(0, 3).map((tract, index) => (
              <Reveal as="li" key={tract.slug} delay={0.08 * (index + 1)}>
                <Link
                  href={tract.href}
                  style={tractAccentStyle(tract)}
                  className="accent-scope group flex items-center gap-5 rounded-lg border border-line bg-raised p-3 pr-5 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-accent/60 hover:shadow-lift"
                >
                  <TractCover tract={tract} size="sm" className="w-24 shrink-0 rounded-md sm:w-28" />
                  <div className="min-w-0">
                    <p className="eyebrow text-[0.62rem] text-accent">{tract.series.title}</p>
                    <h3 className="display mt-1.5 text-[1.45rem] leading-[1.08] text-ink sm:text-[1.6rem]">{tract.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{tract.description}</p>
                    <TractMetaLine tract={tract} className="mt-2" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Series shelves ───────────────────────────────────────────────── */}
      <section aria-labelledby="series-title" className="pt-24 sm:pt-32">
        <Reveal className="container-page">
          <p className="eyebrow text-gold">Collections</p>
          <h2 id="series-title" className="display mt-3 max-w-2xl text-[2.3rem] sm:text-[3.4rem]">
            Browse by series
          </h2>
        </Reveal>

        <div className="mt-8 space-y-6">
          {groups.map(({ series, tracts: seriesTracts }, index) => (
            <Reveal as="section" key={series.id} className="border-t border-line pt-8 first:border-t-0">
              <div className="container-page flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-sm tabular-nums text-ink-muted">{padNumber(index + 1)}</span>
                  <h3 className="display text-[1.7rem] sm:text-[2.1rem]">{series.title}</h3>
                </div>
                <p className="max-w-md text-[0.95rem] text-ink-muted">{series.description}</p>
              </div>
              <TractRail label={`${series.title} tracts`}>
                {seriesTracts.map((tract) => (
                  <li key={tract.slug} className="w-[62vw] max-w-[15.5rem] sm:w-[15.5rem]">
                    <TractCard tract={tract} headingLevel="h4" />
                  </li>
                ))}
                <li className="w-[62vw] max-w-[15.5rem] sm:w-[15.5rem]">
                  <Link
                    href={`/library#${series.id}`}
                    className="group flex aspect-[3/4] flex-col justify-between rounded-lg border border-dashed border-line-strong p-5 text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    <span className="eyebrow text-[0.62rem]">{series.title}</span>
                    <span className="display text-[1.5rem] leading-tight">
                      View the series
                      <ArrowRight aria-hidden="true" className="mt-3 block size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
                    </span>
                  </Link>
                </li>
              </TractRail>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Newest ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="newest-title" className="container-page pt-20 sm:pt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-gold">Recently added</p>
            <h2 id="newest-title" className="display mt-3 text-[2.3rem] sm:text-[3.4rem]">
              Newest additions
            </h2>
            <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-ink-muted">
              The library grows as new tracts are printed. The latest are listed here first.
            </p>
            <ButtonLink href="/library" variant="outline" className="mt-7">
              Open the full library <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </Reveal>
          <TractIndexList tracts={newest} />
        </div>
      </section>

      {/* ── How it works / order copies ──────────────────────────────────── */}
      <section aria-labelledby="use-title" className="container-page pt-24 sm:pt-32">
        <Reveal className="grain overflow-hidden rounded-xl bg-navy text-stage-ink">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:p-16">
            <div>
              <p className="eyebrow text-[#dab86e]">Take it with you</p>
              <h2 id="use-title" className="display mt-4 text-[2.3rem] sm:text-[3.2rem]">
                Every tract is yours to read, share and print.
              </h2>
              <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-stage-muted">
                Picked one up from a display and want more? Printed copies are available on request.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="stageSolid">
                  Order printed copies
                </ButtonLink>
                <a href={`mailto:${siteConfig.contactEmail}`} className="link-underline self-center text-sm font-semibold">
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>
            <ul className="grid content-center gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
              {[
                { icon: Share2, title: "Share", text: "Send any tract to a friend with one tap." },
                { icon: Printer, title: "Print", text: "Clean, ink-friendly pages straight from your browser." },
                { icon: Download, title: "Download", text: "Keep the original printed tract as a PDF." },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4 bg-navy p-5">
                  <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#dab86e]" />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-stage-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  );
}
