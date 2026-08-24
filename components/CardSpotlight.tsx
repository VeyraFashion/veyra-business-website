"use client";

import { useEffect } from "react";

/** Global cursor-follow spotlight for every `.card` element (pricing tiers, team, and the demo
 *  page's product/outfit cards) — a soft coral-tinted glow that tracks the mouse via `--mx`/`--my`
 *  CSS custom properties (see `.card::before` in theme.css). One delegated, rAF-throttled
 *  `mousemove` listener sets the variables directly via the DOM, rather than per-card React state
 *  — keeps every card a plain CSS effect with zero re-renders on mouse move, and needs no changes
 *  to the individual card components themselves.
 *
 *  Purely a hover-state visual (same as .card's existing border/shadow hover and .btn's lift),
 *  not gated by prefers-reduced-motion — only continuous/automatic motion (scroll-reveal, the
 *  Lenis smooth scroll in SmoothScroll.tsx) is gated in this app. */
export default function CardSpotlight() {
  useEffect(() => {
    let raf = 0;
    let pending: { x: number; y: number; target: EventTarget | null } | null = null;

    function apply() {
      raf = 0;
      if (!pending) return;
      const el = (pending.target as HTMLElement | null)?.closest?.(".card") as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((pending.x - rect.left) / rect.width) * 100}%`);
        el.style.setProperty("--my", `${((pending.y - rect.top) / rect.height) * 100}%`);
      }
    }

    function onMove(e: MouseEvent) {
      pending = { x: e.clientX, y: e.clientY, target: e.target };
      if (!raf) raf = requestAnimationFrame(apply);
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
