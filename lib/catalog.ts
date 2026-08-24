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
  image: string; // public/ path, e.g. /products/<slug>/xxx.png
  placeholder_name?: boolean;
}

export interface Catalog {
  brand: string;
  note: string;
  items: CatalogItem[];
}

/** Loads catalog/<slug>.json for a resolved brand. Returns an empty-items catalog (not an
 *  error) when the file doesn't exist yet - most brands start with no product images. */
export function loadCatalogForBrand(entry: BrandEntry): Catalog {
  const file = path.join(process.cwd(), "catalog", entry.catalogFile);
  if (!entry.hasCatalog || !fs.existsSync(file)) {
    return { brand: entry.brand, note: "No product images added yet for this brand.", items: [] };
  }
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw) as Catalog;
}

/** Resolves a catalog item's public image path to an absolute file path on disk. */
export function resolveItemImagePath(item: CatalogItem): string {
  const relative = item.image.replace(/^\//, "");
  return path.join(process.cwd(), "public", relative);
}
