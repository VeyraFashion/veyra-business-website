"use client";

import { useMemo, useRef, useState } from "react";
import type { Catalog, CatalogItem } from "@/lib/catalog";
import { Reveal } from "@/components/Reveal";
import IconSprite from "@/components/IconSprite";
import Nav from "@/components/sections/Nav";
import ProductGrid from "@/components/demo/ProductGrid";
import TryOnPanel from "@/components/demo/TryOnPanel";
import OutfitPanel from "@/components/demo/OutfitPanel";

export default function StoreDemo({ brandId, catalog }: { brandId: string; catalog: Catalog }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const tryOnRef = useRef<HTMLDivElement>(null);

  const catalogById = useMemo(
    () => Object.fromEntries(catalog.items.map((item) => [item.id, item])),
    [catalog.items]
  );

  const selectedItems = selectedIds.map((id) => catalogById[id]).filter(Boolean) as CatalogItem[];

  function toggleItem(item: CatalogItem) {
    setSelectedIds((prev) => {
      if (prev.includes(item.id)) return prev.filter((id) => id !== item.id);
      // /ai/try-on allows at most one item per role (base_top/bottom/full_body/outerwear/footwear)
      const withoutSameRole = prev.filter((id) => catalogById[id]?.role !== item.role);
      return [...withoutSameRole, item.id];
    });
  }

  function tryOutfit(itemIds: string[]) {
    setSelectedIds(itemIds);
    tryOnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const byCategory = new Map<string, CatalogItem[]>();
  for (const item of catalog.items) {
    const bucket = byCategory.get(item.category) ?? [];
    bucket.push(item);
    byCategory.set(item.category, bucket);
  }

  return (
    <>
      <IconSprite />
      <Nav homeHref="/" />

      <Reveal className="wrap" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <span className="eyebrow">Live capability demo</span>
        <h1 className="display">
          {catalog.brand}&rsquo;s catalog,
          <br />
          styled and worn by AI.
        </h1>
        <p className="section-sub">
          {catalog.items.length > 0
            ? `This runs on ${catalog.items.length} real ${catalog.brand} SKUs and Veyra’s actual try-on and outfit-ranking engine — not a mockup. Pick a few pieces, upload a photo, and see it rendered live.`
            : `A live, working demo of Veyra’s try-on and outfit-ranking engine, built specifically for ${catalog.brand} — waiting on product photos to go live.`}
        </p>
      </Reveal>

      {catalog.items.length === 0 ? (
        <Reveal className="wrap empty-catalog">
          <h2>Catalog coming soon for {catalog.brand}</h2>
          <p>
            This link is live and working — it just doesn&rsquo;t have {catalog.brand}&rsquo;s
            product photos loaded yet. Drop them in and this page lights up the same way the
            working demos do.
          </p>
        </Reveal>
      ) : (
        <>
          {Array.from(byCategory.entries()).map(([category, items]) => (
            <section className="section" style={{ paddingTop: 0 }} key={category}>
              <Reveal className="wrap">
                <div className="section-head">
                  <h2 className="section-title" style={{ textTransform: "capitalize" }}>{category}</h2>
                </div>
                <ProductGrid items={items} selectedIds={selectedIds} onToggle={toggleItem} />
              </Reveal>
            </section>
          ))}

          <section className="section" style={{ paddingTop: 0 }}>
            <Reveal className="wrap">
              <div className="section-head">
                <h2 className="section-title">Let Veyra style it for you</h2>
                <p className="section-sub">Ranks combinations across the catalog above — no manual pairing.</p>
              </div>
              <OutfitPanel brandId={brandId} catalogById={catalogById} onTryOutfit={tryOutfit} />
            </Reveal>
          </section>

          <section className="section" id="try-on" ref={tryOnRef}>
            <Reveal className="wrap" style={{ maxWidth: 560 }}>
              <div className="section-head">
                <h2 className="section-title">Try it on</h2>
                <p className="section-sub">Upload a photo, then generate a live render wearing your selection.</p>
              </div>
              <TryOnPanel brandId={brandId} selectedItems={selectedItems} />
            </Reveal>
          </section>
        </>
      )}

      <div className="footer-note">
        Independent demo built by Veyra using a small sample of {catalog.brand}&rsquo;s public
        product images — not an official {catalog.brand} property.
      </div>
    </>
  );
}
