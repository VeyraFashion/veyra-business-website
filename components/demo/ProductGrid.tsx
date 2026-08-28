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
      className="demo-product-grid"
      initial={false}
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
            className={`demo-product-card${selected ? " selected" : ""}`}
            onClick={() => onToggle(item)}
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Select"} ${item.name}`}
            variants={reduced ? undefined : cardVariants}
            whileHover={reduced ? undefined : { y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            suppressHydrationWarning
          >
            <div className="demo-product-image">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 30vw"
              />
              <span className="demo-role-badge">{ROLE_LABEL[item.role] ?? item.role}</span>
              <motion.span
                className="demo-select-check"
                animate={selected ? { scale: 1 } : { scale: reduced ? 1 : 0.9 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                aria-hidden="true"
              >
                ✓
              </motion.span>
            </div>
            <div className="demo-product-body">
              <div>
                <span className="demo-product-name">{item.name}</span>
                <span className="demo-product-detail">{item.subcategory ?? item.category}</span>
              </div>
              <div className="demo-product-meta">
                <span className="demo-product-price">₹{item.price_inr.toLocaleString("en-IN")}</span>
                <span className="demo-product-action">{selected ? "Selected" : "Add to look"}</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
