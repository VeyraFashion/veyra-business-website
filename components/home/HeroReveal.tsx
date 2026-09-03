"use client";

import { useState } from "react";
import Image from "next/image";
import ContentSlot from "@/components/home/ContentSlot";

/** Before/after comparison: your flat catalogue shot vs. the same garment on a shopper.
 *
 *  The "before" layer is full-frame and revealed with `clip-path` rather than by resizing a
 *  container, so the garment never rescales as the handle moves — the two states stay
 *  pixel-aligned, which is the whole point of the comparison.
 *
 *  A full-bleed range input sits invisibly over the frame as the control: it gives keyboard
 *  operation, an accessible name and touch support for free, which a custom pointer handler
 *  would each have to reimplement. */
export default function HeroReveal() {
  const [reveal, setReveal] = useState(50);

  return (
    <figure className="reveal">
      <div className="reveal-frame">
        {/* AFTER (base layer): the try-on result. */}
        <div className="reveal-after">
          <ContentSlot label="Try-on result — the same garment on a real person" />
        </div>

        {/* BEFORE: clipped from the left edge to the handle. */}
        <div className="reveal-before" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <Image
            src="/field-jacket.png"
            alt="Olive field jacket, flat catalogue shot"
            fill
            priority
            sizes="(max-width: 1020px) 92vw, 640px"
            style={{ objectFit: "contain", padding: "8%" }}
          />
        </div>

        <div className="reveal-divider" aria-hidden="true" style={{ left: `calc(${reveal}% - 1px)` }} />
        <div className="reveal-tag reveal-tag-left">Your catalogue shot</div>
        <div className="reveal-tag reveal-tag-right">On the shopper</div>

        <input
          className="reveal-input"
          type="range"
          min={4}
          max={96}
          step={0.5}
          value={reveal}
          onChange={(event) => setReveal(Number(event.target.value))}
          aria-label="Drag to compare the catalogue shot with the try-on result"
        />

        <div className="reveal-handle" aria-hidden="true" style={{ left: `calc(${reveal}% - 18px)` }}>
          <span>↔</span>
        </div>
      </div>
      <figcaption className="reveal-caption">
        Drag to compare. <strong>[Content required]</strong> — drop a real try-on still into
        the right-hand panel. Use a brand-anonymised crop or your own shot garments.
      </figcaption>
    </figure>
  );
}
