import { NextRequest, NextResponse } from "next/server";
import { resolveBrand } from "@/lib/brands";
import { loadCatalogForBrand } from "@/lib/catalog";
import { rankOutfits } from "@/lib/veyra-ai";

export const runtime = "nodejs";

const MAX_USER_IMAGE_BYTES = 8 * 1024 * 1024;
const USER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface OutfitDemoBody {
  occasion?: string | null;
  mood?: string | null;
  prompt?: string | null;
  limit?: number;
  userImage?: File | null;
  mustIncludeItemIds?: string[];
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function publicOutfit(value: unknown) {
  const outfit = asRecord(value);
  if (!outfit) return null;
  const items = Array.isArray(outfit.items)
    ? outfit.items.map((candidate) => {
        const item = asRecord(candidate);
        if (!item) return null;
        return {
          item_id: typeof item.item_id === "string" ? item.item_id : null,
          name: typeof item.name === "string" ? item.name : "Catalogue item",
          category: typeof item.category === "string" ? item.category : "item",
          role: typeof item.role === "string" ? item.role : null,
        };
      }).filter(Boolean)
    : [];
  return {
    name: typeof outfit.name === "string" ? outfit.name : "Veyra look",
    items,
    rationale: typeof outfit.rationale === "string" ? outfit.rationale : "",
    confidence: typeof outfit.confidence === "number" ? outfit.confidence : 0,
  };
}

function publicPhotoAssessment(value: unknown) {
  const assessment = asRecord(value);
  if (!assessment) return null;
  return {
    status: typeof assessment.status === "string" ? assessment.status : "unavailable",
    suitable_for_try_on: assessment.suitable_for_try_on === true,
    framing: typeof assessment.framing === "string" ? assessment.framing : "unknown",
    pose: typeof assessment.pose === "string" ? assessment.pose : "unknown",
    issues: Array.isArray(assessment.issues)
      ? assessment.issues.filter((issue): issue is string => typeof issue === "string")
      : [],
    guidance: typeof assessment.guidance === "string" ? assessment.guidance : null,
  };
}

async function parseRequest(req: NextRequest): Promise<OutfitDemoBody> {
  if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
    return req.json().catch(() => ({}));
  }

  const form = await req.formData();
  const imageEntry = form.get("userImage");
  const limitValue = Number(form.get("limit") ?? 3);
  const itemIdsValue = String(form.get("itemIds") ?? "[]");
  let mustIncludeItemIds: string[] = [];
  try {
    const parsed = JSON.parse(itemIdsValue);
    if (Array.isArray(parsed)) {
      mustIncludeItemIds = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    mustIncludeItemIds = [];
  }
  return {
    prompt: String(form.get("prompt") ?? "").trim() || null,
    occasion: String(form.get("occasion") ?? "").trim() || null,
    mood: String(form.get("mood") ?? "").trim() || null,
    limit: Number.isFinite(limitValue) ? limitValue : 3,
    userImage: imageEntry && typeof imageEntry !== "string" ? imageEntry : null,
    mustIncludeItemIds,
  };
}

/** Ranks a brand's full sample catalog from a chat brief and optional shopper image. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  try {
    const { brandId } = await params;
    const entry = resolveBrand(brandId);
    if (!entry) return NextResponse.json({ error: "Unknown demo link." }, { status: 404 });

    const body = await parseRequest(req);
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
      metadata: {
        subcategory: item.subcategory,
        role: item.role,
        price_inr: item.price_inr,
        brand: catalog.brand,
      },
    }));

    let userImage: Record<string, string> | null = null;
    if (body.userImage) {
      if (!USER_IMAGE_TYPES.has(body.userImage.type)) {
        return NextResponse.json(
          { error: "Use a JPEG, PNG, or WebP shopper photo." },
          { status: 400 },
        );
      }
      if (body.userImage.size > MAX_USER_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Shopper photo must be 8 MB or smaller." },
          { status: 400 },
        );
      }
      const imageBytes = Buffer.from(await body.userImage.arrayBuffer());
      if (imageBytes.length === 0) {
        return NextResponse.json({ error: "Shopper photo is empty." }, { status: 400 });
      }
      userImage = {
        data_base64: imageBytes.toString("base64"),
        mime_type: body.userImage.type,
        filename: body.userImage.name || "shopper-photo",
      };
    }

    const result = await rankOutfits({
      wardrobe,
      occasion: body.occasion ?? null,
      mood: body.mood ?? null,
      prompt: body.prompt ?? "Build a versatile, complete look from the products provided.",
      user_image: userImage,
      auto_shop_missing: false,
      must_include_item_ids: body.mustIncludeItemIds ?? [],
      limit: body.limit ?? 3,
    });

    const outfits = Array.isArray(result.outfits)
      ? result.outfits.map(publicOutfit).filter(Boolean)
      : [];
    return NextResponse.json({
      outfits,
      photo_assessment: publicPhotoAssessment(result.photo_assessment),
    });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const publicStatus = status >= 500 ? 503 : status;
    return NextResponse.json(
      { error: "Veyra could not create these looks. Please try again." },
      { status: publicStatus },
    );
  }
}
