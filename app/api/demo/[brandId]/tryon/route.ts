import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { resolveBrand } from "@/lib/brands";
import { loadCatalogForBrand, resolveItemImagePath } from "@/lib/catalog";
import { submitTryOnJob, qualityProfile } from "@/lib/veyra-ai";

export const runtime = "nodejs";

function imageMimeType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

/** Client sends: multipart form with `photo` (the visitor's uploaded image) and `itemIds`
 *  (JSON array of catalog item ids, already deduped by role on the client — at most one
 *  base_top/bottom/full_body, one outerwear, one footwear, per /ai/try-on's rules). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  try {
    const { brandId } = await params;
    const entry = resolveBrand(brandId);
    if (!entry) return NextResponse.json({ error: "Unknown demo link." }, { status: 404 });

    const incoming = await req.formData();
    const photo = incoming.get("photo");
    const itemIdsRaw = incoming.get("itemIds");
    const promptRaw = incoming.get("prompt");

    if (!(photo instanceof Blob)) {
      return NextResponse.json({ error: "Missing photo upload." }, { status: 400 });
    }
    if (typeof itemIdsRaw !== "string") {
      return NextResponse.json({ error: "Missing itemIds." }, { status: 400 });
    }

    const itemIds: string[] = JSON.parse(itemIdsRaw);
    if (itemIds.length < 1 || itemIds.length > 4) {
      return NextResponse.json({ error: "Select 1-4 items to try on." }, { status: 400 });
    }

    const catalog = loadCatalogForBrand(entry);
    const items = itemIds.map((id) => {
      const item = catalog.items.find((i) => i.id === id);
      if (!item) throw new Error(`Unknown catalog item: ${id}`);
      return item;
    });

    const outgoing = new FormData();
    outgoing.set("person_image", photo, "visitor-photo.jpg");

    const metadata = items.map((item) => ({
      item_id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory ?? null,
      role: item.role,
    }));

    for (const item of items) {
      const filePath = resolveItemImagePath(item);
      const buf = fs.readFileSync(filePath);
      const extension = path.extname(filePath).toLowerCase();
      const blob = new Blob([buf], { type: imageMimeType(filePath) });
      outgoing.append("clothing_images", blob, `${item.id}${extension}`);
    }

    outgoing.set("garment_metadata", JSON.stringify(metadata));
    outgoing.set("quality_profile", qualityProfile());
    if (typeof promptRaw === "string" && promptRaw.trim()) {
      outgoing.set("prompt", promptRaw.trim());
    }

    const accepted = await submitTryOnJob(outgoing);
    return NextResponse.json({
      job_id: accepted.job_id,
      status: accepted.status,
      message: "Your look is queued for rendering.",
    }, { status: 202 });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const publicStatus = status >= 500 ? 503 : status;
    return NextResponse.json(
      { error: "STYLD could not start this try-on. Please try again." },
      { status: publicStatus },
    );
  }
}
