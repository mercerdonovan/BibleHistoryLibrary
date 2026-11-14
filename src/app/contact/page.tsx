import { Mail } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { buttonClasses } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Order copies",
  description: "Request printed copies of books from the Bible History Library by email.",
  path: "/contact",
});

const STEPS = [
  { title: "Which books", text: "Tell us the titles you would like." },
  { title: "How many", text: "One copy for yourself or several to give away — say what you need." },
  { title: "Where to send them", text: "Include a postal address so we know where they are going." },
];

export default function ContactPage() {
  const { contactEmail } = siteConfig;
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent("Printed books request")}`;

  return (
    <>
      <PageIntro eyebrow="Contact" title="Order printed copies.">
        <p>
          Would you like a book to keep, to give away, or to read with others? Write to us and we
          will be glad to help.
        </p>
      </PageIntro>

      <div className="container-page pt-12 sm:pt-16">
        <Reveal className="grain overflow-hidden rounded-xl bg-navy p-8 text-stage-ink sm:p-12 lg:p-16">
          <p className="eyebrow text-[#dab86e]">Email</p>
          <a
            href={mailto}
            className="display link-underline mt-5 inline-block break-all text-[clamp(1.7rem,6vw,4.2rem)] leading-[1.05]"
          >
            {contactEmail}
          </a>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={mailto} className={buttonClasses("stageSolid")}>
              <Mail aria-hidden="true" />
              Write an email
            </a>
            <CopyButton value={contactEmail} label="Copy address" />
          </div>
        </Reveal>

        <section aria-labelledby="include-title" className="grid gap-10 pt-16 sm:pt-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-gold">In your message</p>
            <h2 id="include-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              What to include
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="border-t border-line-strong">
            {STEPS.map((step, index) => (
              <RevealItem as="li" key={step.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-6 sm:grid-cols-[4rem_1fr_1.4fr] sm:items-baseline">
                <span className="font-display text-sm tabular-nums text-gold">0{index + 1}</span>
                <h3 className="display text-[1.6rem]">{step.title}</h3>
                <p className="col-start-2 mt-1 text-[0.98rem] leading-relaxed text-ink-muted sm:col-start-3 sm:mt-0">
                  {step.text}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </div>
    </>
  );
}
