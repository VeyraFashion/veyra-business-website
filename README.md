# Veyra for Business

The public B2B website for Veyra’s fashion-commerce platform: virtual try-on, outfit
intelligence, reusable avatars, and catalog-ready imagery delivered behind a retailer’s existing
storefront.

The homepage is deliberately positioned around purchase confidence rather than generic “AI
transformation” language. Pricing and team identities are intentionally absent from the public
experience until they are ready to be published.

## Current direction

- Editorial commerce design: warm paper, near-black typography, cobalt, acid lime, and persimmon.
- One primary journey: plan a small, measurable retail pilot.
- Real product UI instead of decorative dashboard mockups.
- Independent evidence beside the claims it supports, clearly separated from Veyra results.
- Restrained motion with reduced-motion support.
- Tailwind v4 theme tokens and owned shadcn primitives for functional UI, without replacing the
  bespoke editorial homepage composition.
- An accessible shadcn/Radix FAQ and keyboard-complete tabs for the commerce journey.
- A bespoke Open Graph card at **app/opengraph-image.png**.

## Run locally

~~~bash
npm install
npm run dev
~~~

The default local URL is http://localhost:3000.

Set these values in **.env.local** when needed:

~~~bash
NEXT_PUBLIC_SITE_URL=https://your-public-origin.example
VEYRA_AI_BASE_URL=http://127.0.0.1:8000
VEYRA_AI_SERVICE_KEY=
VEYRA_AI_QUALITY_PROFILE=interactive
~~~

**NEXT_PUBLIC_SITE_URL** ensures Open Graph and other metadata use the canonical production
origin. Vercel deployment URLs are detected automatically when that explicit value is absent.

## Quality gate

~~~bash
npm run check
~~~

The full check runs:

1. ESLint with Next.js Core Web Vitals and TypeScript rules.
2. TypeScript validation.
3. Vitest interaction tests for tabs, keyboard behavior, FAQ, clipboard feedback, and automated
   accessibility checks.
4. A production Next.js build.
5. Public-content assertions for hidden pricing/team copy, evidence links, dead anchors,
   responsive rules, metadata, and required assets.

Use the individual scripts when iterating:

~~~bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:content
~~~

## Evidence and measurement on the homepage

- [Google Cloud × Breuninger virtual try-on case study](https://cloud.google.com/blog/topics/retail/how-breuninger-boosted-sales-with-its-be-your-own-model-ai):
  a six-week retail A/B test reported higher conversion and stronger contribution margin among
  shoppers who used personalized virtual try-on. The homepage presents this as directional
  category evidence.
- [Zalando’s June 2026 Size & Fit update](https://corporate.zalando.com/en/technology/how-zalando-uses-technology-help-customers-find-right-size):
  recent Virtual Fitting Room pilots reported up to 40% fewer returns, followed by a permanent
  rollout. A separate [March 2026 scale update](https://corporate.zalando.com/en/fashion/tracking-future-why-zalando-uniquely-placed-lead-next-era-retail)
  says the experience is being made available to millions of customers. The homepage links both
  sources, labels the return figure as a retailer-reported pilot result, and keeps the scale-up
  claim distinct.

## Project structure

~~~text
app/page.tsx                         Public homepage entry
app/tailwind.css                     Tailwind v4 and Veyra design-token bridge
app/home.css                         Homepage visual system and responsive rules
app/opengraph-image.png              Social-preview card
components/home/BusinessHome.tsx     Homepage content and layout
components/home/CommerceMoment.tsx   Interactive commerce touchpoints
components/home/Faq.tsx              Accessible FAQ accordion
components/home/PilotChecklist.tsx   Copyable pilot brief
components/ui/                       Owned shadcn primitives, restyled for Veyra
tests/homepage.test.tsx              Interaction and accessibility tests
scripts/verify-homepage.mjs          Built-output and content checks
~~~

The legacy theme remains because the private brand-demo route still uses its catalog, card, upload,
and result styles.

Tailwind is configured without Preflight so it cannot unexpectedly reset the legacy demo or the
art-directed homepage. Add new functional primitives through shadcn, keep their source in
**components/ui/**, and map visuals to the tokens in **app/tailwind.css** instead of shipping
registry defaults unchanged.

## Private brand demos

**/demo/[brandId]** hosts brand-specific product, outfit, and live try-on demos. Random IDs resolve
through **config/brands.json**; catalog data lives in **catalog/**, and product images live under
**public/products/**.

These routes are intentionally:

- excluded from the public homepage;
- marked noindex;
- disallowed in robots.txt;
- dependent on unguessable IDs rather than public brand slugs.

Do not add demo IDs to public copy, navigation, analytics labels, or generated social metadata.
