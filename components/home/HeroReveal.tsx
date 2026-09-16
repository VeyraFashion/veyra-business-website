"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const MIN = 4;
const MAX = 96;
const MID = (MIN + MAX) / 2;
const AMPLITUDE = (MAX - MIN) / 2;

/** One full there-and-back cycle. A quarter of this is a single edge-to-edge pass, so the
 *  sweep reads as a demonstration rather than a fidget. */
const CYCLE_MS = 11000;

/** Before/after comparison: your flat catalogue shot vs. the same garment on a shopper.
 *
 *  The "before" layer is full-frame and revealed with `clip-path` rather than by resizing a
 *  container, so the garment never rescales as the handle moves — the two states stay
 *  pixel-aligned, which is the whole point of the comparison.
 *
 *  A full-bleed range input sits invisibly over the frame as the control: it gives keyboard
 *  operation, an accessible name and touch support for free, which a custom pointer handler
 *  would each have to reimplement.
 *
 *  It sweeps on its own until someone touches it, which is what makes the comparison legible
 *  to a visitor who never thinks to drag anything. The first manual input hands control over
 *  for good — resuming the animation under someone's cursor would fight them. */
export default function HeroReveal() {
  const [reveal, setReveal] = useState(50);
  const [autoplay, setAutoplay] = useState(true);
  const figureRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!autoplay || reduced) return;
    const node = figureRef.current;
    if (!node) return;

    let frame = 0;
    let elapsed = 0;
    let previous: number | null = null;
    let visible = true;

    // Offscreen time is not accumulated, so scrolling back finds the sweep where it was
    // rather than jumped forward by however long the hero was out of view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previous = null;
      },
      { threshold: 0.1 },
    );
    observer.observe(node);

    const tick = (now: number) => {
      if (visible) {
        if (previous !== null) elapsed += now - previous;
        previous = now;
        // Sine rather than a linear bounce: it eases at both edges, so the turnarounds
        // don't snap. Starts at MID travelling right.
        setReveal(MID + AMPLITUDE * Math.sin((2 * Math.PI * elapsed) / CYCLE_MS));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [autoplay, reduced]);

  /** Any real input — drag, tap or arrow key — ends the animation permanently. */
  const takeOver = () => setAutoplay(false);

  return (
    <figure className="reveal" ref={figureRef}>
      <div className="reveal-frame">
        {/* AFTER (base layer): the try-on result. */}
        <div className="reveal-after">
          <Image
            src="/brand-assets/static/result/brown_tshirt_res.png"
            alt="Brown t-shirt virtual try-on result on shopper"
            fill
            priority
            loading="eager"
            sizes="(max-width: 760px) 92vw, (max-width: 1020px) 66vw, 452px"
            style={{ objectFit: "contain", background: "#f0ede6" }}
          />
        </div>

        {/* BEFORE: clipped from the left edge to the handle. */}
        <div className="reveal-before" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <Image
            src="/brand-assets/static/sample/brown_tshirt.png"
            alt="Brown t-shirt, flat catalogue shot"
            fill
            priority
            sizes="(max-width: 760px) 92vw, (max-width: 1020px) 66vw, 452px"
            style={{ objectFit: "contain", padding: "10%", background: "#f0ede6" }}
          />
        </div>

        <div className="reveal-divider" aria-hidden="true" style={{ left: `calc(${reveal}% - 1px)` }} />
        <div className="reveal-tag reveal-tag-left">Your catalogue shot</div>
        <div className="reveal-tag reveal-tag-right">On the shopper</div>

        <input
          className="reveal-input"
          type="range"
          min={MIN}
          max={MAX}
          step={0.5}
          value={reveal}
          onChange={(event) => {
            takeOver();
            setReveal(Number(event.target.value));
          }}
          onPointerDown={takeOver}
          onKeyDown={takeOver}
          aria-label="Drag to compare the catalogue shot with the try-on result"
        />

        <div className="reveal-handle" aria-hidden="true" style={{ left: `calc(${reveal}% - 18px)` }}>
          <span>↔</span>
        </div>
      </div>
    </figure>
  );
}
