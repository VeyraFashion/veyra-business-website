"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Catalog, CatalogItem, Role } from "@/lib/catalog";
import IconSprite from "@/components/IconSprite";
import BrandMark from "@/components/BrandMark";
import DemoSessionMarker from "@/components/DemoSessionMarker";
import MobileNav from "@/components/home/MobileNav";
import CatalogPicker from "@/components/demo/CatalogPicker";
import StylingRoom from "@/components/demo2/StylingRoom";
import type { ShopperPhoto } from "@/components/demo/ShopperPhotoField";
import { Reveal, RevealScale } from "@/components/Reveal";

/** Brand demo: the catalogue first, the try-on studio underneath it.
 *
 *  Same shape and furniture as the original demo page, with the order inverted — a shopper
 *  picks clothes and then asks to see them, not the other way round. One panel instead of
 *  two, because the old page's guided and specific panels each carried their own photo
 *  upload and the reconciliation between them was invisible to anyone using it. */
export default function BrandDemo2({ brandId, catalog }: { brandId: string; catalog: Catalog }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [photo, setPhoto] = useState<ShopperPhoto | null>(null);
  const [cueSubmit, setCueSubmit] = useState(0);
  const photoUrlsRef = useRef<string[]>([]);

  useEffect(() => () => {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function setPhotoFile(file: File | null) {
    if (!file) {
      setPhoto(null);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    photoUrlsRef.current.push(previewUrl);
    setPhoto({ file, previewUrl });
  }

  const catalogById = useMemo(
    () => Object.fromEntries(catalog.items.map((item) => [item.id, item])),
    [catalog.items],
  );

  const selectedItems = selectedIds
    .map((id) => catalogById[id])
    .filter(Boolean) as CatalogItem[];

  /** One garment per wear role. A full-body piece clears the separates and vice versa —
   *  the render endpoint rejects those combinations anyway, so catching it here saves the
   *  shopper a failed job. */
  function toggleItem(item: CatalogItem) {
    setSelectedIds((previousIds) => {
      if (previousIds.includes(item.id)) return previousIds.filter((id) => id !== item.id);

      const conflictingRoles = new Set<Role>([item.role]);
      if (item.role === "full_body") {
        conflictingRoles.add("base_top");
        conflictingRoles.add("bottom");
      }
      if (item.role === "base_top" || item.role === "bottom") conflictingRoles.add("full_body");

      const compatible = previousIds.filter((id) => !conflictingRoles.has(catalogById[id]?.role));
      return [...compatible, item.id].slice(-4);
    });
  }

  const hasCatalog = catalog.items.length > 0;

  return (
    <div className="brand-demo brand-demo2">
      <IconSprite />
      <DemoSessionMarker brandId={brandId} brand={catalog.brand} />
      <a className="demo-skip-link" href="#demo-catalog">Skip to catalog</a>

      <header className="demo-nav">
        <div className="demo-shell demo-nav-inner">
          <div className="demo-nav-left">
            <Link className="demo-mark" href="/" aria-label="STYLD for Business home">
              <span className="demo-mark-symbol" aria-hidden="true"><BrandMark /></span>
              <span>STYLD</span>
            </Link>
            <nav className="demo-nav-links" aria-label="Homepage sections">
              <Link href="/#demo">See it work</Link>
              <Link href="/#difference">Why it&rsquo;s different</Link>
              <Link href="/#evidence">Results</Link>
              <Link href="/#live">Go live</Link>
            </nav>
          </div>
          <div className="demo-nav-label">
            <span>{catalog.brand}</span>
            <span>Private capability demo</span>
          </div>
          <div className="demo-nav-right">
            <MobileNav />
            <Link className="demo-button demo-button-dark demo-nav-action" href="/#book">
              Book a walkthrough <ArrowRight size={17} aria-hidden="true" />
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
                {hasCatalog
                  ? `Pick from ${catalog.items.length} real products, see them on a person, then change your mind out loud.`
                  : `A private STYLD commerce environment prepared for ${catalog.brand}, ready to activate with product imagery.`}
              </p>
              <div className="demo-hero-facts" aria-label="Demo capabilities">
                <span><Check size={16} aria-hidden="true" /> Real product assets</span>
                <span><Check size={16} aria-hidden="true" /> Live AI endpoints</span>
                <span><Check size={16} aria-hidden="true" /> Compatible layering</span>
              </div>
            </div>

            <RevealScale delay={0.15}>
              <aside className="demo-flow-card" aria-label="How to use this demo">
                <div className="demo-flow-head">
                  <span>Three steps</span>
                  <Sparkles size={22} aria-hidden="true" />
                </div>
                <ol>
                  <li><span>01</span><div><strong>Pick the pieces</strong><p>Up to four, one per wear role.</p></div></li>
                  <li><span>02</span><div><strong>Add a photo</strong><p>Or start from one of our models.</p></div></li>
                  <li><span>03</span><div><strong>Refine it out loud</strong><p>Change the fit, complete the look, see similar.</p></div></li>
                </ol>
              </aside>
            </RevealScale>
          </div>
        </section>

        {!hasCatalog ? (
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
            <section className="demo-specific-section" id="demo-catalog">
              <div className="demo-shell">
                <Reveal className="demo-catalog-intro">
                  <p className="demo-overline">Step one</p>
                  <h2>Choose the pieces.</h2>
                  <p>
                    Search or filter {catalog.brand}&rsquo;s catalogue and pick up to four
                    compatible pieces. The try-on studio is right below.
                  </p>
                </Reveal>
                <RevealScale delay={0.1}>
                  <CatalogPicker
                    items={catalog.items}
                    selectedIds={selectedIds}
                    onToggle={toggleItem}
                    onClear={() => setSelectedIds([])}
                  />
                </RevealScale>
              </div>
            </section>

            <section className="demo-stylist-section" id="stylist">
              <div className="demo-shell">
                <Reveal className="demo-section-head demo-section-head-inverse">
                  <div>
                    <p className="demo-overline">Personal styling room</p>
                    <h2>Complete looks. Already on you.</h2>
                  </div>
                  <p>One photo moves through quality checking, catalogue ranking, and automatic virtual try-ons.</p>
                </Reveal>
                <RevealScale delay={0.1}>
                  <StylingRoom
                    brandId={brandId}
                    brand={catalog.brand}
                    cueSubmit={cueSubmit}
                    catalog={catalog.items}
                    catalogById={catalogById}
                    mustIncludeIds={selectedIds}
                    selected={selectedItems}
                    onClearSelection={() => setSelectedIds([])}
                    onAdd={toggleItem}
                    photo={photo}
                    photoShared={false}
                    onPhotoChange={setPhotoFile}
                  />
                </RevealScale>
              </div>
            </section>
          </>
        )}
      </main>

      {selectedItems.length > 0 && (
        <div className="demo-selection-dock" role="status" aria-live="polite">
          <div>
            <span>{selectedItems.length} {selectedItems.length === 1 ? "piece" : "pieces"} selected</span>
            <strong>{selectedItems.map((item) => item.name).join(" + ")}</strong>
          </div>
          {/* Was an anchor to #try-on, an id that does not exist on this page, so it went
              nowhere. The room decides where "here" is and cues the button to press. */}
          <button
            type="button"
            className="demo-button demo-button-lime"
            onClick={() => setCueSubmit((count) => count + 1)}
          >
            Try these on <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <Reveal className="demo-footer" y={10}>
        <div className="demo-shell">
          <span>STYLD × {catalog.brand}</span>
          <p>Independent capability demo using public product imagery. Brand names and product assets remain the property of their owners.</p>
        </div>
      </Reveal>
    </div>
  );
}
