"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Catalog, CatalogItem, Role } from "@/lib/catalog";
import { Reveal } from "@/components/Reveal";
import IconSprite from "@/components/IconSprite";
import ProductGrid from "@/components/demo/ProductGrid";
import TryOnPanel from "@/components/demo/TryOnPanel";
import OutfitPanel from "@/components/demo/OutfitPanel";

export default function StoreDemo({ brandId, catalog }: { brandId: string; catalog: Catalog }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const tryOnRef = useRef<HTMLDivElement>(null);

  const catalogById = useMemo(
    () => Object.fromEntries(catalog.items.map((item) => [item.id, item])),
    [catalog.items],
  );

  const selectedItems = selectedIds.map((id) => catalogById[id]).filter(Boolean) as CatalogItem[];

  function toggleItem(item: CatalogItem) {
    setSelectedIds((previousIds) => {
      if (previousIds.includes(item.id)) return previousIds.filter((id) => id !== item.id);

      const conflictingRoles = new Set<Role>([item.role]);
      if (item.role === "full_body") {
        conflictingRoles.add("base_top");
        conflictingRoles.add("bottom");
      }
      if (item.role === "base_top" || item.role === "bottom") conflictingRoles.add("full_body");

      const compatibleSelection = previousIds.filter(
        (id) => !conflictingRoles.has(catalogById[id]?.role),
      );
      return [...compatibleSelection, item.id];
    });
  }

  function scrollToTryOn() {
    tryOnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function tryOutfit(itemIds: string[]) {
    setSelectedIds(itemIds);
    scrollToTryOn();
  }

  const byCategory = new Map<string, CatalogItem[]>();
  for (const item of catalog.items) {
    const bucket = byCategory.get(item.category) ?? [];
    bucket.push(item);
    byCategory.set(item.category, bucket);
  }

  return (
    <div className="brand-demo">
      <IconSprite />
      <a className="demo-skip-link" href="#demo-catalog">Skip to catalog</a>

      <header className="demo-nav">
        <div className="demo-shell demo-nav-inner">
          <Link className="demo-mark" href="/" aria-label="Veyra for Business home">
            <span className="demo-mark-symbol" aria-hidden="true">V</span>
            <span>Veyra</span>
            <span className="demo-mark-context">for business</span>
          </Link>
          <div className="demo-nav-label">
            <span>{catalog.brand}</span>
            <span>Private capability demo</span>
          </div>
          <Link className="demo-button demo-button-dark demo-nav-action" href="/#pilot">
            Plan a pilot <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="demo-hero">
          <Reveal className="demo-shell demo-hero-grid">
            <div className="demo-hero-copy">
              <p className="demo-overline">Live catalog intelligence</p>
              <h1>
                See {catalog.brand}&rsquo;s catalog <span>think in outfits.</span>
              </h1>
              <p className="demo-hero-lede">
                {catalog.items.length > 0
                  ? `Select from ${catalog.items.length} real products, ask Veyra to build complete looks, and place compatible pieces on a shopper’s photo.`
                  : `A private Veyra commerce environment prepared for ${catalog.brand}, ready to activate with product imagery.`}
              </p>
              <div className="demo-hero-facts" aria-label="Demo capabilities">
                <span><Check size={16} aria-hidden="true" /> Real product assets</span>
                <span><Check size={16} aria-hidden="true" /> Live AI endpoints</span>
                <span><Check size={16} aria-hidden="true" /> Compatible layering</span>
              </div>
            </div>

            <aside className="demo-flow-card" aria-label="How to use this demo">
              <div className="demo-flow-head">
                <span>Three steps</span>
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <ol>
                <li><span>01</span><div><strong>Build a selection</strong><p>Choose one piece per compatible garment role.</p></div></li>
                <li><span>02</span><div><strong>Ask the stylist</strong><p>Rank complete looks for a real occasion.</p></div></li>
                <li><span>03</span><div><strong>See it worn</strong><p>Upload a front-facing photo and generate the try-on.</p></div></li>
              </ol>
            </aside>
          </Reveal>
        </section>

        {catalog.items.length === 0 ? (
          <Reveal className="demo-shell demo-empty-catalog">
            <p className="demo-overline">Catalog activation</p>
            <h2>Catalog coming soon for {catalog.brand}</h2>
            <p>
              This private link is ready. Add {catalog.brand}&rsquo;s product photos to activate
              product selection, AI outfit ranking, and virtual try-on in one journey.
            </p>
          </Reveal>
        ) : (
          <>
            <div id="demo-catalog">
              {Array.from(byCategory.entries()).map(([category, items], index) => (
                <section className="demo-catalog-section" key={category}>
                  <Reveal className="demo-shell">
                    <div className="demo-section-head">
                      <div>
                        <p className="demo-overline">Catalog / {String(index + 1).padStart(2, "0")}</p>
                        <h2>{category}</h2>
                      </div>
                      <span className="demo-item-count">
                        {items.length} {items.length === 1 ? "piece" : "pieces"}
                      </span>
                    </div>
                    <ProductGrid items={items} selectedIds={selectedIds} onToggle={toggleItem} />
                  </Reveal>
                </section>
              ))}
            </div>

            <section className="demo-stylist-section" id="stylist">
              <Reveal className="demo-shell">
                <div className="demo-section-head demo-section-head-inverse">
                  <div>
                    <p className="demo-overline">AI outfit ranking</p>
                    <h2>Turn products into a considered look.</h2>
                  </div>
                  <p>Veyra evaluates garment roles, color relationships, weather, occasion, and catalog coverage.</p>
                </div>
                <OutfitPanel brandId={brandId} catalogById={catalogById} onTryOutfit={tryOutfit} />
              </Reveal>
            </section>

            <section className="demo-tryon-section" id="try-on" ref={tryOnRef}>
              <Reveal className="demo-shell">
                <div className="demo-section-head">
                  <div>
                    <p className="demo-overline">Virtual try-on</p>
                    <h2>Move from selection to self.</h2>
                  </div>
                  <p>Upload one clear photo and render the compatible products currently in your selection.</p>
                </div>
                <TryOnPanel brandId={brandId} selectedItems={selectedItems} />
              </Reveal>
            </section>
          </>
        )}
      </main>

      {selectedItems.length > 0 && (
        <div className="demo-selection-dock" role="status" aria-live="polite">
          <div>
            <span>{selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} selected</span>
            <strong>{selectedItems.map((item) => item.name).join(" + ")}</strong>
          </div>
          <button className="demo-button demo-button-lime" type="button" onClick={scrollToTryOn}>
            Continue to try-on <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <footer className="demo-footer">
        <div className="demo-shell">
          <span>Veyra × {catalog.brand}</span>
          <p>Independent capability demo using public product imagery. Brand names and product assets remain the property of their owners.</p>
        </div>
      </footer>
    </div>
  );
}
