"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CSSProperties, ReactNode } from "react";

/** Scroll-reveal wrapper — sourced from the ui-ux-pro-max skill's "Scroll Reveal" guidance
 *  (subtle tier: 300-400ms, 8-16px y-offset, ease-out, reveal once). Renders children
 *  statically with no motion at all when the visitor has prefers-reduced-motion set, per the
 *  skill's Accessibility > Motion Sensitivity guidance — never a stripped-down animation, the
 *  literal final state immediately. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      // whileInView renders its "hidden" inline style during SSR (correctly - there's no
      // viewport to check yet) but Motion applies that style itself post-mount rather than
      // through React's own render, so React's hydration diff flags a false-positive mismatch
      // on the very next render. Motion's own docs note this is expected/harmless for
      // whileInView + SSR; suppressing here silences the noise, it doesn't change behavior.
      suppressHydrationWarning
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container for a fixed set of sibling items (stat cards, step cards, persona cards) —
 *  each RevealItem child fades up in sequence rather than all at once. 0.03s per item per the
 *  skill's Stagger List guidance for short lists. */
export function RevealGroup({
  children,
  className,
  style,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      // whileInView renders its "hidden" inline style during SSR (correctly - there's no
      // viewport to check yet) but Motion applies that style itself post-mount rather than
      // through React's own render, so React's hydration diff flags a false-positive mismatch
      // on the very next render. Motion's own docs note this is expected/harmless for
      // whileInView + SSR; suppressing here silences the noise, it doesn't change behavior.
      suppressHydrationWarning
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  style,
  y = 14,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      // whileInView renders its "hidden" inline style during SSR (correctly - there's no
      // viewport to check yet) but Motion applies that style itself post-mount rather than
      // through React's own render, so React's hydration diff flags a false-positive mismatch
      // on the very next render. Motion's own docs note this is expected/harmless for
      // whileInView + SSR; suppressing here silences the noise, it doesn't change behavior.
      suppressHydrationWarning
      variants={{ hidden: { opacity: 0, y }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
    >
      {children}
    </motion.div>
  );
}
