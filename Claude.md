@AGENTS.md

# Bible History Library

Digital Christian tract and book library for Bible History Library.

The initial release is tract-first. Source tract PDFs live in `documents/tracts/` and are the canonical source of truth for tract wording. The public site is designed primarily for people arriving from QR codes on physical tracts and tract holders distributed in stores and other public locations.

The experience should combine a premium streaming-library browsing model with high-end editorial reading. Visitors should be able to discover, search, read, share, print, and download tract material easily.

## Commands

- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` · `npm run typecheck`

Keep these scripts working throughout development. Do not replace or remove existing project commands without a concrete reason.

## Stack

Next.js App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui where useful, Motion / Framer Motion, Lucide React.

Server Components by default.

Use Client Components only when required for state, effects, browser APIs, motion, search interaction, theme controls, sharing, or similar browser-side behavior.

Do not mark entire pages `"use client"` merely to support one interactive element. Isolate interactive features into client islands.

Target Vercel deployment.

## Where things live

- `documents/tracts/` contains the original tract PDFs. Treat these as canonical source documents.
- Keep tract metadata and tract content in a clear typed content layer rather than hardcoding repeated information inside components.
- Keep canonical tract wording separate from visual/display metadata.
- Reusable library, reader, navigation, search, sharing, print, motion, and theme components should live outside page files.
- Keep generic UI primitives separate from tract/domain components.
- Keep tract-specific visual configuration data-driven where practical so individual tracts can look distinctive without duplicating entire page implementations.

The initial content system should remain file-based, but structure it so a CMS such as Sanity could replace or augment the content layer later without rebuilding the front end.

Useful tract metadata may include:

- slug
- display title
- collection / series
- source PDF
- related tracts
- previous / next relationships
- visual accent/theme
- SEO metadata
- publication/order information where available

## Non-negotiables

- **Tract wording is immutable.** Text from `documents/tracts/` must remain exactly as supplied.
- Do not rewrite, paraphrase, summarize, modernize, correct spelling, correct grammar, omit text, or silently alter tract wording.
- If PDF extraction leaves any word genuinely uncertain, do not guess. Flag the exact ambiguity.
- Supporting website copy, navigation copy, summaries, and SEO descriptions must remain clearly separate from canonical tract text.
- **No crosses or religious/denominational symbols.** The site may feel explicitly Christian through content, typography, atmosphere, and language without relying on iconography.
- Do not invent quotations, historical claims, ministry facts, statistics, endorsements, or tract content.
- Do not invent Bible History Library's contact email. Keep it in one obvious configuration/content location until the real address is supplied.
- No contact form in the initial release. Physical-copy requests use a visible email address.
- Tract pages must be real web reading experiences. Do not use a plain embedded PDF as the primary reader.
- Original PDFs should remain downloadable when available.
- No lorem ipsum inside tract content.
- Do not bury tract discovery beneath marketing copy.
- Reading usability takes priority over visual effects.

## Primary routes

### Home

Premium library landing experience with:

- hero
- featured tracts
- series / collections
- newest additions
- prominent library browsing

It should feel cinematic and highly designed without becoming a generic ministry homepage.

### Library

Primary discovery interface.

Support:

- tract browsing
- series / collections
- search
- clear hierarchy
- strong mobile behavior
- visually distinctive tract cards

### Tract pages

Each tract gets a custom long-form editorial reading experience.

Include:

- complete canonical tract text
- tract-specific visual treatment
- reading progress
- Share
- Print
- original PDF download when available
- related tracts
- previous / next navigation

Individual tract pages should feel authored for their material rather than like the same blog template with different text pasted into it.

### Search

Provide a useful dedicated search experience where appropriate.

Visitors should be able to find content without already understanding the collection structure.

### About

Explain Bible History Library clearly and concisely.

### Contact / Order Copies

Show the ministry contact email for requests involving additional physical tracts or books.

No contact form.

### Books

Books are planned but secondary during the tract-first release.

The Books route should look intentional and integrated rather than like an unfinished error page.

## Design system

The visual identity combines:

- premium streaming-library discovery
- modern digital archive
- high-end editorial publishing
- scholarly credibility
- cinematic polish
- devotional warmth

Avoid generic SaaS styling.

### Core palette

Main library/site colors:

- deep navy
- cream
- burgundy
- restrained gold

Define proper design tokens rather than scattering raw colors through components.

Both light and dark themes must be intentionally designed.

Individual tracts or collections may introduce their own restrained accent palettes while remaining visibly part of the same system.

### Type

Use:

- elegant editorial serif for major headings/display moments
- highly readable clean sans-serif for body/UI support

Do not default to Inter simply because it is available.

Reading typography matters significantly. Control:

- line length
- line height
- paragraph rhythm
- heading spacing
- quotation treatment
- mobile text sizing

### Surfaces

Medium-radius corners.

Polished and contemporary, but not excessively rounded or pill-heavy.

Use intentional:

- hierarchy
- empty space
- borders
- depth
- texture
- controlled lighting/glow
- hover/focus/active states

Avoid:

- church bulletin aesthetics
- cheesy Christian graphics
- crosses
- denominational symbolism
- childish visuals
- corporate blandness
- visual clutter
- generic blue-on-white SaaS layouts
- endless identical rounded-card grids
- stock-photo-dependent design

Until real covers and custom artwork exist, build the visual identity primarily from typography, layout, color, shapes, and tasteful graphic treatments.

## Tract cards

Treat tracts as physical published objects rather than generic content cards.

The visual language may suggest the proportions of a folded physical tract: taller vertical rectangles rather than ordinary landscape thumbnails.

Temporary text-based covers are acceptable until custom tract covers are supplied.

Cards can vary by tract/collection while maintaining consistent interaction and information hierarchy.

## Motion

Motion should be expressive, cinematic, and ambitious.

Library and homepage interactions may include:

- lift on hover
- subtle scale
- animated border/glow
- staggered reveals
- collection transitions
- horizontal browsing
- parallax
- layered transitions
- other purposeful premium interactions

Tract pages may use:

- scroll-driven reveals
- animated pull quotes
- section transitions
- reading-progress behavior
- layered typography
- subtle graphic movement
- other editorial motion

Advanced treatments such as WebGL, 3D, or video are allowed when they genuinely improve the experience.

Do not add them merely to demonstrate technical complexity.

**Reading always wins.**

No motion may interfere with:

- text legibility
- scrolling
- text selection
- comprehension
- keyboard navigation
- accessibility

Prefer transform and opacity where practical. Avoid unnecessary layout thrashing.

Everything must respect `prefers-reduced-motion`.

## Print

Tract pages need deliberate print styling.

Printed output should:

- remove site navigation
- remove interactive controls
- remove unnecessary decorative effects
- disable animation
- preserve the complete tract text exactly
- use strong readable typography
- use sensible page breaks
- avoid wasting ink
- remain visually organized

Do not simply print the normal screen layout.

## Share

Use the Web Share API where supported.

Provide a useful fallback such as copying the canonical tract URL.

Sharing should feel like a first-class feature because many visitors may arrive from physical tracts and then forward the material digitally.

## SEO

Implement production SEO from the beginning.

Include:

- page metadata
- per-tract metadata
- canonical URLs
- Open Graph
- social metadata
- sitemap
- robots
- appropriate structured data

SEO summaries are supporting website copy. They must never replace or modify canonical tract wording.

Build social previews that still look intentional before custom tract covers exist.

## Accessibility

Accessibility is part of the design system.

Maintain:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- correct heading hierarchy
- accessible buttons/controls
- screen-reader labels
- accessible theme toggle
- reduced-motion behavior

Do not trade accessibility for cinematic effects.

## Responsive behavior

Design mobile-first.

A major use case is someone scanning a QR code and opening the site immediately on a phone.

Prioritize:

- fast orientation
- clear tract discovery
- excellent reading typography
- comfortable tap targets
- search
- sharing
- PDF access
- print access
- collection navigation

Do not treat mobile as the desktop layout stacked into one column.

Desktop can be more visually ambitious, but mobile must remain a first-class experience.

## Code quality

Keep the codebase:

- strictly typed
- reusable
- organized
- data-driven where appropriate
- easy to extend
- free of unnecessary dependencies

Prefer reusable primitives and domain components over duplicated markup.

Do not leave:

- starter content
- demo components
- unused dependencies
- dead code
- temporary test UI
- console errors

Do not over-abstract simple components, but avoid putting an entire complex page into one file.

## Content tone

New supporting website copy should be:

- clear
- reverent
- confident
- accessible
- non-corporate

Avoid:

- archaic imitation
- sales-heavy ministry language
- generic marketing filler
- exaggerated claims

Interface copy should stay concise.

## Working rules

Before changing architecture, inspect the existing project and `documents/tracts/`.

Do not invent missing project facts.

Ask only when a missing fact genuinely blocks correct implementation, especially:

- ambiguous PDF wording
- exact contact information
- credentials
- exact external URLs
- required missing assets
- external integrations

For ordinary design and engineering decisions, make a strong implementation decision and continue.

Do not spend output tokens explaining obvious coding decisions. Implement them.

The finished product should feel authored and art-directed, not generated from a generic website template.

## Before calling work complete

Verify:

- tract wording matches source PDFs exactly
- all tract routes work
- library browsing works
- search works
- sharing works
- print output is clean
- PDF downloads work where available
- previous/next navigation works
- related tract links work
- light and dark themes work
- mobile QR-entry experience works well
- keyboard navigation works
- reduced-motion mode works
- metadata is valid
- sitemap and robots exist
- no broken links
- no console errors
- no leftover demo content
- `npm run build` succeeds
- `npm run typecheck` succeeds