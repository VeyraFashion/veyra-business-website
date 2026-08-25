"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** The Catalog Automation feature-visual — a real clip in place of the old icon-grid mock. Source
 *  file lives at `assets/static/This_is_how_the_camera_clicked.mp4` (raw, editable original,
 *  same convention as `assets/icons-raw/` and `assets/icon-images/`); the served copy is
 *  `public/catalog-automation.mp4` — re-copy from `assets/static/` if the source ever changes.
 *  Autoplaying/looping/muted like a GIF, but as an actual video (smaller, sharper than a GIF at
 *  this length). Under prefers-reduced-motion: reduce, it doesn't autoplay or loop — same policy
 *  as every other continuous/automatic effect in this app (Lenis, scroll-reveal): show the literal
 *  static state (here, just the first frame, paused) rather than a toned-down animation.
 *
 *  `object-fit: contain` (in theme.css) rather than `cover` — the source is 16:9 and
 *  `.feature-visual` is a squarer 4:3.2 box, so `cover` was cropping the sides of every frame.
 *  `contain` shows the whole shot, letterboxed on the container's own gradient background rather
 *  than a hard black bar (see `.catalog-video` for how that's kept from looking like a mistake).
 *
 *  The `autoplay` HTML attribute alone isn't reliable everywhere — confirmed empirically in a
 *  headless-Chrome check where the attribute was present but playback never started until
 *  `.play()` was called explicitly (autoplay policies vary by browser/context). Calling `.play()`
 *  imperatively on mount is the defensive fix; a rejected promise (a browser still blocking it)
 *  is caught and ignored, so the worst case is a static first frame, never a console error. */
export default function CatalogVideo() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // usePrefersReducedMotion starts false and corrects itself a tick later (see its own
    // comments) — if a real reduced-motion visitor's first render briefly plays the video before
    // that correction lands, removing the `loop`/`autoplay` *attributes` on the next render does
    // NOT stop already-running playback, so this must explicitly pause too, not just skip play().
    if (reduced) ref.current?.pause();
    else ref.current?.play().catch(() => {});
  }, [reduced]);

  return (
    <video
      ref={ref}
      className="catalog-video"
      src="/catalog-automation.mp4"
      autoPlay={!reduced}
      loop={!reduced}
      muted
      playsInline
      preload="auto"
      aria-label="A product photo being automatically turned into a catalog-ready studio shot"
    />
  );
}
