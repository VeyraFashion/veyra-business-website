import { NextRequest, NextResponse } from "next/server";
import { resolveBrand } from "@/lib/brands";
import { loadCatalogForBrand } from "@/lib/catalog";
import { rankOutfits } from "@/lib/veyra-ai";

export const runtime = "nodejs";

/** Ranks a brand's full sample catalog into outfits. Body: { occasion?, mood?, prompt?, limit? } */
export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  try {
    const { brandId } = await params;
    const entry = resolveBrand(brandId);
    if (!entry) return NextResponse.json({ error: "Unknown demo link." }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const catalog = loadCatalogForBrand(entry);

    if (catalog.items.length === 0) {
      return NextResponse.json({ error: "No catalog items for this brand yet." }, { status: 400 });
    }

    const wardrobe = catalog.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image_url: item.image,
      colors: item.colors,
      tags: item.tags,
      metadata: { subcategory: item.subcategory, role: item.role, price_inr: item.price_inr },
    }));

    const result = await rankOutfits({
      wardrobe,
      occasion: body.occasion ?? "everyday casual",
      mood: body.mood ?? null,
      prompt: body.prompt ?? "Build outfits only from the items provided.",
      auto_shop_missing: false,
      limit: body.limit ?? 3,
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
