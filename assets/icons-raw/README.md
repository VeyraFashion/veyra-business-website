# Raw icon files

What you're seeing as "clothes" almost everywhere on the marketing pages (and in one spot on the
demo page) isn't product photography — it's this same set of 7 generic line-art silhouettes,
reused over and over via a shared `<svg><defs>` sprite (`components/IconSprite.tsx`). These are
the actual, editable source files for each one.

| File | Where it's used |
|---|---|
| `g-tee.svg` | How It Works step 2 (mini-grid); Catalog Automation grid |
| `g-jacket.svg` | **Hero storefront mockup** ("Field Jacket" product thumbnail — the most visible one); How It Works steps 1 & 3; Catalog Automation grid; Virtual Try-On visual; Try It On result placeholder (demo page) |
| `g-pants.svg` | Catalog Automation grid |
| `g-dress.svg` | Virtual Try-On visual; Reusable Avatars mini-grid; Catalog Automation grid |
| `g-bag.svg` | Where It Fits: Cart chip; Catalog Automation grid |
| `g-shoe.svg` | Catalog Automation grid |
| `g-sparkle.svg` | Meet Vey chat bubble avatar; "Get AI-styled outfit ideas" idle panel icon |

Each file is a plain, standalone SVG (viewBox `0 0 24 24`, single `<path>`, stroke set to a visible
dark color so it's easy to see and edit) — open any of them directly in Illustrator, Figma,
Inkscape, or even a text editor. Full mapping of every usage: `grep -rn 'href="#g-' components/ app/`
from the `veyra-business-website` root.

## Reapplying an edit

The site doesn't read these files directly — it reads `components/IconSprite.tsx`, which has one
`<g id="g-xxx">...</g>` block per icon containing the exact same path data. To apply an edited
version:

1. Edit whichever `.svg` file(s) here you want to change.
2. Send them back (or just tell me what changed) and I'll paste the new path data into the
   matching `<g id="g-xxx">` in `components/IconSprite.tsx` — that one file drives every usage
   across the whole site, so a single edit updates it everywhere at once.
3. If you're replacing a placeholder with an actual photo instead of a new line-icon (e.g. a real
   jacket photo for the Hero mockup), that's a different swap — an `<img>`/`next/image` instead of
   `<svg><use></svg>` — tell me which spot and I'll wire it in.

Note the color you see on the actual site isn't baked into these files — every usage sets
`style={{ color: "var(--ink)" }}` (or `--coral2`, etc.) on the wrapping `<svg>`, and the shape
inherits it via `stroke="currentColor"`/`fill="currentColor"` in the real component. These
standalone exports use a fixed dark stroke instead, just so they're visible outside that context.
