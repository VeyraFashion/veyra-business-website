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
