# Veyra for Retail

The B2B/B2B2C pitch: Veyra's AI layer (garment analysis, virtual try-on, reusable avatars, outfit
ranking) licensed as an API to fashion retailers, instead of — or alongside — the consumer app.
Same template and design system as `veyra-web` (Next.js 15 + React 19 + TypeScript, the same
Fraunces/dark/coral/teal theme), new content for a retailer buyer instead of an end consumer.

```bash
npm install
npm run dev   # http://localhost:3000 (pass -- -p 3003 to run alongside veyra-web/veyra-poc)
```

## What's different from veyra-web

Same section rhythm (nav → hero → problem stats → 3-step how-it-works → 6 capability rows →
integration band → why-now → segments → final CTA → footer), same CSS variables and component
classes (`.wrap`, `.section`, `.feature-row`, `.stats`, `.personas`, `.final-cta`, …) copied from
the already-fixed `veyra-web/app/theme.css` (the mobile nav-overflow and zero-padding bugs found
there are already fixed here, not reintroduced).

New, B2B-specific pieces added on top:
- **`.browser` mockup** (hero) — a generic storefront product page with a "Try it on" button,
  instead of the consumer app's phone mockup. The whole point of this pitch is that the widget
  lives on *someone else's* site, so the visual needed to say that.
- **`.code-mock`** (Capabilities, "Built for Engineering Teams" row) — a plain-text terminal-style
  panel showing the real async job shape (`POST /ai/jobs/try-on` → `202 Accepted` → poll → `completed`),
  matching `veyra-ai/AI_API_README.md`'s actual documented contract, not an invented one.
- **`.touchpoints`** (the "Where It Fits" band, `PlugsIn.tsx`) — three chips (Product Page / Cart /
  Post-Purchase) replacing the consumer site's chat-mock in that slot.

## Problem-section stats sharpened with better sources (2026-08-25)

Upgraded two of the three Problem-section stats from rounded, blog-sourced figures to precise,
named-research-firm figures, and added a fourth: 25% → **24.4%**, ~Half → **53%**, both now
attributed to a **Coresight Research** apparel-returns survey (2023 estimate; the primary report
is paywalled, so cited via [3DLOOK's summary](https://3dlook.ai/content-hub/true-cost-apparel-returns-data-rising-return-rates/),
which names Coresight and quotes the figures directly — checked against the original Coresight
report page to confirm title/date/author exist and match). Added a fourth stat, **$38B**
(estimated yearly US online-apparel-returns cost, same Coresight-based estimate) — `.stats` is now
a 4-up grid (2×2 on tablet, stacked on mobile) rather than 3. Richpanel/Rocket Returns stay in the
sources line as supporting citations for the general category claims.

**The "honest math" box's three slots are now filled — with a third party's numbers, explicitly
not Veyra's (2026-08-25).** Initially left blank on purpose (see git history / the note below),
then filled in after the user clarified the ask: real, research-backed numbers are fine as long as
they're never presented as Veyra's own results. Rebuilt the box around a single, gold-standard
source rather than patchwork blog stats: Nestler et al., *"SizeFlags: Reducing Size and Fit
Related Returns in Fashion E-Commerce"* — Zalando SE, peer-reviewed at **KDD 2021**
([arXiv:2106.03532](https://arxiv.org/abs/2106.03532)), a live A/B-tested study (300k+ customers
per group) of Zalando's own AI-driven size/fit system. Three real, precisely-scoped figures:
**+2.1%** conversion rate, **+1.8%** items added to cart (same test), **4–8%** fewer size-related
returns (range across the different model versions the paper tested). Rewrote the box's copy to
make the attribution unmissable — *"These are not Veyra numbers... They're Zalando's"* — rather
than quietly swapping numbers into copy that used to say the opposite. Renamed the CSS class that
used to hold the blank placeholder (`.blank`) to `.figure` and gave it the same real-data
treatment as the stats above (ink-colored serif numerals, coral accent) instead of the deliberately
faint/dim placeholder styling, since these are now real numbers, not empty slots. Verified live,
zero console errors, both breakpoints.

**Copy trimmed further per follow-up requests (same session):** removed the box's explanatory
paragraph, then the compact "Zalando · KDD 2021, not Veyra" tag that briefly replaced it, then the
`.stat-close` line above the industry stats ("None of that is a Veyra number..."). What's left:
the numbers, their labels, and a plain "Source:"/"Sources:" citation line under each group — the
same minimal citation treatment on both, no separate disclaimer copy. **Then made the math-box
visually match the section's main header and stats grid** — `.math-head` now uses the same serif
type scale as `h2.section-title` (`clamp(26px,3.2vw,36px)`, centered, `text-wrap: balance`), and
`.math-slot .figure`/`.math-slot` now use the exact same numeral size/weight/padding as
`.stat .n`/`.stat` (52px serif, 40px/32px padding, 22px border-radius) — so the two number groups
read as the same tier of evidence rather than the second looking like an afterthought. Kept the
bordered/gradient card wrapper on the math-box, since it's still a genuinely different category of
number (proof the approach works elsewhere vs. the industry-problem stats above it) — only the
typography was unified, not the whole container. Verified live at both desktop and mobile widths,
zero console errors.

**Gap above the math-box widened to match inter-section spacing.** Was `marginTop: 32` (an
arbitrary small nudge); measured the real gap this site uses between two actual `<section>`s
(Problem → HowItWorks: 88px bottom padding + 88px top padding = 176px, confirmed via
`getBoundingClientRect()` on each section's real content, not just the section boxes themselves —
those touch with 0px gap, all the spacing comes from each section's own padding) and set the
math-box's `marginTop` to the same 176px, so the break above it reads as a real section transition
rather than a tacked-on afterthought spaced arbitrarily closer than everything else on the page.

Numbers considered and rejected before landing on Zalando/KDD: several "up to 64% fewer returns,"
"250% conversion lift," "Macy's <2% return rate" style figures turned up repeatedly across
SEO/vendor blogs (Stytrix, Rewarx, aifitfinderapp, etc.) with no traceable primary source —
exactly the unverifiable-claim pattern this project has criticized in a competitor elsewhere in
this document. None of those made it in. McKinsey's fashion-AI report was also considered but
dropped — its site timed out on every fetch attempt, so specific figures attributed to it
couldn't be independently confirmed before use.

## On the numbers

The three stats in the Problem section (25% apparel return rate, ~half from fit/sizing, typical
in-house build time) are **industry figures, not Veyra performance claims** — sourced and linked
under the stats grid. Veyra doesn't have retailer pilot data yet, so the copy is deliberately
built around "here's the industry problem, here's what we'll help you measure on your own
catalog" rather than inventing a conversion-lift or return-reduction number the way a competitor
site (SizeSense.ai) does with unverifiable claims like "94% accuracy" / "66% fewer returns."
Don't add a specific Veyra-attributed outcome number here until a real pilot produces one.

## Not wired up

Same honest pattern as `veyra-web`: the "Book a demo" form is a disabled input + inert button.
Wiring it to a real inbox/CRM/calendar link is a follow-up, not done here.

## Per-brand outreach demo (`/demo/<brandId>`)

The `veyra-poc` storefront demo (product grid + live try-on + outfit ranking, built for Snitch
outreach) is integrated here as a route, generalized to any brand:

```
app/demo/[brandId]/page.tsx                     — resolves the id, loads that brand's catalog
app/api/demo/[brandId]/tryon(+/[jobId])/route.ts — same veyra-ai proxy pattern as veyra-poc
app/api/demo/[brandId]/outfits/route.ts
components/demo/{StoreDemo,ProductGrid,TryOnPanel,OutfitPanel}.tsx
config/brands.json                              — the id → brand mapping
catalog/<slug>.json                              — one per brand, {items: []} until populated
assets/<Brand Name>/                             — raw source images per brand, not committed further
public/products/<slug>/                          — served product photos
```

**Each brand gets a random, unguessable id** (`config/brands.json`), not a slug of their name —
so `https://<your-domain>/demo/<id>` only works for the one brand it was generated for, and one
brand can't guess another's link. Unknown ids 404. `/demo/` is disallowed in `robots.txt` and
every demo page sets `noindex` — **don't link these from the public nav or anywhere indexed**;
the randomness is the only privacy this has.

Current mapping (also in `config/brands.json`):

| Brand | URL | Catalog |
|---|---|---|
| Blissclub | `/demo/a952ff1c54` | not yet added |
| Bonkers Corner | `/demo/34f56177ab` | not yet added |
| SNITCH | `/demo/88c64009be` | ✅ 11 SKUs, ported from veyra-poc |
| NEWME | `/demo/f36f6d64b0` | not yet added |
| The Bear House | `/demo/51e026192a` | not yet added |
| FREAKINS | `/demo/513c78d2c8` | not yet added |
| The Pant Project | `/demo/3e1523409b` | not yet added |
| Urban Monkey | `/demo/9cba38c2ce` | not yet added |
| BEWAKOOF | `/demo/ad7e5cf4f2` | not yet added |
| The Souled Store | `/demo/c4be7e363b` | not yet added |

A brand with no catalog yet still gets a working page — it shows a clean "catalog coming soon"
state instead of erroring, so every link is safe to send even before the images exist.

### Adding a brand's real catalog

1. Drop collage screenshots (or individual product photos) into `assets/<Brand Name>/`.
2. Crop/organize into individual SKU images — the approach used for Snitch (grid boundaries
   detected from the near-white gutters between product cards) is a reasonable starting point for
   similar collage screenshots; hand-placed individual photos need no cropping at all.
3. Copy the final images into `public/products/<slug>/`.
4. Write `catalog/<slug>.json` in the same shape as `catalog/snitch.json` (id, name, price_inr,
   category, role, colors, tags, image path).
5. Flip `hasCatalog` to `true` for that brand's entry in `config/brands.json`.

No code changes needed — the route, API, and UI are already brand-agnostic.

## Pricing, comparison table, honest-math box, measurement methodology (2026-08-25)

Four additions implementing the "Now — days, not weeks" section of a competitive analysis
(Veyra vs. Elara's B2B widget, published separately as an artifact):

- **`components/sections/Pricing.tsx`** (new, `#pricing`, wired into `app/page.tsx` between
  Segments and FinalCta, added to Nav/Footer) — three tiers (Pilot $299/mo, Growth $899/mo,
  Scale custom), capped on the platform's real usage axes (try-on renders, outfit-ranking calls,
  SKUs catalogued) rather than gating features by tier. Numbers are grounded in this session's
  actually-observed veyra-ai Gemini costs (~$0.08/try-on render, ~$0.03–0.06/outfit-ranking
  call), not copied from any competitor's published pricing.
- **Build-it-yourself vs. license comparison table** — `.compare-table` in `WhyNow.tsx`, a new
  `<Reveal>` block after the existing why-now paragraph.
- **"Honest math" callout** — `.math-box` in `Problem.tsx`, replacing the old single-sentence
  closing paragraph. Deliberately doesn't invent a conversion-lift number to fill the three
  stat slots — the empty slots *are* the point, explained as such. This is the opposite move
  from a competitor's boxed ROI-math device that publishes an unverified estimate; it keeps the
  site's existing "no fabricated benchmark numbers" commitment (already stated elsewhere on the
  page) consistent with what the page actually shows.
- **Measurement methodology** — `.method-steps`, a 3-step "how we'll measure it" strip appended
  to the end of `Pricing.tsx` (baseline → pilot window → compare). Deliberately a plain
  before/after comparison, not a claimed statistical holdout-test methodology, since only the
  former is something this stage of the product can actually commit to honestly.

All four verified in a real browser (build clean, zero console errors, no mobile overflow at
390px) before calling this done.

## Pricing toggle, About, Team, footer (2026-08-25)

- **Monthly/annual pricing toggle** — `Pricing.tsx` is now a client component with a `period-toggle`
  pill switch above the tier grid. Annual price is exactly eleven months' worth of the monthly price
  (`monthly * 11`, i.e. "1 month free") for Pilot ($3,289/yr) and Growth ($9,889/yr) — a pricing
  *structure* choice, not a performance claim, so it doesn't run into the site's own
  no-fabricated-numbers rule. Scale stays "Custom" either way. Verified live: clicking toggles the
  `active` class and swaps every tier's displayed price/sub-line correctly (checked via DOM, not
  just read from source).
- **`components/sections/About.tsx`** (new, `#about`) — the origin story (consumer app → licensed
  retail layer) plus a 3-card "what we believe" strip that restates values already established
  elsewhere on the site (no fabricated benchmarks, one platform, proven on our own traffic first)
  rather than inventing new claims.
- **`components/sections/Team.tsx`** (new, `#team`) — two real people (Shobhit Tulshain, Founder;
  Omkar Ghugarkar, Co-Founder), initials-avatar circles (no stock photos standing in for real
  people), and bios that are explicitly labeled as placeholders pending real backgrounds — a
  footnote says so directly rather than presenting placeholder text as fact.
- **Footer rewrite** (`Footer.tsx`) — expanded from a single link row into a 4-column footer
  (brand + tagline + social icons, Product, Company, Legal) plus a bottom legal bar. Social icons
  (LinkedIn/X/Instagram) and the Privacy/Terms links are inert (`href="#"`) — same honest
  "not wired up yet" pattern as the Book-a-demo form elsewhere on this site; swap in real URLs
  when they exist.

All wired into `app/page.tsx` (Pricing → About → Team → FinalCta → Footer) and into the new
footer's Company column. Nav itself is unchanged (already at capacity); About/Team are reachable
via the footer and direct anchors. Verified with a live CDP pass: zero console errors, toggle
state changes confirmed via DOM diff, all four new/changed sections screenshotted after a real
scroll (not just a source read).

## Catalog Automation visual is now a real video, not an icon grid (2026-08-25)

`components/sections/Capabilities.tsx`'s first feature row ("Catalog Automation") used to show a
static 6-icon grid (`.wgrid`) as its `.feature-visual`. Replaced with an actual clip via
`components/CatalogVideo.tsx` — autoplaying, looped, muted, inside the same `.feature-visual`
container every other row uses, so it drops in without changing the section's layout.

Source file: `assets/static/This_is_how_the_camera_clicked.mp4` (raw original, same convention as
`assets/icons-raw/`/`assets/icon-images/` — edit/replace there, not in `public/`), copied to the
actually-served `public/catalog-automation.mp4`. Re-run the copy if the source file ever changes;
nothing else references the `assets/static/` path directly.

Uses `object-fit: contain`, not `cover` — the source is 16:9 and `.feature-visual` is a squarer
4:3.2 box, so `cover` was cropping the sides of every frame (lost the reticle circle's edges and a
couple of corner UI icons). `contain` shows the whole shot; the letterbox bars sit on the
container's own transparent background, so they pick up its existing dark teal/coral gradient
rather than reading as flat black bars.

Two things caught by testing, not assumed from source:
- **The bare `autoplay` HTML attribute wasn't reliable** — confirmed live that a fully-loaded video
  with `autoplay`/`muted` attributes present still sat paused at frame 0 until `.play()` was called
  explicitly. Fixed by calling `.play()` imperatively in a `useEffect` on mount (rejection caught
  and ignored, so the worst case is a static first frame, never a console error) rather than
  trusting the attribute alone.
- **A real reduced-motion race**, the same class of bug as the Lenis fix above: `usePrefersReducedMotion`
  starts `false` and corrects to `true` a tick later, so the video would briefly start playing on a
  reduced-motion visitor's first render before the correction landed — and removing the
  `loop`/`autoplay` *attributes* on the next render doesn't stop already-running playback. Fixed by
  explicitly calling `.pause()` in the same effect when `reduced` is true, not just skipping
  `.play()`. Verified deterministic across 4 fresh reduced-motion loads (stayed paused at t=0 every
  time) and confirmed normal playback advances correctly in the non-reduced case.

## Demo page now shares the real site nav (2026-08-25)

The per-brand demo (`/demo/[brandId]`) used to render its own inline nav — "Veyra demo for
{brand}" plus a "Try it on" quick-scroll button — instead of the actual site nav. Replaced it
with the same `Nav` component the marketing homepage uses, so a prospect on a demo link sees the
same Veyra business identity instead of something that reads as disposable.

`components/sections/Nav.tsx` now takes an optional `homeHref` prop: `""` (default, unchanged) on
the homepage keeps plain in-page `#anchor` links; `"/"` on any other page (currently just the demo
route, via `<Nav homeHref="/" />` in `StoreDemo.tsx`) prefixes every link to `/#anchor` so "Pricing",
"Book a demo", etc. correctly navigate back to the real site and land on the right section, rather
than trying to scroll to an anchor that doesn't exist on the current page. The wordmark itself
links home the same way. Verified live: nav hrefs differ correctly between the two pages, and an
actual click-through from the demo page lands on `/#pricing`, scrolled there.

Brand identity on the demo page itself is unaffected — the page's own `<h1>` still names the brand
("SNITCH's catalog, styled and worn by AI.") — only the nav badge that duplicated that
("demo for Snitch") is gone.

## Scroll feel + card/button animation polish (2026-08-25)

Closes the "scroll feel" gap noted against Elara, plus a broader animation pass on cards and
buttons:

- **`components/SmoothScroll.tsx`** (new, mounted once in `app/layout.tsx`) — site-wide inertial
  scroll via `lenis` (the same library Elara's `joinelara.shop` runs, confirmed in the earlier
  comparison), driven by our own `requestAnimationFrame` loop. **Disabled entirely under
  `prefers-reduced-motion: reduce`** — same rule as every other Motion-based effect here; inertial
  scroll is exactly the kind of vestibular-trigger effect that setting exists to suppress, so it's
  skipped outright rather than toned down. Verified live, not just via the `lenis` class Lenis adds
  to `<html>`: called the instance's own `.scrollTo()` and sampled `window.scrollY` mid-flight
  (477→787→941→992→1000 over ~500ms, a real eased curve, not an instant jump), and confirmed the
  `lenis` class is absent and the instance never initializes under reduced motion.
- **`components/CardSpotlight.tsx`** (new, mounted once in `app/layout.tsx`) — a cursor-follow
  radial glow on every `.card` (pricing tiers, team, and the demo page's product/outfit cards),
  set via `--mx`/`--my` CSS custom properties through one delegated, rAF-throttled `mousemove`
  listener rather than per-card React state or per-component wiring. The glow sits behind all real
  content — `.card` now uses `isolation: isolate` plus a `z-index: -1` pseudo-element, which is
  the actual fix for a real stacking bug this would otherwise have: without it, non-positioned
  static content (card text) paints *before* positioned descendants in normal CSS stacking order,
  so the pseudo-element's radial-gradient background would sit on top of the card's own text
  rather than behind it.
- **`.btn-primary` sheen sweep** — a single light diagonal highlight crosses the button on hover,
  same isolate+negative-z-index technique so the "Book a demo" label stays legible throughout.
- **Lighter hover states added to `.persona` and `.about-value`** (border-color brighten + a small
  lift) — these aren't `.card`-classed (no CTA, not clickable), so they get the simpler treatment
  rather than the full spotlight, matching the "cards you can act on get richer feedback than
  purely informational ones" split already implicit in the rest of the page.
- **Team avatar hover-pop** — `.team-card:hover .avatar` scales to 1.08 and rotates -4°, pure CSS,
  no JS.

All verified live via CDP computed-style diffs (border-color/transform before vs. hover) rather
than screenshots alone, since headless scroll timing in this environment needed a full reveal
settle before hover coordinates were reliable — screenshots of the spotlight and sheen effects
were still taken (standalone mock + live captures) to confirm they render correctly, not just that
the CSS parses.

## Demo page: outfit cards simplified (2026-08-25)

Removed the "Pick #1/#2/#3" rank ribbon and the percentage-match confidence ring from
`OutfitPanel.tsx`'s outfit cards (`ConfidenceRing` component deleted, `.rank-badge` and
`.confidence-ring` CSS removed as dead code) — outfit cards now show just the outfit name, item
thumbnails, rationale, and the try-on button. `.outfit-card` no longer needs its `overflow: visible`
override either, since nothing pokes above the card edge anymore; it now inherits the same
`overflow: hidden` (and therefore the same spotlight-clipping behavior) as every other `.card`.

## Placeholder icons vs. real photos

Most "clothing" shown on the marketing pages is actually the shared line-icon set in
`components/IconSprite.tsx` (raw, editable `.svg` copies + a usage map: `assets/icons-raw/`), not
photography — by design, per the original wireframe. The Hero mockup's "Field Jacket" product
thumbnail is the one exception: it's a real photo (`public/field-jacket.png`, via `next/image`
in `components/sections/Hero.tsx`), swapped in over the `g-jacket` icon placeholder. Swap in more
real photos the same way — `next/image` with `fill` inside a `position: relative` container,
`object-fit: cover`, and `overflow: hidden` on that container so the image respects its rounded
corners.

## Motion / animation

Uses `motion` (`motion/react`, the modern Framer Motion) throughout — scroll-reveal on every
marketing section (`components/Reveal.tsx`: `Reveal`/`RevealGroup`/`RevealItem`), and on the demo
page: stagger-in product cards with hover lift (`ProductGrid`), a proper crossfade between the
upload preview / spinner / result states instead of an instant snap (`TryOnPanel`), and stagger-in
outfit cards as they arrive from the API (`OutfitPanel`). Timings and easing (300-400ms scroll
reveal, 8-16px y-offset, 0.02-0.04s/item stagger, standard-tier hover of y:-4/scale:1.02) are
sourced from the `ui-ux-pro-max` skill's motion guidance, not guessed.

**Demo page visual pass (2026-08-25):** product cards now overlay the role badge on the image
(not in the text block) and clip the selection check into a filled coral badge with real depth
(`.card`/`.product-card` shadow scale); outfit cards got a "Pick #1/#2/#3" ribbon and a
conic-gradient confidence ring instead of plain "92% match" text (`ConfidenceRing` in
`OutfitPanel.tsx`) — note `.outfit-card` needs `overflow: visible` since the ribbon deliberately
pokes above the card edge and `.card`'s base `overflow: hidden` will clip it flat otherwise, this
was caught and fixed by cropping into an actual screenshot, not assumed. Try It On is a real
side-by-side layout now (`.tryon-layout`, two `.tryon-col`s) — photo + selected-item chips (small
circular thumbnails, not plain text tags) on the left, the result frame with an idle-state
placeholder on the right — instead of everything stacked in one column. Collapses to a single
stacked column under 860px.

**Button hover/press states (2026-08-25):** found via a live before/hover/active computed-style
diff against Elara's B2B site (`joinelara.shop`, confirmed built on Framer + Lenis) that Veyra's
own `.btn` class had *no* `:hover`/`:active` rule at all — nav, hero, pricing, and final-CTA
buttons sat visually static regardless of mouse state, while cards (`.card`, and the demo page's
motion-driven product/outfit cards) already had real hover lift/glow. Elara's own CTA hover is
minimal (a flat `rgba(255,255,255,0.06)` background fade via Framer's generic `transition: all`,
no transform, no shadow change) — so the bar was low, but Veyra was still behind it on this one
element. Fixed in `theme.css`: `.btn:hover` lifts 2px + deepens the coral glow shadow,
`.btn:active` settles to `scale(0.97)` (matching the tap-scale already used elsewhere),
`.btn-ghost:hover` brightens its fill/border. Verified live via CDP (`Input.dispatchMouseEvent`)
computed-style diff and screenshots, not just read from source.

**`prefers-reduced-motion` — use `lib/use-reduced-motion.ts`, not Motion's own `useReducedMotion()`.**
Framer Motion's built-in hook caches the media-query result in a module-level singleton
(`motion-dom`'s `state.mjs`) rather than React state. In this app's production build, Next.js
splits that module across more than one webpack chunk, so the chunk that *sets* the cached value
and the chunk a given component *reads* it from can be different objects — verified concretely:
every `Reveal`-wrapped element on the demo page stayed permanently invisible under
`prefers-reduced-motion: reduce` (confirmed 0/6 elements ever took the reduced-motion branch,
across repeated fresh loads) despite `matchMedia` correctly reporting `true` the entire time. The
custom hook in `lib/use-reduced-motion.ts` has no shared module state to desync — every component
reads `matchMedia` itself via its own `useEffect` — and was verified to fix it (4/4 fresh loads
correct, both in dev and in an actual `next build && next start` production run, not just `next
dev`). If you add more Motion-based components, import `usePrefersReducedMotion` from
`lib/use-reduced-motion`, never `useReducedMotion` from `motion/react`.
