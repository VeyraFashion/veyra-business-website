"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** Site-wide inertial smooth scroll (mounted once in app/layout.tsx, renders nothing).
 *  Added specifically to close the "scroll feel" gap noted against Elara (joinelara.shop),
 *  which runs Lenis under a Framer-built page — this is the same library, applied on top of our
 *  own hand-built sections rather than a page assembled by a no-code builder.
 *
 *  Disabled entirely under prefers-reduced-motion: reduce, same rule as every other Motion-based
 *  effect in this app (see lib/use-reduced-motion.ts) — inertial scroll is exactly the kind of
 *  vestibular-trigger effect that setting exists to suppress, so it gets skipped outright rather
 *  than a "toned down" version. Native browser scroll (already `scroll-behavior: smooth` in
 *  theme.css for anchor jumps) is what reduced-motion visitors get instead. */
export default function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenisDebug?: Lenis }).__lenisDebug = lenis;
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __lenisDebug?: Lenis }).__lenisDebug;
      }
    };
  }, [reduced]);

  return null;
}
