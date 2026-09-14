"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Catalog, CatalogItem, Role } from "@/lib/catalog";
import IconSprite from "@/components/IconSprite";
import BrandMark from "@/components/BrandMark";
import CatalogPicker from "@/components/demo/CatalogPicker";
import OutfitPanel from "@/components/demo/OutfitPanel";
import type { ShopperPhoto } from "@/components/demo/ShopperPhotoField";
import DemoSessionMarker from "@/components/DemoSessionMarker";
import MobileNav from "@/components/home/MobileNav";

import { Reveal, RevealGroup, RevealHero, RevealItem, RevealScale } from "@/components/Reveal";

export default function StoreDemo({ brandId, catalog }: { brandId: string; catalog: Catalog }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [guidedPhoto, setGuidedPhoto] = useState<ShopperPhoto | null>(null);
  const [specificPhoto, setSpecificPhoto] = useState<ShopperPhoto | null>(null);
  const [guidedResetKey, setGuidedResetKey] = useState(0);
  const [specificResetKey, setSpecificResetKey] = useState(0);
  const photoUrlsRef = useRef<string[]>([]);

  useEffect(() => () => {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

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

  function updatePhoto(target: "guided" | "specific", file: File | null) {
    const photosAreLinked = Boolean(guidedPhoto && guidedPhoto === specificPhoto);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      photoUrlsRef.current.push(previewUrl);
      const nextPhoto = { file, previewUrl };

      if ((!guidedPhoto && !specificPhoto) || photosAreLinked) {
        setGuidedPhoto(nextPhoto);
        setSpecificPhoto(nextPhoto);
        if (photosAreLinked) {
          if (target === "guided") setSpecificResetKey((key) => key + 1);
          else setGuidedResetKey((key) => key + 1);
        }
        return;
      }

      if (target === "guided") setGuidedPhoto(nextPhoto);
      else setSpecificPhoto(nextPhoto);
      return;
    }

    if (target === "guided") setGuidedPhoto(null);
    else setSpecificPhoto(null);
  }

  const photoIsShared = Boolean(guidedPhoto && guidedPhoto === specificPhoto);

  return (
    <div className="brand-demo">
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

            <RevealScale delay={0.15}>
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
            </RevealScale>
          </div>
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
                  <OutfitPanel
                    key={`guided-${guidedResetKey}`}
                    brandId={brandId}
                    catalogById={catalogById}
                    mustIncludeIds={[]}
                    onClearSelection={() => undefined}
                    photo={guidedPhoto}
                    photoShared={photoIsShared}
                    onPhotoChange={(file) => updatePhoto("guided", file)}
                  />
                </RevealScale>
              </div>
            </section>

            <section className="demo-specific-section" id="demo-catalog">
              <div className="demo-shell">
                <Reveal className="demo-catalog-intro">
                  <p className="demo-overline">Optional catalogue control</p>
                  <h2>Want to try specific pieces together?</h2>
                  <p>Select the exact products to apply, then create one try-on here—without a conversation or any unselected additions.</p>
                </Reveal>
                <RevealScale delay={0.1}>
                  <CatalogPicker
                    items={catalog.items}
                    selectedIds={selectedIds}
                    onToggle={toggleItem}
                    onClear={() => setSelectedIds([])}
                  />
                </RevealScale>
                <div className="demo-specific-builder" id="selected-piece-builder">
                  <RevealScale delay={0.15}>
                    <OutfitPanel
                      key={`specific-${specificResetKey}-${selectedIds.join("-")}`}
                      mode="specific"
                      brandId={brandId}
                      catalogById={catalogById}
                      mustIncludeIds={selectedIds}
                      onClearSelection={() => setSelectedIds([])}
                      photo={specificPhoto}
                      photoShared={photoIsShared}
                      onPhotoChange={(file) => updatePhoto("specific", file)}
                    />
                  </RevealScale>
                </div>
              </div>
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
          <a className="demo-button demo-button-lime" href="#selected-piece-builder">
            Build this look <ArrowRight size={17} aria-hidden="true" />
          </a>
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
