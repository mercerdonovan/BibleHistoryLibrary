import Link from "next/link";

import { SHARING_NOTICE_TITLE } from "@/components/sharing-notice";
import { siteConfig } from "@/config/site";
import { getTractsBySeries } from "@/lib/tracts";

export async function SiteFooter() {
  const groups = await getTractsBySeries();

  return (
    <footer data-site-footer className="grain mt-28 bg-stage text-stage-ink">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <p className="display text-[2.2rem] leading-[1.02] sm:text-[2.8rem]">
              Bible History <span className="italic text-stage-muted">Library</span>
            </p>
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-stage-muted">
              {siteConfig.description}
            </p>
            <p className="mt-8 text-sm text-stage-muted">
              Printed copies:{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="link-underline font-medium text-stage-ink"
              >
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {groups.map(({ series, tracts }) => (
              <div key={series.id}>
                <h2 className="eyebrow text-[0.66rem] text-[#dab86e]">{series.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {tracts.map((tract) => (
                    <li key={tract.slug}>
                      <Link
                        href={tract.href}
                        className="link-underline text-[0.92rem] text-stage-muted transition-colors hover:text-stage-ink"
                      >
                        {tract.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="eyebrow text-[0.66rem] text-[#dab86e]">The Library</h2>
              <ul className="mt-4 space-y-2.5">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline text-[0.92rem] text-stage-muted transition-colors hover:text-stage-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-stage-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p>
            <Link href="/about#sharing" className="link-underline hover:text-stage-ink">
              {SHARING_NOTICE_TITLE}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
