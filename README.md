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
