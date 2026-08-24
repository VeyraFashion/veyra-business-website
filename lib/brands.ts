import fs from "node:fs";
import path from "node:path";

export interface BrandEntry {
  brand: string;
  slug: string;
  assetsDir: string;
  catalogFile: string;
  hasCatalog: boolean;
}

interface BrandsConfig {
  _note: string;
  idsById: Record<string, BrandEntry>;
}

let cached: BrandsConfig | null = null;

function loadBrandsConfig(): BrandsConfig {
  if (cached) return cached;
  const file = path.join(process.cwd(), "config", "brands.json");
  cached = JSON.parse(fs.readFileSync(file, "utf-8")) as BrandsConfig;
  return cached;
}

/** Resolves a /demo/<brandId> URL segment to its brand entry, or null if the id is unknown.
 *  Unknown ids should 404 - never leak whether a given id "almost" matched anything. */
export function resolveBrand(brandId: string): BrandEntry | null {
  const config = loadBrandsConfig();
  return config.idsById[brandId] ?? null;
}
