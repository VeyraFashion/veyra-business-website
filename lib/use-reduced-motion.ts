"use client";

import { useSyncExternalStore } from "react";

/** Reads prefers-reduced-motion directly, per-component, via React's own state rather than a
 *  shared module-level singleton.
 *
 *  Framer Motion ships a useReducedMotion() hook, but it caches the media-query result in a
 *  module-level object (motion-dom's `state.mjs`) rather than React state. When Next.js's
 *  production build splits that module into more than one webpack chunk - which it does here -
 *  each chunk gets its own independent copy of that object, so the copy that sets the value
 *  (whichever chunk's useReducedMotion() call happens to run first) and the copy a given
 *  component reads from can be different objects entirely. Verified concretely: with Motion's
 *  hook, every Reveal-wrapped element stayed permanently invisible under prefers-reduced-motion
 *  in the production build (0/6 took the reduced-motion branch) despite `matchMedia` correctly
 *  reporting `true`. This hook has no shared state to desync - each component reads the media
 *  query itself. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
