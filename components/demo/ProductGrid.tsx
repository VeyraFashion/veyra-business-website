"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CatalogItem } from "@/lib/catalog";

const ROLE_LABEL: Record<string, string> = {
  base_top: "Top",
  bottom: "Bottom",
  full_body: "Full body",
  outerwear: "Outerwear",
  footwear: "Footwear",
  accessory: "Accessory",
};

// Stagger List (subtle tier, ui-ux-pro-max: 0.02-0.04s/item) and Hover Micro-interaction
// (standard tier: y -4, scale 1.02, ~250ms power2.out) — sourced, not guessed.
const gridVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.035 } } };
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ProductGrid({
  items,
  selectedIds,
  onToggle,
}: {
  items: CatalogItem[];
  selectedIds: string[];
  onToggle: (item: CatalogItem) => void;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="grid"
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, margin: "-60px" }}
      variants={reduced ? undefined : gridVariants}
      suppressHydrationWarning
    >
      {items.map((item) => {
        const selected = selectedIds.includes(item.id);
        return (
          <motion.button
            key={item.id}
            type="button"
            className={`card product-card${selected ? " selected" : ""}`}
            onClick={() => onToggle(item)}
            style={{ textAlign: "left", cursor: "pointer" }}
            variants={reduced ? undefined : cardVariants}
            whileHover={reduced ? undefined : { y: -4, scale: 1.02, transition: { duration: 0.25, ease: "easeOut" } }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            suppressHydrationWarning
          >
            <div className="thumb">
              <Image src={item.image} alt={item.name} fill sizes="230px" />
              <span className="role-badge">{ROLE_LABEL[item.role] ?? item.role}</span>
              <motion.span
                className="select-check"
                animate={selected ? { scale: 1 } : { scale: reduced ? 1 : 0.85 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                ✓
              </motion.span>
            </div>
            <div className="body">
              <span className="name">{item.name}</span>
              <span className="price">₹{item.price_inr.toLocaleString("en-IN")}</span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
