import fs from "node:fs";
import path from "node:path";
import type { BrandEntry } from "@/lib/brands";

export type Role = "base_top" | "bottom" | "full_body" | "outerwear" | "footwear" | "accessory";

export interface CatalogItem {
  id: string;
  name: string;
  price_inr: number;
  category: string;
  subcategory?: string;
  role: Role;
  colors: string[];
  tags: string[];
  image: string; // browser-facing URL served by app/brand-assets/[...path]/route.ts
  imageDiskPath: string; // absolute filesystem path, for server-side reads (AI job upload)
}

export interface Catalog {
  brand: string;
  note: string;
  items: CatalogItem[];
}

/** Raw shape of assets/<Brand>/<slug>.json — the brand-extraction pipeline's own catalog
 *  format (see assets/extract_brand_images.py), distinct from this app's CatalogItem shape. */
interface RawWardrobeItem {
  id: string;
  name: string;
  category: string; // top | bottom | outerwear | footwear | accessory
  colors?: string[];
  tags?: string[];
  metadata?: { subcategory?: string; product_url?: string; brand?: string };
  image_path?: string | null; // relative to the brand's own asset folder, e.g. "images/x.jpg"
}

interface RawBrandCatalog {
  brand: string;
  slug: string;
  wardrobe: RawWardrobeItem[];
}

const CATEGORY_TO_ROLE: Record<string, Role> = {
  top: "base_top",
  bottom: "bottom",
  dress: "full_body",
  full_body: "full_body",
  outerwear: "outerwear",
  footwear: "footwear",
  accessory: "accessory",
};

// Illustrative price bands per category — a deterministic estimate, not a live-fetched
// price. Never presented as real pricing; documented here for the same reason it was
// documented in the previous catalog format.
const PRICE_BAND_INR: Record<Role, [number, number]> = {
  base_top: [799, 2199],
  bottom: [999, 2999],
  full_body: [1499, 3999],
  outerwear: [1999, 4999],
  footwear: [1499, 3999],
  accessory: [299, 1499],
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic, hash-based price estimate within a category's price band — stable across
 *  reloads for a given item id, explicitly not a real/live price. */
function estimatePriceInr(id: string, role: Role): number {
  const [min, max] = PRICE_BAND_INR[role] ?? [799, 2999];
  const span = Math.max(1, max - min);
  const raw = min + (hashString(id) % span);
  return Math.round(raw / 10) * 10;
}

function encodeAssetPath(...segments: string[]): string {
  return segments.map(encodeURIComponent).join("/");
}

/** Loads assets/<assetsDir>/<catalogFile> for a resolved brand and adapts it to this app's
 *  CatalogItem shape. Returns an empty-items catalog (not an error) when the file doesn't
 *  exist yet, or when a wardrobe entry has no real image — most brands start with images
 *  only, no catalog JSON yet, and not every extracted item has a matched product photo. */
export function loadCatalogForBrand(entry: BrandEntry): Catalog {
  const file = path.join(process.cwd(), "assets", entry.assetsDir, entry.catalogFile);
  if (!entry.hasCatalog || !fs.existsSync(file)) {
    return { brand: entry.brand, note: "No product images added yet for this brand.", items: [] };
  }

  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as RawBrandCatalog;
  const assetsDirAbs = path.join(process.cwd(), "assets", entry.assetsDir);

  const items: CatalogItem[] = raw.wardrobe
    .filter((w) => Boolean(w.image_path))
    .map((w) => {
      const role = CATEGORY_TO_ROLE[w.category] ?? "accessory";
      const imagePathSegments = w.image_path!.split("/").filter(Boolean);
      return {
        id: w.id,
        name: w.name,
        price_inr: estimatePriceInr(w.id, role),
        category: w.category,
        subcategory: w.metadata?.subcategory,
        role,
        colors: w.colors ?? [],
        tags: w.tags ?? [],
        image: `/brand-assets/${encodeAssetPath(entry.assetsDir, ...imagePathSegments)}`,
        imageDiskPath: path.join(assetsDirAbs, ...imagePathSegments),
      };
    });

  return {
    brand: raw.brand ?? entry.brand,
    note: `${items.length} catalog item(s) loaded from assets/${entry.assetsDir}/${entry.catalogFile}.`,
    items,
  };
}

/** Resolves a catalog item's image to an absolute file path on disk, for server-side reads
 *  (e.g. attaching the real image bytes to an AI try-on job). */
export function resolveItemImagePath(item: CatalogItem): string {
  return item.imageDiskPath;
}
