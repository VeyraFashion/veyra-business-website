import type { CatalogItem } from "@/lib/catalog";

/** Style-matched catalogue items for what the shopper has already picked.
 *
 *  Deliberately computed from the catalogue in the browser rather than asked of the model:
 *  "show me more like this" should answer instantly. A 20-second wait to see a second shirt
 *  is worse than no feature. The ranker is reserved for the thing only it can do — building
 *  a complete outfit.
 *
 *  This catalogue carries about 1.2 tags per item, mostly fit and fabric ("slim", "linen",
 *  "oversized"), plus colours. That is a thin but real style signal, so the weights favour
 *  an exact subcategory match and treat tags and colours as corroboration rather than
 *  evidence on their own. */
const WEIGHT = { subcategory: 3, tag: 2, colour: 1 };

export interface SimilarItem {
  item: CatalogItem;
  score: number;
  /** Why it matched, for the UI to show — a silent recommendation is not persuasive. */
  reasons: string[];
}

function overlap(a: string[] = [], b: string[] = []): string[] {
  const right = new Set(b.map((value) => value.toLowerCase()));
  return a.filter((value) => right.has(value.toLowerCase()));
}

export function similarTo(
  selected: CatalogItem[],
  catalog: CatalogItem[],
  limit = 6,
): SimilarItem[] {
  if (selected.length === 0) return [];
  const chosen = new Set(selected.map((item) => item.id));

  const scored = catalog
    .filter((candidate) => !chosen.has(candidate.id))
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      for (const source of selected) {
        if (candidate.subcategory && candidate.subcategory === source.subcategory) {
          score += WEIGHT.subcategory;
          reasons.push(candidate.subcategory);
        }
        for (const tag of overlap(candidate.tags, source.tags)) {
          score += WEIGHT.tag;
          reasons.push(tag);
        }
        for (const colour of overlap(candidate.colors, source.colors)) {
          score += WEIGHT.colour;
          reasons.push(colour);
        }
      }

      return { item: candidate, score, reasons: [...new Set(reasons)].slice(0, 3) };
    })
    .filter((entry) => entry.score > 0);

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return scored.slice(0, limit);
}

/** Wear roles a selection has not filled yet — what "complete the look" is actually for. */
const ROLE_LABELS: Record<string, string> = {
  base_top: "a top",
  bottom: "a bottom",
  outerwear: "a layer",
  footwear: "shoes",
  accessory: "an accessory",
};

export function missingRoles(selected: CatalogItem[], catalog: CatalogItem[]): string[] {
  const filled = new Set(selected.map((item) => item.role));
  if (filled.has("full_body")) return [];
  const available = new Set(catalog.map((item) => item.role));
  return (["base_top", "bottom", "outerwear", "footwear", "accessory"] as const)
    .filter((role) => !filled.has(role) && available.has(role))
    .map((role) => ROLE_LABELS[role]);
}
