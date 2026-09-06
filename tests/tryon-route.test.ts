import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFileSync: vi.fn((filePath: string) => Buffer.from(`image:${filePath}`)),
  submitTryOnJob: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: { readFileSync: mocks.readFileSync },
}));

vi.mock("@/lib/brands", () => ({
  resolveBrand: (brandId: string) => brandId === "brand-test"
    ? {
        brand: "Test Brand",
        slug: "test-brand",
        assetsDir: "Test Brand",
        catalogFile: "catalog.json",
        hasCatalog: true,
      }
    : null,
}));

vi.mock("@/lib/catalog", () => ({
  loadCatalogForBrand: () => ({
    brand: "Test Brand",
    note: "route fixture",
    items: [
      {
        id: "shirt-jpeg",
        name: "JPEG Shirt",
        category: "top",
        subcategory: "shirt",
        role: "base_top",
        imageDiskPath: "/catalog/JPEG Shirt.JPEG",
      },
      {
        id: "trousers-webp",
        name: "WebP Trousers",
        category: "bottom",
        subcategory: "trousers",
        role: "bottom",
        imageDiskPath: "/catalog/trousers.webp",
      },
    ],
  }),
  resolveItemImagePath: (item: { imageDiskPath: string }) => item.imageDiskPath,
}));

vi.mock("@/lib/veyra-ai", () => ({
  qualityProfile: () => "interactive",
  submitTryOnJob: mocks.submitTryOnJob,
}));

import { POST } from "@/app/api/demo/[brandId]/tryon/route";

afterEach(() => {
  vi.clearAllMocks();
});

describe("demo try-on proxy", () => {
  it("forwards authoritative styling and preserves each garment's MIME type and extension", async () => {
    mocks.submitTryOnJob.mockResolvedValue({
      job_id: "job-123",
      status: "queued",
    });
    const incoming = new FormData();
    incoming.set("photo", new File(["person"], "person.jpg", { type: "image/jpeg" }));
    incoming.set("itemIds", JSON.stringify(["shirt-jpeg", "trousers-webp"]));
    incoming.set(
      "prompt",
      "AUTHORITATIVE SHOPPER REQUEST (highest priority): keep the shirt untucked\n" +
      "STATIC SINGLE-FRAME RENDER PLAN (lower priority): keep the complete hem outside",
    );
    const request = { formData: async () => incoming };

    const response = await POST(request as never, {
      params: Promise.resolve({ brandId: "brand-test" }),
    });

    expect(response.status).toBe(202);
    expect(mocks.submitTryOnJob).toHaveBeenCalledOnce();
    const outgoing = mocks.submitTryOnJob.mock.calls[0][0] as FormData;
    expect(outgoing.get("prompt")).toBe(incoming.get("prompt"));
    expect(outgoing.get("quality_profile")).toBe("interactive");
    expect(outgoing.get("garment_metadata")).toBe(JSON.stringify([
      {
        item_id: "shirt-jpeg",
        name: "JPEG Shirt",
        category: "top",
        subcategory: "shirt",
        role: "base_top",
      },
      {
        item_id: "trousers-webp",
        name: "WebP Trousers",
        category: "bottom",
        subcategory: "trousers",
        role: "bottom",
      },
    ]));

    const garments = outgoing.getAll("clothing_images") as File[];
    expect(garments.map(({ name, type }) => ({ name, type }))).toEqual([
      { name: "shirt-jpeg.jpeg", type: "image/jpeg" },
      { name: "trousers-webp.webp", type: "image/webp" },
    ]);
  });
});
