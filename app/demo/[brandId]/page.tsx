import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveBrand } from "@/lib/brands";
import { loadCatalogForBrand } from "@/lib/catalog";
import StoreDemo from "@/components/demo/StoreDemo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BrandDemoPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const entry = resolveBrand(brandId);
  if (!entry) notFound();

  const catalog = loadCatalogForBrand(entry);
  return <StoreDemo brandId={brandId} catalog={catalog} />;
}
