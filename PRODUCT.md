# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — event participants:** athletes, sports clubs and event organizers who took part in a photographed event. They come to the site to find their event's gallery, unlock it with a password they received by email from the photographer, browse the photos and download the high-resolution files.
- **Secondary — prospective clients:** event organizers and sports teams evaluating Francesco Marcucci's work for a future collaboration or reportage. They land on the portfolio, read the testimonials and use the contact form.

## Product Purpose

A personal portfolio and client photo-delivery site for Francesco Marcucci, professional sports photographer. It presents his best shots, lists galleries of real events (public and password-protected), and lets participants find, view and download their photos. Success means event participants reach their gallery and download their photos without friction, and visitors convert into collaboration requests through the contact form.

## Positioning

Professional sports photography delivered as a self-service client flow: the same static site that presents the portfolio also functions as the delivery channel. Participants unlock and download their event photos behind a server-side password gate (bcrypt hashes, rate-limited) instead of receiving files by mail. The claim a competitor could not copy: "il momento decisivo" — the decisive moment of the race, captured and handed back to the athlete.

## Operating Context

- Site language is Italian; all copy, event names, gallery titles and UI text are in Italian.
- Galleries are added and updated by editing JSON files and pushing to GitHub: `galleries.json` holds public metadata (covers, names, dates, public photo lists), `netlify/functions/data/galleries-private.json` holds password hashes and private photo URLs (server-only). Deploy pipelines rebuild automatically.
- Passwords for private galleries are distributed personally by the photographer via email after each event.
- Photos are hosted on Cloudinary and served with query-based transforms: thumbnails `w_600,q_80`, lightbox `w_1600,q_80`, downloads `fl_attachment` (forced attachment).
- Privacy-lean analytics via Plausible; contact form submitted through Formspree.

## Capabilities and Constraints

- Plain static site: hand-written HTML, CSS and vanilla JS, no framework and no build step; content is inlined as `window.__GALLERIES_DATA` in `index.html` and mirrored in `galleries.json`.
- Home sections: hero with background photo, portfolio grid, gallery cards grouped by type (Eventi / Atlete), about, three-step "come funziona", testimonials, contact form, footer with copyright year.
- Public galleries render photo grids directly from JSON; protected galleries require a password verified server-side (`verify-gallery` Netlify Function, bcryptjs), rate-limited to 8 attempts/minute/IP; successful unlocks persist per gallery in `sessionStorage`.
- Lightbox with prev/next, keyboard navigation (arrows, Escape), click-to-zoom, filmstrip, and per-photo high-resolution download.
- Gallery cards show name, category, date, photo count and a lock indicator when protected.
- Constraints: no database and no CMS — content changes require JSON edits plus redeploy; private photo URLs are never shipped in public JSON (documented caveat: Cloudinary URLs remain technically guessable by URL discovery); no user accounts beyond per-gallery passwords; no i18n beyond Italian.
- Live galleries (confirmed at capture): "Foto Campionato Italiano Laives 2026" (public event, July 2026), "Gara Lari" (public event, June 2026), "Foto Sofia Malpensa" (protected athlete gallery, May 2026, 21 photos).

## Brand Commitments

- Name: **Francesco Marcucci** — Fotografia Sportiva (site title); "Francesco Marcucci PH" used in contact form subjects.
- Voice: Italian, discreet and precise ("racconto con discrezione e precisione"); the work is framed around the decisive moment — "Il momento decisivo".
- Identity anchor used in the favicon monogram: "FM".
- Social and contact: Instagram @francescomarcucci.photo, LinkedIn, GitHub; contact email marcuccifrancesco0@gmail.com.
- Canonical URL: https://francescomarcucci-ph.pages.dev (legacy netlify.app subdomain 301-redirects to it).

## Evidence on Hand

- Real photography on Cloudinary: portfolio set, event galleries and the hero background — referenced in `galleries.json` and the inlined `window.__GALLERIES_DATA`.
- Real, owner-confirmed events and people: "Campionato Italiano Laives 2026", "Gara Lari", athlete gallery "Foto Sofia Malpensa".
- Real, owner-confirmed testimonials: Olivia Giovanetti (cyclist, Gara Lari 2026), Team Fabiana Luperini (sports club, Lari 2026), Sofia Micchi (cyclist).
- Owner tooling committed to the repo: `scripts/hash-password.mjs` (bcrypt password hashing), `scripts/upload-cloudinary.mjs` (Cloudinary uploads), vitest test suite covering hashing, gallery verification and app utilities.
- Nothing on the site is invented; future work must not fabricate events, clients, quotes or metrics.

## Product Principles

- **The decisive moment is the product:** every image, headline and gallery exists to capture and deliver the energy of competition.
- **Participants come for their own photos:** the find → unlock → download flow must be frictionless, fast and feel secure.
- **Static simplicity:** JSON-driven galleries, no database, no build step — the owner must be able to publish a new event by editing one file and pushing to GitHub.
- **Discretion and professionalism:** the photographer's voice, tone and site behavior are understated and precise, never loud or generic.
- **Real content only:** events, names and testimonials are real and verified; they are durable assets, not placeholders.

## Accessibility & Inclusion

- The site targets WCAG AA contrast (recent work fixed muted text, placeholders and border contrast), uses semantic markup, aria labels, keyboard navigation and descriptive alt text. No additional product-specific requirement was established beyond this standard.
