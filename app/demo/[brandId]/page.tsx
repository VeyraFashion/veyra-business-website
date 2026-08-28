import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveBrand } from "@/lib/brands";
import { loadCatalogForBrand } from "@/lib/catalog";
import StoreDemo from "@/components/demo/StoreDemo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandId: string }>;
}): Promise<Metadata> {
  const { brandId } = await params;
  const entry = resolveBrand(brandId);

  return {
    title: entry ? `${entry.brand} × Veyra — Live AI Styling Demo` : "Veyra — Private AI Styling Demo",
    description: entry
      ? `Explore ${entry.brand} products with live outfit intelligence and virtual try-on in Veyra's private commerce demo.`
      : "Explore Veyra's private AI styling and virtual try-on experience.",
    robots: { index: false, follow: false },
  };
}

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
