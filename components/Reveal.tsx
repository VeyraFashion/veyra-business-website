"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CSSProperties, ReactNode } from "react";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Default scroll-reveal wrapper: opacity 0 -> 1, translateY 20px -> 0px. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.55,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const mounted = useIsMounted();

  if (reduced || !mounted) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      suppressHydrationWarning
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: EASE_PREMIUM, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Immediate page-load entrance wrapper for Hero elements (does not wait for scroll). */
export function RevealHero({
  children,
  delay = 0,
  y = 20,
  duration = 0.6,
  scale = 1,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const mounted = useIsMounted();

  if (reduced || !mounted) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      suppressHydrationWarning
      initial={{ opacity: 0, y, scale: scale !== 1 ? scale : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration, ease: EASE_PREMIUM, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Enhanced scroll reveal for large visual cards, try-on demos, or interactive components:
 *  opacity 0 -> 1, translateY 30px -> 0, subtle scale 0.98 -> 1. */
export function RevealScale({
  children,
  delay = 0,
  y = 30,
  scale = 0.98,
  duration = 0.65,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const mounted = useIsMounted();

  if (reduced || !mounted) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      suppressHydrationWarning
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: EASE_PREMIUM, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container for a fixed set of sibling items (stat cards, step cards, persona cards). */
export function RevealGroup({
  children,
  className,
  style,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const mounted = useIsMounted();

  if (reduced || !mounted) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      suppressHydrationWarning
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  style,
  y = 20,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
  duration?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const mounted = useIsMounted();

  if (reduced || !mounted) return <div className={className} style={style}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={style}
      suppressHydrationWarning
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: EASE_PREMIUM },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

