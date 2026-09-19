import type { CatalogItem } from "@/lib/catalog";

export const MODELS = {
  male: { label: "Male model", src: "/brand-assets/static/model/male_model.png" },
  female: { label: "Female model", src: "/brand-assets/static/model/female_model.png" },
} as const;

export type ModelId = keyof typeof MODELS;
const BOTH: ModelId[] = ["male", "female"];

/** Which stand-in models a brand is offered.
 *
 *  This matters more than it looks. Showing a womenswear brand a male stand-in — or putting a
 *  men's shirt on a female model — makes the demo look like nobody prepared it for them, which
 *  is the one impression a private brand link cannot afford.
 *
 *  Only brands whose catalogue is genuinely single-gender are listed. Brands that sell to
 *  everyone are deliberately absent and fall through to offering both, because narrowing them
 *  would be a guess dressed up as a setting.
 *
 *  Evidence, from the catalogues in assets/ rather than from what the labels are known for:
 *    SNITCH          all 100 of its product URLs sit under a men- path segment
 *    FREAKINS        product URLs read /women-*, and the cuts are women's denim throughout
 *    NEWME           halter tops, midi skirts, a mini dress — womenswear, no ambiguity
 *    Blissclub       skorts and crossback tanks; women's activewear
 *    The Bear House  menswear tailoring and shirting throughout
 *
 *  Deliberately NOT listed, despite their sample catalogues here being men's only:
 *    BEWAKOOF, The Souled Store — both sell womenswear as well. Their catalogue stubs in this
 *    repo happen to hold eight men's items each, which says what was scraped, not what the
 *    brand sells. Pinning them to male from that sample would quietly become wrong the day
 *    the full catalogue lands. `inferFromCatalogue` below handles them correctly either way.
 *    Bonkers Corner, The Pant Project, Urban Monkey — mixed or unisex ranges. */
const BY_BRAND: Partial<Record<string, ModelId[]>> = {
  SNITCH: ["male"],
  FREAKINS: ["female"],
  NEWME: ["female"],
  Blissclub: ["female"],
  "The Bear House": ["male"],
};

/** Below this many URL-bearing items the signal is noise, not evidence. */
const MIN_SAMPLE = 6;
/** A catalogue has to be overwhelmingly one gender before the choice is taken away. */
const MAJORITY = 0.85;

/** "women" contains "men", so the male test has to reject a preceding "wo". Both look for the
 *  token as its own path segment or word, which is how these URLs are actually built
 *  (/men-shirts/..., /products/women-jet-black-...). */
const WOMEN = /(^|[^a-z])(women|woman|ladies|girls)s?([^a-z]|$)/i;
const MEN = /(^|[^a-z])(?<!wo)(men|man|boys)s?([^a-z]|$)/i;

/** Reads the loaded catalogue when a brand has no entry above.
 *
 *  This is the part that keeps working as catalogues change: a brand whose range is men's
 *  today and mixed next quarter narrows and widens on its own, with no config to remember. */
function inferFromCatalogue(catalog: CatalogItem[]): ModelId[] | null {
  const urls = catalog.map((item) => item.productUrl).filter((url): url is string => Boolean(url));
  if (urls.length < MIN_SAMPLE) return null;

  let women = 0;
  let men = 0;
  for (const url of urls) {
    if (WOMEN.test(url)) women += 1;
    else if (MEN.test(url)) men += 1;
  }

  if (women / urls.length >= MAJORITY) return ["female"];
  if (men / urls.length >= MAJORITY) return ["male"];
  return null;
}

export function modelsFor(brand: string, catalog: CatalogItem[]): ModelId[] {
  return BY_BRAND[brand] ?? inferFromCatalogue(catalog) ?? BOTH;
}
