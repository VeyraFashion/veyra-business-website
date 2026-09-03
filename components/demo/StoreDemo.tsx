"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Catalog, CatalogItem, Role } from "@/lib/catalog";
import IconSprite from "@/components/IconSprite";
import CatalogPicker from "@/components/demo/CatalogPicker";
import OutfitPanel from "@/components/demo/OutfitPanel";
import DemoSessionMarker from "@/components/DemoSessionMarker";
import MobileNav from "@/components/home/MobileNav";

export default function StoreDemo({ brandId, catalog }: { brandId: string; catalog: Catalog }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const stylistRef = useRef<HTMLElement>(null);

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

  function scrollToStylist() {
    stylistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="brand-demo">
      <IconSprite />
      <DemoSessionMarker brandId={brandId} brand={catalog.brand} />
      <a className="demo-skip-link" href="#demo-catalog">Skip to catalog</a>

      <header className="demo-nav">
        <div className="demo-shell demo-nav-inner">
          <div className="demo-nav-left">
            <Link className="demo-mark" href="/" aria-label="STYLD for Business home">
              <span className="demo-mark-symbol" aria-hidden="true">S</span>
              <span>STYLD</span>
            </Link>
            <nav className="demo-nav-links" aria-label="Homepage sections">
              <Link href="/#product">Product</Link>
              <Link href="/#how">How it works</Link>
              <Link href="/#evidence">Evidence</Link>
              <Link href="/#integration">API</Link>
            </nav>
          </div>
          <div className="demo-nav-label">
            <span>{catalog.brand}</span>
            <span>Private capability demo</span>
          </div>
          <div className="demo-nav-right">
            <MobileNav />
            <Link className="demo-button demo-button-dark demo-nav-action" href="/#pilot">
              Plan a pilot <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="demo-hero">
          <div className="demo-shell demo-hero-grid">
            <div className="demo-hero-copy">
              <p className="demo-overline">Live catalog intelligence</p>
              <h1>
                See {catalog.brand}&rsquo;s catalog <span>think in outfits.</span>
              </h1>
              <p className="demo-hero-lede">
                {catalog.items.length > 0
                  ? `Select from ${catalog.items.length} real products, ask STYLD to build complete looks, and place compatible pieces on a shopper’s photo.`
                  : `A private STYLD commerce environment prepared for ${catalog.brand}, ready to activate with product imagery.`}
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
                <li><span>01</span><div><strong>Add one photo</strong><p>A clear, front-facing, head-to-toe image.</p></div></li>
                <li><span>02</span><div><strong>Describe the moment</strong><p>Share the place, plan, and desired feeling.</p></div></li>
                <li><span>03</span><div><strong>Receive your try-ons</strong><p>Complete catalogue looks rendered directly on you.</p></div></li>
              </ol>
            </aside>
          </div>
        </section>

        {catalog.items.length === 0 ? (
          <div className="demo-shell demo-empty-catalog">
            <p className="demo-overline">Catalog activation</p>
            <h2>Catalog coming soon for {catalog.brand}</h2>
            <p>
              This private link is ready. Add {catalog.brand}&rsquo;s product photos to activate
              product selection, AI outfit ranking, and virtual try-on in one journey.
            </p>
          </div>
        ) : (
          <>
            <section className="demo-stylist-section" id="stylist" ref={stylistRef}>
              <div className="demo-shell">
                <div className="demo-section-head demo-section-head-inverse">
                  <div>
                    <p className="demo-overline">Personal styling room</p>
                    <h2>Complete looks. Already on you.</h2>
                  </div>
                  <p>One photo moves through quality checking, catalogue ranking, and automatic virtual try-ons.</p>
                </div>
                <OutfitPanel
                  brandId={brandId}
                  catalogById={catalogById}
                  mustIncludeIds={selectedIds}
                  onClearSelection={() => setSelectedIds([])}
                />
              </div>
            </section>

            <div id="demo-catalog">
              <div className="demo-catalog-intro demo-shell">
                <p className="demo-overline">Optional catalogue control</p>
                <h2>Want a specific piece in every look?</h2>
                <p>Select compatible products below, then send those choices to the styling room. STYLD will build complete outfits around them.</p>
              </div>
              <section className="demo-catalog-section">
                <div className="demo-shell">
                  <CatalogPicker
                    items={catalog.items}
                    selectedIds={selectedIds}
                    onToggle={toggleItem}
                  />
                </div>
              </section>
            </div>

          </>
        )}
      </main>

      {selectedItems.length > 0 && (
        <div className="demo-selection-dock" role="status" aria-live="polite">
          <div>
            <span>{selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} selected</span>
            <strong>{selectedItems.map((item) => item.name).join(" + ")}</strong>
          </div>
          <button className="demo-button demo-button-lime" type="button" onClick={scrollToStylist}>
            Build looks with these <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <footer className="demo-footer">
        <div className="demo-shell">
          <span>STYLD × {catalog.brand}</span>
          <p>Independent capability demo using public product imagery. Brand names and product assets remain the property of their owners.</p>
        </div>
      </footer>
    </div>
  );
}
