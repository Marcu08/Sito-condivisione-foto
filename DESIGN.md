---
name: Francesco Marcucci — Fotografia Sportiva
description: Dark cinematic sports-photography portfolio with aged-gold accents and editorial serif typography.
colors:
  carbonio: "#0a0a0a"
  superficie: "#131313"
  carbonio-media: "#1a1a1a"
  carbonio-scura: "#151515"
  avorio: "#f0ede8"
  polvere: "#8a8884"
  oro-invecchiato: "#c8a96e"
  errore: "#e06060"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(48px, 7vw, 90px)"
    fontWeight: 300
    lineHeight: 0.95
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(30px, 4vw, 44px)"
    fontWeight: 300
    lineHeight: 1.15
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "24px"
    fontWeight: 300
    lineHeight: 1.2
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "13px"
    fontWeight: 300
    lineHeight: 1.8
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  sm: "3px"
  md: "4px"
  lg: "6px"
  full: "50%"
spacing:
  "2xs": "2px"
  xs: "3px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "40px"
  "3xl": "80px"
components:
  button-primary:
    backgroundColor: "{colors.oro-invecchiato}"
    textColor: "{colors.carbonio}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "13px 28px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.avorio}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "13px 26px"
  input-field:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.avorio}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "13px 15px"
  card-gallery:
    backgroundColor: "{colors.carbonio-media}"
    rounded: "0px"
  thumb-photo:
    backgroundColor: "{colors.carbonio-scura}"
    rounded: "0px"
---

# Design System: Francesco Marcucci — Fotografia Sportiva

## Overview

**Creative North Star: "Il Momento Decisivo"**

The site is a dark theater built for a single kind of moment: the instant a photograph goes from dimmed and dormant to fully alive. The whole system is organized around the reveal. Photographs sit slightly desaturated and under-brightness at rest — present but withheld — and the hover is the shutter release that lights them to full color and slight scale. Nothing competes with the images because everything else has already agreed to be quiet.

The material world is a stage at night: a near-black carbon base, surfaces one step off black, and one aged-gold accent used sparingly like a floodlight that touches only the essential. Structure is drawn with 1px hairlines and sharp corners, never shadows. Editorial typography does the emotional work — a thin, wide, italic-capable display serif (Cormorant Garamond) for the big statements, a light grotesque (Outfit) for the working text. Density is restrained, spacing generous, and the mood is discreet and precise: the photographer's voice, made visible.

Depth is tonal and optical rather than physical. There are no box shadows anywhere. Layering comes from gradient scrims over photography, from backdrop blur on floating bars, and from the brightness/saturation filters that separate the image from its frame. Every overlay panel — gallery screen, lightbox, password modal — fades in as a full-screen layer, keeping the theater dark.

**Key Characteristics:**

- Photographs are the product: dimmed at rest, revealed on hover, never framed by shadows.
- One accent hue (aged gold) on a carbon base, spent in small doses: labels, numerals, italic accents, focus rings, solid submit buttons.
- Editorial pairing: Cormorant Garamond (thin serif display) over Outfit (light grotesque body).
- Sharp, hairline-bordered geometry; radius only where the hand must touch.
- Contact-sheet photo grids (2–3px gaps) contrasted with generous content-section spacing.
- Depth without shadows: gradient scrims, backdrop blur, image filters, full-screen fade-ins.

## Colors

A two-player palette — aged gold against carbon — with warm off-white text and a warm gray for the quiet register. The palette is warm-on-dark, never cool.

### Primary

- **Oro Invecchiato** (#c8a96e): the only accent. Spent on eyebrows and section labels, the italic word in the logo and hero, step numerals, card categories, focus outlines, and the two solid submit buttons (password modal, contact form). Gold is the voice of "decisive"; it never fills a surface larger than a button.

### Neutral

- **Carbonio** (#0a0a0a): page background, header/footer base, lightbox and gallery-screen background. The theater floor.
- **Superficie** (#131313): one step up — modal panel, testimonial cards, the `--surface` token.
- **Carbonio Media** (#1a1a1a): gallery card background while the cover loads.
- **Carbonio Scura** (#151515): photo thumbnail background while the image loads.
- **Avorio** (#f0ede8): primary text and headings — warm off-white, never pure white.
- **Polvere** (#8a8884): secondary text, nav links, counters, meta lines.
- **Bordo** (rgba(255, 255, 255, 0.12)): the hairline used for every border and divider. Not a token in code, but a de-facto one.

### Utility

- **Errore** (#e06060): password error message and error states only.
- **Placeholder** (#7a7875): input placeholder text (adjusted from Polvere for WCAG AA on the 4%-white field).

### Named Rules

**The Gold Rarity Rule.** Oro Invecchiato is used on ≤10% of any given screen. Its rarity is the point — an accent that appears everywhere reads as decoration, and this system is not decorative.

**The One Hue Rule.** Gold is the only hue in the system. Any second accent color is an error; even errors are desaturated.

**The No-Shadow Rule.** No element casts a box shadow. Depth is carried by gradient scrims, backdrop blur, and image filters — never by an artificial light source.

## Typography

**Display Font:** Cormorant Garamond (Georgia, serif fallback)
**Body Font:** Outfit (sans-serif)
**Label/Mono Font:** Outfit, same family as body

**Character:** A thin, slightly tall, high-contrast editorial serif for the statements, paired with a light geometric grotesque for the working text. Cormorant at weight 300 is the voice of the decisive moment — quiet, elegant, and slightly theatrical in its italic. Outfit at weight 300 keeps everything else light and airy; weight 500 appears only on small solid buttons.

### Hierarchy

- **Display** (300, clamp(48px, 7vw, 90px), 0.95): hero title only — "Il momento *decisivo*". The italic accent word takes Oro Invecchiato. Tight line-height; single dominant statement per page.
- **Headline** (300, clamp(30px, 4vw, 44px), 1.15): section titles ("I miei scatti migliori", "Gallerie"). Cormorant, weight 300.
- **Title** (300, 20–26px, 1.2): gallery card names (24px), modal titles (26px), step titles (20px). Cormorant.
- **Body** (300, 13–15px, 1.8): paragraphs, section descriptions, step text. Outfit, muted (Polvere) when supporting content. Body copy is capped near 52ch.
- **Label** (500, 10–11px, 0.14–0.2em, uppercase): eyebrows, nav links, buttons, card categories, testimonial roles, contact labels. The letterspaced uppercase register is the system's punctuation.

### Named Rules

**The Thin Serif Rule.** Display type is always Cormorant Garamond at weight 300. Italic is reserved for a single accent word in a statement ("*decisivo*", "*Marcucci*") and takes Oro Invecchiato.

**The Editorial Label Rule.** Every label, nav item and button is uppercase at 10–11px with 0.14–0.2em letterspacing. Outfit at weight 300–500. Never lowercase, never larger than 11px, never sentence case.

**The One Face Pairing Rule.** Cormorant for display and titles; Outfit for everything else. No third family.

## Layout

The page is containerless and full-bleed: sections run edge to edge with generous padding (80px vertical, 40px horizontal on desktop; 56px / 18px under 700px). There is no central column — text blocks carry their own max-widths (about 52ch for descriptions, 560px for the contact form), which is what keeps wide screens feeling editorial rather than stretched.

Two opposing rhythms define the system. **Photo grids** — portfolio, gallery screens — run as near-touching contact sheets: 3 columns with 2–3px gaps on desktop, collapsing to 2 columns under 900px and staying at 2 tight columns under 500px. The wall of photographs reads as one continuous surface. **Content grids** — gallery cards, steps, testimonials — run spacious: auto-fill columns at 320px minimum with 2px gaps for cards, 40px for steps, and collapse to single columns under 700px. Gallery cards hold a fixed 4/3 aspect (4/3.2 on mobile).

Vertical rhythm: sections pad 80px top and bottom; within a section, label → title → description → content, with 12px between label and title and 36px between description and content.

## Elevation & Depth

Flat by declaration. No box shadows exist anywhere in the system, and none should be added. Depth is produced optically:

- **Gradient scrims** — the hero's radial gold glow plus a bottom-up darkening gradient; the gallery card's bottom-up black gradient carrying the title block; the lightbox's pure-black field.
- **Backdrop blur** — floating bars (sticky header, gallery header, back-to-top, password modal backdrop, lightbox filmstrip) sit on 4–10px blur over whatever passes beneath, which is how layers separate on a shadowless system.
- **Image filters** — the reveal metaphor: photos sit at brightness 0.72–0.92 with reduced saturation and bloom to full on hover. This is the system's signature depth move.
- **Full-screen fade-ins** — gallery screen, lightbox and modal all fade (0.25–0.35s) over the scene, keeping the theater dark.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. The illusion of height comes only from scrims, blur and image state — never from a drop shadow.

## Shapes

A "sharp where it frames, gentle where the hand touches" geometry. Photographs and their frames are cornerless: gallery cards and photo thumbs have radius 0 on desktop, and only mobile gallery cards earn a 6px radius to soften the touch surface. Controls — buttons, inputs, the menu toggle, the lock badge — use a 4px workhorse radius. Micro-elements (nav link hovers, filmstrip thumbs) use 3px. The two large link cards use 6px. Floating controls (back-to-top, lightbox prev/next/close) are circles.

All structure is drawn with a 1px hairline in Bordo (rgba(255,255,255,0.12)). Borders are the system's only outline; there is no fill-against-fill contrast except the carbon ladder (background → surface → card).

### Named Rules

**The Sharp Frame Rule.** Photographs are never rounded on desktop. A corner on a photo frame breaks the cinematic window; radius is reserved for controls.

## Components

### Buttons
- **Shape:** 4px radius, uppercase label typography (11px, 0.14em, weight 500), 13–14px vertical padding.
- **Primary (solid gold):** Oro Invecchiato background, Carbonio text. Used exactly twice: the password modal's "Entra nella galleria" and the contact form's "Invia richiesta". Hover: opacity drops to 0.85. Disabled: opacity 0.6.
- **Outline (ghost):** transparent background, 1px Bordo border, Avorio text. Hero's "Guarda i miei scatti". Hover: gold-tinted fill (rgba(200,169,110,0.1)), border and text shift to Oro Invecchiato. 0.25s ease transition.
- **Focus:** 2px Oro Invecchiato outline with 2px offset on all interactive elements.

### Cards / Containers
- **Gallery card:** 4/3 aspect, radius 0 (6px on mobile), background Carbonio Media while loading. Cover image dimmed at rest (brightness 0.72, saturate 0.88); on hover it scales 1.05 over 0.6s with an ease-out zoom curve and blooms to brightness 0.88. Information lives in a bottom-up black gradient scrim: category (uppercase 10px, gold), name (Cormorant 24px), meta row (11px, Polvere). Optional lock badge, top-right: 30px, 4px radius, hairline border, black 45% fill, 4px blur. Hover is the entire interaction — there is no border or background change.
- **Photo thumb (portfolio/gallery grids):** radius 0, 3/2 aspect (auto height inside gallery screens), Carbonio Scura background. Same dimmed-at-rest / bloom-on-hover behavior, plus a centered magnifier icon that pops in on hover with a spring curve. Gallery-screen thumbs use `object-fit: contain` so vertical photos are never cropped.

### Inputs / Fields
- **Style:** 4px radius, background rgba(255,255,255,0.04), 1px Bordo border, 13px 15px padding, Outfit 13–15px weight 300, placeholder in #7a7875.
- **Focus:** border shifts to Oro Invecchiato. No glow, no ring.
- **Error:** Errore (#e06060) text below the field; the field itself does not turn red.

### Navigation
- **Desktop:** inline links, uppercase 11px / 0.14em, Polvere; hover shifts to Avorio. Active state is implicit (section visible), not styled.
- **Mobile (≤700px):** a fixed full-width dropdown panel under the 68px header — dark 98% carbon, hairline bottom border, links stacked at 12px uppercase with generous touch padding (12px 8px) and a subtle white 4% hover fill. Toggled by a 40px square menu button (4px radius, hairline border).

### Password Modal
- Surface (Superficie) panel, 1px Bordo border, 44px padding, 420px max-width, centered over a blurred black scrim (rgba(0,0,0,0.82) + 10px blur).
- Stack: close × (top-right, Polvere), gold label "Accesso riservato" (10px, 0.2em), Cormorant 26px title, 13px Polvere sub-copy, the input, an error line (Errore, 12px), and the full-width solid gold submit. The modal is the client-facing gate — its precision is the product's credibility.

### Lightbox
- Pure black full screen. Circular controls (44px desktop, 36px mobile): close top-right, prev/next at the vertical center (bottom above the filmstrip on mobile). Counter and a small ghost download button ("Scarica", 11px uppercase) sit under the image. Clicking the image zooms it (scrollable at 100%+). A 76px filmstrip of 52px thumbs (3px radius, dimmed at 0.35 opacity, active thumb at full opacity with a 50% white border) runs along the bottom with backdrop blur. Keyboard: arrows to navigate, Escape to close.

### Steps / Testimonials
- **Step cells:** hairline-bordered boxes, 40px 32px padding; a Cormorant gold numeral (40px) leads, then a Cormorant 20px title, then 13px Polvere text. Hover warms the border to gold at 30%.
- **Testimonials:** Superficie cards with hairline border, 36px 32px padding; italic 14px quote in Polvere, author name (12px weight 400, Avorio) over a gold uppercase role line (10px, 0.1em).

### Back-to-top
- Floating circle, 40px, hairline border, dark 85% fill with 8px blur, Polvere icon. Appears below 500px scroll; hover warms icon and border toward gold.

## Do's and Don'ts

### Do:
- **Do** let photographs sit dimmed (brightness 0.72–0.92, reduced saturation) and bloom on hover — the reveal is the interaction.
- **Do** keep photo grids near-touching (2–3px gaps) so the wall reads as one contact sheet.
- **Do** spend Oro Invecchiato in small doses: labels, eyebrows, numerals, one italic word, focus rings, and solid submit buttons.
- **Do** use Cormorant Garamond at weight 300 for all display and titles; italic only for the accent word.
- **Do** set every label, nav item and button uppercase at 10–11px with 0.14–0.2em letterspacing.
- **Do** keep controls at 4px radius and draw structure with the 1px hairline (rgba(255,255,255,0.12)).
- **Do** carry text in Polvere when it is secondary, Avorio when it is primary, and keep body copy near 52ch max.

### Don't:
- **Don't** add box shadows anywhere — depth is scrims, blur and image filters only.
- **Don't** round photo frames on desktop; corners belong to controls, not photographs.
- **Don't** introduce a second accent hue; the palette is gold-on-carbon.
- **Don't** set display text in Outfit or body text in Cormorant.
- **Don't** exceed 11px for labels or 15px for body text.
- **Don't** fill any large surface with the gold — its rarity is the point.
- **Don't** crop vertical photographs in gallery screens; they use `object-fit: contain` at all times.
