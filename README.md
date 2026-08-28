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
- Accessible Radix primitives for the FAQ and keyboard-complete tabs for the commerce journey.
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

## Evidence used on the homepage

- [Google Cloud × Breuninger virtual try-on case study](https://cloud.google.com/blog/topics/retail/how-breuninger-boosted-sales-with-its-be-your-own-model-ai):
  a six-week retail A/B test reported higher conversion and stronger contribution margin among
  shoppers who used personalized virtual try-on. The source gives direction, not a numeric uplift,
  and the website says so.
- [Zalando SE, SizeFlags, KDD 2021](https://arxiv.org/abs/2106.03532): published results for a
  separate size-and-fit system. These figures are industry evidence, never presented as Veyra
  performance.

## Project structure

~~~text
app/page.tsx                         Public homepage entry
app/home.css                         Homepage visual system and responsive rules
app/opengraph-image.png              Social-preview card
components/home/BusinessHome.tsx     Homepage content and layout
components/home/CommerceMoment.tsx   Interactive commerce touchpoints
components/home/Faq.tsx              Accessible FAQ accordion
components/home/PilotChecklist.tsx   Copyable pilot brief
tests/homepage.test.tsx              Interaction and accessibility tests
scripts/verify-homepage.mjs          Built-output and content checks
~~~

The legacy theme remains because the private brand-demo route still uses its catalog, card, upload,
and result styles.

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
