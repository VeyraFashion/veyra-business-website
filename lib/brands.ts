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
  idsByEnv?: Record<string, BrandEntry>;
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
  if (!brandId) return null;
  const config = loadBrandsConfig();
  if (Object.hasOwn(config.idsById, brandId)) return config.idsById[brandId];
  for (const [key, entry] of Object.entries(config.idsByEnv ?? {})) {
    if (process.env[key] === brandId) return entry;
  }
  return null;
}
