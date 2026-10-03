# Bible History Library

A public digital library for Bible study tracts: browse, read, share, print and download.

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Motion · deployed on Vercel.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (every page is static)
pnpm lint && pnpm typecheck
```

## Before launch

Set these (see `.env.example`) in Vercel → Project → Environment Variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin, used for canonical URLs, share links, sitemap and Open Graph. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown on **Order copies**, the footer and the Books page. |

Until they are set, the site falls back to `contact@example.com` and the Vercel
production URL. Both fallbacks live in `src/config/site.ts`.

## Content model

Two layers, kept apart on purpose:

| Layer | Where | Edited by |
| --- | --- | --- |
| **Canonical tract text** | `content/tracts/<slug>.json` | Generated from the PDF. Never by hand. |
| **Presentation metadata** | `src/content/tracts.ts`, `src/content/series.ts` | You: display title, series, colours, cover motif, SEO description. |

`src/lib/tracts.ts` is the only module that knows the content is file-based.
Moving to a CMS such as Sanity means re-implementing those functions; no
component changes.

### Adding or updating a tract

1. Put the PDF in `Doccuments/Tracts/` named `NN-slug.pdf` (`NN` sets the reading order).
2. Extract and verify:

   ```bash
   python3 -m venv .venv && .venv/bin/pip install pymupdf
   .venv/bin/python scripts/extract_tracts.py
   .venv/bin/python scripts/verify_tracts.py
   ```

3. Add an entry for the slug in `src/content/tracts.ts`.

`extract_tracts.py` rejoins wrapped lines, records bold / italic / underline
emphasis, and classifies each paragraph (heading, question, scripture, note).
It does not change wording. `verify_tracts.py` re-reads each PDF through an
independent path and fails if any character or word boundary differs.

The extractor also copies each PDF to `public/pdfs/<slug>.pdf` for the
download button.

## Where things live

```
content/tracts/          canonical tract text (generated)
scripts/                 PDF extraction + verification
src/app/                 routes, metadata, sitemap, robots, share images
src/config/site.ts       site name, URL, contact email, navigation
src/content/             series + per-tract presentation metadata
src/lib/                 data access, search, SEO helpers, types
src/components/
  layout/                header, footer, navigation, theme
  tract/                 covers, cards, rails, index list
  reader/                tract body, progress, section nav, share/print/PDF
  library/ search/       browsing and full-text search
  motion/                reveal primitives
src/app/globals.css      design tokens, reading typography, print styles
```

## Design notes

- **Type:** Fraunces (display), Newsreader (reading), Hanken Grotesk (interface).
- **Colour:** navy, cream, burgundy and gold tokens for light and dark, defined
  at the top of `globals.css`. Each tract adds its own accent and cover wash in
  `src/content/tracts.ts`.
- **Covers** are typographic with an abstract generated motif
  (`src/components/tract/cover-motif.tsx`) until artwork exists.
- **Motion** uses transforms and opacity only. Reading-page effects are
  scroll-driven CSS behind `@supports` and `prefers-reduced-motion`, so text is
  never hidden or delayed.
- **Print** styles strip the interface and set the tract in plain black type.
